import { hasAuthParams, loginError, tokenError, deprecateRedirectUri } from '../src/utils';
import { OAuthError } from '../src/errors';

// Define interfaces for testing deprecateRedirectUri function
interface TestOptionsWithRedirectUri {
  redirectUri?: string;
  authorizationParams?: {
    redirect_uri?: string;
    scope?: string;
  };
}

interface TestOptionsWithAuthorizationParams {
  authorizationParams: {
    redirectUri?: string;
    redirect_uri?: string;
    scope?: string;
  };
}

interface TestOptionsWithBothRedirectUri {
  redirectUri?: string;
  authorizationParams: {
    scope: string;
    redirect_uri?: string;
  };
}

describe('utils hasAuthParams', () => {
  it('should not recognise only the code param', async () => {
    ['?code=1', '?foo=1&code=2', '?code=1&foo=2'].forEach((search) =>
      expect(hasAuthParams(search)).toBeFalsy()
    );
  });

  it('should recognise the code and state param', async () => {
    [
      '?code=1&state=2',
      '?foo=1&state=2&code=3',
      '?code=1&foo=2&state=3',
      '?state=1&code=2&foo=3',
    ].forEach((search) => expect(hasAuthParams(search)).toBeTruthy());
  });

  it('should recognise the connect_code and state param', async () => {
    [
      '?connect_code=1&state=2',
      '?foo=1&state=2&connect_code=3',
      '?connect_code=1&foo=2&state=3',
      '?state=1&connect_code=2&foo=3',
    ].forEach((search) => expect(hasAuthParams(search)).toBeTruthy());
  });

  it('should recognise the error and state param', async () => {
    [
      '?error=1&state=2',
      '?foo=1&state=2&error=3',
      '?error=1&foo=2&state=3',
      '?state=1&error=2&foo=3',
    ].forEach((search) => expect(hasAuthParams(search)).toBeTruthy());
  });

  it('should ignore the error param without state param', async () => {
    ['?error=1', '?foo=1&error=2', '?error=1&foo=2'].forEach((search) =>
      expect(hasAuthParams(search)).toBeFalsy()
    );
  });

  it('should ignore invalid params', async () => {
    ['', '?', '?foo=1', '?code=&foo=2', '?error='].forEach((search) =>
      expect(hasAuthParams(search)).toBeFalsy()
    );
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

describe('utils deprecateRedirectUri', () => {
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it('should handle options with redirectUri', () => {
    const options: TestOptionsWithRedirectUri = {
      redirectUri: 'https://example.com/callback',
    };
    
    deprecateRedirectUri(options);
    
    expect(consoleSpy).toHaveBeenCalledWith(
      'Using `redirectUri` has been deprecated, please use `authorizationParams.redirect_uri` instead as `redirectUri` will be no longer supported in a future version'
    );
    expect(options.authorizationParams?.redirect_uri).toBe('https://example.com/callback');
    expect(options.redirectUri).toBeUndefined();
  });

  it('should handle options with authorizationParams.redirectUri', () => {
    const options: TestOptionsWithAuthorizationParams = {
      authorizationParams: {
        redirectUri: 'https://example.com/callback',
      },
    };
    
    deprecateRedirectUri(options);
    
    expect(consoleSpy).toHaveBeenCalledWith(
      'Using `authorizationParams.redirectUri` has been deprecated, please use `authorizationParams.redirect_uri` instead as `authorizationParams.redirectUri` will be removed in a future version'
    );
    expect(options.authorizationParams.redirect_uri).toBe('https://example.com/callback');
    expect(options.authorizationParams.redirectUri).toBeUndefined();
  });

  it('should handle options with both redirectUri and existing authorizationParams', () => {
    const options: TestOptionsWithBothRedirectUri = {
      redirectUri: 'https://example.com/callback',
      authorizationParams: {
        scope: 'openid profile',
      },
    };
    
    deprecateRedirectUri(options);
    
    expect(options.authorizationParams.redirect_uri).toBe('https://example.com/callback');
    expect(options.authorizationParams.scope).toBe('openid profile');
    expect(options.redirectUri).toBeUndefined();
  });

  it('should handle undefined options', () => {
    deprecateRedirectUri(undefined);
    expect(consoleSpy).not.toHaveBeenCalled();
  });

  it('should handle options without redirectUri properties', () => {
    const options = {
      domain: 'example.auth0.com',
      clientId: 'client-id',
    };
    
    deprecateRedirectUri(options);
    expect(consoleSpy).not.toHaveBeenCalled();
  });
});
