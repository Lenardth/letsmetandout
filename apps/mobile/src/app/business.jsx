import { useCallback, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../utils/theme';
import { createBusiness, ownBusinesses, businessRequests, answerReservation } from '../utils/business';
import BusinessField from '../components/BusinessField';
export default function Business() {
  const { colors } = useTheme(); const insets = useSafeAreaInsets();
  const [form, setForm] = useState({ name: '', category: 'Restaurant', city: '', address: '', phone: '', image: '', description: '', deposit_rands: '0', max_party_size: '8' });
  const [stores, setStores] = useState([]); const [requests, setRequests] = useState([]); const [busy, setBusy] = useState(false); const [error, setError] = useState(''); const [notice, setNotice] = useState('');
  const refresh = useCallback(async () => { try { const listings = await ownBusinesses(); setStores(listings); setRequests((await Promise.all(listings.map((store) => businessRequests(store.id)))).flat()); } catch (failure) { setError(failure.message); } }, []);
  useFocusEffect(useCallback(() => { refresh(); }, [refresh]));
  async function publish() { if (busy) return; setBusy(true); setError(''); setNotice(''); try { await createBusiness(form); setNotice('Your business is listed.'); setForm({ ...form, name: '', address: '', description: '', image: '' }); await refresh(); } catch (failure) { setError(failure.message); } finally { setBusy(false); } }
  async function answer(record, status) { if (busy) return; setBusy(true); setError(''); try { await answerReservation(record, status); await refresh(); } catch (failure) { setError(failure.message); } finally { setBusy(false); } }
  return <ScrollView keyboardShouldPersistTaps="handled" style={{ backgroundColor: colors.background }} contentContainerStyle={{ padding: 24, paddingTop: insets.top + 24, paddingBottom: insets.bottom + 100, gap: 16 }}>
    <Text style={{ color: colors.text, fontSize: 28, fontWeight: '700' }}>Provider dashboard</Text><Text style={{ color: colors.textSecondary }}>Publish a restaurant, café or venue and manage table requests.</Text>
    {!!error && <Text accessibilityRole="alert" style={{ color: colors.error }}>{error}</Text>}{!!notice && <Text style={{ color: colors.success }}>{notice}</Text>}
    <TouchableOpacity accessibilityRole="button" disabled={busy} onPress={refresh}><Text style={{ color: colors.primary }}>Refresh listings and requests</Text></TouchableOpacity>
    <Text style={{ color: colors.text, fontSize: 20, fontWeight: '700' }}>Reservation requests</Text>
    {requests.length === 0 && <Text style={{ color: colors.textSecondary }}>New table requests for your businesses appear here.</Text>}
    {requests.map((record) => <View key={record.id} style={{ backgroundColor: colors.surface, padding: 16, borderRadius: 12, gap: 8 }}>
      <Text style={{ color: colors.text, fontWeight: '700' }}>{record.title} · {record.guests} guests</Text>
      <Text style={{ color: colors.textSecondary }}>{new Date(record.booking_date).toLocaleString('en-ZA', { timeZone: 'Africa/Johannesburg' })} · {record.status}</Text>
      <Text style={{ color: colors.textSecondary }}>Deposit: R{(record.deposit_cents / 100).toFixed(2)} · {record.payment_status}</Text>
      {record.status === 'requested' && <View style={{ flexDirection: 'row', gap: 20 }}><TouchableOpacity disabled={busy} onPress={() => answer(record, 'accepted')}><Text style={{ color: colors.primary }}>Accept</Text></TouchableOpacity><TouchableOpacity disabled={busy} onPress={() => answer(record, 'declined')}><Text style={{ color: colors.error }}>Decline</Text></TouchableOpacity></View>}
    </View>)}
    <Text style={{ color: colors.text, fontSize: 20, fontWeight: '700' }}>Your listings</Text>{stores.map((store) => <Text key={store.id} style={{ color: colors.textSecondary }}>{store.name} · {store.location}</Text>)}
    <Text style={{ color: colors.text, fontSize: 20, fontWeight: '700' }}>List a business</Text>
    <View style={{ flexDirection: 'row', gap: 12 }}>{['Restaurant', 'Café', 'Venue'].map((category) => <TouchableOpacity key={category} accessibilityState={{ selected: form.category === category }} onPress={() => setForm({ ...form, category })} style={{ padding: 10, borderRadius: 10, backgroundColor: form.category === category ? colors.primary : colors.surface }}><Text style={{ color: form.category === category ? '#FFFFFF' : colors.text }}>{category}</Text></TouchableOpacity>)}</View>
    {Object.entries({ name: 'Business name', city: 'City', address: 'Address', phone: 'Contact number', image: 'Photo URL (HTTPS, optional)', description: 'Description', deposit_rands: 'Requested deposit per table (rand)', max_party_size: 'Maximum guests per table' }).map(([key, label]) => <BusinessField key={key} label={label} value={form[key]} numeric={['deposit_rands', 'max_party_size'].includes(key)} multiline={key === 'description'} onChangeText={(value) => setForm({ ...form, [key]: value })} />)}
    <Text style={{ color: colors.textSecondary }}>Online deposit payments and paid listing subscriptions are not active yet. Do not treat a table request as a paid booking.</Text>
    <TouchableOpacity disabled={busy} onPress={publish} style={{ padding: 16, backgroundColor: colors.primary, borderRadius: 12, alignItems: 'center' }}>{busy ? <ActivityIndicator color="#FFFFFF" /> : <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>Publish business</Text>}</TouchableOpacity>
  </ScrollView>;
}
