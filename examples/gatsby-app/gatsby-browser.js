// gatsby-browser.js
import React from 'react';
import { Auth0Provider } from '@auth0/auth0-react';
import { navigate } from 'gatsby';
import 'bootstrap/dist/css/bootstrap.css';
import './src/components/App.css';

const onRedirectCallback = (appState) => navigate(appState?.returnTo || '/');

export const wrapRootElement = ({ element }) => {
  return (
    <Auth0Provider
      domain={process.env.GATSBY_DOMAIN}
      clientId={process.env.GATSBY_CLIENT_ID}
      onRedirectCallback={onRedirectCallback}
      authorizationParams={{
        audience: process.env.GATSBY_AUDIENCE,
        scope: 'profile email read:users',
        redirect_uri: window.location.origin,
      }}
    >
      {element}
    </Auth0Provider>
  );
};
