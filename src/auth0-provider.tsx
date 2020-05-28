import React, {
  PropsWithChildren,
  useEffect,
  useReducer,
  useState,
} from 'react';
import {
  Auth0Client,
  Auth0ClientOptions,
  IdToken,
  PopupLoginOptions,
} from '@auth0/auth0-spa-js';
import Auth0Context from './auth0-context';
import {
  AppState,
  defaultOnRedirectCallback,
  loginError,
  hasAuthParams,
} from './utils';
import { reducer } from './reducer';
import { initialAuthState } from './auth-state';

export interface Auth0ProviderOptions
  extends PropsWithChildren<Auth0ClientOptions> {
  onRedirectCallback?: (appState: AppState) => void;
}

const Auth0Provider = ({
  children,
  onRedirectCallback = defaultOnRedirectCallback,
  ...opts
}: Auth0ProviderOptions): JSX.Element => {
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
          dispatch({ type: 'ERROR', error: loginError(error) });
        } else {
          dispatch({ type: 'INITIALISED', isAuthenticated: false });
        }
      }
    })();
  }, [client, onRedirectCallback]);

  const loginWithPopup = async (options?: PopupLoginOptions): Promise<void> => {
    dispatch({ type: 'LOGIN_POPUP_STARTED' });
    try {
      await client.loginWithPopup(options);
    } catch (error) {
      dispatch({ type: 'ERROR', error: loginError(error) });
    }
    const isAuthenticated = await client.isAuthenticated();
    const user = isAuthenticated && (await client.getUser());
    dispatch({ type: 'LOGIN_POPUP_COMPLETE', isAuthenticated, user });
  };

  return (
    <Auth0Context.Provider
      value={{
        ...state,
        getAccessTokenSilently: (opts): Promise<string> =>
          client.getTokenSilently(opts),
        getAccessTokenWithPopup: (opts): Promise<string> =>
          client.getTokenWithPopup(opts),
        getIdTokenClaims: (opts): Promise<IdToken> =>
          client.getIdTokenClaims(opts),
        loginWithRedirect: (opts): Promise<void> =>
          client.loginWithRedirect(opts),
        loginWithPopup: (opts): Promise<void> => loginWithPopup(opts),
        logout: (opts): void => client.logout(opts),
      }}
    >
      {children}
    </Auth0Context.Provider>
  );
};

export default Auth0Provider;
