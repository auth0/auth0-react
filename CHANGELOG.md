# Change Log

## [v2.2.1](https://github.com/auth0/auth0-react/tree/v2.2.1) (2023-08-22)
[Full Changelog](https://github.com/auth0/auth0-react/compare/v2.2.0...v2.2.1)

**Fixed**
- bump auth0-spa-js to latest version [\#560](https://github.com/auth0/auth0-react/pull/560) ([frederikprijck](https://github.com/frederikprijck))

## [v2.2.0](https://github.com/auth0/auth0-react/tree/v2.2.0) (2023-07-13)
[Full Changelog](https://github.com/auth0/auth0-react/compare/v2.1.1...v2.2.0)

**Added**
- Support Organization Name [\#552](https://github.com/auth0/auth0-react/pull/552) ([frederikprijck](https://github.com/frederikprijck))

**Fixed**
- Fix incorrect logout jsdocx example [\#551](https://github.com/auth0/auth0-react/pull/551) ([frederikprijck](https://github.com/frederikprijck))
- Fix inconsistent logout function types [\#548](https://github.com/auth0/auth0-react/pull/548) ([frederikprijck](https://github.com/frederikprijck))

## [v2.1.1](https://github.com/auth0/auth0-react/tree/v2.1.1) (2023-06-14)
[Full Changelog](https://github.com/auth0/auth0-react/compare/v2.1.0...v2.1.1)

**Changed**
- bump SPA-JS to the latest version [\#543](https://github.com/auth0/auth0-react/pull/543) ([frederikprijck](https://github.com/frederikprijck))

## [v2.1.0](https://github.com/auth0/auth0-react/tree/v2.1.0) (2023-05-05)
[Full Changelog](https://github.com/auth0/auth0-react/compare/v2.0.2...v2.1.0)

**Added**
- Adding onBeforeAuthentication to the withAuthenticationRequired HOC [\#534](https://github.com/auth0/auth0-react/pull/534) ([stephenkelzer](https://github.com/stephenkelzer))

## [v2.0.2](https://github.com/auth0/auth0-react/tree/v2.0.2) (2023-04-26)
[Full Changelog](https://github.com/auth0/auth0-react/compare/v2.0.1...v2.0.2)

**Fixed**
- Remove useUnknownInCatchVariables to be compliant with TS ^4.4 [\#511](https://github.com/auth0/auth0-react/pull/511) ([cemercier](https://github.com/cemercier))

## [v2.0.1](https://github.com/auth0/auth0-react/tree/v2.0.1) (2023-02-22)
[Full Changelog](https://github.com/auth0/auth0-react/compare/v2.0.0...v2.0.1)

**Fixed**
- Support redirectUri again in a deprecated way [\#507](https://github.com/auth0/auth0-react/pull/507) ([frederikprijck](https://github.com/frederikprijck))

## [v2.0.0](https://github.com/auth0/auth0-react/tree/v2.0.0) (2023-01-19)

Auth0-React v2 includes many significant changes compared to v1:

- Removal of polyfills from bundles
- Introduction of `authorizationParams` and `logoutParams` for properties sent to Auth0
- Removal of `buildAuthorizeUrl` and `buildLogoutUrl`
- Removal of `redirectMethod` on `loginWithRedirect` in favour of `openUrl`
- Removal of `localOnly` from `logout` in favour of `openUrl`
- Renaming of `ignoreCache` to `cacheMode` and introduction of `cache-only`
- Use `application/x-www-form-urlencoded` by default
- Do not fallback to refreshing tokens via iframe by default
- Changes to default scopes and removal of `advancedOptions.defaultScope`
- Removal of `claimCheck` on `withAuthenticationRequired`

As with any major version bump, v2 of Auth0-React contains a set of breaking changes. **Please review [the migration guide](./MIGRATION_GUIDE.md) thoroughly to understand the changes required to migrate your application to v2.**

## [v2.0.0-beta.0](https://github.com/auth0/auth0-react/tree/v2.0.0-beta.0) (2022-12-12)

Auth0-React v2 includes many significant changes compared to v1:

- Removal of polyfills from bundles
- Introduction of `authorizationParams` and `logoutParams` for properties sent to Auth0
- Removal of `buildAuthorizeUrl` and `buildLogoutUrl`
- Removal of `redirectMethod` on `loginWithRedirect` in favour of `openUrl`
- Removal of `localOnly` from `logout` in favour of `openUrl`
- Renaming of `ignoreCache` to `cacheMode` and introduction of `cache-only`
- Use `application/x-www-form-urlencoded` by default
- Do not fallback to refreshing tokens via iframe by default
- Changes to default scopes and removal of `advancedOptions.defaultScope`
- Removal of `claimCheck` on `withAuthenticationRequired`

As with any major version bump, v2 of Auth0-React contains a set of breaking changes. **Please review [the migration guide](./MIGRATION_GUIDE.md) thoroughly to understand the changes required to migrate your application to v2.**

## [v1.12.1](https://github.com/auth0/auth0-react/tree/v1.12.1) (2023-01-12)
[Full Changelog](https://github.com/auth0/auth0-react/compare/v1.12.0...v1.12.1)

**Security**
- Upgrade @auth0/auth0-spa-js to 1.22.6 [\#468](https://github.com/auth0/auth0-react/pull/468) ([ewanharris](https://github.com/ewanharris))

This patch release is identical to `1.12.0` but has been released to ensure tooling no longer detects a vulnerable version of jsonwebtoken being used by `@auth0/auth0-spa-js`.

Even though `1.22.5` of `@auth0/auth0-spa-js` was not vulnerable for the related [CVE](https://unit42.paloaltonetworks.com/jsonwebtoken-vulnerability-cve-2022-23529/) because of the fact that `jsonwebtoken` is a devDependency of `@auth0/auth0-spa-js`, we are cutting a release to ensure build tools no longer report our SDK's that use `@auth0/auth0-spa-js` as vulnerable to the mentioned CVE.

## [v1.12.0](https://github.com/auth0/auth0-react/tree/v1.12.0) (2022-10-12)
[Full Changelog](https://github.com/auth0/auth0-react/compare/v1.11.0...v1.12.0)

**Added**
- [SDK-3666] Support multiple providers [\#416](https://github.com/auth0/auth0-react/pull/416) ([ewanharris](https://github.com/ewanharris))

## [v1.11.0](https://github.com/auth0/auth0-react/tree/v1.11.0) (2022-09-13)
[Full Changelog](https://github.com/auth0/auth0-react/compare/v1.10.2...v1.11.0)

**Added**
- Enrich onRedirectCallback method with User object (#400) [\#401](https://github.com/auth0/auth0-react/pull/401) ([devjmetivier](https://github.com/devjmetivier))

## [v1.10.2](https://github.com/auth0/auth0-react/tree/v1.10.2) (2022-06-22)
[Full Changelog](https://github.com/auth0/auth0-react/compare/v1.10.1...v1.10.2)

**Fixed**
- Correctly extend Error for OAuthError [\#367](https://github.com/auth0/auth0-react/pull/367) ([mjbcopland](https://github.com/mjbcopland))

## [v1.10.1](https://github.com/auth0/auth0-react/tree/v1.10.1) (2022-04-28)
[Full Changelog](https://github.com/auth0/auth0-react/compare/v1.10.0...v1.10.1)

**Fixed**
- Make sure handleRedirectCallback is only called once in StrictMode React 18 [\#355](https://github.com/auth0/auth0-react/pull/355) ([adamjmcgrath](https://github.com/adamjmcgrath))

## [v1.10.0](https://github.com/auth0/auth0-react/tree/v1.10.0) (2022-04-19)
[Full Changelog](https://github.com/auth0/auth0-react/compare/v1.9.0...v1.10.0)

**Added**
- Update React and other deps [\#350](https://github.com/auth0/auth0-react/pull/350) ([adamjmcgrath](https://github.com/adamjmcgrath))

**Fixed**
- appState is an optional argument [\#341](https://github.com/auth0/auth0-react/pull/341) ([adamjmcgrath](https://github.com/adamjmcgrath))

## [v1.9.0](https://github.com/auth0/auth0-react/tree/v1.9.0) (2022-01-14)
[Full Changelog](https://github.com/auth0/auth0-react/compare/v1.8.0...v1.9.0)

**Added**
- Update to auth0-spa-js@1.19.3 [\#319](https://github.com/auth0/auth0-react/pull/319) ([adamjmcgrath](https://github.com/adamjmcgrath))
- Memoize context value in auth0-provider [\#318](https://github.com/auth0/auth0-react/pull/318) ([claycoleman](https://github.com/claycoleman))

**Fixed**
- Avoid potential multiple invocations of loginWithRedirect [\#311](https://github.com/auth0/auth0-react/pull/311) ([kweiberth](https://github.com/kweiberth))
- Add connection property to Auth0ProviderOptions [\#283](https://github.com/auth0/auth0-react/pull/283) ([stevehobbsdev](https://github.com/stevehobbsdev))

## [v1.8.0](https://github.com/auth0/auth0-react/tree/v1.8.0) (2021-09-20)
[Full Changelog](https://github.com/auth0/auth0-react/compare/v1.7.0...v1.8.0)

**Added**
- Bump Auth0-SPA-JS to 1.18.0 [\#279](https://github.com/auth0/auth0-react/pull/279) ([adamjmcgrath](https://github.com/adamjmcgrath))

## [v1.7.0](https://github.com/auth0/auth0-react/tree/v1.7.0) (2021-09-06)
[Full Changelog](https://github.com/auth0/auth0-react/compare/v1.6.0...v1.7.0)

**Added**
- Bump SPA JS to 1.17.1 [\#270](https://github.com/auth0/auth0-react/pull/270) ([adamjmcgrath](https://github.com/adamjmcgrath))

## [v1.6.0](https://github.com/auth0/auth0-react/tree/v1.6.0) (2021-07-14)

**Added**

- [SDK-2603] Expose custom caching options from Auth0 SPA SDK [\#255](https://github.com/auth0/auth0-react/pull/255) ([stevehobbsdev](https://github.com/stevehobbsdev))

## [v1.5.0](https://github.com/auth0/auth0-react/tree/v1.5.0) (2021-05-05)

**Added**

- Expose `handleRedirectCallback` [\#233](https://github.com/auth0/auth0-react/pull/233) ([stevehobbsdev](https://github.com/stevehobbsdev))
- Add TUser type param to useAuth0 hook [\#230](https://github.com/auth0/auth0-react/pull/230) ([Jameskmonger](https://github.com/Jameskmonger))

**Changed**

- Update User type [\#236](https://github.com/auth0/auth0-react/pull/236) ([tkiryu](https://github.com/tkiryu))

**Fixed**

- Check for state along with error param [\#231](https://github.com/auth0/auth0-react/pull/231) ([adamjmcgrath](https://github.com/adamjmcgrath))

## [v1.4.0](https://github.com/auth0/auth0-react/tree/v1.4.0) (2021-03-26)

**Added**

- Update SPA JS, add organizations docs and example [\#211](https://github.com/auth0/auth0-react/pull/211) ([adamjmcgrath](https://github.com/adamjmcgrath))

**Fixed**

- Update auth state on access token fail [\#219](https://github.com/auth0/auth0-react/pull/219) ([adamjmcgrath](https://github.com/adamjmcgrath))
- Updates to user should not update memoized getAccessToken* methods [\#213](https://github.com/auth0/auth0-react/pull/213) ([adamjmcgrath](https://github.com/adamjmcgrath))

## [v1.3.0](https://github.com/auth0/auth0-react/tree/v1.3.0) (2021-02-16)

**Added**

- Added `buildAuthorizeUrl` and `buildLogoutUrl`  [\#190](https://github.com/auth0/auth0-react/pull/190) ([THISS](https://github.com/THISS))

**Changed**

- `isLoading` should default to `true` even when doing SSR [\#193](https://github.com/auth0/auth0-react/pull/193) ([adamjmcgrath](https://github.com/adamjmcgrath))

## [v1.2.0](https://github.com/auth0/auth0-react/tree/v1.2.0) (2020-11-04)

**Added**

- [SDK-2106] Memoize auth methods [\#150](https://github.com/auth0/auth0-react/pull/150) ([adamjmcgrath](https://github.com/adamjmcgrath))
- Add react fast refresh support [\#151](https://github.com/auth0/auth0-react/pull/151) ([Idered](https://github.com/Idered)) 
- [SDK-2105] Skip redirect callback option [\#148](https://github.com/auth0/auth0-react/pull/148) ([adamjmcgrath](https://github.com/adamjmcgrath))
- [SDK-2104] Update peerDeps to account for react 17 [\#147](https://github.com/auth0/auth0-react/pull/147) ([adamjmcgrath](https://github.com/adamjmcgrath))
- [SDK-1938] Update the user/isAuthenticated state after getting a token  [\#146](https://github.com/auth0/auth0-react/pull/146) ([adamjmcgrath](https://github.com/adamjmcgrath))
- Add config argument to getAccessTokenWithPopup [\#141](https://github.com/auth0/auth0-react/pull/141) ([ygist](https://github.com/ygist))
- Export AppState type for custom onRedirectCallback's [\#120](https://github.com/auth0/auth0-react/pull/120) ([adamjmcgrath](https://github.com/adamjmcgrath))

## [v1.1.0](https://github.com/auth0/auth0-react/tree/v1.1.0) (2020-09-17)

**Added**

- [SDK-1927] Check for state param in callback url [\#107](https://github.com/auth0/auth0-react/pull/107) ([adamjmcgrath](https://github.com/adamjmcgrath))
- Support react v16.11 [\#99](https://github.com/auth0/auth0-react/pull/99) ([tiagob](https://github.com/tiagob))

**Fixed**

- [SDK-1836] Update state for local logouts [\#81](https://github.com/auth0/auth0-react/pull/81) ([adamjmcgrath](https://github.com/adamjmcgrath))
- Add config argument to loginWithPopup [\#77](https://github.com/auth0/auth0-react/pull/77) ([Aulos](https://github.com/Aulos))

## [v1.0.0](https://github.com/auth0/auth0-react/tree/v1.0.0) (2020-06-19)

**Breaking Change**

- Allow custom `returnTo` in `withAuthenticationRequired` [\#41](https://github.com/auth0/auth0-react/pull/41) ([adamjmcgrath](https://github.com/adamjmcgrath))

## [v0.4.0](https://github.com/auth0/auth0-react/tree/v0.4.0) (2020-06-05)

**Added**

- [SDK-1697] Add custom user agent to spa js [\#28](https://github.com/auth0/auth0-react/pull/28) ([adamjmcgrath](https://github.com/adamjmcgrath))
- Use `checkSession` to start login [\#27](https://github.com/auth0/auth0-react/pull/27) ([adamjmcgrath](https://github.com/adamjmcgrath))
- [SDK-1690] Add generated API docs [\#25](https://github.com/auth0/auth0-react/pull/25) ([adamjmcgrath](https://github.com/adamjmcgrath))

## [v0.3.1](https://github.com/auth0/auth0-react/tree/v0.3.1) (2020-06-01)

**Fixed**

- getToken methods were being called in the wrong scope [\#24](https://github.com/auth0/auth0-react/pull/24) ([adamjmcgrath](https://github.com/adamjmcgrath))

## [v0.3.0](https://github.com/auth0/auth0-react/tree/v0.3.0) (2020-05-29)

**Added**

- [SDK-1641] Add SSR support [\#17](https://github.com/auth0/auth0-react/pull/17) ([adamjmcgrath](https://github.com/adamjmcgrath))

**Breaking Changes**

- [SDK-1694] Camel case props [\#22](https://github.com/auth0/auth0-react/pull/22) ([adamjmcgrath](https://github.com/adamjmcgrath))
- [SDK-1693] Renames some init props [\#21](https://github.com/auth0/auth0-react/pull/21) ([adamjmcgrath](https://github.com/adamjmcgrath))

## [v0.2.0](https://github.com/auth0/auth0-react/tree/v0.2.0) (2020-05-20)

**Added**

- [SDK-1642] Add missing methods from SPA JS [\#11](https://github.com/auth0/auth0-react/pull/11) ([adamjmcgrath](https://github.com/adamjmcgrath))
- [SDK-1582] Normalize the auth0 error and add error handling to the basic example [\#10](https://github.com/auth0/auth0-react/pull/10) ([adamjmcgrath](https://github.com/adamjmcgrath))

**Changed**

- Rename auth prop to prevent clashes and align with public api [\#14](https://github.com/auth0/auth0-react/pull/14) ([adamjmcgrath](https://github.com/adamjmcgrath))
- Bundle SPA JS with the SDK for easier install [\#13](https://github.com/auth0/auth0-react/pull/13) ([adamjmcgrath](https://github.com/adamjmcgrath))

## [v0.1.0](https://github.com/auth0/auth0-react/tree/v0.1.0) (2020-05-08)

**Added**

- [SDK-1580][SDK-1581] Add withAuth and withLoginRequired [\#7](https://github.com/auth0/auth0-react/pull/7) ([adamjmcgrath](https://github.com/adamjmcgrath))
- [SDK-1583] Setup basic README for Early Access [\#6](https://github.com/auth0/auth0-react/pull/6) ([adamjmcgrath](https://github.com/adamjmcgrath))
- [SDK-1577][SDK-1578] Add login functionality [\#5](https://github.com/auth0/auth0-react/pull/5) ([adamjmcgrath](https://github.com/adamjmcgrath))
- [SDK-1576] Linting [\#4](https://github.com/auth0/auth0-react/pull/4) ([adamjmcgrath](https://github.com/adamjmcgrath))
- [SDK-1572] Added CircleCI config [\#3](https://github.com/auth0/auth0-react/pull/3) ([Widcket](https://github.com/Widcket))
- [SDK-1568] Set up unit tests [\#2](https://github.com/auth0/auth0-react/pull/2) ([adamjmcgrath](https://github.com/adamjmcgrath))
- [SDK-1570][SDK-1571] Setup dev environment and build targets [\#1](https://github.com/auth0/auth0-react/pull/1) ([adamjmcgrath](https://github.com/adamjmcgrath))
