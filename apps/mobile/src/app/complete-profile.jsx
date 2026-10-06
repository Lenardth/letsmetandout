import { useState } from "react";
import { useRouter } from "expo-router";
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../utils/auth/useAuth";
import { useTheme } from "../utils/theme";
import { updateOwnProfile } from "../utils/firebaseData";

export default function CompleteProfile() {
  const { auth, setAuth, signOut } = useAuth();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [form, setForm] = useState(Object.fromEntries(['first_name', 'last_name', 'city', 'province', 'bio'].map((key) => [key, auth?.profile?.[key] || ''])));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function save() {
    if (busy) return;
    if (['first_name', 'last_name', 'city', 'province'].some((key) => !form[key].trim())) { setError('Add your name, city and province to continue.'); return; }
    setBusy(true);
    setError('');
    try {
      const data = await updateOwnProfile(Object.fromEntries(Object.entries(form).map(([key, value]) => [key, value.trim()])));
      setAuth({ ...auth, profile: data });
      router.replace('/(tabs)/profile');
    } catch (failure) {
      const detail = failure.response?.data?.detail;
      setError(Array.isArray(detail) ? detail.map((item) => item.msg).join('\n') : detail || failure.message);
    } finally { setBusy(false); }
  }
  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 24, paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24, gap: 16 }}>
        <Text style={{ color: colors.text, fontSize: 28, fontWeight: '700' }}>Your profile</Text>
        <Text style={{ color: colors.textSecondary }}>Your name and location help people get to know you.</Text>
        {Object.keys(form).map((key) => <TextInput key={key} accessibilityLabel={key.replace('_', ' ')} placeholder={key.replace('_', ' ')} placeholderTextColor={colors.textTertiary} value={form[key]} onChangeText={(value) => setForm((previous) => ({ ...previous, [key]: value }))} multiline={key === 'bio'} maxLength={key === 'bio' ? 500 : 100} style={{ padding: 16, borderRadius: 12, backgroundColor: colors.surface, color: colors.text, borderWidth: 1, borderColor: colors.border }} />)}
        {!!error && <Text accessibilityRole="alert" style={{ color: colors.error }}>{error}</Text>}
        <TouchableOpacity onPress={save} disabled={busy} accessibilityRole="button" style={{ padding: 16, borderRadius: 12, backgroundColor: colors.primary, alignItems: 'center' }}>{busy ? <ActivityIndicator color="#FFFFFF" /> : <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>Save profile</Text>}</TouchableOpacity>
        <TouchableOpacity onPress={signOut}><Text style={{ color: colors.error }}>Sign out</Text></TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
