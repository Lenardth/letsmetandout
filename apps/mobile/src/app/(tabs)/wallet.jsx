import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import {
  AlertTriangle,
  ArrowDownLeft,
  Bell,
  Clock,
  Eye,
  EyeOff,
  Lock,
  Plus,
  Unlock,
  Users,
  Vote,
  Wallet,
  XCircle
} from "lucide-react-native";
import { useCallback, useState } from "react";
import {
  Alert,
  Modal,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../utils/theme";

export default function WalletScreen() {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showBalance, setShowBalance] = useState(true);
  const [addMoneyAmount, setAddMoneyAmount] = useState("");
  const [activeTab, setActiveTab] = useState("personal"); // personal, shared, pending
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

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

  // Enhanced wallet data with shared wallet features
  const walletData = {
    personal: {
      balance: 850.50,
      pendingRedemptions: 120.00,
      totalSpent: 2340.75,
      monthlyBudget: 1500.00,
    },
    shared: {
      totalBalance: 2450.75,
      yourContribution: 612.69,
      pendingApprovals: 3,
      activeGroups: 5,
    }
  };

  const sharedWallets = [
    {
      id: 1,
      groupName: "Cape Town Coffee Lovers",
      totalBalance: 480.00,
      yourContribution: 120.00,
      participants: 4,
      nextEvent: "Tomorrow, 2:00 PM",
      status: "active",
      pendingApprovals: 1,
      requiredApprovals: 3,
      escrowAmount: 480.00,
    },
    {
      id: 2,
      groupName: "Braai Masters JHB",
      totalBalance: 1250.00,
      yourContribution: 250.00,
      participants: 5,
      nextEvent: "Saturday, 4:00 PM",
      status: "locked",
      pendingApprovals: 0,
      requiredApprovals: 4,
      escrowAmount: 1250.00,
    },
    {
      id: 3,
      groupName: "Durban Hiking Squad",
      totalBalance: 720.75,
      yourContribution: 240.25,
      participants: 3,
      nextEvent: "Sunday, 8:00 AM",
      status: "pending_funds",
      pendingApprovals: 2,
      requiredApprovals: 2,
      escrowAmount: 480.50,
    },
  ];

  const pendingApprovals = [
    {
      id: 1,
      type: "payment",
      groupName: "Cape Town Coffee Lovers",
      amount: 75.00,
      description: "Coffee at Vida e Caffè",
      requestedBy: "Sarah M.",
      timeLeft: "2h 15m",
      approvals: 2,
      required: 3,
      status: "pending",
      receipt: "https://example.com/receipt1.jpg",
    },
    {
      id: 2,
      type: "withdrawal",
      groupName: "Braai Masters JHB",
      amount: 50.00,
      description: "Member withdrawal request",
      requestedBy: "Mandla K.",
      timeLeft: "1d 5h",
      approvals: 1,
      required: 4,
      status: "pending",
      penalty: 10.00,
    },
    {
      id: 3,
      type: "expense",
      groupName: "Durban Hiking Squad",
      amount: 180.00,
      description: "Hiking gear and transport",
      requestedBy: "Thabo M.",
      timeLeft: "4h 30m",
      approvals: 1,
      required: 2,
      status: "pending",
      receipt: "https://example.com/receipt2.jpg",
    },
  ];

  const recentTransactions = [
    {
      id: 1,
      type: "shared_expense",
      title: "Coffee at Vida e Caffè",
      groupName: "Cape Town Coffee Lovers",
      amount: 75.00,
      yourShare: 18.75,
      date: "2 hours ago",
      status: "approved",
      participants: 4,
      approvals: "4/4",
    },
    {
      id: 2,
      type: "contribution",
      title: "Added to Shared Wallet",
      groupName: "Braai Masters JHB",
      amount: 250.00,
      date: "Yesterday",
      status: "confirmed",
      escrowStatus: "locked",
    },
    {
      id: 3,
      type: "penalty",
      title: "Withdrawal Penalty",
      groupName: "Hiking Enthusiasts",
      amount: 20.00,
      date: "2 days ago",
      status: "deducted",
      reason: "Early withdrawal",
    },
    {
      id: 4,
      type: "refund",
      title: "Event Cancelled Refund",
      groupName: "Wine Tasting Club",
      amount: 150.00,
      date: "3 days ago",
      status: "completed",
      refundPercentage: 80,
    },
  ];

  const handleApproveTransaction = (transactionId, approve) => {
    Alert.alert(
      approve ? "Approve Transaction" : "Reject Transaction",
      approve 
        ? "Are you sure you want to approve this transaction?"
        : "Are you sure you want to reject this transaction?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: approve ? "Approve" : "Reject", 
          style: approve ? "default" : "destructive",
          onPress: () => {
            // Handle approval/rejection logic
            setShowApprovalModal(false);
          }
        },
      ]
    );
  };

  const renderApprovalModal = () => (
    <Modal
      visible={showApprovalModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowApprovalModal(false)}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.5)",
          justifyContent: "flex-end",
        }}
      >
        <View
          style={{
            backgroundColor: colors.background,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            padding: 20,
            paddingBottom: insets.bottom + 20,
          }}
        >
          {selectedTransaction && (
            <>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 20,
                }}
              >
                <Text
                  style={{
                    fontFamily: "Inter_600SemiBold",
                    fontSize: 20,
                    color: colors.text,
                  }}
                >
                  Approval Required
                </Text>
                <TouchableOpacity onPress={() => setShowApprovalModal(false)}>
                  <XCircle size={24} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <View
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: 16,
                  padding: 16,
                  marginBottom: 20,
                }}
              >
                <Text
                  style={{
                    fontFamily: "Inter_600SemiBold",
                    fontSize: 18,
                    color: colors.text,
                    marginBottom: 8,
                  }}
                >
                  {selectedTransaction.description}
                </Text>
                <Text
                  style={{
                    fontFamily: "Inter_400Regular",
                    fontSize: 14,
                    color: colors.textSecondary,
                    marginBottom: 12,
                  }}
                >
                  {selectedTransaction.groupName} • Requested by {selectedTransaction.requestedBy}
                </Text>
                
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    marginBottom: 12,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "Inter_500Medium",
                      fontSize: 16,
                      color: colors.text,
                    }}
                  >
                    Amount:
                  </Text>
                  <Text
                    style={{
                      fontFamily: "Inter_700Bold",
                      fontSize: 18,
                      color: colors.primary,
                    }}
                  >
                    R {selectedTransaction.amount.toFixed(2)}
                  </Text>
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
                      fontFamily: "Inter_500Medium",
                      fontSize: 14,
                      color: colors.textSecondary,
                    }}
                  >
                    Approvals:
                  </Text>
                  <Text
                    style={{
                      fontFamily: "Inter_600SemiBold",
                      fontSize: 14,
                      color: colors.textSecondary,
                    }}
                  >
                    {selectedTransaction.approvals}/{selectedTransaction.required}
                  </Text>
                </View>

                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "Inter_500Medium",
                      fontSize: 14,
                      color: colors.textSecondary,
                    }}
                  >
                    Time Left:
                  </Text>
                  <Text
                    style={{
                      fontFamily: "Inter_600SemiBold",
                      fontSize: 14,
                      color: colors.warning,
                    }}
                  >
                    {selectedTransaction.timeLeft}
                  </Text>
                </View>
              </View>

              <View
                style={{
                  flexDirection: "row",
                  gap: 12,
                }}
              >
                <TouchableOpacity
                  onPress={() => handleApproveTransaction(selectedTransaction.id, false)}
                  style={{
                    flex: 1,
                    backgroundColor: colors.error,
                    borderRadius: 12,
                    paddingVertical: 16,
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
                    Reject
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleApproveTransaction(selectedTransaction.id, true)}
                  style={{
                    flex: 1,
                    backgroundColor: colors.success,
                    borderRadius: 12,
                    paddingVertical: 16,
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
                    Approve
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );

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
            {walletData.shared.pendingApprovals > 0 && (
              <TouchableOpacity
                onPress={() => setActiveTab("pending")}
                style={{
                  backgroundColor: colors.warning,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 16,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <Bell size={16} color="#FFFFFF" />
                <Text
                  style={{
                    fontFamily: "Inter_600SemiBold",
                    fontSize: 12,
                    color: "#FFFFFF",
                  }}
                >
                  {walletData.shared.pendingApprovals}
                </Text>
              </TouchableOpacity>
            )}
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

        {/* Tab Navigation */}
        <View
          style={{
            flexDirection: "row",
            backgroundColor: colors.surfaceElevated,
            borderRadius: 12,
            padding: 4,
            marginTop: 16,
          }}
        >
          {[
            { key: "personal", title: "Personal", icon: Wallet },
            { key: "shared", title: "Shared", icon: Users },
            { key: "pending", title: "Pending", icon: Clock },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              style={{
                flex: 1,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                paddingVertical: 8,
                paddingHorizontal: 12,
                borderRadius: 8,
                backgroundColor: activeTab === tab.key ? colors.primary : "transparent",
                gap: 6,
              }}
            >
              <tab.icon 
                size={16} 
                color={activeTab === tab.key ? "#FFFFFF" : colors.textSecondary} 
              />
              <Text
                style={{
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 14,
                  color: activeTab === tab.key ? "#FFFFFF" : colors.textSecondary,
                }}
              >
                {tab.title}
              </Text>
              {tab.key === "pending" && walletData.shared.pendingApprovals > 0 && (
                <View
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: 9,
                    backgroundColor: colors.error,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "Inter_600SemiBold",
                      fontSize: 10,
                      color: "#FFFFFF",
                    }}
                  >
                    {walletData.shared.pendingApprovals}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: insets.top + 140,
          paddingBottom: insets.bottom + 20,
        }}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Personal Wallet Tab */}
        {activeTab === "personal" && (
          <>
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
                      Personal Balance
                    </Text>
                    <Text
                      style={{
                        fontFamily: "Inter_700Bold",
                        fontSize: 36,
                        color: "#FFFFFF",
                      }}
                    >
                      {showBalance ? `R ${walletData.personal.balance.toFixed(2)}` : "R •••••"}
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
                      {showBalance ? `R ${walletData.personal.pendingRedemptions.toFixed(2)}` : "R ••••"}
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
                      {showBalance ? `R ${walletData.personal.totalSpent.toFixed(2)}` : "R ••••"}
                    </Text>
                  </View>
                </View>
              </LinearGradient>
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
          </>
        )}

        {/* Shared Wallet Tab */}
        {activeTab === "shared" && (
          <>
            {/* Shared Balance Overview */}
            <View
              style={{
                marginHorizontal: 20,
                marginBottom: 24,
              }}
            >
              <LinearGradient
                colors={[colors.success, "#4CAF50"]}
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
                      Total Shared Balance
                    </Text>
                    <Text
                      style={{
                        fontFamily: "Inter_700Bold",
                        fontSize: 36,
                        color: "#FFFFFF",
                      }}
                    >
                      {showBalance ? `R ${walletData.shared.totalBalance.toFixed(2)}` : "R •••••"}
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
                    <Users size={24} color="#FFFFFF" />
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
                      Your Contribution
                    </Text>
                    <Text
                      style={{
                        fontFamily: "Inter_600SemiBold",
                        fontSize: 16,
                        color: "#FFFFFF",
                      }}
                    >
                      {showBalance ? `R ${walletData.shared.yourContribution.toFixed(2)}` : "R ••••"}
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
                      Active Groups
                    </Text>
                    <Text
                      style={{
                        fontFamily: "Inter_600SemiBold",
                        fontSize: 16,
                        color: "#FFFFFF",
                      }}
                    >
                      {walletData.shared.activeGroups}
                    </Text>
                  </View>
                </View>
              </LinearGradient>
            </View>

            {/* Shared Wallets List */}
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
                Group Wallets
              </Text>

              {sharedWallets.map((wallet) => (
                <View
                  key={wallet.id}
                  style={{
                    backgroundColor: colors.surface,
                    borderRadius: 16,
                    padding: 16,
                    marginBottom: 12,
                    borderWidth: isDark ? 1 : 0,
                    borderColor: colors.border,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: 12,
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontFamily: "Inter_600SemiBold",
                          fontSize: 16,
                          color: colors.text,
                          marginBottom: 4,
                        }}
                      >
                        {wallet.groupName}
                      </Text>
                      <Text
                        style={{
                          fontFamily: "Inter_400Regular",
                          fontSize: 14,
                          color: colors.textSecondary,
                          marginBottom: 8,
                        }}
                      >
                        {wallet.participants} participants • {wallet.nextEvent}
                      </Text>
                    </View>
                    <View
                      style={{
                        backgroundColor: 
                          wallet.status === "active" ? colors.success :
                          wallet.status === "locked" ? colors.warning :
                          colors.error,
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        borderRadius: 8,
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      {wallet.status === "locked" ? (
                        <Lock size={12} color="#FFFFFF" />
                      ) : wallet.status === "active" ? (
                        <Unlock size={12} color="#FFFFFF" />
                      ) : (
                        <Clock size={12} color="#FFFFFF" />
                      )}
                      <Text
                        style={{
                          fontFamily: "Inter_600SemiBold",
                          fontSize: 10,
                          color: "#FFFFFF",
                        }}
                      >
                        {wallet.status.toUpperCase()}
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
                    <View>
                      <Text
                        style={{
                          fontFamily: "Inter_400Regular",
                          fontSize: 12,
                          color: colors.textSecondary,
                          marginBottom: 2,
                        }}
                      >
                        Total Balance
                      </Text>
                      <Text
                        style={{
                          fontFamily: "Inter_700Bold",
                          fontSize: 18,
                          color: colors.text,
                        }}
                      >
                        R {wallet.totalBalance.toFixed(2)}
                      </Text>
                    </View>
                    <View>
                      <Text
                        style={{
                          fontFamily: "Inter_400Regular",
                          fontSize: 12,
                          color: colors.textSecondary,
                          marginBottom: 2,
                        }}
                      >
                        Your Share
                      </Text>
                      <Text
                        style={{
                          fontFamily: "Inter_600SemiBold",
                          fontSize: 16,
                          color: colors.primary,
                        }}
                      >
                        R {wallet.yourContribution.toFixed(2)}
                      </Text>
                    </View>
                  </View>

                  {wallet.pendingApprovals > 0 && (
                    <View
                      style={{
                        backgroundColor: colors.warning + "20",
                        borderRadius: 8,
                        padding: 8,
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <Vote size={16} color={colors.warning} />
                      <Text
                        style={{
                          fontFamily: "Inter_500Medium",
                          fontSize: 12,
                          color: colors.warning,
                        }}
                      >
                        {wallet.pendingApprovals} pending approval(s)
                      </Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          </>
        )}

        {/* Pending Approvals Tab */}
        {activeTab === "pending" && (
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
              Pending Approvals
            </Text>

            {pendingApprovals.map((approval) => (
              <TouchableOpacity
                key={approval.id}
                onPress={() => {
                  setSelectedTransaction(approval);
                  setShowApprovalModal(true);
                }}
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: 16,
                  padding: 16,
                  marginBottom: 12,
                  borderWidth: isDark ? 1 : 0,
                  borderColor: colors.border,
                  borderLeftWidth: 4,
                  borderLeftColor: 
                    approval.type === "payment" ? colors.primary :
                    approval.type === "withdrawal" ? colors.error :
                    colors.warning,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: 8,
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontFamily: "Inter_600SemiBold",
                        fontSize: 16,
                        color: colors.text,
                        marginBottom: 4,
                      }}
                    >
                      {approval.description}
                    </Text>
                    <Text
                      style={{
                        fontFamily: "Inter_400Regular",
                        fontSize: 14,
                        color: colors.textSecondary,
                        marginBottom: 4,
                      }}
                    >
                      {approval.groupName} • by {approval.requestedBy}
                    </Text>
                  </View>
                  <Text
                    style={{
                      fontFamily: "Inter_700Bold",
                      fontSize: 18,
                      color: 
                        approval.type === "withdrawal" ? colors.error : colors.primary,
                    }}
                  >
                    {approval.type === "withdrawal" ? "-" : ""}R {approval.amount.toFixed(2)}
                  </Text>
                </View>

                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <View
                      style={{
                        backgroundColor: colors.primary + "20",
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        borderRadius: 8,
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: "Inter_600SemiBold",
                          fontSize: 10,
                          color: colors.primary,
                        }}
                      >
                        {approval.approvals}/{approval.required} APPROVED
                      </Text>
                    </View>
                    <Text
                      style={{
                        fontFamily: "Inter_500Medium",
                        fontSize: 12,
                        color: colors.warning,
                      }}
                    >
                      {approval.timeLeft} left
                    </Text>
                  </View>
                  <ChevronRight size={20} color={colors.textSecondary} />
                </View>

                {approval.penalty && (
                  <View
                    style={{
                      marginTop: 8,
                      backgroundColor: colors.error + "20",
                      borderRadius: 8,
                      padding: 8,
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <AlertTriangle size={16} color={colors.error} />
                    <Text
                      style={{
                        fontFamily: "Inter_500Medium",
                        fontSize: 12,
                        color: colors.error,
                      }}
                    >
                      20% penalty: R {approval.penalty.toFixed(2)}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

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
              <View
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
                      transaction.type === "contribution" || transaction.type === "refund"
                        ? colors.success
                        : transaction.type === "penalty"
                        ? colors.error
                        : colors.primary,
                    justifyContent: "center",
                    alignItems: "center",
                    marginRight: 12,
                  }}
                >
                  {transaction.type === "contribution" || transaction.type === "refund" ? (
                    <ArrowDownLeft size={20} color="#FFFFFF" />
                  ) : transaction.type === "penalty" ? (
                    <AlertTriangle size={20} color="#FFFFFF" />
                  ) : (
                    <Users size={20} color="#FFFFFF" />
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
                      {transaction.approvals && ` • ${transaction.approvals} approved`}
                      {transaction.yourShare && ` • Your share: R${transaction.yourShare.toFixed(2)}`}
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
                          transaction.status === "completed" || transaction.status === "approved" || transaction.status === "confirmed"
                            ? colors.success
                            : transaction.status === "pending"
                            ? colors.warning
                            : colors.error,
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
                      transaction.type === "contribution" || transaction.type === "refund"
                        ? colors.success
                        : transaction.type === "penalty"
                        ? colors.error
                        : colors.text,
                  }}
                >
                  {transaction.type === "contribution" || transaction.type === "refund" ? "+" : "-"}R {transaction.amount.toFixed(2)}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {renderApprovalModal()}
    </View>
  );
}
