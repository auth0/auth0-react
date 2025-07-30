# Examples

- [Use with a Class Component](#use-with-a-class-component)
- [Protect a Route](#protect-a-route)
- [Call an API](#call-an-api)
- [Protecting a route in a `react-router-dom v6` app](#protecting-a-route-in-a-react-router-dom-v6-app)
- [Protecting a route in a Gatsby app](#protecting-a-route-in-a-gatsby-app)
- [Protecting a route in a Next.js app (in SPA mode)](#protecting-a-route-in-a-nextjs-app-in-spa-mode)
- [Use with Auth0 organizations](#use-with-auth0-organizations)
- [Protecting a route with a claims check](#protecting-a-route-with-a-claims-check)
- [Device-bound tokens with DPoP](#device-bound-tokens-with-dpop)

## Use with a Class Component

Use the `withAuth0` higher order component to add the `auth0` property to Class components:

```jsx
import React, { Component } from 'react';
import { withAuth0 } from '@auth0/auth0-react';

class Profile extends Component {
  render() {
    // `this.props.auth0` has all the same properties as the `useAuth0` hook
    const { user } = this.props.auth0;
    return <div>Hello {user.name}</div>;
  }
}

export default withAuth0(Profile);
```

## Protect a Route

Protect a route component using the `withAuthenticationRequired` higher order component. Visits to this route when unauthenticated will redirect the user to the login page and back to this page after login:

```jsx
import React from 'react';
import { withAuthenticationRequired } from '@auth0/auth0-react';

const PrivateRoute = () => <div>Private</div>;

export default withAuthenticationRequired(PrivateRoute, {
  // Show a message while the user waits to be redirected to the login page.
  onRedirecting: () => <div>Redirecting you to the login page...</div>,
});
```

**Note** If you are using a custom router, you will need to supply the `Auth0Provider` with a custom `onRedirectCallback` method to perform the action that returns the user to the protected page. See examples for [react-router](https://github.com/auth0/auth0-react/blob/main/EXAMPLES.md#1-protecting-a-route-in-a-react-router-dom-app), [Gatsby](https://github.com/auth0/auth0-react/blob/main/EXAMPLES.md#2-protecting-a-route-in-a-gatsby-app) and [Next.js](https://github.com/auth0/auth0-react/blob/main/EXAMPLES.md#3-protecting-a-route-in-a-nextjs-app-in-spa-mode).

## Call an API

Call a protected API with an Access Token:

```jsx
import React, { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';

const Posts = () => {
  const { getAccessTokenSilently } = useAuth0();
  const [posts, setPosts] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const token = await getAccessTokenSilently({
          authorizationParams: {
            audience: 'https://api.example.com/',
            scope: 'read:posts',
          },
        });
        const response = await fetch('https://api.example.com/posts', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setPosts(await response.json());
      } catch (e) {
        // Handle errors such as `login_required` and `consent_required` by re-prompting for a login
        console.error(e);
      }
    })();
  }, [getAccessTokenSilently]);

  if (!posts) {
    return <div>Loading...</div>;
  }

  return (
    <ul>
      {posts.map((post, index) => {
        return <li key={index}>{post}</li>;
      })}
    </ul>
  );
};

export default Posts;
```

## Protecting a route in a `react-router-dom v6` app

We need to access the `useNavigate` hook so we can use `navigate` in `onRedirectCallback` to return us to our `returnUrl`.

In order to access `useNavigate` when defining our `Auth0Provider` we must nest it in `BrowserRouter` and use the navigate method from the hook in our `onRedirectCallback` config.

We can then use the `withAuthenticationRequired` HOC (Higher Order Component) to create a `ProtectedRoute` component that redirects anonymous users to the login page, before returning them to the protected route:

```jsx
import React from 'react';
import { Route, BrowserRouter, Routes, useNavigate } from 'react-router-dom';
import { Auth0Provider, withAuthenticationRequired } from '@auth0/auth0-react';
import Profile from './Profile';

const ProtectedRoute = ({ component, ...args }) => {
  const Component = withAuthenticationRequired(component, args);
  return <Component />;
};

const Auth0ProviderWithRedirectCallback = ({ children, ...props }) => {
  const navigate = useNavigate();
  const onRedirectCallback = (appState) => {
    navigate((appState && appState.returnTo) || window.location.pathname);
  };
  return (
    <Auth0Provider onRedirectCallback={onRedirectCallback} {...props}>
      {children}
    </Auth0Provider>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <Auth0ProviderWithRedirectCallback
        domain="YOUR_AUTH0_DOMAIN"
        clientId="YOUR_AUTH0_CLIENT_ID"
        authorizationParams={{
          redirect_uri: window.location.origin,
        }}
      >
        <Routes>
          <Route path="/" exact />
          <Route
            path="/profile"
            element={<ProtectedRoute component={Profile} />}
          />
        </Routes>
      </Auth0ProviderWithRedirectCallback>
    </BrowserRouter>
  );
}
```

See [react-router example app](./examples/cra-react-router)

## Protecting a route in a Gatsby app

Wrap the root element in your `Auth0Provider` to configure the SDK and setup the context for the `useAuth0` hook.

The `onRedirectCallback` will use `gatsby`'s `navigate` function to return the user to the protected route after the login:

```jsx
// gatsby-browser.js
import React from 'react';
import { Auth0Provider } from '@auth0/auth0-react';
import { navigate } from 'gatsby';

const onRedirectCallback = (appState) => {
  // Use Gatsby's navigate method to replace the url
  navigate(appState?.returnTo || '/', { replace: true });
};

export const wrapRootElement = ({ element }) => {
  return (
    <Auth0Provider
      domain="YOUR_AUTH0_DOMAIN"
      clientId="YOUR_AUTH0_CLIENT_ID"
      onRedirectCallback={onRedirectCallback}
      authorizationParams={{
        redirect_uri: window.location.origin,
      }}
    >
      {element}
    </Auth0Provider>
  );
};
```

Create a page that you want to be protected, e.g. a profile page, and wrap it in the `withAuthenticationRequired` HOC:

```jsx
// src/pages/profile.js
import React from 'react';
import { useAuth0, withAuthenticationRequired } from '@auth0/auth0-react';

const Profile = () => {
  const { user } = useAuth0();
  return (
    <ul>
      <li>Name: {user.nickname}</li>
      <li>E-mail: {user.email}</li>
    </ul>
  );
};

// Wrap the component in the withAuthenticationRequired handler
export default withAuthenticationRequired(Profile);
```

See [Gatsby example app](./examples/gatsby-app)

## Protecting a route in a Next.js app (in SPA mode)

Wrap the root element in your `Auth0Provider` to configure the SDK and setup the context for the `useAuth0` hook.

The `onRedirectCallback` will use `next`'s `Router.replace` function to return the user to the protected route after the login:

```jsx
// pages/_app.js
import React from 'react';
import App from 'next/app';
import Router from 'next/router';
import { Auth0Provider } from '@auth0/auth0-react';

const onRedirectCallback = (appState) => {
  // Use Next.js's Router.replace method to replace the url
  Router.replace(appState?.returnTo || '/');
};

class MyApp extends App {
  render() {
    const { Component, pageProps } = this.props;
    return (
      <Auth0Provider
        domain="YOUR_AUTH0_DOMAIN"
        clientId="YOUR_AUTH0_CLIENT_ID"
        onRedirectCallback={onRedirectCallback}
        authorizationParams={{
          redirect_uri:
            typeof window !== 'undefined' ? window.location.origin : undefined,
        }}
      >
        <Component {...pageProps} />
      </Auth0Provider>
    );
  }
}

export default MyApp;
```

Create a page that you want to be protected, e.g. a profile page, and wrap it in the `withAuthenticationRequired` HOC:

```jsx
// pages/profile.js
import React from 'react';
import { useAuth0, withAuthenticationRequired } from '@auth0/auth0-react';

const Profile = () => {
  const { user } = useAuth0();
  return (
    <ul>
      <li>Name: {user.nickname}</li>
      <li>E-mail: {user.email}</li>
    </ul>
  );
};

// Wrap the component in the withAuthenticationRequired handler
export default withAuthenticationRequired(Profile);
```

See [Next.js example app](./examples/nextjs-app)

## Use with Auth0 organizations

[Organizations](https://auth0.com/docs/organizations) is a set of features that provide better support for developers who build and maintain SaaS and Business-to-Business (B2B) applications. Note that Organizations is currently only available to customers on our Enterprise and Startup subscription plans.

To log the user in to an organization, you should specify the organization in the `Auth0Provider` props.

```jsx
ReactDOM.render(
  <React.StrictMode>
    <Auth0Provider
      domain="YOUR_AUTH0_DOMAIN"
      clientId="YOUR_AUTH0_CLIENT_ID"
      authorizationParams={{
        organization: "YOUR_ORGANIZATION_ID_OR_NAME"
        redirectUri: window.location.origin,
      }}
    >
      <App />
    </Auth0Provider>
  </React.StrictMode>,
  document.getElementById('root')
);
```

To accept an invite from an organization, you should call `loginWithRedirect` with the `invitation` and `organization` parameters.

```jsx
import React from 'react';
import ReactDOM from 'react-dom';
import { Auth0Provider, useAuth0 } from '@auth0/auth0-react';

const App = () => {
  const { loginWithRedirect } = useAuth0();
  const url = window.location.href;
  const inviteMatches = url.match(/invitation=([^&]+)/);
  const orgMatches = url.match(/organization=([^&]+)/);
  if (inviteMatches && orgMatches) {
    loginWithRedirect({
      authorizationParams: {
        organization: orgMatches[1],
        invitation: inviteMatches[1],
      }
    });
  }
  return <div>...</div>;
};
```

## Protecting a route with a claims check

In order to protect a route with a claims check alongside an authentication required check, you can create a HOC that will wrap your component and use that to check that the user has the required claims.

```jsx
const withClaimCheck = (Component, myClaimCheckFunction, returnTo) => {
  const { user } =  useAuth0();
  if (myClaimCheckFunction(user)) {
    return <Component />
  }
  Router.push(returnTo);
}

const checkClaims = (claim?: User) => claim?.['https://my.app.io/jwt/claims']?.ROLE?.includes('ADMIN');

// Usage
const Page = withAuthenticationRequired(
  withClaimCheck(Component, checkClaims, '/missing-roles' )
);
```

## Device-bound tokens with DPoP

**Demonstrating Proof-of-Possession** –or just **DPoP**– is an OAuth 2.0 extension defined in [RFC9449](https://datatracker.ietf.org/doc/html/rfc9449).

It defines a mechanism for securely binding tokens to a specific device by means of cryptographic signatures. Without it, **a token leak caused by XSS or other vulnerability could result in an attacker impersonating the real user.**

In order to support DPoP in `auth0-spa-js`, we require some APIs found in modern browsers:

- [Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Crypto): it allows to create and use cryptographic keys that will be used for creating the proofs (i.e. signatures) used in DPoP.

- [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API): it allows to use cryptographic keys [without giving access to the private material](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto#storing_keys).

The following OAuth 2.0 flows are currently supported by `auth0-spa-js`:

- [Authorization Code Flow](https://auth0.com/docs/get-started/authentication-and-authorization-flow/authorization-code-flow) (`authorization_code`).

- [Refresh Token Flow](https://auth0.com/docs/secure/tokens/refresh-tokens) (`refresh_token`).

- [Custom Token Exchange Flow](https://auth0.com/docs/authenticate/custom-token-exchange) (`urn:ietf:params:oauth:grant-type:token-exchange`).

Currently, only the `ES256` algorithm is supported.

### Enabling DPoP

Currently, DPoP is disabled by default. To enable it, set the `useDpop` option to `true` when invoking the provider. For example:

```jsx
<Auth0Provider
  domain="YOUR_AUTH0_DOMAIN"
  clientId="YOUR_AUTH0_CLIENT_ID"
  useDpop={true} // 👈
  authorizationParams={{ redirect_uri: window.location.origin }}
>
```

After enabling DPoP, supported OAuth 2.0 flows in Auth0 will start transparently issuing tokens that will be cryptographically bound to the current browser.

Note that a DPoP token will have to be sent to a resource server with an `Authorization: DPoP <token>` header instead of `Authorization: Bearer <token>` as usual.

If you're using both types at the same time, you can use the `detailedResponse` option in `getAccessTokenSilently()` to get access to the `token_type` property and know what kind of token you got:

```js
const headers = {
  Authorization: `${token.token_type} ${token.access_token}`,
};
```

If all your clients are already using DPoP, you may want to increase security and make Auth0 reject non-DPoP interactions by enabling the "Require Token Sender-Constraining" option in your Auth0's application settings. Check [the docs](https://auth0.com/docs/get-started/applications/configure-sender-constraining) for details.

### Clearing DPoP data

When using DPoP some temporary data is stored in the user's browser. When you log the user out with `logout()`, it will be deleted.

### Using DPoP in your own requests

Enabling `useDpop` **protects every internal request that the SDK sends to Auth0** (i.e. the authorization server).

However, if you want to use a DPoP access token to authenticate against a custom API (i.e. a resource server), some extra work is required. `Auth0Provider` has some methods that will provide the needed pieces:

- `getDpopNonce()`
- `setDpopNonce()`
- `generateDpopProof()`

This example shows how these coould be used:

```jsx
import { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';

const Posts = () => {
  const {
    getAccessTokenSilently,
    getDpopNonce,
    setDpopNonce,
    generateDpopProof,
  } = useAuth0();

  const [posts, setPosts] = useState(null);

  useEffect(() => {
    (async () => {
      // Define an identifier that the SDK will use to reference the nonces.
      const nonceId = 'my_api_request';

      // Get an access token as usual.
      const accessToken = await getAccessTokenSilently();

      // Get the current DPoP nonce (if any) and do the request with it.
      const nonce = await getDpopNonce(nonceId);

      const response = await fetchWithDpop({
        url: 'https://api.example.com/posts',
        method: 'GET',
        accessToken,
        nonce,
      });

      setPosts(await response.json());

      async function fetchWithDpop({
        url,
        method,
        body,
        accessToken,
        nonce,
        isDpopNonceRetry,
      }) {
        const headers = {
          // A DPoP access token has the type `DPoP` and not `Bearer`.
          Authorization: `DPoP ${accessToken}`,

          // Include the DPoP proof, which is cryptographic evidence that we
          // are in possession of the same key that was used to get the token.
          DPoP: await generateDpopProof({ url, method, nonce, accessToken }),
        };

        // Make the request.
        const response = await fetch(url, { method, headers, body });

        // If there was a nonce in the response, save it.
        const newNonce = response.headers.get('dpop-nonce');

        if (newNonce) {
          setDpopNonce(newNonce, nonceId);
        }

        // If the server rejects the DPoP nonce but it provides a new one, try
        // the request one last time with the correct nonce.
        if (
          response.status === 401 &&
          response.headers.get('www-authenticate')?.includes('use_dpop_nonce')
        ) {
          if (isDpopNonceRetry) {
            throw new Error('DPoP nonce was rejected twice, giving up');
          }

          return fetchWithDpop({
            ...params,
            nonce: newNonce ?? nonce,
            isDpopNonceRetry: true,
          });
        }

        return response;
      }
    })();
  }, []);

  if (!posts) {
    return <div>Loading...</div>;
  }

  return (
    <ul>
      {posts.map((post, index) => {
        return <li key={index}>{post}</li>;
      })}
    </ul>
  );
};

export default Posts;
```
