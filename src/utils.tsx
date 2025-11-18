import { OAuthError } from './errors';

const CODE_RE = /[?&](?:connect_)?code=[^&]+/;
const STATE_RE = /[?&]state=[^&]+/;
const ERROR_RE = /[?&]error=[^&]+/;

interface WithError {
  error: string;
}

interface WithErrorAndDescription {
  error: string;
  error_description: string;
}

export const hasAuthParams = (searchParams = window.location.search): boolean =>
  (CODE_RE.test(searchParams) || ERROR_RE.test(searchParams)) &&
  STATE_RE.test(searchParams);

const normalizeErrorFn =
  (fallbackMessage: string) =>
  (error: unknown): Error => {
    if (error instanceof Error) {
      return error;
    }
    // try to check errors of the following form: {error: string; error_description?: string}
    if (
      error !== null &&
      typeof error === 'object' &&
      'error' in error &&
      typeof (error as WithError).error === 'string'
    ) {
      if (
        'error_description' in error &&
        typeof (error as WithErrorAndDescription).error_description === 'string'
      ) {
        const e = error as WithErrorAndDescription;
        return new OAuthError(e.error, e.error_description);
      }
      const e = error as WithError;
      return new OAuthError(e.error);
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
    options.authorizationParams = options.authorizationParams ?? {};
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
