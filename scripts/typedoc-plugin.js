// @ts-check
/**
 * TypeDoc plugin that shapes the generated API reference for readability.
 *
 * Two jobs:
 *
 * 1. Categorize every top-level export into named sections instead of one flat
 *    alphabetical list. Own symbols carry an `@category` tag; re-exports are
 *    placed by rule. An own symbol that no rule places fails the build.
 *
 * 2. Put the context interface's members directly in the sidebar, so a token or
 *    login method is one click away. The default theme stops the nav tree at
 *    module level, so we extend DefaultTheme to add them.
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
 * A re-export is told apart from an own symbol by whether its source resolves
 * inside `node_modules`. Keyed on this rather than a `src/` prefix: the prefix
 * is relative to TypeDoc's basePath, so a layout change would silently
 * reclassify own symbols as `Reference` and skip validation. `ownSymbolCount`
 * below is the backstop if the discriminator ever matches nothing.
 */
const DEPENDENCY_SOURCE_MARKER = 'node_modules';

/** The practical fix named in diagnostics: put an `@category` in `src/`. */
const OWN_SOURCE_DIR = 'src/';

const SETUP = 'Getting Started';
const HOOKS = 'Hooks & HOCs';
const CONTEXT = 'Context';
const ERRORS = 'Errors';
const REFERENCE = 'Reference';

/** Fallback if a symbol escapes every rule; validation makes it unreachable. */
const DEFAULT_CATEGORY = 'Other Types';

/**
 * Section order, following how the reference is read: provider, hooks, context,
 * errors. `Reference` is last (reached from a signature, not browsed); `*` is
 * where any unlisted category lands.
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

/** Allowed categories for a top-level export; anything else is a typo. */
const TOP_LEVEL_CATEGORIES = [SETUP, HOOKS, CONTEXT, ERRORS, REFERENCE];

/**
 * Member category order and allowed set for `Auth0ContextInterface`. Kept
 * separate from the top-level set so a mix-up between the two is caught.
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
 * Context member name -> sidebar position. Captured while the `@category` tags
 * exist, because the renderer runs after TypeDoc has stripped them.
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
 * Decide a symbol's category. Three rules, first match wins:
 *
 * 1. A tag on an own symbol (source outside node_modules): kept and validated.
 * 2. A name ending in `Error`: an error class whoever declared it. Precedes
 *    rule 3 because error classes are re-exports too, and tests the name
 *    because upstream tags only some of its error modules. Note this catches an
 *    own `FooError` left untagged before the rule-3 build error would.
 * 3. A re-export: a supporting type reached from a signature, so `Reference`.
 *    Overwrites any inherited category (TypeDoc reads `@category` out of a
 *    dependency's .d.ts), which would otherwise strand it in an unlisted
 *    section.
 *
 * An own symbol that no rule places is the drift this guards against: build
 * error.
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
 * Sidebar order for context members: by category, then declaration line within
 * it (alphabetical would bury the common ones under the DPoP escape hatches).
 * Line-based ordering holds only while a category lives in one file, true today.
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

      // Backstop for `declaredHere`: this SDK always has own exports, so zero
      // means the discriminator broke and everything slipped into `Reference`
      // unchecked. Fail rather than ship a reference with no sections.
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

      // One summary line: a jump here means a dependency added exports.
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

  // Groups start collapsed client-side, so seed the two people arrive for as
  // expanded. Only seed when unset, so a reader's own collapse sticks. The
  // accordion key is `data-key` (ancestor titles joined by `$`); the
  // lowercase-dashed form is TypeDoc's fallback, seeded too.
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
    // Recurse into groups; entry-interface nodes are leaves under the current
    // nav config, so member injection below only fires on leaves.
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

    // TypeDoc 0.28 moved URLs behind the Router, so `member.url`/`.anchor` are
    // undefined here. `getFullUrl` (what the frontend uses for nav) includes
    // the anchor.
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
 * `categoryOrder` is one global setting covering both top-level and member
 * categories. The sets are disjoint, so concatenating orders each page right.
 */
const ALL_CATEGORY_ORDER = [...MEMBER_CATEGORY_ORDER, ...CATEGORY_ORDER];

module.exports = {
  load,
  CATEGORY_ORDER: ALL_CATEGORY_ORDER,
  DEFAULT_CATEGORY,
};
