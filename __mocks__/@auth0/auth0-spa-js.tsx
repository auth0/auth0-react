const handleRedirectCallback = jest.fn(() => ({ appState: {} }));
const buildLogoutUrl = jest.fn();
const buildAuthorizeUrl = jest.fn();
const checkSession = jest.fn();
const getTokenSilently = jest.fn();
const getTokenWithPopup = jest.fn();
const getUser = jest.fn();
const getIdTokenClaims = jest.fn();
const isAuthenticated = jest.fn(() => false);
const loginWithPopup = jest.fn();
const loginWithRedirect = jest.fn();
const logout = jest.fn();

export const Auth0Client = jest.fn(() => {
  return {
    buildAuthorizeUrl,
    buildLogoutUrl,
    checkSession,
    handleRedirectCallback,
    getTokenSilently,
    getTokenWithPopup,
    getUser,
    getIdTokenClaims,
    isAuthenticated,
    loginWithPopup,
    loginWithRedirect,
    logout,
  };
});

export class GenericError extends Error {
  constructor(public error: string, public error_description: string) {
    super(error_description);
    Object.setPrototypeOf(this, GenericError.prototype);
  }
}
