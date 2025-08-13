import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDs5yhWZs0WAD-Yqv28zgCY8KtmcplDAT0",
  authDomain: "finwise-62ed2.firebaseapp.com",
  projectId: "finwise-62ed2",
  storageBucket: "finwise-62ed2.firebasestorage.app",
  messagingSenderId: "996397415024",
  appId: "1:996397415024:web:2d7322e54661b9656fd2b5",
  measurementId: "G-3RZS0D4YC4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;