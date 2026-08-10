import { Auth0Client } from '@auth0/auth0-spa-js';
import '@testing-library/jest-dom';
import {
  act,
  render,
  renderHook,
  screen,
  waitFor,
} from '@testing-library/react';
import React, {
  Component,
  ReactNode,
  Suspense,
  useEffect,
  useState,
} from 'react';
import { Auth0Provider, useAuth0 } from '../src';
import { initialContext } from '../src/auth0-context';
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

  it('returns a referentially stable value across re-renders', async () => {
    clientMock.checkSession.mockResolvedValue(undefined);
    clientMock.getUser.mockResolvedValue({ name: 'Bob' });

    const identities = new Set<unknown>();
    let effectRuns = 0;

    function Consumer() {
      const auth = useAuth0Suspense();
      identities.add(auth);
      const [tick, setTick] = useState(0);
      // The common "re-fetch when auth changes" pattern. An unstable return
      // value turns this into an infinite loop.
      useEffect(() => {
        effectRuns += 1;
      }, [auth]);
      return <button onClick={() => setTick(tick + 1)}>rerender</button>;
    }

    await renderWithProvider(<Consumer />);
    await waitFor(() =>
      expect(screen.getByText('rerender')).toBeInTheDocument()
    );

    // Force three consumer-local re-renders.
    for (let i = 0; i < 3; i++) {
      await act(async () => {
        screen.getByText('rerender').click();
      });
    }

    expect(identities.size).toBe(1);
    expect(effectRuns).toBe(1);
  });

  it('still reflects state changes despite the memo', async () => {
    // Guards the other side of the memo: stable *identity* must not mean a
    // frozen *value*. A `useMemo(..., [])` would satisfy the test above while
    // reporting a signed-out user as still authenticated forever.
    clientMock.checkSession.mockResolvedValue(undefined);
    clientMock.getUser.mockResolvedValue({ name: 'Bob' });
    clientMock.logout.mockResolvedValue(undefined);

    function Consumer() {
      const { isAuthenticated, user, logout } = useAuth0Suspense();
      return (
        <button onClick={() => void logout({ openUrl: false })}>
          state:{String(isAuthenticated)}:{user?.name ?? 'none'}
        </button>
      );
    }

    await renderWithProvider(<Consumer />);
    await waitFor(() =>
      expect(screen.getByText('state:true:Bob')).toBeInTheDocument()
    );

    await act(async () => {
      screen.getByText('state:true:Bob').click();
    });

    await waitFor(() =>
      expect(screen.getByText('state:false:none')).toBeInTheDocument()
    );
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

class ResettableBoundary extends Component<
  { children: ReactNode },
  { error: Error | null; nonce: number }
> {
  state = { error: null as Error | null, nonce: 0 };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return (
        <button
          onClick={() =>
            this.setState((s) => ({ error: null, nonce: s.nonce + 1 }))
          }
        >
          retry
        </button>
      );
    }
    return <div key={this.state.nonce}>{this.props.children}</div>;
  }
}

function SuspenseConsumer() {
  const { isAuthenticated } = useAuth0Suspense();
  return <div>suspense-ok:{String(isAuthenticated)}</div>;
}

