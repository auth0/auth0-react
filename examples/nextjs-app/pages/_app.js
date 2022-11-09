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
        <Head>
          <link
            rel="stylesheet"
            href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.0/css/bootstrap.min.css"
            integrity="sha384-9aIt2nRpC12Uk9gS9baDl411NQApFmC26EwAOH8WgZl5MYYxFfc+NcPb1dKGj7Sk"
            crossOrigin="anonymous"
          />
        </Head>
        <Nav />
        <Component {...pageProps} />
      </Auth0Provider>
    );
  }
}

export default MyApp;
