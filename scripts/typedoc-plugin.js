// @ts-check
/**
 * TypeDoc plugin that shapes the generated API reference for readability.
 *
 * Two jobs:
 *
 * 1. Categorize every top-level export so the landing page and sidebar read as
 *    "Getting Started / Hooks & HOCs / Context / Errors / Reference" instead of
 *    one flat alphabetical list of ~100 symbols. The symbols this SDK declares
 *    are tagged where they are declared; everything else is placed by two rules
 *    keyed on the symbol's name and declaration file. A symbol declared here
 *    that no rule places fails the build rather than drifting into a default
 *    section, which is how this SDK's own hooks ended up in "Other Types".
 *
 * 2. Put the context interface's members directly in the sidebar, so
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
  ReflectionKind,
} = require('typedoc');

/**
 * Interfaces that are the SDK's real entry points: everything a component gets
 * back from `useAuth0()`. Their members go in the sidebar.
 */
const ENTRY_INTERFACES = ['Auth0ContextInterface'];

/**
 * How a re-export is told apart from a symbol this SDK declares: its source
 * file resolves inside `node_modules`. Keying on this rather than on a `src/`
 * prefix is deliberate. The prefix is relative to TypeDoc's derived basePath,
 * so if that anchor ever shifts (a config or layout change), own symbols stop
 * matching and get silently reclassified as `Reference`, skipping the validation
 * that is the whole point of the guardrail. `node_modules` is in the absolute
 * path either way, so the test survives a basePath move. `ownSymbolCount` below
 * is the backstop: if the set of own symbols ever empties, the build fails
 * rather than passing with everything mislabelled.
 */
const DEPENDENCY_SOURCE_MARKER = 'node_modules';

/** Named in diagnostics so the fix is obvious: put an `@category` in `src/`. */
const OWN_SOURCE_DIR = 'src/';

const SETUP = 'Getting Started';
const HOOKS = 'Hooks & HOCs';
const CONTEXT = 'Context';
const ERRORS = 'Errors';
const REFERENCE = 'Reference';

/**
 * Where a symbol lands if it escapes every rule. The validation below makes
 * that unreachable, so anything showing up here is a bug in this plugin.
 */
const DEFAULT_CATEGORY = 'Other Types';

/**
 * Section order on the landing page and in the sidebar, following the order the
 * reference is read: the provider, then the hooks, then the context, then the
 * errors you catch. `Reference` is last because it is reached from a signature,
 * never by browsing. `*` is where any category not listed here lands.
 */
const CATEGORY_ORDER = [
  SETUP,
  HOOKS,
  CONTEXT,
  ERRORS,
  REFERENCE,
  '*',
  DEFAULT_CATEGORY,
];

/**
 * The only categories a top-level export may be tagged with. Anything else is a
 * typo, which would otherwise render as a plausible-looking one-entry section.
 */
const TOP_LEVEL_CATEGORIES = [SETUP, HOOKS, CONTEXT, ERRORS, REFERENCE];

/**
 * Order of the member categories on the `Auth0ContextInterface` page, and the
 * only categories a member may be tagged with. Kept separate from the top-level
 * set so that tagging a member with a section name, or the reverse, is caught
 * rather than silently filed in the wrong place.
 */
const MEMBER_CATEGORY_ORDER = [
  'Auth State',
  'Sub-clients',
  'Authentication',
  'Tokens',
  'User Profile',
  'Connected Accounts',
  'Advanced',
];

/**
 * Context member name -> sidebar position, filled while the `@category` tags
 * still exist. The renderer needs this ordering after TypeDoc's own category
 * plugin has read and stripped the tags, so it cannot recompute it there.
 */
const memberSidebarOrder = new Map();

/**
 * @param {import('typedoc').DeclarationReflection} reflection
 * @returns {string}
 */
function sourceFile(reflection) {
  return reflection.sources?.[0]?.fileName ?? '';
}

/** @param {import('typedoc').DeclarationReflection} reflection */
function declaredHere(reflection) {
  return !sourceFile(reflection).includes(DEPENDENCY_SOURCE_MARKER);
}

/**
 * The comment carrying the tags. For an arrow-function export the doc block
 * attaches to the signature rather than the declaration.
 *
 * @param {import('typedoc').DeclarationReflection} reflection
 */
