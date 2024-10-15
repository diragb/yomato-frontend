// Packages:
import { initializeApp } from 'firebase/app'
import { getAnalytics } from 'firebase/analytics'

// Constants:
const firebaseConfig = {
  apiKey: 'AIzaSyDnabOJWdt_QvEDaxRAELAEa5EQFaKh23w',
  authDomain: 'yomato-app.firebaseapp.com',
  projectId: 'yomato-app',
  storageBucket: 'yomato-app.appspot.com',
  messagingSenderId: '176117418536',
  appId: '1:176117418536:web:26534e950e88289760031d',
  measurementId: 'G-GWHSSBJY35'
}

// Exports:
export const app = initializeApp(firebaseConfig)
export const analytics = getAnalytics(app)
