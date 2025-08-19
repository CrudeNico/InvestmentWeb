describe('Investor Management', () => {
  beforeEach(() => {
    cy.visit('/')
    cy.get('input[name="username"]').type('admin')
    cy.get('input[name="password"]').type('CrudeNico')
    cy.get('button[type="submit"]').click()
    cy.visit('/investors')
  })

  it('should display investors page', () => {
    cy.get('h1').should('contain', 'Investor Management')
    cy.get('button').contains('Add Investor').should('be.visible')
  })

  it('should add new investor', () => {
    cy.get('button').contains('Add Investor').click()
    
    // Fill form
    cy.get('input[name="name"]').type('Jane Doe')
    cy.get('input[name="email"]').type('jane@example.com')
    cy.get('input[name="phone"]').type('+1234567890')
    cy.get('input[name="investmentAmount"]').type('5000')
    cy.get('input[name="initiationDate"]').type('2024-01-01')
    cy.get('input[name="username"]').type('janedoe')
    cy.get('input[name="password"]').type('password123')
    
    cy.get('button[type="submit"]').click()
    
    // Should show new investor in table
    cy.get('table').should('contain', 'Jane Doe')
    cy.get('table').should('contain', 'jane@example.com')
    cy.get('table').should('contain', '€5,000.00')
  })

  it('should edit existing investor', () => {
    // First add an investor
    cy.get('button').contains('Add Investor').click()
    cy.get('input[name="name"]').type('John Smith')
    cy.get('input[name="email"]').type('john@example.com')
    cy.get('input[name="phone"]').type('+1234567890')
    cy.get('input[name="investmentAmount"]').type('3000')
    cy.get('input[name="initiationDate"]').type('2024-01-01')
    cy.get('button[type="submit"]').click()
    
    // Edit the investor
    cy.get('button').contains('Edit').first().click()
    cy.get('input[name="investmentAmount"]').clear().type('6000')
    cy.get('button[type="submit"]').click()
    
    // Should show updated amount
    cy.get('table').should('contain', '€6,000.00')
  })

  it('should delete investor', () => {
    // First add an investor
    cy.get('button').contains('Add Investor').click()
    cy.get('input[name="name"]').type('Bob Wilson')
    cy.get('input[name="email"]').type('bob@example.com')
    cy.get('input[name="phone"]').type('+1234567890')
    cy.get('input[name="investmentAmount"]').type('4000')
    cy.get('input[name="initiationDate"]').type('2024-01-01')
    cy.get('button[type="submit"]').click()
    
    // Delete the investor
    cy.get('button').contains('Delete').first().click()
    cy.on('window:confirm', () => true)
    
    // Should not contain the deleted investor
    cy.get('table').should('not.contain', 'Bob Wilson')
  })

  it('should validate required fields', () => {
    cy.get('button').contains('Add Investor').click()
    cy.get('button[type="submit"]').click()
    
    // Should show validation errors
    cy.get('input[name="name"]').should('have.class', 'border-red-500')
    cy.get('input[name="email"]').should('have.class', 'border-red-500')
    cy.get('input[name="investmentAmount"]').should('have.class', 'border-red-500')
  })

  it('should add performance entry for investor', () => {
    // First add an investor
    cy.get('button').contains('Add Investor').click()
    cy.get('input[name="name"]').type('Alice Brown')
    cy.get('input[name="email"]').type('alice@example.com')
    cy.get('input[name="phone"]').type('+1234567890')
    cy.get('input[name="investmentAmount"]').type('7000')
    cy.get('input[name="initiationDate"]').type('2024-01-01')
    cy.get('button[type="submit"]').click()
    
    // Add performance entry
    cy.get('button').contains('Add Performance').first().click()
    cy.get('input[name="year"]').clear().type('2024')
    cy.get('input[name="month"]').clear().type('1')
    cy.get('input[name="growthAmount"]').type('350')
    cy.get('input[name="growthPercentage"]').type('5.0')
    cy.get('button[type="submit"]').click()
    
    // Should show performance in table
    cy.get('table').should('contain', '1/2024')
    cy.get('table').should('contain', '€350.00')
  })

  it('should display investor overview metrics', () => {
    // Add a couple of investors
    cy.get('button').contains('Add Investor').click()
    cy.get('input[name="name"]').type('Investor 1')
    cy.get('input[name="email"]').type('investor1@example.com')
    cy.get('input[name="phone"]').type('+1234567890')
    cy.get('input[name="investmentAmount"]').type('5000')
    cy.get('input[name="initiationDate"]').type('2024-01-01')
    cy.get('button[type="submit"]').click()
    
    cy.get('button').contains('Add Investor').click()
    cy.get('input[name="name"]').type('Investor 2')
    cy.get('input[name="email"]').type('investor2@example.com')
    cy.get('input[name="phone"]').type('+1234567890')
    cy.get('input[name="investmentAmount"]').type('3000')
    cy.get('input[name="initiationDate"]').type('2024-01-01')
    cy.get('button[type="submit"]').click()
    
    // Should show total metrics
    cy.get('.card').should('contain', '€8,000.00') // Total invested
    cy.get('.card').should('contain', '2') // Total investors
  })

  it('should persist investor data after page refresh', () => {
    // Add an investor
    cy.get('button').contains('Add Investor').click()
    cy.get('input[name="name"]').type('Persistent Investor')
    cy.get('input[name="email"]').type('persistent@example.com')
    cy.get('input[name="phone"]').type('+1234567890')
    cy.get('input[name="investmentAmount"]').type('10000')
    cy.get('input[name="initiationDate"]').type('2024-01-01')
    cy.get('button[type="submit"]').click()
    
    // Refresh page
    cy.reload()
    
    // Should still show the investor
    cy.get('table').should('contain', 'Persistent Investor')
    cy.get('table').should('contain', '€10,000.00')
  })

  it('should handle investor login', () => {
    // Add an investor with credentials
    cy.get('button').contains('Add Investor').click()
    cy.get('input[name="name"]').type('Test Investor')
    cy.get('input[name="email"]').type('test@example.com')
    cy.get('input[name="phone"]').type('+1234567890')
    cy.get('input[name="investmentAmount"]').type('5000')
    cy.get('input[name="initiationDate"]').type('2024-01-01')
    cy.get('input[name="username"]').type('testinvestor')
    cy.get('input[name="password"]').type('testpass')
    cy.get('button[type="submit"]').click()
    
    // Logout and login as investor
    cy.get('button').contains('Logout').click()
    cy.get('input[name="username"]').type('testinvestor')
    cy.get('input[name="password"]').type('testpass')
    cy.get('button[type="submit"]').click()
    
    // Should be on investor dashboard
    cy.url().should('include', '/dashboard')
    cy.get('h1').should('contain', 'Dashboard')
  })
})

