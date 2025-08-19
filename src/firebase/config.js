import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import { getAnalytics } from 'firebase/analytics'

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBFgc4ilnw_4sI0XIdSDEnLiHj5X5xBTEY",
  authDomain: "investment-tracker-new.firebaseapp.com",
  projectId: "investment-tracker-new",
  storageBucket: "investment-tracker-new.firebasestorage.app",
  messagingSenderId: "909641216807",
  appId: "1:909641216807:web:13c5e6a420630dfcfeef02",
  measurementId: "G-VR84X1XQLD"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase services
export const db = getFirestore(app)
export const auth = getAuth(app)
export const analytics = getAnalytics(app)

export default app
