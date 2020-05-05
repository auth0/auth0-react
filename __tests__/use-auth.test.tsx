import useAuth from '../src/use-auth';
import { renderHook } from '@testing-library/react-hooks';
import { createWrapper } from './helpers';

describe('useAuth', () => {
  it('should provide the auth context', async () => {
    const wrapper = createWrapper();
    const {
      result: { current },
      waitForNextUpdate,
    } = renderHook(useAuth, { wrapper });
    await waitForNextUpdate();
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
