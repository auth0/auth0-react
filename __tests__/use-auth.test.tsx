import useAuth from '../src/use-auth';
import { renderHook } from '@testing-library/react-hooks';
import { createWrapper } from './helpers';

jest.mock('@auth0/auth0-spa-js');

describe('useAuth', () => {
  it('should provide the auth context', () => {
    const wrapper = createWrapper();
    const {
      result: { current },
    } = renderHook(useAuth, { wrapper });
    expect(current).toBeDefined();
  });

  it('should throw with no provider', () => {
    const {
      result: { current },
    } = renderHook(useAuth);
    expect(current.login).toThrowError(
      'You forgot to wrap your component in <AuthProvider>.'
    );
  });
});