function commentOf(reflection) {
  return reflection.comment ?? reflection.signatures?.[0]?.comment;
}

/**
 * The category written in the source, if any.
 *
 * @param {import('typedoc').DeclarationReflection} reflection
 * @returns {string | undefined}
 */
function writtenCategory(reflection) {
  const tag = commentOf(reflection)?.getTag('@category');
  return tag ? Comment.combineDisplayParts(tag.content).trim() : undefined;
}

/**
 * Stamp an `@category` tag on a reflection, replacing whatever is already
 * there.
 *
 * @param {import('typedoc').DeclarationReflection} reflection
 * @param {string} category
 */
function setCategory(reflection, category) {
  const comment = commentOf(reflection);
  const tag = new CommentTag('@category', [{ kind: 'text', text: category }]);

  if (comment) {
    comment.removeTags('@category');
    comment.blockTags.push(tag);
  } else {
    // Undocumented symbol: give it a comment so it can still be grouped.
    reflection.comment = new Comment([], [tag]);
  }
}

/**
 * Decide which category a symbol belongs to. Three rules, first match wins:
 *
 * 1. A tag written on a declaration in `src/`, which is kept and validated.
 *    Tags on a declaration outside `src/` are not rule 1: they came from a
 *    dependency, and rule 3 discards them.
 * 2. A name ending in `Error`, which is an error class no matter who declared
 *    it. This precedes rule 3 because every error class is also a re-export, and
 *    it tests the name rather than trusting upstream's tags because upstream
 *    tags only one of its several error modules.
 * 3. Declared outside `src/`, which makes it a supporting type reached from a
 *    signature, so it goes to `Reference`. This *overwrites* any category the
 *    symbol arrived with: TypeDoc reads `@category` out of a dependency's type
 *    declarations, so upstream categories turn up here whether or not we want
 *    them, and leaving them would strand symbols in unlisted sections.
 *
 * Nothing left over is legitimate: a symbol this SDK declares and no rule places
 * is the drift this plugin exists to catch, so it becomes a build error.
 *
 * @param {import('typedoc').DeclarationReflection} reflection
 * @param {string[]} allowed Categories this reflection may be tagged with.
 * @param {string[]} problems Collects anything that should fail the build.
 * @returns {string} the category the symbol ended up in
 */
function categorize(reflection, allowed, problems) {
  const here = declaredHere(reflection);
  const written = here ? writtenCategory(reflection) : undefined;

  if (written) {
    if (!allowed.includes(written)) {
      problems.push(
        `${reflection.name} (${sourceFile(reflection)}) is tagged ` +
          `"@category ${written}", which is not a category this SDK defines ` +
          `here. Expected one of: ${allowed.join(', ')}.`
      );
    }
    return written;
  }

  if (/Error$/.test(reflection.name)) {
    setCategory(reflection, ERRORS);
    return ERRORS;
  }

  if (!here) {
    setCategory(reflection, REFERENCE);
    return REFERENCE;
  }

  problems.push(
    `${reflection.name} (${sourceFile(reflection)}) has no @category tag. ` +
      `Every symbol declared in ${OWN_SOURCE_DIR} needs one: ` +
      `${allowed.join(', ')}.`
  );
  return DEFAULT_CATEGORY;
}

/** @param {import('typedoc').DeclarationReflection} reflection */
function memberCategoryIndex(reflection) {
  const written = writtenCategory(reflection) ?? '';
  const index = MEMBER_CATEGORY_ORDER.indexOf(written);
  return index === -1 ? MEMBER_CATEGORY_ORDER.length : index;
}

/**
 * Sidebar order for the context members: by category, then by the order they
 * are declared within that category. Alphabetical would bury the ones most
 * people came for under the DPoP escape hatches.
 *
 * Declaration order means the line the member is written on, so moving a member
 * within the interface moves it in the sidebar. That holds only while every
 * member of a category is declared in one file, which is true today: the auth
 * state is all of `auth-state.tsx` and the rest is all of `auth0-context.tsx`.
 *
 * @param {import('typedoc').DeclarationReflection} a
 * @param {import('typedoc').DeclarationReflection} b
 */
