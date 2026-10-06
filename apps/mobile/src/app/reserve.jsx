import { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BusinessField from '../components/BusinessField';
import { useTheme } from '../utils/theme';
import { requestTable } from '../utils/business';
export default function Reserve() {
  const { storeId } = useLocalSearchParams(); const router = useRouter(); const insets = useSafeAreaInsets(); const { colors } = useTheme();
  const [form, setForm] = useState({ date: '', time: '', guests: '2' }); const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  async function submit() { if (busy) return; setBusy(true); setError(''); try { await requestTable(String(storeId), form); router.replace('/(tabs)/bookings'); } catch (failure) { setError(failure.message); } finally { setBusy(false); } }
  return <ScrollView keyboardShouldPersistTaps="handled" style={{ backgroundColor: colors.background }} contentContainerStyle={{ padding: 24, paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24, gap: 18 }}>
    <Text style={{ fontSize: 28, fontWeight: '700', color: colors.text }}>Request a table</Text><Text style={{ color: colors.textSecondary }}>All times are South African time. Your request is subject to restaurant acceptance. No payment is collected at this step.</Text>
    {Object.entries({ date: 'Date (YYYY-MM-DD)', time: 'Time (HH:MM)', guests: 'Number of guests' }).map(([key, label]) => <BusinessField key={key} label={label} value={form[key]} numeric={key === 'guests'} onChangeText={(value) => setForm({ ...form, [key]: value })} />)}
    {!!error && <Text accessibilityRole="alert" style={{ color: colors.error }}>{error}</Text>}
    <TouchableOpacity disabled={busy} onPress={submit} style={{ padding: 16, backgroundColor: colors.primary, borderRadius: 12, alignItems: 'center' }}>{busy ? <ActivityIndicator color="#FFFFFF" /> : <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>Send table request</Text>}</TouchableOpacity>
    <TouchableOpacity onPress={() => router.back()}><Text style={{ color: colors.primary }}>Back</Text></TouchableOpacity>
  </ScrollView>;
}
