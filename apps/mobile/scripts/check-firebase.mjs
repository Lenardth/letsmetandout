import fs from 'node:fs';
import { parseEnv } from 'node:util';
let settings = {};
for (const name of ['.env', '.env.local']) if (fs.existsSync(name)) settings = { ...settings, ...parseEnv(fs.readFileSync(name, 'utf8')) };
settings = { ...settings, ...process.env };
const required = ['EXPO_PUBLIC_FIREBASE_API_KEY', 'EXPO_PUBLIC_FIREBASE_PROJECT_ID', 'EXPO_PUBLIC_FIREBASE_APP_ID'];
const missing = required.filter((name) => !settings[name]);
if (missing.length) { console.error('Add Firebase web configuration to mobile/.env. Missing: ' + missing.join(', ')); process.exit(1); }
try {
  const url = new URL('https://identitytoolkit.googleapis.com/v1/projects');
  url.searchParams.set('key', settings.EXPO_PUBLIC_FIREBASE_API_KEY);
  const response = await fetch(url, { signal: AbortSignal.timeout(15000) });
  const result = await response.json();
  if (!response.ok) {
    const code = result.error?.message || `HTTP ${response.status}`;
    if (code === 'CONFIGURATION_NOT_FOUND') throw new Error('Enable Firebase Authentication: Console → Authentication → Get started → Sign-in method → Email/Password.');
    throw new Error(`Firebase Auth: ${code}`);
  }
  if (result.projectId && ![settings.EXPO_PUBLIC_FIREBASE_PROJECT_ID, settings.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID].includes(String(result.projectId))) throw new Error('The Firebase API key and project ID belong to different projects.');
  console.log('Firebase Authentication connection verified. Firestore database and rules must still be deployed.');
} catch (error) { console.error(error.message.replaceAll(settings.EXPO_PUBLIC_FIREBASE_API_KEY, '[redacted]')); process.exit(1); }
