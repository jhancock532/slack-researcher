// This file handles incoming Slack events

const crypto = require('crypto');
const { WebClient } = require('@slack/web-api');
const { getConfig } = require('../src/config');
const { extractCharityName } = require('../src/messageParser');
const { lookupCharity } = require('../src/charityLookup');
const { formatCharityReport, formatErrorMessage } = require('../src/reportFormatter');

/**
 * Main handler for Slack webhook events
 * Deployed as Vercel serverless function at /api/slack-events
 */
module.exports = async (req, res) => {
  try {
    const config = getConfig();
    
    // Development mode - bypass Slack integration
    if (process.env.NODE_ENV === 'development') {
      return await handleDevModeRequest(req, res);
    }

    const slack = new WebClient(config.slack.botToken);

    // Handle Slack URL verification challenge
    if (req.body && req.body.challenge) {
      return res.status(200).json({ challenge: req.body.challenge });
    }

    // Get raw body for signature verification
    const body = JSON.stringify(req.body);
    const signature = req.headers['x-slack-signature'];
    const timestamp = req.headers['x-slack-request-timestamp'];

    // Verify request signature
    if (!verifySlackSignature(body, signature, timestamp, config.slack.signingSecret)) {
      console.error('Invalid Slack signature');
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const event = req.body.event;
    
    // Handle reaction_added events
    if (event && event.type === 'reaction_added') {
      // Check if reaction is the trigger emoji
      if (event.reaction === config.app.triggerEmoji) {
        await handleCharityLookupRequest(slack, event);
      }
    }

    res.status(200).json({ ok: true });

  } catch (error) {
    console.error('Error handling Slack event:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Verify Slack request signature
 * @param {string} body - Raw request body
 * @param {string} signature - X-Slack-Signature header
 * @param {string} timestamp - X-Slack-Request-Timestamp header
 * @param {string} signingSecret - Slack signing secret
 * @returns {boolean} True if signature is valid
 */
function verifySlackSignature(body, signature, timestamp, signingSecret) {
  // Check timestamp to prevent replay attacks (within 5 minutes)
  const currentTime = Math.floor(Date.now() / 1000);
  if (Math.abs(currentTime - timestamp) > 300) {
    return false;
  }

  // Create expected signature
  const baseString = `v0:${timestamp}:${body}`;
  const expectedSignature = 'v0=' + crypto
    .createHmac('sha256', signingSecret)
    .update(baseString)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature),
    Buffer.from(signature)
  );
}

/**
 * Handle charity lookup request triggered by reaction
 * @param {WebClient} slack - Slack Web API client
 * @param {Object} event - Slack reaction_added event
 */
async function handleCharityLookupRequest(slack, event) {
  try {
    // Get the original message that was reacted to
    const result = await slack.conversations.history({
      channel: event.item.channel,
      latest: event.item.ts,
      limit: 1,
      inclusive: true
    });

    if (!result.messages || result.messages.length === 0) {
      throw new Error('Could not retrieve original message');
    }

    const originalMessage = result.messages[0];
    const messageText = originalMessage.text;

    // Extract charity name from message
    const charityName = await extractCharityName(messageText);
    
    if (!charityName) {
      // Post error message if no charity name found
      await slack.chat.postMessage({
        channel: event.item.channel,
        thread_ts: event.item.ts,
        text: formatErrorMessage('', 'extraction_failed')
      });
      return;
    }

    // Post "searching" message to show progress
    const searchingMessage = await slack.chat.postMessage({
      channel: event.item.channel,
      thread_ts: event.item.ts,
      text: `🔍 Searching for "${charityName}"...`
    });

    try {
      // Lookup charity information
      const charityData = await lookupCharity(charityName);
      
      // Format and post research results
      const report = formatCharityReport(charityData, charityName);
      
      // Update the searching message with results
      await slack.chat.update({
        channel: event.item.channel,
        ts: searchingMessage.ts,
        text: report
      });

    } catch (lookupError) {
      console.error('Error during charity lookup:', lookupError);
      
      // Update searching message with error
      await slack.chat.update({
        channel: event.item.channel,
        ts: searchingMessage.ts,
        text: formatErrorMessage(charityName, 'api_error')
      });
    }

  } catch (error) {
    console.error('Error handling charity lookup request:', error);
    
    // Post generic error message
    try {
      await slack.chat.postMessage({
        channel: event.item.channel,
        thread_ts: event.item.ts,
        text: formatErrorMessage('', 'api_error')
      });
    } catch (postError) {
      console.error('Failed to post error message:', postError);
    }
  }
}


// Handle development mode requests - bypasses Slack integration
async function handleDevModeRequest(req, res) {
  try {
    // Expect a simple message in the request body
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ 
        error: 'Missing message field in request body',
        example: { message: 'Please research Oxfam charity' }
      });
    }

    // Extract charity name from message
    const charityName = await extractCharityName(message);
    
    if (!charityName) {
      return res.status(200).json({
        success: false,
        error: 'Could not extract charity name from message',
        message: message,
        extractedName: null
      });
    }

    try {
      // Lookup charity information
      const charityData = await lookupCharity(charityName);
      
      // Format report (but don't send to Slack)
      const report = formatCharityReport(charityData, charityName);
      
      return res.status(200).json({
        success: true,
        message: message,
        extractedName: charityName,
        charityData: charityData,
        report: report
      });

    } catch (lookupError) {
      console.error('Error during charity lookup:', lookupError);
      
      const errorReport = formatErrorMessage(charityName, 'api_error');
      
      return res.status(200).json({
        success: false,
        message: message,
        extractedName: charityName,
        error: 'Charity lookup failed',
        errorReport: errorReport,
        details: lookupError.message
      });
    }

  } catch (error) {
    console.error('Error in dev mode handler:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
}