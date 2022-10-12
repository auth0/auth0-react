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
 * Wrap your class components in this Higher Order Component to give them access to the Auth0Context.
 *
 * Providing a context as the second argument allows you to configure the Auth0Provider the Auth0Context
 * should come from f you have multiple within your application.
 */
const withAuth0 = <P extends WithAuth0Props>(
  Component: ComponentType<P>,
  context = Auth0Context
): ComponentType<Omit<P, keyof WithAuth0Props>> => {
  return function WithAuth(props): JSX.Element {
    return (
      <context.Consumer>
        {(auth: Auth0ContextInterface): JSX.Element => (
          <Component {...(props as P)} auth0={auth} />
        )}
      </context.Consumer>
    );
  };
};

export default withAuth0;
