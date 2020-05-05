# @auth0/auth0-react

Auth0 SDK for React Applications.

[![CircleCI](https://circleci.com/gh/auth0/auth0-react.svg?style=svg&circle-token=b7d4097b3e2d3d3d086b26df6b20fb0f51d8ca09)](https://circleci.com/gh/auth0/auth0-react)
[![License](https://img.shields.io/:license-mit-blue.svg?style=flat)](https://opensource.org/licenses/MIT)

### Early Access

**@auth0/auth0-react** is in _Early Access_ in order to get feedback to shape its design. That means:

- It is under active development so breaking changes are expected and we will do our best to communicate them.
- This is a private preview to Auth0 employees only.
- The library is not published onto npm.
- Feedback is actively solicited with the SDKs team.
- Full reviews and an audit of the library have not been completed.

## Table of Contents

- [Installation](#installation)
- [Getting Started](#getting-started)
- [Contributing](#contributing)
- [Support + Feedback](#support--feedback)
- [Vulnerability Reporting](#vulnerability-reporting)
- [What is Auth0](#what-is-auth0)
- [License](#license)

## Installation

```bash
npm install react react-dom @auth0/auth0-spa-js auth0/auth0-react
```

## Getting Started

```js
// src/index.js
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { AuthProvider } from '@auth0/auth0-react';

ReactDOM.render(
  <AuthProvider
    domain="YOUR_AUTH0_DOMAIN"
    client_id="YOUR_AUTH0_CLIENT_ID"
    redirect_uri={window.location.origin}
  >
    <App />
  </AuthProvider>,
  document.getElementById('app')
);
```

```js
// src/App.js
import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';

function App() {
  const { isLoading, isAuthenticated, user, login, logout } = useAuth0();

  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (isAuthenticated) {
    return (
      <div>
        Hello {user.name} <button onClick={logout}>Log out</button>
      </div>
    );
  } else {
    return <button onClick={login}>Log in</button>;
  }
}

export default App;
```

## Contributing

We appreciate feedback and contribution to this repo! Before you get started, please see the following:

- [Auth0's general contribution guidelines](https://github.com/auth0/open-source-template/blob/master/GENERAL-CONTRIBUTING.md)
- [Auth0's code of conduct guidelines](https://github.com/auth0/open-source-template/blob/master/CODE-OF-CONDUCT.md)

## Support + Feedback

For support or to provide feedback, please [raise an issue on our issue tracker](https://github.com/auth0/auth0-react/issues).

## Vulnerability Reporting

Please do not report security vulnerabilities on the public GitHub issue tracker. The [Responsible Disclosure Program](https://auth0.com/whitehat) details the procedure for disclosing security issues.

## What is Auth0?

Auth0 helps you to easily:

- Implement authentication with multiple identity providers, including social (e.g., Google, Facebook, Microsoft, LinkedIn, GitHub, Twitter, etc), or enterprise (e.g., Windows Azure AD, Google Apps, Active Directory, ADFS, SAML, etc.)
- Log in users with username/password databases, passwordless, or multi-factor authentication
- Link multiple user accounts together
- Generate signed JSON Web Tokens to authorize your API calls and flow the user identity securely
- Access demographics and analytics detailing how, when, and where users are logging in
- Enrich user profiles from other data sources using customizable JavaScript rules

[Why Auth0?](https://auth0.com/why-auth0)

## License

This project is licensed under the MIT license. See the [LICENSE](https://github.com/auth0/auth0-react/blob/master/LICENSE) file for more info.
