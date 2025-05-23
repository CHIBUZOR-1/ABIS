import 'cypress-file-upload';

Cypress.Commands.add('login', () => {
  cy.intercept('POST', '**/api/users/login', {
    statusCode: 200,
    body: {
      ok: true,
      msg: 'Login successful',
      details: { id: '123', name: 'Test User', email: 'testuser@example.com' }
    }
  }).as('loginRequest');

  cy.visit('/');
  cy.get('input[name=email]').type('testuser@example.com');
  cy.get('input[name=password]').type('password123');
  cy.contains('Login').click();
  cy.wait('@loginRequest');
});

// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })