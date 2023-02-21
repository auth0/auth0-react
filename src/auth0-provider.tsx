import React, {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react';
import {
  Auth0Client,
  Auth0ClientOptions,
  PopupLoginOptions,
  PopupConfigOptions,
  GetTokenWithPopupOptions,
  RedirectLoginResult,
  GetTokenSilentlyOptions,
  User,
} from '@auth0/auth0-spa-js';
import Auth0Context, {
  Auth0ContextInterface,
  LogoutOptions,
  RedirectLoginOptions,
} from './auth0-context';
import {
  hasAuthParams,
  loginError,
  tokenError,
  deprecateRedirectUri,
} from './utils';
import { reducer } from './reducer';
import { initialAuthState } from './auth-state';

/**
 * The state of the application before the user was redirected to the login page.
 */
export type AppState = {
  returnTo?: string;
  [key: string]: any; // eslint-disable-line @typescript-eslint/no-explicit-any
};

/**
 * The main configuration to instantiate the `Auth0Provider`.
 */
export interface Auth0ProviderOptions extends Auth0ClientOptions {
  /**
   * The child nodes your Provider has wrapped
   */
  children?: React.ReactNode;
  /**
   * By default this removes the code and state parameters from the url when you are redirected from the authorize page.
   * It uses `window.history` but you might want to overwrite this if you are using a custom router, like `react-router-dom`
   * See the EXAMPLES.md for more info.
   */
  onRedirectCallback?: (appState?: AppState, user?: User) => void;
  /**
   * By default, if the page url has code/state params, the SDK will treat them as Auth0's and attempt to exchange the
   * code for a token. In some cases the code might be for something else (another OAuth SDK perhaps). In these
   * instances you can instruct the client to ignore them eg
   *
   * ```jsx
   * <Auth0Provider
   *   clientId={clientId}
   *   domain={domain}
   *   skipRedirectCallback={window.location.pathname === '/stripe-oauth-callback'}
   * >
   * ```
   */
  skipRedirectCallback?: boolean;
  /**
   * Context to be used when creating the Auth0Provider, defaults to the internally created context.
   *
   * This allows multiple Auth0Providers to be nested within the same application, the context value can then be
   * passed to useAuth0, withAuth0, or withAuthenticationRequired to use that specific Auth0Provider to access
   * auth state and methods specifically tied to the provider that the context belongs to.
   *
   * When using multiple Auth0Providers in a single application you should do the following to ensure sessions are not
   * overwritten:
   *
   * * Configure a different redirect_uri for each Auth0Provider, and set skipRedirectCallback for each provider to ignore
   * the others redirect_uri
   * * If using localstorage for both Auth0Providers, ensure that the audience and scope are different for so that the key
   * used to store data is different
   *
   * For a sample on using multiple Auth0Providers review the [React Account Linking Sample](https://github.com/auth0-samples/auth0-link-accounts-sample/tree/react-variant)
   */
  context?: React.Context<Auth0ContextInterface>;
}

/**
 * Replaced by the package version at build time.
 * @ignore
 */
declare const __VERSION__: string;

/**
 * @ignore
 */
const toAuth0ClientOptions = (
  opts: Auth0ProviderOptions
): Auth0ClientOptions => {
  deprecateRedirectUri(opts);

  return {
    ...opts,
    auth0Client: {
      name: 'auth0-react',
      version: __VERSION__,
    },
  };
};

/**
 * @ignore
 */
const defaultOnRedirectCallback = (appState?: AppState): void => {
  window.history.replaceState(
    {},
    document.title,
    appState?.returnTo || window.location.pathname
  );
};

/**
 * ```jsx
 * <Auth0Provider
 *   domain={domain}
 *   clientId={clientId}
 *   authorizationParams={{ redirect_uri: window.location.origin }}}>
 *   <MyApp />
 * </Auth0Provider>
 * ```
 *
 * Provides the Auth0Context to its child components.
 */
const Auth0Provider = (opts: Auth0ProviderOptions): JSX.Element => {
  const {
    children,
    skipRedirectCallback,
    onRedirectCallback = defaultOnRedirectCallback,
    context = Auth0Context,
    ...clientOpts
  } = opts;
  const [client] = useState(
    () => new Auth0Client(toAuth0ClientOptions(clientOpts))
  );
  const [state, dispatch] = useReducer(reducer, initialAuthState);
  const didInitialise = useRef(false);

  useEffect(() => {
    if (didInitialise.current) {
      return;
    }
    didInitialise.current = true;
    (async (): Promise<void> => {
      try {
        let user: User | undefined;
        if (hasAuthParams() && !skipRedirectCallback) {
          const { appState } = await client.handleRedirectCallback();
          user = await client.getUser();
          onRedirectCallback(appState, user);
        } else {
          await client.checkSession();
          user = await client.getUser();
        }
        dispatch({ type: 'INITIALISED', user });
      } catch (error) {
        dispatch({ type: 'ERROR', error: loginError(error) });
      }
    })();
  }, [client, onRedirectCallback, skipRedirectCallback]);

  const loginWithRedirect = useCallback(
    (opts?: RedirectLoginOptions): Promise<void> => {
      deprecateRedirectUri(opts);

      return client.loginWithRedirect(opts);
    },
    [client]
  );

  const loginWithPopup = useCallback(
    async (
      options?: PopupLoginOptions,
      config?: PopupConfigOptions
    ): Promise<void> => {
      dispatch({ type: 'LOGIN_POPUP_STARTED' });
      try {
        await client.loginWithPopup(options, config);
      } catch (error) {
        dispatch({ type: 'ERROR', error: loginError(error) });
        return;
      }
      const user = await client.getUser();
      dispatch({ type: 'LOGIN_POPUP_COMPLETE', user });
    },
    [client]
  );

  const logout = useCallback(
    async (opts: LogoutOptions = {}): Promise<void> => {
      await client.logout(opts);
      if (opts.openUrl || opts.openUrl === false) {
        dispatch({ type: 'LOGOUT' });
      }
    },
    [client]
  );

  const getAccessTokenSilently = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async (opts?: GetTokenSilentlyOptions): Promise<any> => {
      let token;
      try {
        token = await client.getTokenSilently(opts);
      } catch (error) {
        throw tokenError(error);
      } finally {
        dispatch({
          type: 'GET_ACCESS_TOKEN_COMPLETE',
          user: await client.getUser(),
        });
      }
      return token;
    },
    [client]
  );

  const getAccessTokenWithPopup = useCallback(
    async (
      opts?: GetTokenWithPopupOptions,
      config?: PopupConfigOptions
    ): Promise<string | undefined> => {
      let token;
      try {
        token = await client.getTokenWithPopup(opts, config);
      } catch (error) {
        throw tokenError(error);
      } finally {
        dispatch({
          type: 'GET_ACCESS_TOKEN_COMPLETE',
          user: await client.getUser(),
        });
      }
      return token;
    },
    [client]
  );

  const getIdTokenClaims = useCallback(
    () => client.getIdTokenClaims(),
    [client]
  );

  const handleRedirectCallback = useCallback(
    async (url?: string): Promise<RedirectLoginResult> => {
      try {
        return await client.handleRedirectCallback(url);
      } catch (error) {
        throw tokenError(error);
      } finally {
        dispatch({
          type: 'HANDLE_REDIRECT_COMPLETE',
          user: await client.getUser(),
        });
      }
    },
    [client]
  );

  const contextValue = useMemo(() => {
    return {
      ...state,
      getAccessTokenSilently,
      getAccessTokenWithPopup,
      getIdTokenClaims,
      loginWithRedirect,
      loginWithPopup,
      logout,
      handleRedirectCallback,
    };
  }, [
    state,
    getAccessTokenSilently,
    getAccessTokenWithPopup,
    getIdTokenClaims,
    loginWithRedirect,
    loginWithPopup,
    logout,
    handleRedirectCallback,
  ]);

  return <context.Provider value={contextValue}>{children}</context.Provider>;
};

export default Auth0Provider;
