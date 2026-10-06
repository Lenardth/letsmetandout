import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { pathToFileURL } from 'node:url';
const base = process.env.FIREBASE_TEST_MODULES;
const load = (name, path) => base ? import(pathToFileURL(`${base}/${path}`).href) : import(name);
const { initializeTestEnvironment, assertSucceeds, assertFails } = await load('@firebase/rules-unit-testing', '@firebase/rules-unit-testing/dist/esm/index.esm.js');
const { doc, collection, getDoc, getDocs, setDoc, updateDoc, writeBatch, query, where, limit, Timestamp, serverTimestamp } = await load('firebase/firestore', 'firebase/firestore/dist/index.mjs');
const env = await initializeTestEnvironment({ projectId: 'demo-safemeet', firestore: { host: '127.0.0.1', port: 8080, rules: fs.readFileSync(new URL('../firebase/firestore.rules', import.meta.url), 'utf8') } });
const profile = { first_name: 'A', last_name: 'B', city: 'Durban', province: 'KwaZulu-Natal', bio: '', interests: ['Coffee'], profile_photo_url: null, profile_complete: true, created_at: Timestamp.fromMillis(1000) };
const store = { owner_id: 'merchant', name: 'Cafe', category: 'Café', city: 'Durban', location: 'Durban', address: '1 Main Road', phone: '0311234567', image: null, description: '', deposit_cents: 10000, max_party_size: 8, created_at: Timestamp.fromMillis(1000) };
const db = (uid, verified = true) => env.authenticatedContext(uid, { email_verified: verified }).firestore();
await env.withSecurityRulesDisabled(async (context) => {
  for (const uid of ['customer','merchant','stranger']) await setDoc(doc(context.firestore(), `profiles/${uid}`), profile);
  await setDoc(doc(context.firestore(), 'stores/store1'), store);
  await setDoc(doc(context.firestore(), 'account_details/customer'), { phone: '+27821234567', terms_accepted: true, privacy_accepted: true, safety_guidelines_accepted: true });
  await setDoc(doc(context.firestore(), 'wallets/customer'), { balance: 10 });
});
const booking = { user_id: 'customer', store_id: 'store1', booking_owner_id: 'merchant', title: 'Cafe', location: 'Durban', booking_date: Date.now() + 86400000, guests: 2, deposit_cents: 10000, payment_status: 'unpaid', status: 'requested', created_at: serverTimestamp() };
function createBooking(database, id, changes = {}, both = true) {
  const batch = writeBatch(database);
  const value = { ...booking, ...changes };
  batch.set(doc(database, `accounts/customer/bookings/${id}`), value);
  if (both) batch.set(doc(database, `stores/store1/reservation_requests/${id}`), value);
  return batch.commit();
}
test('Firestore access boundaries and reservation integrity', async (t) => {
  try {
    await t.test('signed-out and unverified users cannot discover; complete member query works', async () => {
      await assertFails(getDocs(query(collection(env.unauthenticatedContext().firestore(), 'profiles'), where('profile_complete','==',true),limit(10))));
      await assertFails(getDocs(query(collection(db('customer',false), 'profiles'), where('profile_complete','==',true),limit(10))));
      await assertSucceeds(getDocs(query(collection(db('customer'), 'profiles'), where('profile_complete','==',true),limit(10))));
      await assertFails(getDocs(collection(db('customer'), 'profiles')));
    });
    await t.test('signup can create own public and private data before email confirmation', async () => {
      const database = db('new',false); const batch = writeBatch(database);
      batch.set(doc(database,'profiles/new'), { ...profile, created_at: serverTimestamp() });
      batch.set(doc(database,'account_details/new'), { phone: '+27821234567', terms_accepted: true, privacy_accepted: true, safety_guidelines_accepted: true });
      await assertSucceeds(batch.commit());
      await assertFails(setDoc(doc(database,'profiles/victim'), { ...profile, created_at: serverTimestamp() }));
    });
    await t.test('private details and wallets deny other users and client balance changes', async () => {
      await assertSucceeds(getDoc(doc(db('customer'),'account_details/customer')));
      await assertFails(getDoc(doc(db('stranger'),'account_details/customer')));
      await assertFails(getDoc(doc(db('stranger'),'wallets/customer')));
      await assertFails(updateDoc(doc(db('customer'),'wallets/customer'),{balance:100000}));
    });
    await t.test('profile updates reject extra fields, oversized text, changed timestamps and invalid interests', async () => {
      for (const patch of [{admin:true},{bio:'x'.repeat(2001)},{first_name:1},{interests:[123]},{created_at:Timestamp.fromMillis(2000)},{profile_complete:false}]) await assertFails(updateDoc(doc(db('customer'),'profiles/customer'),patch));
      await assertSucceeds(updateDoc(doc(db('customer'),'profiles/customer'),{bio:'Hello'}));
    });
    await t.test('store ownership and schema cannot be corrupted', async () => {
      await assertFails(updateDoc(doc(db('stranger'),'stores/store1'),{name:'Stolen'}));
      for (const patch of [{owner_id:'stranger'},{deposit_cents:-1},{description:'x'.repeat(2001)},{admin:true}]) await assertFails(updateDoc(doc(db('merchant'),'stores/store1'),patch));
      await assertSucceeds(updateDoc(doc(db('merchant'),'stores/store1'),{description:'Coffee'}));
    });
    await t.test('booking creation requires both copies and authoritative price, ownership and unpaid status', async () => {
      await assertSucceeds(createBooking(db('customer'),'valid'));
      await assertFails(createBooking(db('customer'),'missing',{},false));
      for (const [id,patch] of [['price',{deposit_cents:1}],['paid',{payment_status:'paid'}],['owner',{booking_owner_id:'customer'}],['past',{booking_date:1000}],['party',{guests:9}]]) await assertFails(createBooking(db('customer'),id,patch));
      await assertFails(createBooking(db('stranger'),'stolen'));
    });
    await t.test('merchant alone can answer; both copies must agree and all payment fields remain immutable', async () => {
      const answer = (database, changes, both = true) => { const batch = writeBatch(database); batch.update(doc(database,'accounts/customer/bookings/valid'),changes); if(both) batch.update(doc(database,'stores/store1/reservation_requests/valid'),changes); return batch.commit(); };
      await assertFails(answer(db('stranger'),{status:'accepted'}));
      await assertFails(answer(db('customer'),{status:'accepted'}));
      await assertFails(answer(db('merchant'),{status:'accepted'},false));
      await assertFails(answer(db('merchant'),{status:'accepted',payment_status:'paid'}));
      await assertSucceeds(answer(db('merchant'),{status:'accepted'}));
      await assertFails(answer(db('merchant'),{status:'declined'}));
      const row = await assertSucceeds(getDoc(doc(db('customer'),'accounts/customer/bookings/valid'))); assert.equal(row.data().status,'accepted');
    });
  } finally { await env.cleanup(); }
});
