export const handleRedirectCallback = jest
  .fn()
  .mockResolvedValue({ appState: {} });
export const getTokenSilently = jest.fn();
export const getUser = jest.fn();
export const isAuthenticated = jest.fn().mockResolvedValue(false);
export const loginWithRedirect = jest.fn();
export const logout = jest.fn();

export const Auth0Client = jest.fn().mockImplementation(() => {
  return {
    handleRedirectCallback,
    getTokenSilently,
    getUser,
    isAuthenticated,
    loginWithRedirect,
    logout,
  };
});
