import React, { useEffect, useContext } from 'react';
import { withAuthenticationRequired } from '@auth0/auth0-react';
import { Route, Routes } from 'react-router-dom';
import './App.css';
import { Nav } from './Nav';
import { Error } from './Error';
import { Loading } from './Loading';
import { Users } from './Users';
import { MyAuth0Context } from './';

const ProtectedUsers = withAuthenticationRequired(Users);

function App() {
  const { isLoading, error, isAuthenticated, getAccessTokenSilently } =
    useContext(MyAuth0Context);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }
    (async () => {
      console.log(
        await getAccessTokenSilently({
          cacheMode: 'off',
          authorizationParams: { audience: 'https://api/tv-shows' },
        })
      );
      console.log(
        await getAccessTokenSilently({
          cacheMode: 'off',
          authorizationParams: { audience: 'http://testjj' },
        })
      );
      console.log(
        await getAccessTokenSilently({
          cacheMode: 'off',
          authorizationParams: { audience: 'aaa' },
        })
      );
    })();
  }, [getAccessTokenSilently, isAuthenticated]);

  console.log('RENDER');

  if (isLoading) {
    return <Loading />;
  }

  return (
    <>
      <Nav />
      {error && <Error message={error.message} />}
      <Routes>
        <Route path="/" />
        <Route path="/users" element={<ProtectedUsers />} />
      </Routes>
    </>
  );
}

export default App;
