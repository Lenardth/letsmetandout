import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const importText = (text) => import('data:text/javascript;base64,' + Buffer.from(text).toString('base64'));
const { withDeadline } = await importText(fs.readFileSync(new URL('../src/utils/auth/request.js', import.meta.url), 'utf8'));
const { authErrorMessage } = await importText(fs.readFileSync(new URL('../src/utils/auth/errors.js', import.meta.url), 'utf8'));
const never = () => new Promise(() => {});
test('deadline rejects a stalled request and preserves success and errors', async () => {
  await assert.rejects(withDeadline(never(), 'Timed out', 5), { code: 'auth/request-timeout', message: 'Timed out' });
  assert.equal(await withDeadline(Promise.resolve('ok'), 'timeout', 5), 'ok');
  const failure = new Error('Permission denied');
  await assert.rejects(withDeadline(Promise.reject(failure), 'timeout', 5), (error) => error === failure);
});
let dependencies;
let source = fs.readFileSync(new URL('../src/utils/auth/useAuth.js', import.meta.url), 'utf8').replace(/^import .*;$/gm, '');
source = 'const {router,useCallback,useEffect,onIdTokenChanged,signInWithEmailAndPassword,createUserWithEmailAndPassword,sendEmailVerification,sendPasswordResetEmail,firebaseSignOut,useAuthStore,authErrorMessage,getFirebase,getOwnProfile,createAccountProfile,withDeadline}=globalThis.authTestDependencies;\n' + source;
function setup(overrides = {}) {
  const writes = []; const events = [];
  const user = { uid:'owner', emailVerified:true, getIdToken:async ()=>'token' };
  const store = () => ({ isReady:true, auth:null, setAuth:(value)=>writes.push(value) });
  store.setState = (value) => events.push(value);
  dependencies = { router:{push(){},replace(){}}, useCallback:(fn)=>fn, useEffect:()=>{},
    onIdTokenChanged:()=>()=>{}, signInWithEmailAndPassword:async()=>({user}), createUserWithEmailAndPassword:async()=>({user}),
    sendEmailVerification:async()=>events.push('verification'), sendPasswordResetEmail:async()=>{}, firebaseSignOut:async()=>events.push('signout'),
    useAuthStore:store, authErrorMessage, getFirebase:()=>({auth:{}}), getOwnProfile:async()=>({first_name:'A'}), createAccountProfile:async()=>events.push('profile'),
    withDeadline:(promise,message)=>withDeadline(promise,message,5), ...overrides };
  globalThis.authTestDependencies = dependencies;
  return { writes, events };
}
let sequence = 0;
async function hook() { const module = await importText(source + '\n// ' + sequence++); return module.useAuth(); }
test('login returns an actionable failure when profile loading never finishes', async () => {
  const state=setup({getOwnProfile:never});const auth=await hook();const result=await auth.login('owner@example.com','password');
  assert.equal(result.success,false); assert.match(result.error,/profile could not be loaded/);assert.equal(state.writes.length,0);
});
test('signup sends verification even if profile creation stalls, then signs out with recovery instructions', async () => {
  const state=setup({createAccountProfile:never}); const auth=await hook();
  await assert.rejects(auth.register({email:'owner@example.com',password:'password'}),/Your account was created.*profile could not be saved.*Resend verification/);
  assert(state.events.includes('verification'));assert(state.events.includes('signout'));assert.deepEqual(state.writes,[null]);
});
test('startup releases readiness when a signed-in profile request stalls', async () => {
  let callback; const state=setup({getOwnProfile:never,onIdTokenChanged:(_auth,fn)=>{callback=fn;return()=>{};}}); const auth=await hook();const dispose=auth.initiate();
  await callback({uid:'owner',emailVerified:true,getIdToken:async()=>'token'});
  assert.deepEqual(state.events.at(-1),{isReady:true}); assert.equal(state.writes.at(-1),null);dispose();
});
test('database permissions and availability failures have useful messages', () => {
  assert.match(authErrorMessage({code:'permission-denied'}),/database permissions/);
  assert.match(authErrorMessage({code:'unavailable'}),/internet connection/);
});
