import React from 'react';
import { Router } from '@reach/router';
import { useAuth0 } from '@auth0/auth0-react';
import { Nav } from '../components/Nav';
import ProtectedRoute from '../components/ProtectedRoute';
import { Users } from '../components/Users';
import { Loading } from '../components/Loading';
import { Error } from '../components/Error';

const IndexPage = () => {
  const { isLoading, error } = useAuth0();

  if (isLoading) {
    return <Loading />;
  }

  return (
    <>
      <Nav />
      {error && <Error message={error.message} />}
      <Router>
        <ProtectedRoute path="/users" component={Users} />
      </Router>
    </>
  );
};

export default IndexPage;
