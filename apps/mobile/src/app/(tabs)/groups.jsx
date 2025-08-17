import { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import {
  Users,
  Plus,
  MapPin,
  Calendar,
  Clock,
  MessageCircle,
  ChevronRight,
  Coffee,
  Utensils,
  Mountain,
  Filter,
  Search,
  Shield,
  AlertTriangle,
  DollarSign,
  UserMinus,
  UserPlus,
  Lock,
  Unlock,
  CheckCircle,
  XCircle,
  Eye,
  Settings,
  Star,
  TrendingUp,
  TrendingDown,
  Percent,
  Calculator,
  CreditCard,
  Wallet,
  Bell,
  Info,
} from "lucide-react-native";
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import { useTheme } from "../../utils/theme";

export default function GroupsScreen() {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const [isScrolled, setIsScrolled] = useState(false);
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [withdrawalAmount, setWithdrawalAmount] = useState("");
  const [withdrawalReason, setWithdrawalReason] = useState("");

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

  const calculatePenalty = (amount, daysBeforeEvent) => {
    // 20% penalty for withdrawals
    const basePenalty = amount * 0.2;
    
    // Additional penalty based on timing
    if (daysBeforeEvent <= 1) {
      return basePenalty * 1.5; // 30% penalty for last-minute withdrawals
    } else if (daysBeforeEvent <= 3) {
      return basePenalty * 1.2; // 24% penalty for short notice
    }
    
    return basePenalty; // 20% standard penalty
  };

  const handleWithdrawal = () => {
    if (!withdrawalAmount || !selectedGroup) return;
    
    const amount = parseFloat(withdrawalAmount);
    const penalty = calculatePenalty(amount, selectedGroup.daysUntilEvent);
    const netAmount = amount - penalty;
    
    Alert.alert(
      "Confirm Withdrawal",
      `Withdrawal: R${amount.toFixed(2)}\nPenalty (20%): R${penalty.toFixed(2)}\nYou'll receive: R${netAmount.toFixed(2)}\n\nThis action requires group approval.`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Request Withdrawal", 
          style: "destructive",
          onPress: () => {
            // Submit withdrawal request
            setShowWithdrawalModal(false);
            setWithdrawalAmount("");
            setWithdrawalReason("");
          }
        },
      ]
    );
  };

  const groups = [
    {
      id: 1,
      name: "Cape Town Coffee Lovers",
      activity: "Coffee & Chat",
      members: 4,
      maxMembers: 5,
      nextMeetup: "Tomorrow, 2:00 PM",
      location: "V&A Waterfront",
      budget: "R120",
      yourContribution: 120.00,
      totalPool: 480.00,
      daysUntilEvent: 1,
      host: {
        name: "Sarah",
        avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b2c5?w=40&h=40&fit=crop&crop=face",
        verified: true,
        rating: 4.8,
      },
      memberAvatars: [
        "https://images.unsplash.com/photo-1494790108755-2616b612b2c5?w=30&h=30&fit=crop&crop=face",
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=30&h=30&fit=crop&crop=face",
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=30&h=30&fit=crop&crop=face",
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=30&h=30&fit=crop&crop=face",
      ],
      status: "active",
      category: "coffee",
      safetyScore: 95,
      escrowStatus: "locked",
      withdrawalPolicy: "20% penalty, requires 3/4 approval",
      recentWithdrawals: 0,
      trustScore: 98,
    },
    {
      id: 2,
      name: "Braai Masters JHB",
      activity: "Weekend Braai",
      members: 5,
      maxMembers: 5,
      nextMeetup: "Saturday, 4:00 PM",
      location: "Johannesburg North",
      budget: "R250",
      yourContribution: 250.00,
      totalPool: 1250.00,
      daysUntilEvent: 3,
      host: {
        name: "Mandla",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
        verified: true,
        rating: 4.9,
      },
      memberAvatars: [
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=30&h=30&fit=crop&crop=face",
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=30&h=30&fit=crop&crop=face",
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=30&h=30&fit=crop&crop=face",
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=30&h=30&fit=crop&crop=face",
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=30&h=30&fit=crop&crop=face",
      ],
      status: "full",
      category: "food",
      safetyScore: 92,
      escrowStatus: "locked",
      withdrawalPolicy: "20% penalty, requires 4/5 approval",
      recentWithdrawals: 1,
      trustScore: 94,
    },
    {
      id: 3,
      name: "Durban Hiking Squad",
      activity: "Table Mountain Hike",
      members: 3,
      maxMembers: 4,
      nextMeetup: "Sunday, 8:00 AM",
      location: "Table Mountain, Cape Town",
      budget: "R180",
      yourContribution: 180.00,
      totalPool: 540.00,
      daysUntilEvent: 5,
      host: {
        name: "Priya",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face",
        verified: true,
        rating: 4.7,
      },
      memberAvatars: [
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=30&h=30&fit=crop&crop=face",
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=30&h=30&fit=crop&crop=face",
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=30&h=30&fit=crop&crop=face",
      ],
      status: "active",
      category: "outdoor",
      safetyScore: 88,
      escrowStatus: "pending",
      withdrawalPolicy: "20% penalty, requires 2/3 approval",
      recentWithdrawals: 0,
      trustScore: 91,
    },
  ];

  const filters = [
    { key: "all", title: "All Groups", count: groups.length },
    { key: "active", title: "Active", count: groups.filter(g => g.status === "active").length },
    { key: "full", title: "Full", count: groups.filter(g => g.status === "full").length },
    { key: "pending", title: "Pending", count: groups.filter(g => g.escrowStatus === "pending").length },
  ];

  const renderWithdrawalModal = () => (
    <Modal
      visible={showWithdrawalModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowWithdrawalModal(false)}
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
            maxHeight: "80%",
          }}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
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
                Request Withdrawal
              </Text>
              <TouchableOpacity onPress={() => setShowWithdrawalModal(false)}>
                <XCircle size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {selectedGroup && (
              <>
                {/* Group Info */}
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
                      fontSize: 16,
                      color: colors.text,
                      marginBottom: 8,
                    }}
                  >
                    {selectedGroup.name}
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      marginBottom: 8,
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: "Inter_400Regular",
                        fontSize: 14,
                        color: colors.textSecondary,
                      }}
                    >
                      Your Contribution:
                    </Text>
                    <Text
                      style={{
                        fontFamily: "Inter_600SemiBold",
                        fontSize: 14,
                        color: colors.text,
                      }}
                    >
                      R {selectedGroup.yourContribution.toFixed(2)}
                    </Text>
                  </View>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      marginBottom: 8,
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: "Inter_400Regular",
                        fontSize: 14,
                        color: colors.textSecondary,
                      }}
                    >
                      Event Date:
                    </Text>
                    <Text
                      style={{
                        fontFamily: "Inter_600SemiBold",
                        fontSize: 14,
                        color: colors.text,
                      }}
                    >
                      {selectedGroup.nextMeetup}
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
                        fontFamily: "Inter_400Regular",
                        fontSize: 14,
                        color: colors.textSecondary,
                      }}
                    >
                      Withdrawal Policy:
                    </Text>
                    <Text
                      style={{
                        fontFamily: "Inter_600SemiBold",
                        fontSize: 14,
                        color: colors.warning,
                      }}
                    >
                      {selectedGroup.withdrawalPolicy}
                    </Text>
                  </View>
                </View>

                {/* Penalty Warning */}
                <View
                  style={{
                    backgroundColor: colors.error + "20",
                    borderRadius: 12,
                    padding: 16,
                    marginBottom: 20,
                    borderLeftWidth: 4,
                    borderLeftColor: colors.error,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginBottom: 8,
                    }}
                  >
                    <AlertTriangle size={20} color={colors.error} />
                    <Text
                      style={{
                        fontFamily: "Inter_600SemiBold",
                        fontSize: 16,
                        color: colors.error,
                        marginLeft: 8,
                      }}
                    >
                      Withdrawal Penalty
                    </Text>
                  </View>
                  <Text
                    style={{
                      fontFamily: "Inter_400Regular",
                      fontSize: 14,
                      color: colors.textSecondary,
                      marginBottom: 8,
                    }}
                  >
                    Withdrawing from this group will incur a 20% penalty. The penalty helps maintain group commitment and covers administrative costs.
                  </Text>
                  {selectedGroup.daysUntilEvent <= 3 && (
                    <Text
                      style={{
                        fontFamily: "Inter_600SemiBold",
                        fontSize: 14,
                        color: colors.error,
                      }}
                    >
                      ⚠️ Additional penalty applies for short notice withdrawals!
                    </Text>
                  )}
                </View>

                {/* Withdrawal Amount */}
                <View style={{ marginBottom: 20 }}>
                  <Text
                    style={{
                      fontFamily: "Inter_600SemiBold",
                      fontSize: 16,
                      color: colors.text,
                      marginBottom: 12,
                    }}
                  >
                    Withdrawal Amount
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      backgroundColor: colors.surfaceElevated,
                      borderRadius: 12,
                      paddingHorizontal: 16,
                      marginBottom: 12,
                    }}
                  >
                    <DollarSign size={20} color={colors.textSecondary} />
                    <TextInput
                      value={withdrawalAmount}
                      onChangeText={setWithdrawalAmount}
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

                  {/* Quick Amount Buttons */}
                  <View
                    style={{
                      flexDirection: "row",
                      gap: 8,
                      marginBottom: 16,
                    }}
                  >
                    {[25, 50, 75, 100].map((percentage) => {
                      const amount = (selectedGroup.yourContribution * percentage / 100).toFixed(2);
                      return (
                        <TouchableOpacity
                          key={percentage}
                          onPress={() => setWithdrawalAmount(amount)}
                          style={{
                            flex: 1,
                            backgroundColor: colors.surface,
                            paddingVertical: 8,
                            paddingHorizontal: 12,
                            borderRadius: 8,
                            alignItems: "center",
                          }}
                        >
                          <Text
                            style={{
                              fontFamily: "Inter_600SemiBold",
                              fontSize: 12,
                              color: colors.text,
                            }}
                          >
                            {percentage}%
                          </Text>
                          <Text
                            style={{
                              fontFamily: "Inter_400Regular",
                              fontSize: 10,
                              color: colors.textSecondary,
                            }}
                          >
                            R{amount}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  {/* Penalty Calculation */}
                  {withdrawalAmount && (
                    <View
                      style={{
                        backgroundColor: colors.surface,
                        borderRadius: 12,
                        padding: 16,
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: "Inter_600SemiBold",
                          fontSize: 14,
                          color: colors.text,
                          marginBottom: 8,
                        }}
                      >
                        Penalty Calculation
                      </Text>
                      {(() => {
                        const amount = parseFloat(withdrawalAmount) || 0;
                        const penalty = calculatePenalty(amount, selectedGroup.daysUntilEvent);
                        const netAmount = amount - penalty;
                        
                        return (
                          <>
                            <View
                              style={{
                                flexDirection: "row",
                                justifyContent: "space-between",
                                marginBottom: 4,
                              }}
                            >
                              <Text
                                style={{
                                  fontFamily: "Inter_400Regular",
                                  fontSize: 14,
                                  color: colors.textSecondary,
                                }}
                              >
                                Withdrawal Amount:
                              </Text>
                              <Text
                                style={{
                                  fontFamily: "Inter_600SemiBold",
                                  fontSize: 14,
                                  color: colors.text,
                                }}
                              >
                                R {amount.toFixed(2)}
                              </Text>
                            </View>
                            <View
                              style={{
                                flexDirection: "row",
                                justifyContent: "space-between",
                                marginBottom: 4,
                              }}
                            >
                              <Text
                                style={{
                                  fontFamily: "Inter_400Regular",
                                  fontSize: 14,
                                  color: colors.error,
                                }}
                              >
                                Penalty ({Math.round((penalty/amount)*100)}%):
                              </Text>
                              <Text
                                style={{
                                  fontFamily: "Inter_600SemiBold",
                                  fontSize: 14,
                                  color: colors.error,
                                }}
                              >
                                -R {penalty.toFixed(2)}
                              </Text>
                            </View>
                            <View
                              style={{
                                flexDirection: "row",
                                justifyContent: "space-between",
                                borderTopWidth: 1,
                                borderTopColor: colors.border,
                                paddingTop: 8,
                              }}
                            >
                              <Text
                                style={{
                                  fontFamily: "Inter_600SemiBold",
                                  fontSize: 16,
                                  color: colors.text,
                                }}
                              >
                                You'll Receive:
                              </Text>
                              <Text
                                style={{
                                  fontFamily: "Inter_700Bold",
                                  fontSize: 16,
                                  color: colors.success,
                                }}
                              >
                                R {netAmount.toFixed(2)}
                              </Text>
                            </View>
                          </>
                        );
                      })()}
                    </View>
                  )}
                </View>

                {/* Reason */}
                <View style={{ marginBottom: 20 }}>
                  <Text
                    style={{
                      fontFamily: "Inter_600SemiBold",
                      fontSize: 16,
                      color: colors.text,
                      marginBottom: 12,
                    }}
                  >
                    Reason for Withdrawal (Optional)
                  </Text>
                  <TextInput
                    value={withdrawalReason}
                    onChangeText={setWithdrawalReason}
                    placeholder="Explain why you need to withdraw..."
                    placeholderTextColor={colors.textTertiary}
                    multiline
                    numberOfLines={3}
                    style={{
                      backgroundColor: colors.surfaceElevated,
                      borderRadius: 12,
                      padding: 16,
                      fontFamily: "Inter_400Regular",
                      fontSize: 14,
                      color: colors.text,
                      textAlignVertical: "top",
                    }}
                  />
                </View>

                {/* Action Buttons */}
                <View
                  style={{
                    flexDirection: "row",
                    gap: 12,
                  }}
                >
                  <TouchableOpacity
                    onPress={() => setShowWithdrawalModal(false)}
                    style={{
                      flex: 1,
                      backgroundColor: colors.surfaceElevated,
                      borderRadius: 12,
                      paddingVertical: 16,
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: "Inter_600SemiBold",
                        fontSize: 16,
                        color: colors.text,
                      }}
                    >
                      Cancel
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleWithdrawal}
                    disabled={!withdrawalAmount}
                    style={{
                      flex: 1,
                      backgroundColor: withdrawalAmount ? colors.error : colors.border,
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
                      Request Withdrawal
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </ScrollView>
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
            marginBottom: 16,
          }}
        >
          <Text
            style={{
              fontFamily: "Inter_600SemiBold",
              fontSize: 28,
              color: colors.text,
            }}
          >
            Groups
          </Text>
          <View style={{ flexDirection: "row", gap: 12 }}>
            <TouchableOpacity
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: colors.surfaceElevated,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Search size={20} color={colors.textSecondary} />
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

        {/* Filter Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 12 }}
        >
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter.key}
              onPress={() => setActiveFilter(filter.key)}
              style={{
                backgroundColor:
                  activeFilter === filter.key ? colors.primary : colors.surfaceElevated,
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 20,
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
              }}
            >
              <Text
                style={{
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 14,
                  color:
                    activeFilter === filter.key ? "#FFFFFF" : colors.text,
                }}
              >
                {filter.title}
              </Text>
              <View
                style={{
                  backgroundColor:
                    activeFilter === filter.key
                      ? "rgba(255,255,255,0.3)"
                      : colors.primary,
                  paddingHorizontal: 6,
                  paddingVertical: 2,
                  borderRadius: 10,
                  minWidth: 20,
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
                  {filter.count}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: insets.top + 120,
          paddingBottom: insets.bottom + 20,
        }}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Groups List */}
        <View style={{ paddingHorizontal: 20 }}>
          {groups
            .filter((group) => {
              if (activeFilter === "all") return true;
              if (activeFilter === "active") return group.status === "active";
              if (activeFilter === "full") return group.status === "full";
              if (activeFilter === "pending") return group.escrowStatus === "pending";
              return true;
            })
            .map((group) => (
              <View
                key={group.id}
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: 20,
                  padding: 20,
                  marginBottom: 16,
                  borderWidth: isDark ? 1 : 0,
                  borderColor: colors.border,
                }}
              >
                {/* Group Header */}
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: 16,
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginBottom: 8,
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: "Inter_600SemiBold",
                          fontSize: 18,
                          color: colors.text,
                          flex: 1,
                        }}
                      >
                        {group.name}
                      </Text>
                      {group.host.verified && (
                        <View
                          style={{
                            backgroundColor: colors.success,
                            borderRadius: 10,
                            padding: 4,
                            marginLeft: 8,
                          }}
                        >
                          <Shield size={12} color="#FFFFFF" />
                        </View>
                      )}
                    </View>
                    <Text
                      style={{
                        fontFamily: "Inter_500Medium",
                        fontSize: 16,
                        color: colors.primary,
                        marginBottom: 4,
                      }}
                    >
                      {group.activity}
                    </Text>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginBottom: 8,
                      }}
                    >
                      <MapPin size={14} color={colors.textSecondary} />
                      <Text
                        style={{
                          fontFamily: "Inter_400Regular",
                          fontSize: 14,
                          color: colors.textSecondary,
                          marginLeft: 4,
                        }}
                      >
                        {group.location}
                      </Text>
                    </View>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                      }}
                    >
                      <Calendar size={14} color={colors.textSecondary} />
                      <Text
                        style={{
                          fontFamily: "Inter_400Regular",
                          fontSize: 14,
                          color: colors.textSecondary,
                          marginLeft: 4,
                        }}
                      >
                        {group.nextMeetup}
                      </Text>
                    </View>
                  </View>

                  <View
                    style={{
                      backgroundColor:
                        group.status === "active"
                          ? colors.success
                          : group.status === "full"
                          ? colors.warning
                          : colors.error,
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 12,
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: "Inter_600SemiBold",
                        fontSize: 12,
                        color: "#FFFFFF",
                      }}
                    >
                      {group.status.toUpperCase()}
                    </Text>
                  </View>
                </View>

                {/* Financial Info */}
                <View
                  style={{
                    backgroundColor: colors.surfaceElevated,
                    borderRadius: 12,
                    padding: 16,
                    marginBottom: 16,
                  }}
                >
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
                          marginBottom: 4,
                        }}
                      >
                        Your Contribution
                      </Text>
                      <Text
                        style={{
                          fontFamily: "Inter_700Bold",
                          fontSize: 18,
                          color: colors.primary,
                        }}
                      >
                        R {group.yourContribution.toFixed(2)}
                      </Text>
                    </View>
                    <View>
                      <Text
                        style={{
                          fontFamily: "Inter_400Regular",
                          fontSize: 12,
                          color: colors.textSecondary,
                          marginBottom: 4,
                        }}
                      >
                        Total Pool
                      </Text>
                      <Text
                        style={{
                          fontFamily: "Inter_600SemiBold",
                          fontSize: 16,
                          color: colors.text,
                        }}
                      >
                        R {group.totalPool.toFixed(2)}
                      </Text>
                    </View>
                    <View>
                      <Text
                        style={{
                          fontFamily: "Inter_400Regular",
                          fontSize: 12,
                          color: colors.textSecondary,
                          marginBottom: 4,
                        }}
                      >
                        Escrow Status
                      </Text>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        {group.escrowStatus === "locked" ? (
                          <Lock size={14} color={colors.success} />
                        ) : (
                          <Clock size={14} color={colors.warning} />
                        )}
                        <Text
                          style={{
                            fontFamily: "Inter_600SemiBold",
                            fontSize: 12,
                            color:
                              group.escrowStatus === "locked"
                                ? colors.success
                                : colors.warning,
                          }}
                        >
                          {group.escrowStatus.toUpperCase()}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Safety & Trust Scores */}
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      borderTopWidth: 1,
                      borderTopColor: colors.border,
                      paddingTop: 12,
                    }}
                  >
                    <View style={{ alignItems: "center" }}>
                      <Text
                        style={{
                          fontFamily: "Inter_400Regular",
                          fontSize: 10,
                          color: colors.textSecondary,
                          marginBottom: 2,
                        }}
                      >
                        Safety Score
                      </Text>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <Shield size={12} color={colors.success} />
                        <Text
                          style={{
                            fontFamily: "Inter_600SemiBold",
                            fontSize: 12,
                            color: colors.success,
                          }}
                        >
                          {group.safetyScore}%
                        </Text>
                      </View>
                    </View>
                    <View style={{ alignItems: "center" }}>
                      <Text
                        style={{
                          fontFamily: "Inter_400Regular",
                          fontSize: 10,
                          color: colors.textSecondary,
                          marginBottom: 2,
                        }}
                      >
                        Trust Score
                      </Text>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <Star size={12} color={colors.warning} />
                        <Text
                          style={{
                            fontFamily: "Inter_600SemiBold",
                            fontSize: 12,
                            color: colors.warning,
                          }}
                        >
                          {group.trustScore}%
                        </Text>
                      </View>
                    </View>
                    <View style={{ alignItems: "center" }}>
                      <Text
                        style={{
                          fontFamily: "Inter_400Regular",
                          fontSize: 10,
                          color: colors.textSecondary,
                          marginBottom: 2,
                        }}
                      >
                        Withdrawals
                      </Text>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        {group.recentWithdrawals > 0 ? (
                          <TrendingDown size={12} color={colors.error} />
                        ) : (
                          <TrendingUp size={12} color={colors.success} />
                        )}
                        <Text
                          style={{
                            fontFamily: "Inter_600SemiBold",
                            fontSize: 12,
                            color:
                              group.recentWithdrawals > 0
                                ? colors.error
                                : colors.success,
                          }}
                        >
                          {group.recentWithdrawals}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Members */}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 16,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      marginRight: 12,
                    }}
                  >
                    {group.memberAvatars.map((avatar, index) => (
                      <Image
                        key={index}
                        source={{ uri: avatar }}
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 16,
                          borderWidth: 2,
                          borderColor: colors.background,
                          marginLeft: index > 0 ? -8 : 0,
                        }}
                      />
                    ))}
                    {group.members < group.maxMembers && (
                      <View
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 16,
                          backgroundColor: colors.surfaceElevated,
                          borderWidth: 2,
                          borderColor: colors.background,
                          marginLeft: -8,
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <Plus size={16} color={colors.textSecondary} />
                      </View>
                    )}
                  </View>
                  <Text
                    style={{
                      fontFamily: "Inter_500Medium",
                      fontSize: 14,
                      color: colors.textSecondary,
                    }}
                  >
                    {group.members}/{group.maxMembers} members
                  </Text>
                </View>

                {/* Action Buttons */}
                <View
                  style={{
                    flexDirection: "row",
                    gap: 12,
                  }}
                >
                  <TouchableOpacity
                    style={{
                      flex: 1,
                      backgroundColor: colors.primary,
                      borderRadius: 12,
                      paddingVertical: 12,
                      alignItems: "center",
                      flexDirection: "row",
                      justifyContent: "center",
                      gap: 6,
                    }}
                  >
                    <MessageCircle size={16} color="#FFFFFF" />
                    <Text
                      style={{
                        fontFamily: "Inter_600SemiBold",
                        fontSize: 14,
                        color: "#FFFFFF",
                      }}
                    >
                      Chat
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{
                      backgroundColor: colors.surfaceElevated,
                      borderRadius: 12,
                      paddingVertical: 12,
                      paddingHorizontal: 16,
                      alignItems: "center",
                      flexDirection: "row",
                      gap: 6,
                    }}
                  >
                    <Eye size={16} color={colors.textSecondary} />
                    <Text
                      style={{
                        fontFamily: "Inter_600SemiBold",
                        fontSize: 14,
                        color: colors.text,
                      }}
                    >
                      View
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      setSelectedGroup(group);
                      setShowWithdrawalModal(true);
                    }}
                    style={{
                      backgroundColor: colors.error,
                      borderRadius: 12,
                      paddingVertical: 12,
                      paddingHorizontal: 16,
                      alignItems: "center",
                      flexDirection: "row",
                      gap: 6,
                    }}
                  >
                    <UserMinus size={16} color="#FFFFFF" />
                    <Text
                      style={{
                        fontFamily: "Inter_600SemiBold",
                        fontSize: 14,
                        color: "#FFFFFF",
                      }}
                    >
                      Leave
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Withdrawal Policy Info */}
                <View
                  style={{
                    backgroundColor: colors.warning + "20",
                    borderRadius: 8,
                    padding: 12,
                    marginTop: 12,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <Info size={16} color={colors.warning} />
                  <Text
                    style={{
                      fontFamily: "Inter_400Regular",
                      fontSize: 12,
                      color: colors.textSecondary,
                      flex: 1,
                    }}
                  >
                    {group.withdrawalPolicy}
                  </Text>
                </View>
              </View>
            ))}
        </View>
      </ScrollView>

      {renderWithdrawalModal()}
    </View>
  );
}

