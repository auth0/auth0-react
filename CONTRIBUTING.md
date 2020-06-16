# Contributing

We appreciate feedback and contribution to this repo! Before you get started, please see [Auth0's general contribution guidelines](https://github.com/auth0/open-source-template/blob/master/GENERAL-CONTRIBUTING.md)

## Local development

Install the dependencies and start the development server:

```bash
npm install
npm start
```

This will run a development server at http://localhost:3000 with a simple application that demonstrates the main features of the SDK. When you make changes the development server will live reload.

You can change the default Auth0 tenant and application by editing the domain and clientId in [static/index.html](./static/index.html#L81-L82)

## Running the examples

The examples are React applications and an Express API. To run the example apps see the instructions in [examples/README.md](./examples/README.md)

## Running the unit tests

The unit tests use Jest and are run with:

```bash
npm test
```

## Running the integration tests

The integration tests run against the examples, so you must follow the instructions to set up the examples in [examples/README.md](./examples/README.md) first.

Then run:

```bash
CYPRESS_USER_EMAIL={YOUR USER} CYPRESS_USER_PASSWORD={YOUR PW} npm run test:integration
```

`CYPRESS_USER_EMAIL` and `CYPRESS_USER_PASSWORD` should be the credentials of a user on your Auth0 tenant that has the `read:users` permissions on the audience you specified when setting up the examples.
