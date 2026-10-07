import { initializeApp, getApps } from 'firebase/app';
import { connectAuthEmulator } from 'firebase/auth';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { initializeFirebaseAuth } from './firebaseAuth';
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore';

let services;
export function getFirebase() {
  if (services) return services;
  const demo = process.env.EXPO_PUBLIC_FIREBASE_USE_EMULATORS === 'true';
  if (demo && (typeof __DEV__ === 'undefined' || !__DEV__)) throw new Error('Demo login is only available in development.');
  const config = demo ? { apiKey: 'demo-api-key', projectId: 'demo-safemeet-login', appId: 'demo-safemeet-login', storageBucket: 'demo-safemeet-login.appspot.com', authDomain: 'demo-safemeet-login.firebaseapp.com' } : {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  };
  if (!config.apiKey || !config.projectId || !config.appId) {
    throw new Error('Add your Firebase web app configuration to mobile/.env, then restart Expo.');
  }
  const name = demo ? 'safemeet-demo' : 'safemeet';
  const existing = getApps().find((app) => app.name === name);
  const app = existing || initializeApp(config, name);
  const auth = initializeFirebaseAuth(app);
  const db = getFirestore(app);
  const storage = config.storageBucket ? getStorage(app) : null;
  if (demo) {
    const host = process.env.EXPO_PUBLIC_FIREBASE_EMULATOR_HOST || '127.0.0.1';
    connectAuthEmulator(auth, `http://${host}:9099`);
    connectFirestoreEmulator(db, host, 8080);
    connectStorageEmulator(storage, host, 9199);
  }
  services = { auth, db, storage };
  return services;
}
