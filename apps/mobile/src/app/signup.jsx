import { useState } from "react";
import { useRouter } from "expo-router";
import { ActivityIndicator, Image, KeyboardAvoidingView, Platform, ScrollView, Switch, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import apiClient from "../utils/api";
import { useAuth } from "../utils/auth/useAuth";
import { useTheme } from "../utils/theme";

const provinces = ["Eastern Cape", "Free State", "Gauteng", "KwaZulu-Natal", "Limpopo", "Mpumalanga", "Northern Cape", "North West", "Western Cape"];
const interestChoices = ["Coffee", "Food", "Walking", "Fitness", "Art", "Music", "Travel", "Technology", "Books", "Photography"];

export default function Signup() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { login } = useAuth();
  const [form, setForm] = useState({ first_name: "", last_name: "", email: "", phone: "", password: "", city: "", province: "", bio: "", interests: [] });
  const [confirmation, setConfirmation] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const change = (key, value) => setForm((previous) => ({ ...previous, [key]: value }));
  async function submit() {
    if (busy) return;
    if (!form.first_name.trim() || !form.last_name.trim() || !form.city.trim() || !form.province || !/^\S+@\S+\.\S+$/.test(form.email.trim()) || !/^(?:\+27|0)[6-8]\d{8}$/.test(form.phone.replace(/\s/g, "")) || form.password.length < 8 || form.password !== confirmation || !accepted) {
      setError("Complete your name, email, South African phone, city and province. Use at least 8 password characters, confirm the password and accept the agreements.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const phone = form.phone.replace(/\s/g, "");
      const payload = { ...form, first_name: form.first_name.trim(), last_name: form.last_name.trim(), city: form.city.trim(), email: form.email.trim().toLowerCase(), phone: phone.startsWith("0") ? "+27" + phone.slice(1) : phone, terms_accepted: true, privacy_accepted: true, safety_guidelines_accepted: true };
      await apiClient.post('/auth/register', payload);
      const result = await login(payload.email, payload.password);
      if (result.success) router.replace('/(tabs)/discover');
      else router.replace('/login');
    } catch (failure) {
      const detail = failure.response?.data?.detail;
      setError(Array.isArray(detail) ? detail.map((item) => item.msg).join("\n") : detail || failure.message || "Could not create your profile.");
    } finally { setBusy(false); }
  }
  const input = { padding: 14, borderRadius: 12, borderWidth: 1, borderColor: colors.border, color: colors.text, backgroundColor: colors.surface };
  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.background }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 24, paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24, gap: 14 }}>
        <Image source={require('../../assets/branding/safemeet-logo-v1.png')} resizeMode="contain" accessibilityLabel="SafeMeet logo" style={{ width: 240, height: 160, alignSelf: "center", backgroundColor: '#FFFFFF', borderRadius: 20 }} />
        <Text style={{ color: colors.text, fontSize: 28, fontWeight: "700" }}>Create your profile</Text>
        <Text style={{ color: colors.textSecondary }}>Tell people a little about yourself before you start meeting others.</Text>
        {[["first_name", "First name"], ["last_name", "Last name"], ["email", "Email address"], ["phone", "South African mobile number"], ["password", "Password"], ["city", "City"], ["bio", "About you (optional)"]].map(([key, label]) => (
          <View key={key} style={{ gap: 6 }}>
            <Text style={{ color: colors.text }}>{label}</Text>
            <TextInput style={input} accessibilityLabel={label} value={form[key]} onChangeText={(value) => change(key, value)} secureTextEntry={key === "password"} autoCapitalize={key === "email" || key === "password" ? "none" : "sentences"} keyboardType={key === "email" ? "email-address" : key === "phone" ? "phone-pad" : "default"} multiline={key === "bio"} maxLength={key === "bio" ? 500 : key === "password" ? 72 : 100} />
          </View>
        ))}
        <Text style={{ color: colors.text }}>Confirm password</Text>
        <TextInput style={input} accessibilityLabel="Confirm password" secureTextEntry value={confirmation} onChangeText={setConfirmation} />
        <Text style={{ color: colors.text, fontWeight: "600" }}>Province</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {provinces.map((province) => <TouchableOpacity key={province} onPress={() => change("province", province)} accessibilityRole="button" accessibilityState={{ selected: form.province === province }} style={{ padding: 10, borderRadius: 12, backgroundColor: form.province === province ? colors.primary : colors.surface }}><Text style={{ color: form.province === province ? '#FFFFFF' : colors.text }}>{province}</Text></TouchableOpacity>)}
        </View>
        <Text style={{ color: colors.text, fontWeight: "600" }}>Interests</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {interestChoices.map((interest) => <TouchableOpacity key={interest} accessibilityRole="button" accessibilityState={{ selected: form.interests.includes(interest) }} onPress={() => change("interests", form.interests.includes(interest) ? form.interests.filter((value) => value !== interest) : [...form.interests, interest])} style={{ padding: 10, borderRadius: 12, backgroundColor: form.interests.includes(interest) ? colors.primary : colors.surface }}><Text style={{ color: form.interests.includes(interest) ? '#FFFFFF' : colors.text }}>{interest}</Text></TouchableOpacity>)}
        </View>
        <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
          <Switch value={accepted} onValueChange={setAccepted} accessibilityLabel="Accept agreements" />
          <Text style={{ color: colors.textSecondary, flex: 1 }}>I accept the terms, privacy policy and safety guidelines.</Text>
        </View>
        {!!error && <Text accessibilityRole="alert" style={{ color: colors.error }}>{error}</Text>}
        <TouchableOpacity onPress={submit} disabled={busy} accessibilityRole="button" style={{ padding: 16, borderRadius: 12, backgroundColor: colors.primary, alignItems: "center", opacity: busy ? 0.5 : 1 }}>
          {busy ? <ActivityIndicator color="#FFFFFF" /> : <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>Create profile</Text>}
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.replace('/login')} accessibilityRole="button"><Text style={{ color: colors.primary, textAlign: 'center', padding: 12 }}>Already have an account? Sign in</Text></TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
