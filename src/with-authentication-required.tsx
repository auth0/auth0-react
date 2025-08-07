import React, {
  ComponentType,
  useContext,
  useEffect,
  FC,
  useMemo,
} from 'react';
import useAuth0 from './use-auth0';
import Auth0Context, {
  Auth0ContextInterface,
  RedirectLoginOptions,
} from './auth0-context';
import { DefaultErrorComponent } from './default-error';

/**
 * Creates a wrapped Auth0 context that automatically includes audience and scope
 * in getAccessTokenSilently calls when they're not explicitly provided
 */
const createWrappedAuth0Context = (
  originalContext: Auth0ContextInterface,
  audience?: string,
  scope?: string
): Auth0ContextInterface => ({
  ...originalContext,
  getAccessTokenSilently: ((options: any = {}) => {
    const mergedOptions = {
      ...options,
    };

    if (!mergedOptions.authorizationParams) {
      mergedOptions.authorizationParams = {};
    }

    if (audience && !mergedOptions.authorizationParams.audience) {
      mergedOptions.authorizationParams.audience = audience;
    }

    if (scope && !mergedOptions.authorizationParams.scope) {
      mergedOptions.authorizationParams.scope = scope;
    }

    return originalContext.getAccessTokenSilently(mergedOptions);
  }) as typeof originalContext.getAccessTokenSilently,
});

/**
 * @ignore
 */
const defaultOnRedirecting = (): React.JSX.Element => <></>;

/**
 * @ignore
 */
const defaultOnBeforeAuthentication = async (): Promise<void> => {
  /* noop */
};

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
   * A function that returns a component to display in the event of an authorization error.
   * An authorization error occurs when the user is authenticated but does not have the required permissions to view the component.
   * If not provided, a default "Access Denied" page will be shown.
   *
   * ```js
   * withAuthenticationRequired(Admin, {
   * scope: 'read:admin-messages',
   * onError: () => <p>You don't have permission to view this page.</p>
   * })
   * ```
   */
  onError?: () => React.JSX.Element;
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
      onError,
    } = options;

    const audience = loginOptions?.authorizationParams?.audience;
    const scope = loginOptions?.authorizationParams?.scope;

    const { isAuthenticated, isLoading, loginWithRedirect } = useAuth0(
      context,
      { audience, scope }
    );
    const globalContext = useContext(context);

    const wrappedContextValue = useMemo(
      () => createWrappedAuth0Context(globalContext, audience, scope),
      [globalContext, audience, scope]
    );

    useEffect(() => {
      if (isLoading || globalContext.isAuthenticated) {
        return;
      }
      const opts = {
        ...loginOptions,
        appState: {
          ...(loginOptions && loginOptions.appState),
          returnTo: typeof returnTo === 'function' ? returnTo() : returnTo,
        },
      };
      (async (): Promise<void> => {
        await onBeforeAuthentication();
        await loginWithRedirect(opts);
      })();
    }, [
      isLoading,
      globalContext.isAuthenticated,
      loginWithRedirect,
      onBeforeAuthentication,
      loginOptions,
      returnTo,
    ]);

    if (isLoading) {
      return onRedirecting();
    }

    // If the user is authenticated and has the required permissions, render the component.
    if (isAuthenticated) {
      return (
        <context.Provider value={wrappedContextValue}>
          <Component {...props} />
        </context.Provider>
      );
    }

    // If the user is authenticated but NOT authorized, show the error UI.
    if (globalContext.isAuthenticated) {
      if (onError) {
        return onError();
      }
      return <DefaultErrorComponent />;
    }

    // Otherwise, the user is not authenticated and is being redirected.
    return onRedirecting();
  };
};

export default withAuthenticationRequired;
