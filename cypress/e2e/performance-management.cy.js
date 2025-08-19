describe('Performance Management', () => {
  beforeEach(() => {
    cy.visit('/')
    cy.get('input[name="username"]').type('admin')
    cy.get('input[name="password"]').type('CrudeNico')
    cy.get('button[type="submit"]').click()
    cy.visit('/performance')
  })

  it('should display performance overview', () => {
    cy.get('h1').should('contain', 'Investment Performance')
    cy.get('.card').should('have.length.at.least', 4) // At least 4 metric cards
  })

  it('should add new performance entry', () => {
    cy.get('button').contains('Add Entry').click()
    
    // Fill form
    cy.get('input[name="year"]').clear().type('2024')
    cy.get('input[name="month"]').clear().type('3')
    cy.get('input[name="growthAmount"]').type('500')
    cy.get('input[name="growthPercentage"]').type('5.0')
    cy.get('input[name="deposit"]').type('1000')
    cy.get('input[name="withdrawal"]').type('0')
    
    cy.get('button[type="submit"]').click()
    
    // Should show success or redirect
    cy.get('table').should('contain', '3/2024')
    cy.get('table').should('contain', '€500.00')
  })

  it('should edit existing performance entry', () => {
    // First add an entry
    cy.get('button').contains('Add Entry').click()
    cy.get('input[name="year"]').clear().type('2024')
    cy.get('input[name="month"]').clear().type('4')
    cy.get('input[name="growthAmount"]').type('300')
    cy.get('input[name="growthPercentage"]').type('3.0')
    cy.get('button[type="submit"]').click()
    
    // Edit the entry
    cy.get('button').contains('Edit').first().click()
    cy.get('input[name="growthAmount"]').clear().type('600')
    cy.get('button[type="submit"]').click()
    
    // Should show updated value
    cy.get('table').should('contain', '€600.00')
  })

  it('should delete performance entry', () => {
    // First add an entry
    cy.get('button').contains('Add Entry').click()
    cy.get('input[name="year"]').clear().type('2024')
    cy.get('input[name="month"]').clear().type('5')
    cy.get('input[name="growthAmount"]').type('400')
    cy.get('input[name="growthPercentage"]').type('4.0')
    cy.get('button[type="submit"]').click()
    
    // Delete the entry
    cy.get('button').contains('Delete').first().click()
    cy.on('window:confirm', () => true)
    
    // Should not contain the deleted entry
    cy.get('table').should('not.contain', '5/2024')
  })

  it('should update starting balance', () => {
    cy.get('button').contains('Update Balance').click()
    cy.get('input[name="startingBalance"]').clear().type('15000')
    cy.get('button[type="submit"]').click()
    
    // Should show updated balance in overview
    cy.get('.card').should('contain', '€15,000.00')
  })

  it('should validate form fields', () => {
    cy.get('button').contains('Add Entry').click()
    cy.get('button[type="submit"]').click()
    
    // Should show validation errors
    cy.get('input[name="growthAmount"]').should('have.class', 'border-red-500')
    cy.get('input[name="growthPercentage"]').should('have.class', 'border-red-500')
  })

  it('should display performance entries in chronological order', () => {
    // Add multiple entries in random order
    cy.get('button').contains('Add Entry').click()
    cy.get('input[name="year"]').clear().type('2024')
    cy.get('input[name="month"]').clear().type('3')
    cy.get('input[name="growthAmount"]').type('300')
    cy.get('input[name="growthPercentage"]').type('3.0')
    cy.get('button[type="submit"]').click()
    
    cy.get('button').contains('Add Entry').click()
    cy.get('input[name="year"]').clear().type('2024')
    cy.get('input[name="month"]').clear().type('1')
    cy.get('input[name="growthAmount"]').type('100')
    cy.get('input[name="growthPercentage"]').type('1.0')
    cy.get('button[type="submit"]').click()
    
    cy.get('button').contains('Add Entry').click()
    cy.get('input[name="year"]').clear().type('2024')
    cy.get('input[name="month"]').clear().type('2')
    cy.get('input[name="growthAmount"]').type('200')
    cy.get('input[name="growthPercentage"]').type('2.0')
    cy.get('button[type="submit"]').click()
    
    // Check order in table
    cy.get('table tbody tr').first().should('contain', '1/2024')
    cy.get('table tbody tr').eq(1).should('contain', '2/2024')
    cy.get('table tbody tr').eq(2).should('contain', '3/2024')
  })

  it('should persist data after page refresh', () => {
    // Add an entry
    cy.get('button').contains('Add Entry').click()
    cy.get('input[name="year"]').clear().type('2024')
    cy.get('input[name="month"]').clear().type('6')
    cy.get('input[name="growthAmount"]').type('700')
    cy.get('input[name="growthPercentage"]').type('7.0')
    cy.get('button[type="submit"]').click()
    
    // Refresh page
    cy.reload()
    
    // Should still show the entry
    cy.get('table').should('contain', '6/2024')
    cy.get('table').should('contain', '€700.00')
  })

  it('should handle network errors gracefully', () => {
    // Intercept Firebase calls and simulate network error
    cy.intercept('POST', '**/firestore.googleapis.com/**', { statusCode: 500 })
    
    cy.get('button').contains('Add Entry').click()
    cy.get('input[name="year"]').clear().type('2024')
    cy.get('input[name="month"]').clear().type('7')
    cy.get('input[name="growthAmount"]').type('800')
    cy.get('input[name="growthPercentage"]').type('8.0')
    cy.get('button[type="submit"]').click()
    
    // Should show error message
    cy.get('.bg-danger-50').should('be.visible')
  })
})

