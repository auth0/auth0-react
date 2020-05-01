import useAuth0 from '../src/use-auth0';
import { renderHook } from '@testing-library/react-hooks';
import { Auth0Client } from '@auth0/auth0-spa-js';
import { createWrapper } from './helpers';

jest.mock('@auth0/auth0-spa-js');

describe('useAuth0', () => {
  it('should provide an instance of the Auth0Client', () => {
    const wrapper = createWrapper();
    const {
      result: { current },
    } = renderHook(useAuth0, { wrapper });
    expect(current).toBeInstanceOf(Auth0Client);
  });
});
