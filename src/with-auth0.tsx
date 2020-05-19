import React, { ComponentType } from 'react';
import Auth0Context, { Auth0ContextInterface } from './auth0-context';

export interface WithAuth0Props {
  auth0: Auth0ContextInterface;
}

const withAuth0 = <P extends WithAuth0Props>(
  Component: ComponentType<P>
): ComponentType<Omit<P, keyof WithAuth0Props>> => (props): JSX.Element => (
  <Auth0Context.Consumer>
    {(auth: Auth0ContextInterface): JSX.Element => (
      <Component auth0={auth} {...(props as P)} />
    )}
  </Auth0Context.Consumer>
);

export default withAuth0;
