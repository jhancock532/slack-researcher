// Configuration management for the application
// This file exports configuration settings and environment variable handling

/**
 * Get configuration from environment variables
 * @returns {Object} Configuration object
 */
function getConfig() {
  const config = {
    slack: {
      botToken: process.env.SLACK_BOT_TOKEN,
      signingSecret: process.env.SLACK_SIGNING_SECRET
    },
    openai: {
      apiKey: process.env.OPENAI_API_KEY
    },
    app: {
      triggerEmoji: process.env.TRIGGER_EMOJI || 'question',
    }
  };

  // Validate configuration
  if (!validateConfig()) {
    throw new Error('Invalid configuration - check environment variables');
  }

  return config;
}

/**
 * Validate that all required environment variables are present
 * @returns {boolean} True if configuration is valid
 */
function validateConfig() {
  const required = [
    'SLACK_BOT_TOKEN',
    'SLACK_SIGNING_SECRET',
    'OPENAI_API_KEY'
  ];

  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error('Missing required environment variables:');
    missing.forEach(key => {
      console.error(`  - ${key}`);
    });
    console.error('Please check your .env file or environment configuration');
    return false;
  }

  return true;
}

module.exports = { getConfig, validateConfig };
