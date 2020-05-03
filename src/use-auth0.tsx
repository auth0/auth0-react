import { useContext } from 'react';
import { Auth0Context } from './auth0-provider';
import { Auth0Client } from '@auth0/auth0-spa-js';

export default (): Auth0Client | null => useContext(Auth0Context);
