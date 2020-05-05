import { authReducer } from '../src/auth-reducer';
import { initialAuthState } from '../src/auth-state';

describe('authReducer', () => {
  it('should initialise when authenticated', async () => {
    const payload = {
      isAuthenticated: true,
      user: 'Bob',
    };
    expect(
      authReducer(initialAuthState, { type: 'INITIALISED', ...payload })
    ).toEqual({
      ...initialAuthState,
      isLoading: false,
      ...payload,
    });
  });

  it('should initialise when not authenticated', async () => {
    const payload = {
      isAuthenticated: false,
    };
    expect(
      authReducer(initialAuthState, { type: 'INITIALISED', ...payload })
    ).toEqual({
      ...initialAuthState,
      isLoading: false,
      ...payload,
    });
  });

  it('should handle error state', async () => {
    const payload = {
      error: new Error('__test_error__'),
    };
    expect(
      authReducer(initialAuthState, { type: 'ERROR', ...payload })
    ).toEqual({
      ...initialAuthState,
      isLoading: false,
      ...payload,
    });
  });
});
