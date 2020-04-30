import { Auth0ClientOptions } from '@auth0/auth0-spa-js';
import React, { PropsWithChildren } from 'react';
import Auth0Provider from '../src/auth0-provider';

export const createWrapper = ({
  client_id = '__test_client_id__',
  domain = '__test_domain__',
}: Partial<Auth0ClientOptions> = {}) => ({
  children,
}: PropsWithChildren<{}>) => (
  <Auth0Provider domain={domain} client_id={client_id}>
    {children}
  </Auth0Provider>
);
