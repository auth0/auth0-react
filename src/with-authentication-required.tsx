import React, { ComponentType, useEffect, FC } from 'react';
import useAuth0 from './use-auth0';

/**
 * @ignore
 */
const defaultOnRedirecting = (): JSX.Element => <></>;

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
  onRedirecting: () => JSX.Element = defaultOnRedirecting
): FC<P> => (props: P): JSX.Element => {
  const { isAuthenticated, isLoading, loginWithRedirect } = useAuth0();

  useEffect(() => {
    if (isLoading || isAuthenticated) {
      return;
    }
    (async (): Promise<void> => {
      await loginWithRedirect({
        appState: { returnTo: window.location.pathname },
      });
    })();
  }, [isLoading, isAuthenticated, loginWithRedirect]);

  return isAuthenticated ? <Component {...props} /> : onRedirecting();
};

export default withAuthenticationRequired;
