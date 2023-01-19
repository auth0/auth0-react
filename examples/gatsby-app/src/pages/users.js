import React from 'react';
import { withAuthenticationRequired } from '@auth0/auth0-react';
import { Users } from '../components/Users';
import { Nav } from '../components/Nav';

const PORT = process.env.GATSBY_API_PORT || 3001;

const UsersPage = () => {
  return (
    <>
      <Nav />
      <Users />
    </>
  );
};

export default withAuthenticationRequired(UsersPage);
