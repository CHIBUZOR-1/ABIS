describe('Forgot Password Page', () => {
  beforeEach(() => {
    cy.visit('/reset-password');
  });

  it('should render all input fields and the Reset button', () => {
    cy.get('input[name="email"]').should('exist');
    cy.get('input[name="secret"]').should('exist');
    cy.get('input[name="newPassword"]').should('exist');
    cy.get('input[name="confirmNewPassword"]').should('exist');
    cy.contains('button', 'RESET').should('exist');
  });

  it('should show an error if any field is empty', () => {
    cy.contains('button', 'RESET').click();
    cy.contains('All fields are required.').should('exist');
  });

  it('should show an error if passwords do not match', () => {
    cy.get('input[name="email"]').type('user@example.com');
    cy.get('input[name="secret"]').type('mySecret');
    cy.get('input[name="newPassword"]').type('password123');
    cy.get('input[name="confirmNewPassword"]').type('wrongPassword');
    cy.contains('button', 'RESET').click();
    cy.contains('Passwords do not match.').should('exist');
  });

  it('should reset password successfully (mocked API)', () => {
    cy.intercept('POST', '**/api/users/reset-password', {
      statusCode: 200,
      body: { ok: true, msg: 'Password reset successful' },
    }).as('resetPassword');

    cy.get('input[name="email"]').type('user@example.com');
    cy.get('input[name="secret"]').type('mySecret');
    cy.get('input[name="newPassword"]').type('password123');
    cy.get('input[name="confirmNewPassword"]').type('password123');
    
    cy.contains('button', 'RESET').click();
    cy.wait('@resetPassword');

    cy.url().should('include', '/');
    cy.contains('Login').should('exist'); // adjust if you use different wording
  });
});