describe('useAuth0Suspense recovery', () => {
  it('recovers on boundary retry after auth succeeds via loginWithPopup', async () => {
    // First call is init (fails). The retry re-checks the session and succeeds.
    clientMock.checkSession
      .mockRejectedValueOnce({
        error: '__test_error__',
        error_description: '__init_failed__',
      })
      .mockResolvedValue(undefined);
    clientMock.loginWithPopup.mockResolvedValue(undefined);
    clientMock.getUser.mockResolvedValue({ name: 'Bob' });

    // Lives outside the boundary so it survives the init failure.
    function Recovery() {
      const { loginWithPopup } = useAuth0();
      return <button onClick={() => void loginWithPopup()}>popup</button>;
    }

    await act(async () => {
      render(
        <Auth0Provider clientId="__test_client_id__" domain="__test_domain__">
          <Recovery />
          <ResettableBoundary>
            <Suspense fallback={<div>loading</div>}>
              <SuspenseConsumer />
            </Suspense>
          </ResettableBoundary>
        </Auth0Provider>
      );
    });

    // Init failed -> boundary caught it.
    await waitFor(() => expect(screen.getByText('retry')).toBeInTheDocument());

    // Successful login makes the app authenticated, which triggers the retry.
    await act(async () => {
      screen.getByText('popup').click();
    });

    // Boundary retry must now render, not re-throw the stale rejection.
    await act(async () => {
      screen.getByText('retry').click();
    });

    await waitFor(() =>
      expect(screen.getByText('suspense-ok:true')).toBeInTheDocument()
    );
  });

  it('recovers after a silent token succeeds, not just loginWithPopup', async () => {
    // GET_ACCESS_TOKEN_COMPLETE does not clear `error`, so recovery must key
    // off `isAuthenticated` rather than the error being cleared.
    clientMock.checkSession
      .mockRejectedValueOnce({
        error: '__test_error__',
        error_description: '__init_failed__',
      })
      .mockResolvedValue(undefined);
    clientMock.getTokenSilently.mockResolvedValue('__token__' as never);
    clientMock.getUser.mockResolvedValue({ name: 'Bob' });

    function Recovery() {
      const { getAccessTokenSilently } = useAuth0();
      return (
        <button onClick={() => void getAccessTokenSilently()}>token</button>
      );
    }

    await act(async () => {
      render(
        <Auth0Provider clientId="__test_client_id__" domain="__test_domain__">
          <Recovery />
          <ResettableBoundary>
            <Suspense fallback={<div>loading</div>}>
              <SuspenseConsumer />
            </Suspense>
          </ResettableBoundary>
        </Auth0Provider>
      );
    });

    await waitFor(() => expect(screen.getByText('retry')).toBeInTheDocument());

    await act(async () => {
      screen.getByText('token').click();
    });
    await act(async () => {
      screen.getByText('retry').click();
    });

    await waitFor(() =>
      expect(screen.getByText('suspense-ok:true')).toBeInTheDocument()
    );
  });

  it('keeps rejecting when the retried session check also fails', async () => {
    // The retry must report what checkSession actually did. If the session is
    // still bad, the boundary keeps showing an error rather than a fake success.
    clientMock.checkSession
      .mockRejectedValueOnce({
        error: '__test_error__',
        error_description: '__init_failed__',
      })
      .mockRejectedValue({
        error: '__test_error__',
        error_description: '__retry_also_failed__',
      });
    clientMock.loginWithPopup.mockResolvedValue(undefined);
    clientMock.getUser.mockResolvedValue({ name: 'Bob' });

    function Recovery() {
      const { loginWithPopup } = useAuth0();
      return <button onClick={() => void loginWithPopup()}>popup</button>;
    }

    await act(async () => {
      render(
        <Auth0Provider clientId="__test_client_id__" domain="__test_domain__">
          <Recovery />
          <ResettableBoundary>
            <Suspense fallback={<div>loading</div>}>
              <SuspenseConsumer />
            </Suspense>
          </ResettableBoundary>
        </Auth0Provider>
      );
    });

    await waitFor(() => expect(screen.getByText('retry')).toBeInTheDocument());

    await act(async () => {
      screen.getByText('popup').click();
    });
    await act(async () => {
      screen.getByText('retry').click();
    });

    // The retried check failed too, so the boundary catches again. The hook must
    // never render content off a fabricated success.
    await waitFor(() => expect(screen.getByText('retry')).toBeInTheDocument());
    expect(screen.queryByText('suspense-ok:true')).not.toBeInTheDocument();
  });

  it('does not retry while init is still pending', async () => {
    // Init hangs until we release it. A successful login in the meantime must
    // not be mistaken for init having failed-then-recovered.
    const sessionDefer = defer<void>();
    clientMock.checkSession.mockReturnValue(sessionDefer.promise as never);
    clientMock.getUser.mockResolvedValue({ name: 'Bob' });
    clientMock.loginWithPopup.mockResolvedValue(undefined);

    function Recovery() {
      const { loginWithPopup } = useAuth0();
      return <button onClick={() => void loginWithPopup()}>popup</button>;
    }

    await act(async () => {
      render(
        <Auth0Provider clientId="__test_client_id__" domain="__test_domain__">
          <Recovery />
          <ErrorBoundary>
            <Suspense fallback={<div>loading</div>}>
              <SuspenseConsumer />
            </Suspense>
          </ErrorBoundary>
        </Auth0Provider>
      );
    });

    await act(async () => {
      screen.getByText('popup').click();
    });

    // Still suspended: init has not finished, so the hook must still wait.
    expect(screen.getByText('loading')).toBeInTheDocument();
    expect(clientMock.checkSession).toHaveBeenCalledTimes(1);

    // Now let init finish. The consumer must render -- not hang forever on a
    // deferred that was swapped out from under it.
    await act(async () => {
      sessionDefer.resolve();
    });

    await waitFor(() =>
      expect(screen.getByText('suspense-ok:true')).toBeInTheDocument()
    );
  });

  it('retries at most once', async () => {
    // A retry that also fails must not re-arm itself, or it would re-run
    // checkSession for as long as the user stays authenticated.
    clientMock.checkSession.mockRejectedValue({
      error: '__test_error__',
      error_description: '__init_failed__',
    });
    clientMock.loginWithPopup.mockResolvedValue(undefined);
    clientMock.getUser.mockResolvedValue({ name: 'Bob' });

    function Recovery() {
      const { loginWithPopup } = useAuth0();
      return <button onClick={() => void loginWithPopup()}>popup</button>;
    }

    await act(async () => {
      render(
        <Auth0Provider clientId="__test_client_id__" domain="__test_domain__">
          <Recovery />
          <ErrorBoundary>
            <Suspense fallback={<div>loading</div>}>
              <SuspenseConsumer />
            </Suspense>
          </ErrorBoundary>
        </Auth0Provider>
      );
    });

    await waitFor(() => expect(clientMock.checkSession).toHaveBeenCalled());

    for (let i = 0; i < 3; i++) {
      await act(async () => {
        screen.getByText('popup').click();
      });
    }

    // One init + exactly one retry.
    expect(clientMock.checkSession).toHaveBeenCalledTimes(2);
  });

  it('does not re-run the redirect callback on retry', async () => {
    // handleRedirectCallback is single-use: replaying it would fail on a
    // consumed code, and onRedirectCallback must not fire twice.
    window.history.pushState(
      {},
      document.title,
      '/?code=__test_code__&state=__test_state__'
    );
    clientMock.handleRedirectCallback.mockRejectedValueOnce({
      error: '__redirect_error__',
      error_description: '__redirect_failed__',
    });
    clientMock.checkSession.mockResolvedValue(undefined);
    clientMock.loginWithPopup.mockResolvedValue(undefined);
    clientMock.getUser.mockResolvedValue({ name: 'Bob' });
    const onRedirectCallback = jest.fn();

    function Recovery() {
      const { loginWithPopup } = useAuth0();
      return <button onClick={() => void loginWithPopup()}>popup</button>;
    }

    await act(async () => {
      render(
        <Auth0Provider
          clientId="__test_client_id__"
          domain="__test_domain__"
          onRedirectCallback={onRedirectCallback}
        >
          <Recovery />
          <ResettableBoundary>
            <Suspense fallback={<div>loading</div>}>
              <SuspenseConsumer />
            </Suspense>
          </ResettableBoundary>
        </Auth0Provider>
      );
    });

    await waitFor(() => expect(screen.getByText('retry')).toBeInTheDocument());

    await act(async () => {
      screen.getByText('popup').click();
    });
    await act(async () => {
      screen.getByText('retry').click();
    });

    await waitFor(() =>
      expect(screen.getByText('suspense-ok:true')).toBeInTheDocument()
    );
    // The retry took the checkSession branch, not the redirect branch.
    expect(clientMock.handleRedirectCallback).toHaveBeenCalledTimes(1);
    expect(onRedirectCallback).not.toHaveBeenCalled();
  });
});

describe('useAuth0Suspense provider detection', () => {
  // Regression guard: the missing-provider check in use-auth0-suspense.tsx
  // relies on initialContext NOT carrying an _initPromise. If a future change
  // adds a stub promise there, the guard would silently pass and consumers
  // would get the throwing stub methods instead of a clear error.
  it('initialContext carries no _initPromise', () => {
    expect(
      (initialContext as { _initPromise?: Promise<void> })._initPromise
    ).toBeUndefined();
  });
});

describe('useAuth0Suspense exports', () => {
  it('is exported from the package root', async () => {
    const pkg = await import('../src');
    expect(typeof pkg.useAuth0Suspense).toBe('function');
  });
});
