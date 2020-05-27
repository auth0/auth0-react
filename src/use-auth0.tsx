import { useContext } from 'react';
import Auth0Context, { Auth0ContextInterface } from './auth0-context';

/**
 * useAuth0 main hook
 */
const useAuth0 = (): Auth0ContextInterface => useContext(Auth0Context);

export default useAuth0;
