// @ts-check
/**
 * TypeDoc plugin that shapes the generated API reference for readability.
 *
 * Two jobs:
 *
 * 1. Categorize every top-level export so the landing page and sidebar read as
 *    "Getting Started / Hooks & HOCs / Context / Errors / ..." instead of one
 *    flat alphabetical list of ~110 symbols. Categories are derived from the
 *    export's name and source path, so new exports get sorted automatically
 *    without anyone having to add an `@category` tag by hand. A tag written in
 *    the source always wins.
 *
 * 2. Put the context interfaces' members directly in the sidebar, so
 *    `getAccessTokenSilently` or `loginWithRedirect` is one click from anywhere
 *    rather than "click the interface, then scan an index, then click again".
 *    The default theme stops the navigation tree at module level, so we extend
 *    DefaultTheme to add members for the entry-point interfaces only.
 */
const {
  Comment,
  CommentTag,
  Converter,
  DefaultTheme,
  JSX,
  ReflectionKind
} = require('typedoc');

/**
 * Interfaces that are the SDK's real entry points: everything a component gets
 * back from `useAuth0()`. Their members go in the sidebar.
 */
const ENTRY_INTERFACES = ['Auth0ContextInterface'];

const SETUP = 'Getting Started';
const HOOKS = 'Hooks & HOCs';
const CONTEXT = 'Context';
const CONFIGURATION = 'Configuration';
const AUTHENTICATION = 'Login & Logout';
const TOKENS = 'Tokens & Users';
const MFA = 'Multi-Factor Authentication';
const PASSKEYS = 'Passkeys';
const MY_ACCOUNT = 'My Account';
const ERRORS = 'Errors';
const CACHING = 'Caching';
const OTHER = 'Other Types';

/**
 * Category order on the landing page and in the sidebar. `*` is where any
 * category not listed here lands.
 */
const CATEGORY_ORDER = [
  SETUP,
  HOOKS,
  CONTEXT,
  CONFIGURATION,
  AUTHENTICATION,
  TOKENS,
  MFA,
  PASSKEYS,
  MY_ACCOUNT,
  ERRORS,
  CACHING,
  '*',
  OTHER
];

/** The provider and the props you hand it: the first thing anyone reads. */
const SETUP_EXPORTS = new Set([
  'Auth0Provider',
  'Auth0ProviderOptions',
  'Auth0ProviderWithConfigOptions',
  'Auth0ProviderWithClientOptions',
  'AppState'
]);

/** The consumption surface: hooks and higher-order components. */
const HOOKS_EXPORTS = new Set([
  'useAuth0',
  'useAuth0Suspense',
  'withAuth0',
  'WithAuth0Props',
  'withAuthenticationRequired',
  'WithAuthenticationRequiredOptions'
]);

/**
 * The context object and the shapes it carries. `initialContext` is exported but
 * carries `@ignore`, so it never reaches the reference.
 */
const CONTEXT_EXPORTS = new Set([
  'Auth0Context',
  'Auth0ContextInterface',
  'Auth0SuspenseContextInterface'
]);

/** Exports that belong in "Configuration" regardless of kind. */
const CONFIGURATION_EXPORTS = new Set([
  'AuthorizationParams',
  'ClientConfiguration',
  'CacheLocation',
  'RefreshTokenMode',
  'ResponseType',
  'InteractiveErrorHandler'
]);

/** Options and results for the login, logout and connect-account flows. */
const AUTHENTICATION_EXPORTS = new Set([
  'RedirectLoginOptions',
  'RedirectLoginResult',
  'PopupLoginOptions',
  'PopupConfigOptions',
  'LogoutOptions',
  'LogoutUrlOptions',
  'RedirectConnectAccountOptions',
  'ConnectAccountRedirectResult',
  'ConnectedAccount'
]);

/** Everything about acquiring tokens and reading the resulting identity. */
const TOKEN_EXPORTS = new Set([
  'GetTokenSilentlyOptions',
  'GetTokenWithPopupOptions',
  'TokenEndpointResponse',
  'RevokeRefreshTokenOptions',
  'CustomTokenExchangeOptions',
  'User',
  'IdToken',
  'ActClaim',
  'FetcherConfig'
]);

/** Cache implementations and the interface they satisfy. */
const CACHING_EXPORTS = new Set([
  'ICache',
  'InMemoryCache',
  'LocalStorageCache',
  'Cacheable'
]);

/** Names in "My Account" that carry no `MyAccount` prefix to match on. */
const MY_ACCOUNT_EXPORTS = new Set([
  'AuthenticationMethod',
  'AuthenticationMethodType',
  'Factor',
  'UpdateAuthenticationMethodRequest',
  'EnrollmentChallengeOptions',
  'EnrollmentChallengeResponse',
  'EnrollmentVerifyOptions'
]);

