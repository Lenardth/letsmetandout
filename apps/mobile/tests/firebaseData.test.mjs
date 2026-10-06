import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
let code = fs.readFileSync(new URL('../src/utils/firebaseData.js', import.meta.url), 'utf8').replace(/^import .*;$/gm, '');
code = 'const { doc, collection, getDoc, getDocs, writeBatch, setDoc, query, where, orderBy, limit, serverTimestamp } = globalThis.databaseMock; const getFirebase = () => globalThis.firebaseMock; const hasCompleteProfile = (p) => ["first_name","last_name","city","province"].every((k) => typeof p[k] === "string" && p[k].trim().length > 0);\n' + code;
const calls = [];
let results = [];
const snapshot = (value) => ({ exists: () => value != null, data: () => value, docs: Object.entries(value || {}).map(([id, child]) => ({ id, data: () => child })) });
globalThis.databaseMock = {
  doc: (_db, path) => ({ path }), collection: (_db, path) => ({ path }),
  where: (field, op, value) => ({ where: field, op, value }), orderBy: (field, direction) => ({ orderBy: field, direction }), limit: (n) => ({ limit: n }),
  query: (ref, ...constraints) => ({ ...ref, constraints }),
  getDoc: async (ref) => { calls.push(['get', ref]); const result = results.shift(); if (result instanceof Error) throw result; return snapshot(result); },
  getDocs: async (ref) => { calls.push(['get', ref]); const result = results.shift(); if (result instanceof Error) throw result; return snapshot(result); },
  setDoc: async (...args) => calls.push(['set', ...args]), serverTimestamp: () => ({ timestamp: true }),
  writeBatch: () => ({ set: (...args) => calls.push(['batchSet', ...args]), commit: async () => calls.push(['commit']) }),
};
const adapter = await import('data:text/javascript;base64,' + Buffer.from(code).toString('base64'));
function reset(values = [], user = { uid: 'owner', email: 'owner@example.com', emailVerified: true }) { calls.length = 0; results = values; globalThis.firebaseMock = { auth: { currentUser: user }, db: {} }; }
test('signed-out or unverified users cannot browse', async () => {
  reset([], null); await assert.rejects(adapter.loadFirebaseResource('/groups'), /sign in/);
  reset([], { uid: 'owner', emailVerified: false }); await assert.rejects(adapter.loadFirebaseResource('/groups'), /Confirm your email/);
  assert.equal(calls.length, 0);
});
test('Discover uses required security query, excludes self and private fields', async () => {
  reset([{ owner: { first_name: 'Self' }, other: { first_name: 'A', last_name: 'B', city: 'Durban', province: 'KwaZulu-Natal', email: 'private@example.com' } }]);
  const rows = await adapter.loadFirebaseResource('/discover/users', { limit: 999 });
  assert.equal(rows.length, 1); assert.equal(rows[0].name, 'A B'); assert(!('email' in rows[0]));
  assert.deepEqual(calls[0][1].constraints, [{ where: 'profile_complete', op: '==', value: true }, { limit: 101 }]);
});
test('wallet ignores supplied owner and reads authoritative balance', async () => {
  reset([{ tx: { amount: 20, created_at: 1700000000000 } }, { balance: 150 }]);
  const wallet = await adapter.loadFirebaseResource('/wallet/summary', { user_id: 'victim' });
  assert.equal(wallet.balance, 150); assert.equal(calls[0][1].path, 'wallets/owner/transactions'); assert.equal(calls[1][1].path, 'wallets/owner');
});
test('profile edits preserve timestamp and strip ownership/verification fields', async () => {
  const profile = { first_name: 'A', last_name: 'B', city: 'Durban', province: 'KwaZulu-Natal', bio: '', created_at: 1700000000000 };
  reset([profile, { ...profile, bio: 'Updated' }, { phone: '+27821234567' }]);
  await adapter.updateOwnProfile({ bio: 'Updated', id: 'victim', email_verified: true });
  const [, reference, data] = calls.find((c) => c[0] === 'set');
  assert.equal(reference.path, 'profiles/owner'); assert.equal(data.first_name, 'A'); assert.equal(data.bio, 'Updated');
  assert(!('email_verified' in data)); assert(!('id' in data)); assert.equal(data.created_at, profile.created_at);
});
test('signup writes public and private fields atomically', async () => {
  reset(); await adapter.createAccountProfile({ uid: 'new-user' }, { first_name: 'A', last_name: 'B', city: 'Durban', province: 'KwaZulu-Natal', phone: '+27821234567', terms_accepted: true, privacy_accepted: true, safety_guidelines_accepted: true });
  const writes = calls.filter((c) => c[0] === 'batchSet');
  assert.equal(writes.length, 2); assert.equal(writes[0][1].path, 'profiles/new-user');
  assert(!('phone' in writes[0][2])); assert.equal(writes[0][2].profile_complete, true);
  assert.equal(writes[1][1].path, 'account_details/new-user'); assert.equal(writes[1][2].phone, '+27821234567');
  assert.equal(calls.at(-1)[0], 'commit');
});
test('database errors surface without demo data', async () => {
  reset([new Error('Permission denied')]); await assert.rejects(adapter.loadFirebaseResource('/groups'), /Permission denied/);
});
test('bookings are scoped to authenticated owner', async () => {
  reset([{}]); await adapter.loadFirebaseResource('/bookings', { user_id: 'victim' }); assert.equal(calls[0][1].path, 'accounts/owner/bookings');
});
