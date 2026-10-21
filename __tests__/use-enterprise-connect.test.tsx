import React, { useEffect } from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import {
  isFederatedDomain as spaIsFederatedDomain,
  Auth0Client,
} from '@auth0/auth0-spa-js';
import useEnterpriseConnect from '../src/use-enterprise-connect';
import { Auth0ContextInterface, initialContext } from '../src/auth0-context';
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

  it('should keep the result stable when the provider initializes or the consumer re-renders', async () => {
    const effect = jest.fn();
    const { result, rerender } = renderHook(
      () => {
        const enterpriseConnect = useEnterpriseConnect();
        useEffect(effect, [enterpriseConnect]);
        return enterpriseConnect;
      },
      { wrapper: createWrapper() }
    );
    const initial = result.current;

    await waitFor(() => expect(clientMock.getUser).toHaveBeenCalled());
    for (let i = 0; i < 3; i++) {
      rerender();
    }

    expect(effect).toHaveBeenCalledTimes(1);
    expect(result.current).toBe(initial);
  });

  it.each(['getConfiguration', 'loginWithRedirect'] as const)(
    'should update the result when %s changes in a custom context',
    async (method) => {
      const getConfiguration = jest.fn(() => ({
        domain: 'first.example.com',
        clientId: '__test_client_id__',
      }));
      const loginWithRedirect = jest.fn();
      let contextValue: Auth0ContextInterface = {
        ...initialContext,
        getConfiguration,
        loginWithRedirect,
      };
      const context =
        React.createContext<Auth0ContextInterface>(initialContext);
      const wrapper = ({ children }: React.PropsWithChildren) => (
        <context.Provider value={contextValue}>{children}</context.Provider>
      );
      const { result, rerender } = renderHook(
        () => useEnterpriseConnect(context),
        { wrapper }
      );
      const initial = result.current;
      const nextGetConfiguration = jest.fn(() => ({
        domain: 'second.example.com',
        clientId: '__test_client_id__',
      }));
      const nextLoginWithRedirect = jest.fn();

      contextValue =
        method === 'getConfiguration'
          ? { ...contextValue, getConfiguration: nextGetConfiguration }
          : { ...contextValue, loginWithRedirect: nextLoginWithRedirect };
      rerender();

      expect(result.current).not.toBe(initial);
      expect(
        result.current.isFederatedDomain === initial.isFederatedDomain
      ).toBe(method !== 'getConfiguration');
      expect(result.current.loginWithSSO === initial.loginWithSSO).toBe(
        method !== 'loginWithRedirect'
      );

      await result.current.isFederatedDomain('acme.com');
      expect(federatedMock).toHaveBeenCalledWith(
        contextValue.getConfiguration().domain,
        'acme.com',
        undefined
      );
      await result.current.loginWithSSO('jane@acme.com');
      expect(contextValue.loginWithRedirect).toHaveBeenCalledWith({
        authorizationParams: { login_hint: 'jane@acme.com' },
      });

      const updated = result.current;
      rerender();
      expect(result.current).toBe(updated);
    }
  );

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
    await waitFor(() => expect(clientMock.loginWithRedirect).not.toBeNull());

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
