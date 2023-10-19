import React, { PropsWithChildren, createContext, useMemo } from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import {
  Auth0Provider,
  AppState,
  initialContext,
  Auth0ContextInterface,
  useAuth0,
  User,
} from '@auth0/auth0-react';
import { BrowserRouter, useNavigate } from 'react-router-dom';
import { Auth0ProviderOptions } from '../../../src';

export const MyAuth0Context =
  createContext<Auth0ContextInterface>(initialContext);

const MyAuth0Provider = ({ children }: { children?: React.ReactNode }) => {
  const { user, ...rest } = useAuth0();
  const contextValue = useMemo<Auth0ContextInterface<User>>(() => {
    return {
      user,
      ...rest,
    };
  }, [user?.updated_at, rest.isLoading, rest.isAuthenticated]);
  return (
    <MyAuth0Context.Provider value={contextValue}>
      {children}
    </MyAuth0Context.Provider>
  );
};

const Auth0ProviderWithRedirectCallback = ({
  children,
  ...props
}: PropsWithChildren<Auth0ProviderOptions>) => {
  const navigate = useNavigate();

  const onRedirectCallback = (appState?: AppState) => {
    navigate((appState && appState.returnTo) || window.location.pathname);
  };

  return (
    <Auth0Provider onRedirectCallback={onRedirectCallback} {...props}>
      {children}
    </Auth0Provider>
  );
};

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <Auth0ProviderWithRedirectCallback
        domain={process.env.REACT_APP_DOMAIN}
        clientId={process.env.REACT_APP_CLIENT_ID}
        authorizationParams={{
          audience: process.env.REACT_APP_AUDIENCE,
          scope: 'profile email read:users',
          redirect_uri: window.location.origin,
        }}
      >
        <MyAuth0Provider>
          <App />
        </MyAuth0Provider>
      </Auth0ProviderWithRedirectCallback>
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById('root')
);
