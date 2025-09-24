# Setup

Go into the source code folder.

```bash
cd slack-researcher
```

Copy over the example env file.

```bash
cp .env.example .env
```

Use BitWarden's secure send feature if you are sharing env variables between developers.

Switch to the node version in `.node-version` and install the dependencies.

```bash
fnm use
npm install
```

For testing locally, use

```bash
npm run dev
```

Then go to http://localhost:3000 and send a test request.

Note that this dev server only tests the look up and response JSON - it skips all of the Slack API code.

All of the dev server related testing code is available in `/slack-researcher/dev`. Env variables are loaded into the express app using `dotenv` in the package.json NPM command.




