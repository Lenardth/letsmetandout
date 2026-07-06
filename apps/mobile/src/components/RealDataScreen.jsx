import { StatusBar } from "expo-status-bar";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { RefreshCw } from "lucide-react-native";

import { useTheme } from "../utils/theme";
import { useApiResource } from "../utils/useApiResource";
import { EmptyState, ErrorState, LoadingState } from "./DataState";

function valueToText(value) {
  if (value === null || value === undefined || value === "") return null;
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function getTitle(item, titleFields) {
  for (const field of titleFields) {
    const value = valueToText(item[field]);
    if (value) return value;
  }
  return `Record ${item.id ?? ""}`.trim();
}

export default function RealDataScreen({
  title,
  subtitle,
  endpoint,
  emptyTitle,
  emptyMessage,
  titleFields = ["name", "title", "description", "id"],
  detailFields = [],
  transform = (data) => data,
}) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { data, loading, error, refetch } = useApiResource(endpoint, { initialData: [] });
  const items = Array.isArray(transform(data)) ? transform(data) : [];

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
        <View style={{ gap: 8 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 16 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.text, fontFamily: "Inter_700Bold", fontSize: 28 }}>
                {title}
              </Text>
              <Text style={{ color: colors.textSecondary, fontFamily: "Inter_400Regular", fontSize: 15 }}>
                {subtitle}
              </Text>
            </View>
            <TouchableOpacity
              onPress={refetch}
              style={{
                width: 42,
                height: 42,
                borderRadius: 21,
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <RefreshCw size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {loading && <LoadingState />}
        {!loading && error && <ErrorState message={error} onRetry={refetch} />}
        {!loading && !error && items.length === 0 && (
          <EmptyState title={emptyTitle} message={emptyMessage} />
        )}

        {!loading &&
          !error &&
          items.map((item, index) => (
            <View
              key={item.id ?? index}
              style={{
                backgroundColor: colors.surface,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: colors.border,
                padding: 16,
                gap: 10,
              }}
            >
              <Text style={{ color: colors.text, fontFamily: "Inter_700Bold", fontSize: 18 }}>
                {getTitle(item, titleFields)}
              </Text>
              {detailFields
                .map((field) => [field, valueToText(item[field])])
                .filter(([, value]) => value)
                .map(([field, value]) => (
                  <View key={field} style={{ gap: 2 }}>
                    <Text
                      style={{
                        color: colors.textTertiary,
                        fontFamily: "Inter_600SemiBold",
                        fontSize: 11,
                        textTransform: "uppercase",
                      }}
                    >
                      {field.replace(/_/g, " ")}
                    </Text>
                    <Text style={{ color: colors.textSecondary, fontFamily: "Inter_400Regular", fontSize: 14 }}>
                      {value}
                    </Text>
                  </View>
                ))}
            </View>
          ))}
      </ScrollView>
    </View>
  );
}
