import { useApi } from '../hooks/use-api';
import React from 'react';
import { Loading } from './Loading';
import { Error } from './Error';

const PORT = process.env.GATSBY_API_PORT || 3001;

export function Users() {
  const {
    loading,
    error,
    data: users = [],
  } = useApi(`http://localhost:${PORT}/users`, {
    audience: process.env.GATSBY_AUDIENCE,
    scope: 'profile email read:users',
  });

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
}
