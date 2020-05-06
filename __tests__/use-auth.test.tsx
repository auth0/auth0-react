import useAuth0 from '../src/use-auth0';
import { renderHook } from '@testing-library/react-hooks';
import { createWrapper } from './helpers';

describe('useAuth0', () => {
  it('should provide the auth context', async () => {
    const wrapper = createWrapper();
    const {
      result: { current },
      waitForNextUpdate,
    } = renderHook(useAuth0, { wrapper });
    await waitForNextUpdate();
    expect(current).toBeDefined();
  });

  it('should throw with no provider', () => {
    const {
      result: { current },
    } = renderHook(useAuth0);
    expect(current.login).toThrowError(
      'You forgot to wrap your component in <Auth0Provider>.'
    );
  });
});
