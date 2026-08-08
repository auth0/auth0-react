import { Auth0Client } from '@auth0/auth0-spa-js';
import '@testing-library/jest-dom';
import {
  act,
  render,
  renderHook,
  screen,
  waitFor,
} from '@testing-library/react';
import React, { Component, ReactNode, Suspense } from 'react';
import { Auth0Provider } from '../src';
import useAuth0Suspense from '../src/use-auth0-suspense';
import { defer } from './helpers';

const clientMock = jest.mocked(new Auth0Client({ clientId: '', domain: '' }));

class ErrorBoundary extends Component<
  { children: ReactNode },
  { error: Error | null }
> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  render() {
    return this.state.error ? (
      <div>boundary: {this.state.error.message}</div>
    ) : (
      this.props.children
    );
  }
}

function Greeting() {
  const { user, isAuthenticated } = useAuth0Suspense();
  return <div>{isAuthenticated ? `Hello ${user?.name}` : 'Please log in'}</div>;
}

const renderWithProvider = async (child: ReactNode) =>
  act(async () => {
    render(
      <Auth0Provider clientId="__test_client_id__" domain="__test_domain__">
        <ErrorBoundary>
          <Suspense fallback={<div>loading</div>}>{child}</Suspense>
        </ErrorBoundary>
      </Auth0Provider>
    );
  });

describe('useAuth0Suspense', () => {
  afterEach(() => {
    window.history.pushState({}, document.title, '/');
  });

  it('shows the Suspense fallback while init is pending, then the content', async () => {
    const userDefer = defer<{ name: string }>();
    clientMock.checkSession.mockResolvedValue(undefined);
    clientMock.getUser.mockReturnValue(userDefer.promise as never);

    await renderWithProvider(<Greeting />);

    // Still initializing -> fallback
    expect(screen.getByText('loading')).toBeInTheDocument();

    userDefer.resolve({ name: 'Bob' });

    await waitFor(() =>
      expect(screen.getByText('Hello Bob')).toBeInTheDocument()
    );
  });

  it('throws init errors to the nearest Error Boundary', async () => {
    clientMock.checkSession.mockRejectedValueOnce({
      error: '__test_error__',
      error_description: '__test_error_description__',
    });

    await renderWithProvider(<Greeting />);

    await waitFor(() =>
      expect(
        screen.getByText(/boundary: .*__test_error_description__/)
      ).toBeInTheDocument()
    );
  });

  it('throws redirect-callback init errors to the nearest Error Boundary', async () => {
    // Presence of code/state in the URL makes hasAuthParams() true, so init
    // takes the handleRedirectCallback branch instead of checkSession.
    window.history.pushState(
      {},
      document.title,
      '/?code=__test_code__&state=__test_state__'
    );
    clientMock.handleRedirectCallback.mockRejectedValueOnce({
      error: '__redirect_error__',
      error_description: '__redirect_error_description__',
    });

    await renderWithProvider(<Greeting />);

    await waitFor(() =>
      expect(
        screen.getByText(/boundary: .*__redirect_error_description__/)
      ).toBeInTheDocument()
    );
  });

  it('returns the auth methods, omitting isLoading and _initPromise', async () => {
    clientMock.checkSession.mockResolvedValue(undefined);
    clientMock.getUser.mockResolvedValue({ name: 'Bob' });

    let captured: Record<string, unknown> | undefined;
    function Capture() {
      captured = useAuth0Suspense() as unknown as Record<string, unknown>;
      return <div>captured</div>;
    }

    await renderWithProvider(<Capture />);
    await waitFor(() =>
      expect(screen.getByText('captured')).toBeInTheDocument()
    );

    expect(captured).not.toHaveProperty('isLoading');
    expect(captured).not.toHaveProperty('_initPromise');
    expect(captured).toHaveProperty('error');
    expect(typeof captured!.loginWithRedirect).toBe('function');
  });

  it('throws a clear error when used outside an Auth0Provider', () => {
    expect(() => renderHook(() => useAuth0Suspense())).toThrowError(
      /must be used within/
    );
  });

  it('throws a clear error when React.use is unavailable', async () => {
    jest.resetModules();
    jest.doMock('react', () => {
      const actual = jest.requireActual('react');
      return { ...actual, use: undefined };
    });
    const { default: hook } = await import('../src/use-auth0-suspense');
    expect(() => hook()).toThrowError(/requires React 19/);
    jest.dontMock('react');
    jest.resetModules();
  });
});

describe('useAuth0Suspense exports', () => {
  it('is exported from the package root', async () => {
    const pkg = await import('../src');
    expect(typeof pkg.useAuth0Suspense).toBe('function');
  });
});
