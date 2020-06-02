import React from 'react';
import ReactDOM from 'react-dom';
import App, { history } from './App';
import { Auth0Provider } from '@auth0/auth0-react';

const onRedirectCallback = (appState: any) => {
  history.replace((appState && appState.returnTo) || window.location.pathname);
};

ReactDOM.render(
  <React.StrictMode>
    <Auth0Provider
      domain="brucke.auth0.com"
      clientId="wLSIP47wM39wKdDmOj6Zb5eSEw3JVhVp"
      redirectUri={window.location.origin}
      onRedirectCallback={onRedirectCallback}
    >
      <App />
    </Auth0Provider>
  </React.StrictMode>,
  document.getElementById('root')
);
