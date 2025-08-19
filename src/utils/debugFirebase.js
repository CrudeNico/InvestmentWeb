// Debug Firebase connection and data
import { db } from '../firebase/config'
import { collection, getDocs } from 'firebase/firestore'

export const debugFirebase = async () => {
  console.log('🔍 Debugging Firebase connection...')
  
  try {
    // Test basic Firebase connection
    console.log('1. Testing basic Firebase connection...')
    const testCollection = collection(db, 'test')
    await getDocs(testCollection)
    console.log('✅ Basic Firebase connection successful')
    
    // Test investors collection
    console.log('2. Testing investors collection...')
    const investorsCollection = collection(db, 'investors')
    const investorsSnapshot = await getDocs(investorsCollection)
    const investors = investorsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    console.log('✅ Investors from Firebase:', investors)
    
    // Check localStorage
    console.log('3. Checking localStorage...')
    const localInvestors = JSON.parse(localStorage.getItem('investors') || '[]')
    console.log('✅ Investors from localStorage:', localInvestors)
    
    // Check if any investors exist
    const allInvestors = [...investors, ...localInvestors]
    console.log('4. All available investors:', allInvestors)
    
    if (allInvestors.length === 0) {
      console.log('⚠️ No investors found. Create an investor first as admin.')
    } else {
      console.log('📋 Available investor credentials:')
      allInvestors.forEach(investor => {
        console.log(`   Username: ${investor.username}, Password: ${investor.password}`)
      })
    }
    
    return { success: true, investors: allInvestors }
    
  } catch (error) {
    console.error('❌ Firebase debug error:', error)
    
    if (error.code === 'permission-denied') {
      console.log('🔒 Permission denied. Check Firestore rules.')
      console.log('Go to Firebase Console → Firestore Database → Rules')
      console.log('Set rules to: allow read, write: if true; (for testing)')
    }
    
    if (error.message.includes('ERR_BLOCKED_BY_CLIENT')) {
      console.log('🚫 Request blocked by client (ad blocker/firewall)')
      console.log('Try disabling ad blockers or check firewall settings')
    }
    
    return { success: false, error }
  }
}

// Test investor login specifically
export const testInvestorLogin = async (username, password) => {
  console.log(`🔐 Testing login for: ${username}`)
  
  try {
    // Check Firebase first
    const investorsCollection = collection(db, 'investors')
    const investorsSnapshot = await getDocs(investorsCollection)
    const investors = investorsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    
    const firebaseInvestor = investors.find(inv => inv.username === username && inv.password === password)
    if (firebaseInvestor) {
      console.log('✅ Found investor in Firebase:', firebaseInvestor)
      return { success: true, investor: firebaseInvestor, source: 'firebase' }
    }
    
    // Check localStorage
    const localInvestors = JSON.parse(localStorage.getItem('investors') || '[]')
    const localInvestor = localInvestors.find(inv => inv.username === username && inv.password === password)
    if (localInvestor) {
      console.log('✅ Found investor in localStorage:', localInvestor)
      return { success: true, investor: localInvestor, source: 'localStorage' }
    }
    
    console.log('❌ Investor not found in either Firebase or localStorage')
    console.log('Available usernames:', [...investors, ...localInvestors].map(inv => inv.username))
    
    return { success: false, error: 'Investor not found' }
    
  } catch (error) {
    console.error('❌ Login test error:', error)
    return { success: false, error }
  }
}

// Export for use in browser console
if (typeof window !== 'undefined') {
  window.debugFirebase = debugFirebase
  window.testInvestorLogin = testInvestorLogin
}


