describe('Homepage - Authenticated Features', () => {
  beforeEach(() => {
  cy.login();        // manually logs in each time
  cy.visit('/home'); // then visit the page
});

  it('should display user profile data', () => {
    cy.contains('My Profile').should('exist');
  });
  it('should display user name, email and phone inputs with pre-filled data', () => {
    cy.get('input[name="name"]').should('have.value', 'Test User');
    cy.get('input[name="email"]').should('have.value', 'testuser@example.com');
    cy.get('input[name="phone"]').should('exist'); // value might be empty
  });

  it('should allow the user to update their profile info', () => {
    cy.intercept('POST', '**/api/users/update-user', {
      statusCode: 200,
      body: {
        ok: true,
        msg: 'Profile updated successfully',
        updatedUser: {
          name: 'Updated User',
          email: 'updated@example.com',
          phone: '1234567890',
        }
      }
    }).as('updateProfile');

    cy.get('input[name="name"]').clear().type('Updated User');
    cy.get('input[name="email"]').clear().type('updated@example.com');
    cy.get('input[name="phone"]').clear().type('1234567890');

    cy.contains('Update').click();
    cy.wait('@updateProfile');

    cy.contains('Profile updated successfully').should('exist');
    cy.get('input[name="name"]').should('have.value', 'Updated User');
  });

  it('should allow the user to upload a profile image (mocked)', () => {
    cy.intercept('POST', '**/api/users/uploadProfilePhoto', {
      statusCode: 200,
      body: {
        secure_url: 'https://example.com/fake-image.jpg',
        public_id: 'fake_id'
      }
    }).as('uploadImage');

    /*const fileName = 'profile.jpg';
    cy.fixture(fileName).then(fileContent => {
      cy.get('input[type="file"]').attachFile({
        fileContent: fileContent.toString(),
        fileName,
        mimeType: 'image/jpeg'
      });
    });*/
    cy.get('input[type="file"]').attachFile('profile.jpg');
    cy.contains('Update').click();
    cy.wait('@uploadImage');
  });

  it('should log the user out and redirect to login page', () => {
    cy.intercept('GET', '**/api/users/logout', {
      statusCode: 200,
      body: {
        ok: true,
        msg: 'Logout successful'
      }
    }).as('logout');

    cy.contains('Logout').click();
    cy.wait('@logout');
    cy.url().should('include', '/'); // should redirect to login page
  });
});
