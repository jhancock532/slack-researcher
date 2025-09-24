# Slack

## Phase 1. Register the app

Go to the [Slack API website app page](https://api.slack.com/apps).

Click "Create New App" and choose "From scratch."

Give your app a name (e.g., "AI Search Helper") and select the Torchbox workspace to install it in.

### Set Permissions (OAuth Scopes)

Scopes give your app permission to do things in your workspace. For this project, you'll need to tell Slack your app can read reactions and messages, and write replies.

Navigate to "OAuth & Permissions" in the sidebar of your app's dashboard, scroll down the page, and add the following Bot Token Scopes:

`reactions:read`: To see when reactions are added.

`groups:history`: To read messages in private channels.

`chat:write`: To post the response back in a thread.

After adding the scopes, scroll up to the OAuth Tokens section, and install the app to your workspace. 

This will generate a Bot User OAuth Token (it starts with `xoxb-`). Add this token to your .env-local file. If sharing with others, use Bitwarden secure notes.

You can now continue by setting up your Vercel serverless deployment.

## Phase 2. Subscribe to the Reaction Event

You need to tell Slack to notify your app whenever a reaction is added. This is done using the Events API.

Go to "Event Subscriptions" in the sidebar and toggle it on.

You'll be asked for a Request URL. This is the public URL of the server where your code will be hosted. Your app will listen for incoming requests from Slack at this URL.

Once you enter the URL, Slack will send a test challenge request to it. Your code must respond to this challenge correctly to prove it's listening.

Under "Subscribe to bot events," add the `reaction_added` event. This tells Slack to send a notification to your Request URL every time a user adds a reaction.

**N.B. Slack webhooks timeout after 3 seconds.**

## Phase 3. Create a Private Channel and Add the Bot

In your Slack workspace, create a new private channel:

1. Click the "+" in the circle in the leftmost sidebar
2. Select Channel
3. Choose "Private" channel type
4. Give your channel a name and click "Create"

### Add the Bot to the Channel

1. Click the channel name at the top, select "Integrations" → "Add apps"
2. Search to find your bot app and click "Add"

### Test the Bot

To verify everything is working:

1. Post a message in the private channel
2. Add a reaction with the trigger emoji to that message
3. Your bot should respond in a thread with the research results

