import * as ImagePicker from 'expo-image-picker';
import ProfilePhoto from '../components/ProfilePhoto';
import { uploadProfilePhoto } from '../utils/profilePhoto';
import { useState } from "react";
import { useRouter } from "expo-router";
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
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
  const [photoBusy, setPhotoBusy] = useState(false);
  const [preview, setPreview] = useState(null);
  const [notice, setNotice] = useState('');
  async function save() {
    if (busy || photoBusy) return;
    if (['first_name', 'last_name', 'city', 'province'].some((key) => !form[key].trim())) { setError('Add your name, city and province to continue.'); return; }
    setBusy(true);
    setError('');
    try {
      const data = await updateOwnProfile(Object.fromEntries(Object.entries(form).map(([key, value]) => [key, value.trim()])));
      setAuth({ ...auth, profile: data });
      router.replace('/');
    } catch (failure) {
      const detail = failure.response?.data?.detail;
      setError(Array.isArray(detail) ? detail.map((item) => item.msg).join('\n') : detail || failure.message);
    } finally { setBusy(false); }
  }
  async function choosePhoto() {
    if (busy || photoBusy) return;
    setError(''); setNotice(''); setPhotoBusy(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.7, base64: true, exif: false });
      if (result.canceled) return;
      const asset = result.assets[0];
      setPreview(asset.uri);
      const profile = await uploadProfilePhoto(asset);
      setAuth({ ...auth, profile });
      setNotice('Your profile picture has been saved.');
    } catch (failure) { setError(failure.message || 'Your picture could not be uploaded. Try again.'); }
    finally { setPhotoBusy(false); setPreview(null); }
  }
  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 24, paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24, gap: 16 }}>
        <Text style={{ color: colors.text, fontSize: 28, fontWeight: '700' }}>Your profile</Text>
        <Text style={{ color: colors.textSecondary }}>Your name and location help people get to know you.</Text>
        <View style={{ alignItems: 'center', gap: 14 }}>
          <ProfilePhoto url={preview || auth?.profile?.profile_photo_url} name={[form.first_name, form.last_name].join(' ')} size={112} backgroundColor={colors.primary} />
          <TouchableOpacity accessibilityRole="button" disabled={busy || photoBusy || !auth?.profile?.profile_complete} onPress={choosePhoto} style={{ padding: 14, borderRadius: 12, backgroundColor: colors.primary }}>
            {photoBusy ? <ActivityIndicator color="#FFFFFF" /> : <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>{auth?.profile?.profile_photo_url ? 'Change profile picture' : 'Upload profile picture'}</Text>}
          </TouchableOpacity>
          {!auth?.profile?.profile_complete && <Text style={{ color: colors.textSecondary }}>Save your name and location to enable photo uploads.</Text>}
          <Text style={{ color: colors.textSecondary }}>Choose your own picture. JPEG or PNG, up to 5 MB. Your profile picture is visible to other members.</Text>
        </View>
        {!!notice && <Text accessibilityRole="alert" style={{ color: colors.success }}>{notice}</Text>}
        {Object.keys(form).map((key) => <TextInput key={key} accessibilityLabel={key.replace('_', ' ')} placeholder={key.replace('_', ' ')} placeholderTextColor={colors.textTertiary} value={form[key]} onChangeText={(value) => setForm((previous) => ({ ...previous, [key]: value }))} multiline={key === 'bio'} maxLength={key === 'bio' ? 500 : 100} style={{ padding: 16, borderRadius: 12, backgroundColor: colors.surface, color: colors.text, borderWidth: 1, borderColor: colors.border }} />)}
        {!!error && <Text accessibilityRole="alert" style={{ color: colors.error }}>{error}</Text>}
        <TouchableOpacity onPress={save} disabled={busy || photoBusy} accessibilityRole="button" style={{ padding: 16, borderRadius: 12, backgroundColor: colors.primary, alignItems: 'center' }}>{busy ? <ActivityIndicator color="#FFFFFF" /> : <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>Save profile</Text>}</TouchableOpacity>
        <TouchableOpacity disabled={busy || photoBusy} onPress={signOut}><Text style={{ color: colors.error }}>Sign out</Text></TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
