import { act, renderHook, waitFor } from '@testing-library/react';
import { Auth0Client, MyAccountApiError } from '@auth0/auth0-spa-js';
import useAuth0 from '../src/use-auth0';
import type {
  GetUserProfileOptions,
  ProfileFieldPolicy,
  UpdateUserProfileRequest,
  UserProfile,
} from '../src';
import { createWrapper } from './helpers';

const clientMock = jest.mocked(new Auth0Client({ clientId: '', domain: '' }));

describe('MyAccount API', () => {
  describe('Basic Availability', () => {
    it('should provide myAccount client through useAuth0', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useAuth0(), { wrapper });

      await waitFor(() => {
        expect(result.current.myAccount).toBeDefined();
      });
    });

    it('should provide all nine MyAccount methods', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useAuth0(), { wrapper });

      await waitFor(() => {
        expect(result.current.myAccount.getUserProfile).toBeDefined();
        expect(result.current.myAccount.updateUserProfile).toBeDefined();
        expect(result.current.myAccount.getFactors).toBeDefined();
        expect(result.current.myAccount.getAuthenticationMethods).toBeDefined();
        expect(result.current.myAccount.getAuthenticationMethod).toBeDefined();
        expect(result.current.myAccount.updateAuthenticationMethod).toBeDefined();
        expect(result.current.myAccount.deleteAuthenticationMethod).toBeDefined();
        expect(result.current.myAccount.enrollmentChallenge).toBeDefined();
        expect(result.current.myAccount.enrollmentVerify).toBeDefined();
      });
    });
  });

  describe('Method Success Tests', () => {
    it('should call myAccount.getFactors', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useAuth0(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      const factors = await result.current.myAccount.getFactors();
      expect(Array.isArray(factors)).toBe(true);
    });

    it('should call myAccount.getAuthenticationMethods without filter', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useAuth0(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      const methods = await result.current.myAccount.getAuthenticationMethods();
      expect(Array.isArray(methods)).toBe(true);
    });

    it('should call myAccount.getAuthenticationMethods with type filter', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useAuth0(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      const methods = await result.current.myAccount.getAuthenticationMethods('passkey');
      expect(Array.isArray(methods)).toBe(true);
      expect(clientMock.myAccount.getAuthenticationMethods).toHaveBeenCalledWith('passkey');
    });

    it('should call myAccount.getAuthenticationMethod', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useAuth0(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      const method = await result.current.myAccount.getAuthenticationMethod('test-method-id');
      expect(method.id).toBe('test-method-id');
    });

    it('should call myAccount.updateAuthenticationMethod', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useAuth0(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      const updated = await result.current.myAccount.updateAuthenticationMethod('test-method-id', { name: 'My Passkey' });
      expect(updated.id).toBe('test-method-id');
    });

    it('should call myAccount.deleteAuthenticationMethod', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useAuth0(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await expect(
        result.current.myAccount.deleteAuthenticationMethod('test-method-id')
      ).resolves.toBeUndefined();
    });

    it('should call myAccount.enrollmentChallenge', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useAuth0(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      const challenge = await result.current.myAccount.enrollmentChallenge({ type: 'totp' });
      expect(challenge.id).toBe('test-challenge-id');
      expect(challenge.auth_session).toBe('test-auth-session');
    });

    it('should call myAccount.enrollmentVerify', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useAuth0(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      const verified = await result.current.myAccount.enrollmentVerify({
        type: 'totp',
        location: 'https://example.auth0.com/enroll',
        auth_session: 'test-auth-session',
        otp_code: '123456',
      });
      expect(verified.id).toBe('test-method-id');
    });
  });

  describe('User Profile', () => {
    it('should call myAccount.getUserProfile without options', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useAuth0(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      const profile = await result.current.myAccount.getUserProfile();
      expect(clientMock.myAccount.getUserProfile).toHaveBeenCalledWith();
      expect(profile.user_id).toBe('auth0|123');
      expect(profile.given_name).toBe('Alice');
      expect(profile.profile_policy).toBeDefined();
    });

    it('should pass fields to myAccount.getUserProfile', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useAuth0(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      const options: GetUserProfileOptions = {
        fields: ['given_name', 'family_name', 'profile_policy'],
      };
      await result.current.myAccount.getUserProfile(options);
      expect(clientMock.myAccount.getUserProfile).toHaveBeenCalledWith({
        fields: ['given_name', 'family_name', 'profile_policy'],
      });
    });

    it('should pass includeFields: false to myAccount.getUserProfile', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useAuth0(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await result.current.myAccount.getUserProfile({
        fields: ['profile_policy'],
        includeFields: false,
      });
      expect(clientMock.myAccount.getUserProfile).toHaveBeenCalledWith({
        fields: ['profile_policy'],
        includeFields: false,
      });
    });

    it('should return the profile_policy from myAccount.getUserProfile', async () => {
      const policy: ProfileFieldPolicy = {
        access: 'read_only',
        source: 'idp',
        reason: 'managed_by_identity_provider',
      };
      const profile: UserProfile = {
        user_id: 'auth0|123',
        given_name: 'Alice',
        email: 'alice@example.com',
        email_verified: true,
        profile_policy: { '/given_name': policy },
      };
      clientMock.myAccount.getUserProfile.mockResolvedValueOnce(profile);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useAuth0(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      const returned = await result.current.myAccount.getUserProfile();
      expect(returned).toEqual(profile);
      expect(returned.profile_policy?.['/given_name']).toEqual(policy);
    });

    it('should call myAccount.updateUserProfile with the fields to change', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useAuth0(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      const data: UpdateUserProfileRequest = {
        given_name: 'Alice',
        nickname: 'wonderland_alice',
      };
      const updated = await result.current.myAccount.updateUserProfile(data);
      expect(clientMock.myAccount.updateUserProfile).toHaveBeenCalledWith({
        given_name: 'Alice',
        nickname: 'wonderland_alice',
      });
      expect(updated.nickname).toBe('wonderland_alice');
    });

    it('should pass an empty object to myAccount.updateUserProfile unchanged', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useAuth0(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await result.current.myAccount.updateUserProfile({});
      expect(clientMock.myAccount.updateUserProfile).toHaveBeenCalledWith({});
    });

    it('should not change auth state when reading or updating the profile', async () => {
      const user = { sub: 'auth0|123' };
      clientMock.getUser.mockResolvedValueOnce(user);
      const wrapper = createWrapper();
      const { result } = renderHook(() => useAuth0(), { wrapper });

      await waitFor(() => expect(result.current.isAuthenticated).toBe(true));

      await act(async () => {
        await result.current.myAccount.getUserProfile();
        await result.current.myAccount.updateUserProfile({ given_name: 'Alice' });
      });

      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user).toBe(user);
    });

    it('should throw when the profile methods are used outside Auth0Provider', () => {
      const { result } = renderHook(() => useAuth0());

      expect(result.current.myAccount.getUserProfile).toThrow(
        'You forgot to wrap your component in <Auth0Provider>.'
      );
      expect(result.current.myAccount.updateUserProfile).toThrow(
        'You forgot to wrap your component in <Auth0Provider>.'
      );
    });

    it('should propagate a 403 MyAccountApiError from getUserProfile when the feature is not enabled', async () => {
      const error = new MyAccountApiError({
        type: 'https://auth0.com/api-errors/A0E-403-0003',
        status: 403,
        title: 'Not Entitled',
        detail: 'This feature is currently not enabled',
      });
      clientMock.myAccount.getUserProfile.mockRejectedValueOnce(error);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useAuth0(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      const promise = result.current.myAccount.getUserProfile();
      await expect(promise).rejects.toBeInstanceOf(MyAccountApiError);
      await expect(promise).rejects.toMatchObject({
        status: 403,
        title: 'Not Entitled',
      });
    });

    it('should propagate a 403 MyAccountApiError from updateUserProfile when the feature is not enabled', async () => {
      const error = new MyAccountApiError({
        type: 'https://auth0.com/api-errors/A0E-403-0003',
        status: 403,
        title: 'Not Entitled',
        detail: 'This feature is currently not enabled',
      });
      clientMock.myAccount.updateUserProfile.mockRejectedValueOnce(error);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useAuth0(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await expect(
        result.current.myAccount.updateUserProfile({ given_name: 'Alice' })
      ).rejects.toMatchObject({ name: 'MyAccountApiError', status: 403 });
    });

    it('should propagate validation_errors from updateUserProfile for a read-only field', async () => {
      const error = new MyAccountApiError({
        type: 'A0E-400-0008',
        status: 400,
        title: 'read_only_field',
        detail: 'Field is read-only',
        validation_errors: [
          {
            pointer: '/given_name',
            detail: 'Field is managed by the identity provider',
            source: 'managed_by_identity_provider',
          },
        ],
      });
      clientMock.myAccount.updateUserProfile.mockRejectedValueOnce(error);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useAuth0(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await expect(
        result.current.myAccount.updateUserProfile({ given_name: 'Alice' })
      ).rejects.toMatchObject({
        status: 400,
        title: 'read_only_field',
        validation_errors: [
          { pointer: '/given_name', source: 'managed_by_identity_provider' },
        ],
      });
    });
  });

  describe('Error Handling', () => {
    it('should propagate MyAccountApiError thrown by a method', async () => {
      const error = new MyAccountApiError({
        type: 'https://auth0.com/docs/errors#insufficient-scope',
        status: 403,
        title: 'Forbidden',
        detail: 'Insufficient scope to access this resource',
      });
      clientMock.myAccount.getAuthenticationMethods.mockRejectedValueOnce(error);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useAuth0(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await expect(
        result.current.myAccount.getAuthenticationMethods()
      ).rejects.toBeInstanceOf(MyAccountApiError);
    });
  });
});
