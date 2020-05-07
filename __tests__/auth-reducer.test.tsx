import { reducer } from '../src/reducer';
import { initialAuthState } from '../src/auth-state';

describe('reducer', () => {
  it('should initialise when authenticated', async () => {
    const payload = {
      isAuthenticated: true,
      user: 'Bob',
    };
    expect(
      reducer(initialAuthState, { type: 'INITIALISED', ...payload })
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
      reducer(initialAuthState, { type: 'INITIALISED', ...payload })
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
    expect(reducer(initialAuthState, { type: 'ERROR', ...payload })).toEqual({
      ...initialAuthState,
      isLoading: false,
      ...payload,
    });
  });
});
