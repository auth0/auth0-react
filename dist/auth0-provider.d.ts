import React from 'react';
import { CacheLocation } from 'auth0-spa-js-ionic';
/**
 * The state of the application before the user was redirected to the login page.
 */
export declare type AppState = {
    returnTo?: string;
    [key: string]: any;
};
/**
 * The main configuration to instantiate the `Auth0Provider`.
 */
export interface Auth0ProviderOptions {
    /**
     * The child nodes your Provider has wrapped
     */
    children?: React.ReactNode;
    /**
     * By default this removes the code and state parameters from the url when you are redirected from the authorize page.
     * It uses `window.history` but you might want to overwrite this if you are using a custom router, like `react-router-dom`
     * See the EXAMPLES.md for more info.
     */
    onRedirectCallback?: (appState: AppState) => void;
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
     *
     * Read more about [changing storage options in the Auth0 docs](https://auth0.com/docs/libraries/auth0-single-page-app-sdk#change-storage-options)
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
     * Maximum allowable elapsed time (in seconds) since authentication.
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
     * The Id of an organization to log in to.
     *
     * This will specify an `organization` parameter in your user's login request and will add a step to validate
     * the `org_id` claim in your user's ID Token.
     */
    organization?: string;
    /**
     * The Id of an invitation to accept. This is available from the user invitation URL that is given when participating in a user invitation flow.
     */
    invitation?: string;
    /**
     * Set the platform name to enable platform specific behaviour, like ASWebAuthenticationSession for iOS
     */
    platform?: 'web' | 'ios' | 'android';
    /**
     * If you need to send custom parameters to the Authorization Server,
     * make sure to use the original parameter name.
     */
    [key: string]: any;
}
/**
 * ```jsx
 * <Auth0Provider
 *   domain={domain}
 *   clientId={clientId}
 *   redirectUri={window.location.origin}>
 *   <MyApp />
 * </Auth0Provider>
 * ```
 *
 * Provides the Auth0Context to its child components.
 */
declare const Auth0Provider: (opts: Auth0ProviderOptions) => JSX.Element;
export default Auth0Provider;
//# sourceMappingURL=auth0-provider.d.ts.map