import React, { ComponentType, useEffect, FC } from 'react';
import { RedirectLoginOptions } from '@auth0/auth0-spa-js';
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

export interface JWTClaim {
  [claim: string]: string | string[];
}

export interface JWTNamespaces {
  [namespace: string]: JWTClaim;
}

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
   * Specify JWT claims that must be present in order to allow access to the route.
   */
  requiredClaims?: JWTNamespaces;
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
    const {
      user = {},
      isAuthenticated,
      isLoading,
      loginWithRedirect,
    } = useAuth0();
    const {
      returnTo = defaultReturnTo,
      onRedirecting = defaultOnRedirecting,
      loginOptions = {},
      requiredClaims,
    } = options;

    let claimsAreAuthenticated;

    /**
     * If no requiredClaims are provided, claimsAreAuthenticated passes
     * automatically.
     */
    if (!requiredClaims) {
      claimsAreAuthenticated = true;
    } else {
    /**
     * Otherwise, claimsAreAuthenticated is false by default, and is set to true
     * only if all requiredClaims checks pass.
     */
      let claimFailed = false;
      claimsAreAuthenticated = false;

      for (const claimURL in requiredClaims) {
        if (claimURL in user) {
          const userClaims = user[claimURL];
          const requiredClaim = requiredClaims[claimURL];

          for (const [requiredClaimKey, requiredClaimValues] of Object.entries(
            requiredClaim
          )) {
            const userClaimValues = userClaims[requiredClaimKey];
            /**
             * Coerce string -> string[].
             */
            const userClaimValueArray =
              typeof userClaimValues === 'string'
                ? [userClaimValues]
                : userClaimValues;

            const requiredClaimValueArray =
              typeof requiredClaimValues === 'string'
                ? [requiredClaimValues]
                : requiredClaimValues;

            /**
             * If one of the required Namespace claim values on the JWT does not
             * match the required claim value, the authorization check fails.
             */
            for (const requiredClaimValue of requiredClaimValueArray) {
              if (!userClaimValueArray.includes(requiredClaimValue)) {
                claimFailed = true;
                break;
              }
            }
          }
        }
      }

      /**
       * If there were no failures, the claims are authenticated.
       */
      if (!claimFailed) claimsAreAuthenticated = true;
    }

    /**
     * The route is authenticated if the user has valid auth and there are no
     * JWT claim mismatches.
     */
    const routeIsAuthenticated = isAuthenticated && claimsAreAuthenticated;

    useEffect(() => {
      if (isLoading || routeIsAuthenticated) {
        return;
      }
      const opts = {
        ...loginOptions,
        appState: {
          ...loginOptions.appState,
          returnTo: typeof returnTo === 'function' ? returnTo() : returnTo,
        },
      };
      (async (): Promise<void> => {
        await loginWithRedirect(opts);
      })();
    }, [isLoading, isAuthenticated, loginWithRedirect, loginOptions, returnTo]);

    return routeIsAuthenticated ? <Component {...props} /> : onRedirecting();
  };
};

export default withAuthenticationRequired;
