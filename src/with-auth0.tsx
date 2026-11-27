import React, { ComponentType } from 'react';
import Auth0Context, { Auth0ContextInterface } from './auth0-context';

/**
 * Components wrapped in `withAuth0` will have an additional `auth0` prop
 *
 * @category Hooks & HOCs
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
 * should come from if you have multiple within your application.
 *
 * @typeParam P - The props of the wrapped component. They must include {@link WithAuth0Props}.
 * @param Component - The class component to wrap.
 * @param context - The context to read from. Only provide it if you use multiple `Auth0Provider`s.
 * @returns A component that renders `Component` with the `auth0` prop, and without that prop in its own props type.
 *
 * @category Hooks & HOCs
 */
const withAuth0 = <P extends WithAuth0Props>(
  Component: ComponentType<P>,
  context = Auth0Context
): ComponentType<Omit<P, keyof WithAuth0Props>> => {
  return function WithAuth(props): React.JSX.Element {
    return (
      <context.Consumer>
        {(auth: Auth0ContextInterface): React.JSX.Element => (
          <Component {...(props as P)} auth0={auth} />
        )}
      </context.Consumer>
    );
  };
};

export default withAuth0;
