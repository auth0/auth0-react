import React from 'react';
import { withAuthenticationRequired } from '@auth0/auth0-react';

export const ProtectedRoute = ({
  component,
  ...args
}: React.PropsWithChildren<any>) => {
  const Component = withAuthenticationRequired(component, args);
  return <Component />;
};
