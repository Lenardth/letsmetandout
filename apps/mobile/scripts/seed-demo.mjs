import assert from 'node:assert/strict';
import { initializeApp, deleteApp } from 'firebase/app';
import { getAuth, connectAuthEmulator, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification, applyActionCode, reload, signOut } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator, doc, getDoc, writeBatch, setDoc, deleteDoc, serverTimestamp, terminate } from 'firebase/firestore';

// Deliberately fixed to loopback and a demo project. No live credentials or fallback.
const projectId = 'demo-safemeet-login';
const authUrl = 'http://127.0.0.1:9099';
const password = 'SafeMeetDemo!2026';
const accounts = [
  { email: 'customer@demo.safemeet.test', first_name: 'Thandi', last_name: 'Demo', type: 'customer', phone: '+27820000001' },
  { email: 'friend@demo.safemeet.test', first_name: 'Sipho', last_name: 'Demo', type: 'customer', phone: '+27820000002' },
  { email: 'provider@demo.safemeet.test', first_name: 'Naledi', last_name: 'Demo', type: 'provider', phone: '+27820000003' },
];
const demoStores = [
  {
    id: 'marble-johannesburg',
    name: 'Marble Restaurant',
    category: 'Restaurant',
    city: 'Johannesburg',
    address: 'Keyes Art Mile, 19 Keyes Avenue, Rosebank',
    phone: '+27 10 596 5960',
    image: 'https://images.pexels.com/photos/262978/pexels-photo-262978.jpeg?auto=compress&cs=tinysrgb&w=1200',
    description: 'Live-fire dining and seasonal South African ingredients in the heart of Rosebank.',
    deposit_cents: 25000,
    max_party_size: 12,
  },
  {
    id: 'pot-luck-club-cape-town',
    name: 'The Pot Luck Club',
    category: 'Restaurant',
    city: 'Cape Town',
    address: 'The Old Biscuit Mill, 373-375 Albert Road, Woodstock',
    phone: '+27 21 447 0804',
    image: 'https://images.pexels.com/photos/262047/pexels-photo-262047.jpeg?auto=compress&cs=tinysrgb&w=1200',
    description: 'Small plates, skyline views and creative South African flavours at the Old Biscuit Mill.',
    deposit_cents: 20000,
    max_party_size: 10,
  },
  {
    id: 'truth-coffee-cape-town',
    name: 'Truth Coffee Roasting',
    category: 'Café',
    city: 'Cape Town',
    address: '36 Buitenkant Street, Cape Town City Centre',
    phone: '+27 21 201 7000',
    image: 'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=1200',
    description: 'A steampunk-inspired roastery serving specialty coffee, brunch and fresh bakes.',
    deposit_cents: 0,
    max_party_size: 8,
  },
  {
    id: 'moyo-zoo-lake-johannesburg',
    name: 'Moyo Zoo Lake',
    category: 'Restaurant',
    city: 'Johannesburg',
    address: 'Zoo Lake, 1 Prince of Wales Drive, Parkview',
    phone: '+27 11 442 8520',
    image: 'https://images.pexels.com/photos/262978/pexels-photo-262978.jpeg?auto=compress&cs=tinysrgb&w=1200',
    description: 'Relaxed African dining beside Zoo Lake with generous tables for groups and celebrations.',
    deposit_cents: 15000,
    max_party_size: 16,
  },
  {
    id: 'the-living-room-johannesburg',
    name: 'The Living Room',
    category: 'Venue',
    city: 'Johannesburg',
    address: '20 Kruger Street, City and Suburban',
    phone: '+27 11 615 4250',
    image: 'https://images.pexels.com/photos/260922/pexels-photo-260922.jpeg?auto=compress&cs=tinysrgb&w=1200',
    description: 'A rooftop urban garden and event space with views across inner-city Johannesburg.',
    deposit_cents: 18000,
    max_party_size: 20,
  },
];
const app = initializeApp({ projectId, apiKey: 'demo-api-key', appId: 'demo-safemeet-login', authDomain: `${projectId}.firebaseapp.com` }, 'demo-seed');
const auth = getAuth(app);
connectAuthEmulator(auth, authUrl, { disableWarnings: true });
const db = getFirestore(app);
connectFirestoreEmulator(db, '127.0.0.1', 8080);

