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
  RedirectLoginOptions as Auth0RedirectLoginOptions,
  CacheLocation,
} from '@auth0/auth0-spa-js';
import Auth0Context, { RedirectLoginOptions } from './auth0-context';
import {
  AppState,
  defaultOnRedirectCallback,
  loginError,
  hasAuthParams,
  wrappedGetToken,
} from './utils';
import { reducer } from './reducer';
import { initialAuthState } from './auth-state';

export interface Auth0ProviderOptions extends PropsWithChildren<{}> {
  /**
   * By default this removes the code and state parameters from the url when you are redirected from the authorize page.
   * It uses `window.history` but you might want to overwrite this if you are using a custom router, like `react-router-dom`
   * See the EXAMPLES.md for more info.
   */
  onRedirectCallback?: (appState: AppState) => void;
  /**
   * Your Auth0 account domain such as `'example.auth0.com'`,
   * `'example.eu.auth0.com'` or , `'example.mycompany.com'`
   * (when using [custom domains](https://auth0.com/docs/custom-domains))
   */
  domain: string;
  /**
   * The issuer to be used for validation of JWTs, optionally defaults to the domain above
   */
  issuer?: string;
  /**
   * The Client ID found on your Application settings page
   */
  clientId: string;
  /**
   * The default URL where Auth0 will redirect your browser to with
   * the authentication result. It must be whitelisted in
   * the "Allowed Callback URLs" field in your Auth0 Application's
   * settings. If not provided here, it should be provided in the other
   * methods that provide authentication.
   */
  redirectUri?: string;
  /**
   * The value in seconds used to account for clock skew in JWT expirations.
   * Typically, this value is no more than a minute or two at maximum.
   * Defaults to 60s.
   */
  leeway?: number;
  /**
   * The location to use when storing cache data. Valid values are `memory` or `localstorage`.
   * The default setting is `memory`.
   */
  cacheLocation?: CacheLocation;
  /**
   * If true, refresh tokens are used to fetch new access tokens from the Auth0 server. If false, the legacy technique of using a hidden iframe and the `authorization_code` grant with `prompt=none` is used.
   * The default setting is `false`.
   *
   * **Note**: Use of refresh tokens must be enabled by an administrator on your Auth0 client application.
   */
  useRefreshTokens?: boolean;
  /**
   * A maximum number of seconds to wait before declaring background calls to /authorize as failed for timeout
   * Defaults to 60s.
   */
  authorizeTimeoutInSeconds?: number;
  /**
   * Changes to recommended defaults, like defaultScope
   */
  advancedOptions?: {
    /**
     * The default scope to be included with all requests.
     * If not provided, 'openid profile email' is used. This can be set to `null` in order to effectively remove the default scopes.
     *
     * Note: The `openid` scope is **always applied** regardless of this setting.
     */
    defaultScope?: string;
  };
  /**
   * Maximum allowable elasped time (in seconds) since authentication.
   * If the last time the user authenticated is greater than this value,
   * the user must be reauthenticated.
   */
  maxAge?: string | number;
  /**
   * The default scope to be used on authentication requests.
   * The defaultScope defined in the Auth0Client is included
   * along with this scope
   */
  scope?: string;
  /**
   * The default audience to be used for requesting API access.
   */
  audience?: string;
  /**
   * If you need to send custom parameters to the Authorization Server,
   * make sure to use the original parameter name.
   */
  [key: string]: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

const toAuth0ClientOptions = (
  opts: Auth0ProviderOptions
): Auth0ClientOptions => {
  const { clientId, redirectUri, maxAge, ...validOpts } = opts;
  return {
    ...validOpts,
    client_id: clientId,
    redirect_uri: redirectUri,
    max_age: maxAge,
  };
};

const toAuth0LoginRedirectOptions = (
  opts?: Auth0RedirectLoginOptions
): RedirectLoginOptions | undefined => {
  if (!opts) {
    return;
  }
  const { redirectUri, ...validOpts } = opts;
  return {
    ...validOpts,
    redirect_uri: redirectUri,
  };
};

const Auth0Provider = ({
  children,
  onRedirectCallback = defaultOnRedirectCallback,
  ...opts
}: Auth0ProviderOptions): JSX.Element => {
  const [client] = useState(() => new Auth0Client(toAuth0ClientOptions(opts)));
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
      return;
    }
    const isAuthenticated = await client.isAuthenticated();
    const user = isAuthenticated && (await client.getUser());
    dispatch({ type: 'LOGIN_POPUP_COMPLETE', isAuthenticated, user });
  };

  return (
    <Auth0Context.Provider
      value={{
        ...state,
        getAccessTokenSilently: wrappedGetToken(client.getTokenSilently),
        getAccessTokenWithPopup: wrappedGetToken(client.getTokenWithPopup),
        getIdTokenClaims: (opts): Promise<IdToken> =>
          client.getIdTokenClaims(opts),
        loginWithRedirect: (opts): Promise<void> =>
          client.loginWithRedirect(toAuth0LoginRedirectOptions(opts)),
        loginWithPopup: (opts): Promise<void> => loginWithPopup(opts),
        logout: (opts): void => client.logout(opts),
      }}
    >
      {children}
    </Auth0Context.Provider>
  );
};

export default Auth0Provider;
