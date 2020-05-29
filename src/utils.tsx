import {
  GetTokenSilentlyOptions,
  GetTokenWithPopupOptions,
} from '@auth0/auth0-spa-js';

const CODE_RE = /[?&]code=[^&]+/;
const ERROR_RE = /[?&]error=[^&]+/;

export type AppState = {
  returnTo?: string;
  [key: string]: any; // eslint-disable-line @typescript-eslint/no-explicit-any
};

export const hasAuthParams = (searchParams = window.location.search): boolean =>
  CODE_RE.test(searchParams) || ERROR_RE.test(searchParams);

export const defaultOnRedirectCallback = (appState?: AppState): void => {
  window.history.replaceState(
    {},
    document.title,
    appState?.returnTo || window.location.pathname
  );
};

export class OAuthError extends Error {
  constructor(public error: string, public error_description?: string) {
    super(error_description || error);
  }
}

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
