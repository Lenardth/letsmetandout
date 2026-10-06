import { initializeApp, getApps } from 'firebase/app';
import { initializeFirebaseAuth } from './firebaseAuth';
import { getFirestore } from 'firebase/firestore';

let services;
export function getFirebase() {
  if (services) return services;
  const config = {
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
  const existing = getApps().find((app) => app.name === 'safemeet');
  const app = existing || initializeApp(config, 'safemeet');
  const auth = initializeFirebaseAuth(app);
  services = { auth, db: getFirestore(app) };
  return services;
}
