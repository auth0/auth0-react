import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Nav } from '../components/Nav';
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
    </>
  );
};

export default IndexPage;
