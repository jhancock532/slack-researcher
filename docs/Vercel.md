# Vercel serverless guide

Files in `/api` become serverless functions.
Use the default, Node.js runtime for OpenAI library compatibility.

## Deployment

1. Install Vercel CLI: `npm i -g vercel`
2. Login: `vercel login`
3. In project directory: `vercel`
4. Follow prompts to deploy

A link should appear for the production deployment URL and the inspect URL, that takes you to the vercel settings interface.

## Environment variables

In Vercel, navigate to your project settings, then go to Environment Variables.

Add the following variables:

- `SLACK_BOT_TOKEN` - Your Slack bot token
- `SLACK_SIGNING_SECRET` - Your Slack app signing secret
- `CHARITYBASE_API_KEY` - Your CharityBase API key
- `OPENAI_API_KEY` - Your OpenAI API key

Optional - specify `TRIGGER_EMOJI` to something fun, or test with the default which is `:question:`.

Redeploy after updating these.

## Deploying

You can deploy to Vercel with the command `vercel --prod` or `npm run deploy`.

