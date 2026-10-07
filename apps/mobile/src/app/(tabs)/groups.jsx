import { useCallback, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { ArrowRight, Plus, Users } from 'lucide-react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../utils/theme';
import { myGroups } from '../../utils/groups';
import { EmptyState, ErrorState, LoadingState } from '../../components/DataState';

export default function Groups() {
  const { colors } = useTheme(); const insets = useSafeAreaInsets(); const router = useRouter();
  const [groups, setGroups] = useState([]); const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  const refresh = useCallback(async () => { setLoading(true); setError(''); try { setGroups(await myGroups()); } catch (failure) { setError(failure.message); } finally { setLoading(false); } }, []);
  useFocusEffect(useCallback(() => { refresh(); }, [refresh]));
  return <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ padding: 20, paddingTop: insets.top + 24, paddingBottom: insets.bottom + 100, gap: 18 }}>
    <Text style={{ color: colors.text, fontSize: 30, fontWeight: '700', letterSpacing: -0.7 }}>Your people, together</Text>
    <Text style={{ color: colors.textSecondary, fontSize: 15, lineHeight: 22 }}>Bring everyone together, agree on a place and make every share clear.</Text>
    <TouchableOpacity accessibilityRole="button" onPress={() => router.push('/create-group')} style={{ padding: 16, borderRadius: 15, backgroundColor: colors.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}><Plus size={18} color="#FFFFFF" /><Text style={{ color: '#FFFFFF', fontWeight: '700' }}>Create a group</Text></TouchableOpacity>
    <TouchableOpacity accessibilityRole="button" disabled={loading} onPress={refresh}><Text style={{ color: colors.primary }}>Refresh groups</Text></TouchableOpacity>
    {loading && <LoadingState />}
    {!loading && error && <ErrorState message={error} onRetry={refresh} />}
    {!loading && !error && groups.length === 0 && <EmptyState title="No get-togethers yet" message="Create a group or ask a friend to invite you." />}
    {!loading && !error && groups.map((group) => <TouchableOpacity accessibilityRole="button" key={group.id} onPress={() => router.push({ pathname: '/group', params: { groupId: group.id } })} style={{ backgroundColor: colors.surface, borderRadius: 22, padding: 18, gap: 10, shadowColor: colors.shadow, shadowOpacity: colors.shadowOpacity, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 2 }}>
      <View style={{ width: 42, height: 42, borderRadius: 14, backgroundColor: `${colors.primary}14`, alignItems: 'center', justifyContent: 'center' }}><Users size={20} color={colors.primary} /></View>
      <Text style={{ color: colors.text, fontSize: 20, fontWeight: '700' }}>{group.title}</Text>
      <Text style={{ color: colors.textSecondary }}>{group.member_ids.length} people · Budget R{(group.target_cents / 100).toFixed(2)}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}><Text style={{ color: colors.primary, fontWeight: '600' }}>View contribution agreement</Text><ArrowRight size={15} color={colors.primary} /></View>
    </TouchableOpacity>)}
  </ScrollView>;
}
