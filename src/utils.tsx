import {
  GetTokenSilentlyOptions,
  GetTokenWithPopupOptions,
} from '@auth0/auth0-spa-js';
import { OAuthError } from './errors';

const CODE_RE = /[?&]code=[^&]+/;
const ERROR_RE = /[?&]error=[^&]+/;

export const hasAuthParams = (searchParams = window.location.search): boolean =>
  CODE_RE.test(searchParams) || ERROR_RE.test(searchParams);

const normalizeErrorFn = (fallbackMessage: string) => (
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

export const wrappedGetToken = (
  getTokenFn: (
    opts?: GetTokenSilentlyOptions | GetTokenWithPopupOptions
  ) => Promise<string>
) => async (
  opts?: GetTokenSilentlyOptions | GetTokenWithPopupOptions
): Promise<string> => {
  try {
    return await getTokenFn(opts);
  } catch (error) {
    throw tokenError(error);
  }
};
