const SMOKE_TEST_EMAIL = Cypress.env('CYPRESS_USER_EMAIL');
const USER_PASSWORD = Cypress.env('CYPRESS_USER_PASSWORD');

if (!SMOKE_TEST_EMAIL || !USER_PASSWORD) {
  throw new Error(
    'You must provide CYPRESS_USER_EMAIL and CYPRESS_USER_PASSWORD environment variables'
  );
}

const loginToAuth0 = (): void => {
  cy.get('#username').clear().type(SMOKE_TEST_EMAIL);
  cy.get('#password').clear().type(USER_PASSWORD);
  cy.get('button[type="submit"][name="action"]').contains(/^continue$/i).click({ force: true });
};

describe('Smoke tests', () => {
  it('do basic login and show user', () => {
    cy.visit('/');
    cy.get('#login').should('be.visible');
    cy.get('#login').click();

    loginToAuth0();

    cy.get('#hello').contains(`Hello, ${SMOKE_TEST_EMAIL}!`);
    cy.get('#logout').click();
    cy.get('#login').should('exist');
  });

  it('should protect a route and return to path after login', () => {
    cy.visit('/users');

    loginToAuth0();

    // Make sure the table has rendered with data as that is when the page has loaded completely
    // and there shouldn't be any issues with the logout button being recreated
    cy.get('table tbody tr').should('have.length', 2);
    cy.url().should('include', '/users');
    cy.get('#logout').click();
  });

  it('should access an api', () => {
    cy.visit('/users');

    loginToAuth0();

    // Make sure the table has rendered with data as that is when the page has loaded completely
    // and there shouldn't be any issues with the logout button being recreated
    cy.get('table tbody tr').should('have.length', 2);
    cy.get('table').contains('bob@example.com');
    cy.get('#logout').click();
  });
});
