---
paths:
  - "src/**"
  - "__tests__/**"
  - "__mocks__/**"
---

# Code Organization

- Source files in `src/` use `[feature]-[type].tsx` naming (e.g., `auth0-provider.tsx`, `use-auth0.tsx`, `with-authentication-required.tsx`)
- All public exports go through the barrel file `src/index.tsx` — add new exports there
- Test files in `__tests__/` mirror src naming with `.test.tsx` suffix (e.g., `auth-provider.test.tsx` tests `auth0-provider.tsx`)
- Mocks for `@auth0/auth0-spa-js` live in `__mocks__/@auth0/auth0-spa-js.tsx`
- Tests use `@testing-library/react` — prefer `renderHook` and `render` over manual React rendering
