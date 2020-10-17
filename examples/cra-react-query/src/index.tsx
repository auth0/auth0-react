import React from 'react';
import ReactDOM from 'react-dom';
import App, { history } from './App';
import { Auth0Provider, AppState, Auth0Client } from '@auth0/auth0-react';
import { QueryCache, ReactQueryCacheProvider } from 'react-query';

// create an Auth0Client to pass in to our Auth0Provider. By creating
// our client externally, we can utilize it in our default query function
// for react-query, which simplifies the process of attaching authentication
// to every request and streamlines uses of useQuery throughout the app
const client = new Auth0Client({
  domain: process.env.REACT_APP_DOMAIN,
  client_id: process.env.REACT_APP_CLIENT_ID,
  redirect_uri: window.location.origin,
  audience: process.env.REACT_APP_AUDIENCE,
  scope: 'read:users',
});

// create and configure our QueryCache, with a custom default query function
const PORT = process.env.REACT_APP_API_PORT || 3001;
const defaultQuery = async (key: string, { audience, scope }: { audience: string, scope: string }) => {
  const accessToken = await client.getTokenSilently({
    audience,
    scope
  });
  const result = await fetch(`http://localhost:${PORT}${key}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });
  if (result.ok) {
    return result.json();
  } else {
    // in a real app, you'd perhaps parse a standardized error response here,
    // and attach it to the thrown error.
    throw new Error('Request failed');
  }
}
const queryCache = new QueryCache({
  defaultConfig: {
    queries: {
      queryFn: defaultQuery
    }
  }
})

const onRedirectCallback = (appState: AppState) => {
  // If using a Hash Router, you need to use window.history.replaceState to
  // remove the `code` and `state` query parameters from the callback url.
  // window.history.replaceState({}, document.title, window.location.pathname);
  history.replace((appState && appState.returnTo) || window.location.pathname);
};

ReactDOM.render(
  <React.StrictMode>
    <Auth0Provider
      client={client}
      onRedirectCallback={onRedirectCallback}
    >
      <ReactQueryCacheProvider queryCache={queryCache}>
        <App />
      </ReactQueryCacheProvider>
    </Auth0Provider>
  </React.StrictMode>,
  document.getElementById('root')
);
