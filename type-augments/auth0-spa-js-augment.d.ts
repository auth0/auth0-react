// Augments @auth0/auth0-spa-js with the unreleased Enterprise Connect exports
// so auth0-react compiles against a locally-mapped spa-js build.
// Remove once `isFederatedDomain` ships in a published @auth0/auth0-spa-js
// release and the dependency is bumped (see the enterprise-connect spa-js
// release). Kept outside src/ so it is never emitted into dist/ types.
import '@auth0/auth0-spa-js';

declare module '@auth0/auth0-spa-js' {
  export interface IsFederatedDomainOptions {
    customFetch?: typeof fetch;
    telemetry?:
      | { enabled: false }
      | ({ enabled?: true } & { name: string; version: string });
  }
  export function isFederatedDomain(
    auth0Domain: string,
    emailDomain: string,
    options?: IsFederatedDomainOptions
  ): Promise<boolean>;
}
