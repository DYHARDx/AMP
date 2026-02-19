import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyANIzhEnkCdwE0OI4PbFOJoMQ6hmr3v8ck",
  authDomain: "amp-mediao.firebaseapp.com",
  projectId: "amp-mediao",
  storageBucket: "amp-mediao.firebasestorage.app",
  messagingSenderId: "108934256291",
  appId: "1:108934256291:web:d993cada6cdf129b665116",
  measurementId: "G-3146N70ZPV"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
