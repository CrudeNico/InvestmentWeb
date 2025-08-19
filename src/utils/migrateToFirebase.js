// Migration utility to move data from localStorage to Firebase
// Run this in the browser console after setting up Firebase

import { migrationServices } from '../firebase/services'

export const migrateToFirebase = async () => {
  try {
    console.log('Starting migration to Firebase...')
    
    // Check if there's data to migrate
    const hasInvestmentData = localStorage.getItem('investmentData')
    const hasInvestors = localStorage.getItem('investors')
    const hasChatData = localStorage.getItem('chat_conversations') || localStorage.getItem('chat_messages')
    
    if (!hasInvestmentData && !hasInvestors && !hasChatData) {
      console.log('No data found to migrate')
      return
    }
    
    console.log('Found data to migrate:')
    if (hasInvestmentData) console.log('- Investment data')
    if (hasInvestors) console.log('- Investors data')
    if (hasChatData) console.log('- Chat data')
    
    // Run the migration
    await migrationServices.migrateFromLocalStorage()
    
    console.log('✅ Migration completed successfully!')
    console.log('Your data is now stored in Firebase.')
    console.log('You can safely clear localStorage if you want.')
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
    console.log('Your data is still safe in localStorage.')
  }
}

// Function to clear localStorage after successful migration
export const clearLocalStorage = () => {
  const keysToRemove = [
    'investmentData',
    'investors',
    'chat_conversations',
    'chat_messages'
  ]
  
  keysToRemove.forEach(key => {
    localStorage.removeItem(key)
  })
  
  console.log('✅ localStorage cleared successfully!')
}

// Function to check migration status
export const checkMigrationStatus = () => {
  const localData = {
    investmentData: localStorage.getItem('investmentData'),
    investors: localStorage.getItem('investors'),
    chat_conversations: localStorage.getItem('chat_conversations'),
    chat_messages: localStorage.getItem('chat_messages')
  }
  
  console.log('Migration Status:')
  console.log('Local Storage Data:')
  Object.entries(localData).forEach(([key, value]) => {
    console.log(`- ${key}: ${value ? 'Present' : 'Not found'}`)
  })
  
  return localData
}

// Export for use in browser console
if (typeof window !== 'undefined') {
  window.migrateToFirebase = migrateToFirebase
  window.clearLocalStorage = clearLocalStorage
  window.checkMigrationStatus = checkMigrationStatus
}
