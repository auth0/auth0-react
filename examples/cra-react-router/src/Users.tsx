import { useApi } from './use-api';
import React from 'react';
import { Loading } from './Loading';
import { Error } from './Error';

export function Users() {
  const { loading, error, data: users = [] } = useApi(
    `http://localhost:${process.env.REACT_APP_API_PORT}/users`,
    {
      audience: process.env.REACT_APP_AUDIENCE,
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
        {users!.map(
          ({ name, email }: { name: string; email: string }, i: number) => (
            <tr key={i}>
              <td>{name}</td>
              <td>{email}</td>
            </tr>
          )
        )}
      </tbody>
    </table>
  );
}
