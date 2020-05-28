import React, { ComponentType, useEffect, FC } from 'react';
import useAuth0 from './use-auth0';

export const defaultOnRedirecting = (): JSX.Element => <></>;

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
