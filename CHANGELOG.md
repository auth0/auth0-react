# Change Log

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
