const loginToAuth0 = (): void => {
  cy.get('.auth0-lock-input-username .auth0-lock-input')
    .clear()
    .type('johnfoo+integration@gmail.com');
  cy.get('.auth0-lock-input-password .auth0-lock-input').clear().type('1234');
  cy.get('.auth0-lock-submit').click();
};

describe('Smoke tests', () => {
  it('do basic login and show user', () => {
    cy.visit('/');
    cy.get('#login').should('exist');
    cy.get('#login').click();

    loginToAuth0();

    cy.get('#hello').contains(`Hello, ${Cypress.env('USER_EMAIL')}!`);
    cy.get('#logout').click();
    cy.get('#login').should('exist');
  });

  it('should protect a route and return to path after login', () => {
    cy.visit('/users');

    loginToAuth0();

    cy.url().should('include', '/users');
    cy.get('#logout').click();
  });

  it('should access an api', () => {
    cy.visit('/users');

    loginToAuth0();

    cy.get('table').contains('bob@example.com');
    cy.get('#logout').click();
  });
});
