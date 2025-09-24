# Slack researcher

## Brief

Your task is to develop a Slack bot that listens for emoji reactions on messages in a Slack channel. When the bot detects a reaction, it should perform automated research into a charity named in the message. The bot then responds in a thread with the results of the research.

For example, someone posts in #charity-sales and says "we just heard from the Blue Cross that they want some SEO help, anyone know anything about them?"

Someone adds an emoji reaction to the post with a :question: (or custom emoji). That causes the Slack bot to draft a quick report on the Blue Cross, adding it as a comment in a thread attached to the original post.

## Resources

This repo contains a starter implementation of a Slack bot hosted using serverless functions on Vercel. Some documentation has been included in `docs` to help with the project setup.

### Codebase overview

There's `messageParser.js` that uses AI to extract the charity named in the Slack message, then `charityLookup.js` searches for information about that charity. `reportFormatter.js`  returns a neatly formatted message. The main logic / serverless API route is all handled in `api/slack-events.js`.

For development mode, an additional dev-mode only request is supported in `api/slack-events.js`. An express server has been created in `/dev/dev-server.js` with accompanying index.html file to send and receive API requests without having to use Slack. See the [local development docs](https://github.com/jhancock532/slack-researcher/docs/Local%20development.md) for more information.

### Deployment guide

Ideally, one person works through deployment systematically, while other developers look at the stretch goals.

First, create the Slack app, following phase one of `Slack.md`.

Then, create a Vercel deployment and configure those environment variables, following `Vercel.md`.

Finally complete the rest of `Slack.md`, updating the Slack app to point to Vercel, and adding it to a new private channel with your team members.

## Stretch goals

Here are some suggestions for how you can take the project forward...

1. Provide a JSON schema for the OpenAI API call in `messageParser.js` to get a more consistent output. See the [structured outputs documentation](https://platform.openai.com/docs/guides/structured-outputs).

2. Upgrade the bot so that it can search for multiple charities named in a message.

3. Fetch finance information and include this in the summary message.

4. Return a nicer summary format by updating `reportFormatter.js`.

5. Try to learn about recent news relating to the charity and include that in your response.

6. AI generate a fun profile picture for the bot.

7. Consider security implications and issues that might occur if we wanted to run this bot full time, and how these could be mitigated.

8. Consider ways of making the response faster.

You may prefer to develop this app in a different way (e.g. using Slack commands, instead of reactions) - feel free to take this project in your own direction!
