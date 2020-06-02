# @auth0/auth0-react Examples

To run the examples:

- Follow the steps to configure an Auth0 Single-Page Application (SPA) in https://auth0.com/docs/quickstart/spa/react/01-login#configure-auth0
- Follow the steps to create an API in https://auth0.com/docs/quickstart/spa/react/02-calling-an-api#create-an-api
- Add a permission to your API of `read:users` following the steps in https://auth0.com/docs/dashboard/guides/apis/add-permissions-apis
- Add a `.env` file to `./examples/cra-react-router/.env` With the `domain` and `clientId` of the application and `audience` (your API identifier)

```dotenv
REACT_APP_DOMAIN=your_domain
REACT_APP_CLIENT_ID=your_client_id
REACT_APP_AUDIENCE=your_audience
SKIP_PREFLIGHT_CHECK=true # To workaround issues with nesting create-react-app in another package
```

- Add a `.env` file to `./examples/users-api/.env` With the `domain` and `audience` (your API identifier)

```dotenv
DOMAIN=your_domain
AUDIENCE=your_audience
```

- Start the api and the web application by running the 2 start commands (from the project root)

```bash
$ npm run start:api && npm run start:cra
```
