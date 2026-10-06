export function authErrorMessage(error) {
  const code = error?.code || '';
  if (code === 'auth/configuration-not-found' || code === 'auth/operation-not-allowed' || /CONFIGURATION_NOT_FOUND/.test(error?.message || '')) return 'Account registration is not enabled yet. Please contact SafeMeet support.';
  if (code === 'permission-denied' || code === 'firestore/permission-denied') return 'Your profile could not be accessed. SafeMeet database permissions need to be configured.';
  if (code === 'unavailable' || code === 'firestore/unavailable') return 'The profile service could not be reached. Check your internet connection and try again.';
  if (code === 'not-found' || code === 'firestore/not-found') return 'The profile database is not available yet. Please contact SafeMeet support.';
  if (code === 'auth/email-already-in-use') return 'An account already uses this email. Sign in or reset your password.';
  if (code === 'auth/invalid-credential') return 'Check your email and password and try again.';
  if (code === 'auth/too-many-requests') return 'Too many attempts. Please wait before trying again.';
  if (code === 'auth/network-request-failed') return 'Check your internet connection and try again.';
  return error?.message || 'Please try again.';
}
