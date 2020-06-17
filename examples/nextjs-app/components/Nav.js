import React from 'react';
import Link from 'next/link';
import { useAuth0 } from '@auth0/auth0-react';
import { useRouter } from 'next/router';
import { Loading } from './Loading';

export function Nav() {
  const {
    isAuthenticated,
    isLoading,
    user,
    loginWithRedirect,
    logout,
  } = useAuth0();
  const { pathname } = useRouter();

  if (isLoading) {
    return <Loading />;
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <span className="navbar-brand">@auth0/auth0-react</span>
      <div className="collapse navbar-collapse">
        <div className="navbar-nav">
          <Link href="/">
            <a
              className={`nav-item nav-link${
                pathname === '/' ? ' active' : ''
              }`}
            >
              Home
            </a>
          </Link>
          <Link href="/users">
            <a
              className={`nav-item nav-link${
                pathname === '/users' ? ' active' : ''
              }`}
            >
              Users
            </a>
          </Link>
        </div>
      </div>

      {isAuthenticated ? (
        <div>
          <span id="hello">Hello, {user.name}!</span>{' '}
          <button
            className="btn btn-outline-secondary"
            id="logout"
            onClick={() => logout({ returnTo: window.location.origin })}
          >
            logout
          </button>
        </div>
      ) : (
        <button
          className="btn btn-outline-success"
          id="login"
          onClick={() => loginWithRedirect()}
        >
          login
        </button>
      )}
    </nav>
  );
}
