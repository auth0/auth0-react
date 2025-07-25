# Frequently Asked Questions

**Note:** `auth0-react` uses [Auth0 SPA JS](https://github.com/auth0/auth0-spa-js) behind the scenes, so be sure to check [their FAQs](https://github.com/auth0/auth0-spa-js/blob/main/FAQ.md) too.

1. [User is not logged in after page refresh](#1-user-is-not-logged-in-after-page-refresh)
2. [User is not logged in after successful sign in with redirect](#2-user-is-not-logged-in-after-successful-sign-in-with-redirect)
3. [Skip the Auth0 login page](#3-skip-the-auth0-login-page)

## 1. User is not logged in after page refresh

There are usually 2 reasons for this:

**1. The user logged in with a Social Provider (like Google) and you are using the Auth0 Developer Keys**

If you are using the [Classic Universal Login](https://auth0.com/docs/universal-login/classic) experience, [Silent Authentication](https://auth0.com/docs/authorization/configure-silent-authentication) won't work on the `/authorize` endpoint. This library uses Silent Authentication internally to check if a user is already signed in after page refresh, so that won't work either. You should either change to the [New Universal Login](https://auth0.com/docs/universal-login/new-experience) experience or [add your own keys](https://auth0.com/docs/connections/identity-providers-social) to that particular social connection.

**2. You are using a browser like Safari or Brave that has Intelligent Tracking Prevention turned on by default**

In this case Silent Authentication will not work because it relies on a hidden iframe being logged in to a different domain (usually `auth0.com`) and browsers with ITP do not allow third-party (eg iframed) cookies. There are 2 workarounds for this using [Rotating Refresh Tokens](https://auth0.com/docs/tokens/refresh-tokens/refresh-token-rotation) or [Custom Domains](https://auth0.com/docs/custom-domains)

## 2. User is not logged in after successful sign in with redirect

If after successfully logging in, your user returns to your SPA and is still not authenticated, do _not_ refresh the page - go to the Network tab on Chrome and confirm that the POST to `oauth/token` resulted in an error `401 Unauthorized`. If this is the case, your tenant is most likely misconfigured. Go to your **Application Properties** in your application's settings in the [Auth0 Dashboard](https://manage.auth0.com) and make sure that `Application Type` is set to `Single Page Application` and `Token Endpoint Authentication Method` is set to `None` (**Note:** there is a known issue with the Auth0 "Default App", if you are unable to set `Token Endpoint Authentication Method` to `None`, create a new Application of type `Single Page Application` or see the advice in [issues/93](https://github.com/auth0/auth0-react/issues/93#issuecomment-673431605))

## 3. Skip the Auth0 login page

When integrating with third party providers such as Google or Microsoft, being redirected to Auth0 before being redirected to the corresponding provider can be sub-optimal in terms of user-experience.
If you only have a single connection enabled, or you know up front how the user wants to authenticate, you can set the `connection` parameter when calling `loginWithRedirect()` or `loginWithPopup()`:

```js
loginWithRedirect({
  // ...
  authorizationParams: {
    connection: 'connection_logical_identifier'
  }
})
```

Doing so for connections such as Google or Microsoft, would automatically redirect you to them instead of showing the Auth0 login page first.

Additionally, if you are using `withAuthenticationRequired`, you may want it to pick up the same connection when it would redirect for login. To do so, you should provide the `connection` property when configuring `withAuthenticationRequired`:

```js
withAuthenticationRequired(Component, { 
  loginOptions: {
    authorizationParams: {
      connection: 'connection_logical_identifier'
    }
  }
})
```

ℹ️ You can find the connection's logical identifier as the **connection name** in the connection settings in the Auth0 dashboard for your tenant.
