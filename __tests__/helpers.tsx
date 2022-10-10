import React, { PropsWithChildren } from 'react';
import Auth0Provider, { Auth0ProviderOptions } from '../src/auth0-provider';

export const createWrapper = ({
  clientId = '__test_client_id__',
  domain = '__test_domain__',
  ...opts
}: Partial<Auth0ProviderOptions> = {}) => {
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
