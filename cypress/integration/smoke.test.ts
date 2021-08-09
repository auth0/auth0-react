const EMAIL = Cypress.env('USER_EMAIL') || 'a';
const PASSWORD = Cypress.env('USER_PASSWORD') || 'z';
const USE_AUTH0 = Cypress.env('USE_AUTH0') || false;

if (!EMAIL || !PASSWORD) {
  throw new Error(
    'You must provide CYPRESS_USER_EMAIL and CYPRESS_USER_PASSWORD environment variables'
  );
}

const loginToAuth0 = (): void => {
  cy.get('.auth0-lock-input-username .auth0-lock-input').clear().type(EMAIL);
  cy.get('.auth0-lock-input-password .auth0-lock-input').clear().type(PASSWORD);
  cy.get('.auth0-lock-submit').click();
};

const loginToNodeOidc = (): void => {
  cy.get('input[name=login]').clear().type(EMAIL);
  cy.get('input[name=password]').clear().type(PASSWORD);
  cy.get('.login-submit').click();
  cy.get('.login-submit').click();
};

const login = (): void => {
  return USE_AUTH0 ? loginToAuth0() : loginToNodeOidc();
};

const fixCookies = () => {
  // Temporary fix for https://github.com/cypress-io/cypress/issues/6375
  if (Cypress.isBrowser('firefox')) {
    cy.getCookies({ log: false }).then((cookies) =>
      cookies.forEach((cookie) => cy.clearCookie(cookie.name, { log: false }))
    );
    cy.log('clearCookies');
  } else {
    cy.clearCookies();
  }
};

describe('Smoke tests', () => {
  afterEach(fixCookies);

  it.only('do basic login and show user', () => {
    cy.visit('/');
    cy.get('#login').should('be.visible');
    cy.get('#login').click();

    login();

    cy.get('#hello').contains(`Hello, ${EMAIL}!`);
    cy.get('#logout').click();
    cy.get('button[name=logout]').click();
    cy.get('#login').should('exist');
  });

  it('should protect a route and return to path after login', () => {
    cy.visit('/users');

    login();

    cy.url().should('include', '/users');
    cy.get('#logout').click();
    cy.get('button[name=logout]').click();
  });

  it('should access an api', () => {
    cy.visit('/users');

    login();

    cy.get('table').contains('bob@example.com');
    cy.get('#logout').click();
    cy.get('button[name=logout]').click();
  });
});
