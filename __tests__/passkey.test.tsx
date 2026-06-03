import { Auth0Client } from '@auth0/auth0-spa-js';
import { act, renderHook, waitFor } from '@testing-library/react';
import useAuth0 from '../src/use-auth0';
import { createWrapper } from './helpers';

const clientMock = jest.mocked(new Auth0Client({ clientId: '', domain: '' }));

describe('Passkey API', () => {
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
      });
    });
  });

  describe('passkey.signup', () => {
    it('should return token response', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useAuth0(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      let tokenResponse: any;
      await act(async () => {
        tokenResponse = await result.current.passkey.signup({ email: 'user@example.com' });
      });

      expect(tokenResponse).toBeDefined();
      expect(tokenResponse.access_token).toBe('passkey-token');
      expect(tokenResponse.id_token).toBe('passkey-id-token');
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
  });

  describe('passkey.login', () => {
    it('should return token response', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useAuth0(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      let tokenResponse: any;
      await act(async () => {
        tokenResponse = await result.current.passkey.login();
      });

      expect(tokenResponse).toBeDefined();
      expect(tokenResponse.access_token).toBe('passkey-token');
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
});
