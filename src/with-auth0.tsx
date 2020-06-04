import React, { ComponentType } from 'react';
import Auth0Context, { Auth0ContextInterface } from './auth0-context';

/**
 * Components wrapped in `withAuth0` will have an additional `auth0` prop
 */
export interface WithAuth0Props {
  auth0: Auth0ContextInterface;
}

/**
 * ```jsx
 * class MyComponent extends Component {
 *   render() {
 *     // Access the auth context from the `auth0` prop
 *     const { user } = this.props.auth0;
 *     return <div>Hello {user.name}!</div>
 *   }
 * }
 * // Wrap your class component in withAuth0
 * export default withAuth0(MyComponent);
 * ```
 *
 * Wrap your class components in this Higher Order Component to give them access to the Auth0Context
 */
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
