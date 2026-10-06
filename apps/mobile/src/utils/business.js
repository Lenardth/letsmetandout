import { doc, collection, getDoc, getDocs, setDoc, writeBatch, serverTimestamp, query, where, orderBy, limit } from 'firebase/firestore';
import { getFirebase } from './firebase';
import { listingPayload, reservationPayload } from './businessValidation';
function services() {
  const { auth, db } = getFirebase();
  if (!auth.currentUser?.emailVerified) throw new Error('Sign in with a confirmed email first.');
  return { db, uid: auth.currentUser.uid };
}
export async function createBusiness(values) {
  const { db, uid } = services();
  const reference = doc(collection(db, 'stores'));
  await setDoc(reference, { ...listingPayload(values, uid), created_at: serverTimestamp() });
  return reference.id;
}
export async function requestTable(storeId, values) {
  const { db, uid } = services();
  const snapshot = await getDoc(doc(db, `stores/${storeId}`));
  if (!snapshot.exists()) throw new Error('This business is no longer available.');
  const store = { ...snapshot.data(), id: storeId };
  const reference = doc(collection(db, `accounts/${uid}/bookings`));
  const record = { ...reservationPayload(store, values, uid), booking_owner_id: store.owner_id, created_at: serverTimestamp() };
  const batch = writeBatch(db);
  batch.set(reference, record);
  batch.set(doc(db, `stores/${storeId}/reservation_requests/${reference.id}`), record);
  await batch.commit();
  return reference.id;
}
export async function ownBusinesses() {
  const { db, uid } = services();
  const snapshot = await getDocs(query(collection(db, 'stores'), where('owner_id', '==', uid), limit(100)));
  return snapshot.docs.map((item) => ({ ...item.data(), id: item.id }));
}
export async function businessRequests(storeId) {
  const { db } = services();
  const snapshot = await getDocs(query(collection(db, `stores/${storeId}/reservation_requests`), orderBy('created_at', 'desc'), limit(100)));
  return snapshot.docs.map((item) => ({ ...item.data(), id: item.id }));
}
export async function answerReservation(record, status) {
  const { db } = services();
  if (!['accepted', 'declined'].includes(status)) throw new Error('Invalid reservation response.');
  const batch = writeBatch(db);
  batch.update(doc(db, `accounts/${record.user_id}/bookings/${record.id}`), { status });
  batch.update(doc(db, `stores/${record.store_id}/reservation_requests/${record.id}`), { status });
  await batch.commit();
}
