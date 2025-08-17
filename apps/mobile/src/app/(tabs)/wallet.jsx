import { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  TextInput,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import {
  Wallet,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  CreditCard,
  DollarSign,
  Users,
  Calendar,
  TrendingUp,
  Settings,
  Eye,
  EyeOff,
} from "lucide-react-native";
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import { useTheme } from "../../utils/theme";

export default function WalletScreen() {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showBalance, setShowBalance] = useState(true);
  const [addMoneyAmount, setAddMoneyAmount] = useState("");

  const [loaded, error] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const handleScroll = useCallback((event) => {
    const scrollY = event.nativeEvent.contentOffset.y;
    setIsScrolled(scrollY > 0);
  }, []);

  // Mock wallet data
  const walletData = {
    balance: 850.50,
    pendingRedemptions: 120.00,
    totalSpent: 2340.75,
    monthlyBudget: 1500.00,
  };

  const recentTransactions = [
    {
      id: 1,
      type: "expense",
      title: "Coffee at Vida e Caffè",
      groupName: "Cape Town Coffee Lovers",
      amount: 75.00,
      date: "2 hours ago",
      status: "completed",
      participants: 4,
    },
    {
      id: 2,
      type: "income",
      title: "Added Money",
      amount: 200.00,
      date: "Yesterday",
      status: "completed",
    },
    {
      id: 3,
      type: "expense",
      title: "Braai at Kirstenbosch",
      groupName: "Braai Masters JHB",
      amount: 180.00,
      date: "2 days ago",
      status: "pending",
      participants: 5,
    },
    {
      id: 4,
      type: "expense",
      title: "Hiking gear rental",
      groupName: "Durban Hiking Squad",
      amount: 95.00,
      date: "3 days ago",
      status: "completed",
      participants: 3,
    },
  ];

  const quickActions = [
    { id: 1, title: "Add Money", icon: Plus, color: colors.success },
    { id: 2, title: "Request Split", icon: Users, color: colors.primary },
    { id: 3, title: "View History", icon: Calendar, color: colors.info },
    { id: 4, title: "Settings", icon: Settings, color: colors.textSecondary },
  ];

  if (!loaded && !error) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <StatusBar style={colors.statusBar} />
        <Text style={{ color: colors.textSecondary }}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style={colors.statusBar} />

      {/* Fixed Header */}
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          backgroundColor: colors.background,
          paddingTop: insets.top + 20,
          paddingHorizontal: 20,
          paddingBottom: 20,
          borderBottomWidth: isScrolled ? 1 : 0,
          borderBottomColor: colors.border,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              fontFamily: "Inter_600SemiBold",
              fontSize: 28,
              color: colors.text,
            }}
          >
            Wallet
          </Text>
          <View style={{ flexDirection: "row", gap: 12 }}>
            <TouchableOpacity
              onPress={() => setShowBalance(!showBalance)}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: colors.surfaceElevated,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {showBalance ? (
                <Eye size={20} color={colors.textSecondary} />
              ) : (
                <EyeOff size={20} color={colors.textSecondary} />
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: colors.primary,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Plus size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: insets.top + 88,
          paddingBottom: insets.bottom + 20,
        }}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Balance Card */}
        <View
          style={{
            marginHorizontal: 20,
            marginBottom: 24,
          }}
        >
          <LinearGradient
            colors={[colors.primary, colors.primaryLight]}
            style={{
              borderRadius: 20,
              padding: 24,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: 20,
              }}
            >
              <View>
                <Text
                  style={{
                    fontFamily: "Inter_400Regular",
                    fontSize: 14,
                    color: "rgba(255,255,255,0.8)",
                    marginBottom: 8,
                  }}
                >
                  Available Balance
                </Text>
                <Text
                  style={{
                    fontFamily: "Inter_700Bold",
                    fontSize: 36,
                    color: "#FFFFFF",
                  }}
                >
                  {showBalance ? `R ${walletData.balance.toFixed(2)}` : "R •••••"}
                </Text>
              </View>
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: "rgba(255,255,255,0.2)",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Wallet size={24} color="#FFFFFF" />
              </View>
            </View>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <View>
                <Text
                  style={{
                    fontFamily: "Inter_400Regular",
                    fontSize: 12,
                    color: "rgba(255,255,255,0.7)",
                    marginBottom: 4,
                  }}
                >
                  Pending
                </Text>
                <Text
                  style={{
                    fontFamily: "Inter_600SemiBold",
                    fontSize: 16,
                    color: "#FFFFFF",
                  }}
                >
                  {showBalance ? `R ${walletData.pendingRedemptions.toFixed(2)}` : "R ••••"}
                </Text>
              </View>
              <View>
                <Text
                  style={{
                    fontFamily: "Inter_400Regular",
                    fontSize: 12,
                    color: "rgba(255,255,255,0.7)",
                    marginBottom: 4,
                  }}
                >
                  This Month
                </Text>
                <Text
                  style={{
                    fontFamily: "Inter_600SemiBold",
                    fontSize: 16,
                    color: "#FFFFFF",
                  }}
                >
                  {showBalance ? `R ${walletData.totalSpent.toFixed(2)}` : "R ••••"}
                </Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Quick Actions */}
        <View
          style={{
            marginHorizontal: 20,
            marginBottom: 24,
          }}
        >
          <Text
            style={{
              fontFamily: "Inter_600SemiBold",
              fontSize: 18,
              color: colors.text,
              marginBottom: 16,
            }}
          >
            Quick Actions
          </Text>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: 16,
                  padding: 16,
                  alignItems: "center",
                  flex: 1,
                  marginHorizontal: 4,
                  borderWidth: isDark ? 1 : 0,
                  borderColor: colors.border,
                }}
              >
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: action.color,
                    justifyContent: "center",
                    alignItems: "center",
                    marginBottom: 8,
                  }}
                >
                  <action.icon size={20} color="#FFFFFF" />
                </View>
                <Text
                  style={{
                    fontFamily: "Inter_500Medium",
                    fontSize: 12,
                    color: colors.text,
                    textAlign: "center",
                  }}
                >
                  {action.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Add Money Section */}
        <View
          style={{
            marginHorizontal: 20,
            marginBottom: 24,
            backgroundColor: colors.surface,
            borderRadius: 16,
            padding: 20,
            borderWidth: isDark ? 1 : 0,
            borderColor: colors.border,
          }}
        >
          <Text
            style={{
              fontFamily: "Inter_600SemiBold",
              fontSize: 18,
              color: colors.text,
              marginBottom: 16,
            }}
          >
            Add Money
          </Text>

          <View
            style={{
              flexDirection: "row",
              marginBottom: 16,
              gap: 12,
            }}
          >
            {[100, 200, 500, 1000].map((amount) => (
              <TouchableOpacity
                key={amount}
                onPress={() => setAddMoneyAmount(amount.toString())}
                style={{
                  backgroundColor:
                    addMoneyAmount === amount.toString()
                      ? colors.primary
                      : colors.surfaceElevated,
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 12,
                  flex: 1,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontFamily: "Inter_600SemiBold",
                    fontSize: 14,
                    color:
                      addMoneyAmount === amount.toString()
                        ? "#FFFFFF"
                        : colors.text,
                  }}
                >
                  R{amount}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: colors.surfaceElevated,
              borderRadius: 12,
              paddingHorizontal: 16,
              marginBottom: 16,
            }}
          >
            <DollarSign size={20} color={colors.textSecondary} />
            <TextInput
              value={addMoneyAmount}
              onChangeText={setAddMoneyAmount}
              placeholder="Enter amount"
              placeholderTextColor={colors.textTertiary}
              style={{
                flex: 1,
                paddingVertical: 12,
                paddingHorizontal: 8,
                fontFamily: "Inter_500Medium",
                fontSize: 16,
                color: colors.text,
              }}
              keyboardType="numeric"
            />
          </View>

          <TouchableOpacity
            style={{
              backgroundColor: colors.primary,
              borderRadius: 12,
              paddingVertical: 12,
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontFamily: "Inter_600SemiBold",
                fontSize: 16,
                color: "#FFFFFF",
              }}
            >
              Add Money
            </Text>
          </TouchableOpacity>
        </View>

        {/* Monthly Budget Progress */}
        <View
          style={{
            marginHorizontal: 20,
            marginBottom: 24,
            backgroundColor: colors.surface,
            borderRadius: 16,
            padding: 20,
            borderWidth: isDark ? 1 : 0,
            borderColor: colors.border,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <Text
              style={{
                fontFamily: "Inter_600SemiBold",
                fontSize: 16,
                color: colors.text,
              }}
            >
              Monthly Budget
            </Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <TrendingUp size={16} color={colors.success} />
              <Text
                style={{
                  fontFamily: "Inter_500Medium",
                  fontSize: 14,
                  color: colors.success,
                  marginLeft: 4,
                }}
              >
                On track
              </Text>
            </View>
          </View>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: 12,
            }}
          >
            <Text
              style={{
                fontFamily: "Inter_400Regular",
                fontSize: 14,
                color: colors.textSecondary,
              }}
            >
              R {walletData.totalSpent.toFixed(2)} of R {walletData.monthlyBudget.toFixed(2)}
            </Text>
            <Text
              style={{
                fontFamily: "Inter_600SemiBold",
                fontSize: 14,
                color: colors.textSecondary,
              }}
            >
              {Math.round((walletData.totalSpent / walletData.monthlyBudget) * 100)}%
            </Text>
          </View>

          <View
            style={{
              height: 8,
              backgroundColor: colors.border,
              borderRadius: 4,
              overflow: "hidden",
            }}
          >
            <View
              style={{
                height: "100%",
                width: `${Math.min((walletData.totalSpent / walletData.monthlyBudget) * 100, 100)}%`,
                backgroundColor: colors.success,
              }}
            />
          </View>
        </View>

        {/* Recent Transactions */}
        <View
          style={{
            marginHorizontal: 20,
            marginBottom: 24,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <Text
              style={{
                fontFamily: "Inter_600SemiBold",
                fontSize: 18,
                color: colors.text,
              }}
            >
              Recent Transactions
            </Text>
            <TouchableOpacity>
              <Text
                style={{
                  fontFamily: "Inter_500Medium",
                  fontSize: 14,
                  color: colors.primary,
                }}
              >
                View All
              </Text>
            </TouchableOpacity>
          </View>

          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: 16,
              borderWidth: isDark ? 1 : 0,
              borderColor: colors.border,
            }}
          >
            {recentTransactions.map((transaction, index) => (
              <TouchableOpacity
                key={transaction.id}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  padding: 16,
                  borderBottomWidth: index < recentTransactions.length - 1 ? 1 : 0,
                  borderBottomColor: colors.divider,
                }}
              >
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor:
                      transaction.type === "income"
                        ? colors.success
                        : colors.primary,
                    justifyContent: "center",
                    alignItems: "center",
                    marginRight: 12,
                  }}
                >
                  {transaction.type === "income" ? (
                    <ArrowDownLeft size={20} color="#FFFFFF" />
                  ) : (
                    <ArrowUpRight size={20} color="#FFFFFF" />
                  )}
                </View>

                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontFamily: "Inter_600SemiBold",
                      fontSize: 16,
                      color: colors.text,
                      marginBottom: 2,
                    }}
                  >
                    {transaction.title}
                  </Text>
                  {transaction.groupName && (
                    <Text
                      style={{
                        fontFamily: "Inter_400Regular",
                        fontSize: 14,
                        color: colors.textSecondary,
                        marginBottom: 2,
                      }}
                    >
                      {transaction.groupName}
                      {transaction.participants && ` • ${transaction.participants} people`}
                    </Text>
                  )}
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: "Inter_400Regular",
                        fontSize: 12,
                        color: colors.textTertiary,
                      }}
                    >
                      {transaction.date}
                    </Text>
                    <View
                      style={{
                        width: 4,
                        height: 4,
                        borderRadius: 2,
                        backgroundColor: colors.textTertiary,
                        marginHorizontal: 8,
                      }}
                    />
                    <Text
                      style={{
                        fontFamily: "Inter_500Medium",
                        fontSize: 12,
                        color:
                          transaction.status === "completed"
                            ? colors.success
                            : colors.warning,
                      }}
                    >
                      {transaction.status}
                    </Text>
                  </View>
                </View>

                <Text
                  style={{
                    fontFamily: "Inter_600SemiBold",
                    fontSize: 16,
                    color:
                      transaction.type === "income"
                        ? colors.success
                        : colors.text,
                  }}
                >
                  {transaction.type === "income" ? "+" : "-"}R {transaction.amount.toFixed(2)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}