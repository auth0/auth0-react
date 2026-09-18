import { Auth0Client, AnonymousSession } from '@auth0/auth0-spa-js';
import { act, renderHook, waitFor } from '@testing-library/react';
import useAuth0 from '../src/use-auth0';
import { createWrapper } from './helpers';

const clientMock = jest.mocked(new Auth0Client({ clientId: '', domain: '' }));

describe('Anonymous Session API', () => {
  describe('Basic Availability', () => {
    it('should provide anonymous client through useAuth0', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useAuth0(), { wrapper });

      await waitFor(() => {
        expect(result.current.anonymous).toBeDefined();
      });
    });

    it('should provide all anonymous methods', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useAuth0(), { wrapper });

      await waitFor(() => {
        expect(result.current.anonymous.createSession).toBeDefined();
        expect(result.current.anonymous.getTokenSilently).toBeDefined();
        expect(result.current.anonymous.logout).toBeDefined();
        expect(result.current.anonymous.hasSession).toBeDefined();
        expect(result.current.anonymous.getClaims).toBeDefined();
      });
    });
  });

  describe('anonymous.getTokenSilently', () => {
    it('should return an access token', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useAuth0(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      let tokenResult: { accessToken: string; expiresAt: number } | undefined;
      await act(async () => {
        tokenResult = await result.current.anonymous.getTokenSilently({ audience: 'https://api.example.com' });
      });

      expect(tokenResult).toBeDefined();
      expect(tokenResult?.accessToken).toBe('anon-access-token');
    });

    it('should forward options to the underlying client', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useAuth0(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await act(async () => {
        await result.current.anonymous.getTokenSilently({ audience: 'https://api.example.com', scope: 'read:data' });
      });

      expect(clientMock.anonymous.getTokenSilently).toHaveBeenCalledWith({
        audience: 'https://api.example.com',
        scope: 'read:data',
      });
    });

    it('should rethrow errors from getTokenSilently', async () => {
      clientMock.anonymous.getTokenSilently.mockRejectedValueOnce(new Error('session_expired'));

      const wrapper = createWrapper();
      const { result } = renderHook(() => useAuth0(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await expect(
        act(async () => {
          await result.current.anonymous.getTokenSilently({ audience: 'https://api.example.com' });
        })
      ).rejects.toThrow('session_expired');
    });
  });

  describe('anonymous.createSession', () => {
    it('should return an anonymous session', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useAuth0(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      let session: AnonymousSession | undefined;
      await act(async () => {
        session = await result.current.anonymous.createSession();
      });

      expect(session).toBeDefined();
      expect(session?.accessToken).toBe('anon-access-token');
    });

    it('should forward metadata options', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useAuth0(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await act(async () => {
        await result.current.anonymous.createSession({ metadata: { cart: 'cart-123' } });
      });

      expect(clientMock.anonymous.createSession).toHaveBeenCalledWith({ metadata: { cart: 'cart-123' } });
    });

    it('should rethrow errors from createSession', async () => {
      clientMock.anonymous.createSession.mockRejectedValueOnce(new Error('session_token_present'));

      const wrapper = createWrapper();
      const { result } = renderHook(() => useAuth0(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await expect(
        act(async () => {
          await result.current.anonymous.createSession();
        })
      ).rejects.toThrow('session_token_present');
    });
  });

  describe('anonymous.logout', () => {
    it('should call logout on the underlying client', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useAuth0(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await act(async () => {
        await result.current.anonymous.logout();
      });

      expect(clientMock.anonymous.logout).toHaveBeenCalled();
    });

    it('should rethrow errors from logout', async () => {
      clientMock.anonymous.logout.mockRejectedValueOnce(new Error('logout_failed'));

      const wrapper = createWrapper();
      const { result } = renderHook(() => useAuth0(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await expect(
        act(async () => {
          await result.current.anonymous.logout();
        })
      ).rejects.toThrow('logout_failed');
    });
  });

  describe('anonymous.hasSession', () => {
    it('should return false when no session exists', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useAuth0(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.anonymous.hasSession()).toBe(false);
    });

    it('should return true when a session exists', async () => {
      clientMock.anonymous.hasSession.mockReturnValueOnce(true);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useAuth0(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.anonymous.hasSession()).toBe(true);
    });
  });

  describe('anonymous.getClaims', () => {
    it('should return null in EA', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useAuth0(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.anonymous.getClaims()).toBeNull();
    });
  });
});
