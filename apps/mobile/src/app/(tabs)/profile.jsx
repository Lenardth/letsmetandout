import ProfilePhoto from '../../components/ProfilePhoto';
import { StatusBar } from "expo-status-bar";
import { LogOut, RefreshCw } from "lucide-react-native";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { EmptyState, ErrorState, LoadingState } from "../../components/DataState";
import { useAuth } from "../../utils/auth/useAuth";
import { useTheme } from "../../utils/theme";
import { useApiResource } from "../../utils/useApiResource";
import { useRouter } from "expo-router";

import { useExperience } from "../../utils/experience";

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { mode } = useExperience();
  const { colors } = useTheme();
  const { auth, signOut } = useAuth();
  const { data, loading, error, refetch } = useApiResource("/auth/me", { initialData: null });
  const isSignedIn = !!auth;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style={colors.statusBar} />
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 24,
          paddingHorizontal: 20,
          paddingBottom: insets.bottom + 96,
          gap: 18,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 16 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.text, fontFamily: "Inter_700Bold", fontSize: 30, letterSpacing: -0.7 }}>Profile</Text>
            <Text style={{ color: colors.textSecondary, fontFamily: "Inter_400Regular", fontSize: 15 }}>
              Your SafeMeet profile
            </Text>
          </View>
          {isSignedIn && (
            <TouchableOpacity
              onPress={refetch}
              style={{
                width: 42,
                height: 42,
                borderRadius: 21,
                backgroundColor: colors.surfaceElevated,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <RefreshCw size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        {!isSignedIn && (
          <EmptyState
            title="No signed-in user"
            message="Log in with a SafeMeet account to see your profile data here."
          />
        )}

        {isSignedIn && loading && <LoadingState />}
        {isSignedIn && !loading && error && <ErrorState message={error} onRetry={refetch} />}
        {isSignedIn && !loading && !error && data && (
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: 22,
              borderWidth: 0,
              padding: 20,
              gap: 16,
              shadowColor: colors.shadow,
              shadowOpacity: colors.shadowOpacity,
              shadowRadius: 16,
              shadowOffset: { width: 0, height: 8 },
              elevation: 2,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <ProfilePhoto url={data.profile_photo_url} name={[data.first_name, data.last_name].filter(Boolean).join(' ')} size={64} backgroundColor={colors.primary} />
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.text, fontFamily: "Inter_700Bold", fontSize: 20 }}>
                  {[data.first_name, data.last_name].filter(Boolean).join(" ")}
                </Text>
                <Text style={{ color: colors.textSecondary, fontFamily: "Inter_400Regular", fontSize: 14 }}>
                  {data.email}
                </Text>
              </View>
            </View>

            {[
              ["Phone", data.phone],
              ["Location", [data.city, data.province].filter(Boolean).join(", ")],
              ["Verification", data.verification_level],
              ["Status", data.status],
              ["Interests", Array.isArray(data.interests) ? data.interests.join(", ") : null],
            ]
              .filter(([, value]) => value)
              .map(([label, value]) => (
                <View key={label} style={{ gap: 3 }}>
                  <Text style={{ color: colors.textTertiary, fontFamily: "Inter_600SemiBold", fontSize: 11 }}>
                    {label.toUpperCase()}
                  </Text>
                  <Text style={{ color: colors.textSecondary, fontFamily: "Inter_400Regular", fontSize: 14 }}>
                    {value}
                  </Text>
                </View>
              ))}

            <Text selectable style={{ color: colors.textSecondary }}>Member ID: {auth.user.id}</Text>
            <Text style={{ color: colors.textSecondary }}>Account type: {mode === 'provider' ? 'Service provider' : 'Customer'}</Text>
            <TouchableOpacity onPress={() => router.push('/complete-profile')} accessibilityRole="button">
              <Text style={{ color: colors.primary, paddingVertical: 12 }}>Edit profile & picture</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={signOut}
              style={{
                marginTop: 8,
                alignSelf: "flex-start",
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                backgroundColor: colors.error,
                borderRadius: 8,
                paddingHorizontal: 14,
                paddingVertical: 10,
              }}
            >
              <LogOut size={16} color="#FFFFFF" />
              <Text style={{ color: "#FFFFFF", fontFamily: "Inter_600SemiBold" }}>Sign out</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
