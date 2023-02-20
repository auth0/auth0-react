import { OAuthError } from './errors';

const CODE_RE = /[?&]code=[^&]+/;
const STATE_RE = /[?&]state=[^&]+/;
const ERROR_RE = /[?&]error=[^&]+/;

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
      typeof error.error === 'string'
    ) {
      if (
        'error_description' in error &&
        typeof error.error_description === 'string'
      ) {
        return new OAuthError(error.error, error.error_description);
      }
      return new OAuthError(error.error);
    }
    return new Error(fallbackMessage);
  };

export const loginError = normalizeErrorFn('Login failed');

export const tokenError = normalizeErrorFn('Get access token failed');
