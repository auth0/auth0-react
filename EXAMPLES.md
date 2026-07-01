# Examples

- [Use with a Class Component](#use-with-a-class-component)
- [Protect a Route](#protect-a-route)
- [Call an API](#call-an-api)
- [Use Auth0 outside of React](#use-auth0-outside-of-react)
- [Protecting a route in a `react-router-dom v6` app](#protecting-a-route-in-a-react-router-dom-v6-app)
- [Protecting a route in a Gatsby app](#protecting-a-route-in-a-gatsby-app)
- [Protecting a route in a Next.js app (in SPA mode)](#protecting-a-route-in-a-nextjs-app-in-spa-mode)
- [Use with Auth0 organizations](#use-with-auth0-organizations)
- [Protecting a route with a claims check](#protecting-a-route-with-a-claims-check)
- [Device-bound tokens with DPoP](#device-bound-tokens-with-dpop)
- [Using Multi Resource Refresh Tokens](#using-multi-resource-refresh-tokens)
- [Connect Accounts for using Token Vault](#connect-accounts-for-using-token-vault)
- [Access SDK Configuration](#access-sdk-configuration)
- [Multi-Factor Authentication (MFA)](#multi-factor-authentication-mfa)
- [Step-Up Authentication](#step-up-authentication)
- [Native to Web SSO](#native-to-web-sso)
- [Passkeys](#passkeys)
- [MyAccount API](#myaccount-api)
- [Session Expiry from Upstream IdP (IPSIE)](#session-expiry-from-upstream-idp-ipsie)

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

## Use Auth0 outside of React

If you need to share an `Auth0Client` instance between the React tree and code that has no access to React's lifecycle — such as TanStack Start client function middleware — create an `Auth0Client` and pass it to `Auth0Provider` via the `client` prop.

```jsx
// auth0-client.js
import { Auth0Client } from '@auth0/auth0-spa-js';

export const auth0Client = new Auth0Client({
  domain: 'YOUR_AUTH0_DOMAIN',
  clientId: 'YOUR_AUTH0_CLIENT_ID',
  authorizationParams: {
    redirect_uri: window.location.origin,
  },
});
```

Pass the client to `Auth0Provider`:

```jsx
import { Auth0Provider } from '@auth0/auth0-react';
import { auth0Client } from './auth0-client';

export default function App() {
  return (
    <Auth0Provider client={auth0Client}>
      <MyApp />
    </Auth0Provider>
  );
}
```

> **Note:**
> - The raw `Auth0Client` method is `getTokenSilently()`, not `getAccessTokenSilently()`. They share the same token cache but the hook version also updates React state.
> - Calling methods on the raw client does not update React state. For token fetching this is fine since the cache is shared. Avoid calling `client.logout()` directly — use the `logout` method from `useAuth0` instead so React state stays in sync.

Use the same client instance in a TanStack Start client function middleware:

```js
import { createMiddleware } from '@tanstack/react-start';
import { auth0Client } from './auth0-client';

export const authMiddleware = createMiddleware({ type: 'function' }).client(
  async ({ next }) => {
    const token = await auth0Client.getTokenSilently();
    return next({
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
);
```

## Custom token exchange

Exchange an external subject token for Auth0 tokens using the token exchange flow (RFC 8693):

```jsx
import React, { useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';

const TokenExchange = () => {
  const { loginWithCustomTokenExchange } = useAuth0();
  const [tokens, setTokens] = useState(null);
  const [error, setError] = useState(null);

  const handleExchange = async (externalToken) => {
    try {
      const tokenResponse = await loginWithCustomTokenExchange({
        subject_token: externalToken,
        subject_token_type: 'urn:your-company:legacy-system-token',
        audience: 'https://api.example.com/',
        scope: 'openid profile email',
      });

      setTokens(tokenResponse);
      setError(null);

      // Use the returned tokens
      console.log('Access Token:', tokenResponse.access_token);
      console.log('ID Token:', tokenResponse.id_token);
    } catch (e) {
      console.error('Token exchange failed:', e);
      setError(e.message);
    }
  };

  return (
    <div>
      <button onClick={() => handleExchange('your-external-token')}>
        Exchange Token
      </button>
      {tokens && <div>Token exchange successful!</div>}
      {error && <div>Error: {error}</div>}
    </div>
  );
};

export default TokenExchange;
```

> **Note:** The `exchangeToken` method is deprecated and will be removed in the next major version. Use `loginWithCustomTokenExchange` instead.

**Important Notes:**
- The `subject_token_type` must be a namespaced URI under your organization's control
- The external token must be validated in Auth0 Actions using strong cryptographic verification
- This method implements RFC 8693 token exchange grant type
- The audience and scope can be provided directly in the options or will fall back to SDK defaults
- **State Management:** This method triggers the `GET_ACCESS_TOKEN_COMPLETE` action internally upon completion. This ensures that the SDK's `isLoading` and `isAuthenticated` states behave identically to the standard `getAccessTokenSilently` flow.

### Delegation and Impersonation

Use `customTokenExchange` when one principal needs to act on behalf of another — for example, an AI agent acting on behalf of a user. Unlike `loginWithCustomTokenExchange`, this method has no side effects: it does not update the session or affect `isAuthenticated` / `user`.

Pass `actor_token` and `actor_token_type` alongside the subject token to identify the acting party per [RFC 8693](https://tools.ietf.org/html/rfc8693):

```jsx
import React, { useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';

const DelegatedAction = () => {
  const { customTokenExchange } = useAuth0();
  const [accessToken, setAccessToken] = useState(null);
  const [error, setError] = useState(null);

  const handleDelegation = async (userToken, agentToken) => {
    try {
      const tokenResponse = await customTokenExchange({
        subject_token: userToken,
        subject_token_type: 'urn:acme:user-token',
        actor_token: agentToken,
        actor_token_type: 'https://idp.example.com/token-type/agent',
        audience: 'https://api.example.com',
      });

      setAccessToken(tokenResponse.access_token);
      setError(null);

      // Use tokenResponse.access_token to call a downstream API
      // The current user session is unchanged
    } catch (e) {
      console.error('Delegation failed:', e);
      setError(e.message);
    }
  };

  return (
    <div>
      <button onClick={() => handleDelegation('<USER_TOKEN>', '<AGENT_TOKEN>')}>
        Act on Behalf of User
      </button>
      {accessToken && <div>Delegation successful!</div>}
      {error && <div>Error: {error}</div>}
    </div>
  );
};

export default DelegatedAction;
```

[Token Exchange Documentation](https://auth0.com/docs/authenticate/login/token-exchange)
[RFC 8693 Spec](https://tools.ietf.org/html/rfc8693)

## Protecting a route in a `react-router-dom v6` app

We need to access the `useNavigate` hook so we can use `navigate` in `onRedirectCallback` to return us to our `returnUrl`.

In order to access `useNavigate` when defining our `Auth0Provider` we must nest it in `BrowserRouter` and use the navigate method from the hook in our `onRedirectCallback` config.

We can then use the `withAuthenticationRequired` HOC (Higher Order Component) to create a `ProtectedRoute` component that redirects anonymous users to the login page, before returning them to the protected route:

```jsx
import React from 'react';
import { Route, BrowserRouter, Routes, useNavigate } from 'react-router-dom';
import { Auth0Provider, withAuthenticationRequired } from '@auth0/auth0-react';
import Profile from './Profile';
import Settings from './Settings';

// Pattern 1: Direct usage at module level
const ProtectedProfile = withAuthenticationRequired(Profile, {
  onRedirecting: () => <div>Redirecting to login...</div>,
});

// Pattern 2: Factory pattern (use when you need hooks in the wrapper)
const createProtectedRoute = (Component, options) => {
  const ProtectedComponent = withAuthenticationRequired(Component, options);
  return (props) => {
    // You can use any React hooks here (useParams, useLocation, useAuth0, etc.)
    return <ProtectedComponent {...props} />;
  };
};

const ProtectedSettings = createProtectedRoute(Settings, {
  onRedirecting: () => <div>Redirecting to login...</div>,
});

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
          <Route path="/profile" element={<ProtectedProfile />} />
          <Route path="/settings" element={<ProtectedSettings />} />
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
        organization: "YOUR_ORGANIZATION_ID_OR_NAME",
        redirect_uri: window.location.origin,
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

**Demonstrating Proof-of-Possession** —or simply **DPoP**— is a recent OAuth 2.0 extension defined in [RFC9449](https://datatracker.ietf.org/doc/html/rfc9449).

It defines a mechanism for securely binding tokens to a specific device using cryptographic signatures. Without it, **a token leak caused by XSS or other vulnerabilities could allow an attacker to impersonate the real user.**

To support DPoP in `auth0-react`, some APIs available in modern browsers are required:

- [Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Crypto): allows to create and use cryptographic keys, which are used to generate the proofs (i.e. signatures) required for DPoP.

- [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API): enables the use of cryptographic keys [without exposing the private material](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto#storing_keys).

The following OAuth 2.0 flows are currently supported by `auth0-react`:

- [Authorization Code Flow](https://auth0.com/docs/get-started/authentication-and-authorization-flow/authorization-code-flow) (`authorization_code`).

- [Refresh Token Flow](https://auth0.com/docs/secure/tokens/refresh-tokens) (`refresh_token`).

- [Custom Token Exchange Flow](https://auth0.com/docs/authenticate/custom-token-exchange) (`urn:ietf:params:oauth:grant-type:token-exchange`).

> [!IMPORTANT]
> Currently, only the `ES256` algorithm is supported.

### Enabling DPoP

DPoP is disabled by default. To enable it, set the `useDpop` option to `true` when invoking the provider. For example:

```jsx
<Auth0Provider
  domain="YOUR_AUTH0_DOMAIN"
  clientId="YOUR_AUTH0_CLIENT_ID"
  useDpop={true} // 👈
  authorizationParams={{ redirect_uri: window.location.origin }}
>
```

After enabling DPoP, **every new session using a supported OAuth 2.0 flow in Auth0 will begin transparently to use tokens that are cryptographically bound to the current browser**.

> [!IMPORTANT]
> DPoP will only be used for new user sessions created after enabling it. Any previously existing sessions will continue using non-DPoP tokens until the user logs in again.
>
> You decide how to handle this transition. For example, you might require users to log in again the next time they use your application.

> [!NOTE]
> Using DPoP requires storing some temporary data in the user's browser. When you log the user out with `logout()`, this data is deleted.

> [!TIP]
> If all your clients are already using DPoP, you may want to increase security by making Auth0 reject any non-DPoP interactions. See [the docs on Sender Constraining](https://auth0.com/docs/secure/sender-constraining/configure-sender-constraining) for details.

### Using DPoP in your own requests

You use a DPoP token the same way as a "traditional" access token, except it must be sent to the server with an `Authorization: DPoP <token>` header instead of the usual `Authorization: Bearer <token>`.

To determine the type of a token, use the `detailedResponse` option in `getAccessTokenSilently()` to access the `token_type` property, which will be either `DPoP` or `Bearer`.

For internal requests sent by `auth0-react` to Auth0, simply enable the `useDpop` option and **every interaction with Auth0 will be protected**.

However, **to use DPoP with a custom, external API, some additional work is required**. The `useAuth()` hook provides some low-level methods to help with this:

- `getDpopNonce()`
- `setDpopNonce()`
- `generateDpopProof()`

However, due to the nature of how DPoP works, **this is not a trivial task**:

- When a nonce is missing or expired, the request may need to be retried.
- Received nonces must be stored and managed.
- DPoP headers must be generated and included in every request, and regenerated for retries.

Because of this, we recommend using the provided `fetchWithAuth()` method, which **handles all of this for you**.

#### Simple usage

The `fetchWithAuth()` method is a drop-in replacement for the native `fetch()` function from the Fetch API, so if you're already using it, the change will be minimal.

For example, if you had this code:

```js
await fetch('https://api.example.com/foo', {
  method: 'GET',
  headers: { 'user-agent': 'My Client 1.0' }
});

console.log(response.status);
console.log(response.headers);
console.log(await response.json());
```

You would change it as follows:

```js
const { createFetcher } = useAuth0();

const fetcher = createFetcher({
  dpopNonceId: 'my_api_request'
});

await fetcher.fetchWithAuth('https://api.example.com/foo', {
  method: 'GET',
  headers: { 'user-agent': 'My Client 1.0' }
});

console.log(response.status);
console.log(response.headers);
console.log(await response.json());
```

When using `fetchWithAuth()`, the following will be handled for you automatically:

- Use `getAccessTokenSilently()` to get the access token to inject in the headers.
- Generate and inject DPoP headers when needed.
- Store and update any DPoP nonces.
- Handle retries caused by a rejected nonce.

> [!IMPORTANT]
> If DPoP is enabled in the provider, a `dpopNonceId` **must** be present in the `createFetcher()` parameters, since it’s used to keep track of the DPoP nonces for each request.

#### Advanced usage

If you need something more complex than the example above, you can provide a custom implementation in the `fetch` property.

However, since `auth0-react` needs to make decisions based on HTTP responses, your implementation **must return an object with _at least_ two properties**:

1. `status`: the response status code as a number.
2. `headers`: the response headers as a plain object or as a Fetch API’s Headers-like interface.

Whatever it returns, it will be passed as the output of the `fetchWithAuth()` method.

Your implementation will be called with a standard, ready-to-use [Request](https://developer.mozilla.org/en-US/docs/Web/API/Request) object, which will contain any headers needed for authorization and DPoP usage (if enabled). Depending on your needs, you can use this object directly or treat it as a container with everything required to make the request your own way.

##### Example with `axios`

```js
const { createFetcher } = useAuth0();

const fetcher = createFetcher({
  dpopNonceId: 'my_api_request',
  fetch: (request) =>
    // The `Request` object has everything you need to do a request in a
    // different library. Make sure that your output meets the requirements
    // about the `status` and `headers` properties.
    axios.request({
      url: request.url,
      method: request.method,
      data: request.body,
      headers: Object.fromEntries(request.headers),
      timeout: 2000,
      // etc.
    }),
  },
});

const response = await fetcher.fetchWithAuth('https://api.example.com/foo', {
  method: 'POST',
  body: JSON.stringify({ name: 'John Doe' }),
  headers: { 'user-agent': 'My Client 1.0' },
});

console.log(response.status);
console.log(response.headers);
console.log(response.data);
```

##### Timeouts with native `fetch()`

The Fetch API doesn’t support passing a timeout value directly; instead, you’re expected to use an [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal). For example:

```js
const { createFetcher } = useAuth0();

const fetcher = createFetcher();

await fetcher.fetchWithAuth('https://api.example.com/foo', {
  signal: AbortSignal.timeout(2000)
});
```

This works, but if you define your request parameters statically when your app starts and then call `fetchWithAuth()` after an indeterminate amount of time, you'll find that **the request will timeout immediately**. This happens because the `AbortSignal` **starts counting time as soon as it is created**.

To work around this, you can pass a thin wrapper over the native `fetch()` so that a new `AbortSignal` is created each time a request is made:

```js
const { createFetcher } = useAuth0();

const fetcher = createFetcher({
  fetch: (request) => fetch(request, { signal: AbortSignal.timeout(2000) })
});

await fetcher.fetchWithAuth('https://api.example.com/foo');
```

##### Having a base URL

If you need to make requests to different endpoints of the same API, passing a `baseUrl` to `createFetcher()` can be useful:

```js
const { createFetcher } = useAuth0();

const fetcher = createFetcher({
  baseUrl: 'https://api.example.com'
});

await fetcher.fetchWithAuth('/foo'); // => https://api.example.com/foo
await fetcher.fetchWithAuth('/bar'); // => https://api.example.com/bar
await fetcher.fetchWithAuth('/xyz'); // => https://api.example.com/xyz

// If the passed URL is absolute, `baseUrl` will be ignored for convenience:
await fetcher.fetchWithAuth('https://other-api.example.com/foo');
```

##### Passing an access token

The `fetchWithAuth()` method assumes you’re using the SDK to get the access token for the request. This means that by default, it will always call `getAccessTokenSilently()` internally before making the request.

However, if you already have an access token or need to pass specific parameters to `getAccessTokenSilently()`, you can override this behavior with a custom access token factory, like so:

```js
const { createFetcher, getAccessTokenSilently } = useAuth0();

createFetcher({
  getAccessToken: () =>
    getAccessTokenSilently({
      authorizationParams: {
        audience: '<SOME_AUDIENCE>',
        scope: '<SOME_SCOPE>'
        // etc.
      }
    })
});
```

## Using Multi-Resource Refresh Tokens

With **Multi-Resource Refresh Tokens** -or simply **MRRT**- now a refresh token from one API, can be used to request a new access token from another different API. Read more about how MRRT works for browser-based applications to help you decide, wether you need or not, to use this functionality.

- [Multi-Resource Refresh Token](https://auth0.com/docs/secure/tokens/refresh-tokens/multi-resource-refresh-token)

## Enabling MRRT

MRRT is disabled by default. To enable it, set the `useMrrt` option to `true` when invoking the provider. You will need to set `useRefreshTokens` and `useRefreshTokensFallback` to `true` as well For example:

```jsx
<Auth0Provider
  domain="YOUR_AUTH0_DOMAIN"
  clientId="YOUR_AUTH0_CLIENT_ID"
  useRefreshTokens={true}
  useRefreshTokensFallback={true}
  useMrrt={true} // 👈
  authorizationParams={{ redirect_uri: window.location.origin }}
>
```

> [!IMPORTANT]
> In order MRRT to work, it needs a previous configuration setting the refresh token policies.
> Visit [configure and implement MRRT.](https://auth0.com/docs/secure/tokens/refresh-tokens/multi-resource-refresh-token/configure-and-implement-multi-resource-refresh-token)

## Connect Accounts for using Token Vault

The Connect Accounts feature uses the Auth0 My Account API to allow users to link multiple third party accounts to a single Auth0 user profile.

When using Connected Accounts, Auth0 acquires tokens from upstream Identity Providers (like Google) and stores them in a secure [Token Vault](https://auth0.com/docs/secure/tokens/token-vault). These tokens can then be used to access third-party APIs (like Google Calendar) on behalf of the user.

The tokens in the Token Vault are then accessible to [Resource Servers](https://auth0.com/docs/get-started/apis) (APIs) configured in Auth0. The SPA application can then issue requests to the API, which can retrieve the tokens from the Token Vault and use them to access the third-party APIs.

This is particularly useful for applications that require access to different resources on behalf of a user, like AI Agents.

### Configure the SDK

The SDK must be configured with an audience (an API Identifier) - this will be the resource server that uses the tokens from the Token Vault.

The SDK must also be configured to use refresh tokens and MRRT ([Multiple Resource Refresh Tokens](https://auth0.com/docs/secure/tokens/refresh-tokens/multi-resource-refresh-token)) since we will use the refresh token grant to get Access Tokens for the My Account API in addition to the API we are calling.

The My Account API requires DPoP tokens, so we also need to enable DPoP.

```jsx
<Auth0Provider
  domain="YOUR_AUTH0_DOMAIN"
  clientId="YOUR_AUTH0_CLIENT_ID"
  authorizationParams={{
    redirect_uri: window.location.origin,
    audience: '<AUTH0 API IDENTIFIER>' // The API that will use the tokens from the Token Vault
  }}
  useRefreshTokens={true}
  useMrrt={true}
  useDpop={true}
>
  <App />
</Auth0Provider>
```

### Login to the application

Use the login methods to authenticate to the application and get a refresh and access token for the API.

```jsx
const Login = () => {
  const { loginWithRedirect } = useAuth0();
  return <button onClick={() => loginWithRedirect({
    authorizationParams: {
      audience: '<AUTH0 API IDENTIFIER>', // The API that will use the tokens from the Token Vault
      scope: 'openid profile email offline_access read:calendar' // Make sure you get a Refresh Token as you're using MRRT to get access to the My Account API
    }
  })}>Login</button>;
};
```

### Connect to a third party account

Use the new `connectAccountWithRedirect` method to redirect the user to the third party Identity Provider to connect their account.

```jsx
const ConnectAccount = () => {
  const { connectAccountWithRedirect } = useAuth0();
  return <button onClick={() => connectAccountWithRedirect({
    connection: '<CONNECTION eg, google-apps-connection>',
    scopes: ['<SCOPE eg https://www.googleapis.com/auth/calendar.acls.readonly>'],
    authorization_params: {
      // additional authorization params to forward to the authorization server
    }
  })}>Connect Google Calendar</button>;
};
```

When the redirect completes, the user will be returned to the application and the tokens from the third party Identity Provider will be stored in the Token Vault.

```jsx
<Auth0Provider
  // ...
  onRedirectCallback={(appState) => {
    if (appState.connectedAccount) {
      console.log(`You've connected to ${appState.connectedAccount.connection}`);
    }
    window.history.replaceState({}, document.title, '/');
  }}
>
  <App />
</Auth0Provider>
```

You can now [call the API](#calling-an-api) with your access token and the API can use [Access Token Exchange with Token Vault](https://auth0.com/docs/secure/tokens/token-vault/access-token-exchange-with-token-vault) to get tokens from the Token Vault to access third party APIs on behalf of the user.

## Access SDK Configuration

Retrieve the Auth0 domain and client ID that were used to configure the SDK:

```jsx
import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';

const ConfigInfo = () => {
  const { getConfiguration } = useAuth0();

  const config = getConfiguration();

  return (
    <div>
      <p>Domain: {config.domain}</p>
      <p>Client ID: {config.clientId}</p>
    </div>
  );
};

export default ConfigInfo;
```

This is useful for debugging, logging, or building custom Auth0-related URLs without duplicating configuration values.

## Multi-Factor Authentication (MFA)

Access MFA operations through the `mfa` property from `useAuth0()`. All operations require an `mfa_token` from the MFA required error.

> [!NOTE]
> Multi Factor Authentication support via SDKs is currently in Early Access. To request access to this feature, contact your Auth0 representative.

- [Setup](#setup)
- [Handling MFA Required Error](#handling-mfa-required-error)
- [Enrolling Authenticators](#enrolling-authenticators)
- [Challenging Authenticators](#challenging-authenticators)
- [Verifying Challenges](#verifying-challenges)
- [Error Handling](#error-handling)

### Setup

Before using the MFA API, configure MFA in your [Auth0 Dashboard](https://manage.auth0.com) under **Security** > **Multi-factor Auth**. For detailed configuration, see the [Auth0 MFA documentation](https://auth0.com/docs/secure/multi-factor-authentication/customize-mfa/customize-mfa-enrollments-universal-login).

#### Understanding the MFA Response

When MFA is required, the error payload contains an `mfa_requirements` object that indicates either a **challenge** flow (user has enrolled authenticators) or an **enroll** flow (user needs to set up MFA).

**Challenge Flow Response** (user has existing authenticators):

```json
{
  "error": "mfa_required",
  "error_description": "Multifactor authentication required",
  "mfa_token": "Fe26.2*...",
  "mfa_requirements": {
    "challenge": [
      { "type": "otp" },
      { "type": "email" }
      ...
    ]
  }
}
```

**Enroll Flow Response** (user needs to enroll an authenticator):

```json
{
  "error": "mfa_required",
  "error_description": "Multifactor authentication required",
  "mfa_token": "Fe26.2*...",
  "mfa_requirements": {
    "enroll": [
      { "type": "otp" },
      { "type": "phone" },
      { "type": "push-notification" }
      ...
    ]
  }
}
```

Based on the response:
- **`mfa_requirements.challenge`**: User has enrolled authenticators → proceed with **List Authenticators → Challenge → Verify** flow
- **`mfa_requirements.enroll`**: User needs to set up MFA → proceed with **Enroll → Verify** flow

> [!NOTE]
> The SDK handles this logic automatically. When you call `getEnrollmentFactors()` or `getAuthenticators()`, the SDK uses the stored context to return the appropriate data.


### Handling MFA Required Error
When MFA is required, the SDK automatically stores the context. You can then call MFA methods with just the token:

```jsx
import { useAuth0, MfaRequiredError } from '@auth0/auth0-react';

try {
  await getAccessTokenSilently();
} catch (error) {
  if (error instanceof MfaRequiredError) {
    const mfaToken = error.mfa_token;
    
    // Check if user needs to enroll
    const factors = await mfa.getEnrollmentFactors(mfaToken);
    if (factors.length > 0) {
      // Show enrollment UI
    } else {
       // User has enrolled authenticators - get the list of enrolled authenticator
      const authenticators = await mfa.getAuthenticators(error.mfa_token);

      // proceed with challenge
    }
  }
}
```

### Enrolling Authenticators

```jsx
const { mfa } = useAuth0();

// Enroll any factor type
const enrollment = await mfa.enroll({
  mfaToken,
  factorType: 'otp'  // 'otp' | 'sms' | 'email' | 'voice' | 'push'
});

// For OTP: Display QR code
console.log('Scan:', enrollment.barcodeUri);
console.log('Recovery codes:', enrollment.recoveryCodes);

// For SMS: Include phone number
await mfa.enroll({
  mfaToken,
  factorType: 'sms',
  phoneNumber: '+12025551234'  // E.164 format
});

// For Voice: Include phone number
await mfa.enroll({
  mfaToken,
  factorType: 'voice',
  phoneNumber: '+12025551234'  // E.164 format
});

// For Email: Include email address
await mfa.enroll({
  mfaToken,
  factorType: 'email',
  email: 'user@example.com'
});

// For Push: Returns authenticator for mobile app
const pushEnrollment = await mfa.enroll({
  mfaToken,
  factorType: 'push'
});
console.log('Authenticator ID:', pushEnrollment.id);  // Use with Guardian app
```

### Challenging Authenticators

```jsx
const { mfa } = useAuth0();

// Get enrolled authenticators
const authenticators = await mfa.getAuthenticators(mfaToken);

// For OTP: Challenge is OPTIONAL - code already available in authenticator app
// Skip directly to verify() with the 6-digit code, or optionally challenge with:
const otpResponse = await mfa.challenge({
  mfaToken,
  challengeType: 'otp',
  authenticatorId: authenticators[0].id
});

// For SMS/Voice/Email/Push: Challenge REQUIRED to send code (use 'oob' type)
const oobResponse = await mfa.challenge({
  mfaToken,
  challengeType: 'oob',  // Use 'oob' for all out-of-band authenticators
  authenticatorId: authenticators[0].id  // ID of SMS/Voice/Email/Push authenticator
});
console.log('OOB Code:', oobResponse.oobCode);  // Code sent via SMS/Voice/Email/Push
```

### Verifying Challenges

```jsx
const { mfa } = useAuth0();

// Verify with OTP code (for OTP authenticators)
const tokens = await mfa.verify({
  mfaToken,
  otp: '123456'  // 6-digit code from authenticator app
});

// Verify with OOB code (for SMS/Voice/Email authenticators)
const tokens = await mfa.verify({
  mfaToken,
  oobCode: smsResponse.oobCode,
  bindingCode: '123456'  // Optional: code shown in challenge
});

// Verify with recovery code (works for any authenticator)
const tokens = await mfa.verify({
  mfaToken,
  recoveryCode: 'recovery-code-here'
});

// Tokens are now cached - user is authenticated
console.log('Access token:', tokens.access_token);
```

### Error Handling

```jsx
import {
  MfaEnrollmentError,
  MfaChallengeError,
  MfaVerifyError
} from '@auth0/auth0-react';

try {
  await mfa.verify({ mfaToken, otp });
} catch (error) {
  if (error instanceof MfaVerifyError) {
    console.error('Invalid code:', error.error_description);
  } else if (error instanceof MfaChallengeError) {
    console.error('Challenge failed:', error.error_description);
  } else if (error instanceof MfaEnrollmentError) {
    console.error('Enrollment failed:', error.error_description);
  }
}
```

## Step-Up Authentication

When a protected API requires MFA (step-up authentication), `getAccessTokenSilently` will receive an `mfa_required` error from Auth0. By configuring the `interactiveErrorHandler` option, the SDK can automatically handle this by opening a Universal Login popup for the user to complete MFA, then return the token transparently. No custom MFA UI is required — the entire flow is handled via Auth0's Universal Login.

If you need full control over the MFA experience (custom UI for enrollment, challenge, and verification), see the [Multi-Factor Authentication (MFA)](#multi-factor-authentication-mfa) section instead.

> [!WARNING]
> This feature only works with the refresh token flow (`useRefreshTokens={true}`) and only handles `mfa_required` errors. Other interactive errors are not intercepted.

### Setup

Configure `Auth0Provider` with `interactiveErrorHandler` set to `"popup"` and refresh tokens enabled:

```jsx
import { Auth0Provider } from '@auth0/auth0-react';

function App() {
  return (
    <Auth0Provider
      domain="YOUR_AUTH0_DOMAIN"
      clientId="YOUR_AUTH0_CLIENT_ID"
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience: 'https://api.example.com/',
      }}
      useRefreshTokens={true}
      interactiveErrorHandler="popup"
    >
      <MyApp />
    </Auth0Provider>
  );
}
```

### Usage

With this configuration, `getAccessTokenSilently` automatically opens a popup when the token request triggers an `mfa_required` error. Once the user completes MFA in the popup, the token is returned as if the call succeeded normally:

```jsx
import React, { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';

const ProtectedResource = () => {
  const { getAccessTokenSilently } = useAuth0();
  const [data, setData] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        // If MFA is required, a popup opens automatically.
        // The token is returned after the user completes MFA.
        const token = await getAccessTokenSilently({
          authorizationParams: {
            audience: 'https://api.example.com/',
            scope: 'read:sensitive',
          },
        });
        const response = await fetch('https://api.example.com/sensitive', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setData(await response.json());
      } catch (e) {
        console.error(e);
      }
    })();
  }, [getAccessTokenSilently]);

  if (!data) return <div>Loading...</div>;
  return <div>{JSON.stringify(data)}</div>;
};

export default ProtectedResource;
```

### Error Handling

If the popup is blocked, cancelled, or times out, `getAccessTokenSilently` throws `PopupOpenError`, `PopupCancelledError`, or `PopupTimeoutError` respectively. These can be imported from `@auth0/auth0-react`.

## Native to Web SSO

[Native to Web SSO](https://auth0.com/docs/authenticate/single-sign-on/native-to-web) enables seamless single sign-on when users transition from a native mobile app to a web app. The SDK can automatically extract a session transfer token from the URL and include it in the authorization request.

The feature is **disabled by default**. To enable it, set `sessionTransferTokenQueryParamName` on `Auth0Provider` with the name of the query parameter your native app appends to the web app URL:

```jsx
import { Auth0Provider } from '@auth0/auth0-react';

function App() {
  return (
    <Auth0Provider
      domain="YOUR_AUTH0_DOMAIN"
      clientId="YOUR_AUTH0_CLIENT_ID"
      authorizationParams={{
        redirect_uri: window.location.origin,
      }}
      sessionTransferTokenQueryParamName="session_transfer_token"
    >
      <MyApp />
    </Auth0Provider>
  );
}
```

When the web app is opened with `?session_transfer_token=xyz` in the URL, the SDK extracts the token, includes it in the `/authorize` request, and removes it from the URL via `window.history.replaceState()`.

### Using a custom parameter name

If your native app uses a different query parameter name, configure that name instead. The token is always forwarded to Auth0 as `session_transfer_token` regardless:

```jsx
<Auth0Provider
  domain="YOUR_AUTH0_DOMAIN"
  clientId="YOUR_AUTH0_CLIENT_ID"
  authorizationParams={{
    redirect_uri: window.location.origin,
  }}
  sessionTransferTokenQueryParamName="stt"
>
  <MyApp />
</Auth0Provider>
```

### Manually providing the session transfer token

You can pass the token directly via `authorizationParams`. This takes precedence over automatic URL detection:

```jsx
const { loginWithRedirect } = useAuth0();

await loginWithRedirect({
  authorizationParams: {
    session_transfer_token: 'YOUR_SESSION_TRANSFER_TOKEN',
  },
});
```

## Passkeys

Passkeys provide password-less authentication using platform biometrics (Face ID, Touch ID, Windows Hello) or security keys via the WebAuthn standard. The SDK supports two flows:

- **Signup**: Register a new user with a passkey
- **Login**: Authenticate an existing user with a passkey

- [Setup](#setup)
- [Important: Use Refresh Tokens with Passkeys](#important-use-refresh-tokens-with-passkeys)
- [Signup with Passkey](#signup-with-passkey)
- [Login with Passkey](#login-with-passkey)
- [Complete Passkey Flow Example](#complete-passkey-flow-example)
- [Error Handling](#passkey-error-handling)

### Setup

Before using passkeys, ensure the following are configured in your [Auth0 Dashboard](https://manage.auth0.com):

1. **Enable passkey authentication method**: Go to **Authentication** > **Database** > your connection > **Authentication Methods** > **Passkey**.
2. **Enable the WebAuthn passkey grant**: Go to your **Application** > **Advanced Settings** > **Grant Types** and enable the **Passkey** grant.
3. **Custom domain required**: Passkeys are bound to an origin (domain). A [custom domain](https://auth0.com/docs/customize/custom-domains) must be configured — passkeys will not work on the default `*.auth0.com` domain.

### Important: Use Refresh Tokens with Passkeys

> [!IMPORTANT]
> When using passkeys, you **must** configure `Auth0Provider` with `useRefreshTokens={true}`.

Passkey authentication uses a direct token exchange (`/oauth/token` with the WebAuthn grant type) and does **not** create an Auth0 session cookie. Without refresh tokens, `getAccessTokenSilently()` will fail with `login_required` when the access token expires — or worse, silently return tokens for a different user if a prior redirect-based session cookie exists.

```jsx
<Auth0Provider
  domain="YOUR_AUTH0_DOMAIN"
  clientId="YOUR_AUTH0_CLIENT_ID"
  useRefreshTokens={true}
  authorizationParams={{ redirect_uri: window.location.origin }}
>
  <App />
</Auth0Provider>
```

You must also enable **Refresh Token Rotation** in your Auth0 Dashboard under **Applications** > your app > **Settings** > **Refresh Token Rotation**.

### Signup with Passkey

Register a new user with a passkey. The SDK handles the entire flow internally — requesting a challenge from Auth0, triggering the browser's WebAuthn credential creation ceremony, and exchanging the credential for tokens. After a successful call, `isAuthenticated`, `user`, and `getAccessTokenSilently()` all work as expected.

```jsx
const { passkey } = useAuth0();

const tokens = await passkey.signup({
  email: 'user@example.com',
  name: 'Jane Doe' // optional display name
});
```

You can also pass `scope` and `audience` to control the access token:

```jsx
const tokens = await passkey.signup({
  email: 'user@example.com',
  scope: 'openid profile email read:products',
  audience: 'https://api.example.com'
});
```

### Login with Passkey

Authenticate an existing user with their registered passkey. A single call handles the entire assertion flow.

```jsx
const { passkey } = useAuth0();

const tokens = await passkey.login();
// Or with optional params:
const tokens = await passkey.login({ realm, organization, scope, audience });
```

### Complete Passkey Flow Example

```jsx
import { useAuth0, PasskeyError, PasskeyRegisterError } from '@auth0/auth0-react';

function PasskeyAuth() {
  const { passkey, isAuthenticated, user } = useAuth0();

  const handleSignup = async () => {
    try {
      await passkey.signup({ email: 'user@example.com' });
      // isAuthenticated and user are now updated automatically
    } catch (error) {
      if (error instanceof PasskeyRegisterError) {
        console.error('Registration failed:', error.message);
      } else if (error instanceof PasskeyError) {
        console.error('Passkey error:', error.message);
      }
    }
  };

  const handleLogin = async () => {
    try {
      await passkey.login();
      // isAuthenticated and user are now updated automatically
    } catch (error) {
      if (error instanceof PasskeyError) {
        console.error('Passkey error:', error.message);
      }
    }
  };

  if (isAuthenticated) {
    return <p>Welcome, {user.name}!</p>;
  }

  return (
    <>
      <button onClick={handleSignup}>Sign up with Passkey</button>
      <button onClick={handleLogin}>Sign in with Passkey</button>
    </>
  );
}
```

### Passkey Error Handling

```jsx
import { PasskeyError, PasskeyRegisterError } from '@auth0/auth0-react';

const { passkey } = useAuth0();

try {
  await passkey.signup({ email: 'user@example.com' });
} catch (error) {
  if (error instanceof PasskeyRegisterError) {
    console.error('Registration failed:', error.message);
  } else {
    console.error('Passkey error:', error.message);
  }
}
```

> [!TIP]
> Both `signup()` and `login()` throw an error if the user cancels the biometric prompt. Wrap calls in `try/catch` to handle cancellation, network failures, or misconfigured connections.

## MyAccount API

The MyAccount API lets you manage the current user's authentication methods, factors, and connected accounts directly from the SPA.

> [!NOTE]
> The MyAccount API requires refresh tokens and MRRT if your app is configured with a custom API audience. DPoP is supported but optional.

### Factors

Get the list of MFA factors and their enabled status for the current user.

```jsx
const { myAccount } = useAuth0();

const factors = await myAccount.getFactors();
// [{ type: 'totp', usage: ['secondary'] }, { type: 'phone', usage: ['secondary'] }]
```

### Authentication Methods

#### List All

```jsx
const { myAccount } = useAuth0();

const methods = await myAccount.getAuthenticationMethods();
```

#### Filter by Type

```jsx
const passkeys = await myAccount.getAuthenticationMethods('passkey');
```

#### Get by ID

```jsx
const method = await myAccount.getAuthenticationMethod('am_abc123');
```

#### Delete

```jsx
await myAccount.deleteAuthenticationMethod('am_abc123');
```

#### Update

```jsx
// Rename any method
const updated = await myAccount.updateAuthenticationMethod('am_abc123', {
  name: 'My Work Laptop'
});
```

```jsx
// Change preferred delivery method for phone
const updated = await myAccount.updateAuthenticationMethod('am_abc123', {
  preferred_authentication_method: 'voice'
});
```

### Enrollment

Enrollment is a two-step flow: get a challenge, then verify the credential.

#### Passkey

```jsx
const { myAccount } = useAuth0();

// Step 1: get the WebAuthn creation challenge
const challenge = await myAccount.enrollmentChallenge({ type: 'passkey' });

// Step 2: trigger the browser ceremony
const credential = await navigator.credentials.create({
  publicKey: {
    ...challenge.authn_params_public_key,
    challenge: base64urlToBuffer(challenge.authn_params_public_key.challenge),
    user: {
      ...challenge.authn_params_public_key.user,
      id: base64urlToBuffer(challenge.authn_params_public_key.user.id)
    }
  }
});

// Step 3: verify and complete enrollment
const method = await myAccount.enrollmentVerify({
  type: 'passkey',
  location: challenge.location,
  auth_session: challenge.auth_session,
  authn_response: serializeCredential(credential)
});
```

#### Phone

```jsx
// Step 1: request OTP to the phone number
const challenge = await myAccount.enrollmentChallenge({
  type: 'phone',
  phone_number: '+15551234567',
  preferred_authentication_method: 'sms'
});

// Step 2: verify with the OTP the user received
await myAccount.enrollmentVerify({
  type: 'phone',
  location: challenge.location,
  auth_session: challenge.auth_session,
  otp_code: '123456'
});
```

#### Email

```jsx
const challenge = await myAccount.enrollmentChallenge({
  type: 'email',
  email: 'user@example.com'
});

await myAccount.enrollmentVerify({
  type: 'email',
  location: challenge.location,
  auth_session: challenge.auth_session,
  otp_code: '123456'
});
```

#### TOTP

```jsx
const challenge = await myAccount.enrollmentChallenge({ type: 'totp' });
// challenge.barcode_uri — show this as a QR code for the user to scan
// challenge.manual_input_code — fallback manual entry code

await myAccount.enrollmentVerify({
  type: 'totp',
  location: challenge.location,
  auth_session: challenge.auth_session,
  otp_code: '123456'
});
```

#### WebAuthn Platform / Roaming

Same flow as [Passkey](#passkey) above — just change the `type`:

```jsx
// Platform authenticator (e.g. Touch ID, Windows Hello)
const challenge = await myAccount.enrollmentChallenge({ type: 'webauthn-platform' });

// Roaming authenticator (e.g. a hardware security key)
const challenge = await myAccount.enrollmentChallenge({ type: 'webauthn-roaming' });

// The credential creation ceremony and verify call are identical to passkey
await myAccount.enrollmentVerify({
  type: 'webauthn-platform', // or 'webauthn-roaming'
  location: challenge.location,
  auth_session: challenge.auth_session,
  authn_response: serializeCredential(credential)
});
```

#### Push Notification

```jsx
const challenge = await myAccount.enrollmentChallenge({ type: 'push-notification' });
// challenge.barcode_uri — show this as a QR code to link the authenticator app

// No OTP needed — user approves on their device
await myAccount.enrollmentVerify({
  type: 'push-notification',
  location: challenge.location,
  auth_session: challenge.auth_session
});
```

#### Recovery Code

```jsx
const challenge = await myAccount.enrollmentChallenge({ type: 'recovery-code' });
// challenge.recovery_code — display this to the user to save securely

// Verify just confirms the user has saved the code
await myAccount.enrollmentVerify({
  type: 'recovery-code',
  location: challenge.location,
  auth_session: challenge.auth_session
});
```

#### Password

```jsx
const challenge = await myAccount.enrollmentChallenge({ type: 'password' });

await myAccount.enrollmentVerify({
  type: 'password',
  location: challenge.location,
  auth_session: challenge.auth_session,
  new_password: 'newSecurePassword123!'
});
```

### Error Handling

All MyAccount API errors throw `MyAccountApiError` with RFC 7807 fields.

```jsx
import { MyAccountApiError } from '@auth0/auth0-react';

const { myAccount } = useAuth0();

try {
  await myAccount.enrollmentChallenge({ type: 'passkey' });
} catch (err) {
  if (err instanceof MyAccountApiError) {
    console.error(err.status, err.title, err.detail);
    if (err.validation_errors) {
      err.validation_errors.forEach(e => console.error(e.field, e.detail));
    }
  }
}

try {
  await myAccount.deleteAuthenticationMethod('am_abc123');
} catch (err) {
  if (err instanceof MyAccountApiError) {
    console.error(err.status, err.title, err.detail);
  }
}
```

## Session Expiry from Upstream IdP (IPSIE)

When using an Okta or OIDC enterprise connection configured with `id_token_session_expiry_supported: true`, Auth0 includes a `session_expiry` claim in the ID token. This is an absolute Unix timestamp (seconds) that acts as a hard ceiling on the local session — the SDK will not return tokens or a user once this point in time is reached.

You can also emit the claim from a Post-Login Action:

```js
exports.onExecutePostLogin = async (event, api) => {
  // Value must be Unix seconds, not milliseconds.
  api.idToken.setCustomClaim('session_expiry', Math.floor(Date.now() / 1000) + 7200); // 2-hour ceiling
};
```

### Behavior

When the ceiling is reached, `useAuth0()` reflects the expired state on the next call to `getAccessTokenSilently`, `getUser`, or `getIdTokenClaims` — there is no background timer or automatic re-check:

- `isAuthenticated` becomes `false`
- `user` becomes `undefined`
- `getAccessTokenSilently()` returns `undefined` (no error thrown)

If your routes are wrapped with `withAuthenticationRequired`, no code changes are required — the next time a component calls `getAccessTokenSilently` or `getUser`, the state updates and the HOC redirects to login. A user sitting on a page that makes no token or user calls will remain authenticated in the React state until the next such call.

```jsx
// When a token or user call occurs after the ceiling, isAuthenticated becomes false
// and the HOC redirects to login.
export default withAuthenticationRequired(Dashboard);
```

### Reading the claim

`session_expiry` is a standard ID token claim and is available via `getIdTokenClaims()`. Note that `getIdTokenClaims()` returns `undefined` once the ceiling is reached — this is useful for displaying time remaining before expiry, not for detecting expiry itself.

```jsx
import { useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';

function SessionInfo() {
  const { getIdTokenClaims } = useAuth0();

  useEffect(() => {
    getIdTokenClaims().then((claims) => {
      if (claims?.session_expiry) {
        const ceiling = new Date(claims.session_expiry * 1000);
        console.log('Session ceiling:', ceiling.toISOString());
      }
    });
  }, [getIdTokenClaims]);

  return null;
}
```

### Upgrading existing apps

Once the feature is enabled, `user` and `getAccessTokenSilently()` can return `undefined` for a previously authenticated user when the ceiling is reached. Apps that assume these are always set after login should add null checks:

```jsx
function CallApi() {
  const { getAccessTokenSilently } = useAuth0();

  async function fetchData() {
    const token = await getAccessTokenSilently();

    if (!token) {
      // Ceiling was reached — return here and let the re-render cycle handle
      // the redirect via withAuthenticationRequired or your route guard.
      // Calling loginWithRedirect() directly risks a double redirect if a HOC is present.
      return;
    }

    await fetch('/api/data', { headers: { Authorization: `Bearer ${token}` } });
  }

  return <button onClick={fetchData}>Fetch</button>;
}
```

Using `withAuthenticationRequired` on protected routes is the simpler alternative — the redirect happens automatically without the null check.
