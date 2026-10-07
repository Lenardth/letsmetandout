import { doc, collection, getDoc, getDocs, writeBatch, setDoc, query, where, orderBy, limit, serverTimestamp } from 'firebase/firestore';
import { getFirebase } from './firebase';
import { hasCompleteProfile } from './auth/profile';

const collections = { '/groups': 'groups', '/plans': 'meetup_plans', '/bookings': 'bookings', '/stores': 'stores' };
function currentUser() {
  const services = getFirebase();
  if (!services.auth.currentUser) throw new Error('Please sign in to use SafeMeet.');
  return { ...services, user: services.auth.currentUser };
}
function rows(snapshot) {
  return snapshot.docs.map((item) => {
    const values = item.data();
    const created = values.created_at;
    return { ...values, id: item.id, created_at: created?.toDate ? created.toDate().toISOString() : typeof created === 'number' ? new Date(created).toISOString() : created };
  });
}
export async function getOwnProfile(user) {
  const { db } = getFirebase();
  const [snapshot, details, role] = await Promise.all([getDoc(doc(db, `profiles/${user.uid}`)), getDoc(doc(db, `account_details/${user.uid}`)), getDoc(doc(db, `account_roles/${user.uid}`))]);
  if (!snapshot.exists()) return role.exists() ? { account_type: role.data().account_type, id: user.uid } : null;
  return { ...snapshot.data(), interests: snapshot.data().interests || [], id: user.uid, account_type: role.data()?.account_type || null, phone: details.data()?.phone, email: user.email, email_verified: user.emailVerified, verification_level: user.emailVerified ? 'Email confirmed' : 'Unverified', status: 'Active account' };
}
function editableProfile(values) {
  return Object.fromEntries(Object.entries(values).filter(([key]) => ['first_name', 'last_name', 'city', 'province', 'bio', 'interests', 'profile_photo_url'].includes(key)));
}
export async function createAccountProfile(user, values) {
  if (!['customer', 'provider'].includes(values.account_type)) throw new Error('Choose Customer or Service provider.');
  const { db } = getFirebase();
  const profile = { first_name: '', last_name: '', city: '', province: '', bio: '', interests: [], profile_photo_url: null, ...editableProfile(values) };
  const batch = writeBatch(db);
  batch.set(doc(db, `profiles/${user.uid}`), { ...profile, profile_complete: hasCompleteProfile(profile), created_at: serverTimestamp() });
  batch.set(doc(db, `account_details/${user.uid}`), { phone: values.phone || '', terms_accepted: !!values.terms_accepted, privacy_accepted: !!values.privacy_accepted, safety_guidelines_accepted: !!values.safety_guidelines_accepted });
  batch.set(doc(db, `account_roles/${user.uid}`), { account_type: values.account_type });
  await batch.commit();
}
export async function registerAccountType(accountType) {
  if (!['customer', 'provider'].includes(accountType)) throw new Error('Choose Customer or Service provider.');
  const { db, user } = currentUser();
  const reference = doc(db, `account_roles/${user.uid}`);
  const existing = await getDoc(reference);
  if (existing.exists()) throw new Error('Your account type is already registered.');
  await setDoc(reference, { account_type: accountType });
  return getOwnProfile(user);
}
export async function updateOwnProfile(values) {
  const { db, user } = currentUser();
  const reference = doc(db, `profiles/${user.uid}`);
  const existing = await getDoc(reference);
  const profile = { first_name: '', last_name: '', city: '', province: '', bio: '', interests: [], profile_photo_url: null, ...(existing.data() || {}), ...editableProfile(values) };
  const data = { ...editableProfile(profile), profile_complete: hasCompleteProfile(profile), created_at: profile.created_at || serverTimestamp() };
  await setDoc(reference, data);
  return getOwnProfile(user);
}
export async function loadFirebaseResource(path, params = {}) {
  const { db, user } = currentUser();
  if (path === '/auth/me') return getOwnProfile(user);
  if (!user.emailVerified) throw new Error('Confirm your email before using SafeMeet.');
  const count = Math.min(100, Math.max(1, Number(params.limit) || 50));
  if (path === '/discover/users') {
    const snapshot = await getDocs(query(collection(db, 'profiles'), where('profile_complete', '==', true), limit(count + 1)));
    return rows(snapshot).filter((item) => item.id !== user.uid).slice(0, count).map((profile) => ({ id: profile.id, name: `${profile.first_name} ${profile.last_name}`.trim(), bio: profile.bio, location: [profile.city, profile.province].filter(Boolean).join(', '), interests: profile.interests || [], image: profile.profile_photo_url, createdAt: profile.created_at }));
  }
  if (path === '/wallet/summary') {
    const [transactions, wallet] = await Promise.all([
      getDocs(query(collection(db, `wallets/${user.uid}/transactions`), orderBy('created_at', 'desc'), limit(20))),
      getDoc(doc(db, `wallets/${user.uid}`)),
    ]);
    if (!wallet.exists()) {
      if (transactions.docs.length) throw new Error('Wallet records are incomplete. Contact SafeMeet support.');
      return { balance: null, transactions: [], available: false };
    }
    const balance = wallet.data().balance;
    if (typeof balance !== 'number' || !Number.isFinite(balance) || balance < 0 || !Number.isSafeInteger(Math.round(balance * 100)) || Math.abs(balance * 100 - Math.round(balance * 100)) > 0.000001) throw new Error('Your wallet balance could not be verified. Contact SafeMeet support.');
    const records = rows(transactions);
    if (records.some((record) => typeof record.amount !== 'number' || !Number.isFinite(record.amount) || !Number.isSafeInteger(Math.round(record.amount * 100)) || Math.abs(record.amount * 100 - Math.round(record.amount * 100)) > 0.000001)) throw new Error('Wallet transactions could not be verified. Contact SafeMeet support.');
    return { balance, transactions: records, available: true };
  }
  const name = collections[path];
  if (!name) throw new Error('This resource is not configured in Firebase.');
  const location = path === '/bookings' ? `accounts/${user.uid}/bookings` : name;
  return rows(await getDocs(query(collection(db, location), orderBy('created_at', 'desc'), limit(count))));
}
