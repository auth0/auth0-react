import { useContext } from 'react';
import Auth0Context, { Auth0ContextInterface } from './auth0-context';

export default (): Auth0ContextInterface => useContext(Auth0Context);
