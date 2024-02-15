**Script to check for 404's on URLs within markdown**

### Configuration (development)

Fill in environment variables in `.env`, per `.env.example`.

### Configuration (github workflow)

Add same values used in local `.env` as github repo or org secrets.

Running this in a GitHub workflow uses an installed GitHub App.
Get these values and set them as github secrets: APP_ID, INSTALLATION_ID, PRIVATE_KEY

### Usage

```
npm install
npm start
```
