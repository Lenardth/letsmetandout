import { useCallback, useState } from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { ArrowRight, Heart, MapPin } from 'lucide-react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApiResource } from '../../utils/useApiResource';
import { useTheme } from '../../utils/theme';
import { EmptyState, ErrorState, LoadingState } from '../../components/DataState';
import BusinessField from '../../components/BusinessField';
import { useFavorites } from '../../utils/favorites';
export default function Stores() {
  const { colors } = useTheme(); const insets = useSafeAreaInsets(); const router = useRouter();
  const { data, loading, error, refetch } = useApiResource('/stores', { initialData: [] });
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const { toggle, isSaved } = useFavorites();
  useFocusEffect(useCallback(() => { refetch(); }, [refetch]));
  const categories = ['All', ...new Set((data || []).map((item) => item.category).filter(Boolean))].slice(0, 7);
  const stores = (data || []).filter((item) => `${item.name} ${item.location} ${item.category}`.toLowerCase().includes(search.toLowerCase())).filter((item) => category === 'All' || item.category === category);
  return <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ padding: 20, paddingTop: insets.top + 20, paddingBottom: insets.bottom + 100, gap: 16 }}>
    <View style={{ gap: 8 }}><Text style={{ color: colors.text, fontSize: 30, fontWeight: '700', letterSpacing: -0.7 }}>Find your next place</Text><Text style={{ color: colors.textSecondary, fontSize: 15, lineHeight: 22 }}>Discover restaurants and venues for your next safe meetup.</Text></View>
    <TouchableOpacity onPress={() => router.push('/(tabs)/bookings')} style={{ alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6 }}><Text style={{ color: colors.primary, fontWeight: '600' }}>View my bookings</Text><ArrowRight size={16} color={colors.primary} /></TouchableOpacity>
    <BusinessField label="Search by name or city" value={search} onChangeText={setSearch} />
    {categories.length > 1 && <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}><TouchableOpacity onPress={() => setCategory('All')} style={{ paddingHorizontal: 14, paddingVertical: 9, borderRadius: 12, backgroundColor: category === 'All' ? colors.primary : colors.surface }}><Text style={{ color: category === 'All' ? '#FFFFFF' : colors.textSecondary, fontWeight: '600' }}>All</Text></TouchableOpacity>{categories.slice(1).map((option) => <TouchableOpacity key={option} onPress={() => setCategory(option)} style={{ paddingHorizontal: 14, paddingVertical: 9, borderRadius: 12, backgroundColor: category === option ? colors.primary : colors.surface }}><Text style={{ color: category === option ? '#FFFFFF' : colors.textSecondary, fontWeight: '600' }}>{option}</Text></TouchableOpacity>)}</ScrollView>}
    {loading && <LoadingState />}{error && <ErrorState message={error} onRetry={refetch} />}
    {!loading && !error && stores.length === 0 && <EmptyState title="No places found" message="Business owners can publish their restaurant or venue here." />}
    {stores.map((store) => <View key={store.id} style={{ padding: 16, backgroundColor: colors.surface, borderRadius: 22, gap: 10, shadowColor: colors.shadow, shadowOpacity: colors.shadowOpacity, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 2 }}>
      {!!store.image && <><Image source={{ uri: store.image }} accessibilityLabel={store.name} style={{ height: 180, borderRadius: 12 }} resizeMode="cover" /><Text style={{ color: colors.textTertiary, fontSize: 11 }}>Photo via Pexels · venue information for demonstration</Text></>}
      <TouchableOpacity accessibilityRole="button" accessibilityLabel={isSaved(store.id) ? 'Remove from saved' : 'Save place'} onPress={() => toggle(store.id, store)} style={{ position: 'absolute', right: 26, top: 26, zIndex: 1, width: 36, height: 36, borderRadius: 12, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' }}><Heart size={17} color={colors.primary} fill={isSaved(store.id) ? colors.primary : 'transparent'} /></TouchableOpacity>
      <Text style={{ color: colors.text, fontSize: 22, fontWeight: '700' }}>{store.name}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}><MapPin size={15} color={colors.primary} /><Text style={{ color: colors.textSecondary }}>{store.category} · {store.location}</Text></View>
      <Text style={{ color: colors.textSecondary }}>{store.description}</Text>
      <Text style={{ color: colors.textSecondary }}>{store.address} · {store.phone}</Text>
      <Text style={{ color: colors.text }}>Deposit per table: R{(Number(store.deposit_cents || 0) / 100).toFixed(2)}</Text>
      <TouchableOpacity accessibilityRole="button" onPress={() => router.push({ pathname: '/create-group', params: { storeId: store.id } })}><Text style={{ color: colors.primary, paddingVertical: 8 }}>Plan with your people · split the budget</Text></TouchableOpacity>
      <TouchableOpacity onPress={() => router.push({ pathname: '/reserve', params: { storeId: store.id } })} style={{ padding: 15, backgroundColor: colors.primary, borderRadius: 15, alignItems: 'center' }}><Text style={{ color: '#FFFFFF', fontWeight: '700' }}>Request a table</Text></TouchableOpacity>
    </View>)}
  </ScrollView>;
}
