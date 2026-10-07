import { useState } from 'react';
import { registerAccountType } from '../utils/firebaseData';
import { withDeadline } from '../utils/auth/request';
import { Redirect, useRouter } from 'expo-router';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../utils/theme';
import { useExperience } from '../utils/experience';
import { useAuth } from '../utils/auth/useAuth';

export default function ChooseExperience() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { mode } = useExperience();
  const { auth, setAuth, signOut } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  if (mode) return <Redirect href="/" />;
  async function select(type) {
    if (busy) return;
    setBusy(true); setError('');
    try {
      const profile = await withDeadline(registerAccountType(type), 'Account type could not be confirmed. Sign in again before retrying.');
      setAuth({ ...auth, profile });
      router.replace('/');
    } catch (failure) { setError(failure.message); }
    finally { setBusy(false); }
  }
  return <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ padding: 24, paddingTop: insets.top + 40, paddingBottom: insets.bottom + 24, gap: 20 }}>
    <Text style={{ color: colors.text, fontSize: 28, fontWeight: '700' }}>Complete your registration</Text>
    <Text style={{ color: colors.textSecondary }}>Register as a Customer or Service provider. This choice is fixed for your account.</Text>
    {[
      ['customer', 'Customer', 'Find places, meet people, browse groups and plans, and request bookings.'],
      ['provider', 'Service provider', 'For shop owners, venue operators and hosts. Manage your listings and respond to customer requests.'],
    ].map(([mode, title, description]) => <TouchableOpacity key={mode} accessibilityRole="button" disabled={busy} onPress={() => select(mode)} style={{ padding: 24, borderRadius: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, gap: 12 }}>
      <Text style={{ color: colors.primary, fontSize: 22, fontWeight: '700' }}>{title}</Text>
      <Text style={{ color: colors.textSecondary, fontSize: 16 }}>{description}</Text>
    </TouchableOpacity>)}
    {busy && <ActivityIndicator color={colors.primary} />}
    {!!error && <Text accessibilityRole="alert" style={{ color: colors.error }}>{error}</Text>}
    <TouchableOpacity accessibilityRole="button" disabled={busy} onPress={signOut}><Text style={{ color: colors.error }}>Sign out</Text></TouchableOpacity>
  </ScrollView>;
}
