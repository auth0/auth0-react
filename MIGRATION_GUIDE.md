# Auth0-React v2 Migration Guide

With the v2 release of Auth0-React we have updated to the latest version of Auth0-SPA-JS which brings improvements to performance and developer experience. However, as with any major version bump there are some breaking changes that will impact your applications.

Please review this guide thoroughly to understand the changes required to migrate your application to v2.

- [Polyfills and supported browsers](#polyfills-and-supported-browsers)
- [Public API Changes](#public-api-changes)
  - [Introduction of `authorizationParams`](#introduction-of-authorizationparams)
  - [Introduction of `logoutParams`](#introduction-of-logoutparams)
  - [`buildAuthorizeUrl` has been removed](#buildauthorizeurl-has-been-removed)
  - [`buildLogoutUrl` has been removed](#buildlogouturl-has-been-removed)
  - [`redirectMethod` has been removed from `loginWithRedirect`](#redirectmethod-has-been-removed-from-loginwithredirect)
  - [`localOnly` logout has been removed, and replaced by `openUrl`](#localonly-logout-has-been-removed-and-replaced-by-openUrl)
  - [`ignoreCache` on `getAccessTokenSilently` has been removed and replace with `cacheMode`](#ignorecache-on-getaccesstokensilently-has-been-removed-and-replace-with-cachemode)
  - [`application/x-www-form-urlencoded` used by default instead of `application/json`](#applicationx-www-form-urlencoded-used-by-default-instead-of-applicationjson)
  - [No more iframe fallback by default when using refresh tokens](#no-more-iframe-fallback-by-default-when-using-refresh-tokens)
  - [Changes to default scopes](#changes-to-default-scopes)
    - [`advancedOptions` and `defaultScope` are removed](#advancedoptions-and-defaultscope-are-removed)
  - [Removal of `claimCheck` on `withAuthenticationRequired`](#removal-of-claimcheck-on-withauthenticationrequired)

## Polyfills and supported browsers

As [Microsoft has dropped support for IE11](https://blogs.windows.com/windowsexperience/2022/06/15/internet-explorer-11-has-retired-and-is-officially-out-of-support-what-you-need-to-know), Auth0-SPA-JS no longer includes any polyfills in its bundle, as all of these polyfills were for IE11. Therefore, Auth0-React no longer supports IE11 in v2.

The following is the list of polyfills that were removed. If your applications requires any of these, you will need to include them in your application:

- [AbortController](https://www.npmjs.com/package/abortcontroller-polyfill): Used to polyfill [AbortController on IE11, Opera Mini, and some mobile-specific browsers](https://caniuse.com/?search=abortcontroller).
- [Promise](https://www.npmjs.com/package/promise-polyfill): Used to polyfill [Promise on IE11 and Opera Mini](https://caniuse.com/promises)
- [Core-js](https://www.npmjs.com/package/core-js): Used to polyfill a couple of things, also mostly on IE11, Opera Mini, and some mobile-specific browsers:
  - [string/startsWith](https://caniuse.com/?search=startsWith)
  - [string/includes](https://caniuse.com/es6-string-includes)
  - [set](https://caniuse.com/mdn-javascript_builtins_set)
  - [symbol](https://caniuse.com/mdn-javascript_builtins_symbol)
  - [array/from](https://caniuse.com/mdn-javascript_builtins_array_from)
  - [array/includes](https://caniuse.com/array-includes)
- [fast-text-encoding](https://www.npmjs.com/package/fast-text-encoding): Used to polyfill TextEncoder and TextDecoder on IE11 and Opera Mini.
- [unfetch](https://www.npmjs.com/package/unfetch): Used to [ponyfill fetch on IE11](https://caniuse.com/?search=fetch).

By removing these polyfills, the bundle size for Auth0-SPA-JS has dropped 60%. As this is a core dependency of Auth0-React this ensures your users have a better experience when integrating Auth0 into your application using Auth0-React.

## Public API Changes

With the release of this new major version, some changes were made that impact the public API of Auth0-React. If you are using TypeScript, these should be flagged for you. However we still recommend reviewing this list thoroughly as some changes are changes in behavior.

### Introduction of `authorizationParams`

A breaking change that will affect pretty much everyone is the introduction of `authorizationParams`, a more structured approach to providing parameters - including custom parameters - to Auth0.

In v1, objects passed to our methods are always a mix of properties used for configuring the SDK and properties with the sole purpose to pass through to Auth0.

```jsx
ReactDOM.render(
  <Auth0Provider
    domain="YOUR_AUTH0_DOMAIN"
    clientId="YOUR_AUTH0_CLIENT_ID"
    audience="YOUR_AUDIENCE_ID"
    scope="openid profile email"
    redirectUri={window.location.origin}
  >
    <App />
  </Auth0Provider>,
  document.getElementById('app')
);
```

With v2 of our SDK, we have improved the API by separating those properties used to configure the SDK, from properties that are sent to Auth0. The SDK configuration properties will stay on the root, while any property that should be sent to Auth0 should be set on `authorizationParams`.

```jsx
ReactDOM.render(
  <Auth0Provider
    domain="YOUR_AUTH0_DOMAIN"
    clientId="YOUR_AUTH0_CLIENT_ID"
    authorizationParams={{
      redirect_uri: window.location.origin,
      audience: "YOUR_AUDIENCE_ID",
      scope: "openid profile email"
    }}
  >
    <App />
  </Auth0Provider>,
  document.getElementById('app')
);
```

The above changes affect the following methods:

- loginWithRedirect
- loginWithPopup
- getAccessTokenWithPopup
- getAccessTokenSilently
- withAuthenticationRequired (`loginOptions`)

### Changes to parameter casing

With the move to placing Auth0 specific properties in the `authorizationParams` object, these properties will now use the casing used by the Auth0 API. This specifically impacts `redirectUri` and `maxAge` as they previously were camelCase but are now kebab-case:

- `redirectUri` is now `redirect_uri`
- `maxAge` is now `max_age`

### Introduction of `logoutParams`

In v1, `logout` can be called with an object containing a number of properties, both a mix between properties used to configure the SDK as well as those used to pass through to Auth0.

With v2, logout now takes an object that can only contain two properties, `clientId` and `logoutParams`.

Any property, apart from clientId, that you used to set on the root of the object passed to `logout` should now be set on `logoutParams` instead.

```ts
await logout({
  clientId: '',
  logoutParams: {
    federated: true / false,
    returnTo: '',
    any_custom_property: 'value',
  },
});
```

### `buildAuthorizeUrl` has been removed

In v1, we introduced `buildAuthorizeUrl` for applications that couldn’t rely on `window.location.assign` to redirect to Auth0 when calling `loginWithRedirect`, a typical example is for people using v1 of our SDK with Ionic:

```ts
const { buildAuthorizeUrl } = useAuth0();
const url = buildAuthorizeUrl();
await Browser.open({ url });
```

With v2, we have removed `buildAuthorizeUrl`. This means that the snippet above will no longer work, and you should update your code by using `openUrl` instead.

```ts
const { loginWithRedirect } = useAuth0();

await loginWithRedirect({
  async openUrl(url) {
    await Browser.open({ url });
  },
});
```

The above snippet aligns more with the intent, using our SDK to login but relying on Capacitor (or any other external browser) to do the actual redirect.

### `buildLogoutUrl` has been removed

In v1, we introduced `buildLogoutUrl` for applications that are unable to use `window.location.assign` when logging out from Auth0, a typical example is for people using v1 of our SDK with Ionic:

```ts
const { buildLogoutUrl } = useAuth0();
const url = buildLogoutUrl();
await Browser.open({ url });
```

With v2, `buildLogoutUrl` has been removed and you should update any code that is not able to rely on `window.location.assign` to use `openUrl` when calling `logout`:

```ts
const { logout } = useAuth0();

client.logout({
  async openUrl(url) {
    await Browser.open({ url });
  },
});
```

This method was removed because, when using our SDK, the logout method is expected to be called regardless of the browser used. Instead of calling both `logout` and `buildLogoutUrl`, you can now change the redirect behaviour when calling `logout`.

### `redirectMethod` has been removed from `loginWithRedirect`

In v1, `loginWithRedirect` takes a `redirectMethod` that can be set to any of `assign` and `replace`, allowing the users to control whether the SDK should redirect using `window.location.assign` or `window.location.replace`.

```ts
const { loginWithRedirect } = useAuth0();
await loginWithRedirect({
  redirectMethod: 'replace',
});
```

With the release of v2, we have removed `redirectMethod`. If you want to use anything but `window.location.assign` to handle the redirect to Auth0, you should implement `openUrl`:

```ts
const { loginWithRedirect } = useAuth0();
await loginWithRedirect({
  async openUrl(url) {
    window.location.replace(url);
  },
});
```

### `localOnly` logout has been removed, and replaced by `openUrl`

When calling the SDK's `logout` method, v1 supports the ability to specify `localOnly: true`, ensuring our SDK does not redirect to Auth0 but only clears the user state from the application.

With v2, we have removed `localOnly`, but instead provided a way for developers to take control of the redirect behavior by setting `openUrl`. In order to achieve localOnly logout with v2, you should set `openUrl` to `false`.

```ts
const { logout } = useAuth0();
await logout({
  openUrl: false,
});
```

### `ignoreCache` on `getAccessTokenSilently` has been removed and replace with `cacheMode`

In v1, users can bypass the cache when calling `getAccessTokenSilently` by passing ignoreCache: true.

```ts
const { getAccessTokenSilently } = useAuth0();
const token = await getAccessTokenSilently({ ignoreCache: true });
```

With v2, we wanted to add the ability to only retrieve a token from the cache, without contacting Auth0 if no token was found. To do so, we have removed the `ignoreCache` property and replaced it with `cacheMode` that can take any of the following three values:

- **on** (default): read from the cache caching, but fall back to Auth0 as needed
- **off**: ignore the cache, instead always call Auth0
- **cache-only**: read from the cache, don’t fall back to Auth0

Any code that was previously using `ignoreCache: true` should be changed to use `cacheMode: 'off'`:

```ts
const { getAccessTokenSilently } = useAuth0();
const token = await getAccessTokenSilently({ cacheMode: 'off' });
```

### `application/x-www-form-urlencoded` used by default instead of `application/json`

Auth0’s token endpoint supports both `application/x-www-form-urlencoded` and `application/json` content types. However, using `application/x-www-form-urlencoded` provides a small performance benefit.

In v1 of the SDK, the default was to send request to /oauth/token using json, allowing to opt-in to use x-www-form-urlencoded by setting the `useFormData` flag to _true_.

With v2, we have flipped the default value for `useFormData` to **true**, meaning we will be sending requests to Auth0’s token endpoint using `application/x-www-form-urlencoded` as the content type by default.

> :warning: This can affect existing rules and actions, and it’s important to ensure all your actions still work as expected after upgrading to v2.
> To restore the original behaviour, you can set `useFormData` to **false**, and your rules and actions should continue to work as before.

### No more iframe fallback by default when using refresh tokens

When using refresh tokens in v1, we fall back to using iframes whenever a refresh token exchange would fail. This has caused problems before in environments that do not support iframes, and we have specifically introduced `useRefreshTokensFallback` to be able to opt-out of falling back to iframes in the case a refresh_grant fails.

With v2, we have flipped the default value for `useRefreshTokensFallback` to false we do not fall back to using iframes by default when `useRefreshTokens` is `true`, and the refresh token exchange fails.

If you want to restore the original behaviour, and still fall back to iframes when the refresh token exchange fails, you can set `useRefreshTokensFallback` to true.

### Changes to default scopes

Our SDK defaults to requesting `openid profile email` as the scopes. However, when explicitly setting the `scope`, v1 would still include `openid profile email` as well.

With v2, we have reworked this to still default to `openid profile email` when the scope property has been omitted, but only include `openid` when the user sets a scope explicitly.

This means that the following code in v1:

```jsx
ReactDOM.render(
  <Auth0Provider scope="scope1">
    <App />
  </Auth0Provider>,
  document.getElementById('app')
);
```

Needs to be updated to explicitly include the `profile email` scopes to achieve the same in v2:

```jsx
ReactDOM.render(
  <Auth0Provider authorizationParams={{
    scope: "profile email scope1"
  }}>
    <App />
  </Auth0Provider>,
  document.getElementById('app')
);
```

#### `advancedOptions` and `defaultScope` are removed

With v1 of our SDK, users can set both `scope: '...'` and `advancedOptions: { defaultScope: '...' }` when configuring the `Auth0Provider`. As this has proven to be confusing, with v2 we have decided to drop `defaultScope` altogether. As this was its own property, we have also removed `advancedOptions`. Any code that used to rely on `defaultScope` will need to move those scopes into `scope` instead:

```jsx
ReactDOM.render(
  <Auth0Provider advancedOptions={{ defaultScope: 'email' }} scope="scope1">
    <App />
  </Auth0Provider>,
  document.getElementById('app')
);
```

Will need to move those scopes into `scope` instead:

```jsx
ReactDOM.render(
  <Auth0Provider authorizationParams={{
    scope: "email scope1"
  }}>
    <App />
  </Auth0Provider>,
  document.getElementById('app')
);
```

As you can see, `scope` becomes a merged value of the previous `defaultScope` and `scope`.

## Removal of `claimCheck` on `withAuthenticationRequired`

In v1 of Auth0-React the `withAuthenticationRequired` Higher Order Component supported a `claimCheck` property that would check the ID Token's claims and redirect the user back to the Auth0 login page if the check failed. Given that it is unlikely for most user claims to change by logging in again, it would most likely lead to users being stuck in infinite login loops. Therefore, we have chosen to remove this functionality from Auth0-React and instead provide guidance on how to achieve this so that developers can have greater control over the behavior of their application.

In v1, a claim check could be implemented as so

```js
withAuthenticationRequired(MyComponent, {
  claimCheck: (claim?: User) =>
    claim?.['https://my.app.io/jwt/claims']?.ROLE?.includes('ADMIN'),
});
```

Our recommendation is to create another HOC that will perform the claim check and provide this to `withAuthenticationRequired`

```jsx
const withClaimCheck = (Component, myClaimCheckFunction, returnTo) => {
  const WithClaimCheckComponent = () => {
    const { user } =  useAuth0();
    if (myClaimCheckFunction(user)) {
      return <Component />
    }
    Router.push(returnTo);
  }
  return WithClaimCheckComponent;
}

const checkClaims = (claim?: User) => claim?.['https://my.app.io/jwt/claims']?.ROLE?.includes('ADMIN');

// Usage
const Page = withAuthenticationRequired(
  withClaimCheck(Component, checkClaims, '/missing-roles' )
);
```
