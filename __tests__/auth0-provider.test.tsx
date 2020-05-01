import { useContext } from 'react';
import { Auth0Context } from '../src/auth0-provider';
import { renderHook } from '@testing-library/react-hooks';
import { Auth0Client } from '@auth0/auth0-spa-js';
import { createWrapper } from './helpers';

jest.mock('@auth0/auth0-spa-js');

describe('Auth0Provider', () => {
  it('should provide an instance of the Auth0Client', () => {
    const wrapper = createWrapper();
    const {
      result: { current },
    } = renderHook(() => useContext(Auth0Context), { wrapper });
    expect(current).toBeInstanceOf(Auth0Client);
  });

  it('should configure an instance of the Auth0Client', () => {
    const opts = {
      client_id: 'foo',
      domain: 'bar',
    };
    const wrapper = createWrapper(opts);
    renderHook(() => useContext(Auth0Context), {
      wrapper,
    });
    expect(Auth0Client).toHaveBeenCalledWith(opts);
  });
});
