import React from 'react';
import { withAuthenticationRequired } from '@auth0/auth0-react';
import { Route } from 'react-router-dom';

export const ProtectedRoute = ({
  component,
  ...args
}: React.PropsWithChildren<any>) => (
  <Route
    render={(props) => {
      let Component = withAuthenticationRequired(component, {
        // If using a Hash Router, you need to pass the hash fragment as `returnTo`
        // returnTo: () => window.location.hash.substr(1),
      });
      return <Component {...props} />;
    }}
    {...args}
  />
);
