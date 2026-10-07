import { LinearGradient } from 'expo-linear-gradient';
import { router, useRouter } from 'expo-router';
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck, Sparkles } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../utils/auth/useAuth';
import { useTheme } from '../utils/theme';

export default function Login() {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { login, resendVerification, resetPassword } = useAuth();
  const navigation = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  async function recover(verify) {
    if (busy || !email.trim() || (verify && !password)) return;
    setBusy(true);
    setError('');
    setNotice('');
    try {
      if (verify) await resendVerification(email.trim().toLowerCase(), password);
      else await resetPassword(email.trim().toLowerCase());
      setNotice(verify ? 'Check your inbox for the verification email.' : 'If an account exists, check your inbox for password reset instructions.');
    } catch (failure) {
      setError(failure.message);
    } finally {
      setBusy(false);
    }
  }

  async function submit() {
    if (busy || !email.trim() || !password) return;
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const result = await login(email.trim().toLowerCase(), password);
      if (result.success) router.replace('/');
      else setError(typeof result.error === 'string' ? result.error : 'Please check your email and password.');
    } catch (failure) {
      setError(failure.message || 'Could not sign in. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  const muted = isDark ? 'rgba(255,255,255,0.68)' : '#667085';
  const card = isDark ? '#1B1B1F' : '#FFFFFF';
  const field = isDark ? '#24242A' : '#F8F9FC';
  const canSubmit = !!email.trim() && !!password && !busy;
  const inputStyle = {
    flex: 1,
    paddingVertical: 14,
    paddingRight: 12,
    color: colors.text,
    fontSize: 16,
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.background }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: insets.bottom + 24 }} showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={isDark ? ['#3A1428', '#17151B'] : ['#FFF0F5', '#F8F9FA']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ paddingTop: insets.top + 24, paddingHorizontal: 24, paddingBottom: 54, borderBottomLeftRadius: 38, borderBottomRightRadius: 38 }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View style={{ width: 42, height: 42, borderRadius: 14, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', shadowColor: '#FF3A79', shadowOpacity: 0.2, shadowRadius: 12, shadowOffset: { width: 0, height: 5 }, elevation: 4 }}>
              <Image source={require('../../assets/branding/safemeet-logo-v1.png')} resizeMode="contain" accessibilityLabel="SafeMeet logo" style={{ width: 32, height: 32 }} />
            </View>
            <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700', letterSpacing: -0.3 }}>SafeMeet</Text>
          </View>
          <View style={{ marginTop: 38, gap: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
              <Sparkles size={16} color={colors.primary} />
              <Text style={{ color: colors.primary, fontSize: 13, fontWeight: '700', letterSpacing: 0.8 }}>WELCOME BACK</Text>
            </View>
            <Text style={{ color: colors.text, fontSize: 34, lineHeight: 40, fontWeight: '700', letterSpacing: -1 }}>Good to see you{'\n'}again.</Text>
            <Text style={{ color: muted, fontSize: 16, lineHeight: 24 }}>Your next safe experience is just a sign in away.</Text>
          </View>
        </LinearGradient>

        <View style={{ marginTop: -28, marginHorizontal: 18, padding: 22, borderRadius: 26, backgroundColor: card, shadowColor: '#101828', shadowOpacity: isDark ? 0 : 0.12, shadowRadius: 24, shadowOffset: { width: 0, height: 10 }, elevation: 5, gap: 18 }}>
          <View style={{ gap: 5 }}>
            <Text style={{ color: colors.text, fontSize: 21, fontWeight: '700' }}>Sign in to continue</Text>
            <Text style={{ color: muted, fontSize: 14 }}>Use the email linked to your account.</Text>
          </View>

          <View style={{ gap: 8 }}>
            <Text style={{ color: colors.text, fontSize: 13, fontWeight: '600' }}>Email address</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', paddingLeft: 14, borderWidth: 1, borderColor: colors.border, borderRadius: 15, backgroundColor: field }}>
              <Mail size={19} color={muted} />
              <TextInput style={inputStyle} value={email} onChangeText={setEmail} placeholder="you@example.com" placeholderTextColor={colors.textTertiary} accessibilityLabel="Email address" keyboardType="email-address" autoCapitalize="none" autoComplete="email" />
            </View>
          </View>

          <View style={{ gap: 8 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ color: colors.text, fontSize: 13, fontWeight: '600' }}>Password</Text>
              <Pressable disabled={busy} onPress={() => recover(false)} accessibilityRole="button" hitSlop={8}>
                <Text style={{ color: colors.primary, fontSize: 13, fontWeight: '600' }}>Forgot password?</Text>
              </Pressable>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', paddingLeft: 14, borderWidth: 1, borderColor: colors.border, borderRadius: 15, backgroundColor: field }}>
              <LockKeyhole size={19} color={muted} />
              <TextInput style={inputStyle} value={password} onChangeText={setPassword} placeholder="Enter your password" placeholderTextColor={colors.textTertiary} accessibilityLabel="Password" secureTextEntry={!showPassword} autoComplete="current-password" onSubmitEditing={submit} />
              <Pressable onPress={() => setShowPassword((visible) => !visible)} accessibilityLabel={showPassword ? 'Hide password' : 'Show password'} accessibilityRole="button" hitSlop={10} style={{ padding: 14 }}>
                {showPassword ? <EyeOff size={19} color={muted} /> : <Eye size={19} color={muted} />}
              </Pressable>
            </View>
          </View>

          {!!error && <Text accessibilityRole="alert" style={{ color: colors.error, lineHeight: 20 }}>{error}</Text>}
          {!!notice && <Text style={{ color: colors.success, lineHeight: 20 }}>{notice}</Text>}

          <Pressable onPress={submit} disabled={!canSubmit} accessibilityRole="button" style={{ minHeight: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 9, backgroundColor: colors.primary, opacity: canSubmit ? 1 : 0.5 }}>
            {busy ? <ActivityIndicator color="#FFFFFF" /> : <><Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '700' }}>Sign in</Text><ArrowRight size={19} color="#FFFFFF" /></>}
          </Pressable>

          <Pressable disabled={busy} onPress={() => recover(true)} accessibilityRole="button" style={{ alignItems: 'center', paddingVertical: 2 }}>
            <Text style={{ color: muted, fontSize: 13 }}>Need a new verification email? <Text style={{ color: colors.primary, fontWeight: '600' }}>Resend it</Text></Text>
          </Pressable>
        </View>

        <View style={{ alignItems: 'center', gap: 12, marginTop: 28, paddingHorizontal: 24 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <ShieldCheck size={16} color={colors.success} />
            <Text style={{ color: muted, fontSize: 12 }}>Your account and data are kept secure</Text>
          </View>
          <Pressable onPress={() => navigation.replace('/signup')} accessibilityRole="button" style={{ flexDirection: 'row', alignItems: 'center', gap: 5, padding: 8 }}>
            <Text style={{ color: colors.text, fontSize: 14 }}>New to SafeMeet?</Text>
            <Text style={{ color: colors.primary, fontSize: 14, fontWeight: '700' }}>Create an account</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
