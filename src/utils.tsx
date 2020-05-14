const CODE_RE = /[?&]code=[^&]+/;
const ERROR_RE = /[?&]error=[^&]+/;

export type AppState = {
  redirectTo?: string;
  [key: string]: unknown;
};

export const hasAuthParams = (searchParams = window.location.search): boolean =>
  CODE_RE.test(searchParams) || ERROR_RE.test(searchParams);

export const defaultOnRedirectCallback = (appState?: AppState): void => {
  window.history.replaceState(
    {},
    document.title,
    appState?.redirectTo || window.location.pathname
  );
};

export const loginError = (
  error: Error | { error_description: string } | ProgressEvent
): Error =>
  error instanceof Error
    ? error
    : new Error(
        'error_description' in error ? error.error_description : 'Login failed'
      );
