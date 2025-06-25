import {
  Auth0Client,
  TokenEndpointResponse,
} from '@auth0/auth0-spa-js';
import '@testing-library/jest-dom';
import { act, renderHook } from '@testing-library/react';
import { useContext } from 'react';
import { useAuth0 } from '../src';
import Auth0Context from '../src/auth0-context';
import { createWrapper } from './helpers';

const clientMock = jest.mocked(new Auth0Client({ clientId: '', domain: '' }));

describe('Token Exchange', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should exchange token successfully', async () => {
    const mockTokenResponse: TokenEndpointResponse = {
      access_token: 'mock-access-token',
      id_token: 'mock-id-token',
      refresh_token: 'mock-refresh-token',
      expires_in: 3600,
      scope: 'openid profile'
    } as TokenEndpointResponse;

    clientMock.exchangeToken.mockResolvedValue(mockTokenResponse);

    const wrapper = createWrapper();
    const { result } = renderHook(() => useAuth0(), { wrapper });

    await act(async () => {
      const response = await result.current.exchangeToken({
        subject_token: 'external-token',
        subject_token_type: 'urn:acme:legacy-system-token',
        scope: 'openid profile',
        audience: 'https://api.example.com'
      });

      expect(response).toEqual(mockTokenResponse);
      expect(clientMock.exchangeToken).toHaveBeenCalledWith({
        subject_token: 'external-token',
        subject_token_type: 'urn:acme:legacy-system-token',
        scope: 'openid profile',
        audience: 'https://api.example.com'
      });
    });
  });



  it('should handle token exchange error', async () => {
    const mockError = new Error('Token exchange failed');
    clientMock.exchangeToken.mockRejectedValue(mockError);

    const wrapper = createWrapper();
    const { result } = renderHook(() => useAuth0(), { wrapper });

    await act(async () => {
      await expect(
        result.current.exchangeToken({
          subject_token: 'invalid-token',
          subject_token_type: 'urn:acme:legacy-system-token',
          audience: 'https://api.example.com'
        })
      ).rejects.toThrow('Token exchange failed');

      expect(clientMock.exchangeToken).toHaveBeenCalledWith({
        subject_token: 'invalid-token',
        subject_token_type: 'urn:acme:legacy-system-token',
        audience: 'https://api.example.com'
      });
    });
  });

  it('should handle token exchange with audience', async () => {
    const mockTokenResponse: TokenEndpointResponse = {
      access_token: 'mock-access-token',
      id_token: 'mock-id-token',
      refresh_token: 'mock-refresh-token',
      expires_in: 3600,
      scope: 'openid profile',
    };

    clientMock.exchangeToken.mockResolvedValue(mockTokenResponse);

    const wrapper = createWrapper({
      authorizationParams: {
        audience: 'https://api.example.com',
      },
    });
    const { result } = renderHook(() => useContext(Auth0Context), { wrapper });

    await act(async () => {
      const response = await result.current.exchangeToken({
        subject_token: 'external-token',
        subject_token_type: 'urn:acme:legacy-system-token',
        scope: 'openid profile',
        audience: 'https://your-api-url',
      });

      expect(response).toEqual(mockTokenResponse);
      expect(clientMock.exchangeToken).toHaveBeenCalledWith({
        subject_token: 'external-token',
        subject_token_type: 'urn:acme:legacy-system-token',
        scope: 'openid profile',
      });
    });
  });

  it('should handle token exchange with custom audience', async () => {
    const mockTokenResponse: TokenEndpointResponse = {
      access_token: 'mock-access-token',
      id_token: 'mock-id-token',
      refresh_token: 'mock-refresh-token',
      expires_in: 3600,
      scope: 'openid profile',
    };

    clientMock.exchangeToken.mockResolvedValue(mockTokenResponse);

    const wrapper = createWrapper({
      authorizationParams: {
        audience: 'https://api.example.com/v2',
      },
    });

    const { result } = renderHook(() => useAuth0(), { wrapper });

    await act(async () => {
      const response = await result.current.exchangeToken({
        subject_token: 'external-token',
        subject_token_type: 'urn:acme:legacy-system-token',
        scope: 'openid profile',
        audience: 'https://api.example.com/v2',
      });

      expect(response).toEqual(mockTokenResponse);
      expect(clientMock.exchangeToken).toHaveBeenCalledWith({
        subject_token: 'external-token',
        subject_token_type: 'urn:acme:legacy-system-token',
        scope: 'openid profile',
        audience: 'https://api.example.com/v2',
      });
    });
  });

  it('should handle token exchange with custom scope', async () => {
    const mockTokenResponse: TokenEndpointResponse = {
      access_token: 'mock-access-token',
      id_token: 'mock-id-token',
      refresh_token: 'mock-refresh-token',
      expires_in: 3600,
      scope: 'custom:scope openid profile'
    } as TokenEndpointResponse;

    clientMock.exchangeToken.mockResolvedValue(mockTokenResponse);

    const wrapper = createWrapper();
    const { result } = renderHook(() => useAuth0(), { wrapper });

    await act(async () => {
      const response = await result.current.exchangeToken({
        subject_token: 'external-token',
        subject_token_type: 'urn:acme:legacy-system-token',
        scope: 'custom:scope openid profile',
        audience: 'https://api.example.com'
      });

      expect(response).toEqual(mockTokenResponse);
      expect(clientMock.exchangeToken).toHaveBeenCalledWith({
        subject_token: 'external-token',
        subject_token_type: 'urn:acme:legacy-system-token',
        scope: 'custom:scope openid profile',
        audience: 'https://api.example.com'
      });
    });
  });
});
