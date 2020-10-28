import { useContext } from 'react';
import { mocked } from 'ts-jest/utils';
import Auth0Context from '../src/auth0-context';
import { renderHook, act } from '@testing-library/react-hooks';
import { Auth0Client } from '@auth0/auth0-spa-js';
import pkg from '../package.json';
import { createWrapper } from './helpers';

const clientMock = mocked(new Auth0Client({ client_id: '', domain: '' }));

describe('Auth0Provider', () => {
  afterEach(() => {
    window.history.pushState({}, document.title, '/');
  });

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
      clientId: 'foo',
      domain: 'bar',
      redirectUri: 'baz',
      maxAge: 'qux',
      extra_param: '__test_extra_param__',
    };
    const wrapper = createWrapper(opts);
    const { waitForNextUpdate } = renderHook(() => useContext(Auth0Context), {
      wrapper,
    });
    expect(Auth0Client).toHaveBeenCalledWith(
      expect.objectContaining({
        client_id: 'foo',
        domain: 'bar',
        redirect_uri: 'baz',
        max_age: 'qux',
        extra_param: '__test_extra_param__',
      })
    );
    await waitForNextUpdate();
  });

  it('should pass user agent to Auth0Client', async () => {
    const opts = {
      clientId: 'foo',
      domain: 'bar',
    };
    const wrapper = createWrapper(opts);
    const { waitForNextUpdate } = renderHook(() => useContext(Auth0Context), {
      wrapper,
    });
    expect(Auth0Client).toHaveBeenCalledWith(
      expect.objectContaining({
        auth0Client: {
          name: 'auth0-react',
          version: pkg.version,
        },
      })
    );
    await waitForNextUpdate();
  });

  it('should check session when logged out', async () => {
    const wrapper = createWrapper();
    const { waitForNextUpdate, result } = renderHook(
      () => useContext(Auth0Context),
      { wrapper }
    );
    expect(result.current.isLoading).toBe(true);
    await waitForNextUpdate();
    expect(result.current.isLoading).toBe(false);
    expect(clientMock.checkSession).toHaveBeenCalled();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should check session when logged in', async () => {
    clientMock.getUser.mockResolvedValue('__test_user__');
    const wrapper = createWrapper();
    const { waitForNextUpdate, result } = renderHook(
      () => useContext(Auth0Context),
      { wrapper }
    );
    await waitForNextUpdate();
    expect(clientMock.checkSession).toHaveBeenCalled();
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toBe('__test_user__');
  });

  it('should handle errors when checking session', async () => {
    clientMock.checkSession.mockRejectedValueOnce({
      error: '__test_error__',
      error_description: '__test_error_description__',
    });
    const wrapper = createWrapper();
    const { waitForNextUpdate, result } = renderHook(
      () => useContext(Auth0Context),
      { wrapper }
    );
    await waitForNextUpdate();
    expect(clientMock.checkSession).toHaveBeenCalled();
    expect(() => {
      throw result.current.error;
    }).toThrowError('__test_error_description__');
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
    clientMock.handleRedirectCallback.mockResolvedValueOnce({
      appState: undefined,
    });
    const wrapper = createWrapper();
    const { waitForNextUpdate } = renderHook(() => useContext(Auth0Context), {
      wrapper,
    });
    await waitForNextUpdate();
    expect(clientMock.handleRedirectCallback).toHaveBeenCalled();
    expect(window.location.href).toBe('https://www.example.com/');
  });

  it('should handle redirect callback success and return to app state param', async () => {
    window.history.pushState(
      {},
      document.title,
      '/?code=__test_code__&state=__test_state__'
    );
    expect(window.location.href).toBe(
      'https://www.example.com/?code=__test_code__&state=__test_state__'
    );
    clientMock.handleRedirectCallback.mockResolvedValueOnce({
      appState: { returnTo: '/foo' },
    });
    const wrapper = createWrapper();
    const { waitForNextUpdate } = renderHook(() => useContext(Auth0Context), {
      wrapper,
    });
    await waitForNextUpdate();
    expect(clientMock.handleRedirectCallback).toHaveBeenCalled();
    expect(window.location.href).toBe('https://www.example.com/foo');
  });

  it('should handle redirect callback errors', async () => {
    window.history.pushState({}, document.title, '/?error=__test_error__');
    clientMock.handleRedirectCallback.mockRejectedValue(
      new Error('__test_error__')
    );
    const wrapper = createWrapper();
    const { waitForNextUpdate, result } = renderHook(
      () => useContext(Auth0Context),
      { wrapper }
    );
    await waitForNextUpdate();
    expect(clientMock.handleRedirectCallback).toHaveBeenCalled();
    expect(() => {
      throw result.current.error;
    }).toThrowError('__test_error__');
  });

  it('should handle redirect and call a custom handler', async () => {
    window.history.pushState(
      {},
      document.title,
      '/?code=__test_code__&state=__test_state__'
    );
    clientMock.handleRedirectCallback.mockResolvedValue({
      appState: { foo: 'bar' },
    });
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

  it('should skip redirect callback for non auth0 redirect callback handlers', async () => {
    clientMock.isAuthenticated.mockResolvedValue(true);
    window.history.pushState(
      {},
      document.title,
      '/?code=__some_non_auth0_code__&state=__test_state__'
    );
    clientMock.handleRedirectCallback.mockRejectedValue(
      new Error('__test_error__')
    );
    const wrapper = createWrapper({
      skipRedirectCallback: true,
    });
    const { waitForNextUpdate, result } = renderHook(
      () => useContext(Auth0Context),
      { wrapper }
    );
    await waitForNextUpdate();
    expect(clientMock.handleRedirectCallback).not.toHaveBeenCalled();
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.error).not.toBeDefined();
  });

  it('should login with a popup', async () => {
    clientMock.getUser.mockResolvedValue(false);
    const wrapper = createWrapper();
    const { waitForNextUpdate, result } = renderHook(
      () => useContext(Auth0Context),
      { wrapper }
    );
    await waitForNextUpdate();
    expect(result.current.user).toBe(false);
    clientMock.getUser.mockResolvedValue('__test_user__');
    act(() => {
      result.current.loginWithPopup();
    });
    expect(result.current.isLoading).toBe(true);
    await waitForNextUpdate();
    expect(result.current.isLoading).toBe(false);
    expect(clientMock.loginWithPopup).toHaveBeenCalled();
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toBe('__test_user__');
  });

  it('should handle errors when logging in with a popup', async () => {
    clientMock.getUser.mockResolvedValue(false);
    const wrapper = createWrapper();
    const { waitForNextUpdate, result } = renderHook(
      () => useContext(Auth0Context),
      { wrapper }
    );
    await waitForNextUpdate();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBe(false);
    clientMock.getUser.mockResolvedValue(false);
    clientMock.loginWithPopup.mockRejectedValue(new Error('__test_error__'));
    act(() => {
      result.current.loginWithPopup();
    });
    expect(result.current.isLoading).toBe(true);
    await waitForNextUpdate();
    expect(result.current.isLoading).toBe(false);
    expect(clientMock.loginWithPopup).toHaveBeenCalled();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBe(false);
    expect(() => {
      throw result.current.error;
    }).toThrowError('__test_error__');
  });

  it('should provide a login method', async () => {
    const wrapper = createWrapper();
    const { waitForNextUpdate, result } = renderHook(
      () => useContext(Auth0Context),
      { wrapper }
    );
    await waitForNextUpdate();
    expect(result.current.loginWithRedirect).toBeInstanceOf(Function);
    await result.current.loginWithRedirect({
      redirectUri: '__redirect_uri__',
    });
    expect(clientMock.loginWithRedirect).toHaveBeenCalledWith({
      redirect_uri: '__redirect_uri__',
    });
  });

  it('should provide a logout method', async () => {
    clientMock.getUser.mockResolvedValue('__test_user__');
    const wrapper = createWrapper();
    const { waitForNextUpdate, result } = renderHook(
      () => useContext(Auth0Context),
      { wrapper }
    );
    await waitForNextUpdate();
    expect(result.current.logout).toBeInstanceOf(Function);
    act(() => {
      result.current.logout();
    });
    expect(clientMock.logout).toHaveBeenCalled();
    // Should not update state until returned from idp
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toBe('__test_user__');
  });

  it('should update state for local logouts', async () => {
    clientMock.getUser.mockResolvedValue('__test_user__');
    const wrapper = createWrapper();
    const { waitForNextUpdate, result } = renderHook(
      () => useContext(Auth0Context),
      { wrapper }
    );
    await waitForNextUpdate();
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toBe('__test_user__');
    act(() => {
      result.current.logout({ localOnly: true });
    });
    expect(clientMock.logout).toHaveBeenCalledWith({
      localOnly: true,
    });
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeUndefined();
  });

  it('should provide a getAccessTokenSilently method', async () => {
    clientMock.getTokenSilently.mockResolvedValue('token');
    const wrapper = createWrapper();
    const { waitForNextUpdate, result } = renderHook(
      () => useContext(Auth0Context),
      { wrapper }
    );
    await waitForNextUpdate();
    expect(result.current.getAccessTokenSilently).toBeInstanceOf(Function);
    const token = await result.current.getAccessTokenSilently();
    expect(clientMock.getTokenSilently).toHaveBeenCalled();
    expect(token).toBe('token');
  });

  it('should normalize errors from getAccessTokenSilently method', async () => {
    clientMock.getTokenSilently.mockRejectedValue(new ProgressEvent('error'));
    const wrapper = createWrapper();
    const { waitForNextUpdate, result } = renderHook(
      () => useContext(Auth0Context),
      { wrapper }
    );
    await waitForNextUpdate();
    expect(result.current.getAccessTokenSilently).rejects.toThrowError(
      'Get access token failed'
    );
  });

  it('should call getAccessTokenSilently in the scope of the Auth0 client', async () => {
    clientMock.getTokenSilently.mockReturnThis();
    const wrapper = createWrapper();
    const { waitForNextUpdate, result } = renderHook(
      () => useContext(Auth0Context),
      { wrapper }
    );
    await waitForNextUpdate();
    const returnedThis = await result.current.getAccessTokenSilently();
    expect(returnedThis).toStrictEqual(clientMock);
  });

  it('should provide a getAccessTokenWithPopup method', async () => {
    clientMock.getTokenWithPopup.mockResolvedValue('token');
    const wrapper = createWrapper();
    const { waitForNextUpdate, result } = renderHook(
      () => useContext(Auth0Context),
      { wrapper }
    );
    await waitForNextUpdate();
    expect(result.current.getAccessTokenWithPopup).toBeInstanceOf(Function);
    const token = await result.current.getAccessTokenWithPopup();
    expect(clientMock.getTokenWithPopup).toHaveBeenCalled();
    expect(token).toBe('token');
  });

  it('should call getAccessTokenWithPopup in the scope of the Auth0 client', async () => {
    clientMock.getTokenWithPopup.mockReturnThis();
    const wrapper = createWrapper();
    const { waitForNextUpdate, result } = renderHook(
      () => useContext(Auth0Context),
      { wrapper }
    );
    await waitForNextUpdate();
    const returnedThis = await result.current.getAccessTokenWithPopup();
    expect(returnedThis).toStrictEqual(clientMock);
  });

  it('should normalize errors from getAccessTokenWithPopup method', async () => {
    clientMock.getTokenWithPopup.mockRejectedValue(new ProgressEvent('error'));
    const wrapper = createWrapper();
    const { waitForNextUpdate, result } = renderHook(
      () => useContext(Auth0Context),
      { wrapper }
    );
    await waitForNextUpdate();
    expect(result.current.getAccessTokenWithPopup).rejects.toThrowError(
      'Get access token failed'
    );
  });

  it('should provide a getIdTokenClaims method', async () => {
    clientMock.getIdTokenClaims.mockResolvedValue({
      claim: '__test_claim__',
      __raw: '__test_raw_token__',
    });
    const wrapper = createWrapper();
    const { waitForNextUpdate, result } = renderHook(
      () => useContext(Auth0Context),
      { wrapper }
    );
    await waitForNextUpdate();
    expect(result.current.getIdTokenClaims).toBeInstanceOf(Function);
    const claims = await result.current.getIdTokenClaims();
    expect(clientMock.getIdTokenClaims).toHaveBeenCalled();
    expect(claims).toStrictEqual({
      claim: '__test_claim__',
      __raw: '__test_raw_token__',
    });
  });
});
