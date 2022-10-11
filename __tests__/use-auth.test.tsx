import React from 'react';
import useAuth0 from '../src/use-auth0';
import { act, renderHook } from '@testing-library/react-hooks';
import { createWrapper } from './helpers';
import { Auth0ContextInterface, initialContext } from '../src/auth0-context';

describe('useAuth0', () => {
  it('should provide the auth context', async () => {
    const wrapper = createWrapper();
    const {
      result: { current },
      waitForNextUpdate,
    } = renderHook(() => useAuth0(), { wrapper });
    await waitForNextUpdate();
    expect(current).toBeDefined();
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
    const wrapper = createWrapper({ context });
    const {
      result: { current },
    } = renderHook(() => useAuth0(), { wrapper });
    await act(async () => {
      expect(current.loginWithRedirect).toThrowError(
        'You forgot to wrap your component in <Auth0Provider>.'
      );
    });
  });

  it('should accept custom auth context', async () => {
    const context = React.createContext<Auth0ContextInterface>(initialContext);
    const wrapper = createWrapper({ context });
    const {
      result: { current },
      waitForNextUpdate,
    } = renderHook(() => useAuth0(context), { wrapper });
    await waitForNextUpdate();
    expect(current).toBeDefined();
    expect(current.loginWithRedirect).not.toThrowError();
  });
});