/**
 * Decide which category a top-level export belongs to. Driven by name and
 * source path so that new exports land somewhere sensible on their own.
 *
 * @param {import('typedoc').DeclarationReflection} reflection
 * @returns {string}
 */
function categoryFor(reflection) {
  const { name } = reflection;

  if (SETUP_EXPORTS.has(name)) return SETUP;
  if (HOOKS_EXPORTS.has(name)) return HOOKS;
  if (CONTEXT_EXPORTS.has(name)) return CONTEXT;

  // Errors first: an error's home is the Errors section even when a feature
  // prefix below would otherwise claim it (MfaVerifyError, PasskeyError, ...).
  if (/Error$/.test(name) || name === 'MfaRequirements') return ERRORS;

  if (CONFIGURATION_EXPORTS.has(name)) return CONFIGURATION;
  if (AUTHENTICATION_EXPORTS.has(name)) return AUTHENTICATION;
  if (TOKEN_EXPORTS.has(name)) return TOKENS;
  if (CACHING_EXPORTS.has(name)) return CACHING;
  if (MY_ACCOUNT_EXPORTS.has(name)) return MY_ACCOUNT;

  // Nearly everything else is re-exported from `@auth0/auth0-spa-js`, so there
  // is no path under `src/` to match on: the name is all we have.
  if (name.startsWith('MyAccount')) return MY_ACCOUNT;
  if (name.startsWith('Passkey')) return PASSKEYS;
  if (name.startsWith('Mfa') || name.startsWith('Enroll')) return MFA;
  if (
    name === 'Authenticator' ||
    name === 'ChallengeAuthenticatorParams' ||
    name === 'ChallengeResponse' ||
    name === 'VerifyParams'
  ) {
    return MFA;
  }

  // Source paths are relative to TypeDoc's computed base path, which shifts
  // depending on which files end up in the program, so match on the directory
  // segment rather than a prefix.
  const fileName = reflection.sources?.[0]?.fileName ?? '';
  const inDir = dir => fileName.includes(`${dir}/`);

  if (inDir('mfa')) return MFA;
  if (inDir('passkey')) return PASSKEYS;
  if (inDir('myaccount')) return MY_ACCOUNT;
  if (inDir('cache')) return CACHING;

  return OTHER;
}

/**
 * Categories for `Auth0ContextInterface`'s own members, so its page groups 25+
 * entries by task instead of listing them all under one "Properties" heading.
 * Anything not listed here falls into "Advanced".
 */
const CONTEXT_MEMBER_CATEGORIES = {
  'Auth State': ['isLoading', 'isAuthenticated', 'user', 'error'],
  'Sub-clients': ['mfa', 'passkey', 'myAccount'],
  Authentication: [
    'loginWithRedirect',
    'handleRedirectCallback',
    'loginWithPopup',
    'logout'
  ],
  Tokens: [
    'getAccessTokenSilently',
    'getAccessTokenWithPopup',
    'getIdTokenClaims',
    'revokeRefreshToken',
    'loginWithCustomTokenExchange',
    'customTokenExchange',
    'exchangeToken'
  ],
  'Connected Accounts': ['connectAccountWithRedirect']
};

/** Reverse lookup: member name -> category title. */
const CONTEXT_MEMBER_CATEGORY = new Map(
  Object.entries(CONTEXT_MEMBER_CATEGORIES).flatMap(([title, names]) =>
    names.map(name => [name, title])
  )
);

/** Order of the member categories on the `Auth0ContextInterface` page. */
const MEMBER_CATEGORY_ORDER = [
  'Auth State',
  'Sub-clients',
  'Authentication',
  'Tokens',
  'User Profile',
  'Connected Accounts',
  'Advanced'
];

/**
 * Sidebar position for a context member: category order first, then the order
 * the names are declared within that category. Uncategorized members
 * ("Advanced") sort last, among themselves alphabetically.
 */
const MEMBER_RANK = new Map(
  MEMBER_CATEGORY_ORDER.flatMap((title, categoryIndex) =>
    (CONTEXT_MEMBER_CATEGORIES[title] ?? []).map((name, index) => [
      name,
      categoryIndex * 100 + index
    ])
  )
);

/** @param {string} name */
function memberRank(name) {
  return MEMBER_RANK.get(name) ?? Number.MAX_SAFE_INTEGER;
}

/**
 * Category tags we ignore rather than honour. `ClientConfiguration` ships an
 * `@category Main` from `@auth0/auth0-spa-js`, which would otherwise strand it
 * in a one-entry "Main" group of its own.
 */
const IGNORED_TAG_CATEGORIES = new Set(['Main']);

/**
 * Stamp an `@category` tag on a reflection, unless the source already declares
 * a usable one: a hand-written tag wins, except for the upstream tags above.
 *
 * @param {import('typedoc').DeclarationReflection} reflection
 * @param {string} category
 */
