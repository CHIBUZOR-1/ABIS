// cypress/e2e/signup.cy.js

describe('SignUp Page', () => {
  beforeEach(() => {
    cy.visit('/register'); // adjust if your route is different
  });

  it('should render all input fields and the Sign Up button', () => {
    cy.get('input[name="name"]').should('exist');
    cy.get('input[name="email"]').should('exist');
    cy.get('input[name="phone"]').should('exist');
    cy.get('input[name="secret"]').should('exist');
    cy.get('input[name="password"]').should('exist');
    cy.get('input[name="confirmPassword"]').should('exist');
    cy.contains('Sign Up').should('exist');
  });

  it('should show an error if passwords do not match', () => {
    cy.get('input[name="name"]').type('Jane Doe');
    cy.get('input[name="email"]').type('janedoe@example.com');
    cy.get('input[name="phone"]').type('1234567890');
    cy.get('input[name="secret"]').type('mySecret');
    cy.get('input[name="password"]').type('password123');
    cy.get('input[name="confirmPassword"]').type('differentPassword');
    cy.contains('Sign Up').click();
    cy.contains('Passwords do not match.').should('exist');
  });

  it('should show an error if secret is empty', () => {
    cy.get('input[name="name"]').type('Jane Doe');
    cy.get('input[name="email"]').type('janedoe@example.com');
    cy.get('input[name="phone"]').type('1234567890');
    cy.get('input[name="password"]').type('password123');
    cy.get('input[name="confirmPassword"]').type('password123');
    cy.contains('Sign Up').click();
    cy.contains('Secret Keyword required!').should('exist');
  });
  
  it('should register a user successfully (mocked API)', () => {
    cy.intercept('POST', '**/api/users/register', {
      statusCode: 200,
      body: { ok: true, msg: 'Registration successful' },
    }).as('register');

    cy.get('input[name="name"]').type('Jane Doe');
    cy.get('input[name="email"]').type('janedoe@example.com');
    cy.get('input[name="phone"]').type('1234567890');
    cy.get('input[name="secret"]').type('mySecret');
    cy.get('input[name="password"]').type('password123');
    cy.get('input[name="confirmPassword"]').type('password123');

    cy.contains('Sign Up').click();
    cy.wait('@register');

    // should redirect to login page after success
    cy.url().should('include', '/');
    cy.contains('Login').should('exist');
  });
});
