# User API

This is a simple express app that has one API endpoint (`/users`) protected with Auth0.

Follow the steps in [examples/README.md](../README.md) to setup an Auth0 application and API.

Add a `.env` file to `./examples/users-api/.env` With the `domain` and `audience` (your API identifier)

```dotenv
DOMAIN=your_domain
AUDIENCE=your_audience
```

Run `npm start` to start the API at http://localhost:3001
