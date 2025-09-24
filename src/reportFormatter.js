// Report formatting for Slack messages
// This file exports functions to format charity data into readable reports

/**
 * Format charity data into a Slack-friendly report
 * @param {Object} charityData - Charity information from OpenAI web search
 * @param {string} originalQuery - Original charity name that was searched
 * @returns {string} Formatted report text for Slack
 */
function formatCharityReport(charityData, originalQuery) {
  if (!charityData) {
    return formatErrorMessage(originalQuery, 'not_found');
  }

  const {
    name,
    id,
    activities,
    areas,
    website,
    founded_year,
    summary,
    totalFound,
    citations
  } = charityData;

  let report = `*${name}*\n\n`;

  // Summary section
  if (summary && summary !== 'Information not available') {
    report += `📝 ${summary}\n\n`;
  }

  // Charity ID section (if available)
  if (id && !id.startsWith('search_')) {
    report += `🆔 *Registration ID:* ${id}\n\n`;
  }

  // Founded year section
  if (founded_year && founded_year !== 'Not available') {
    report += `🗓️ *Founded:* ${founded_year}\n\n`;
  }

  // Website section
  if (website && website !== 'Not available') {
    report += `🌐 *Website:* <${website}|${extractDomainFromUrl(website)}>\n\n`;
  }

  // Activities section
  if (activities && activities !== 'Information not available') {
    report += `*What they do:* ${activities}\n\n`;
  }

  // Geographic areas
  if (areas && areas.length > 0) {
    const areasList = areas.slice(0, 5).join(', '); // Limit to 5 areas
    const moreAreas = areas.length > 5 ? ` (+${areas.length - 5} more)` : '';
    report += `📍 *Areas served:* ${areasList}${moreAreas}\n\n`;
  }

  // Citations section
  if (citations && citations.length > 0) {
    report += `🔗 *Sources:*\n`;
    citations.slice(0, 3).forEach((citation, index) => { // Limit to 3 citations
      report += `• <${citation.url}|${citation.title}>\n`;
    });
    if (citations.length > 3) {
      report += `  _... and ${citations.length - 3} more sources_\n`;
    }
    report += '\n';
  }

  // Additional results note
  if (totalFound > 1) {
    report += `_Showing most relevant result_\n`;
  } else {
    report += `_Information gathered from web search_\n`;
  }

  // Keep under Slack's message limit
  if (report.length > 39000) {
    report = report.substring(0, 39000) + '... _[truncated due to Slack message limit]_';
  }

  return report;
}

/**
 * Format error message when charity lookup fails
 * @param {string} charityName - Name that was searched
 * @param {string} errorType - Type of error ('not_found', 'api_error', etc.)
 * @returns {string} User-friendly error message
 */
function formatErrorMessage(charityName, errorType = 'api_error') {
  switch (errorType) {
    case 'not_found':
      return `❓ I couldn't find reliable information about "${charityName}" from available sources.\n\n` +
             `💡 *Try:*\n` +
             `• Check the spelling\n` +
             `• Use the official charity name\n` +
             `• Try searching for key words from the charity name`;

    case 'extraction_failed':
      return `🤔 I couldn't identify a charity name in that message.\n\n` +
             `💡 *Tip:* Make sure to mention a specific charity or organization name in your message.`;

    case 'api_error':
      return `⚠️ Sorry, I'm having trouble searching for charity information right now.\n\n` +
             `🔄 Please try again in a moment.`;

    default:
      return `❌ Something went wrong while searching for "${charityName}".\n\n` +
             `🔄 Please try again later.`;
  }
}

/**
 * Extract domain name from URL for display
 * @param {string} url - The URL to extract domain from
 * @returns {string} Clean domain name
 */
function extractDomainFromUrl(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace('www.', '');
  } catch (error) {
    return 'Visit Website';
  }
}

module.exports = { formatCharityReport, formatErrorMessage };
