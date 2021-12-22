import React, { ComponentType, useEffect, FC } from 'react';
import { RedirectLoginOptions, User } from '@auth0/auth0-spa-js';
import useAuth0 from './use-auth0';

/**
 * @ignore
 */
const defaultOnRedirecting = (): JSX.Element => <></>;

/**
 * @ignore
 */
const defaultReturnTo = (): string =>
  `${window.location.pathname}${window.location.search}`;

/**
 * Options for the withAuthenticationRequired Higher Order Component
 */
export interface WithAuthenticationRequiredOptions {
  /**
   * ```js
   * withAuthenticationRequired(Profile, {
   *   returnTo: '/profile'
   * })
   * ```
   *
   * or
   *
   * ```js
   * withAuthenticationRequired(Profile, {
   *   returnTo: () => window.location.hash.substr(1)
   * })
   * ```
   *
   * Add a path for the `onRedirectCallback` handler to return the user to after login.
   */
  returnTo?: string | (() => string);
  /**
   * ```js
   * withAuthenticationRequired(Profile, {
   *   onRedirecting: () => <div>Redirecting you to the login...</div>
   * })
   * ```
   *
   * Render a message to show that the user is being redirected to the login.
   */
  onRedirecting?: () => JSX.Element;
  /**
   * ```js
   * withAuthenticationRequired(Profile, {
   *   loginOptions: {
   *     appState: {
   *       customProp: 'foo'
   *     }
   *   }
   * })
   * ```
   *
   * Pass additional login options, like extra `appState` to the login page.
   * This will be merged with the `returnTo` option used by the `onRedirectCallback` handler.
   */
  loginOptions?: RedirectLoginOptions;
  /**
   * Check the user object for JWT claims and return a boolean indicating
   * whether or not they are authorized to view the component.
   */
  claimCheck?: (claims?: User) => boolean;
}

/**
 * ```js
 * const MyProtectedComponent = withAuthenticationRequired(MyComponent);
 * ```
 *
 * When you wrap your components in this Higher Order Component and an anonymous user visits your component
 * they will be redirected to the login page and returned to the page they we're redirected from after login.
 */
const withAuthenticationRequired = <P extends object>(
  Component: ComponentType<P>,
  options: WithAuthenticationRequiredOptions = {}
): FC<P> => {
  return function WithAuthenticationRequired(props: P): JSX.Element {
    const { user, isAuthenticated, isLoading, loginWithRedirect } = useAuth0();
    const {
      returnTo = defaultReturnTo,
      onRedirecting = defaultOnRedirecting,
      claimCheck = (): boolean => true,
      
      // We used to default to empty object here w/ `loginOptions = {}`, but
      // this would be a new instance of an object on each render, which would
      // trigger useEffect() below each time, which could lead to multiple 
      // invocations of `loginWithRedirect()`, which could lead to race conditions
      // and failed logins. Now, let's not default to anything, and instead handle
      // nullish values below where we use it. More information about this issue
      // can be found here:
      // https://github.com/auth0/auth0-react/issues/309
      loginOptions,
    } = options;

    /**
     * The route is authenticated if the user has valid auth and there are no
     * JWT claim mismatches.
     */
    const routeIsAuthenticated = isAuthenticated && claimCheck(user);

    useEffect(() => {
      if (isLoading || routeIsAuthenticated) {
        return;
      }
      const opts = {
        ...loginOptions,
        appState: {
          ...(loginOptions && loginOptions.appState),
          returnTo: typeof returnTo === 'function' ? returnTo() : returnTo,
        },
      };
      (async (): Promise<void> => {
        await loginWithRedirect(opts);
      })();
    }, [
      isLoading,
      routeIsAuthenticated,
      loginWithRedirect,
      loginOptions,
      returnTo,
    ]);

    return routeIsAuthenticated ? <Component {...props} /> : onRedirecting();
  };
};

export default withAuthenticationRequired;
