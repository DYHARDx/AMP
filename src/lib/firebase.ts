import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAsXGL3iqPGdzRKWlyU3jzrV5oC1OG7fr4",
  authDomain: "amp-mediaz.firebaseapp.com",
  projectId: "amp-mediaz",
  storageBucket: "amp-mediaz.firebasestorage.app",
  messagingSenderId: "117826156017",
  appId: "1:117826156017:web:cbbed13f3e79965c500050",
  measurementId: "G-KXVBRXSRS5"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
