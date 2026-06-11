const actual = jest.requireActual('@auth0/auth0-spa-js');

const handleRedirectCallback = jest.fn(() => ({ appState: {} }));
const buildLogoutUrl = jest.fn();
const buildAuthorizeUrl = jest.fn();
const checkSession = jest.fn();
const getTokenSilently = jest.fn();
const getTokenWithPopup = jest.fn();
const getUser = jest.fn();
const getIdTokenClaims = jest.fn();
const loginWithCustomTokenExchange = jest.fn();
const customTokenExchange = jest.fn();
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
const getConfiguration = jest.fn();
const mfaGetAuthenticators = jest.fn(() => Promise.resolve([]));
const mfaEnroll = jest.fn(() => Promise.resolve({ id: 'test-id', barcodeUri: 'test-uri', recoveryCodes: [] }));
const mfaChallenge = jest.fn(() => Promise.resolve({ challengeType: 'otp', oobCode: null }));
const mfaVerify = jest.fn(() => Promise.resolve({ access_token: 'test-token', id_token: 'test-id-token' }));
const mfaGetEnrollmentFactors = jest.fn(() => Promise.resolve([]));

const passkeySignup = jest.fn(() => Promise.resolve({ access_token: 'passkey-token', id_token: 'passkey-id-token' }));
const passkeyLogin = jest.fn(() => Promise.resolve({ access_token: 'passkey-token', id_token: 'passkey-id-token' }));

const myAccountGetFactors = jest.fn(() => Promise.resolve([]));
const myAccountGetAuthenticationMethods = jest.fn(() => Promise.resolve([]));
const myAccountGetAuthenticationMethod = jest.fn(() => Promise.resolve({ id: 'test-method-id' }));
const myAccountUpdateAuthenticationMethod = jest.fn(() => Promise.resolve({ id: 'test-method-id' }));
const myAccountDeleteAuthenticationMethod = jest.fn(() => Promise.resolve());
const myAccountEnrollmentChallenge = jest.fn(() => Promise.resolve({ id: 'test-challenge-id', location: 'https://example.auth0.com/enroll', auth_session: 'test-auth-session', type: 'totp', barcode_uri: 'otpauth://totp/...' }));
const myAccountEnrollmentVerify = jest.fn(() => Promise.resolve({ id: 'test-method-id' }));

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
    loginWithCustomTokenExchange,
    customTokenExchange,
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
    getConfiguration,
    mfa: {
      getAuthenticators: mfaGetAuthenticators,
      enroll: mfaEnroll,
      challenge: mfaChallenge,
      verify: mfaVerify,
      getEnrollmentFactors: mfaGetEnrollmentFactors,
    },
    passkey: {
      signup: passkeySignup,
      login: passkeyLogin,
    },
    myAccount: {
      getFactors: myAccountGetFactors,
      getAuthenticationMethods: myAccountGetAuthenticationMethods,
      getAuthenticationMethod: myAccountGetAuthenticationMethod,
      updateAuthenticationMethod: myAccountUpdateAuthenticationMethod,
      deleteAuthenticationMethod: myAccountDeleteAuthenticationMethod,
      enrollmentChallenge: myAccountEnrollmentChallenge,
      enrollmentVerify: myAccountEnrollmentVerify,
    },
  };
});

export const ResponseType = actual.ResponseType;

export const MfaError = actual.MfaError;
export const MfaListAuthenticatorsError = actual.MfaListAuthenticatorsError;
export const MfaEnrollmentError = actual.MfaEnrollmentError;
export const MfaChallengeError = actual.MfaChallengeError;
export const MfaVerifyError = actual.MfaVerifyError;
export const MfaEnrollmentFactorsError = actual.MfaEnrollmentFactorsError;

export const PasskeyError = actual.PasskeyError;
export const PasskeyRegisterError = actual.PasskeyRegisterError;
export const PasskeyChallengeError = actual.PasskeyChallengeError;
export const PasskeyGetTokenError = actual.PasskeyGetTokenError;
export const MyAccountApiError = actual.MyAccountApiError;
