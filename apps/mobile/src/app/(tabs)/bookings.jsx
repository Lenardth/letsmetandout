import { ScrollView, Text, View } from 'react-native';
import { CalendarCheck } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { useTheme } from '../../utils/theme';
import { useApiResource } from '../../utils/useApiResource';
import { EmptyState, ErrorState, LoadingState } from '../../components/DataState';
export default function Bookings() {
  const { colors } = useTheme(); const insets = useSafeAreaInsets(); const { data, loading, error, refetch } = useApiResource('/bookings', { initialData: [] });
  useFocusEffect(useCallback(() => { refetch(); }, [refetch]));
  return <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={{ padding: 20, paddingTop: insets.top + 20, paddingBottom: insets.bottom + 100, gap: 16 }}>
    <Text style={{ color: colors.text, fontSize: 30, fontWeight: '700', letterSpacing: -0.7 }}>Table bookings</Text>
    <Text style={{ color: colors.textSecondary, fontSize: 15 }}>Keep track of your requests and restaurant responses.</Text>
    {loading && <LoadingState />}{error && <ErrorState message={error} onRetry={refetch} />}
    {!loading && !error && data?.length === 0 && <EmptyState title="No table requests yet" message="Choose a restaurant in Places and request a table." />}
    {(data || []).map((record) => <View key={record.id} style={{ backgroundColor: colors.surface, borderRadius: 22, padding: 18, gap: 10, shadowColor: colors.shadow, shadowOpacity: colors.shadowOpacity, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 2 }}>
      <CalendarCheck size={22} color={colors.primary} />
      <Text style={{ color: colors.text, fontSize: 20, fontWeight: '700' }}>{record.title}</Text>
      <Text style={{ color: colors.textSecondary }}>{record.location} · {record.guests} guests</Text>
      <Text style={{ color: colors.textSecondary }}>{new Date(record.booking_date).toLocaleString('en-ZA', { timeZone: 'Africa/Johannesburg' })}</Text>
      <Text style={{ color: colors.primary }}>Restaurant response: {record.status}</Text>
      <Text style={{ color: colors.text }}>Deposit: R{(Number(record.deposit_cents || 0) / 100).toFixed(2)} · {record.payment_status}</Text>
      {record.deposit_cents > 0 && <Text style={{ color: colors.textSecondary }}>No deposit has been collected in the app. Arrange payment with the restaurant after acceptance.</Text>}
    </View>)}
  </ScrollView>;
}
