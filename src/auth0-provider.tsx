import React, {
  PropsWithChildren,
  useEffect,
  useReducer,
  useState,
} from 'react';
import { Auth0Client, Auth0ClientOptions } from '@auth0/auth0-spa-js';
import Auth0Context from './auth0-context';
import { AppState, defaultOnRedirectCallback, hasAuthParams } from './utils';
import { reducer } from './reducer';
import { initialAuthState } from './auth-state';

interface AuthProviderOptions extends PropsWithChildren<Auth0ClientOptions> {
  onRedirectCallback?: (appState: AppState) => void;
}

const Auth0Provider = ({
  children,
  onRedirectCallback = defaultOnRedirectCallback,
  ...opts
}: AuthProviderOptions): JSX.Element => {
  const [client] = useState(() => new Auth0Client(opts));
  const [state, dispatch] = useReducer(reducer, initialAuthState);

  useEffect(() => {
    (async (): Promise<void> => {
      try {
        if (hasAuthParams()) {
          const { appState } = await client.handleRedirectCallback();
          onRedirectCallback(appState);
        } else {
          await client.getTokenSilently();
        }
        const isAuthenticated = await client.isAuthenticated();
        const user = isAuthenticated && (await client.getUser());
        dispatch({ type: 'INITIALISED', isAuthenticated, user });
      } catch (error) {
        if (error.error !== 'login_required') {
          dispatch({ type: 'ERROR', error });
        } else {
          dispatch({ type: 'INITIALISED', isAuthenticated: false });
        }
      }
    })();
  }, [client, onRedirectCallback]);

  return (
    <Auth0Context.Provider
      value={{
        ...state,
        getToken: (opts): Promise<{ [key: string]: unknown }> =>
          client.getTokenSilently(opts),
        login: (opts): Promise<void> => client.loginWithRedirect(opts),
        logout: (opts): void => client.logout(opts),
      }}
    >
      {children}
    </Auth0Context.Provider>
  );
};

export default Auth0Provider;
