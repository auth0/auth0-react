# Frequently Asked Questions

**Note:** `auth0-react` uses [Auth0 SPA JS](https://github.com/auth0/auth0-spa-js) behind the scenes, so be sure to check [their FAQs](https://github.com/auth0/auth0-spa-js/blob/main/FAQ.md) too.

1. [User is not logged in after page refresh](#1-user-is-not-logged-in-after-page-refresh)
2. [User is not logged in after successful sign in with redirect](#2-user-is-not-logged-in-after-successful-sign-in-with-redirect)
3. [How to handle authentication in Electron or other native applications using react](#3-how-to-handle-authentication-in-electron-or-other-native-applications)

## 1. User is not logged in after page refresh

There are usually 2 reasons for this:

**1. The user logged in with a Social Provider (like Google) and you are using the Auth0 Developer Keys**

If you are using the [Classic Universal Login](https://auth0.com/docs/universal-login/classic) experience, [Silent Authentication](https://auth0.com/docs/authorization/configure-silent-authentication) won't work on the `/authorize` endpoint. This library uses Silent Authentication internally to check if a user is already signed in after page refresh, so that won't work either. You should either change to the [New Universal Login](https://auth0.com/docs/universal-login/new-experience) experience or [add your own keys](https://auth0.com/docs/connections/identity-providers-social) to that particular social connection.

**2. You are using a browser like Safari or Brave that has Intelligent Tracking Prevention turned on by default**

In this case Silent Authentication will not work because it relies on a hidden iframe being logged in to a different domain (usually `auth0.com`) and browsers with ITP do not allow third-party (eg iframed) cookies. There are 2 workarounds for this using [Rotating Refresh Tokens](https://auth0.com/docs/tokens/refresh-tokens/refresh-token-rotation) or [Custom Domains](https://auth0.com/docs/custom-domains)

## 2. User is not logged in after successful sign in with redirect

If after successfully logging in, your user returns to your SPA and is still not authenticated, do _not_ refresh the page - go to the Network tab on Chrome and confirm that the POST to `oauth/token` resulted in an error `401 Unauthorized`. If this is the case, your tenant is most likely misconfigured. Go to your **Application Properties** in your application's settings in the [Auth0 Dashboard](https://manage.auth0.com) and make sure that `Application Type` is set to `Single Page Application` and `Token Endpoint Authentication Method` is set to `None` (**Note:** there is a known issue with the Auth0 "Default App", if you are unable to set `Token Endpoint Authentication Method` to `None`, create a new Application of type `Single Page Application` or see the advice in [issues/93](https://github.com/auth0/auth0-react/issues/93#issuecomment-673431605))

## 3. How to handle authentication in Electron or other native applications

When using Auth0 React in Electron or other native/desktop applications, handling authentication redirects can be challenging because:

1. The default redirect-based authentication flow requires page reloads, which may need special handling in native contexts
2. Native apps often use custom URL schemes (like `electron://`, `file://`) for deep linking

The `setAuthCallbackUrl` method provides a solution for these scenarios by allowing you to manually set the authentication callback URL with auth parameters.

**Example usage in Electron:**

```tsx
import { useAuth0 } from '@auth0/auth0-react';

function App() {
  const { loginWithRedirect, setAuthCallbackUrl } = useAuth0();

  // Set up a custom protocol handler in your Electron app
  // When your app receives a deep link with auth params, call:
  const handleAuthCallback = (url) => {
    setAuthCallbackUrl(url);
  };

  return <button onClick={() => loginWithRedirect()}>Log in</button>;
}
```

You would need to configure your Electron app to:

1. Register a custom URL protocol (e.g., `your-app://`)
2. Set your Auth0 application's callback URL to include this protocol in the **Allowed Callback URLs** section of the **Settings** tab of your Auth0 application.
3. Intercept the callback URL in your main process and pass it to your renderer where you can call `setAuthCallbackUrl`

This approach prevents having to reload the entire application when handling authentication callbacks and works well with custom URL schemes that native applications typically use.
