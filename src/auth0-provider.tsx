import React, { createContext, PropsWithChildren } from 'react';
import { Auth0Client, Auth0ClientOptions } from '@auth0/auth0-spa-js';

export const Auth0Context = createContext<Auth0Client|null>(null);

export default ({ children, ...opts }: PropsWithChildren<Auth0ClientOptions>) => {
  const client = new Auth0Client(opts);

  return (
    <Auth0Context.Provider value={client}>
      {children}
    </Auth0Context.Provider>
  );
};
