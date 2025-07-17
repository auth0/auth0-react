import React, { ComponentType, useEffect, FC } from 'react';
import useAuth0 from './use-auth0';
import Auth0Context, {
  Auth0ContextInterface,
  RedirectLoginOptions,
} from './auth0-context';

/**
 * @ignore
 */
const defaultOnRedirecting = (): React.JSX.Element => <></>;

/**
* @ignore
*/
const defaultOnBeforeAuthentication = async (): Promise<void> => {/* noop */ };

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
  onRedirecting?: () => React.JSX.Element;
  /**
   * ```js
   * withAuthenticationRequired(Profile, {
   *   onBeforeAuthentication: () => { analyticsLibrary.track('login_triggered'); }
   * })
   * ```
   *
   * Allows executing logic before the user is redirected to the login page.
   */
  onBeforeAuthentication?: () => Promise<void>;
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
   * The context to be used when calling useAuth0, this should only be provided if you are using multiple Auth0Providers
   * within your application and you wish to tie a specific component to a Auth0Provider other than the Auth0Provider
   * associated with the default Auth0Context.
   */
  context?: React.Context<Auth0ContextInterface>;
}

/**
 * ```js
 * const MyProtectedComponent = withAuthenticationRequired(MyComponent);
 * ```
 *
 * When you wrap your components in this Higher Order Component and an anonymous user visits your component
 * they will be redirected to the login page; after login they will be returned to the page they were redirected from.
 */
const withAuthenticationRequired = <P extends object>(
  Component: ComponentType<P>,
  options: WithAuthenticationRequiredOptions = {}
): FC<P> => {
  return function WithAuthenticationRequired(props: P): React.JSX.Element {
    const {
      returnTo = defaultReturnTo,
      onRedirecting = defaultOnRedirecting,
      onBeforeAuthentication = defaultOnBeforeAuthentication,
      loginOptions,
      context = Auth0Context,
    } = options;

    const { isAuthenticated, isLoading, loginWithRedirect } =
      useAuth0(context);

    useEffect(() => {
      if (isLoading || isAuthenticated) {
        return;
      }
      const opts = {
        ...loginOptions,
        appState: {
          ...loginOptions?.appState,
          returnTo: typeof returnTo === 'function' ? returnTo() : returnTo,
        },
      };
      void (async (): Promise<void> => {
        await onBeforeAuthentication();
        await loginWithRedirect(opts);
      })();
    }, [
      isLoading,
      isAuthenticated,
      loginWithRedirect,
      onBeforeAuthentication,
      loginOptions,
      returnTo,
    ]);

    return isAuthenticated ? <Component {...props} /> : onRedirecting();
  };
};

export default withAuthenticationRequired;
