import { StatusBar } from "expo-status-bar";
import { RefreshCw, Wallet } from "lucide-react-native";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { EmptyState, ErrorState, LoadingState } from "../../components/DataState";
import { useTheme } from "../../utils/theme";
import { useApiResource } from "../../utils/useApiResource";

export default function WalletScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { data, loading, error, refetch } = useApiResource("/wallet/summary", {
    initialData: { balance: 0, transactions: [] },
  });
  const transactions = Array.isArray(data?.transactions) ? data.transactions : [];
  const balance = Number(data?.balance || 0);

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
            <Text style={{ color: colors.text, fontFamily: "Inter_700Bold", fontSize: 28 }}>Wallet</Text>
            <Text style={{ color: colors.textSecondary, fontFamily: "Inter_400Regular", fontSize: 15 }}>
              Balance and transactions from the backend
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

        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: colors.border,
            padding: 20,
            gap: 12,
          }}
        >
          <Wallet size={24} color={colors.primary} />
          <Text style={{ color: colors.textSecondary, fontFamily: "Inter_600SemiBold", fontSize: 12 }}>
            CURRENT BALANCE
          </Text>
          <Text style={{ color: colors.text, fontFamily: "Inter_700Bold", fontSize: 36 }}>
            R{balance.toFixed(2)}
          </Text>
        </View>

        {loading && <LoadingState />}
        {!loading && error && <ErrorState message={error} onRetry={refetch} />}
        {!loading && !error && transactions.length === 0 && (
          <EmptyState
            title="No wallet transactions yet"
            message="Real wallet transactions will appear here once they are created in the backend."
          />
        )}

        {!loading &&
          !error &&
          transactions.map((transaction, index) => (
            <View
              key={transaction.id ?? index}
              style={{
                backgroundColor: colors.surface,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: colors.border,
                padding: 16,
                gap: 6,
              }}
            >
              <Text style={{ color: colors.text, fontFamily: "Inter_700Bold", fontSize: 17 }}>
                {transaction.description || transaction.transaction_type || `Transaction ${transaction.id}`}
              </Text>
              <Text style={{ color: colors.textSecondary, fontFamily: "Inter_400Regular", fontSize: 14 }}>
                Amount: R{Number(transaction.amount || 0).toFixed(2)}
              </Text>
              {transaction.status && (
                <Text style={{ color: colors.textSecondary, fontFamily: "Inter_400Regular", fontSize: 14 }}>
                  Status: {transaction.status}
                </Text>
              )}
            </View>
          ))}
      </ScrollView>
    </View>
  );
}
