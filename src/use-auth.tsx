import { useContext } from 'react';
import AuthContext, { AuthContextInterface } from './auth-context';

export default (): AuthContextInterface => useContext(AuthContext);
