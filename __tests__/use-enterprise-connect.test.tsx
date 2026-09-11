import { renderHook, waitFor } from '@testing-library/react';
import {
  isFederatedDomain as spaIsFederatedDomain,
  Auth0Client,
} from '@auth0/auth0-spa-js';
import useEnterpriseConnect from '../src/use-enterprise-connect';
import { createWrapper } from './helpers';

jest.mock('@auth0/auth0-spa-js');

const clientMock = jest.mocked(new Auth0Client({ clientId: '', domain: '' }));
const federatedMock = jest.mocked(spaIsFederatedDomain);

describe('useEnterpriseConnect', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    clientMock.getConfiguration.mockReturnValue({
      domain: '__test_domain__',
      clientId: '__test_client_id__',
    });
  });

  it('calls isFederatedDomain with the configured domain and email domain', async () => {
    federatedMock.mockResolvedValueOnce(true);
    const wrapper = createWrapper();
    const { result } = renderHook(() => useEnterpriseConnect(), { wrapper });

    const federated = await result.current.isFederatedDomain('acme.com');

    expect(federatedMock).toHaveBeenCalledWith(
      '__test_domain__',
      'acme.com',
      undefined
    );
    expect(federated).toBe(true);
  });

  it('forwards options to isFederatedDomain', async () => {
    federatedMock.mockResolvedValueOnce(false);
    const customFetch = jest.fn();
    const wrapper = createWrapper();
    const { result } = renderHook(() => useEnterpriseConnect(), { wrapper });

    await result.current.isFederatedDomain('acme.com', { customFetch });

    expect(federatedMock).toHaveBeenCalledWith('__test_domain__', 'acme.com', {
      customFetch,
    });
  });

  it('loginWithSSO calls loginWithRedirect with login_hint set from the email', async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useEnterpriseConnect(), { wrapper });
    await waitFor(() =>
      expect(clientMock.loginWithRedirect).not.toBeNull()
    );

    await result.current.loginWithSSO('jane@acme.com');

    expect(clientMock.loginWithRedirect).toHaveBeenCalledWith({
      authorizationParams: { login_hint: 'jane@acme.com' },
    });
  });

  it('loginWithSSO preserves caller authorizationParams and other options', async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useEnterpriseConnect(), { wrapper });

    await result.current.loginWithSSO('jane@acme.com', {
      authorizationParams: {
        connection: 'okta',
        organization: 'org_123',
      },
      appState: { returnTo: '/dashboard' },
    });

    expect(clientMock.loginWithRedirect).toHaveBeenCalledWith({
      appState: { returnTo: '/dashboard' },
      authorizationParams: {
        connection: 'okta',
        organization: 'org_123',
        login_hint: 'jane@acme.com',
      },
    });
  });
});
