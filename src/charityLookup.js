// OpenAI Web Search charity lookup implementation
// This file exports a function that takes a charity name and returns charity data

// Warning - AI generated code created last minute as I realised the CharityBase GraphQL API is down

const OpenAI = require('openai');
const { getConfig } = require('./config');

/**
 * Look up charity information using OpenAI's web search
 * @param {string} charityName - Name of the charity to search for
 * @returns {Promise<Object|null>} Charity data or null if not found
 */
async function lookupCharity(charityName) {
  try {
    const config = getConfig();
    
    const openai = new OpenAI({
      apiKey: config.openai.apiKey
    });

    // Define JSON schema for structured charity information
    const charitySchema = {
      type: "object",
      properties: {
        official_name: {
          type: "string",
          description: "The official registered name of the charity"
        },
        registration_number: {
          type: "string",
          description: "The charity registration number or ID (use 'Not available' if unknown)"
        },
        activities: {
          type: "string",
          description: "Description of the charity's main activities, purposes, and work"
        },
        areas_of_operation: {
          type: "array",
          items: { type: "string" },
          description: "Geographical areas or regions where the charity operates"
        },
        website: {
          type: "string",
          description: "Official website URL (use 'Not available' if unknown)"
        },
        founded_year: {
          type: "string",
          description: "Year the charity was founded (use 'Not available' if unknown)"
        },
        summary: {
          type: "string",
          description: "Brief summary of the charity and their impact"
        }
      },
      required: ["official_name", "registration_number", "activities", "areas_of_operation", "website", "founded_year", "summary"],
      additionalProperties: false
    };

    // Create a comprehensive search query for UK charity information
    const searchPrompt = `Find detailed information about the UK charity "${charityName}". Search official sources and provide accurate, up-to-date information about the charity's official name, registration details, activities, geographical focus, and mission.`;

    console.log(`Looking up charity: ${charityName}`);
    
    const response = await openai.responses.create({
      model: "gpt-5",
      reasoning: { effort: "low" },
      text: {
        format: {
          type: "json_schema",
          name: "charity_information",
          description: "Structured information about a UK charity",
          schema: charitySchema
        }
      },
      tools: [
        {
          type: "web_search",
          filters: {
            allowed_domains: [
              "charitycommission.gov.uk",
              "gov.uk", 
              "charitybase.uk",
              "charitynavigator.org",
              "justgiving.com",
              "cafonline.org"
            ]
          }
        }
      ],
      tool_choice: "auto",
      include: ["web_search_call.action.sources"],
      input: searchPrompt
    });

    if (!response || !response.output_text) {
      console.log('No response content received from OpenAI');
      return null;
    }

    // Parse the structured JSON response
    let charityInfo;
    try {
      charityInfo = JSON.parse(response.output_text);
    } catch (error) {
      console.error('Failed to parse JSON response:', error);
      console.log('Raw response:', response.output_text);
      return null;
    }

    // Extract sources/citations from the Responses API
    const citationUrls = [];
    
    // Check if sources are available in the response
    if (response.web_search_call && response.web_search_call.action && response.web_search_call.action.sources) {
      const sources = response.web_search_call.action.sources;
      citationUrls.push(...sources.map(source => ({
        url: source.url || source,
        title: source.title || extractDomainName(source.url || source),
        text_snippet: source.snippet || ''
      })));
    }

    // Return structured data following the original interface
    return {
      id: charityInfo.registration_number !== 'Not available' ? charityInfo.registration_number : generateFallbackId(charityInfo.official_name || charityName),
      name: charityInfo.official_name || charityName,
      activities: charityInfo.activities || 'Information not available',
      areas: charityInfo.areas_of_operation || [],
      website: charityInfo.website !== 'Not available' ? charityInfo.website : null,
      founded_year: charityInfo.founded_year !== 'Not available' ? charityInfo.founded_year : null,
      summary: charityInfo.summary,
      totalFound: 1, // We focus on finding the best single result
      citations: citationUrls,
      structuredData: charityInfo // Include the full structured response
    };

  } catch (error) {
    console.error('Error looking up charity with OpenAI:', error);
    throw new Error(`Failed to lookup charity "${charityName}": ${error.message}`);
  }
}


/**
 * Generate a fallback ID if none found in official sources
 * @param {string} charityName - The charity name
 * @returns {string} Fallback ID
 */
function generateFallbackId(charityName) {
  // Create a simple hash-like ID from the charity name
  return 'search_' + charityName.toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .substring(0, 12);
}

/**
 * Extract domain name from URL for citation titles
 * @param {string} url - The URL to extract domain from
 * @returns {string} Domain name
 */
function extractDomainName(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace('www.', '');
  } catch (error) {
    return url.substring(0, 50) + '...';
  }
}


module.exports = { lookupCharity };
