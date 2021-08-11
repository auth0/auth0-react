const EMAIL = 'test';
const PASSWORD = 'test';

if (!EMAIL || !PASSWORD) {
  throw new Error(
    'You must provide CYPRESS_USER_EMAIL and CYPRESS_USER_PASSWORD environment variables'
  );
}

const loginToNodeOidc = (): void => {
  cy.get('input[name=login]').clear().type(EMAIL);
  cy.get('input[name=password]').clear().type(PASSWORD);
  cy.get('.login-submit').click();
  cy.get('.login-submit').click();
};

const login = (): void => {
  return loginToNodeOidc();
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

  it('do basic login and show user', () => {
    cy.visit('/');

    cy.get('[data-cy=use-node-oidc-provider]').click();
    cy.get('#login').click();

    login();

    cy.get('#hello').contains(`Hello, ${EMAIL}!`);
    cy.get('#logout').click();
    cy.get('button[name=logout]').click();
    cy.get('#login').should('exist');
  });
});
