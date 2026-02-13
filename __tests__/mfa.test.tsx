import { renderHook, waitFor } from '@testing-library/react';
import useAuth0 from '../src/use-auth0';
import { createWrapper } from './helpers';

describe('MFA API', () => {
  describe('Basic Availability', () => {
    it('should provide mfa client through useAuth0', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useAuth0(), { wrapper });

      await waitFor(() => {
        expect(result.current.mfa).toBeDefined();
      });
    });

    it('should provide all five MFA methods', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useAuth0(), { wrapper });

      await waitFor(() => {
        expect(result.current.mfa.getAuthenticators).toBeDefined();
        expect(result.current.mfa.enroll).toBeDefined();
        expect(result.current.mfa.challenge).toBeDefined();
        expect(result.current.mfa.verify).toBeDefined();
        expect(result.current.mfa.getEnrollmentFactors).toBeDefined();
      });
    });
  });

  describe('Method Success Tests', () => {
    it('should call mfa.getAuthenticators', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useAuth0(), { wrapper });

      await waitFor(async () => {
        const authenticators = await result.current.mfa.getAuthenticators('test-mfa-token');
        expect(authenticators).toBeDefined();
        expect(Array.isArray(authenticators)).toBe(true);
      });
    });

    it('should call mfa.enroll', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useAuth0(), { wrapper });

      await waitFor(async () => {
        const enrollment = await result.current.mfa.enroll({
          mfaToken: 'test-mfa-token',
          factorType: 'otp',
        });
        expect(enrollment).toBeDefined();
        expect(enrollment.id).toBe('test-id');
      });
    });

    it('should call mfa.challenge', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useAuth0(), { wrapper });

      await waitFor(async () => {
        const response = await result.current.mfa.challenge({
          mfaToken: 'test-mfa-token',
          challengeType: 'otp',
          authenticatorId: 'test-auth-id',
        });
        expect(response).toBeDefined();
        expect(response.challengeType).toBe('otp');
      });
    });

    it('should call mfa.verify', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useAuth0(), { wrapper });

      await waitFor(async () => {
        const tokens = await result.current.mfa.verify({
          mfaToken: 'test-mfa-token',
          otp: '123456',
        });
        expect(tokens).toBeDefined();
        expect(tokens.access_token).toBe('test-token');
      });
    });

    it('should call mfa.getEnrollmentFactors', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useAuth0(), { wrapper });

      await waitFor(async () => {
        const factors = await result.current.mfa.getEnrollmentFactors('test-mfa-token');
        expect(factors).toBeDefined();
        expect(Array.isArray(factors)).toBe(true);
      });
    });
  });
});
