import { doc, collection, getDoc, getDocs, setDoc, writeBatch, runTransaction, serverTimestamp, query, where, orderBy, limit } from 'firebase/firestore';
import { getFirebase } from './firebase';
import { listingPayload, reservationPayload } from './businessValidation';
import { withDeadline } from './auth/request';
function services() {
  const { auth, db } = getFirebase();
  if (!auth.currentUser?.emailVerified) throw new Error('Sign in with a confirmed email first.');
  return { db, uid: auth.currentUser.uid };
}
export async function createBusiness(values) {
  const { db, uid } = services();
  const reference = doc(collection(db, 'stores'));
  await withDeadline(setDoc(reference, { ...listingPayload(values, uid), created_at: serverTimestamp() }), 'Your listing could not be confirmed. Refresh your listings before trying again.');
  return reference.id;
}
export function newBookingId() {
  const { db, uid } = services();
  return doc(collection(db, `accounts/${uid}/bookings`)).id;
}
export async function requestTable(storeId, values, bookingId = newBookingId()) {
  if (!/^[A-Za-z0-9_-]{1,128}$/.test(storeId) || !/^[A-Za-z0-9_-]{1,128}$/.test(bookingId)) throw new Error('Invalid booking link. Choose a place again.');
  const { db, uid } = services();
  const reference = doc(db, `accounts/${uid}/bookings/${bookingId}`);
  await withDeadline(runTransaction(db, async (transaction) => {
    const existing = await transaction.get(reference);
    if (existing.exists()) {
      if (existing.data().store_id !== storeId) throw new Error('This request already belongs to another place. Check your bookings.');
      return; // Retrying an uncertain request must not create another booking.
    }
    const snapshot = await transaction.get(doc(db, `stores/${storeId}`));
    if (!snapshot.exists()) throw new Error('This business is no longer available.');
    const store = { ...snapshot.data(), id: storeId };
    const record = { ...reservationPayload(store, values, uid), booking_owner_id: store.owner_id, created_at: serverTimestamp() };
    transaction.set(reference, record);
    transaction.set(doc(db, `stores/${storeId}/reservation_requests/${bookingId}`), record);
  }), 'Your table request could not be confirmed. Check your bookings before retrying.');
  return bookingId;
}
export async function ownBusinesses() {
  const { db, uid } = services();
  const snapshot = await withDeadline(getDocs(query(collection(db, 'stores'), where('owner_id', '==', uid), limit(100))), 'Your listings could not be loaded. Refresh to try again.');
  return snapshot.docs.map((item) => ({ ...item.data(), id: item.id }));
}
export async function businessRequests(storeId) {
  const { db } = services();
  const snapshot = await withDeadline(getDocs(query(collection(db, `stores/${storeId}/reservation_requests`), orderBy('created_at', 'desc'), limit(100))), 'Reservation requests could not be loaded. Refresh to try again.');
  return snapshot.docs.map((item) => ({ ...item.data(), id: item.id }));
}
export async function answerReservation(record, status) {
  const { db } = services();
  if (!['accepted', 'declined'].includes(status)) throw new Error('Invalid reservation response.');
  const batch = writeBatch(db);
  batch.update(doc(db, `accounts/${record.user_id}/bookings/${record.id}`), { status });
  batch.update(doc(db, `stores/${record.store_id}/reservation_requests/${record.id}`), { status });
  await withDeadline(batch.commit(), 'Your response could not be confirmed. Refresh the requests before trying again.');
}
