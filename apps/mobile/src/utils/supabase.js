import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, processLock } from '@supabase/supabase-js';

let client;

export function getSupabase() {
  if (client) return client;

  const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const key = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    throw new Error('Set the Supabase project URL and publishable key in mobile/.env, then restart Expo.');
  }
  if (!key.startsWith('sb_publishable_')) {
    throw new Error('Use the Supabase publishable key starting with sb_publishable_ for the mobile app.');
  }

  client = createClient(url, key, {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
      lock: processLock,
    },
  });
  return client;
}
