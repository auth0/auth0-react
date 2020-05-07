import React, { ComponentType } from 'react';
import Auth0Context, { Auth0ContextInterface } from './auth0-context';

export interface WithAuthProps {
  auth: Auth0ContextInterface;
}

const withAuth0 = <P extends WithAuthProps>(
  Component: ComponentType<P>
): ComponentType<Omit<P, keyof WithAuthProps>> => (props): JSX.Element => (
  <Auth0Context.Consumer>
    {(auth: Auth0ContextInterface): JSX.Element => (
      <Component auth={auth} {...(props as P)} />
    )}
  </Auth0Context.Consumer>
);

export default withAuth0;
