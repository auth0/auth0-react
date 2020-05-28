# Examples

1. [Protecting a route in a `react-router-dom` app](#1-protecting-a-route-in-a--react-router-dom--app)
2. [Protecting a route in a Gatsby app](#2-protecting-a-route-in-a-gatsby-app)
3. [Protecting a route in a Next.js app (in SPA mode)](#3-protecting-a-route-in-a-nextjs-app--in-spa-mode-)
4. [Create a `useApi` hook for accessing protected APIs with an access token.](#4-create-a--useapi--hook-for-accessing-protected-apis-with-an-access-token)

## 1. Protecting a route in a `react-router-dom` app

So that we can access the router `history` outside of the `Router` component you need to [create your own history object](https://github.com/ReactTraining/react-router/blob/master/FAQ.md#how-do-i-access-the-history-object-outside-of-components). We can reference this object from the `Auth0Provider`'s `onRedirectCallback`.

We can then use the `withAuthenticationRequired` HOC (Higher Order Component) to create a `ProtectedRoute` component that redirects anonymous users to the login page, before returning them to the protected route:

```jsx
import React from 'react';
import { Router, Route, Switch } from 'react-router-dom';
import { Auth0Provider, withAuthenticationRequired } from '@auth0/auth0-react';
import { createBrowserHistory } from 'history';
import Profile from './Profile';

export const history = createBrowserHistory();

const ProtectedRoute = ({ component, ...args }) => (
  <Route component={withAuthenticationRequired(component)} {...args} />
);

const onRedirectCallback = (appState) => {
  // Use the router's history module to replace the url
  history.replace(appState?.returnTo || window.location.pathname);
};

export default function App() {
  return (
    <Auth0Provider
      domain="YOUR_AUTH0_DOMAIN"
      client_id="YOUR_AUTH0_CLIENT_ID"
      redirect_uri={window.location.origin}
      onRedirectCallback={onRedirectCallback}
    >
      {/* Don't forget to add the history to your router */}
      <Router history={history}>
        <Switch>
          <Route path="/" exact />
          <ProtectedRoute path="/profile" component={Profile} />
        </Switch>
      </Router>
    </Auth0Provider>
  );
}
```

## 2. Protecting a route in a Gatsby app

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
      client_id="YOUR_AUTH0_CLIENT_ID"
      redirect_uri={window.location.origin}
      onRedirectCallback={onRedirectCallback}
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

## 3. Protecting a route in a Next.js app (in SPA mode)

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
        client_id="YOUR_AUTH0_CLIENT_ID"
        redirect_uri={typeof window !== 'undefined' && window.location.origin}
        onRedirectCallback={onRedirectCallback}
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

## 4. Create a `useApi` hook for accessing protected APIs with an access token.

```js
// use-api.js
import { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';

export const useApi = (url, options = {}) => {
  const { isAuthenticated } = useAuth0();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [response, setResponse] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      setError(new Error('The user is not signed in'));
      return;
    }
    (async () => {
      try {
        const { audience, scope, ...fetchOptions } = options;
        const accessToken = await getAccessTokenSilently({ audience, scope });
        const res = await fetch(url, {
          ...fetchOptions,
          headers: {
            ...fetchOptions.headers,
            // Add the Authorization header to the existing headers
            Authorization: `Bearer ${accessToken}`,
          },
        });
        setResponse(await res.json());
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return {
    loading,
    error,
    response,
  };
};
```

Then use it for accessing protected APIs from your components:

```jsx
// users.js
import { useApi } from './use-api';

export const Profile = () => {
  const { loading, error, response: users } = useApi(
    'https://api.example.com/users',
    {
      audience: 'https://api.example.com/',
      scope: 'read:users',
    }
  );
  if (loading) {
    return <div>Loading...</div>;
  }
  if (error) {
    return <div>Oops {error.message}</div>;
  }
  return (
    <ul>
      {users.map((user, index) => {
        return <li key={index}>{user}</li>;
      })}
    </ul>
  );
};
```
