export const handleRedirectCallback = jest.fn(() => ({ appState: {} }));
export const getTokenSilently = jest.fn();
export const getUser = jest.fn();
export const isAuthenticated = jest.fn(() => false);
export const loginWithRedirect = jest.fn();
export const logout = jest.fn();

export const Auth0Client = jest.fn(() => {
  return {
    handleRedirectCallback,
    getTokenSilently,
    getUser,
    isAuthenticated,
    loginWithRedirect,
    logout,
  };
});
