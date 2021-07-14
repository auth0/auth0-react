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
    const user = { name: '__test_user__' };
    clientMock.getUser.mockResolvedValue(user);
    const wrapper = createWrapper();
    const { waitForNextUpdate, result } = renderHook(
      () => useContext(Auth0Context),
      { wrapper }
    );
    await waitForNextUpdate();
    expect(clientMock.checkSession).toHaveBeenCalled();
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toBe(user);
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
    window.history.pushState(
      {},
      document.title,
      '/?error=__test_error__&state=__test_state__'
    );
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

  it('should call through to buildAuthorizeUrl method', async () => {
    const wrapper = createWrapper();
    const { waitForNextUpdate, result } = renderHook(
      () => useContext(Auth0Context),
      { wrapper }
    );
    await waitForNextUpdate();
    expect(result.current.buildAuthorizeUrl).toBeInstanceOf(Function);

    await result.current.buildAuthorizeUrl({
      redirectUri: '__redirect_uri__',
    });
    expect(clientMock.buildAuthorizeUrl).toHaveBeenCalledWith({
      redirect_uri: '__redirect_uri__',
    });
  });

  it('should call through to buildLogoutUrl method', async () => {
    const wrapper = createWrapper();
    const { waitForNextUpdate, result } = renderHook(
      () => useContext(Auth0Context),
      { wrapper }
    );
    await waitForNextUpdate();
    expect(result.current.buildLogoutUrl).toBeInstanceOf(Function);

    const logoutOptions = {
      returnTo: '/',
      client_id: 'blah',
      federated: false,
    };
    result.current.buildLogoutUrl(logoutOptions);
    expect(clientMock.buildLogoutUrl).toHaveBeenCalledWith(logoutOptions);
  });

  it('should login with a popup', async () => {
    clientMock.getUser.mockResolvedValue(undefined);
    const wrapper = createWrapper();
    const { waitForNextUpdate, result } = renderHook(
      () => useContext(Auth0Context),
      { wrapper }
    );
    await waitForNextUpdate();
    expect(result.current.user).toBeUndefined();
    const user = { name: '__test_user__' };
    clientMock.getUser.mockResolvedValue(user);
    act(() => {
      result.current.loginWithPopup();
    });
    expect(result.current.isLoading).toBe(true);
    await waitForNextUpdate();
    expect(result.current.isLoading).toBe(false);
    expect(clientMock.loginWithPopup).toHaveBeenCalled();
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toBe(user);
  });

  it('should handle errors when logging in with a popup', async () => {
    clientMock.getUser.mockResolvedValue(undefined);
    const wrapper = createWrapper();
    const { waitForNextUpdate, result } = renderHook(
      () => useContext(Auth0Context),
      { wrapper }
    );
    await waitForNextUpdate();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeUndefined();
    clientMock.getUser.mockResolvedValue(undefined);
    clientMock.loginWithPopup.mockRejectedValue(new Error('__test_error__'));
    act(() => {
      result.current.loginWithPopup();
    });
    expect(result.current.isLoading).toBe(true);
    await waitForNextUpdate();
    expect(result.current.isLoading).toBe(false);
    expect(clientMock.loginWithPopup).toHaveBeenCalled();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeUndefined();
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
    const user = { name: '__test_user__' };
    clientMock.getUser.mockResolvedValue(user);
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
    expect(result.current.user).toBe(user);
  });

  it('should update state for local logouts', async () => {
    const user = { name: '__test_user__' };
    clientMock.getUser.mockResolvedValue(user);
    const wrapper = createWrapper();
    const { waitForNextUpdate, result } = renderHook(
      () => useContext(Auth0Context),
      { wrapper }
    );
    await waitForNextUpdate();
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toBe(user);
    act(() => {
      result.current.logout({ localOnly: true });
    });
    expect(clientMock.logout).toHaveBeenCalledWith({
      localOnly: true,
    });
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeUndefined();
  });

  it('should update state for local logouts with async cache', async () => {
    const user = { name: '__test_user__' };
    clientMock.getUser.mockResolvedValue(user);
    // get logout to return a Promise to simulate async cache.
    clientMock.logout.mockResolvedValue();
    const wrapper = createWrapper();
    const { waitForNextUpdate, result } = renderHook(
      () => useContext(Auth0Context),
      { wrapper }
    );
    await waitForNextUpdate();
    expect(result.current.isAuthenticated).toBe(true);
    await act(async () => {
      await result.current.logout({ localOnly: true });
    });
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should wait for logout with async cache', async () => {
    const user = { name: '__test_user__' };
    const logoutSpy = jest.fn();
    clientMock.getUser.mockResolvedValue(user);
    // get logout to return a Promise to simulate async cache.
    clientMock.logout.mockImplementation(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
      logoutSpy();
    });
    const wrapper = createWrapper();
    const { waitForNextUpdate, result } = renderHook(
      () => useContext(Auth0Context),
      { wrapper }
    );
    await waitForNextUpdate();
    expect(result.current.isAuthenticated).toBe(true);
    await act(async () => {
      await result.current.logout();
    });
    expect(logoutSpy).toHaveBeenCalled();
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
    await act(async () => {
      const token = await result.current.getAccessTokenSilently();
      expect(token).toBe('token');
    });

    expect(clientMock.getTokenSilently).toHaveBeenCalled();
  });

  it('should normalize errors from getAccessTokenSilently method', async () => {
    clientMock.getTokenSilently.mockRejectedValue(new ProgressEvent('error'));
    const wrapper = createWrapper();
    const { waitForNextUpdate, result } = renderHook(
      () => useContext(Auth0Context),
      { wrapper }
    );
    await waitForNextUpdate();
    await act(async () => {
      await expect(result.current.getAccessTokenSilently).rejects.toThrowError(
        'Get access token failed'
      );
    });
  });

  it('should call getAccessTokenSilently in the scope of the Auth0 client', async () => {
    clientMock.getTokenSilently.mockReturnThis();
    const wrapper = createWrapper();
    const { waitForNextUpdate, result } = renderHook(
      () => useContext(Auth0Context),
      { wrapper }
    );
    await waitForNextUpdate();

    await act(async () => {
      const returnedThis = await result.current.getAccessTokenSilently();
      expect(returnedThis).toStrictEqual(clientMock);
    });
  });

  it('should update auth state after getAccessTokenSilently', async () => {
    clientMock.getTokenSilently.mockReturnThis();
    clientMock.getUser.mockResolvedValue({ name: 'foo', updated_at: '1' });
    const wrapper = createWrapper();
    const { waitForNextUpdate, result } = renderHook(
      () => useContext(Auth0Context),
      { wrapper }
    );
    await waitForNextUpdate();

    expect(result.current.user?.name).toEqual('foo');
    clientMock.getUser.mockResolvedValue({ name: 'bar', updated_at: '2' });
    await act(async () => {
      await result.current.getAccessTokenSilently();
    });
    expect(result.current.user?.name).toEqual('bar');
  });

  it('should update auth state after getAccessTokenSilently fails', async () => {
    clientMock.getTokenSilently.mockReturnThis();
    clientMock.getUser.mockResolvedValue({ name: 'foo', updated_at: '1' });
    const wrapper = createWrapper();
    const { waitForNextUpdate, result } = renderHook(
      () => useContext(Auth0Context),
      { wrapper }
    );
    await waitForNextUpdate();

    expect(result.current.isAuthenticated).toBeTruthy();
    clientMock.getTokenSilently.mockRejectedValue({ error: 'login_required' });
    clientMock.getUser.mockResolvedValue(undefined);
    await act(async () => {
      await expect(() =>
        result.current.getAccessTokenSilently()
      ).rejects.toThrowError('login_required');
    });
    expect(result.current.isAuthenticated).toBeFalsy();
  });

  it('should ignore same user after getAccessTokenSilently', async () => {
    clientMock.getTokenSilently.mockReturnThis();
    clientMock.getUser.mockResolvedValue({ name: 'foo', updated_at: '1' });
    const wrapper = createWrapper();
    const { waitForNextUpdate, result } = renderHook(
      () => useContext(Auth0Context),
      { wrapper }
    );
    await waitForNextUpdate();

    const prevUser = result.current.user;
    clientMock.getUser.mockResolvedValue({ name: 'foo', updated_at: '1' });
    await act(async () => {
      await result.current.getAccessTokenSilently();
    });
    expect(result.current.user).toBe(prevUser);
  });

  it('should not update getAccessTokenSilently after auth state change', async () => {
    clientMock.getTokenSilently.mockReturnThis();
    clientMock.getUser.mockResolvedValue({ name: 'foo', updated_at: '1' });
    const wrapper = createWrapper();
    const { waitForNextUpdate, result } = renderHook(
      () => useContext(Auth0Context),
      { wrapper }
    );
    await waitForNextUpdate();
    const memoized = result.current.getAccessTokenSilently;
    expect(result.current.user?.name).toEqual('foo');
    clientMock.getUser.mockResolvedValue({ name: 'bar', updated_at: '2' });
    await act(async () => {
      await result.current.getAccessTokenSilently();
    });
    expect(result.current.user?.name).toEqual('bar');
    expect(result.current.getAccessTokenSilently).toBe(memoized);
  });

  it('should handle not having a user while calling getAccessTokenSilently', async () => {
    const token = '__test_token__';
    clientMock.getTokenSilently.mockResolvedValue(token);
    clientMock.getUser.mockResolvedValue(undefined);
    const wrapper = createWrapper();
    const { result } = renderHook(() => useContext(Auth0Context), { wrapper });
    let returnedToken;
    await act(async () => {
      returnedToken = await result.current.getAccessTokenSilently();
    });
    expect(returnedToken).toBe(token);
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
    await act(async () => {
      const token = await result.current.getAccessTokenWithPopup();
      expect(token).toBe('token');
    });
    expect(clientMock.getTokenWithPopup).toHaveBeenCalled();
  });

  it('should call getAccessTokenWithPopup in the scope of the Auth0 client', async () => {
    clientMock.getTokenWithPopup.mockReturnThis();
    const wrapper = createWrapper();
    const { waitForNextUpdate, result } = renderHook(
      () => useContext(Auth0Context),
      { wrapper }
    );
    await waitForNextUpdate();
    await act(async () => {
      const returnedThis = await result.current.getAccessTokenWithPopup();
      expect(returnedThis).toStrictEqual(clientMock);
    });
  });

  it('should update auth state after getAccessTokenWithPopup', async () => {
    clientMock.getTokenSilently.mockReturnThis();
    clientMock.getUser.mockResolvedValue({ name: 'foo', updated_at: '1' });
    const wrapper = createWrapper();
    const { waitForNextUpdate, result } = renderHook(
      () => useContext(Auth0Context),
      { wrapper }
    );
    await waitForNextUpdate();

    const prevUser = result.current.user;
    clientMock.getUser.mockResolvedValue({ name: 'foo', updated_at: '2' });
    await act(async () => {
      await result.current.getAccessTokenWithPopup();
    });
    expect(result.current.user).not.toBe(prevUser);
  });

  it('should update auth state after getAccessTokenWithPopup fails', async () => {
    clientMock.getTokenSilently.mockReturnThis();
    clientMock.getUser.mockResolvedValue({ name: 'foo', updated_at: '1' });
    const wrapper = createWrapper();
    const { waitForNextUpdate, result } = renderHook(
      () => useContext(Auth0Context),
      { wrapper }
    );
    await waitForNextUpdate();

    expect(result.current.isAuthenticated).toBeTruthy();
    clientMock.getTokenWithPopup.mockRejectedValueOnce({
      error: 'login_required',
    });
    clientMock.getUser.mockResolvedValue(undefined);
    await act(async () => {
      await expect(() =>
        result.current.getAccessTokenWithPopup()
      ).rejects.toThrowError('login_required');
    });
    expect(result.current.isAuthenticated).toBeFalsy();
  });

  it('should ignore same auth state after getAccessTokenWithPopup', async () => {
    clientMock.getTokenSilently.mockReturnThis();
    clientMock.getUser.mockResolvedValue({ name: 'foo', updated_at: '1' });
    const wrapper = createWrapper();
    const { waitForNextUpdate, result } = renderHook(
      () => useContext(Auth0Context),
      { wrapper }
    );
    await waitForNextUpdate();

    const prevState = result.current;
    clientMock.getUser.mockResolvedValue({ name: 'foo', updated_at: '1' });
    await act(async () => {
      await result.current.getAccessTokenWithPopup();
    });
    expect(result.current).toBe(prevState);
  });

  it('should normalize errors from getAccessTokenWithPopup method', async () => {
    clientMock.getTokenWithPopup.mockRejectedValue(new ProgressEvent('error'));
    const wrapper = createWrapper();
    const { waitForNextUpdate, result } = renderHook(
      () => useContext(Auth0Context),
      { wrapper }
    );
    await waitForNextUpdate();
    await act(async () => {
      await expect(result.current.getAccessTokenWithPopup).rejects.toThrowError(
        'Get access token failed'
      );
    });
  });

  it('should handle not having a user while calling getAccessTokenWithPopup', async () => {
    const token = '__test_token__';
    clientMock.getTokenWithPopup.mockResolvedValue(token);
    clientMock.getUser.mockResolvedValue(undefined);
    const wrapper = createWrapper();
    const { result } = renderHook(() => useContext(Auth0Context), { wrapper });
    let returnedToken;
    await act(async () => {
      returnedToken = await result.current.getAccessTokenWithPopup();
    });
    expect(returnedToken).toBe(token);
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

  it('should memoize the getIdTokenClaims method', async () => {
    const wrapper = createWrapper();
    const { waitForNextUpdate, result, rerender } = renderHook(
      () => useContext(Auth0Context),
      { wrapper }
    );
    await waitForNextUpdate();
    const memoized = result.current.getIdTokenClaims;
    rerender();
    expect(result.current.getIdTokenClaims).toBe(memoized);
  });

  it('should provide a handleRedirectCallback method', async () => {
    clientMock.handleRedirectCallback.mockResolvedValue({
      appState: { redirectUri: '/' },
    });
    const wrapper = createWrapper();
    const { waitForNextUpdate, result } = renderHook(
      () => useContext(Auth0Context),
      { wrapper }
    );
    await waitForNextUpdate();
    expect(result.current.handleRedirectCallback).toBeInstanceOf(Function);
    await act(async () => {
      const response = await result.current.handleRedirectCallback();
      expect(response).toStrictEqual({
        appState: {
          redirectUri: '/',
        },
      });
    });
    expect(clientMock.handleRedirectCallback).toHaveBeenCalled();
  });

  it('should call handleRedirectCallback in the scope of the Auth0 client', async () => {
    clientMock.handleRedirectCallback.mockReturnThis();
    const wrapper = createWrapper();
    const { waitForNextUpdate, result } = renderHook(
      () => useContext(Auth0Context),
      { wrapper }
    );
    await waitForNextUpdate();
    await act(async () => {
      const returnedThis = await result.current.handleRedirectCallback();
      expect(returnedThis).toStrictEqual(clientMock);
    });
  });

  it('should update auth state after handleRedirectCallback', async () => {
    clientMock.handleRedirectCallback.mockReturnThis();
    clientMock.getUser.mockResolvedValue({ name: 'foo', updated_at: '1' });
    const wrapper = createWrapper();
    const { waitForNextUpdate, result } = renderHook(
      () => useContext(Auth0Context),
      { wrapper }
    );
    await waitForNextUpdate();

    const prevUser = result.current.user;
    clientMock.getUser.mockResolvedValue({ name: 'foo', updated_at: '2' });
    await act(async () => {
      await result.current.handleRedirectCallback();
    });
    expect(result.current.user).not.toBe(prevUser);
  });

  it('should update auth state after handleRedirectCallback fails', async () => {
    clientMock.handleRedirectCallback.mockReturnThis();
    clientMock.getUser.mockResolvedValue({ name: 'foo', updated_at: '1' });
    const wrapper = createWrapper();
    const { waitForNextUpdate, result } = renderHook(
      () => useContext(Auth0Context),
      { wrapper }
    );
    await waitForNextUpdate();

    expect(result.current.isAuthenticated).toBeTruthy();
    clientMock.handleRedirectCallback.mockRejectedValueOnce({
      error: 'login_required',
    });
    clientMock.getUser.mockResolvedValue(undefined);
    await act(async () => {
      await expect(() =>
        result.current.handleRedirectCallback()
      ).rejects.toThrowError('login_required');
    });
    expect(result.current.isAuthenticated).toBeFalsy();
  });

  it('should ignore same auth state after handleRedirectCallback', async () => {
    clientMock.handleRedirectCallback.mockReturnThis();
    clientMock.getUser.mockResolvedValue({ name: 'foo', updated_at: '1' });
    const wrapper = createWrapper();
    const { waitForNextUpdate, result } = renderHook(
      () => useContext(Auth0Context),
      { wrapper }
    );
    await waitForNextUpdate();

    const prevState = result.current;
    clientMock.getUser.mockResolvedValue({ name: 'foo', updated_at: '1' });
    await act(async () => {
      await result.current.handleRedirectCallback();
    });
    expect(result.current).toBe(prevState);
  });

  it('should normalize errors from handleRedirectCallback method', async () => {
    clientMock.handleRedirectCallback.mockRejectedValue(
      new ProgressEvent('error')
    );
    const wrapper = createWrapper();
    const { waitForNextUpdate, result } = renderHook(
      () => useContext(Auth0Context),
      { wrapper }
    );
    await waitForNextUpdate();
    await act(async () => {
      await expect(result.current.handleRedirectCallback).rejects.toThrowError(
        'Get access token failed'
      );
    });
  });

  it('should handle not having a user while calling handleRedirectCallback', async () => {
    clientMock.handleRedirectCallback.mockResolvedValue({
      appState: {
        redirectUri: '/',
      },
    });
    clientMock.getUser.mockResolvedValue(undefined);
    const wrapper = createWrapper();
    const { result } = renderHook(() => useContext(Auth0Context), { wrapper });
    let returnedToken;
    await act(async () => {
      returnedToken = await result.current.handleRedirectCallback();
    });
    expect(returnedToken).toStrictEqual({
      appState: {
        redirectUri: '/',
      },
    });
  });
});
