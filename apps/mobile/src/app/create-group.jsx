import { useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../utils/theme';
import { useAuth } from '../utils/auth/useAuth';
import { useApiResource } from '../utils/useApiResource';
import { createGroup, newGroupId } from '../utils/groups';
import BusinessField from '../components/BusinessField';
import { ErrorState, LoadingState } from '../components/DataState';

export default function CreateGroup() {
  const { colors } = useTheme(); const insets = useSafeAreaInsets(); const router = useRouter(); const { auth } = useAuth();
  const params = useLocalSearchParams();
  const places = useApiResource('/stores', { initialData: [] });
  const [form, setForm] = useState({ title: '', store_id: typeof params.storeId === 'string' ? params.storeId : '', target_rands: '', cancellation_cap_rands: '0', deadline_date: '', deadline_time: '', member_ids: [] });
  const [busy, setBusy] = useState(false); const [error, setError] = useState(''); const [groupId, setGroupId] = useState(null);
  const change = (key, value) => setForm((previous) => ({ ...previous, [key]: value }));
  async function submit() {
    if (busy) return; setBusy(true); setError('');
    try { const id = groupId || newGroupId(); setGroupId(id); await createGroup(form, id); router.replace({ pathname: '/group', params: { groupId: id } }); }
    catch (failure) { setError(failure.message); } finally { setBusy(false); }
  }
  return <ScrollView keyboardShouldPersistTaps="handled" style={{ backgroundColor: colors.background }} contentContainerStyle={{ padding: 24, paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24, gap: 16 }}>
    <Text style={{ color: colors.text, fontSize: 28, fontWeight: '700' }}>Bring your people together</Text>
    <Text style={{ color: colors.textSecondary }}>Plan one get-together and an equal split. Any rounding cents go to the organiser. Terms are fixed once created; each person decides for themselves.</Text>
    <BusinessField label="Group name (for example, Saturday braai)" value={form.title} onChangeText={(value) => change('title', value)} />
    <Text style={{ color: colors.text, fontWeight: '700' }}>Choose your place</Text>
    {places.loading && <LoadingState />}{places.error && <ErrorState message={places.error} onRetry={places.refetch} />}
    {!places.loading && !places.error && (places.data || []).length === 0 && <Text style={{ color: colors.textSecondary }}>No places are available yet. A provider must publish a listing first.</Text>}
    {(places.data || []).map((place) => <TouchableOpacity disabled={busy} key={place.id} accessibilityRole="radio" accessibilityState={{ checked: form.store_id === place.id }} onPress={() => change('store_id', place.id)} style={{ padding: 14, borderRadius: 12, borderWidth: 1, borderColor: form.store_id === place.id ? colors.primary : colors.border }}><Text style={{ color: colors.text }}>{place.name} · {place.location}</Text></TouchableOpacity>)}
    <BusinessField label="Friends' member IDs (separate with commas)" value={form.member_ids.join(', ')} onChangeText={(value) => change('member_ids', value.split(',').map((id) => id.trim()))} />
    <Text selectable style={{ color: colors.textSecondary }}>Your member ID: {auth.user.id}. Friends can find theirs in Profile. Invite between 1 and 19 customers.</Text>
    {Object.entries({ target_rands: 'Total group budget (rand)', cancellation_cap_rands: 'Maximum withdrawal charge per person (rand)', deadline_date: 'Free withdrawal deadline date (YYYY-MM-DD)', deadline_time: 'Deadline time (HH:MM, South African time)' }).map(([key, label]) => <BusinessField key={key} label={label} numeric={key.includes('rands')} value={form[key]} onChangeText={(value) => change(key, value)} />)}
    <Text style={{ color: colors.textSecondary }}>After the deadline, any future charge must be limited to the agreed cap and actual unrecoverable booking costs. Payment collection and charges are not active yet.</Text>
    {!!error && <Text accessibilityRole="alert" style={{ color: colors.error }}>{error}</Text>}
    <TouchableOpacity disabled={busy || places.loading || !!places.error} accessibilityRole="button" onPress={submit} style={{ backgroundColor: colors.primary, padding: 16, borderRadius: 12 }}>{busy ? <ActivityIndicator color="#FFFFFF" /> : <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>Create contribution agreement</Text>}</TouchableOpacity>
    <TouchableOpacity accessibilityRole="button" onPress={() => router.back()}><Text style={{ color: colors.primary }}>Back</Text></TouchableOpacity>
  </ScrollView>;
}
