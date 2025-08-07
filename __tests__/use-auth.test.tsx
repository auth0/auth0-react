import { Auth0Client } from '@auth0/auth0-spa-js';
import { act, renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { Auth0ContextInterface, initialContext } from '../src/auth0-context';
import useAuth0 from '../src/use-auth0';
import { createWrapper } from './helpers';

const mockClient = jest.mocked(new Auth0Client({ clientId: '', domain: '' }));

describe('useAuth0', () => {
  let wrapper: ReturnType<typeof createWrapper>;

  const TEST_AUDIENCE = 'test-audience';
  const TEST_SCOPE = 'read:data';
  const TEST_USER = { name: '__test_user__' };
  const AUDIENCE_1 = 'audience1';
  const SCOPE_1 = 'scope1';
  const AUDIENCE_2 = 'audience2';
  const SCOPE_2 = 'scope2';

  beforeEach(() => {
    jest.clearAllMocks();

    mockClient.getUser.mockResolvedValue(TEST_USER);
    mockClient.isAuthenticated.mockResolvedValue(true);
    mockClient.isAuthorized.mockResolvedValue(true);

    wrapper = createWrapper();
  });

  const expectAuthenticatedState = async (
    result: { current: Auth0ContextInterface },
    isAuthenticated = true
  ) => {
    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(isAuthenticated);
      expect(result.current.isLoading).toBe(false);
    });
  };

  it('should provide the auth context', async () => {
    const {
      result: { current },
    } = renderHook(() => useAuth0(), { wrapper });
    await waitFor(() => {
      expect(current).toBeDefined();
    });
  });

  it('should throw with no provider', () => {
    const {
      result: { current },
    } = renderHook(() => useAuth0());
    expect(current.loginWithRedirect).toThrowError(
      'You forgot to wrap your component in <Auth0Provider>.'
    );
  });

  it('should throw when context is not associated with provider', async () => {
    const context = React.createContext<Auth0ContextInterface>(initialContext);
    const customWrapper = createWrapper({ context });
    const {
      result: { current },
    } = renderHook(() => useAuth0(), { wrapper: customWrapper });
    await act(async () => {
      expect(current.loginWithRedirect).toThrowError(
        'You forgot to wrap your component in <Auth0Provider>.'
      );
    });
  });

  it('should accept custom auth context', async () => {
    const context = React.createContext<Auth0ContextInterface>(initialContext);
    const customWrapper = createWrapper({ context });
    const {
      result: { current },
    } = renderHook(() => useAuth0(context), { wrapper: customWrapper });
    await waitFor(() => {
      expect(current).toBeDefined();
      expect(current.loginWithRedirect).not.toThrowError();
    });
  });

  it('should handle audience and scope options', async () => {
    const { result } = renderHook(
      () => useAuth0(undefined, { audience: TEST_AUDIENCE, scope: TEST_SCOPE }),
      { wrapper }
    );

    await expectAuthenticatedState(result);

    expect(mockClient.isAuthorized).toHaveBeenCalledWith({
      audience: TEST_AUDIENCE,
      scope: TEST_SCOPE,
    });
  });

  it('should set isAuthenticated to false when isAuthorized returns false', async () => {
    mockClient.isAuthorized.mockResolvedValue(false);

    const { result } = renderHook(
      () => useAuth0(undefined, { audience: TEST_AUDIENCE, scope: TEST_SCOPE }),
      { wrapper }
    );

    await expectAuthenticatedState(result, false);

    expect(mockClient.isAuthorized).toHaveBeenCalledWith({
      audience: TEST_AUDIENCE,
      scope: TEST_SCOPE,
    });
  });

  it('should not call isAuthorized when user is not authenticated', async () => {
    mockClient.getUser.mockResolvedValue(undefined);
    mockClient.isAuthenticated.mockResolvedValue(false);

    const { result } = renderHook(
      () => useAuth0(undefined, { audience: TEST_AUDIENCE, scope: TEST_SCOPE }),
      { wrapper }
    );

    await expectAuthenticatedState(result, false);

    expect(mockClient.isAuthorized).not.toHaveBeenCalled();
  });

  it('should not call isAuthorized when no audience or scope provided', async () => {
    const { result } = renderHook(() => useAuth0(), { wrapper });

    await expectAuthenticatedState(result);

    expect(mockClient.isAuthorized).not.toHaveBeenCalled();
  });

  it('should show loading state during auth check', async () => {
    mockClient.isAuthorized.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(true), 100))
    );

    const { result } = renderHook(
      () => useAuth0(undefined, { audience: TEST_AUDIENCE }),
      { wrapper }
    );

    expect(result.current.isLoading).toBe(true);

    await expectAuthenticatedState(result);
  });

  it('should re-check authorization when dependencies change', async () => {
    const { result, rerender } = renderHook(
      ({ audience, scope }) => useAuth0(undefined, { audience, scope }),
      {
        wrapper,
        initialProps: { audience: AUDIENCE_1, scope: SCOPE_1 },
      }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockClient.isAuthorized).toHaveBeenCalledWith({
      audience: AUDIENCE_1,
      scope: SCOPE_1,
    });

    rerender({ audience: AUDIENCE_2, scope: SCOPE_2 });

    await waitFor(() => {
      expect(mockClient.isAuthorized).toHaveBeenCalledWith({
        audience: AUDIENCE_2,
        scope: SCOPE_2,
      });
    });

    expect(mockClient.isAuthorized).toHaveBeenCalledTimes(2);
  });
});
