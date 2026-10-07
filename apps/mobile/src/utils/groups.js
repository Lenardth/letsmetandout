import { collection, doc, getDoc, getDocs, query, where, limit, setDoc, runTransaction, serverTimestamp } from 'firebase/firestore';
import { getFirebase } from './firebase';
import { groupPayload, contributionShare } from './groupPolicy';
import { withDeadline } from './auth/request';

function services() {
  const { auth, db } = getFirebase();
  if (!auth.currentUser?.emailVerified) throw new Error('Sign in with a confirmed email first.');
  return { db, uid: auth.currentUser.uid };
}
const rows = (snapshot) => snapshot.docs.map((item) => ({ ...item.data(), id: item.id }));
export async function myGroups() {
  const { db, uid } = services();
  return withDeadline(getDocs(query(collection(db, 'booking_groups'), where('member_ids', 'array-contains', uid), limit(100))).then(rows), 'Your groups could not be loaded. Check your connection and refresh.');
}
export async function createGroup(values, groupId) {
  const { db, uid } = services();
  const reference = groupId ? doc(db, `booking_groups/${groupId}`) : doc(collection(db, 'booking_groups'));
  await withDeadline(setDoc(reference, { ...groupPayload(values, uid), created_at: serverTimestamp() }), 'Group creation could not be confirmed. Refresh your groups before trying again.');
  return reference.id;
}
export function newGroupId() { return doc(collection(getFirebase().db, 'booking_groups')).id; }
export async function loadGroup(id) {
  const { db } = services();
  const group = await withDeadline(getDoc(doc(db, `booking_groups/${id}`)), 'Your group could not be loaded. Check your connection and refresh.');
  if (!group.exists()) throw new Error('This group is no longer available.');
  const agreements = await withDeadline(getDocs(query(collection(db, `booking_groups/${id}/agreements`), limit(20))), 'Member approvals could not be loaded. Refresh to try again.');
  const place = await withDeadline(getDoc(doc(db, `stores/${group.data().store_id}`)), 'The agreed place could not be loaded. Refresh before responding.');
  return { ...group.data(), id: group.id, agreements: rows(agreements), place: place.exists() ? { ...place.data(), id: place.id } : null };
}
export async function respondToGroup(id, status) {
  if (!['approved', 'declined', 'withdrawal_requested'].includes(status)) throw new Error('Choose a valid group response.');
  const { db, uid } = services();
  await withDeadline(runTransaction(db, async (transaction) => {
    const groupRef = doc(db, `booking_groups/${id}`);
    const ownRef = doc(db, `booking_groups/${id}/agreements/${uid}`);
    const group = await transaction.get(groupRef);
    const previous = await transaction.get(ownRef);
    if (!group.exists()) throw new Error('This group is no longer available.');
    const values = group.data();
    const share = contributionShare(values, uid);
    if (previous.exists()) {
      if (previous.data().status === status) return; // Safe retry after an uncertain acknowledgement.
      if (previous.data().status !== 'approved' || status !== 'withdrawal_requested') throw new Error('Your response is already recorded. New terms need a new group.');
      transaction.update(ownRef, { status, updated_at: serverTimestamp() });
    } else {
      if (status === 'approved') {
        const place = await transaction.get(doc(db, `stores/${values.store_id}`));
        if (!place.exists()) throw new Error('The agreed place is no longer available. Ask the organiser to create a new group.');
      }
      if (status === 'withdrawal_requested') throw new Error('Only an approved member can request withdrawal.');
      if (Date.now() > values.withdrawal_deadline) throw new Error('The agreement deadline has passed. Ask the organiser to create a new group.');
      transaction.set(ownRef, { status, share_cents: share, policy_version: values.policy_version, created_at: serverTimestamp(), updated_at: serverTimestamp() });
    }
  }), 'Your response could not be confirmed. Refresh the group before trying again.');
}
