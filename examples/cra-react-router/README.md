# React Router example

This is an example of using `@auth0/auth0-react` with `react-router`.

Follow the steps in [examples/README.md](../README.md) to setup an Auth0 application and API.

Add the file `./examples/cra-react-router/.env` with the `domain` and `clientId` of the application and `audience` (your API identifier)

```dotenv
REACT_APP_DOMAIN=your_domain
REACT_APP_CLIENT_ID=your_client_id
REACT_APP_AUDIENCE=your_audience
SKIP_PREFLIGHT_CHECK=true # To workaround issues with nesting create-react-app in another package
```

Run `npm start` to start the application at http://localhost:3000

Start the API using the instructions in [examples/users-api/README.md](../users-api/README.md)
