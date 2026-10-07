import fs from 'node:fs';
import { parseEnv } from 'node:util';
let env = {};
if (!process.argv.includes('--environment-only')) {
 for (const file of ['.env', '.env.local']) if (fs.existsSync(file)) Object.assign(env, parseEnv(fs.readFileSync(file, 'utf8')));
}
Object.assign(env, process.env);
const errors = [];
for (const key of ['API_KEY','AUTH_DOMAIN','PROJECT_ID','STORAGE_BUCKET','MESSAGING_SENDER_ID','APP_ID']) {
 if (!env[`EXPO_PUBLIC_FIREBASE_${key}`]) errors.push(`Missing EXPO_PUBLIC_FIREBASE_${key}`);
}
if (env.EXPO_PUBLIC_FIREBASE_USE_EMULATORS === 'true') errors.push('Emulators must be disabled for a release build.');
if (env.EXPO_PUBLIC_FIREBASE_PROJECT_ID !== 'letsmeetandou') errors.push('Release Firebase project must be letsmeetandou.');
if (env.EXPO_PUBLIC_FIREBASE_APP_ID !== '1:896459332759:web:08056f94e56b76d5961dd2') errors.push('Release Firebase web app ID does not match the existing app.');
for (const key of Object.keys(env)) if (key.startsWith('EXPO_PUBLIC_') && /PRIVATE_KEY|SERVICE_ACCOUNT|ADMIN_CREDENTIAL|CREATE_TEMP_API_KEY/.test(key)) errors.push(`Remove client-exposed credential variable ${key}.`);
const { expo } = JSON.parse(fs.readFileSync('app.json', 'utf8'));
if (!expo.scheme || !expo.ios.bundleIdentifier || !expo.android.package || expo.android.package.includes('CreateExpoEnvironment')) errors.push('Set release app identifiers and URL scheme.');
if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
console.log('Release configuration passed. This does not verify live Firebase provisioning, store credentials, policies or device behaviour.');
