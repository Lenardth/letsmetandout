import { collection, doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadString, getDownloadURL, deleteObject } from 'firebase/storage';
import { getFirebase } from './firebase';
import { getOwnProfile } from './firebaseData';
import { withDeadline } from './auth/request';

const maximumBytes = 5 * 1024 * 1024;
export function validatePhotoAsset(asset) {
  if (!asset?.base64 || !/^[A-Za-z0-9+/]+={0,2}$/.test(asset.base64) || asset.base64.length % 4 !== 0) throw new Error('This picture could not be read. Choose a JPEG or PNG photo.');
  const size = asset.base64.length * 3 / 4 - (asset.base64.endsWith('==') ? 2 : asset.base64.endsWith('=') ? 1 : 0);
  if (size > maximumBytes) throw new Error('Choose a photo smaller than 5 MB, or crop it before uploading.');
  if (size === 0) throw new Error('Choose a photo with image data.');
  // ImagePicker encodes native base64 photos as JPEG; inspect the actual bytes
  // rather than source MIME (which can describe the original HEIC file).
  const jpeg = asset.base64.startsWith('/9j/');
  const png = asset.base64.startsWith('iVBORw0KGgo');
  if (!jpeg && !png) throw new Error('Choose a JPEG or PNG photo.');
  return { contentType: jpeg ? 'image/jpeg' : 'image/png', extension: jpeg ? 'jpg' : 'png', size };
}
export function displayPhotoUrl(url) {
  if (!url) return null;
  if (process.env.EXPO_PUBLIC_FIREBASE_USE_EMULATORS !== 'true') return url;
  try {
    const parsed = new URL(url);
    if (parsed.hostname === 'firebasestorage.googleapis.com' && parsed.pathname.startsWith('/v0/b/demo-safemeet-login.appspot.com/o/')) {
      const host = process.env.EXPO_PUBLIC_FIREBASE_EMULATOR_HOST || '127.0.0.1';
      return `http://${host}:9199${parsed.pathname}${parsed.search}`;
    }
  } catch { return null; }
  return url;
}
export function canonicalPhotoUrl(url) {
  if (process.env.EXPO_PUBLIC_FIREBASE_USE_EMULATORS !== 'true') return url;
  const parsed = new URL(url);
  if (!parsed.pathname.startsWith('/v0/b/demo-safemeet-login.appspot.com/o/')) throw new Error('Unexpected demo photo location.');
  return `https://firebasestorage.googleapis.com${parsed.pathname}${parsed.search}`;
}
export async function uploadProfilePhoto(asset) {
  const { auth, db, storage } = getFirebase();
  const user = auth.currentUser;
  if (!user?.emailVerified) throw new Error('Sign in with a confirmed email before uploading a picture.');
  if (!storage) throw new Error('Photo storage is not configured yet. Contact SafeMeet support.');
  const { contentType, extension } = validatePhotoAsset(asset);
  const profileRef = doc(db, `profiles/${user.uid}`);
  const existingProfile = await withDeadline(getDoc(profileRef), 'Your profile could not be loaded. Try again.');
  if (!existingProfile.exists() || !existingProfile.data().profile_complete) throw new Error('Save your name and location before uploading a picture.');
  const id = doc(collection(db, 'profiles')).id;
  const reference = ref(storage, `profile-photos/${user.uid}/${id}.${extension}`);
  await withDeadline(uploadString(reference, asset.base64, 'base64', { contentType, cacheControl: 'public,max-age=3600' }), 'Photo upload could not be confirmed. Check your connection and try again.', 60000);
  const url = canonicalPhotoUrl(await withDeadline(getDownloadURL(reference), 'Your photo link could not be loaded. Try again.'));
  // Bind the upload to the same member even if authentication changes mid-request.
  if (auth.currentUser?.uid !== user.uid) throw new Error('Your session changed. Sign in again before saving your picture.');
  let saved = false;
  try {
    await withDeadline(updateDoc(profileRef, { profile_photo_url: url }), 'Your picture could not be confirmed on your profile. Refresh your profile before retrying.');
    saved = true;
    const profile = await withDeadline(getOwnProfile(user), 'Your profile picture was saved, but your profile could not be refreshed. Reopen your profile.');
    if (auth.currentUser?.uid !== user.uid) throw new Error('Your session changed. Sign in again to see your picture.');
    return profile;
  } catch (error) {
    // A timed-out Firestore write may still finish; do not delete its image.
    if (!saved && error.code !== 'auth/request-timeout') deleteObject(reference).catch(() => {});
    throw error;
  }
}
