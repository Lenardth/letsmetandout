import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { pathToFileURL } from 'node:url';
const base = process.env.FIREBASE_TEST_MODULES;
const load = (name, path) => base ? import(pathToFileURL(`${base}/${path}`).href) : import(name);
const { initializeTestEnvironment, assertSucceeds, assertFails } = await load('@firebase/rules-unit-testing', '@firebase/rules-unit-testing/dist/esm/index.esm.js');
const { doc, collection, getDoc, getDocs, setDoc, updateDoc, deleteDoc, writeBatch, runTransaction, query, where, orderBy, limit, Timestamp, serverTimestamp } = await load('firebase/firestore', 'firebase/firestore/dist/index.mjs');
const env = await initializeTestEnvironment({ projectId: 'demo-safemeet', firestore: { host: '127.0.0.1', port: 8080, rules: fs.readFileSync(new URL('../firebase/firestore.rules', import.meta.url), 'utf8') } });
const profile = { first_name: 'A', last_name: 'B', city: 'Durban', province: 'KwaZulu-Natal', bio: '', interests: ['Coffee'], profile_photo_url: null, profile_complete: true, created_at: Timestamp.fromMillis(1000) };
const store = { owner_id: 'merchant', name: 'Cafe', category: 'Café', city: 'Durban', location: 'Durban', address: '1 Main Road', phone: '0311234567', image: null, description: '', deposit_cents: 10000, max_party_size: 8, created_at: Timestamp.fromMillis(1000) };
const databases = new Map();
const db = (uid, verified = true) => { const key = `${uid}:${verified}`; if (!databases.has(key)) databases.set(key, env.authenticatedContext(uid, { email_verified: verified }).firestore()); return databases.get(key); };
await env.withSecurityRulesDisabled(async (context) => {
  for (const uid of ['customer','merchant','stranger']) {
    await setDoc(doc(context.firestore(), `profiles/${uid}`), profile);
    await setDoc(doc(context.firestore(), `account_roles/${uid}`), { account_type: uid === 'merchant' ? 'provider' : 'customer' });
  }
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
      batch.set(doc(database,'account_roles/new'), { account_type: 'customer' });
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
    await t.test('account types are owner-only, validated and immutable', async () => {
      await assertSucceeds(getDoc(doc(db('customer'), 'account_roles/customer')));
      await assertFails(getDoc(doc(db('stranger'), 'account_roles/customer')));
      await assertFails(updateDoc(doc(db('customer'), 'account_roles/customer'), { account_type: 'provider' }));
      await assertFails(setDoc(doc(db('bad'), 'account_roles/bad'), { account_type: 'admin' }));
      await assertFails(setDoc(doc(db('bad'), 'account_roles/bad'), { account_type: 'customer', admin: true }));
      await assertFails(setDoc(doc(db('customer'), 'stores/customer-store'), { ...store, owner_id: 'customer', created_at: serverTimestamp() }));
      await assertSucceeds(setDoc(doc(db('merchant'), 'stores/merchant-store'), { ...store, created_at: serverTimestamp() }));
      const batch = writeBatch(db('merchant'));
      const value = { ...booking, user_id: 'merchant' };
      batch.set(doc(db('merchant'), 'accounts/merchant/bookings/forbidden'), value);
      batch.set(doc(db('merchant'), 'stores/store1/reservation_requests/forbidden'), value);
      await assertFails(batch.commit());
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
    await t.test('production adapters create mirrored requests safely and record group consent', async () => {
      const loadSource = async (name, prefix = '') => {
        const code = fs.readFileSync(new URL(`../src/utils/${name}.js`, import.meta.url), 'utf8').replace(/^import .*;$/gm, '');
        return import('data:text/javascript;base64,' + Buffer.from(prefix + code).toString('base64'));
      };
      const validation = await loadSource('businessValidation');
      const policy = await loadSource('groupPolicy');
      globalThis.adapterTestDependencies = { doc, collection, getDoc, getDocs, setDoc, writeBatch, runTransaction, serverTimestamp, query, where, orderBy, limit, ...validation, ...policy, withDeadline: (promise) => promise };
      let activeUid = 'customer';
      globalThis.adapterTestFirebase = () => ({ db: db(activeUid), auth: { currentUser: { uid: activeUid, emailVerified: true } } });
      const prefix = 'const {doc,collection,getDoc,getDocs,setDoc,writeBatch,runTransaction,serverTimestamp,query,where,orderBy,limit,listingPayload,reservationPayload,groupPayload,contributionShare,withDeadline}=globalThis.adapterTestDependencies;const getFirebase=()=>globalThis.adapterTestFirebase();\n';
      const businessAdapter = await loadSource('business', prefix);
      const requestDate = new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10);
      const requestId = businessAdapter.newBookingId();
      const details = { date: requestDate, time: '18:00', guests: '2' };
      assert.equal(await businessAdapter.requestTable('store1', details, requestId), requestId);
      assert.equal(await businessAdapter.requestTable('store1', details, requestId), requestId);
      const requested = await getDoc(doc(db('customer'), `accounts/customer/bookings/${requestId}`));
      assert.equal(requested.data().payment_status, 'unpaid');
      const mirror = await getDoc(doc(db('merchant'), `stores/store1/reservation_requests/${requestId}`));
      assert.deepEqual(requested.data(), mirror.data());
      const groupsAdapter = await loadSource('groups', prefix);
      const groupId = await groupsAdapter.createGroup({ title: 'Our braai', store_id: 'store1', member_ids: ['stranger'], target_rands: '100.01', cancellation_cap_rands: '10', deadline_date: requestDate, deadline_time: '18:00' });
      await groupsAdapter.respondToGroup(groupId, 'approved');
      await groupsAdapter.respondToGroup(groupId, 'approved');
      activeUid = 'stranger';
      await groupsAdapter.respondToGroup(groupId, 'approved');
      const agreed = await groupsAdapter.loadGroup(groupId);
      assert.equal(policy.agreementSummary(agreed, agreed.agreements).unanimous, true);
      await groupsAdapter.respondToGroup(groupId, 'withdrawal_requested');
      const withdrawing = await groupsAdapter.loadGroup(groupId);
      assert.equal(policy.agreementSummary(withdrawing, withdrawing.agreements).unanimous, false);
      await assert.rejects(groupsAdapter.respondToGroup(groupId, 'approved'), /already recorded/);
      delete globalThis.adapterTestDependencies; delete globalThis.adapterTestFirebase;
    });
    await t.test('group agreements enforce membership, individual consent and immutable terms', async () => {
      const group = { owner_id: 'customer', title: 'Saturday braai', store_id: 'store1', member_ids: ['customer', 'stranger'], target_cents: 10001, cancellation_cap_cents: 1000, withdrawal_deadline: Date.now() + 86400000, policy_version: 1, created_at: serverTimestamp() };
      await assertSucceeds(setDoc(doc(db('customer'), 'booking_groups/group1'), group));
      await assertFails(setDoc(doc(db('customer'), 'booking_groups/bad-cap'), { ...group, cancellation_cap_cents: 5001 }));
      await assertFails(setDoc(doc(db('customer'), 'booking_groups/bad-member'), { ...group, member_ids: ['customer', 10] }));
      await assertFails(setDoc(doc(db('customer'), 'booking_groups/bad-count'), { ...group, member_ids: ['customer', 'customer'] }));
      await assertFails(setDoc(doc(db('customer'), 'booking_groups/bad-owner'), { ...group, owner_id: 'stranger' }));
      await assertFails(setDoc(doc(db('merchant'), 'booking_groups/provider'), { ...group, owner_id: 'merchant', member_ids: ['merchant', 'stranger'] }));
      await assertSucceeds(getDoc(doc(db('stranger'), 'booking_groups/group1')));
      await assertFails(getDoc(doc(db('merchant'), 'booking_groups/group1')));
      await assertFails(getDoc(doc(env.unauthenticatedContext().firestore(), 'booking_groups/group1')));
      await assertSucceeds(getDocs(query(collection(db('customer'), 'booking_groups'), where('member_ids', 'array-contains', 'customer'), limit(100))));
      await assertFails(getDocs(query(collection(db('customer'), 'booking_groups'), limit(100))));
      for (const patch of [{ target_cents: 100000 }, { cancellation_cap_cents: 5000 }, { member_ids: ['customer'] }, { store_id: 'merchant-store' }]) await assertFails(updateDoc(doc(db('customer'), 'booking_groups/group1'), patch));
      const agreement = { status: 'approved', share_cents: 5000, policy_version: 1, created_at: serverTimestamp(), updated_at: serverTimestamp() };
      await assertFails(setDoc(doc(db('customer'), 'booking_groups/group1/agreements/stranger'), agreement));
      await assertFails(setDoc(doc(db('stranger'), 'booking_groups/group1/agreements/stranger'), { ...agreement, share_cents: 1 }));
      await assertFails(setDoc(doc(db('stranger'), 'booking_groups/group1/agreements/stranger'), { ...agreement, paid: true }));
      await assertSucceeds(setDoc(doc(db('stranger'), 'booking_groups/group1/agreements/stranger'), agreement));
      await assertSucceeds(setDoc(doc(db('customer'), 'booking_groups/group1/agreements/customer'), { ...agreement, share_cents: 5001 }));
      await assertFails(updateDoc(doc(db('customer'), 'booking_groups/group1/agreements/stranger'), { status: 'withdrawal_requested', updated_at: serverTimestamp() }));
      await assertFails(updateDoc(doc(db('stranger'), 'booking_groups/group1/agreements/stranger'), { share_cents: 1000, updated_at: serverTimestamp() }));
      await assertSucceeds(updateDoc(doc(db('stranger'), 'booking_groups/group1/agreements/stranger'), { status: 'withdrawal_requested', updated_at: serverTimestamp() }));
      await assertFails(updateDoc(doc(db('stranger'), 'booking_groups/group1/agreements/stranger'), { status: 'approved', updated_at: serverTimestamp() }));
      await assertFails(deleteDoc(doc(db('stranger'), 'booking_groups/group1/agreements/stranger')));
      await env.withSecurityRulesDisabled(async (context) => {
        await setDoc(doc(context.firestore(), 'booking_groups/expired'), { ...group, withdrawal_deadline: 1000, created_at: Timestamp.fromMillis(1000) });
        await setDoc(doc(context.firestore(), 'group_wallets/group1'), { balance_cents: 10001 });
        await setDoc(doc(context.firestore(), 'group_wallets/group1/transactions/tx'), { amount_cents: 10001 });
      });
      await assertFails(setDoc(doc(db('stranger'), 'booking_groups/expired/agreements/stranger'), agreement));
      await assertSucceeds(getDoc(doc(db('customer'), 'group_wallets/group1')));
      await assertFails(getDoc(doc(db('merchant'), 'group_wallets/group1')));
      await assertFails(updateDoc(doc(db('customer'), 'group_wallets/group1'), { balance_cents: 0 }));
      await assertFails(setDoc(doc(db('customer'), 'group_wallets/group1/transactions/fake'), { amount_cents: 100000 }));
      await assertFails(setDoc(doc(db('customer'), 'wallets/customer/transactions/fake'), { amount: 100000 }));
      await assertFails(getDoc(doc(db('customer'), 'group_wallets/orphan')));
      await env.withSecurityRulesDisabled(async (context) => {
        await setDoc(doc(context.firestore(), 'booking_groups/missing-place'), { ...group, store_id: 'missing-store', created_at: Timestamp.fromMillis(1000) });
      });
      await assertFails(setDoc(doc(db('stranger'), 'booking_groups/missing-place/agreements/stranger'), agreement));
      await assertSucceeds(setDoc(doc(db('stranger'), 'booking_groups/missing-place/agreements/stranger'), { ...agreement, status: 'declined' }));
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
