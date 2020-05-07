import { useContext } from 'react';
import Auth0Context from '../src/auth0-context';
import { renderHook } from '@testing-library/react-hooks';
import {
  Auth0Client,
  // @ts-ignore
  getTokenSilently,
  // @ts-ignore
  isAuthenticated,
  // @ts-ignore
  getUser,
  // @ts-ignore
  handleRedirectCallback,
  // @ts-ignore
  loginWithRedirect,
  // @ts-ignore
  logout,
} from '@auth0/auth0-spa-js';
import { createWrapper } from './helpers';

describe('Auth0Provider', () => {
  it('should provide the Auth0Provider result', async () => {
    const wrapper = createWrapper();
    const { result, waitForNextUpdate } = renderHook(
      () => useContext(Auth0Context),
      { wrapper }
    );
    expect(result.current).toBeDefined();
    await waitForNextUpdate();
  });

  it('should configure an instance of the Auth0Client', async () => {
    const opts = {
      client_id: 'foo',
      domain: 'bar',
    };
    const wrapper = createWrapper(opts);
    const { waitForNextUpdate } = renderHook(() => useContext(Auth0Context), {
      wrapper,
    });
    expect(Auth0Client).toHaveBeenCalledWith(opts);
    await waitForNextUpdate();
  });

  it('should get token silently when logged out', async () => {
    const wrapper = createWrapper();
    const { waitForNextUpdate, result } = renderHook(
      () => useContext(Auth0Context),
      { wrapper }
    );
    expect(result.current.isLoading).toBe(true);
    await waitForNextUpdate();
    expect(result.current.isLoading).toBe(false);
    expect(getTokenSilently).toHaveBeenCalled();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should get token silently when logged in', async () => {
    isAuthenticated.mockResolvedValue(true);
    getUser.mockResolvedValue('__test_user__');
    const wrapper = createWrapper();
    const { waitForNextUpdate, result } = renderHook(
      () => useContext(Auth0Context),
      { wrapper }
    );
    await waitForNextUpdate();
    expect(getTokenSilently).toHaveBeenCalled();
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toBe('__test_user__');
  });

  it('should handle login_required errors when getting token', async () => {
    getTokenSilently.mockRejectedValue({ error: 'login_required' });
    const wrapper = createWrapper();
    const { waitForNextUpdate, result } = renderHook(
      () => useContext(Auth0Context),
      { wrapper }
    );
    await waitForNextUpdate();
    expect(getTokenSilently).toHaveBeenCalled();
    expect(result.current.error).toBeUndefined();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should handle other errors when getting token', async () => {
    getTokenSilently.mockRejectedValue({ error: '__test_error__' });
    const wrapper = createWrapper();
    const { waitForNextUpdate, result } = renderHook(
      () => useContext(Auth0Context),
      { wrapper }
    );
    await waitForNextUpdate();
    expect(getTokenSilently).toHaveBeenCalled();
    expect(result.current.error).toStrictEqual({ error: '__test_error__' });
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should handle redirect callback success and clear the url', async () => {
    window.history.pushState(
      {},
      document.title,
      '/?code=__test_code__&state=__test_state__'
    );
    expect(window.location.href).toBe(
      'https://www.example.com/?code=__test_code__&state=__test_state__'
    );
    const wrapper = createWrapper();
    const { waitForNextUpdate } = renderHook(() => useContext(Auth0Context), {
      wrapper,
    });
    await waitForNextUpdate();
    expect(handleRedirectCallback).toHaveBeenCalled();
    expect(window.location.href).toBe('https://www.example.com/');
  });

  it('should handle redirect callback errors', async () => {
    window.history.pushState({}, document.title, '/?error=__test_error__');
    handleRedirectCallback.mockRejectedValue('__test_error__');
    const wrapper = createWrapper();
    const { waitForNextUpdate, result } = renderHook(
      () => useContext(Auth0Context),
      { wrapper }
    );
    await waitForNextUpdate();
    expect(handleRedirectCallback).toHaveBeenCalled();
    expect(result.current.error).toStrictEqual('__test_error__');
  });

  it('should handle redirect and call a custom handler', async () => {
    window.history.pushState(
      {},
      document.title,
      '/?code=__test_code__&state=__test_state__'
    );
    handleRedirectCallback.mockResolvedValue({ appState: { foo: 'bar' } });
    const onRedirectCallback = jest.fn();
    const wrapper = createWrapper({
      onRedirectCallback,
    });
    const { waitForNextUpdate } = renderHook(() => useContext(Auth0Context), {
      wrapper,
    });
    await waitForNextUpdate();
    expect(onRedirectCallback).toHaveBeenCalledWith({ foo: 'bar' });
  });

  it('should provide a login method', async () => {
    const wrapper = createWrapper();
    const { waitForNextUpdate, result } = renderHook(
      () => useContext(Auth0Context),
      { wrapper }
    );
    await waitForNextUpdate();
    expect(result.current.login).toBeInstanceOf(Function);
    await result.current.login({ redirect_uri: '__redirect_uri__' });
    expect(loginWithRedirect).toHaveBeenCalledWith({
      redirect_uri: '__redirect_uri__',
    });
  });

  it('should provide a logout method', async () => {
    const wrapper = createWrapper();
    const { waitForNextUpdate, result } = renderHook(
      () => useContext(Auth0Context),
      { wrapper }
    );
    await waitForNextUpdate();
    expect(result.current.logout).toBeInstanceOf(Function);
    await result.current.logout({ returnTo: '__return_to__' });
    expect(logout).toHaveBeenCalledWith({
      returnTo: '__return_to__',
    });
  });

  it('should provide a getToken method', async () => {
    getTokenSilently.mockResolvedValue('token');
    const wrapper = createWrapper();
    const { waitForNextUpdate, result } = renderHook(
      () => useContext(Auth0Context),
      { wrapper }
    );
    await waitForNextUpdate();
    expect(result.current.getToken).toBeInstanceOf(Function);
    const token = await result.current.getToken();
    expect(getTokenSilently).toHaveBeenCalled();
    expect(token).toBe('token');
  });
});
