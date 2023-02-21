import { OAuthError } from './errors';

const CODE_RE = /[?&]code=[^&]+/;
const STATE_RE = /[?&]state=[^&]+/;
const ERROR_RE = /[?&]error=[^&]+/;

export const hasAuthParams = (searchParams = window.location.search): boolean =>
  (CODE_RE.test(searchParams) || ERROR_RE.test(searchParams)) &&
  STATE_RE.test(searchParams);

const normalizeErrorFn =
  (fallbackMessage: string) =>
  (
    error: Error | { error: string; error_description?: string } | ProgressEvent
  ): Error => {
    if ('error' in error) {
      return new OAuthError(error.error, error.error_description);
    }
    if (error instanceof Error) {
      return error;
    }
    return new Error(fallbackMessage);
  };

export const loginError = normalizeErrorFn('Login failed');

export const tokenError = normalizeErrorFn('Get access token failed');

/**
 * @ignore
 * Helper function to map the v1 `redirectUri` option to the v2 `authorizationParams.redirect_uri`
 * and log a warning.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const deprecateRedirectUri = (options?: any) => {
  if (options?.redirectUri) {
    console.warn(
      'Using `redirectUri` has been deprecated, please use `authorizationParams.redirect_uri` instead as `redirectUri` will be no longer supported in a future version'
    );
    options.authorizationParams = options.authorizationParams || {};
    options.authorizationParams.redirect_uri = options.redirectUri;
    delete options.redirectUri;
  }

  if (options?.authorizationParams?.redirectUri) {
    console.warn(
      'Using `authorizationParams.redirectUri` has been deprecated, please use `authorizationParams.redirect_uri` instead as `authorizationParams.redirectUri` will be removed in a future version'
    );
    options.authorizationParams.redirect_uri =
      options.authorizationParams.redirectUri;
    delete options.authorizationParams.redirectUri;
  }
};