try {
  // Refuse to run unless this exact demo Auth emulator is reachable.
  const health = await fetch(`${authUrl}/emulator/v1/projects/${projectId}/oobCodes`, { signal: AbortSignal.timeout(5000) });
  if (!health.ok) throw new Error('Start npm run demo:emulators before creating demo accounts.');
  for (const account of accounts) {
    let credential;
    try { credential = await createUserWithEmailAndPassword(auth, account.email, password); }
    catch (error) {
      if (error.code !== 'auth/email-already-in-use') throw error;
      credential = await signInWithEmailAndPassword(auth, account.email, password);
    }
    const { user } = credential;
    if (!user.emailVerified) {
      await sendEmailVerification(user);
      const response = await fetch(`${authUrl}/emulator/v1/projects/${projectId}/oobCodes`, { signal: AbortSignal.timeout(5000) });
      if (!response.ok) throw new Error('Could not read the local verification email.');
      const { oobCodes = [] } = await response.json();
      const verification = oobCodes.filter((code) => code.email === account.email && code.requestType === 'VERIFY_EMAIL').at(-1);
      if (!verification) throw new Error('The local verification email was not found.');
      await applyActionCode(auth, verification.oobCode);
      await reload(user);
      await user.getIdToken(true);
    }
    assert.equal(user.emailVerified, true);
    const profileRef = doc(db, `profiles/${user.uid}`);
    const roleRef = doc(db, `account_roles/${user.uid}`);
    const [profile, role] = await Promise.all([getDoc(profileRef), getDoc(roleRef)]);
    if (role.exists() && role.data().account_type !== account.type) throw new Error('Existing demo account has a different role. Reset the demo emulator to rebuild it.');
    const batch = writeBatch(db);
    if (!role.exists()) batch.set(roleRef, { account_type: account.type });
    batch.set(profileRef, { first_name: account.first_name, last_name: account.last_name, city: 'Johannesburg', province: 'Gauteng', bio: 'SafeMeet local demo account.', interests: ['Food', 'Coffee'], profile_photo_url: null, profile_complete: true, created_at: profile.data()?.created_at || serverTimestamp() });
    batch.set(doc(db, `account_details/${user.uid}`), { phone: account.phone, terms_accepted: true, privacy_accepted: true, safety_guidelines_accepted: true });
    await batch.commit();
    if (account.type === 'provider') {
      await deleteDoc(doc(db, 'stores/demo-braai-venue'));
      for (const store of demoStores) {
        const reference = doc(db, `stores/${store.id}`);
        const existing = await getDoc(reference);
        await setDoc(reference, {
          ...store,
          owner_id: user.uid,
          location: store.city,
          created_at: existing.data()?.created_at || serverTimestamp(),
        });
      }
    }
    await signOut(auth);
    const signedIn = await signInWithEmailAndPassword(auth, account.email, password);
    const savedRole = await getDoc(doc(db, `account_roles/${signedIn.user.uid}`));
    const savedProfile = await getDoc(doc(db, `profiles/${signedIn.user.uid}`));
    assert.equal(savedRole.data().account_type, account.type);
    assert.equal(savedProfile.data().profile_complete, true);
    assert.equal(signedIn.user.emailVerified, true);
    console.log(`${account.type}: ${account.email} | ${password} | member ID: ${signedIn.user.uid}`);
    await signOut(auth);
  }
  console.log('All three demo logins verified. These accounts exist only in the local emulator.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  await terminate(db);
  await deleteApp(app);
}
