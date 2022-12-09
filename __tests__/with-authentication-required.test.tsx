import '@testing-library/jest-dom/extend-expect';
import React from 'react';
import withAuthenticationRequired from '../src/with-authentication-required';
import { render, screen, waitFor, act } from '@testing-library/react';
import { Auth0Client} from '@auth0/auth0-spa-js';
import Auth0Provider from '../src/auth0-provider';
import { Auth0ContextInterface, initialContext } from '../src/auth0-context';

const mockClient = jest.mocked(new Auth0Client({ clientId: '', domain: '' }));

describe('withAuthenticationRequired', () => {
  it('should block access to a private component when not authenticated', async () => {
    mockClient.getUser.mockResolvedValue(undefined);
    const MyComponent = (): JSX.Element => <>Private</>;
    const WrappedComponent = withAuthenticationRequired(MyComponent);
    render(
      <Auth0Provider clientId="__test_client_id__" domain="__test_domain__">
        <WrappedComponent />
      </Auth0Provider>
    );
    await waitFor(() =>
      expect(mockClient.loginWithRedirect).toHaveBeenCalled()
    );
    expect(screen.queryByText('Private')).not.toBeInTheDocument();
  });

  it('should allow access to a private component when authenticated', async () => {
    mockClient.getUser.mockResolvedValue({ name: '__test_user__' });
    const MyComponent = (): JSX.Element => <>Private</>;
    const WrappedComponent = withAuthenticationRequired(MyComponent);
    render(
      <Auth0Provider clientId="__test_client_id__" domain="__test_domain__">
        <WrappedComponent />
      </Auth0Provider>
    );
    await waitFor(() =>
      expect(mockClient.loginWithRedirect).not.toHaveBeenCalled()
    );
    await waitFor(() =>
      expect(screen.getByText('Private')).toBeInTheDocument()
    );
  });

  it('should show a custom redirecting message', async () => {
    mockClient.getUser.mockResolvedValue(
      Promise.resolve({ name: '__test_user__' })
    );
    const MyComponent = (): JSX.Element => <>Private</>;
    const OnRedirecting = (): JSX.Element => <>Redirecting</>;
    const WrappedComponent = withAuthenticationRequired(MyComponent, {
      onRedirecting: OnRedirecting,
    });
    render(
      <Auth0Provider clientId="__test_client_id__" domain="__test_domain__">
        <WrappedComponent />
      </Auth0Provider>
    );
    await waitFor(() =>
      expect(screen.getByText('Redirecting')).toBeInTheDocument()
    );
    await waitFor(() =>
      expect(mockClient.loginWithRedirect).not.toHaveBeenCalled()
    );
    await waitFor(() =>
      expect(screen.queryByText('Redirecting')).not.toBeInTheDocument()
    );
  });

  it('should pass additional options on to loginWithRedirect', async () => {
    mockClient.getUser.mockResolvedValue(undefined);
    const MyComponent = (): JSX.Element => <>Private</>;
    const WrappedComponent = withAuthenticationRequired(MyComponent, {
      loginOptions: {
        fragment: 'foo',
      },
    });
    render(
      <Auth0Provider clientId="__test_client_id__" domain="__test_domain__">
        <WrappedComponent />
      </Auth0Provider>
    );
    await waitFor(() =>
      expect(mockClient.loginWithRedirect).toHaveBeenCalledWith(
        expect.objectContaining({
          fragment: 'foo',
        })
      )
    );
  });

  it('should merge additional appState with the returnTo', async () => {
    mockClient.getUser.mockResolvedValue(undefined);
    const MyComponent = (): JSX.Element => <>Private</>;
    const WrappedComponent = withAuthenticationRequired(MyComponent, {
      loginOptions: {
        appState: {
          foo: 'bar',
        },
      },
      returnTo: '/baz',
    });
    render(
      <Auth0Provider clientId="__test_client_id__" domain="__test_domain__">
        <WrappedComponent />
      </Auth0Provider>
    );
    await waitFor(() =>
      expect(mockClient.loginWithRedirect).toHaveBeenCalledWith(
        expect.objectContaining({
          appState: {
            foo: 'bar',
            returnTo: '/baz',
          },
        })
      )
    );
  });

  it('should accept a returnTo function', async () => {
    mockClient.getUser.mockResolvedValue(undefined);
    const MyComponent = (): JSX.Element => <>Private</>;
    const WrappedComponent = withAuthenticationRequired(MyComponent, {
      returnTo: () => '/foo',
    });
    render(
      <Auth0Provider clientId="__test_client_id__" domain="__test_domain__">
        <WrappedComponent />
      </Auth0Provider>
    );
    await waitFor(() =>
      expect(mockClient.loginWithRedirect).toHaveBeenCalledWith(
        expect.objectContaining({
          appState: {
            returnTo: '/foo',
          },
        })
      )
    );
  });

  it('should call loginWithRedirect only once even if parent state changes', async () => {
    mockClient.getUser.mockResolvedValue(undefined);
    const MyComponent = (): JSX.Element => <>Private</>;
    const WrappedComponent = withAuthenticationRequired(MyComponent);
    const App = ({ foo }: { foo: number }): JSX.Element => (
      <div>
        {foo}
        <Auth0Provider clientId="__test_client_id__" domain="__test_domain__">
          <WrappedComponent />
        </Auth0Provider>
      </div>
    );
    const { rerender } = render(<App foo={1} />);
    await waitFor(() =>
      expect(mockClient.loginWithRedirect).toHaveBeenCalled()
    );
    mockClient.loginWithRedirect.mockClear();
    rerender(<App foo={2} />);
    await waitFor(() =>
      expect(mockClient.loginWithRedirect).not.toHaveBeenCalled()
    );
  });

  it('should provide access when the provider associated with the context is authenticated', async () => {
    // Calls happen up the tree, i.e the nested Auth0Provider will get a return value and the top level will get undefined
    mockClient.getUser.mockResolvedValueOnce({ name: '__test_user__' });
    mockClient.getUser.mockResolvedValueOnce(undefined);
    const context = React.createContext<Auth0ContextInterface>(initialContext);
    const MyComponent = (): JSX.Element => <>Private</>;
    const WrappedComponent = withAuthenticationRequired(MyComponent, {
      context,
    });
    await act(() => {
      render(
        <Auth0Provider clientId="__test_client_id__" domain="__test_domain__">
          <Auth0Provider
            clientId="__test_client_id__"
            domain="__test_domain__"
            context={context}
          >
            <WrappedComponent />
          </Auth0Provider>
        </Auth0Provider>
      );
    });

    await waitFor(() =>
      expect(mockClient.loginWithRedirect).not.toHaveBeenCalled()
    );
    // There should be one call per provider
    expect(mockClient.getUser).toHaveBeenCalledTimes(2);
    expect(screen.queryByText('Private')).toBeInTheDocument();
  });

  it('should block access when the provider associated with the context is not authenticated', async () => {
    // Calls happen up the tree, i.e the nested Auth0Provider will get undefined and the top level will get a return value
    mockClient.getUser.mockResolvedValueOnce(undefined);
    mockClient.getUser.mockResolvedValueOnce({ name: '__test_user__' });
    const context = React.createContext<Auth0ContextInterface>(initialContext);
    const MyComponent = (): JSX.Element => <>Private</>;
    const WrappedComponent = withAuthenticationRequired(MyComponent, {
      context,
    });
    await act(() => {
      render(
        <Auth0Provider clientId="__test_client_id__" domain="__test_domain__">
          <Auth0Provider
            clientId="__test_client_id__"
            domain="__test_domain__"
            context={context}
          >
            <WrappedComponent />
          </Auth0Provider>
        </Auth0Provider>
      );
    });

    await waitFor(() =>
      expect(mockClient.loginWithRedirect).toHaveBeenCalled()
    );
    // There should be one call per provider
    expect(mockClient.getUser).toHaveBeenCalledTimes(2);
    expect(screen.queryByText('Private')).not.toBeInTheDocument();
  });
});
