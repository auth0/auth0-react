import {
  defaultOnRedirectCallback,
  hasAuthParams,
  loginError,
  tokenError,
} from '../src/utils';
import { OAuthError } from '../src/errors';

describe('utils hasAuthParams', () => {
  it('should recognise the code param', async () => {
    ['?code=1', '?foo=1&code=2', '?code=1&foo=2'].forEach((search) =>
      expect(hasAuthParams(search)).toBeTruthy()
    );
  });

  it('should recognise the error param', async () => {
    ['?error=1', '?foo=1&error=2', '?error=1&foo=2'].forEach((search) =>
      expect(hasAuthParams(search)).toBeTruthy()
    );
  });

  it('should ignore invalid params', async () => {
    ['', '?', '?foo=1', '?code=&foo=2', '?error='].forEach((search) =>
      expect(hasAuthParams(search)).toBeFalsy()
    );
  });
});

describe('utils defaultOnRedirectCallback', () => {
  it('should remove auth params', async () => {
    window.history.pushState(
      {},
      document.title,
      '/?code=__test_code__&state=__test_state__'
    );
    expect(window.location.href).toBe(
      'https://www.example.com/?code=__test_code__&state=__test_state__'
    );
    defaultOnRedirectCallback();
    expect(window.location.href).toBe('https://www.example.com/');
  });

  it('should redirect to app state param', async () => {
    window.history.pushState(
      {},
      document.title,
      '/?code=__test_code__&state=__test_state__'
    );
    expect(window.location.href).toBe(
      'https://www.example.com/?code=__test_code__&state=__test_state__'
    );
    defaultOnRedirectCallback({ returnTo: '/foo' });
    expect(window.location.href).toBe('https://www.example.com/foo');
  });
});

describe('utils error', () => {
  it('should return the original error', async () => {
    const error = new Error('__test_error__');
    expect(loginError(error)).toBe(error);
  });

  it('should convert OAuth error data to an OAuth JS error', async () => {
    const error = {
      error: '__test_error__',
      error_description: '__test_error_description__',
    };
    expect(() => {
      throw tokenError(error);
    }).toThrow(OAuthError);
  });

  it('should convert a ProgressEvent error to a JS error', async () => {
    const error = new ProgressEvent('error');
    expect(() => {
      throw loginError(error);
    }).toThrowError('Login failed');
  });
});
