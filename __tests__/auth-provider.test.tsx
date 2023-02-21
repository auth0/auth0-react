import '@testing-library/jest-dom/extend-expect';
import React, { StrictMode, useContext } from 'react';
import Auth0Context, {
  Auth0ContextInterface,
  initialContext,
} from '../src/auth0-context';
import { render, screen, waitFor } from '@testing-library/react';
import { renderHook, act } from '@testing-library/react-hooks';
import {
  Auth0Client,
  GetTokenSilentlyVerboseResponse,
} from '@auth0/auth0-spa-js';
import pkg from '../package.json';
import { createWrapper } from './helpers';
import { Auth0Provider, useAuth0 } from '../src';

const clientMock = jest.mocked(new Auth0Client({ clientId: '', domain: '' }));

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
      authorizationParams: {
        redirect_uri: 'baz',
        max_age: 'qux',
        extra_param: '__test_extra_param__',
      },
    };
    const wrapper = createWrapper(opts);
    const { waitForNextUpdate } = renderHook(() => useContext(Auth0Context), {
      wrapper,
    });
    expect(Auth0Client).toHaveBeenCalledWith(
      expect.objectContaining({
        clientId: 'foo',
        domain: 'bar',
        authorizationParams: {
          redirect_uri: 'baz',
          max_age: 'qux',
          extra_param: '__test_extra_param__',
        },
      })
    );
    await waitForNextUpdate();
  });

  it('should support redirectUri', async () => {
    const opts = {
      clientId: 'foo',
      domain: 'bar',
      redirectUri: 'baz',
    };
    const wrapper = createWrapper(opts);
    const { waitForNextUpdate } = renderHook(() => useContext(Auth0Context), {
      wrapper,
    });
    expect(Auth0Client).toHaveBeenCalledWith(
      expect.objectContaining({
        clientId: 'foo',
        domain: 'bar',
        authorizationParams: {
          redirect_uri: 'baz',
        },
      })
    );
    await waitForNextUpdate();
  });

  it('should support authorizationParams.redirectUri', async () => {
    const opts = {
      clientId: 'foo',
      domain: 'bar',
      authorizationParams: {
        redirectUri: 'baz',
      },
    };
    const wrapper = createWrapper(opts);
    const { waitForNextUpdate } = renderHook(() => useContext(Auth0Context), {
      wrapper,
    });
    expect(Auth0Client).toHaveBeenCalledWith(
      expect.objectContaining({
        clientId: 'foo',
        domain: 'bar',
        authorizationParams: {
          redirect_uri: 'baz',
        },
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
    const user = { name: '__test_user__' };
    clientMock.getUser.mockResolvedValue(user);
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
    expect(onRedirectCallback).toHaveBeenCalledWith({ foo: 'bar' }, user);
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
      authorizationParams: {
        redirect_uri: '__redirect_uri__',
      },
    });
    expect(clientMock.loginWithRedirect).toHaveBeenCalledWith({
      authorizationParams: {
        redirect_uri: '__redirect_uri__',
      },
    });
  });

  it('should provide a login method supporting redirectUri', async () => {
    const wrapper = createWrapper();
    const { waitForNextUpdate, result } = renderHook(
      () => useContext(Auth0Context),
      { wrapper }
    );
    await waitForNextUpdate();
    expect(result.current.loginWithRedirect).toBeInstanceOf(Function);
    await result.current.loginWithRedirect({
      redirectUri: '__redirect_uri__',
    } as never);
    expect(clientMock.loginWithRedirect).toHaveBeenCalledWith({
      authorizationParams: {
        redirect_uri: '__redirect_uri__',
      },
    });
  });

  it('should provide a login method supporting authorizationParams.redirectUri', async () => {
    const wrapper = createWrapper();
    const { waitForNextUpdate, result } = renderHook(
      () => useContext(Auth0Context),
      { wrapper }
    );
    await waitForNextUpdate();
    expect(result.current.loginWithRedirect).toBeInstanceOf(Function);
    await result.current.loginWithRedirect({
      authorizationParams: {
        redirectUri: '__redirect_uri__',
      },
    });
    expect(clientMock.loginWithRedirect).toHaveBeenCalledWith({
      authorizationParams: {
        redirect_uri: '__redirect_uri__',
      },
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

  it('should update state when using openUrl', async () => {
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
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      await result.current.logout({ openUrl: async () => {} });
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

  it('should update state for openUrl false', async () => {
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
      result.current.logout({ openUrl: false });
    });
    expect(clientMock.logout).toHaveBeenCalledWith({
      openUrl: false,
    });
    await waitForNextUpdate();
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
    await act(async () => {
      const token = await result.current.getAccessTokenSilently();
      expect(token).toBe('token');
    });

    expect(clientMock.getTokenSilently).toHaveBeenCalled();
  });

  it('should get the full token response from getAccessTokenSilently when detailedResponse is true', async () => {
    const tokenResponse: GetTokenSilentlyVerboseResponse = {
      access_token: '123',
      id_token: '456',
      expires_in: 2,
    };
    (clientMock.getTokenSilently as jest.Mock).mockResolvedValue(tokenResponse);
    const wrapper = createWrapper();
    const { waitForNextUpdate, result } = renderHook(
      () => useContext(Auth0Context),
      { wrapper }
    );
    await waitForNextUpdate();

    await act(async () => {
      const token = await result.current.getAccessTokenSilently({
        detailedResponse: true,
      });
      expect(token).toBe(tokenResponse);
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
    clientMock.getUser.mockResolvedValue({ name: 'foo' });
    const wrapper = createWrapper();
    const { waitForNextUpdate, result } = renderHook(
      () => useContext(Auth0Context),
      { wrapper }
    );
    await waitForNextUpdate();

    expect(result.current.user?.name).toEqual('foo');
    clientMock.getUser.mockResolvedValue({ name: 'bar' });
    await act(async () => {
      await result.current.getAccessTokenSilently();
    });
    expect(result.current.user?.name).toEqual('bar');
  });

  it('should update auth state after getAccessTokenSilently fails', async () => {
    clientMock.getTokenSilently.mockReturnThis();
    clientMock.getUser.mockResolvedValue({ name: 'foo' });
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
    const userObject = { name: 'foo' };
    clientMock.getUser.mockResolvedValue(userObject);
    const wrapper = createWrapper();
    const { waitForNextUpdate, result } = renderHook(
      () => useContext(Auth0Context),
      { wrapper }
    );
    await waitForNextUpdate();

    const prevUser = result.current.user;
    clientMock.getUser.mockResolvedValue(userObject);
    await act(async () => {
      await result.current.getAccessTokenSilently();
    });
    expect(result.current.user).toBe(prevUser);
  });

  it('should not update getAccessTokenSilently after auth state change', async () => {
    clientMock.getTokenSilently.mockReturnThis();
    clientMock.getUser.mockResolvedValue({ name: 'foo' });
    const wrapper = createWrapper();
    const { waitForNextUpdate, result } = renderHook(
      () => useContext(Auth0Context),
      { wrapper }
    );
    await waitForNextUpdate();
    const memoized = result.current.getAccessTokenSilently;
    expect(result.current.user?.name).toEqual('foo');
    clientMock.getUser.mockResolvedValue({ name: 'bar' });
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
    clientMock.getUser.mockResolvedValue({ name: 'foo' });
    const wrapper = createWrapper();
    const { waitForNextUpdate, result } = renderHook(
      () => useContext(Auth0Context),
      { wrapper }
    );
    await waitForNextUpdate();

    const prevUser = result.current.user;
    clientMock.getUser.mockResolvedValue({ name: 'foo' });
    await act(async () => {
      await result.current.getAccessTokenWithPopup();
    });
    expect(result.current.user).not.toBe(prevUser);
  });

  it('should update auth state after getAccessTokenWithPopup fails', async () => {
    clientMock.getTokenSilently.mockReturnThis();
    clientMock.getUser.mockResolvedValue({ name: 'foo' });
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
    const userObject = { name: 'foo' };
    clientMock.getUser.mockResolvedValue(userObject);
    const wrapper = createWrapper();
    const { waitForNextUpdate, result } = renderHook(
      () => useContext(Auth0Context),
      { wrapper }
    );
    await waitForNextUpdate();

    const prevState = result.current;
    clientMock.getUser.mockResolvedValue(userObject);
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
    clientMock.getUser.mockResolvedValue({ name: 'foo' });
    const wrapper = createWrapper();
    const { waitForNextUpdate, result } = renderHook(
      () => useContext(Auth0Context),
      { wrapper }
    );
    await waitForNextUpdate();

    const prevUser = result.current.user;
    clientMock.getUser.mockResolvedValue({ name: 'foo' });
    await act(async () => {
      await result.current.handleRedirectCallback();
    });
    expect(result.current.user).not.toBe(prevUser);
  });

  it('should update auth state after handleRedirectCallback fails', async () => {
    clientMock.handleRedirectCallback.mockReturnThis();
    clientMock.getUser.mockResolvedValue({ name: 'foo' });
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
    const userObject = { name: 'foo' };
    clientMock.getUser.mockResolvedValue(userObject);
    const wrapper = createWrapper();
    const { waitForNextUpdate, result } = renderHook(
      () => useContext(Auth0Context),
      { wrapper }
    );
    await waitForNextUpdate();

    const prevState = result.current;
    clientMock.getUser.mockResolvedValue(userObject);
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

  it('should not update context value after rerender with no state change', async () => {
    clientMock.getTokenSilently.mockReturnThis();
    clientMock.getUser.mockResolvedValue({ name: 'foo' });
    const wrapper = createWrapper();
    const { waitForNextUpdate, result, rerender } = renderHook(
      () => useContext(Auth0Context),
      { wrapper }
    );
    await waitForNextUpdate();
    const memoized = result.current;

    rerender();

    expect(result.current).toBe(memoized);
  });

  it('should only handle redirect callback once', async () => {
    window.history.pushState(
      {},
      document.title,
      '/?code=__test_code__&state=__test_state__'
    );
    clientMock.handleRedirectCallback.mockResolvedValue({
      appState: undefined,
    });
    render(
      <StrictMode>
        <Auth0Provider clientId="__test_client_id__" domain="__test_domain__" />
      </StrictMode>
    );
    await waitFor(() => {
      expect(clientMock.handleRedirectCallback).toHaveBeenCalledTimes(1);
      expect(clientMock.getUser).toHaveBeenCalled();
    });
  });

  it('should allow passing a custom context', async () => {
    const context = React.createContext<Auth0ContextInterface>(initialContext);
    clientMock.getIdTokenClaims.mockResolvedValue({
      claim: '__test_claim__',
      __raw: '__test_raw_token__',
    });
    const wrapper = createWrapper({ context });
    // Test not associated with Auth0Context
    const auth0ContextRender = renderHook(() => useContext(Auth0Context), {
      wrapper,
    });

    await act(async () => {
      await expect(
        auth0ContextRender.result.current.getIdTokenClaims
      ).toThrowError('You forgot to wrap your component in <Auth0Provider>.');
    });

    const customContextRender = renderHook(() => useContext(context), {
      wrapper,
    });

    let claims;
    await act(async () => {
      claims = await customContextRender.result.current.getIdTokenClaims();
    });
    expect(clientMock.getIdTokenClaims).toHaveBeenCalled();
    expect(claims).toStrictEqual({
      claim: '__test_claim__',
      __raw: '__test_raw_token__',
    });
  });

  it('should allow nesting providers', async () => {
    // Calls happen up the tree, i.e the nested Auth0Provider will get undefined and the top level will get a return value
    clientMock.getUser.mockResolvedValueOnce({ name: '__custom_user__' });
    clientMock.getUser.mockResolvedValueOnce({ name: '__main_user__' });
    const context = React.createContext<Auth0ContextInterface>(initialContext);

    const MyComponent = () => {
      const { user } = useAuth0(context);
      return <div>{user?.name}</div>;
    };

    await act(() => {
      render(
        <Auth0Provider clientId="__test_client_id__" domain="__test_domain__">
          <Auth0Provider
            clientId="__test_client_id__"
            domain="__test_domain__"
            context={context}
          >
            <MyComponent />
          </Auth0Provider>
        </Auth0Provider>
      );
    });

    expect(clientMock.getUser).toHaveBeenCalledTimes(2);
    expect(screen.queryByText('__custom_user__')).toBeInTheDocument();
    expect(screen.queryByText('__main_user__')).not.toBeInTheDocument();
  });
});
