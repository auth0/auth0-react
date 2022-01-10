import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { createBrowserHistory } from 'history';
import {
  Route,
  unstable_HistoryRouter as HistoryRouter,
  Routes,
} from 'react-router-dom';
import './App.css';
import { Nav } from './Nav';
import { Error } from './Error';
import { Loading } from './Loading';
import { Users } from './Users';
import { ProtectedRoute } from './ProtectedRoute';

// Use `createHashHistory` to use hash routing
export const history = createBrowserHistory();

function App() {
  const { isLoading, error } = useAuth0();

  if (isLoading) {
    return <Loading />;
  }

  return (
    <HistoryRouter history={history}>
      <Nav />
      {error && <Error message={error.message} />}
      <Routes>
        <Route path="/" />
        <Route path="/users" element={<ProtectedRoute component={Users} />} />
      </Routes>
    </HistoryRouter>
  );
}

export default App;
