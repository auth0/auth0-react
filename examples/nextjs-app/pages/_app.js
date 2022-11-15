import React from 'react';
import App from 'next/app';
import Head from 'next/head';
import Router from 'next/router';
import { Auth0Provider } from '@auth0/auth0-react';
import { Nav } from '../components/Nav';
import '../components/App.css';

const onRedirectCallback = (appState) => {
  Router.replace(appState?.returnTo || '/');
};

class MyApp extends App {
  render() {
    const { Component, pageProps } = this.props;
    return (
      <Auth0Provider
        domain={process.env.NEXT_PUBLIC_DOMAIN}
        clientId={process.env.NEXT_PUBLIC_CLIENT_ID}
        onRedirectCallback={onRedirectCallback}
        authorizationParams={{
          scope: 'profile email read:users',
          audience: process.env.NEXT_PUBLIC_AUDIENCE,
          redirect_uri: typeof window !== 'undefined' && window.location.origin,
        }}
      >
        <Nav />
        <Component {...pageProps} />
      </Auth0Provider>
    );
  }
}

export default MyApp;
