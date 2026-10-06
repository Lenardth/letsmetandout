import { router } from 'expo-router';
import { useCallback, useEffect } from 'react';
import { onIdTokenChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendEmailVerification, sendPasswordResetEmail, signOut as firebaseSignOut } from 'firebase/auth';
import { useAuthStore } from './store';
import { authErrorMessage } from './errors';
import { withDeadline } from './request';
import { getFirebase } from '../firebase';
import { getOwnProfile, createAccountProfile } from '../firebaseData';

export const useAuth = () => {
  const { isReady, auth, setAuth } = useAuthStore();
  const initiate = useCallback(() => {
    let active = true;
    let revision = 0;
    let unsubscribe;
    const readinessTimer = setTimeout(() => {
      if (active) useAuthStore.setState({ isReady: true });
    }, 15000);
    try {
      unsubscribe = onIdTokenChanged(getFirebase().auth, async (user) => {
        clearTimeout(readinessTimer);
        const current = ++revision;
        try {
          if (!user || !user.emailVerified) { if (active) setAuth(null); return; }
          const [profile, token] = await withDeadline(Promise.all([getOwnProfile(user), user.getIdToken()]), 'Your profile could not be loaded. Check your connection and try signing in again.');
          if (active && current === revision) setAuth({ access_token: token, user: { id: user.uid }, profile });
        } catch {
          if (active && current === revision) setAuth(null);
        } finally {
          if (active && current === revision) useAuthStore.setState({ isReady: true });
        }
      });
    } catch { clearTimeout(readinessTimer); useAuthStore.setState({ isReady: true, auth: null }); }
    return () => { active = false; clearTimeout(readinessTimer); unsubscribe?.(); };
  }, [setAuth]);
  const login = useCallback(async (email, password) => {
    try {
      const { user } = await withDeadline(signInWithEmailAndPassword(getFirebase().auth, email, password), 'Sign in is taking too long. Check your connection and try again.', 30000);
      if (!user.emailVerified) {
        await withDeadline(firebaseSignOut(getFirebase().auth), 'Signing out took too long. Restart the app.', 5000);
        throw new Error('Confirm your email using the verification email, then sign in.');
      }
      const session = { access_token: await withDeadline(user.getIdToken(), 'Your session could not be confirmed. Try signing in again.'), user: { id: user.uid }, profile: await withDeadline(getOwnProfile(user), 'Your profile could not be loaded. Check your connection and try signing in again.') };
      setAuth(session);
      return { success: true, data: session };
    } catch (error) { return { success: false, error: authErrorMessage(error) }; }
  }, [setAuth]);
  const register = useCallback(async ({ email, password, ...profile }) => {
    const { auth: firebaseAuth } = getFirebase();
    let user;
    try { ({ user } = await withDeadline(createUserWithEmailAndPassword(firebaseAuth, email, password), 'Account creation could not be confirmed. Check your connection, then try signing in before creating another account.', 30000)); }
    catch (error) { throw new Error(authErrorMessage(error)); }
    try {
      // Start verification immediately; a stalled profile write must not prevent the email.
      const [verification, setup] = await Promise.allSettled([
        withDeadline(sendEmailVerification(user), 'The verification email could not be confirmed. Use Resend verification email on the sign-in screen.'),
        withDeadline(createAccountProfile(user, profile), 'Your profile could not be saved. Check your connection and try signing in again.'),
      ]);
      if (verification.status === 'rejected' || setup.status === 'rejected') {
        const detail = [verification, setup].filter((result) => result.status === 'rejected').map((result) => authErrorMessage(result.reason)).join(' ');
        throw new Error(`Your account was created, but setup could not finish. ${detail} Confirm your email, then sign in to complete your profile. Use Resend verification email if needed.`);
      }
    } finally {
      setAuth(null);
      await withDeadline(firebaseSignOut(firebaseAuth), 'Restart the app before signing in.', 5000);
    }
    return { needsConfirmation: true };
  }, [setAuth]);
  const resendVerification = useCallback(async (email, password) => {
    const { auth: firebaseAuth } = getFirebase();
    const { user } = await withDeadline(signInWithEmailAndPassword(firebaseAuth, email, password), 'Sign in is taking too long. Check your connection and try again.', 30000);
    try {
      if (!user.emailVerified) await withDeadline(sendEmailVerification(user), 'The verification email could not be confirmed. Check your connection and try again.');
    } finally { setAuth(null); await withDeadline(firebaseSignOut(firebaseAuth), 'Restart the app before signing in.', 5000); }
  }, [setAuth]);
  const resetPassword = useCallback((email) => withDeadline(sendPasswordResetEmail(getFirebase().auth, email), 'Password reset is taking too long. Check your connection and try again.'), []);
  const signOut = useCallback(async () => {
    try { await withDeadline(firebaseSignOut(getFirebase().auth), 'Signing out took too long. Restart the app.', 5000); } finally { setAuth(null); }
  }, [setAuth]);
  const signIn = useCallback(() => router.push('/login'), []);
  const signUp = useCallback(() => router.push('/signup'), []);
  return { isReady, auth, setAuth, initiate, login, register, signOut, signIn, signUp, resendVerification, resetPassword, isAuthenticated: isReady ? !!auth : null };
};
export const useRequireAuth = (options) => {
  const { isAuthenticated, isReady } = useAuth();
  useEffect(() => {
    if (!isAuthenticated && isReady) router.replace(options?.mode === 'signin' ? '/login' : '/signup');
  }, [isAuthenticated, isReady, options?.mode]);
};
export default useAuth;
