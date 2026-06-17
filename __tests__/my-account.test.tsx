import { renderHook, waitFor } from '@testing-library/react';
import { Auth0Client, MyAccountApiError } from '@auth0/auth0-spa-js';
import useAuth0 from '../src/use-auth0';
import { createWrapper } from './helpers';

const clientMock = jest.mocked(new Auth0Client({ clientId: '', domain: '' }));

describe('MyAccount API', () => {
  describe('Basic Availability', () => {
    it('should provide myAccount client through useAuth0', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useAuth0(), { wrapper });

      await waitFor(() => {
        expect(result.current.myAccount).toBeDefined();
      });
    });

    it('should provide all seven MyAccount methods', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useAuth0(), { wrapper });

      await waitFor(() => {
        expect(result.current.myAccount.getFactors).toBeDefined();
        expect(result.current.myAccount.getAuthenticationMethods).toBeDefined();
        expect(result.current.myAccount.getAuthenticationMethod).toBeDefined();
        expect(result.current.myAccount.updateAuthenticationMethod).toBeDefined();
        expect(result.current.myAccount.deleteAuthenticationMethod).toBeDefined();
        expect(result.current.myAccount.enrollmentChallenge).toBeDefined();
        expect(result.current.myAccount.enrollmentVerify).toBeDefined();
      });
    });
  });

  describe('Method Success Tests', () => {
    it('should call myAccount.getFactors', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useAuth0(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      const factors = await result.current.myAccount.getFactors();
      expect(Array.isArray(factors)).toBe(true);
    });

    it('should call myAccount.getAuthenticationMethods without filter', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useAuth0(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      const methods = await result.current.myAccount.getAuthenticationMethods();
      expect(Array.isArray(methods)).toBe(true);
    });

    it('should call myAccount.getAuthenticationMethods with type filter', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useAuth0(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      const methods = await result.current.myAccount.getAuthenticationMethods('passkey');
      expect(Array.isArray(methods)).toBe(true);
      expect(clientMock.myAccount.getAuthenticationMethods).toHaveBeenCalledWith('passkey');
    });

    it('should call myAccount.getAuthenticationMethod', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useAuth0(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      const method = await result.current.myAccount.getAuthenticationMethod('test-method-id');
      expect(method.id).toBe('test-method-id');
    });

    it('should call myAccount.updateAuthenticationMethod', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useAuth0(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      const updated = await result.current.myAccount.updateAuthenticationMethod('test-method-id', { name: 'My Passkey' });
      expect(updated.id).toBe('test-method-id');
    });

    it('should call myAccount.deleteAuthenticationMethod', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useAuth0(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await expect(
        result.current.myAccount.deleteAuthenticationMethod('test-method-id')
      ).resolves.toBeUndefined();
    });

    it('should call myAccount.enrollmentChallenge', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useAuth0(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      const challenge = await result.current.myAccount.enrollmentChallenge({ type: 'totp' });
      expect(challenge.id).toBe('test-challenge-id');
      expect(challenge.auth_session).toBe('test-auth-session');
    });

    it('should call myAccount.enrollmentVerify', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useAuth0(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      const verified = await result.current.myAccount.enrollmentVerify({
        type: 'totp',
        location: 'https://example.auth0.com/enroll',
        auth_session: 'test-auth-session',
        otp_code: '123456',
      });
      expect(verified.id).toBe('test-method-id');
    });
  });

  describe('Error Handling', () => {
    it('should propagate MyAccountApiError thrown by a method', async () => {
      const error = new MyAccountApiError({
        type: 'https://auth0.com/docs/errors#insufficient-scope',
        status: 403,
        title: 'Forbidden',
        detail: 'Insufficient scope to access this resource',
      });
      clientMock.myAccount.getAuthenticationMethods.mockRejectedValueOnce(error);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useAuth0(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await expect(
        result.current.myAccount.getAuthenticationMethods()
      ).rejects.toBeInstanceOf(MyAccountApiError);
    });
  });
});
