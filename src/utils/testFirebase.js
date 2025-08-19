// Test Firebase connectivity
import { db } from '../firebase/config'
import { collection, getDocs } from 'firebase/firestore'

export const testFirebaseConnection = async () => {
  try {
    console.log('Testing Firebase connection...')
    
    // Try to read from a collection
    const testCollection = collection(db, 'test')
    await getDocs(testCollection)
    
    console.log('✅ Firebase connection successful!')
    return true
  } catch (error) {
    console.error('❌ Firebase connection failed:', error)
    return false
  }
}

// Export for use in browser console
if (typeof window !== 'undefined') {
  window.testFirebaseConnection = testFirebaseConnection
}


