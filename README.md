![Auth0 SDK for React Single Page Applications](https://cdn.auth0.com/website/sdks/banners/auth0-react-banner.png)

[![npm](https://img.shields.io/npm/v/@auth0/auth0-react.svg?style=flat)](https://www.npmjs.com/package/@auth0/auth0-react)
[![codecov](https://img.shields.io/codecov/c/github/auth0/auth0-react/main.svg?style=flat)](https://codecov.io/gh/auth0/auth0-react)
![Downloads](https://img.shields.io/npm/dw/@auth0/auth0-react)
[![License](https://img.shields.io/:license-mit-blue.svg?style=flat)](https://opensource.org/licenses/MIT)
[![CircleCI](https://img.shields.io/circleci/build/github/auth0/auth0-react.svg?branch=main&style=flat)](https://circleci.com/gh/auth0/auth0-react)

📚 [Documentation](#documentation) - 🚀 [Getting Started](#getting-started) - 💻 [API Reference](#api-reference) - 💬 [Feedback](#feedback)

## Documentation

- [Quickstart](https://auth0.com/docs/quickstart/spa/react) - our interactive guide for quickly adding login, logout and user information to a React app using Auth0.
- [Sample App](https://github.com/auth0-samples/auth0-react-samples/tree/master/Sample-01) - a full-fledged React application integrated with Auth0.
- [FAQs](https://github.com/auth0/auth0-react/blob/main/FAQ.md) - frequently asked questions about the auth0-react SDK.
- [Examples](https://github.com/auth0/auth0-react/blob/main/EXAMPLES.md) - code samples for common React authentication scenario's.
- [Docs site](https://www.auth0.com/docs) - explore our docs site and learn more about Auth0.

## Getting started

### Installation

Using [npm](https://npmjs.org/)

```bash
npm install @auth0/auth0-react
```

Using [yarn](https://yarnpkg.com/)

```bash
yarn add @auth0/auth0-react
```

### Configure Auth0

Create a **Single Page Application** in the [Auth0 Dashboard](https://manage.auth0.com/#/applications).

> **If you're using an existing application**, verify that you have configured the following settings in your Single Page Application:
>
> - Click on the "Settings" tab of your application's page.
> - Scroll down and click on the "Show Advanced Settings" link.
> - Under "Advanced Settings", click on the "OAuth" tab.
> - Ensure that "JsonWebToken Signature Algorithm" is set to `RS256` and that "OIDC Conformant" is enabled.

Next, configure the following URLs for your application under the "Application URIs" section of the "Settings" page:

- **Allowed Callback URLs**: `http://localhost:3000`
- **Allowed Logout URLs**: `http://localhost:3000`
- **Allowed Web Origins**: `http://localhost:3000`

> These URLs should reflect the origins that your application is running on. **Allowed Callback URLs** may also include a path, depending on where you're handling the callback.

Take note of the **Client ID** and **Domain** values under the "Basic Information" section. You'll need these values in the next step.

### Configure the SDK

Configure the SDK by wrapping your application in `Auth0Provider`:

```jsx
// src/index.js
import React from 'react';
import { createRoot } from 'react-dom/client';
import { Auth0Provider } from '@auth0/auth0-react';
import App from './App';

const root = createRoot(document.getElementById('app'));

root.render(
  <Auth0Provider
    domain="YOUR_AUTH0_DOMAIN"
    clientId="YOUR_AUTH0_CLIENT_ID"
    authorizationParams={{
      redirect_uri: window.location.origin,
    }}
  >
    <App />
  </Auth0Provider>
);
```

<details>
<summary>Instructions for React <18</summary>
<br>

```jsx
// src/index.js
import React from 'react';
import ReactDOM from 'react-dom';
import { Auth0Provider } from '@auth0/auth0-react';
import App from './App';

ReactDOM.render(
  <Auth0Provider
    domain="YOUR_AUTH0_DOMAIN"
    clientId="YOUR_AUTH0_CLIENT_ID"
    authorizationParams={{
      redirect_uri: window.location.origin,
    }}
  >
    <App />
  </Auth0Provider>,
  document.getElementById('app')
);
```
</details>

Use the `useAuth0` hook in your components to access authentication state (`isLoading`, `isAuthenticated` and `user`) and authentication methods (`loginWithRedirect` and `logout`):

```jsx
// src/App.js
import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';

function App() {
  const { isLoading, isAuthenticated, error, user, loginWithRedirect, logout } =
    useAuth0();

  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (error) {
    return <div>Oops... {error.message}</div>;
  }

  if (isAuthenticated) {
    return (
      <div>
        Hello {user.name}{' '}
        <button onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}>
          Log out
        </button>
      </div>
    );
  } else {
    return <button onClick={() => loginWithRedirect()}>Log in</button>;
  }
}

export default App;
```

For more code samples on how to integrate **auth0-react** SDK in your **React** application, have a look at our [examples](https://github.com/auth0/auth0-react/blob/main/EXAMPLES.md).

## API reference

Explore public API's available in auth0-react.

- [Auth0Provider](https://auth0.github.io/auth0-react/functions/Auth0Provider.html)
- [Auth0ProviderOptions](https://auth0.github.io/auth0-react/interfaces/Auth0ProviderOptions.html)
- [useAuth0](https://auth0.github.io/auth0-react/functions/useAuth0.html)
- [withAuth0](https://auth0.github.io/auth0-react/functions/withAuth0.html)
- [withAuthenticationRequired](https://auth0.github.io/auth0-react/functions/withAuthenticationRequired.html)

## Feedback

### Contributing

We appreciate feedback and contribution to this repo! Before you get started, please see the following:

- [Auth0's general contribution guidelines](https://github.com/auth0/open-source-template/blob/master/GENERAL-CONTRIBUTING.md)
- [Auth0's code of conduct guidelines](https://github.com/auth0/open-source-template/blob/master/CODE-OF-CONDUCT.md)
- [This repo's contribution guide](https://github.com/auth0/auth0-react/blob/main/CONTRIBUTING.md)

### Raise an issue

To provide feedback or report a bug, please [raise an issue on our issue tracker](https://github.com/auth0/auth0-react/issues).

### Vulnerability Reporting

Please do not report security vulnerabilities on the public GitHub issue tracker. The [Responsible Disclosure Program](https://auth0.com/responsible-disclosure-policy) details the procedure for disclosing security issues.

---

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: light)" srcset="https://cdn.auth0.com/website/sdks/logos/auth0_light_mode.png"   width="150">
    <source media="(prefers-color-scheme: dark)" srcset="https://cdn.auth0.com/website/sdks/logos/auth0_dark_mode.png" width="150">
    <img alt="Auth0 Logo" src="https://cdn.auth0.com/website/sdks/logos/auth0_light_mode.png" width="150">
  </picture>
</p>
<p align="center">Auth0 is an easy to implement, adaptable authentication and authorization platform. To learn more checkout <a href="https://auth0.com/why-auth0">Why Auth0?</a></p>
<p align="center">
This project is licensed under the MIT license. See the <a href="https://github.com/auth0/auth0-react/blob/main/LICENSE"> LICENSE</a> file for more info.</p>
