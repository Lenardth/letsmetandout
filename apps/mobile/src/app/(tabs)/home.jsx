import { LinearGradient } from 'expo-linear-gradient';
import { Bell, CalendarCheck, ChevronRight, Compass, Heart, MapPin, Plus, Users } from 'lucide-react-native';
import { useCallback } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../utils/auth/useAuth';
import { useTheme } from '../../utils/theme';
import { useApiResource } from '../../utils/useApiResource';
import { useFavorites } from '../../utils/favorites';
import { LoadingState } from '../../components/DataState';

export default function Home() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { auth } = useAuth();
  const bookings = useApiResource('/bookings', { initialData: [] });
  const stores = useApiResource('/stores', { initialData: [] });
  const { saved } = useFavorites();
  useFocusEffect(useCallback(() => { bookings.refetch(); stores.refetch(); }, [bookings.refetch, stores.refetch]));
  const firstName = auth?.profile?.first_name || 'there';
  const upcoming = (bookings.data || []).filter((booking) => booking.status !== 'declined').slice(0, 1)[0];
  const savedCount = Object.keys(saved).length;

  const actions = [
    ['Find a place', 'Browse restaurants and venues', MapPin, '/(tabs)/stores'],
    ['Plan with friends', 'Create a shared meetup', Users, '/create-group'],
    ['Discover people', 'Meet compatible members', Compass, '/(tabs)/discover'],
  ];

  return <View style={{ flex: 1, backgroundColor: colors.background }}>
    <ScrollView contentContainerStyle={{ paddingTop: insets.top + 20, paddingHorizontal: 20, paddingBottom: insets.bottom + 100, gap: 22 }} showsVerticalScrollIndicator={false}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ gap: 4 }}><Text style={{ color: colors.textSecondary, fontSize: 14 }}>Good to see you</Text><Text style={{ color: colors.text, fontSize: 28, fontWeight: '700', letterSpacing: -0.7 }}>{firstName} 👋</Text></View>
        <TouchableOpacity onPress={() => router.push('/notifications')} accessibilityLabel="Open activity" style={{ width: 46, height: 46, borderRadius: 16, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' }}><Bell size={21} color={colors.text} /><View style={{ position: 'absolute', right: 11, top: 10, width: 7, height: 7, borderRadius: 4, backgroundColor: colors.primary }} /></TouchableOpacity>
      </View>
      <LinearGradient colors={[colors.primary, colors.accent]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ padding: 22, borderRadius: 24, gap: 14, shadowColor: colors.primary, shadowOpacity: 0.22, shadowRadius: 18, shadowOffset: { width: 0, height: 10 }, elevation: 4 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}><View style={{ width: 42, height: 42, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' }}><Heart size={20} color="#FFFFFF" /></View><Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 12, fontWeight: '700' }}>SAFEMEET</Text></View>
        <Text style={{ color: '#FFFFFF', fontSize: 23, lineHeight: 30, fontWeight: '700' }}>Make time for the{'\n'}people who matter.</Text>
        <Text style={{ color: 'rgba(255,255,255,0.78)', lineHeight: 20 }}>Find a place, invite your people and create a plan that feels effortless.</Text>
        <TouchableOpacity onPress={() => router.push('/(tabs)/stores')} style={{ alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: '#FFFFFF', paddingHorizontal: 15, paddingVertical: 11, borderRadius: 13 }}><Text style={{ color: colors.primary, fontWeight: '700' }}>Explore places</Text><ChevronRight size={16} color={colors.primary} /></TouchableOpacity>
      </LinearGradient>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        {[['Saved', savedCount, Heart], ['Bookings', (bookings.data || []).length, CalendarCheck], ['Places', (stores.data || []).length, MapPin]].map(([label, value, Icon]) => <TouchableOpacity key={label} onPress={() => label === 'Saved' ? router.push('/saved') : label === 'Bookings' ? router.push('/(tabs)/bookings') : router.push('/(tabs)/stores')} style={{ flex: 1, padding: 14, borderRadius: 18, backgroundColor: colors.surface, gap: 10 }}><Icon size={17} color={colors.primary} /><Text style={{ color: colors.text, fontSize: 20, fontWeight: '700' }}>{value}</Text><Text style={{ color: colors.textSecondary, fontSize: 12 }}>{label}</Text></TouchableOpacity>)}
      </View>
      <View style={{ gap: 13 }}><View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}><Text style={{ color: colors.text, fontSize: 20, fontWeight: '700' }}>Quick actions</Text><Plus size={19} color={colors.primary} /></View>{actions.map(([title, subtitle, Icon, path]) => <TouchableOpacity key={title} onPress={() => router.push(path)} style={{ flexDirection: 'row', alignItems: 'center', gap: 13, padding: 15, borderRadius: 18, backgroundColor: colors.surface }}><View style={{ width: 42, height: 42, borderRadius: 13, backgroundColor: `${colors.primary}14`, alignItems: 'center', justifyContent: 'center' }}><Icon size={19} color={colors.primary} /></View><View style={{ flex: 1, gap: 3 }}><Text style={{ color: colors.text, fontWeight: '700' }}>{title}</Text><Text style={{ color: colors.textSecondary, fontSize: 12 }}>{subtitle}</Text></View><ChevronRight size={18} color={colors.textTertiary} /></TouchableOpacity>)}</View>
      {upcoming && <TouchableOpacity onPress={() => router.push('/(tabs)/bookings')} style={{ padding: 18, borderRadius: 20, backgroundColor: colors.surface, gap: 8 }}><Text style={{ color: colors.textSecondary, fontSize: 12, fontWeight: '700' }}>NEXT UP</Text><Text style={{ color: colors.text, fontSize: 18, fontWeight: '700' }}>{upcoming.title || 'Your table request'}</Text><Text style={{ color: colors.primary }}>View booking details <ChevronRight size={14} color={colors.primary} /></Text></TouchableOpacity>}
      {bookings.loading && <LoadingState label="Refreshing your dashboard..." />}
    </ScrollView>
  </View>;
}
