// Augments @auth0/auth0-spa-js with unreleased Enterprise Connect exports.
// Remove once isFederatedDomain ships in the published package.
import '@auth0/auth0-spa-js';

declare module '@auth0/auth0-spa-js' {
  export interface IsFederatedDomainOptions {
    customFetch?: typeof fetch;
    telemetry?: { name: string; version: string; env?: Record<string, string> };
  }
  export function isFederatedDomain(
    auth0Domain: string,
    emailDomain: string,
    options?: IsFederatedDomainOptions
  ): Promise<boolean>;
}
