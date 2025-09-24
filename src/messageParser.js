// AI-powered message parsing to extract charity names
// This file uses OpenAI to intelligently extract charity names from Slack messages

const OpenAI = require('openai');
const { getConfig } = require('./config');

/**
 * Extract charity name from Slack message text using OpenAI
 * @param {string} messageText - The text content of a Slack message
 * @returns {Promise<string|null>} Extracted charity name or null if none found
 */
async function extractCharityName(messageText) {
  try {
    const config = getConfig();
    const openai = new OpenAI({ apiKey: config.openai.apiKey });
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system", 
          content: "You extract UK charity names from text. Return only the charity name or 'NONE' if no charity is mentioned. Focus on registered charities, organizations, and nonprofits."
        },
        {
          role: "user", 
          content: `Extract the charity or organization name from this message. Return only the name, or "NONE" if no charity is mentioned:

Message: "${messageText}"

Charity name:`
        }
      ],
      max_tokens: 50,
      temperature: 0
    });

    const result = completion.choices[0]?.message?.content?.trim();
    return result === 'NONE' ? null : result;
  } catch (error) {
    console.error('Error extracting charity name:', error);
    throw new Error('Failed to extract charity name from message');
  }
}

module.exports = { extractCharityName };
