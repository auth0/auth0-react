import {
  Auth0Client,
  PasskeyError,
  PasskeyGetTokenError,
  PasskeyVerificationRequiredError,
  TokenEndpointResponse,
} from '@auth0/auth0-spa-js';
import { act, renderHook, waitFor } from '@testing-library/react';
import useAuth0 from '../src/use-auth0';
import { OAuthError } from '../src/errors';
import * as sdk from '../src';
import { createWrapper } from './helpers';

const clientMock = jest.mocked(new Auth0Client({ clientId: '', domain: '' }));

// Not re-exported by the manual mock, so load the real classes.
const { GenericError, MfaRequiredError } = jest.requireActual<
  typeof import('@auth0/auth0-spa-js')
>('@auth0/auth0-spa-js');

const user = { sub: 'auth0|passkey-user', email: 'user@example.com' };

const retryableError = (verificationRequired: Array<'email' | 'phone'>) =>
  new PasskeyGetTokenError('Invalid or expired session', {
    error: 'invalid_grant',
    error_description: 'Invalid or expired session',
    auth_session: 'auth-session-a',
    verification_required: verificationRequired,
  });

describe('Passkey API', () => {
  afterEach(() => {
    clientMock.getUser.mockReset();
  });

  describe('Basic Availability', () => {
    it('should provide passkey client through useAuth0', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useAuth0(), { wrapper });

      await waitFor(() => {
        expect(result.current.passkey).toBeDefined();
      });
    });

    it('should provide signup and login methods', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useAuth0(), { wrapper });

      await waitFor(() => {
        expect(result.current.passkey.signup).toBeDefined();
        expect(result.current.passkey.login).toBeDefined();
        expect(result.current.passkey.continueSignup).toBeDefined();
      });
    });

    it('should keep the same passkey client across re-renders', async () => {
      const wrapper = createWrapper();
      const { result, rerender } = renderHook(() => useAuth0(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      const passkey = result.current.passkey;
      rerender();

      expect(result.current.passkey).toBe(passkey);
    });

    it('should throw when continueSignup is used outside Auth0Provider', () => {
      const { result } = renderHook(() => useAuth0());

      expect(result.current.passkey.continueSignup).toThrow(
        'You forgot to wrap your component in <Auth0Provider>.'
      );
    });

    it('should export PasskeyVerificationRequiredError from the SDK', () => {
      expect(sdk.PasskeyVerificationRequiredError).toBe(
        PasskeyVerificationRequiredError
      );
    });
  });

  describe('passkey.signup', () => {
    it('should return token response', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useAuth0(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      let tokenResponse: TokenEndpointResponse | undefined;
      await act(async () => {
        tokenResponse = await result.current.passkey.signup({ email: 'user@example.com' });
      });

      expect(tokenResponse).toBeDefined();
      expect(tokenResponse?.access_token).toBe('passkey-token');
      expect(tokenResponse?.id_token).toBe('passkey-id-token');
    });

    it('should dispatch state update after signup', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useAuth0(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await act(async () => {
        await result.current.passkey.signup({ email: 'user@example.com' });
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });

    it('should rethrow errors from passkey.signup', async () => {
      clientMock.passkey.signup.mockRejectedValueOnce(new Error('WebAuthn not supported'));

      const wrapper = createWrapper();
      const { result } = renderHook(() => useAuth0(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await expect(
        act(async () => {
          await result.current.passkey.signup({ email: 'user@example.com' });
        })
      ).rejects.toThrow('WebAuthn not supported');
    });

    it('should forward deliveryMethod and other options to the underlying client', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useAuth0(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await act(async () => {
        await result.current.passkey.signup({
          email: 'user@example.com',
          phoneNumber: '+14155550100',
          realm: 'Username-Password-Authentication',
          deliveryMethod: 'voice',
        });
      });

      expect(clientMock.passkey.signup).toHaveBeenCalledWith({
        email: 'user@example.com',
        phoneNumber: '+14155550100',
        realm: 'Username-Password-Authentication',
        deliveryMethod: 'voice',
      });
    });

    it('should rethrow PasskeyVerificationRequiredError unchanged when verification is required', async () => {
      clientMock.passkey.signup.mockRejectedValueOnce(
        new PasskeyVerificationRequiredError(['email'])
      );

      const wrapper = createWrapper();
      const { result } = renderHook(() => useAuth0(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      let error: unknown;
      await act(async () => {
        try {
          await result.current.passkey.signup({ email: 'user@example.com' });
        } catch (e) {
          error = e;
        }
      });

      expect(error).toBeInstanceOf(PasskeyVerificationRequiredError);
      expect(error).toBeInstanceOf(GenericError);
      expect((error as PasskeyVerificationRequiredError).error).toBe(
        'verification_required'
      );
      expect(
        (error as PasskeyVerificationRequiredError).verificationRequired
      ).toEqual(['email']);
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeUndefined();
    });

    it('should expose every identifier that requires verification', async () => {
      clientMock.passkey.signup.mockRejectedValueOnce(
        new PasskeyVerificationRequiredError(['email', 'phone'])
      );

      const wrapper = createWrapper();
      const { result } = renderHook(() => useAuth0(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await expect(
        act(async () => {
          await result.current.passkey.signup({
            email: 'user@example.com',
            phoneNumber: '+14155550100',
          });
        })
      ).rejects.toMatchObject({ verificationRequired: ['email', 'phone'] });
    });

    it('should update isAuthenticated and user after a successful signup', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useAuth0(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(result.current.isAuthenticated).toBe(false);

      clientMock.getUser.mockResolvedValue(user);
      await act(async () => {
        await result.current.passkey.signup({ email: 'user@example.com' });
      });

      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user).toEqual(user);
    });
  });

  describe('passkey.continueSignup', () => {
    it('should forward the OTP codes and return the token response', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useAuth0(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      let tokenResponse: TokenEndpointResponse | undefined;
      await act(async () => {
        tokenResponse = await result.current.passkey.continueSignup({
          email: '123456',
        });
      });

      expect(clientMock.passkey.continueSignup).toHaveBeenCalledWith({
        email: '123456',
      });
      expect(tokenResponse?.access_token).toBe('passkey-token');
      expect(tokenResponse?.id_token).toBe('passkey-id-token');
    });

    it('should forward codes for both email and phone', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useAuth0(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await act(async () => {
        await result.current.passkey.continueSignup({
          email: '123456',
          phone: '654321',
        });
      });

      expect(clientMock.passkey.continueSignup).toHaveBeenCalledWith({
        email: '123456',
        phone: '654321',
      });
    });

    it('should update isAuthenticated and user after a successful continueSignup', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useAuth0(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(result.current.isAuthenticated).toBe(false);

      clientMock.getUser.mockResolvedValue(user);
      await act(async () => {
        await result.current.passkey.continueSignup({ email: '123456' });
      });

      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user).toEqual(user);
    });

    it('should complete the step-up flow from signup to continueSignup', async () => {
      clientMock.passkey.signup.mockRejectedValueOnce(
        new PasskeyVerificationRequiredError(['email'])
      );

      const wrapper = createWrapper();
      const { result } = renderHook(() => useAuth0(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      let required: string[] = [];
      await act(async () => {
        try {
          await result.current.passkey.signup({ email: 'user@example.com' });
        } catch (e) {
          required = (e as PasskeyVerificationRequiredError)
            .verificationRequired;
        }
      });

      expect(required).toEqual(['email']);
      expect(result.current.isAuthenticated).toBe(false);

      clientMock.getUser.mockResolvedValue(user);
      await act(async () => {
        await result.current.passkey.continueSignup({ email: '123456' });
      });

      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user).toEqual(user);
    });

    it('should rethrow a retryable PasskeyGetTokenError unchanged when an OTP code is wrong', async () => {
      clientMock.passkey.continueSignup.mockRejectedValueOnce(
        retryableError(['email'])
      );

      const wrapper = createWrapper();
      const { result } = renderHook(() => useAuth0(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      let error: unknown;
      await act(async () => {
        try {
          await result.current.passkey.continueSignup({ email: '000000' });
        } catch (e) {
          error = e;
        }
      });

      expect(error).toBeInstanceOf(PasskeyGetTokenError);
      const tokenError = error as PasskeyGetTokenError;
      expect(tokenError.isRetryable).toBe(true);
      expect(tokenError.authSession).toBe('auth-session-a');
      expect(tokenError.verificationRequired).toEqual(['email']);
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeUndefined();
    });

    it('should list every identifier whose code was wrong', async () => {
      clientMock.passkey.continueSignup.mockRejectedValueOnce(
        retryableError(['email', 'phone'])
      );

      const wrapper = createWrapper();
      const { result } = renderHook(() => useAuth0(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await expect(
        act(async () => {
          await result.current.passkey.continueSignup({
            email: '000000',
            phone: '000000',
          });
        })
      ).rejects.toMatchObject({
        isRetryable: true,
        verificationRequired: ['email', 'phone'],
      });
    });

    it('should authenticate when a retry with the corrected code succeeds', async () => {
      clientMock.passkey.continueSignup.mockRejectedValueOnce(
        retryableError(['phone'])
      );

      const wrapper = createWrapper();
      const { result } = renderHook(() => useAuth0(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      let required: string[] | undefined;
      await act(async () => {
        try {
          await result.current.passkey.continueSignup({
            email: '123456',
            phone: '000000',
          });
        } catch (e) {
          required = (e as PasskeyGetTokenError).verificationRequired;
        }
      });

      expect(required).toEqual(['phone']);
      expect(result.current.isAuthenticated).toBe(false);

      clientMock.getUser.mockResolvedValue(user);
      await act(async () => {
        await result.current.passkey.continueSignup({ phone: '654321' });
      });

      expect(clientMock.passkey.continueSignup).toHaveBeenCalledTimes(2);
      expect(clientMock.passkey.continueSignup).toHaveBeenNthCalledWith(2, {
        phone: '654321',
      });
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user).toEqual(user);
    });

    it('should rethrow a terminal GenericError unchanged, keeping its data', async () => {
      const terminalError = new GenericError(
        'invalid_grant',
        'Invalid or expired session',
        {
          error: 'invalid_grant',
          error_description: 'Invalid or expired session',
        }
      );
      clientMock.passkey.continueSignup.mockRejectedValueOnce(terminalError);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useAuth0(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await expect(
        act(async () => {
          await result.current.passkey.continueSignup({ email: '000000' });
        })
      ).rejects.toBe(terminalError);
      expect(terminalError).not.toBeInstanceOf(PasskeyGetTokenError);
      expect(terminalError.data).toEqual({
        error: 'invalid_grant',
        error_description: 'Invalid or expired session',
      });
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('should rethrow PasskeyError with code missing_verification_code', async () => {
      clientMock.passkey.continueSignup.mockRejectedValueOnce(
        new PasskeyError(
          'missing_verification_code',
          'Missing OTP code for: phone. Pass a code for each identifier in verificationRequired.'
        )
      );

      const wrapper = createWrapper();
      const { result } = renderHook(() => useAuth0(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await expect(
        act(async () => {
          await result.current.passkey.continueSignup({ email: '123456' });
        })
      ).rejects.toMatchObject({ code: 'missing_verification_code' });
    });

    it('should rethrow PasskeyError with code no_pending_signup', async () => {
      clientMock.passkey.continueSignup.mockRejectedValueOnce(
        new PasskeyError(
          'no_pending_signup',
          'No pending signup found. Call signup() first and catch PasskeyVerificationRequiredError.'
        )
      );

      const wrapper = createWrapper();
      const { result } = renderHook(() => useAuth0(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      let error: unknown;
      await act(async () => {
        try {
          await result.current.passkey.continueSignup({ email: '123456' });
        } catch (e) {
          error = e;
        }
      });

      expect(error).toBeInstanceOf(PasskeyError);
      expect((error as PasskeyError).code).toBe('no_pending_signup');
    });

    it('should rethrow PasskeyError with code passkey_cancelled when no credential is returned', async () => {
      clientMock.passkey.continueSignup.mockRejectedValueOnce(
        new PasskeyError(
          'passkey_cancelled',
          'Passkey creation was cancelled or no credential was returned.'
        )
      );

      const wrapper = createWrapper();
      const { result } = renderHook(() => useAuth0(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await expect(
        act(async () => {
          await result.current.passkey.continueSignup({ email: '123456' });
        })
      ).rejects.toMatchObject({ code: 'passkey_cancelled' });
    });

    it('should rethrow MfaRequiredError with its mfa_token', async () => {
      clientMock.passkey.continueSignup.mockRejectedValueOnce(
        new MfaRequiredError(
          'mfa_required',
          'Multifactor authentication required',
          'mfa-token-123',
          { challenge: [{ type: 'otp' }] }
        )
      );

      const wrapper = createWrapper();
      const { result } = renderHook(() => useAuth0(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      let error: unknown;
      await act(async () => {
        try {
          await result.current.passkey.continueSignup({ email: '123456' });
        } catch (e) {
          error = e;
        }
      });

      expect(error).toBeInstanceOf(MfaRequiredError);
      expect((error as InstanceType<typeof MfaRequiredError>).mfa_token).toBe(
        'mfa-token-123'
      );
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('should normalize a non-Error rejection into an OAuthError', async () => {
      clientMock.passkey.continueSignup.mockRejectedValueOnce({
        error: 'invalid_request',
        error_description: 'Invalid request',
      });

      const wrapper = createWrapper();
      const { result } = renderHook(() => useAuth0(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      let error: unknown;
      await act(async () => {
        try {
          await result.current.passkey.continueSignup({ phone: '654321' });
        } catch (e) {
          error = e;
        }
      });

      expect(error).toBeInstanceOf(OAuthError);
      expect((error as OAuthError).error).toBe('invalid_request');
    });

    it('should fall back to a generic error for an unknown rejection', async () => {
      clientMock.passkey.continueSignup.mockRejectedValueOnce('boom');

      const wrapper = createWrapper();
      const { result } = renderHook(() => useAuth0(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await expect(
        act(async () => {
          await result.current.passkey.continueSignup({ email: '123456' });
        })
      ).rejects.toThrow('Get access token failed');
    });
  });

  describe('passkey.login', () => {
    it('should return token response', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useAuth0(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      let tokenResponse: TokenEndpointResponse | undefined;
      await act(async () => {
        tokenResponse = await result.current.passkey.login();
      });

      expect(tokenResponse).toBeDefined();
      expect(tokenResponse?.access_token).toBe('passkey-token');
    });

    it('should forward options to the underlying client', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useAuth0(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await act(async () => {
        await result.current.passkey.login({
          realm: 'Username-Password-Authentication',
          scope: 'openid profile email',
        });
      });

      expect(clientMock.passkey.login).toHaveBeenCalledWith({
        realm: 'Username-Password-Authentication',
        scope: 'openid profile email',
      });
    });

    it('should dispatch state update after login', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useAuth0(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await act(async () => {
        await result.current.passkey.login();
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });

    it('should rethrow errors from passkey.login', async () => {
      clientMock.passkey.login.mockRejectedValueOnce(new Error('User cancelled'));

      const wrapper = createWrapper();
      const { result } = renderHook(() => useAuth0(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await expect(
        act(async () => {
          await result.current.passkey.login();
        })
      ).rejects.toThrow('User cancelled');
    });
  });

  describe('passkey granular flow', () => {
    const credential = {} as PublicKeyCredential;

    it('should forward getSignupChallenge to the underlying client', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useAuth0(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      const challenge = await result.current.passkey.getSignupChallenge({
        email: 'user@example.com',
      });

      expect(clientMock.passkey.getSignupChallenge).toHaveBeenCalledWith({
        email: 'user@example.com',
      });
      expect(challenge.authSession).toBe('signup-auth-session');
    });

    it('should forward getLoginChallenge to the underlying client', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useAuth0(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      const challenge = await result.current.passkey.getLoginChallenge({
        realm: 'Username-Password-Authentication',
      });

      expect(clientMock.passkey.getLoginChallenge).toHaveBeenCalledWith({
        realm: 'Username-Password-Authentication',
      });
      expect(challenge.authSession).toBe('login-auth-session');
    });

    it('should update isAuthenticated and user after getTokenWithPasskey', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useAuth0(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(result.current.isAuthenticated).toBe(false);

      clientMock.getUser.mockResolvedValue(user);
      let tokenResponse: TokenEndpointResponse | undefined;
      await act(async () => {
        tokenResponse = await result.current.passkey.getTokenWithPasskey({
          authSession: 'login-auth-session',
          credential,
        });
      });

      expect(clientMock.passkey.getTokenWithPasskey).toHaveBeenCalledWith({
        authSession: 'login-auth-session',
        credential,
      });
      expect(tokenResponse?.access_token).toBe('passkey-token');
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user).toEqual(user);
    });

    it('should rethrow errors from getTokenWithPasskey', async () => {
      clientMock.passkey.getTokenWithPasskey.mockRejectedValueOnce(
        new PasskeyError('passkey_invalid_credential', 'Invalid credential')
      );

      const wrapper = createWrapper();
      const { result } = renderHook(() => useAuth0(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await expect(
        act(async () => {
          await result.current.passkey.getTokenWithPasskey({
            authSession: 'login-auth-session',
            credential,
          });
        })
      ).rejects.toThrow('Invalid credential');
    });

    it('should throw when the granular methods are used outside Auth0Provider', () => {
      const { result } = renderHook(() => useAuth0());

      expect(result.current.passkey.getSignupChallenge).toThrow(
        'You forgot to wrap your component in <Auth0Provider>.'
      );
      expect(result.current.passkey.getLoginChallenge).toThrow(
        'You forgot to wrap your component in <Auth0Provider>.'
      );
      expect(result.current.passkey.getTokenWithPasskey).toThrow(
        'You forgot to wrap your component in <Auth0Provider>.'
      );
    });

    it('should not change auth state when requesting a challenge', async () => {
      clientMock.passkey.getSignupChallenge.mockResolvedValueOnce({
        authSession: 'signup-auth-session',
        publicKey: {} as PublicKeyCredentialCreationOptions,
        verificationRequired: ['email'],
      });

      const wrapper = createWrapper();
      const { result } = renderHook(() => useAuth0(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      clientMock.getUser.mockResolvedValue(user);
      let challenge;
      await act(async () => {
        challenge = await result.current.passkey.getSignupChallenge({
          email: 'user@example.com',
        });
      });

      expect(challenge).toMatchObject({ verificationRequired: ['email'] });
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeUndefined();
    });

    it('should forward verification codes to getTokenWithPasskey', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useAuth0(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await act(async () => {
        await result.current.passkey.getTokenWithPasskey({
          authSession: 'signup-auth-session',
          credential,
          verification: { email: '123456', phone: '654321' },
        });
      });

      expect(clientMock.passkey.getTokenWithPasskey).toHaveBeenCalledWith({
        authSession: 'signup-auth-session',
        credential,
        verification: { email: '123456', phone: '654321' },
      });
    });

    it('should rethrow a retryable PasskeyGetTokenError unchanged so the same credential can be retried', async () => {
      clientMock.passkey.getTokenWithPasskey.mockRejectedValueOnce(
        retryableError(['email'])
      );

      const wrapper = createWrapper();
      const { result } = renderHook(() => useAuth0(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      let error: unknown;
      await act(async () => {
        try {
          await result.current.passkey.getTokenWithPasskey({
            authSession: 'signup-auth-session',
            credential,
            verification: { email: '000000' },
          });
        } catch (e) {
          error = e;
        }
      });

      expect(error).toBeInstanceOf(PasskeyGetTokenError);
      const tokenError = error as PasskeyGetTokenError;
      expect(tokenError.isRetryable).toBe(true);
      expect(tokenError.authSession).toBe('auth-session-a');
      expect(tokenError.verificationRequired).toEqual(['email']);
      expect(result.current.isAuthenticated).toBe(false);

      clientMock.getUser.mockResolvedValue(user);
      await act(async () => {
        await result.current.passkey.getTokenWithPasskey({
          authSession: tokenError.authSession!,
          credential,
          verification: { email: '123456' },
        });
      });

      expect(clientMock.passkey.getTokenWithPasskey).toHaveBeenLastCalledWith({
        authSession: 'auth-session-a',
        credential,
        verification: { email: '123456' },
      });
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user).toEqual(user);
    });
  });
});
