import { ArrowLeft, Heart, Trash2 } from 'lucide-react-native';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EmptyState } from '../components/DataState';
import { useFavorites } from '../utils/favorites';
import { useTheme } from '../utils/theme';

export default function Saved() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { saved, toggle } = useFavorites();
  const items = Object.entries(saved);
  return <ScrollView contentContainerStyle={{ paddingTop: insets.top + 18, paddingHorizontal: 20, paddingBottom: insets.bottom + 32, gap: 18 }} style={{ flex: 1, backgroundColor: colors.background }}>
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}><TouchableOpacity onPress={() => router.back()} style={{ width: 42, height: 42, borderRadius: 14, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' }}><ArrowLeft size={19} color={colors.text} /></TouchableOpacity><View style={{ flex: 1 }}><Text style={{ color: colors.text, fontSize: 28, fontWeight: '700' }}>Saved</Text><Text style={{ color: colors.textSecondary }}>Your places, people and plans.</Text></View><Heart size={20} color={colors.primary} fill={colors.primary} /></View>
    {!items.length && <EmptyState title="Nothing saved yet" message="Tap the heart on a place, person or plan to keep it close." />}
    {items.map(([id, item]) => <View key={id} style={{ padding: 18, borderRadius: 20, backgroundColor: colors.surface, gap: 8 }}><Text style={{ color: colors.text, fontSize: 18, fontWeight: '700' }}>{item.title || item.name || item.activity || `Saved item ${id}`}</Text><Text style={{ color: colors.textSecondary }}>{item.location || item.category || item.bio || 'Saved to your SafeMeet collection'}</Text><TouchableOpacity onPress={() => toggle(id, item)} style={{ alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 5 }}><Trash2 size={15} color={colors.error} /><Text style={{ color: colors.error, fontWeight: '600' }}>Remove</Text></TouchableOpacity></View>)}
  </ScrollView>;
}