function compareMembers(a, b) {
  const byCategory = memberCategoryIndex(a) - memberCategoryIndex(b);
  if (byCategory !== 0) return byCategory;
  return (a.sources?.[0]?.line ?? 0) - (b.sources?.[0]?.line ?? 0);
}

/** @param {import('typedoc').Application} app */
function load(app) {
  // Priority 1000 so this runs before the built-in CategoryPlugin, which also
  // listens on RESOLVE_END and reads (then strips) `@category` tags.
  app.converter.on(
    Converter.EVENT_RESOLVE_END,
    (context) => {
      const { project } = context;
      /** @type {string[]} */
      const problems = [];
      let referenceCount = 0;
      let reExportCount = 0;
      let ownSymbolCount = 0;

      for (const child of project.children ?? []) {
        if (declaredHere(child)) ownSymbolCount++;
        if (categorize(child, TOP_LEVEL_CATEGORIES, problems) === REFERENCE) {
          referenceCount++;
          if (!declaredHere(child)) reExportCount++;
        }
      }

      // Backstop for the `declaredHere` test: this SDK always declares its own
      // top-level exports, so a count of zero means the discriminator stopped
      // recognising them and every symbol slipped into `Reference` unvalidated.
      // Fail loudly rather than ship a reference with no sections.
      if ((project.children?.length ?? 0) > 0 && ownSymbolCount === 0) {
        problems.push(
          'No top-level export was recognised as declared in this SDK. The ' +
            'test for own symbols (source path outside ' +
            `"${DEPENDENCY_SOURCE_MARKER}") is matching nothing, so category ` +
            'validation never ran. This is a plugin bug, not a docs error.'
        );
      }

      for (const name of ENTRY_INTERFACES) {
        const entry = project.getChildByName(name);
        const members = [...(entry?.children ?? [])];

        for (const member of members) {
          categorize(member, MEMBER_CATEGORY_ORDER, problems);
        }

        members.sort(compareMembers);
        members.forEach((member, index) =>
          memberSidebarOrder.set(member.name, index)
        );
      }

      for (const problem of problems) {
        app.logger.error(problem);
      }

      // One summary line, not one per symbol: a jump in this count means a
      // dependency added exports, which is the only thing worth noticing here.
      app.logger.info(
        `${REFERENCE} holds ${referenceCount} symbols, ` +
          `${reExportCount} of them re-exported from dependencies.`
      );
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
  const expandKeys = [SETUP, HOOKS].flatMap((title) => [
    title,
    title.replace(/\s+/g, '-').toLowerCase(),
  ]);

  app.renderer.hooks.on('body.begin', () =>
    JSX.createElement(
      'script',
      null,
      JSX.createElement(JSX.Raw, {
        html: `try{${JSON.stringify(
          expandKeys
        )}.forEach(function(t){var k='tsd-accordion-'+t;if(localStorage.getItem(k)===null)localStorage.setItem(k,'true')})}catch(e){}`,
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
      (member) =>
        member.kindOf(
          ReflectionKind.Method |
            ReflectionKind.Accessor |
            ReflectionKind.Property
        ) &&
        !member.flags.isPrivate &&
        !member.flags.isProtected &&
        member.name !== 'constructor'
    );

    members.sort(
      (a, b) =>
        (memberSidebarOrder.get(a.name) ?? Number.MAX_SAFE_INTEGER) -
        (memberSidebarOrder.get(b.name) ?? Number.MAX_SAFE_INTEGER)
    );

    // Ask the router for the href. TypeDoc 0.28 moved URL assignment out of the
    // reflections and behind the Router, so `member.url` and `member.anchor` are
    // both undefined here: building the path by hand produced links reading
    // `docs/undefined#isLoading`. `getFullUrl` is what TypeDoc's own frontend
    // uses for nav entries, and it already includes the anchor.
    const links = members
      .filter((member) => router.hasUrl(member))
      .map((member) => ({
        text: member.name,
        path: router.getFullUrl(member),
        kind: member.kind,
        class: member.isDeprecated() ? 'deprecated' : undefined,
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

module.exports = {
  load,
  CATEGORY_ORDER: ALL_CATEGORY_ORDER,
  DEFAULT_CATEGORY,
};
