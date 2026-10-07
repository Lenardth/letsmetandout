import { useCallback, useState } from 'react';
import { ArrowLeft, Bell, CalendarCheck, CheckCircle2, Users } from 'lucide-react-native';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../utils/theme';
import { useApiResource } from '../utils/useApiResource';
import { myGroups } from '../utils/groups';
import { LoadingState, ErrorState, EmptyState } from '../components/DataState';

function formatDate(value) {
  if (!value) return 'Recently';
  return new Date(value).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' });
}

export default function Notifications() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const bookings = useApiResource('/bookings', { initialData: [] });
  const [groups, setGroups] = useState([]);
  const [groupsLoading, setGroupsLoading] = useState(true);
  const [groupsError, setGroupsError] = useState('');

  const refreshGroups = useCallback(async () => {
    setGroupsLoading(true);
    setGroupsError('');
    try { setGroups(await myGroups()); } catch (failure) { setGroupsError(failure.message); } finally { setGroupsLoading(false); }
  }, []);
  useFocusEffect(useCallback(() => { bookings.refetch(); refreshGroups(); }, [bookings.refetch, refreshGroups]));

  const activities = [
    ...(bookings.data || []).map((booking) => ({ id: `booking-${booking.id}`, icon: CalendarCheck, title: `${booking.title || 'Table request'} is ${booking.status || 'pending'}`, detail: `${booking.location || 'Restaurant'} · ${formatDate(booking.booking_date)}`, color: colors.primary })),
    ...groups.map((group) => ({ id: `group-${group.id}`, icon: Users, title: `Your group "${group.title}" is ready`, detail: `${group.member_ids?.length || 0} people · Budget R${(Number(group.target_cents || 0) / 100).toFixed(2)}`, color: colors.info })),
  ];

  return <View style={{ flex: 1, backgroundColor: colors.background }}>
    <ScrollView contentContainerStyle={{ paddingTop: insets.top + 18, paddingHorizontal: 20, paddingBottom: insets.bottom + 32, gap: 20 }} showsVerticalScrollIndicator={false}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        <TouchableOpacity onPress={() => router.back()} accessibilityRole="button" style={{ width: 42, height: 42, borderRadius: 14, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' }}><ArrowLeft size={19} color={colors.text} /></TouchableOpacity>
        <View style={{ flex: 1 }}><Text style={{ color: colors.text, fontSize: 28, fontWeight: '700', letterSpacing: -0.6 }}>Activity</Text><Text style={{ color: colors.textSecondary }}>Your latest updates in one place.</Text></View>
        <View style={{ width: 42, height: 42, borderRadius: 14, backgroundColor: `${colors.primary}14`, alignItems: 'center', justifyContent: 'center' }}><Bell size={19} color={colors.primary} /></View>
      </View>
      {bookings.loading || groupsLoading ? <LoadingState label="Checking for updates..." /> : null}
      {bookings.error && <ErrorState message={bookings.error} onRetry={bookings.refetch} />}
      {groupsError && <ErrorState message={groupsError} onRetry={refreshGroups} />}
      {!bookings.loading && !groupsLoading && !bookings.error && !groupsError && !activities.length && <EmptyState title="You’re all caught up" message="New booking responses and group activity will appear here." />}
      {activities.map(({ id, icon: Icon, title, detail, color }) => <View key={id} style={{ flexDirection: 'row', gap: 14, padding: 16, borderRadius: 20, backgroundColor: colors.surface, shadowColor: colors.shadow, shadowOpacity: colors.shadowOpacity, shadowRadius: 14, shadowOffset: { width: 0, height: 7 }, elevation: 2 }}>
        <View style={{ width: 42, height: 42, borderRadius: 14, backgroundColor: `${color}18`, alignItems: 'center', justifyContent: 'center' }}><Icon size={19} color={color} /></View>
        <View style={{ flex: 1, gap: 5 }}><Text style={{ color: colors.text, fontSize: 15, fontWeight: '700' }}>{title}</Text><Text style={{ color: colors.textSecondary, fontSize: 13, lineHeight: 19 }}>{detail}</Text><Text style={{ color: colors.textTertiary, fontSize: 11 }}>Just now</Text></View>
        <CheckCircle2 size={17} color={colors.success} />
      </View>)}
    </ScrollView>
  </View>;
}
