describe('Login Page', () => {
  before(() => {
    // Give Vite some time to finish booting if needed
    cy.wait(3000); // wait 2 seconds
  });
  it('should allow a user to log in (mocked API)', () => {
    // Intercept the login API request
    cy.intercept('POST', '**/api/users/login', {
      statusCode: 200,
      body: {
        ok: true,
        msg: 'Login successful',
        details: { id: '123', name: 'Test User', email: 'testuser@example.com' }
      }
    }).as('loginRequest');

    // Visit the login page (root URL)
    cy.visit('/');

    // Fill in credentials
    cy.get('input[name=email]').type('testuser@example.com');
    cy.get('input[name=password]').type('password123');

    // Click the login button
    cy.contains('button', 'Login').click();

    // Wait for the mock login request to be triggered
    cy.wait('@loginRequest');

    // Should redirect to /home
    cy.url().should('include', '/home');

    // Optional: verify something on homepage
    cy.contains('My Profile').should('exist'); // Replace with actual homepage content
  });
});


