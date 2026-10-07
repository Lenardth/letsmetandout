import { useCallback, useState } from 'react';
import { ActivityIndicator, ScrollView, Switch, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../utils/theme';
import { useAuth } from '../utils/auth/useAuth';
import { loadGroup, respondToGroup } from '../utils/groups';
import { contributionShare, agreementSummary } from '../utils/groupPolicy';
import { ErrorState, LoadingState } from '../components/DataState';

const money = (cents) => `R${(cents / 100).toFixed(2)}`;
export default function Group() {
  const { colors } = useTheme(); const insets = useSafeAreaInsets(); const router = useRouter(); const { auth } = useAuth();
  const { groupId } = useLocalSearchParams(); const id = typeof groupId === 'string' ? groupId : '';
  const [group, setGroup] = useState(null); const [loading, setLoading] = useState(true); const [error, setError] = useState(''); const [busy, setBusy] = useState(false); const [accepted, setAccepted] = useState(false);
  const refresh = useCallback(async () => { setLoading(true); setError(''); try { if (!/^[A-Za-z0-9_-]{1,128}$/.test(id)) throw new Error('Invalid group link.'); setGroup(await loadGroup(id)); } catch (failure) { setError(failure.message); } finally { setLoading(false); } }, [id]);
  useFocusEffect(useCallback(() => { refresh(); }, [refresh]));
  async function respond(status) { if (busy || (status === 'approved' && !accepted)) return; setBusy(true); setError(''); try { await respondToGroup(id, status); await refresh(); } catch (failure) { setError(failure.message); } finally { setBusy(false); } }
  const summary = group ? agreementSummary(group, group.agreements) : null;
  const own = group?.agreements.find((item) => item.id === auth.user.id);
  return <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={{ padding: 24, paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24, gap: 18 }}>
    <Text style={{ color: colors.text, fontSize: 28, fontWeight: '700' }}>{group?.title || 'Your get-together'}</Text>
    <TouchableOpacity accessibilityRole="button" disabled={busy || loading} onPress={refresh}><Text style={{ color: colors.primary }}>Refresh agreement</Text></TouchableOpacity>
    {loading && <LoadingState />}{error && <ErrorState message={error} onRetry={refresh} />}
    {!loading && !error && group && <>
      <View style={{ backgroundColor: colors.surface, padding: 18, borderRadius: 16, gap: 12 }}>
        <Text style={{ color: colors.text, fontSize: 22, fontWeight: '700' }}>Gazata · chip in together</Text>
        <Text style={{ color: colors.text }}>Agreed place: {group.place ? `${group.place.name} · ${group.place.location}` : 'No longer available'}</Text>
        {!!group.place && <Text style={{ color: colors.textSecondary }}>{group.place.address}</Text>}
        <Text style={{ color: colors.text }}>Group budget: {money(group.target_cents)}</Text>
        <Text style={{ color: colors.text }}>Your agreed share: {money(contributionShare(group, auth.user.id))}</Text>
        <Text style={{ color: colors.textSecondary }}>Free withdrawal deadline: {new Date(group.withdrawal_deadline).toLocaleString('en-ZA', { timeZone: 'Africa/Johannesburg' })}</Text>
        <Text style={{ color: colors.textSecondary }}>Maximum late withdrawal charge: {money(group.cancellation_cap_cents)} per person, limited to actual unrecoverable costs and your confirmed contribution.</Text>
        <Text style={{ color: colors.textSecondary }}>Changing the place, budget, members or deadline needs a new agreement. The organiser cannot approve for you.</Text>
        <Text style={{ color: colors.primary }}>{summary.approved} of {summary.total} approved · {summary.unanimous ? 'Everyone has agreed' : 'Waiting for member agreement'}</Text>
      </View>
      <Text style={{ color: colors.text, fontWeight: '700' }}>Member responses</Text>
      {group.member_ids.map((uid) => <Text selectable key={uid} style={{ color: colors.textSecondary }}>{uid === auth.user.id ? 'You' : uid}: {group.agreements.find((item) => item.id === uid)?.status.replace(/_/g, ' ') || 'Awaiting response'}</Text>)}
      {!own && Date.now() <= group.withdrawal_deadline && <>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}><Switch disabled={busy} value={accepted} onValueChange={setAccepted} accessibilityLabel="Accept contribution and withdrawal terms" /><Text style={{ flex: 1, color: colors.text }}>I agree to my share, the spending purpose, deadline and withdrawal charge cap shown above.</Text></View>
        <TouchableOpacity accessibilityRole="button" disabled={busy || !accepted || !group.place} onPress={() => respond('approved')} style={{ padding: 16, borderRadius: 12, backgroundColor: colors.primary, opacity: accepted && group.place ? 1 : 0.5 }}><Text style={{ color: '#FFFFFF' }}>Agree to my share and terms</Text></TouchableOpacity>
        <TouchableOpacity accessibilityRole="button" disabled={busy} onPress={() => respond('declined')}><Text style={{ color: colors.error }}>Decline this agreement</Text></TouchableOpacity>
      </>}
      {!own && Date.now() > group.withdrawal_deadline && <Text style={{ color: colors.textSecondary }}>The agreement deadline has passed. Ask the organiser to create a new group.</Text>}
      {own?.status === 'approved' && <TouchableOpacity accessibilityRole="button" disabled={busy} onPress={() => respond('withdrawal_requested')}><Text style={{ color: colors.error }}>Request to withdraw</Text></TouchableOpacity>}
      {own?.status === 'withdrawal_requested' && <Text style={{ color: colors.textSecondary }}>Your withdrawal request is recorded. No charge or refund has been processed.</Text>}
      {busy && <ActivityIndicator color={colors.primary} />}
      <View style={{ backgroundColor: colors.surface, padding: 18, borderRadius: 16, gap: 10 }}>
        <Text style={{ color: colors.text, fontSize: 20, fontWeight: '700' }}>Group kitty</Text>
        <Text style={{ color: colors.textSecondary }}>Contributions, provider payments and refunds are not available yet. This agreement records consent and does not collect money or confirm a booking.</Text>
      </View>
    </>}
    <TouchableOpacity accessibilityRole="button" onPress={() => router.replace('/(tabs)/groups')}><Text style={{ color: colors.primary }}>Back to groups</Text></TouchableOpacity>
  </ScrollView>;
}
