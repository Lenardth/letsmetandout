import { StatusBar } from "expo-status-bar";
import { Image, Linking, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useState } from "react";
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
  const [search, setSearch] = useState("");
  const transformed = transform(data);
  const items = (Array.isArray(transformed) ? transformed : []).filter((item) =>
    [getTitle(item, titleFields), item.location, item.bio, item.activity, ...(item.interests || [])]
      .filter(Boolean).join(" ").toLowerCase().includes(search.trim().toLowerCase())
  );

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

        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder={`Search ${title.toLowerCase()} or city`}
          placeholderTextColor={colors.textTertiary}
          accessibilityLabel={`Search ${title}`}
          style={{ padding: 14, backgroundColor: colors.surface, color: colors.text, borderRadius: 12, borderWidth: 1, borderColor: colors.border }}
        />
        {loading && <LoadingState />}
        {!loading && error && <ErrorState message={error} onRetry={refetch} />}
        {!loading && !error && items.length === 0 && (
          <EmptyState title={search ? "No matches" : emptyTitle} message={search ? "Try another name, city or interest." : emptyMessage} />
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
              {item.image && (
                <Image
                  source={{ uri: item.image }}
                  accessibilityLabel={item.imageDescription || getTitle(item, titleFields)}
                  resizeMode="cover"
                  style={{ width: "100%", height: 190, borderRadius: 10, backgroundColor: colors.border }}
                />
              )}
              <Text style={{ color: colors.text, fontFamily: "Inter_700Bold", fontSize: 18 }}>
                {getTitle(item, titleFields)}
              </Text>
              {item.imageCredit && <Text style={{ color: colors.textTertiary, fontSize: 11 }}>{item.imageCredit}</Text>}
              {item.interests && (
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
                  {item.interests.map((interest) => <Text key={interest} style={{ color: colors.primary, backgroundColor: colors.surfaceElevated, padding: 8, borderRadius: 12 }}>{interest}</Text>)}
                </View>
              )}
              {detailFields
                .filter((field) => field !== "interests" && field !== "source")
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
              {item.members && <Text style={{ color: colors.textSecondary }}>{item.members} members</Text>}
              {item.duration && <Text style={{ color: colors.textSecondary }}>Duration: {item.duration}</Text>}
              {item.source?.startsWith("https://") && (
                <TouchableOpacity accessibilityRole="link" onPress={() => Linking.openURL(item.source).catch(() => {})}>
                  <Text style={{ color: colors.primary, fontWeight: "600", paddingVertical: 8 }}>Visit official website ↗</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
      </ScrollView>
    </View>
  );
}
