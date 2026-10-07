import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const code = fs.readFileSync(new URL('../src/utils/firebase.js', import.meta.url), 'utf8').replace(/^import .*;$/gm, '').replace('export function', 'function');
function setup(demo, development = true) {
  const calls = [];
  const env = { EXPO_PUBLIC_FIREBASE_USE_EMULATORS: String(demo), EXPO_PUBLIC_FIREBASE_API_KEY: 'live-public-key', EXPO_PUBLIC_FIREBASE_PROJECT_ID: 'letsmeetandou', EXPO_PUBLIC_FIREBASE_APP_ID: 'live-public-app-id' };
  const factory = new Function('process', '__DEV__', 'initializeApp', 'getApps', 'initializeFirebaseAuth', 'getFirestore', 'connectAuthEmulator', 'connectFirestoreEmulator', 'getStorage', 'connectStorageEmulator', code + '\nreturn getFirebase;');
  const getFirebase = factory({ env }, development, (config, name) => { calls.push(['app', config, name]); return {}; }, () => [], () => ({}), () => ({}), (_auth, url) => calls.push(['auth-emulator', url]), (_db, host, port) => calls.push(['firestore-emulator', host, port]), () => ({}), (_storage, host, port) => calls.push(['storage-emulator', host, port]));
  return { calls, env, getFirebase };
}
test('demo config uses only a demo project and connects both services once', () => {
  const state = setup(true); state.getFirebase(); state.getFirebase();
  assert.equal(state.calls[0][1].projectId, 'demo-safemeet-login');
  assert.equal(state.calls[0][2], 'safemeet-demo');
  assert.deepEqual(state.calls.slice(1), [['auth-emulator', 'http://127.0.0.1:9099'], ['firestore-emulator', '127.0.0.1', 8080], ['storage-emulator', '127.0.0.1', 9199]]);
});
test('normal config preserves live project and never connects emulators', () => {
  const state = setup(false); state.getFirebase();
  assert.equal(state.calls[0][1].projectId, 'letsmeetandou'); assert.equal(state.calls[0][2], 'safemeet'); assert.equal(state.calls.length, 1);
});
test('production builds reject demo mode before creating an app', () => {
  const state = setup(true, false); assert.throws(() => state.getFirebase(), /only available in development/); assert.equal(state.calls.length, 0);
});
test('Android emulator host is used for Auth and Firestore together', () => {
  const state = setup(true); state.env.EXPO_PUBLIC_FIREBASE_EMULATOR_HOST = '10.0.2.2'; state.getFirebase();
  assert.deepEqual(state.calls.slice(1), [['auth-emulator', 'http://10.0.2.2:9099'], ['firestore-emulator', '10.0.2.2', 8080], ['storage-emulator', '10.0.2.2', 9199]]);
});
