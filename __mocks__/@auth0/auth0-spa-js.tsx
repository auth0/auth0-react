const actual = jest.requireActual('@auth0/auth0-spa-js');

const handleRedirectCallback = jest.fn(() => ({ appState: {} }));
const buildLogoutUrl = jest.fn();
const buildAuthorizeUrl = jest.fn();
const checkSession = jest.fn();
const getTokenSilently = jest.fn();
const getTokenWithPopup = jest.fn();
const getUser = jest.fn();
const getIdTokenClaims = jest.fn();
const exchangeToken = jest.fn();
const isAuthenticated = jest.fn(() => false);
const loginWithPopup = jest.fn();
const loginWithRedirect = jest.fn();
const connectAccountWithRedirect = jest.fn();
const logout = jest.fn();
const getDpopNonce = jest.fn();
const setDpopNonce = jest.fn();
const generateDpopProof = jest.fn();
const createFetcher = jest.fn();

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
    exchangeToken,
    isAuthenticated,
    loginWithPopup,
    loginWithRedirect,
    connectAccountWithRedirect,
    logout,
    getDpopNonce,
    setDpopNonce,
    generateDpopProof,
    createFetcher,
  };
});

export const ResponseType = actual.ResponseType;