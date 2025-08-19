describe('Authentication Flow', () => {
  beforeEach(() => {
    cy.visit('/')
    cy.clearLocalStorage()
  })

  it('should display login page for unauthenticated users', () => {
    cy.get('h2').should('contain', 'Opessocius')
    cy.get('input[name="username"]').should('be.visible')
    cy.get('input[name="password"]').should('be.visible')
    cy.get('button[type="submit"]').should('contain', 'Sign In')
  })

  it('should login successfully with admin credentials', () => {
    cy.get('input[name="username"]').type('admin')
    cy.get('input[name="password"]').type('CrudeNico')
    cy.get('button[type="submit"]').click()
    
    // Should redirect to dashboard
    cy.url().should('include', '/dashboard')
    cy.get('h1').should('contain', 'Dashboard')
  })

  it('should show error for invalid credentials', () => {
    cy.get('input[name="username"]').type('wrong')
    cy.get('input[name="password"]').type('wrong')
    cy.get('button[type="submit"]').click()
    
    cy.get('.bg-danger-50').should('be.visible')
    cy.get('.bg-danger-50').should('contain', 'Invalid credentials')
  })

  it('should toggle password visibility', () => {
    cy.get('input[name="password"]').should('have.attr', 'type', 'password')
    cy.get('button[type="button"]').first().click()
    cy.get('input[name="password"]').should('have.attr', 'type', 'text')
  })

  it('should validate required fields', () => {
    cy.get('button[type="submit"]').click()
    cy.get('input[name="username"]').should('have.class', 'border-red-500')
    cy.get('input[name="password"]').should('have.class', 'border-red-500')
  })

  it('should logout successfully', () => {
    // Login first
    cy.get('input[name="username"]').type('admin')
    cy.get('input[name="password"]').type('CrudeNico')
    cy.get('button[type="submit"]').click()
    
    // Should be on dashboard
    cy.url().should('include', '/dashboard')
    
    // Logout
    cy.get('button').contains('Logout').click()
    
    // Should redirect to login
    cy.url().should('eq', Cypress.config().baseUrl + '/')
    cy.get('h2').should('contain', 'Opessocius')
  })
})

