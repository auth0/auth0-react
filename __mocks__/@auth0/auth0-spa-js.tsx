export const handleRedirectCallback = jest.fn(() => ({ appState: {} }));
export const getTokenSilently = jest.fn();
export const getTokenWithPopup = jest.fn();
export const getUser = jest.fn();
export const getIdTokenClaims = jest.fn();
export const isAuthenticated = jest.fn(() => false);
export const loginWithPopup = jest.fn();
export const loginWithRedirect = jest.fn();
export const logout = jest.fn();

export const Auth0Client = jest.fn(() => {
  return {
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
