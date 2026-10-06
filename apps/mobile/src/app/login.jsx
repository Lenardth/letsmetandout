import { useState } from "react";
import { useRouter } from "expo-router";
import { ActivityIndicator, Image, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../utils/auth/useAuth";
import { useTheme } from "../utils/theme";
import { hasCompleteProfile } from "../utils/auth/profile";

export default function Login() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { login, resendVerification, resetPassword } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  async function recover(verify) {
    if (busy || !email.trim() || (verify && !password)) return;
    setBusy(true); setError(""); setNotice("");
    try {
      if (verify) await resendVerification(email.trim().toLowerCase(), password);
      else await resetPassword(email.trim().toLowerCase());
      setNotice(verify ? "Check your inbox for the verification email." : "If an account exists, check your inbox for password reset instructions.");
    } catch (failure) { setError(failure.message); }
    finally { setBusy(false); }
  }
  async function submit() {
    if (busy || !email.trim() || !password) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const result = await login(email.trim().toLowerCase(), password);
      if (result.success) router.replace(hasCompleteProfile(result.data.profile) ? '/(tabs)/discover' : '/complete-profile');
      else setError(typeof result.error === "string" ? result.error : "Please check your email and password.");
    } catch (failure) {
      setError(failure.message || "Could not sign in. Please try again.");
    } finally { setBusy(false); }
  }
  const input = { padding: 16, borderWidth: 1, borderColor: colors.border, borderRadius: 12, color: colors.text, backgroundColor: colors.surface };
  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.background }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 24, paddingTop: insets.top + 40, paddingBottom: insets.bottom + 24, gap: 18 }}>
        <Image source={require('../../assets/branding/safemeet-logo-v1.png')} resizeMode="contain" accessibilityLabel="SafeMeet logo" style={{ width: 240, height: 160, alignSelf: "center", backgroundColor: '#FFFFFF', borderRadius: 20 }} />
        <Text style={{ fontSize: 28, fontWeight: "700", color: colors.text }}>Welcome back</Text>
        <Text style={{ color: colors.textSecondary }}>Sign in to your SafeMeet account to continue.</Text>
        <TextInput style={input} value={email} onChangeText={setEmail} placeholder="Email address" placeholderTextColor={colors.textTertiary} accessibilityLabel="Email address" keyboardType="email-address" autoCapitalize="none" autoComplete="email" />
        <TextInput style={input} value={password} onChangeText={setPassword} placeholder="Password" placeholderTextColor={colors.textTertiary} accessibilityLabel="Password" secureTextEntry autoComplete="current-password" onSubmitEditing={submit} />
        {!!error && <Text accessibilityRole="alert" style={{ color: colors.error }}>{error}</Text>}
        {!!notice && <Text style={{ color: colors.textSecondary }}>{notice}</Text>}
        <TouchableOpacity onPress={submit} disabled={busy || !email.trim() || !password} accessibilityRole="button" style={{ padding: 16, borderRadius: 12, alignItems: "center", backgroundColor: colors.primary, opacity: busy || !email.trim() || !password ? 0.5 : 1 }}>
          {busy ? <ActivityIndicator color="#FFFFFF" /> : <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>Sign in</Text>}
        </TouchableOpacity>
        <TouchableOpacity disabled={busy} onPress={() => recover(false)} accessibilityRole="button"><Text style={{ color: colors.primary }}>Forgot password?</Text></TouchableOpacity>
        <TouchableOpacity disabled={busy} onPress={() => recover(true)} accessibilityRole="button"><Text style={{ color: colors.primary }}>Resend verification email</Text></TouchableOpacity>
        <TouchableOpacity onPress={() => router.replace('/signup')} accessibilityRole="button"><Text style={{ color: colors.primary, textAlign: 'center', padding: 12 }}>New here? Create your profile</Text></TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
