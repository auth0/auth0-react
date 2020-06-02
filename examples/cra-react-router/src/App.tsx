import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { createBrowserHistory } from 'history';
import { Route, Router, Switch } from 'react-router-dom';
import './App.css';
import { ProtectedRoute } from './ProtectedRoute';
import { Nav } from './Nav';
import { Error } from './Error';
import { Loading } from './Loading';
import { Users } from './Users';

export const history = createBrowserHistory();

function App() {
  const { isLoading, error } = useAuth0();

  if (isLoading) {
    return <Loading />;
  }

  return (
    <Router history={history}>
      <Nav />
      {error && <Error message={error.message} />}
      <Switch>
        <Route path="/" exact />
        <ProtectedRoute path="/users" component={Users} />
      </Switch>
    </Router>
  );
}

export default App;
