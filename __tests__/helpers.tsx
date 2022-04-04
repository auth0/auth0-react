import { Auth0ClientOptions } from '@auth0/auth0-spa-js';
import React, { PropsWithChildren } from 'react';
import Auth0Provider from '../src/auth0-provider';

export const createWrapper = ({
  clientId = '__test_client_id__',
  domain = '__test_domain__',
  ...opts
}: Partial<Auth0ClientOptions> = {}) => {
  return function Wrapper({
    children,
  }: PropsWithChildren<Record<string, unknown>>): JSX.Element {
    return (
      <Auth0Provider domain={domain} clientId={clientId} {...opts}>
        {children}
      </Auth0Provider>
    );
  };
};
