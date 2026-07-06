import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { AlertCircle, RefreshCw } from "lucide-react-native";

import { useTheme } from "../utils/theme";

export function LoadingState({ label = "Loading data..." }) {
  const { colors } = useTheme();
  return (
    <View style={{ padding: 32, alignItems: "center", gap: 12 }}>
      <ActivityIndicator color={colors.primary} />
      <Text style={{ color: colors.textSecondary, fontFamily: "Inter_500Medium" }}>{label}</Text>
    </View>
  );
}

export function EmptyState({ title, message }) {
  const { colors } = useTheme();
  return (
    <View
      style={{
        padding: 24,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surface,
        gap: 8,
      }}
    >
      <Text style={{ color: colors.text, fontFamily: "Inter_700Bold", fontSize: 18 }}>{title}</Text>
      <Text style={{ color: colors.textSecondary, fontFamily: "Inter_400Regular", fontSize: 14 }}>
        {message}
      </Text>
    </View>
  );
}

export function ErrorState({ message, onRetry }) {
  const { colors } = useTheme();
  return (
    <View
      style={{
        padding: 24,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.error,
        backgroundColor: colors.surface,
        gap: 12,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <AlertCircle size={20} color={colors.error} />
        <Text style={{ color: colors.text, fontFamily: "Inter_700Bold", fontSize: 18 }}>Data unavailable</Text>
      </View>
      <Text style={{ color: colors.textSecondary, fontFamily: "Inter_400Regular", fontSize: 14 }}>
        {message}
      </Text>
      {onRetry && (
        <TouchableOpacity
          onPress={onRetry}
          style={{
            alignSelf: "flex-start",
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            backgroundColor: colors.primary,
            borderRadius: 8,
            paddingHorizontal: 14,
            paddingVertical: 10,
          }}
        >
          <RefreshCw size={16} color="#FFFFFF" />
          <Text style={{ color: "#FFFFFF", fontFamily: "Inter_600SemiBold" }}>Retry</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
