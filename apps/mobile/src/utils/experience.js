import { useAuthStore } from './auth/store';

export function useExperience() {
  const auth = useAuthStore((state) => state.auth);
  const accountType = auth?.profile?.account_type;
  return { mode: ['customer', 'provider'].includes(accountType) ? accountType : null, ready: true };
}
