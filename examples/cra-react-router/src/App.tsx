import React from 'react';
import { useAuth0, withAuthenticationRequired } from '@auth0/auth0-react';
import { Route, Routes } from 'react-router-dom';
import './App.css';
import { Nav } from './Nav';
import { Error } from './Error';
import { Loading } from './Loading';
import { Users } from './Users';

const ProtectedUsers = withAuthenticationRequired(Users);

function App() {
  const { isLoading, error } = useAuth0();

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
