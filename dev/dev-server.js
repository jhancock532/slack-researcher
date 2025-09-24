const express = require('express');
const path = require('path');
const slackEvents = require('../api/slack-events.js');

const app = express();
const PORT = 3000;

// Parse JSON bodies
app.use(express.json());

// Serve static files from dev directory
app.use(express.static(path.join(__dirname, '../dev')));

// Mount the Slack events API
app.post('/api/slack-events', slackEvents);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Dev server running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Dev server running on http://localhost:${PORT}`);
});
