import React from 'react';
import { withAuthenticationRequired } from '@auth0/auth0-react';
import { useApi } from '../hooks/use-api';
import { Loading } from '../components/Loading';
import { Error } from '../components/Error';

const PORT = process.env.NEXT_PUBLIC_API_PORT || 3001;

const Users = () => {
  const { loading, error, data: users = [] } = useApi(
    `http://localhost:${PORT}/users`,
    {
      audience: process.env.NEXT_PUBLIC_AUDIENCE,
      scope: 'read:users',
    }
  );

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <Error message={error.message} />;
  }

  return (
    <table className="table">
      <thead>
        <tr>
          <th scope="col">Name</th>
          <th scope="col">Email</th>
        </tr>
      </thead>
      <tbody>
        {users.map(({ name, email }, i) => (
          <tr key={i}>
            <td>{name}</td>
            <td>{email}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default withAuthenticationRequired(Users);
