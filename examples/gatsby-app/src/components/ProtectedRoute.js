import React from 'react';
import { withAuthenticationRequired } from '@auth0/auth0-react';

const PrivateRoute = ({ component: Component, ...rest }) => {
  const PrivateComponent = withAuthenticationRequired(Component);
  return <PrivateComponent {...rest} />;
};

export default PrivateRoute;
