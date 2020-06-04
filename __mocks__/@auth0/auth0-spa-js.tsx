const handleRedirectCallback = jest.fn(() => ({ appState: {} }));
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
