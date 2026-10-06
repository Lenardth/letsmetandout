import { useCallback, useState } from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApiResource } from '../../utils/useApiResource';
import { useTheme } from '../../utils/theme';
import { EmptyState, ErrorState, LoadingState } from '../../components/DataState';
import BusinessField from '../../components/BusinessField';
export default function Stores() {
  const { colors } = useTheme(); const insets = useSafeAreaInsets(); const router = useRouter();
  const { data, loading, error, refetch } = useApiResource('/stores', { initialData: [] });
  const [search, setSearch] = useState('');
  useFocusEffect(useCallback(() => { refetch(); }, [refetch]));
  const stores = (data || []).filter((item) => `${item.name} ${item.location} ${item.category}`.toLowerCase().includes(search.toLowerCase()));
  return <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ padding: 20, paddingTop: insets.top + 20, paddingBottom: insets.bottom + 100, gap: 16 }}>
    <Text style={{ color: colors.text, fontSize: 28, fontWeight: '700' }}>Restaurants & places</Text>
    <Text style={{ color: colors.textSecondary }}>Find a place and request a table. Restaurants confirm availability.</Text>
    <TouchableOpacity onPress={() => router.push('/business')}><Text style={{ color: colors.primary, padding: 12, fontWeight: '700' }}>Own a business? List it and manage requests →</Text></TouchableOpacity>
    <TouchableOpacity onPress={() => router.push('/(tabs)/bookings')}><Text style={{ color: colors.primary }}>My table bookings →</Text></TouchableOpacity>
    <BusinessField label="Search by name or city" value={search} onChangeText={setSearch} />
    {loading && <LoadingState />}{error && <ErrorState message={error} onRetry={refetch} />}
    {!loading && !error && stores.length === 0 && <EmptyState title="No places found" message="Business owners can publish their restaurant or venue here." />}
    {stores.map((store) => <View key={store.id} style={{ padding: 16, backgroundColor: colors.surface, borderRadius: 16, gap: 10 }}>
      {!!store.image && <Image source={{ uri: store.image }} accessibilityLabel={store.name} style={{ height: 180, borderRadius: 12 }} resizeMode="cover" />}
      <Text style={{ color: colors.text, fontSize: 22, fontWeight: '700' }}>{store.name}</Text>
      <Text style={{ color: colors.textSecondary }}>{store.category} · {store.location}</Text>
      <Text style={{ color: colors.textSecondary }}>{store.description}</Text>
      <Text style={{ color: colors.textSecondary }}>{store.address} · {store.phone}</Text>
      <Text style={{ color: colors.text }}>Deposit per table: R{(Number(store.deposit_cents || 0) / 100).toFixed(2)}</Text>
      <TouchableOpacity onPress={() => router.push({ pathname: '/reserve', params: { storeId: store.id } })} style={{ padding: 14, backgroundColor: colors.primary, borderRadius: 12, alignItems: 'center' }}><Text style={{ color: '#FFFFFF', fontWeight: '700' }}>Request a table</Text></TouchableOpacity>
    </View>)}
  </ScrollView>;
}
