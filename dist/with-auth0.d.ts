import React, { ComponentType } from 'react';
import { Auth0ContextInterface } from './auth0-context';
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
declare const withAuth0: <P extends WithAuth0Props>(Component: React.ComponentType<P>) => React.ComponentType<Pick<P, Exclude<keyof P, "auth0">>>;
export default withAuth0;
//# sourceMappingURL=with-auth0.d.ts.map