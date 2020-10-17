import React from 'react';
import { Loading } from './Loading';
import { Error } from './Error';
import { useQuery } from 'react-query';

type User = {
  name: string;
  email: string;
}

export function Users() {
  const { isLoading, error, data: users = [] } = useQuery<User[], Error>([
    '/users',
    {
      audience: process.env.REACT_APP_AUDIENCE,
      scope: 'read:users',
    }
  ]);

  if (isLoading) {
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
