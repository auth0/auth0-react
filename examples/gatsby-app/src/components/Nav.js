import React from 'react';
import { Link } from 'gatsby';
import { useAuth0 } from '@auth0/auth0-react';

export function Nav() {
  const { isAuthenticated, user, loginWithRedirect, logout } = useAuth0();
  const pathname = typeof window !== 'undefined' && window.location.pathname;

  return (
    <nav className="navbar navbar-expand-md navbar-light bg-light">
      <div className="container-fluid">
        <span className="navbar-brand">@auth0/auth0-react</span>
        <div className="collapse navbar-collapse">
          <div className="navbar-nav">
            <Link
              to="/"
              className={`nav-item nav-link${
                pathname === '/' ? ' active' : ''
              }`}
            >
              Home
            </Link>
            <Link
              to="/users"
              className={`nav-item nav-link${
                pathname === '/users' ? ' active' : ''
              }`}
            >
              Users
            </Link>
          </div>
        </div>

        {isAuthenticated ? (
          <div>
            <span id="hello">Hello, {user.name}!</span>{' '}
            <button
              className="btn btn-outline-secondary"
              id="logout"
              onClick={() =>
                logout({ logoutParams: { returnTo: window.location.origin } })
              }
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
      </div>
    </nav>
  );
}
