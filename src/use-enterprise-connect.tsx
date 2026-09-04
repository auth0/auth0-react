import { useCallback, useContext } from 'react';
import {
  isFederatedDomain as spaIsFederatedDomain,
  IsFederatedDomainOptions,
} from '@auth0/auth0-spa-js';
import Auth0Context, {
  Auth0ContextInterface,
  RedirectLoginOptions,
} from './auth0-context';

/**
 * The shape returned by the `useEnterpriseConnect` hook.
 */
export interface UseEnterpriseConnect {
  /**
   * Runs WebFinger domain discovery for the given email domain against the
   * Auth0 domain configured on the `Auth0Provider`. Returns `true` only if
   * the domain is managed by Auth0 for enterprise SSO. A routing hint, not a
   * security control: it returns `false` on any failure.
   */
  isFederatedDomain: (
    emailDomain: string,
    options?: IsFederatedDomainOptions
  ) => Promise<boolean>;
  /**
   * Starts the enterprise SSO redirect, passing the email as `login_hint`
   * so Home Realm Discovery can resolve the connection and organization. Any
   * `authorizationParams` supplied by the caller are preserved.
   */
  loginWithSSO: (
    email: string,
    options?: RedirectLoginOptions
  ) => Promise<void>;
}

/**
 * ```js
 * const { isFederatedDomain, loginWithSSO } = useEnterpriseConnect();
 * ```
 *
 * Convenience hook for the Enterprise Connect flow. `isFederatedDomain` reads
 * the Auth0 domain from the `Auth0Provider` configuration, so callers pass
 * only the email domain. `loginWithSSO` is sugar over `loginWithRedirect`
 * that sets `login_hint` to the provided email.
 */
const useEnterpriseConnect = (
  context = Auth0Context
): UseEnterpriseConnect => {
  const { getConfiguration, loginWithRedirect } = useContext(
    context
  ) as Auth0ContextInterface;

  const isFederatedDomain = useCallback(
    (emailDomain: string, options?: IsFederatedDomainOptions) =>
      spaIsFederatedDomain(getConfiguration().domain, emailDomain, options),
    [getConfiguration]
  );

  const loginWithSSO = useCallback(
    (email: string, options?: RedirectLoginOptions) =>
      loginWithRedirect({
        ...options,
        authorizationParams: {
          ...options?.authorizationParams,
          login_hint: email,
        },
      }),
    [loginWithRedirect]
  );

  return { isFederatedDomain, loginWithSSO };
};

export default useEnterpriseConnect;
