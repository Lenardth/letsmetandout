import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useCallback, useEffect } from 'react';
import { useAuthModal, useAuthStore, authKey } from './store';
import apiClient from '../api';


/**
 * This hook provides authentication functionality.
 * It may be easier to use the `useAuthModal` or `useRequireAuth` hooks
 * instead as those will also handle showing authentication to the user
 * directly.
 */
export const useAuth = () => {
  const { isReady, auth, setAuth } = useAuthStore();
  const { close } = useAuthModal();

  const initiate = useCallback(() => {
    (async () => {
      try {
        const saved = await SecureStore.getItemAsync(authKey);
        const session = saved ? JSON.parse(saved) : null;
        if (!session?.access_token) return;
        useAuthStore.setState({ auth: session });
        const { data: profile } = await apiClient.get('/auth/me');
        useAuthStore.setState({ auth: { ...session, profile } });
      } catch {
        useAuthStore.getState().setAuth(null);
      } finally {
        useAuthStore.setState({ isReady: true });
      }
    })();
  }, []);

  const signIn = useCallback(() => {
    router.push('/login');
  }, []);
  const signUp = useCallback(() => {
    router.push('/signup');
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      const { data } = await apiClient.post('/auth/login', { email, password });
      const response = await apiClient.get('/auth/me', { headers: { Authorization: `Bearer ${data.access_token}` } });
      const session = { ...data, profile: response.data };
      setAuth(session);
      return { success: true, data: session };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || error.message || 'Network error',
      };
    }
  }, [setAuth]);

  const signOut = useCallback(() => {
    setAuth(null);
    close();
  }, [close, setAuth]);

  return {
    isReady,
    isAuthenticated: isReady ? !!auth : null,
    signIn,
    signOut,
    signUp,
    login, // Add the new login function here
    auth,
    setAuth,
    initiate,
  };
};

/**
 * This hook will automatically open the authentication modal if the user is not authenticated.
 */
export const useRequireAuth = (options) => {
  const { isAuthenticated, isReady } = useAuth();
  useEffect(() => {
    if (!isAuthenticated && isReady) {
      router.replace(options?.mode === 'signin' ? '/login' : '/signup');
    }
  }, [isAuthenticated, options?.mode, isReady]);
};

export default useAuth;
