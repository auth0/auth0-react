import React, { ComponentType, useEffect, FC } from 'react';
import useAuth0 from './use-auth0';

export const defaultOnRedirecting = (): JSX.Element => <></>;

const withLoginRequired = <P extends object>(
  Component: ComponentType<P>,
  onRedirecting: () => JSX.Element = defaultOnRedirecting
): FC<P> => (props: P): JSX.Element => {
  const { isAuthenticated, isLoading, login } = useAuth0();

  useEffect(() => {
    if (isLoading || isAuthenticated) {
      return;
    }
    (async (): Promise<void> => {
      await login({
        appState: { redirectTo: window.location.pathname },
      });
    })();
  }, [isLoading, isAuthenticated, login]);

  return isAuthenticated ? <Component {...props} /> : onRedirecting();
};

export default withLoginRequired;
