import '@testing-library/jest-dom/extend-expect';
import React from 'react';
import withLoginRequired from '../src/with-login-required';
import { render, screen, waitFor } from '@testing-library/react';
// @ts-ignore
import { loginWithRedirect, isAuthenticated } from '@auth0/auth0-spa-js';
import Auth0Provider from '../src/auth0-provider';

describe('withLoginRequired', () => {
  it('should block access to a private component when not authenticated', async () => {
    const MyComponent = (): JSX.Element => <>Private</>;
    const WrappedComponent = withLoginRequired(MyComponent);
    render(
      <Auth0Provider client_id="__test_client_id__" domain="__test_domain__">
        <WrappedComponent />
      </Auth0Provider>
    );
    await waitFor(() => expect(loginWithRedirect).toHaveBeenCalled());
    expect(screen.queryByText('Private')).not.toBeInTheDocument();
  });

  it('should allow access to a private component when authenticated', async () => {
    isAuthenticated.mockResolvedValue(true);
    const MyComponent = (): JSX.Element => <>Private</>;
    const WrappedComponent = withLoginRequired(MyComponent);
    render(
      <Auth0Provider client_id="__test_client_id__" domain="__test_domain__">
        <WrappedComponent />
      </Auth0Provider>
    );
    await waitFor(() => expect(loginWithRedirect).not.toHaveBeenCalled());
    expect(screen.getByText('Private')).toBeInTheDocument();
  });

  it('should show a custom redirecting message', async () => {
    isAuthenticated.mockResolvedValue(true);
    const MyComponent = (): JSX.Element => <>Private</>;
    const OnRedirecting = (): JSX.Element => <>Redirecting</>;
    const WrappedComponent = withLoginRequired(MyComponent, OnRedirecting);
    render(
      <Auth0Provider client_id="__test_client_id__" domain="__test_domain__">
        <WrappedComponent />
      </Auth0Provider>
    );
    await waitFor(() =>
      expect(screen.getByText('Redirecting')).toBeInTheDocument()
    );
    await waitFor(() => expect(loginWithRedirect).not.toHaveBeenCalled());
    expect(screen.queryByText('Redirecting')).not.toBeInTheDocument();
  });
});