function setCategory(reflection, category) {
  const comment = reflection.comment ?? reflection.signatures?.[0]?.comment;
  const existing = comment?.getTag('@category');

  if (existing) {
    const text = Comment.combineDisplayParts(existing.content).trim();
    if (!IGNORED_TAG_CATEGORIES.has(text)) return;
    comment.removeTags('@category');
  }

  const tag = new CommentTag('@category', [{ kind: 'text', text: category }]);

  if (comment) {
    comment.blockTags.push(tag);
  } else {
    // Undocumented symbol: give it a comment so it can still be grouped.
    reflection.comment = new Comment([], [tag]);
  }
}

/** @param {import('typedoc').Application} app */
function load(app) {
  // Priority 1000 so this runs before the built-in CategoryPlugin, which also
  // listens on RESOLVE_END and reads (then strips) `@category` tags.
  app.converter.on(
    Converter.EVENT_RESOLVE_END,
    context => {
      const { project } = context;

      for (const child of project.children ?? []) {
        setCategory(child, categoryFor(child));
      }

      for (const name of ENTRY_INTERFACES) {
        const entry = project.getChildByName(name);
        for (const member of entry?.children ?? []) {
          setCategory(
            member,
            CONTEXT_MEMBER_CATEGORY.get(member.name) ?? 'Advanced'
          );
        }
      }
    },
    undefined,
    1000
  );

  app.renderer.defineTheme(
    'auth0',
    class extends DefaultTheme {
      buildNavigation(project) {
        const navigation = super.buildNavigation(project);
        addEntryMembers(navigation, project, this.router);
        return navigation;
      }
    }
  );

  // The sidebar is built client-side and every group starts collapsed, so a
  // first-time reader lands on a list of category names with nothing in sight.
  // Seed the two groups people arrive for as expanded before the nav script
  // runs. Reading the key first means a reader who collapses one keeps that
  // choice. The key is `data-key` on the accordion, which the nav builder sets
  // to the ancestor titles joined by `$`; the lowercase-dashed variant is the
  // fallback derivation, seeded too so a change in either direction still works.
  const expandKeys = [SETUP, HOOKS].flatMap(title => [
    title,
    title.replace(/\s+/g, '-').toLowerCase()
  ]);

  app.renderer.hooks.on('body.begin', () =>
    JSX.createElement(
      'script',
      null,
      JSX.createElement(JSX.Raw, {
        html: `try{${JSON.stringify(expandKeys)}.forEach(function(t){var k='tsd-accordion-'+t;if(localStorage.getItem(k)===null)localStorage.setItem(k,'true')})}catch(e){}`
      })
    )
  );
}

/**
 * Walk the navigation tree and hang each entry interface's members off its node.
 *
 * @param {any[]} nodes
 * @param {import('typedoc').ProjectReflection} project
 * @param {import('typedoc').Router} router
 */
function addEntryMembers(nodes, project, router) {
  for (const node of nodes) {
    if (node.children?.length) {
      addEntryMembers(node.children, project, router);
      continue;
    }

    if (!ENTRY_INTERFACES.includes(node.text)) continue;

    const owner = project.getChildByName(node.text);
    if (!owner?.children) continue;

    const members = owner.children.filter(
      member =>
        member.kindOf(
          ReflectionKind.Method |
            ReflectionKind.Accessor |
            ReflectionKind.Property
        ) &&
        !member.flags.isPrivate &&
        !member.flags.isProtected &&
        member.name !== 'constructor'
    );

    // 25+ members, so list them in the same task order as the page index: auth
    // state and `loginWithRedirect` first, the DPoP escape hatches last.
    // Alphabetical would bury the ones most people came for.
    members.sort((a, b) => memberRank(a.name) - memberRank(b.name));

    // Ask the router for the href. TypeDoc 0.28 moved URL assignment out of the
    // reflections and behind the Router, so `member.url` and `member.anchor` are
    // both undefined here: building the path by hand produced links reading
    // `docs/undefined#isLoading`. `getFullUrl` is what TypeDoc's own frontend
    // uses for nav entries, and it already includes the anchor.
    const links = members
      .filter(member => router.hasUrl(member))
      .map(member => ({
        text: member.name,
        path: router.getFullUrl(member),
        kind: member.kind,
        class: member.isDeprecated() ? 'deprecated' : undefined
      }));

    if (links.length) {
      node.children = links;
    }
  }
}

/**
 * `categoryOrder` is a single global setting, so it has to cover both the
 * top-level export categories and the context interface's member categories.
 * The two sets are disjoint, so concatenating them orders each page correctly.
 */
const ALL_CATEGORY_ORDER = [...MEMBER_CATEGORY_ORDER, ...CATEGORY_ORDER];

module.exports = { load, CATEGORY_ORDER: ALL_CATEGORY_ORDER };
