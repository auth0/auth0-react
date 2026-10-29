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
const revokeRefreshToken = jest.fn();
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
const passkeyContinueSignup = jest.fn(() => Promise.resolve({ access_token: 'passkey-token', id_token: 'passkey-id-token' }));
const passkeyGetSignupChallenge = jest.fn(() => Promise.resolve({ authSession: 'signup-auth-session', publicKey: {} }));
const passkeyGetLoginChallenge = jest.fn(() => Promise.resolve({ authSession: 'login-auth-session', publicKey: {} }));
const passkeyGetTokenWithPasskey = jest.fn(() => Promise.resolve({ access_token: 'passkey-token', id_token: 'passkey-id-token' }));

const myAccountGetUserProfile = jest.fn(() => Promise.resolve({ user_id: 'auth0|123', given_name: 'Alice', profile_policy: { '/given_name': { access: 'read_write', source: 'user' } } }));
const myAccountUpdateUserProfile = jest.fn(() => Promise.resolve({ user_id: 'auth0|123', given_name: 'Alice', nickname: 'wonderland_alice' }));
const myAccountGetFactors = jest.fn(() => Promise.resolve([]));
const myAccountGetAuthenticationMethods = jest.fn(() => Promise.resolve([]));
const myAccountGetAuthenticationMethod = jest.fn(() => Promise.resolve({ id: 'test-method-id' }));
const myAccountUpdateAuthenticationMethod = jest.fn(() => Promise.resolve({ id: 'test-method-id' }));
const myAccountDeleteAuthenticationMethod = jest.fn(() => Promise.resolve());
const myAccountEnrollmentChallenge = jest.fn(() => Promise.resolve({ id: 'test-challenge-id', location: 'https://example.auth0.com/enroll', auth_session: 'test-auth-session', type: 'totp', barcode_uri: 'otpauth://totp/...' }));
const myAccountEnrollmentVerify = jest.fn(() => Promise.resolve({ id: 'test-method-id' }));

const anonymousCreateSession = jest.fn(() => Promise.resolve({ sessionToken: 'anon-session-token', accessToken: 'anon-access-token', expiresAt: 9999999999 }));
const anonymousGetTokenSilently = jest.fn(() => Promise.resolve({ accessToken: 'anon-access-token', expiresAt: 9999999999 }));
const anonymousLogout = jest.fn(() => Promise.resolve());
const anonymousHasSession = jest.fn(() => false);
const anonymousGetClaims = jest.fn(() => null);
const anonymousMintTransferToken = jest.fn(() => Promise.resolve('transfer-ticket-jwe'));

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
    revokeRefreshToken,
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
      continueSignup: passkeyContinueSignup,
      getSignupChallenge: passkeyGetSignupChallenge,
      getLoginChallenge: passkeyGetLoginChallenge,
      getTokenWithPasskey: passkeyGetTokenWithPasskey,
    },
    myAccount: {
      getUserProfile: myAccountGetUserProfile,
      updateUserProfile: myAccountUpdateUserProfile,
      getFactors: myAccountGetFactors,
      getAuthenticationMethods: myAccountGetAuthenticationMethods,
      getAuthenticationMethod: myAccountGetAuthenticationMethod,
      updateAuthenticationMethod: myAccountUpdateAuthenticationMethod,
      deleteAuthenticationMethod: myAccountDeleteAuthenticationMethod,
      enrollmentChallenge: myAccountEnrollmentChallenge,
      enrollmentVerify: myAccountEnrollmentVerify,
    },
    anonymous: {
      createSession: anonymousCreateSession,
      getTokenSilently: anonymousGetTokenSilently,
      logout: anonymousLogout,
      hasSession: anonymousHasSession,
      getClaims: anonymousGetClaims,
      mintTransferToken: anonymousMintTransferToken,
    },
  };
});

export const ResponseType = actual.ResponseType;
export const RefreshTokenMode = actual.RefreshTokenMode;
export const InvalidConfigurationError = actual.InvalidConfigurationError;
export const MissingScopesError = actual.MissingScopesError;

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
export const PasskeyVerificationRequiredError = actual.PasskeyVerificationRequiredError;
export const MyAccountApiError = actual.MyAccountApiError;
export const AnonymousSessionError = actual.AnonymousSessionError;

export const isFederatedDomain = jest.fn();
