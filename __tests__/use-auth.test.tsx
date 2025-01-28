import { act, renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { Auth0ContextInterface, initialContext } from '../src/auth0-context';
import useAuth0 from '../src/use-auth0';
import { createWrapper } from './helpers';

describe('useAuth0', () => {
  it('should provide the auth context', async () => {
    const wrapper = createWrapper();
    const {
      result: { current }
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
    } = renderHook(() => useAuth0(context), { wrapper });
    await waitFor(() => {
      expect(current).toBeDefined();
      expect(current.loginWithRedirect).not.toThrowError();
    });
  });
});
