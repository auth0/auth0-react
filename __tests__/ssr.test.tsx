/**
 * @jest-environment node
 */
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { Auth0Provider, Auth0Context } from '../src';

jest.unmock('@auth0/auth0-spa-js');

describe('In a Node SSR environment', () => {
  it('auth state is initialised', async () => {
    let isLoading, isAuthenticated, user, loginWithRedirect;
    ReactDOMServer.renderToString(
      <Auth0Provider clientId="__client_id__" domain="__domain__">
        <Auth0Context.Consumer>
          {(value): JSX.Element => {
            ({ isLoading, isAuthenticated, user, loginWithRedirect } = value);
            return <div>App</div>;
          }}
        </Auth0Context.Consumer>
      </Auth0Provider>
    );
    expect(isLoading).toBeTruthy();
    expect(isAuthenticated).toBeFalsy();
    expect(user).toBeUndefined();
    await expect(loginWithRedirect).rejects.toThrowError(
      'window is not defined'
    );
  });
});
