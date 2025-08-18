import { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
  TextInput,
  Modal,
  Alert,
  Dimensions,
  Switch,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import {
  Wallet,
  CreditCard,
  PiggyBank,
  TrendingUp,
  Calendar,
  Clock,
  DollarSign,
  Percent,
  Shield,
  CheckCircle,
  XCircle,
  Plus,
  Minus,
  Eye,
  EyeOff,
  Settings,
  History,
  ArrowUpRight,
  ArrowDownLeft,
  Users,
  Lock,
  Unlock,
  AlertTriangle,
  Info,
  Star,
  Gift,
  Zap,
  Target,
  Award,
  Banknote,
  Coins,
  Receipt,
  FileText,
  IdCard,
  Fingerprint,
  Smartphone,
  Building,
  MapPin,
  Phone,
  Mail,
  Camera,
  Upload,
  Download,
  RefreshCw,
  Bell,
  BellOff,
  Heart,
  Bookmark,
  Share2,
  Copy,
  QrCode,
  Scan,
  Send,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  Edit,
  Trash2,
  Save,
  X,
  Check,
} from "lucide-react-native";
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import { useTheme } from "../../utils/theme";

const { width: screenWidth } = Dimensions.get("window");

export default function WalletScreen() {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState("wallet"); // wallet, payment_plans, savings, verification
  const [showBalance, setShowBalance] = useState(true);
  const [showPaymentPlanModal, setShowPaymentPlanModal] = useState(false);
  const [showSavingsModal, setShowSavingsModal] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [showIDUploadModal, setShowIDUploadModal] = useState(false);
  const [selectedPaymentPlan, setSelectedPaymentPlan] = useState(null);
  const [verificationStep, setVerificationStep] = useState(1);
  const [idNumber, setIdNumber] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [creditScore, setCreditScore] = useState(720);
  const [borrowingLimit, setBorrowingLimit] = useState(2500);

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

  // User wallet data
  const walletData = {
    balance: 1250.75,
    availableCredit: isVerified ? borrowingLimit : 0,
    totalSavings: 3450.20,
    monthlySpending: 2180.50,
    creditUtilization: 0.15,
    paymentPlansActive: 2,
    savingsGoals: 3,
  };

  // Payment plan options
  const paymentPlanOptions = [
    {
      id: 1,
      name: "Quick Split",
      description: "Split any payment into 2 installments",
      installments: 2,
      fee: 0.10, // 10%
      minAmount: 50,
      maxAmount: 1000,
      icon: Zap,
      color: colors.primary,
      popular: true,
      benefits: ["No embarrassment", "Instant approval", "10% fee only"],
    },
    {
      id: 2,
      name: "Flex Pay",
      description: "Flexible 3-month payment plan",
      installments: 3,
      fee: 0.15, // 15%
      minAmount: 100,
      maxAmount: 2500,
      icon: Target,
      color: colors.success,
      popular: false,
      benefits: ["Lower monthly payments", "Build credit", "15% fee"],
    },
    {
      id: 3,
      name: "Easy Stretch",
      description: "Extended 6-month payment option",
      installments: 6,
      fee: 0.25, // 25%
      minAmount: 200,
      maxAmount: 5000,
      icon: Calendar,
      color: colors.warning,
      popular: false,
      benefits: ["Lowest monthly amount", "Credit building", "25% fee"],
    },
  ];

  // Active payment plans
  const activePaymentPlans = [
    {
      id: 1,
      merchant: "La Colombe Restaurant",
      originalAmount: 450,
      totalAmount: 495, // 10% fee
      paidAmount: 247.50,
      remainingAmount: 247.50,
      installments: 2,
      currentInstallment: 1,
      nextPaymentDate: "2024-01-15",
      status: "active",
      planType: "Quick Split",
    },
    {
      id: 2,
      merchant: "Truth Coffee Roasting",
      originalAmount: 180,
      totalAmount: 198, // 10% fee
      paidAmount: 99,
      remainingAmount: 99,
      installments: 2,
      currentInstallment: 1,
      nextPaymentDate: "2024-01-20",
      status: "active",
      planType: "Quick Split",
    },
  ];

  // Savings goals
  const savingsGoals = [
    {
      id: 1,
      name: "Weekend Getaway",
      targetAmount: 2500,
      currentAmount: 1850,
      targetDate: "2024-03-15",
      monthlyContribution: 300,
      icon: MapPin,
      color: colors.info,
      progress: 0.74,
    },
    {
      id: 2,
      name: "Birthday Celebration",
      targetAmount: 1200,
      currentAmount: 680,
      targetDate: "2024-02-28",
      monthlyContribution: 200,
      icon: Gift,
      color: colors.primary,
      progress: 0.57,
    },
    {
      id: 3,
      name: "Emergency Fund",
      targetAmount: 5000,
      currentAmount: 920,
      targetDate: "2024-12-31",
      monthlyContribution: 400,
      icon: Shield,
      color: colors.success,
      progress: 0.18,
    },
  ];

  // Recent transactions
  const recentTransactions = [
    {
      id: 1,
      type: "payment_plan",
      merchant: "La Colombe Restaurant",
      amount: -247.50,
      date: "2024-01-01",
      status: "completed",
      description: "Payment Plan - Installment 1/2",
    },
    {
      id: 2,
      type: "savings",
      merchant: "Weekend Getaway Goal",
      amount: -300,
      date: "2024-01-01",
      status: "completed",
      description: "Monthly Savings Contribution",
    },
    {
      id: 3,
      type: "regular",
      merchant: "Vida e Caffè",
      amount: -85.50,
      date: "2023-12-30",
      status: "completed",
      description: "Coffee & Breakfast",
    },
    {
      id: 4,
      type: "refund",
      merchant: "Kloof Street House",
      amount: +120,
      date: "2023-12-29",
      status: "completed",
      description: "Booking Cancellation Refund",
    },
  ];

  const tabs = [
    { key: "wallet", label: "Wallet", icon: Wallet },
    { key: "payment_plans", label: "Pay Later", icon: CreditCard },
    { key: "savings", label: "Savings", icon: PiggyBank },
    { key: "verification", label: "Verify ID", icon: Shield },
  ];

  const handlePaymentPlanSelection = (plan) => {
    setSelectedPaymentPlan(plan);
    setShowPaymentPlanModal(true);
  };

  const handleIDVerification = () => {
    if (idNumber.length === 13) {
      // Simulate ID verification process
      Alert.alert(
        "ID Verification",
        "Your South African ID has been verified successfully! You can now access payment plans and borrowing features.",
        [
          {
            text: "Continue",
            onPress: () => {
              setIsVerified(true);
              setShowVerificationModal(false);
              setVerificationStep(1);
            }
          }
        ]
      );
    } else {
      Alert.alert("Invalid ID", "Please enter a valid 13-digit South African ID number.");
    }
  };

  const renderPaymentPlanModal = () => (
    <Modal
      visible={showPaymentPlanModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowPaymentPlanModal(false)}
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
                Payment Plan Details
              </Text>
              <TouchableOpacity onPress={() => setShowPaymentPlanModal(false)}>
                <XCircle size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {selectedPaymentPlan && (
              <>
                <View
                  style={{
                    backgroundColor: colors.surface,
                    borderRadius: 16,
                    padding: 20,
                    marginBottom: 20,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginBottom: 12,
                    }}
                  >
                    <selectedPaymentPlan.icon size={24} color={selectedPaymentPlan.color} />
                    <Text
                      style={{
                        fontFamily: "Inter_600SemiBold",
                        fontSize: 18,
                        color: colors.text,
                        marginLeft: 12,
                      }}
                    >
                      {selectedPaymentPlan.name}
                    </Text>
                    {selectedPaymentPlan.popular && (
                      <View
                        style={{
                          backgroundColor: colors.warning,
                          paddingHorizontal: 8,
                          paddingVertical: 4,
                          borderRadius: 8,
                          marginLeft: 8,
                        }}
                      >
                        <Text
                          style={{
                            fontFamily: "Inter_600SemiBold",
                            fontSize: 10,
                            color: "#FFFFFF",
                          }}
                        >
                          POPULAR
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text
                    style={{
                      fontFamily: "Inter_400Regular",
                      fontSize: 14,
                      color: colors.textSecondary,
                      marginBottom: 16,
                    }}
                  >
                    {selectedPaymentPlan.description}
                  </Text>

                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      marginBottom: 16,
                    }}
                  >
                    <View>
                      <Text
                        style={{
                          fontFamily: "Inter_400Regular",
                          fontSize: 12,
                          color: colors.textSecondary,
                        }}
                      >
                        Installments
                      </Text>
                      <Text
                        style={{
                          fontFamily: "Inter_600SemiBold",
                          fontSize: 16,
                          color: colors.text,
                        }}
                      >
                        {selectedPaymentPlan.installments}
                      </Text>
                    </View>
                    <View>
                      <Text
                        style={{
                          fontFamily: "Inter_400Regular",
                          fontSize: 12,
                          color: colors.textSecondary,
                        }}
                      >
                        Fee
                      </Text>
                      <Text
                        style={{
                          fontFamily: "Inter_600SemiBold",
                          fontSize: 16,
                          color: colors.text,
                        }}
                      >
                        {(selectedPaymentPlan.fee * 100).toFixed(0)}%
                      </Text>
                    </View>
                    <View>
                      <Text
                        style={{
                          fontFamily: "Inter_400Regular",
                          fontSize: 12,
                          color: colors.textSecondary,
                        }}
                      >
                        Max Amount
                      </Text>
                      <Text
                        style={{
                          fontFamily: "Inter_600SemiBold",
                          fontSize: 16,
                          color: colors.text,
                        }}
                      >
                        R{selectedPaymentPlan.maxAmount}
                      </Text>
                    </View>
                  </View>

                  <View>
                    <Text
                      style={{
                        fontFamily: "Inter_600SemiBold",
                        fontSize: 14,
                        color: colors.text,
                        marginBottom: 8,
                      }}
                    >
                      Benefits:
                    </Text>
                    {selectedPaymentPlan.benefits.map((benefit, index) => (
                      <View
                        key={index}
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          marginBottom: 4,
                        }}
                      >
                        <CheckCircle size={16} color={colors.success} />
                        <Text
                          style={{
                            fontFamily: "Inter_400Regular",
                            fontSize: 14,
                            color: colors.text,
                            marginLeft: 8,
                          }}
                        >
                          {benefit}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>

                <View
                  style={{
                    backgroundColor: colors.surface,
                    borderRadius: 16,
                    padding: 20,
                    marginBottom: 20,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "Inter_600SemiBold",
                      fontSize: 16,
                      color: colors.text,
                      marginBottom: 12,
                    }}
                  >
                    Example: R300 Restaurant Bill
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
                      Original Amount:
                    </Text>
                    <Text
                      style={{
                        fontFamily: "Inter_600SemiBold",
                        fontSize: 14,
                        color: colors.text,
                      }}
                    >
                      R300.00
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
                      Fee ({(selectedPaymentPlan.fee * 100).toFixed(0)}%):
                    </Text>
                    <Text
                      style={{
                        fontFamily: "Inter_600SemiBold",
                        fontSize: 14,
                        color: colors.warning,
                      }}
                    >
                      R{(300 * selectedPaymentPlan.fee).toFixed(2)}
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
                        fontFamily: "Inter_600SemiBold",
                        fontSize: 14,
                        color: colors.text,
                      }}
                    >
                      Total Amount:
                    </Text>
                    <Text
                      style={{
                        fontFamily: "Inter_700Bold",
                        fontSize: 16,
                        color: colors.primary,
                      }}
                    >
                      R{(300 * (1 + selectedPaymentPlan.fee)).toFixed(2)}
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
                        fontSize: 14,
                        color: colors.text,
                      }}
                    >
                      Per Installment:
                    </Text>
                    <Text
                      style={{
                        fontFamily: "Inter_700Bold",
                        fontSize: 18,
                        color: colors.success,
                      }}
                    >
                      R{((300 * (1 + selectedPaymentPlan.fee)) / selectedPaymentPlan.installments).toFixed(2)}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={{
                    backgroundColor: selectedPaymentPlan.color,
                    borderRadius: 12,
                    paddingVertical: 16,
                    alignItems: "center",
                    flexDirection: "row",
                    justifyContent: "center",
                    gap: 8,
                  }}
                >
                  <CreditCard size={20} color="#FFFFFF" />
                  <Text
                    style={{
                      fontFamily: "Inter_600SemiBold",
                      fontSize: 16,
                      color: "#FFFFFF",
                    }}
                  >
                    Activate {selectedPaymentPlan.name}
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  const renderVerificationModal = () => (
    <Modal
      visible={showVerificationModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowVerificationModal(false)}
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
                ID Verification
              </Text>
              <TouchableOpacity onPress={() => setShowVerificationModal(false)}>
                <XCircle size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {verificationStep === 1 && (
              <>
                <View
                  style={{
                    backgroundColor: colors.info + "20",
                    borderRadius: 16,
                    padding: 16,
                    marginBottom: 20,
                    borderLeftWidth: 4,
                    borderLeftColor: colors.info,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginBottom: 8,
                    }}
                  >
                    <Shield size={20} color={colors.info} />
                    <Text
                      style={{
                        fontFamily: "Inter_600SemiBold",
                        fontSize: 16,
                        color: colors.info,
                        marginLeft: 8,
                      }}
                    >
                      Why Verify Your ID?
                    </Text>
                  </View>
                  <Text
                    style={{
                      fontFamily: "Inter_400Regular",
                      fontSize: 14,
                      color: colors.textSecondary,
                    }}
                  >
                    ID verification enables payment plans, borrowing features, and higher transaction limits. We comply with South African financial regulations (FICA).
                  </Text>
                </View>

                <View
                  style={{
                    backgroundColor: colors.surface,
                    borderRadius: 16,
                    padding: 20,
                    marginBottom: 20,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "Inter_600SemiBold",
                      fontSize: 16,
                      color: colors.text,
                      marginBottom: 16,
                    }}
                  >
                    Enter Your South African ID Number
                  </Text>
                  <View
                    style={{
                      backgroundColor: colors.surfaceElevated,
                      borderRadius: 12,
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                      marginBottom: 16,
                    }}
                  >
                    <TextInput
                      value={idNumber}
                      onChangeText={setIdNumber}
                      placeholder="e.g., 9001015009087"
                      placeholderTextColor={colors.textTertiary}
                      maxLength={13}
                      keyboardType="numeric"
                      style={{
                        fontFamily: "Inter_500Medium",
                        fontSize: 16,
                        color: colors.text,
                      }}
                    />
                  </View>
                  <Text
                    style={{
                      fontFamily: "Inter_400Regular",
                      fontSize: 12,
                      color: colors.textSecondary,
                      marginBottom: 16,
                    }}
                  >
                    Your ID number is encrypted and stored securely. We never share your personal information.
                  </Text>
                  <TouchableOpacity
                    onPress={() => setVerificationStep(2)}
                    disabled={idNumber.length !== 13}
                    style={{
                      backgroundColor: idNumber.length === 13 ? colors.primary : colors.border,
                      borderRadius: 12,
                      paddingVertical: 12,
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: "Inter_600SemiBold",
                        fontSize: 14,
                        color: idNumber.length === 13 ? "#FFFFFF" : colors.textSecondary,
                      }}
                    >
                      Continue to Document Upload
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            {verificationStep === 2 && (
              <>
                <View
                  style={{
                    backgroundColor: colors.surface,
                    borderRadius: 16,
                    padding: 20,
                    marginBottom: 20,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "Inter_600SemiBold",
                      fontSize: 16,
                      color: colors.text,
                      marginBottom: 16,
                    }}
                  >
                    Upload ID Document
                  </Text>
                  <Text
                    style={{
                      fontFamily: "Inter_400Regular",
                      fontSize: 14,
                      color: colors.textSecondary,
                      marginBottom: 20,
                    }}
                  >
                    Please upload a clear photo of your South African ID document (front side).
                  </Text>
                  
                  <View
                    style={{
                      borderWidth: 2,
                      borderColor: colors.border,
                      borderStyle: "dashed",
                      borderRadius: 12,
                      padding: 40,
                      alignItems: "center",
                      marginBottom: 20,
                    }}
                  >
                    <Camera size={48} color={colors.textSecondary} />
                    <Text
                      style={{
                        fontFamily: "Inter_500Medium",
                        fontSize: 16,
                        color: colors.text,
                        marginTop: 12,
                        marginBottom: 8,
                      }}
                    >
                      Take Photo or Upload
                    </Text>
                    <Text
                      style={{
                        fontFamily: "Inter_400Regular",
                        fontSize: 12,
                        color: colors.textSecondary,
                        textAlign: "center",
                      }}
                    >
                      Ensure your ID is clearly visible and all details are readable
                    </Text>
                  </View>

                  <View style={{ flexDirection: "row", gap: 12 }}>
                    <TouchableOpacity
                      style={{
                        flex: 1,
                        backgroundColor: colors.surfaceElevated,
                        borderRadius: 12,
                        paddingVertical: 12,
                        alignItems: "center",
                        flexDirection: "row",
                        justifyContent: "center",
                        gap: 6,
                      }}
                    >
                      <Camera size={16} color={colors.textSecondary} />
                      <Text
                        style={{
                          fontFamily: "Inter_500Medium",
                          fontSize: 14,
                          color: colors.text,
                        }}
                      >
                        Camera
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={{
                        flex: 1,
                        backgroundColor: colors.surfaceElevated,
                        borderRadius: 12,
                        paddingVertical: 12,
                        alignItems: "center",
                        flexDirection: "row",
                        justifyContent: "center",
                        gap: 6,
                      }}
                    >
                      <Upload size={16} color={colors.textSecondary} />
                      <Text
                        style={{
                          fontFamily: "Inter_500Medium",
                          fontSize: 14,
                          color: colors.text,
                        }}
                      >
                        Gallery
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={{ flexDirection: "row", gap: 12 }}>
                  <TouchableOpacity
                    onPress={() => setVerificationStep(1)}
                    style={{
                      flex: 1,
                      backgroundColor: colors.surfaceElevated,
                      borderRadius: 12,
                      paddingVertical: 12,
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: "Inter_500Medium",
                        fontSize: 14,
                        color: colors.text,
                      }}
                    >
                      Back
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleIDVerification}
                    style={{
                      flex: 2,
                      backgroundColor: colors.success,
                      borderRadius: 12,
                      paddingVertical: 12,
                      alignItems: "center",
                      flexDirection: "row",
                      justifyContent: "center",
                      gap: 6,
                    }}
                  >
                    <CheckCircle size={16} color="#FFFFFF" />
                    <Text
                      style={{
                        fontFamily: "Inter_600SemiBold",
                        fontSize: 14,
                        color: "#FFFFFF",
                      }}
                    >
                      Verify ID
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

  const renderWalletTab = () => (
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
                  marginBottom: 4,
                }}
              >
                Available Balance
              </Text>
              <Text
                style={{
                  fontFamily: "Inter_700Bold",
                  fontSize: 32,
                  color: "#FFFFFF",
                }}
              >
                {showBalance ? `R${walletData.balance.toFixed(2)}` : "R••••••"}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setShowBalance(!showBalance)}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: "rgba(255,255,255,0.2)",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {showBalance ? (
                <Eye size={20} color="#FFFFFF" />
              ) : (
                <EyeOff size={20} color="#FFFFFF" />
              )}
            </TouchableOpacity>
          </View>

          {isVerified && (
            <View
              style={{
                backgroundColor: "rgba(255,255,255,0.2)",
                borderRadius: 12,
                padding: 16,
                marginBottom: 16,
              }}
            >
              <Text
                style={{
                  fontFamily: "Inter_500Medium",
                  fontSize: 14,
                  color: "rgba(255,255,255,0.9)",
                  marginBottom: 8,
                }}
              >
                Available Credit (Pay Later)
              </Text>
              <Text
                style={{
                  fontFamily: "Inter_700Bold",
                  fontSize: 24,
                  color: "#FFFFFF",
                }}
              >
                R{walletData.availableCredit.toFixed(2)}
              </Text>
            </View>
          )}

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <View style={{ alignItems: "center" }}>
              <Text
                style={{
                  fontFamily: "Inter_400Regular",
                  fontSize: 12,
                  color: "rgba(255,255,255,0.8)",
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
                R{walletData.monthlySpending.toFixed(2)}
              </Text>
            </View>
            <View style={{ alignItems: "center" }}>
              <Text
                style={{
                  fontFamily: "Inter_400Regular",
                  fontSize: 12,
                  color: "rgba(255,255,255,0.8)",
                }}
              >
                Savings
              </Text>
              <Text
                style={{
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 16,
                  color: "#FFFFFF",
                }}
              >
                R{walletData.totalSavings.toFixed(2)}
              </Text>
            </View>
            {isVerified && (
              <View style={{ alignItems: "center" }}>
                <Text
                  style={{
                    fontFamily: "Inter_400Regular",
                    fontSize: 12,
                    color: "rgba(255,255,255,0.8)",
                  }}
                >
                  Credit Score
                </Text>
                <Text
                  style={{
                    fontFamily: "Inter_600SemiBold",
                    fontSize: 16,
                    color: "#FFFFFF",
                  }}
                >
                  {creditScore}
                </Text>
              </View>
            )}
          </View>
        </LinearGradient>
      </View>

      {/* Quick Actions */}
      <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
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
            gap: 12,
          }}
        >
          <TouchableOpacity
            style={{
              flex: 1,
              backgroundColor: colors.surface,
              borderRadius: 16,
              padding: 16,
              alignItems: "center",
              borderWidth: isDark ? 1 : 0,
              borderColor: colors.border,
            }}
          >
            <Send size={24} color={colors.primary} />
            <Text
              style={{
                fontFamily: "Inter_500Medium",
                fontSize: 12,
                color: colors.text,
                marginTop: 8,
              }}
            >
              Send Money
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              flex: 1,
              backgroundColor: colors.surface,
              borderRadius: 16,
              padding: 16,
              alignItems: "center",
              borderWidth: isDark ? 1 : 0,
              borderColor: colors.border,
            }}
          >
            <Download size={24} color={colors.success} />
            <Text
              style={{
                fontFamily: "Inter_500Medium",
                fontSize: 12,
                color: colors.text,
                marginTop: 8,
              }}
            >
              Add Money
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              flex: 1,
              backgroundColor: colors.surface,
              borderRadius: 16,
              padding: 16,
              alignItems: "center",
              borderWidth: isDark ? 1 : 0,
              borderColor: colors.border,
            }}
          >
            <QrCode size={24} color={colors.info} />
            <Text
              style={{
                fontFamily: "Inter_500Medium",
                fontSize: 12,
                color: colors.text,
                marginTop: 8,
              }}
            >
              QR Pay
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              flex: 1,
              backgroundColor: colors.surface,
              borderRadius: 16,
              padding: 16,
              alignItems: "center",
              borderWidth: isDark ? 1 : 0,
              borderColor: colors.border,
            }}
          >
            <History size={24} color={colors.textSecondary} />
            <Text
              style={{
                fontFamily: "Inter_500Medium",
                fontSize: 12,
                color: colors.text,
                marginTop: 8,
              }}
            >
              History
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent Transactions */}
      <View style={{ paddingHorizontal: 20 }}>
        <Text
          style={{
            fontFamily: "Inter_600SemiBold",
            fontSize: 18,
            color: colors.text,
            marginBottom: 16,
          }}
        >
          Recent Transactions
        </Text>
        {recentTransactions.map((transaction) => (
          <View
            key={transaction.id}
            style={{
              backgroundColor: colors.surface,
              borderRadius: 12,
              padding: 16,
              marginBottom: 12,
              flexDirection: "row",
              alignItems: "center",
              borderWidth: isDark ? 1 : 0,
              borderColor: colors.border,
            }}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor:
                  transaction.type === "payment_plan" ? colors.primary + "20" :
                  transaction.type === "savings" ? colors.success + "20" :
                  transaction.type === "refund" ? colors.info + "20" :
                  colors.textSecondary + "20",
                justifyContent: "center",
                alignItems: "center",
                marginRight: 12,
              }}
            >
              {transaction.type === "payment_plan" && <CreditCard size={20} color={colors.primary} />}
              {transaction.type === "savings" && <PiggyBank size={20} color={colors.success} />}
              {transaction.type === "refund" && <ArrowDownLeft size={20} color={colors.info} />}
              {transaction.type === "regular" && <Receipt size={20} color={colors.textSecondary} />}
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 14,
                  color: colors.text,
                  marginBottom: 2,
                }}
              >
                {transaction.merchant}
              </Text>
              <Text
                style={{
                  fontFamily: "Inter_400Regular",
                  fontSize: 12,
                  color: colors.textSecondary,
                }}
              >
                {transaction.description}
              </Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text
                style={{
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 16,
                  color: transaction.amount > 0 ? colors.success : colors.text,
                }}
              >
                {transaction.amount > 0 ? "+" : ""}R{Math.abs(transaction.amount).toFixed(2)}
              </Text>
              <Text
                style={{
                  fontFamily: "Inter_400Regular",
                  fontSize: 12,
                  color: colors.textSecondary,
                }}
              >
                {transaction.date}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </>
  );

  const renderPaymentPlansTab = () => (
    <>
      {!isVerified && (
        <View
          style={{
            marginHorizontal: 20,
            marginBottom: 24,
            backgroundColor: colors.warning + "20",
            borderRadius: 16,
            padding: 20,
            borderLeftWidth: 4,
            borderLeftColor: colors.warning,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <AlertTriangle size={20} color={colors.warning} />
            <Text
              style={{
                fontFamily: "Inter_600SemiBold",
                fontSize: 16,
                color: colors.warning,
                marginLeft: 8,
              }}
            >
              ID Verification Required
            </Text>
          </View>
          <Text
            style={{
              fontFamily: "Inter_400Regular",
              fontSize: 14,
              color: colors.textSecondary,
              marginBottom: 16,
            }}
          >
            To access payment plans and borrowing features, please verify your South African ID number.
          </Text>
          <TouchableOpacity
            onPress={() => setShowVerificationModal(true)}
            style={{
              backgroundColor: colors.warning,
              borderRadius: 8,
              paddingVertical: 8,
              paddingHorizontal: 12,
              alignSelf: "flex-start",
            }}
          >
            <Text
              style={{
                fontFamily: "Inter_600SemiBold",
                fontSize: 12,
                color: "#FFFFFF",
              }}
            >
              Verify ID Now
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Payment Plan Options */}
      <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
        <Text
          style={{
            fontFamily: "Inter_600SemiBold",
            fontSize: 18,
            color: colors.text,
            marginBottom: 16,
          }}
        >
          Available Payment Plans
        </Text>
        {paymentPlanOptions.map((plan) => (
          <TouchableOpacity
            key={plan.id}
            onPress={() => handlePaymentPlanSelection(plan)}
            disabled={!isVerified}
            style={{
              backgroundColor: colors.surface,
              borderRadius: 16,
              padding: 20,
              marginBottom: 16,
              borderWidth: plan.popular ? 2 : (isDark ? 1 : 0),
              borderColor: plan.popular ? plan.color : colors.border,
              opacity: !isVerified ? 0.6 : 1,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <plan.icon size={24} color={plan.color} />
              <Text
                style={{
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 18,
                  color: colors.text,
                  marginLeft: 12,
                }}
              >
                {plan.name}
              </Text>
              {plan.popular && (
                <View
                  style={{
                    backgroundColor: colors.warning,
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 8,
                    marginLeft: 8,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "Inter_600SemiBold",
                      fontSize: 10,
                      color: "#FFFFFF",
                    }}
                  >
                    POPULAR
                  </Text>
                </View>
              )}
            </View>
            <Text
              style={{
                fontFamily: "Inter_400Regular",
                fontSize: 14,
                color: colors.textSecondary,
                marginBottom: 16,
              }}
            >
              {plan.description}
            </Text>
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
                  }}
                >
                  Installments
                </Text>
                <Text
                  style={{
                    fontFamily: "Inter_600SemiBold",
                    fontSize: 16,
                    color: colors.text,
                  }}
                >
                  {plan.installments}
                </Text>
              </View>
              <View>
                <Text
                  style={{
                    fontFamily: "Inter_400Regular",
                    fontSize: 12,
                    color: colors.textSecondary,
                  }}
                >
                  Fee
                </Text>
                <Text
                  style={{
                    fontFamily: "Inter_600SemiBold",
                    fontSize: 16,
                    color: plan.color,
                  }}
                >
                  {(plan.fee * 100).toFixed(0)}%
                </Text>
              </View>
              <View>
                <Text
                  style={{
                    fontFamily: "Inter_400Regular",
                    fontSize: 12,
                    color: colors.textSecondary,
                  }}
                >
                  Max Amount
                </Text>
                <Text
                  style={{
                    fontFamily: "Inter_600SemiBold",
                    fontSize: 16,
                    color: colors.text,
                  }}
                >
                  R{plan.maxAmount}
                </Text>
              </View>
            </View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Text
                style={{
                  fontFamily: "Inter_500Medium",
                  fontSize: 14,
                  color: plan.color,
                }}
              >
                Learn More
              </Text>
              <ChevronRight size={16} color={colors.textSecondary} />
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Active Payment Plans */}
      {isVerified && activePaymentPlans.length > 0 && (
        <View style={{ paddingHorizontal: 20 }}>
          <Text
            style={{
              fontFamily: "Inter_600SemiBold",
              fontSize: 18,
              color: colors.text,
              marginBottom: 16,
            }}
          >
            Active Payment Plans
          </Text>
          {activePaymentPlans.map((plan) => (
            <View
              key={plan.id}
              style={{
                backgroundColor: colors.surface,
                borderRadius: 16,
                padding: 20,
                marginBottom: 16,
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
                    {plan.merchant}
                  </Text>
                  <Text
                    style={{
                      fontFamily: "Inter_400Regular",
                      fontSize: 12,
                      color: colors.textSecondary,
                    }}
                  >
                    {plan.planType} • {plan.currentInstallment}/{plan.installments} payments
                  </Text>
                </View>
                <View
                  style={{
                    backgroundColor: colors.success + "20",
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 8,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "Inter_600SemiBold",
                      fontSize: 10,
                      color: colors.success,
                    }}
                  >
                    ACTIVE
                  </Text>
                </View>
              </View>

              <View
                style={{
                  backgroundColor: colors.surfaceElevated,
                  borderRadius: 12,
                  padding: 12,
                  marginBottom: 12,
                }}
              >
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
                      fontSize: 12,
                      color: colors.textSecondary,
                    }}
                  >
                    Progress
                  </Text>
                  <Text
                    style={{
                      fontFamily: "Inter_600SemiBold",
                      fontSize: 12,
                      color: colors.text,
                    }}
                  >
                    R{plan.paidAmount.toFixed(2)} / R{plan.totalAmount.toFixed(2)}
                  </Text>
                </View>
                <View
                  style={{
                    height: 6,
                    backgroundColor: colors.border,
                    borderRadius: 3,
                    overflow: "hidden",
                  }}
                >
                  <View
                    style={{
                      height: "100%",
                      width: `${(plan.paidAmount / plan.totalAmount) * 100}%`,
                      backgroundColor: colors.success,
                    }}
                  />
                </View>
              </View>

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <View>
                  <Text
                    style={{
                      fontFamily: "Inter_400Regular",
                      fontSize: 12,
                      color: colors.textSecondary,
                    }}
                  >
                    Next Payment
                  </Text>
                  <Text
                    style={{
                      fontFamily: "Inter_600SemiBold",
                      fontSize: 14,
                      color: colors.text,
                    }}
                  >
                    R{plan.remainingAmount.toFixed(2)}
                  </Text>
                  <Text
                    style={{
                      fontFamily: "Inter_400Regular",
                      fontSize: 12,
                      color: colors.textSecondary,
                    }}
                  >
                    Due: {plan.nextPaymentDate}
                  </Text>
                </View>
                <TouchableOpacity
                  style={{
                    backgroundColor: colors.primary,
                    borderRadius: 8,
                    paddingVertical: 8,
                    paddingHorizontal: 16,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "Inter_600SemiBold",
                      fontSize: 12,
                      color: "#FFFFFF",
                    }}
                  >
                    Pay Now
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}
    </>
  );

  const renderSavingsTab = () => (
    <>
      {/* Savings Overview */}
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
              marginBottom: 16,
            }}
          >
            <View>
              <Text
                style={{
                  fontFamily: "Inter_400Regular",
                  fontSize: 14,
                  color: "rgba(255,255,255,0.8)",
                  marginBottom: 4,
                }}
              >
                Total Savings
              </Text>
              <Text
                style={{
                  fontFamily: "Inter_700Bold",
                  fontSize: 32,
                  color: "#FFFFFF",
                }}
              >
                R{walletData.totalSavings.toFixed(2)}
              </Text>
            </View>
            <View
              style={{
                width: 60,
                height: 60,
                borderRadius: 30,
                backgroundColor: "rgba(255,255,255,0.2)",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <PiggyBank size={30} color="#FFFFFF" />
            </View>
          </View>
          <Text
            style={{
              fontFamily: "Inter_400Regular",
              fontSize: 14,
              color: "rgba(255,255,255,0.9)",
            }}
          >
            Keep saving for your upcoming events and goals!
          </Text>
        </LinearGradient>
      </View>

      {/* Savings Goals */}
      <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
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
            Savings Goals
          </Text>
          <TouchableOpacity
            style={{
              backgroundColor: colors.primary,
              borderRadius: 8,
              paddingVertical: 6,
              paddingHorizontal: 12,
              flexDirection: "row",
              alignItems: "center",
              gap: 4,
            }}
          >
            <Plus size={16} color="#FFFFFF" />
            <Text
              style={{
                fontFamily: "Inter_600SemiBold",
                fontSize: 12,
                color: "#FFFFFF",
              }}
            >
              New Goal
            </Text>
          </TouchableOpacity>
        </View>

        {savingsGoals.map((goal) => (
          <View
            key={goal.id}
            style={{
              backgroundColor: colors.surface,
              borderRadius: 16,
              padding: 20,
              marginBottom: 16,
              borderWidth: isDark ? 1 : 0,
              borderColor: colors.border,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: goal.color + "20",
                  justifyContent: "center",
                  alignItems: "center",
                  marginRight: 12,
                }}
              >
                <goal.icon size={20} color={goal.color} />
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
                  {goal.name}
                </Text>
                <Text
                  style={{
                    fontFamily: "Inter_400Regular",
                    fontSize: 12,
                    color: colors.textSecondary,
                  }}
                >
                  Target: {goal.targetDate}
                </Text>
              </View>
              <Text
                style={{
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 14,
                  color: goal.color,
                }}
              >
                {(goal.progress * 100).toFixed(0)}%
              </Text>
            </View>

            <View
              style={{
                backgroundColor: colors.surfaceElevated,
                borderRadius: 12,
                padding: 12,
                marginBottom: 12,
              }}
            >
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
                    fontSize: 12,
                    color: colors.textSecondary,
                  }}
                >
                  Progress
                </Text>
                <Text
                  style={{
                    fontFamily: "Inter_600SemiBold",
                    fontSize: 12,
                    color: colors.text,
                  }}
                >
                  R{goal.currentAmount.toFixed(2)} / R{goal.targetAmount.toFixed(2)}
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
                    width: `${goal.progress * 100}%`,
                    backgroundColor: goal.color,
                  }}
                />
              </View>
            </View>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <View>
                <Text
                  style={{
                    fontFamily: "Inter_400Regular",
                    fontSize: 12,
                    color: colors.textSecondary,
                  }}
                >
                  Monthly Contribution
                </Text>
                <Text
                  style={{
                    fontFamily: "Inter_600SemiBold",
                    fontSize: 14,
                    color: colors.text,
                  }}
                >
                  R{goal.monthlyContribution.toFixed(2)}
                </Text>
              </View>
              <View style={{ flexDirection: "row", gap: 8 }}>
                <TouchableOpacity
                  style={{
                    backgroundColor: colors.surfaceElevated,
                    borderRadius: 8,
                    paddingVertical: 6,
                    paddingHorizontal: 12,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "Inter_500Medium",
                      fontSize: 12,
                      color: colors.text,
                    }}
                  >
                    Edit
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{
                    backgroundColor: goal.color,
                    borderRadius: 8,
                    paddingVertical: 6,
                    paddingHorizontal: 12,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "Inter_600SemiBold",
                      fontSize: 12,
                      color: "#FFFFFF",
                    }}
                  >
                    Add Money
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </View>

      {/* Auto-Save Settings */}
      <View style={{ paddingHorizontal: 20 }}>
        <Text
          style={{
            fontFamily: "Inter_600SemiBold",
            fontSize: 18,
            color: colors.text,
            marginBottom: 16,
          }}
        >
          Auto-Save Settings
        </Text>
        <View
          style={{
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
              marginBottom: 16,
            }}
          >
            <View>
              <Text
                style={{
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 16,
                  color: colors.text,
                  marginBottom: 4,
                }}
              >
                Round-Up Savings
              </Text>
              <Text
                style={{
                  fontFamily: "Inter_400Regular",
                  fontSize: 14,
                  color: colors.textSecondary,
                }}
              >
                Round up purchases to the nearest rand
              </Text>
            </View>
            <Switch
              value={true}
              onValueChange={() => {}}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <View>
              <Text
                style={{
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 16,
                  color: colors.text,
                  marginBottom: 4,
                }}
              >
                Event Savings
              </Text>
              <Text
                style={{
                  fontFamily: "Inter_400Regular",
                  fontSize: 14,
                  color: colors.textSecondary,
                }}
              >
                Auto-save for upcoming group events
              </Text>
            </View>
            <Switch
              value={true}
              onValueChange={() => {}}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>
      </View>
    </>
  );

  const renderVerificationTab = () => (
    <>
      {/* Verification Status */}
      <View
        style={{
          marginHorizontal: 20,
          marginBottom: 24,
        }}
      >
        <LinearGradient
          colors={isVerified ? [colors.success, "#4CAF50"] : [colors.warning, "#FF9800"]}
          style={{
            borderRadius: 20,
            padding: 24,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <View
              style={{
                width: 60,
                height: 60,
                borderRadius: 30,
                backgroundColor: "rgba(255,255,255,0.2)",
                justifyContent: "center",
                alignItems: "center",
                marginRight: 16,
              }}
            >
              {isVerified ? (
                <CheckCircle size={30} color="#FFFFFF" />
              ) : (
                <Shield size={30} color="#FFFFFF" />
              )}
            </View>
            <View>
              <Text
                style={{
                  fontFamily: "Inter_700Bold",
                  fontSize: 20,
                  color: "#FFFFFF",
                  marginBottom: 4,
                }}
              >
                {isVerified ? "Verified Account" : "Verification Pending"}
              </Text>
              <Text
                style={{
                  fontFamily: "Inter_400Regular",
                  fontSize: 14,
                  color: "rgba(255,255,255,0.9)",
                }}
              >
                {isVerified 
                  ? "Your ID has been verified successfully"
                  : "Complete verification to unlock all features"
                }
              </Text>
            </View>
          </View>
          {!isVerified && (
            <TouchableOpacity
              onPress={() => setShowVerificationModal(true)}
              style={{
                backgroundColor: "rgba(255,255,255,0.2)",
                borderRadius: 12,
                paddingVertical: 12,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 14,
                  color: "#FFFFFF",
                }}
              >
                Start Verification Process
              </Text>
            </TouchableOpacity>
          )}
        </LinearGradient>
      </View>

      {/* Verification Benefits */}
      <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
        <Text
          style={{
            fontFamily: "Inter_600SemiBold",
            fontSize: 18,
            color: colors.text,
            marginBottom: 16,
          }}
        >
          Verification Benefits
        </Text>
        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: 16,
            padding: 20,
            borderWidth: isDark ? 1 : 0,
            borderColor: colors.border,
          }}
        >
          {[
            { 
              icon: CreditCard, 
              title: "Payment Plans", 
              description: "Split payments into installments",
              available: isVerified 
            },
            { 
              icon: DollarSign, 
              title: "Higher Limits", 
              description: "Increased transaction and spending limits",
              available: isVerified 
            },
            { 
              icon: Shield, 
              title: "Enhanced Security", 
              description: "Additional account protection",
              available: isVerified 
            },
            { 
              icon: TrendingUp, 
              title: "Credit Building", 
              description: "Build your credit score with responsible use",
              available: isVerified 
            },
          ].map((benefit, index) => (
            <View
              key={index}
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: index < 3 ? 16 : 0,
                opacity: benefit.available ? 1 : 0.6,
              }}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: benefit.available ? colors.success + "20" : colors.border,
                  justifyContent: "center",
                  alignItems: "center",
                  marginRight: 12,
                }}
              >
                <benefit.icon 
                  size={20} 
                  color={benefit.available ? colors.success : colors.textSecondary} 
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontFamily: "Inter_600SemiBold",
                    fontSize: 14,
                    color: colors.text,
                    marginBottom: 2,
                  }}
                >
                  {benefit.title}
                </Text>
                <Text
                  style={{
                    fontFamily: "Inter_400Regular",
                    fontSize: 12,
                    color: colors.textSecondary,
                  }}
                >
                  {benefit.description}
                </Text>
              </View>
              {benefit.available && (
                <CheckCircle size={20} color={colors.success} />
              )}
            </View>
          ))}
        </View>
      </View>

      {/* Credit Information */}
      {isVerified && (
        <View style={{ paddingHorizontal: 20 }}>
          <Text
            style={{
              fontFamily: "Inter_600SemiBold",
              fontSize: 18,
              color: colors.text,
              marginBottom: 16,
            }}
          >
            Credit Information
          </Text>
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: 16,
              padding: 20,
              marginBottom: 16,
              borderWidth: isDark ? 1 : 0,
              borderColor: colors.border,
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
                  fontSize: 16,
                  color: colors.text,
                }}
              >
                Credit Score
              </Text>
              <Text
                style={{
                  fontFamily: "Inter_700Bold",
                  fontSize: 24,
                  color: colors.success,
                }}
              >
                {creditScore}
              </Text>
            </View>
            <View
              style={{
                height: 8,
                backgroundColor: colors.border,
                borderRadius: 4,
                overflow: "hidden",
                marginBottom: 16,
              }}
            >
              <View
                style={{
                  height: "100%",
                  width: `${(creditScore / 850) * 100}%`,
                  backgroundColor: colors.success,
                }}
              />
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
                Available Credit:
              </Text>
              <Text
                style={{
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 14,
                  color: colors.text,
                }}
              >
                R{borrowingLimit.toFixed(2)}
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
                Credit Utilization:
              </Text>
              <Text
                style={{
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 14,
                  color: colors.success,
                }}
              >
                {(walletData.creditUtilization * 100).toFixed(1)}%
              </Text>
            </View>
          </View>
        </View>
      )}
    </>
  );

  if (!loaded && !error) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <StatusBar style={colors.statusBar} />
        <Text style={{ color: colors.textSecondary }}>Loading wallet...</Text>
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
          <View>
            <Text
              style={{
                fontFamily: "Inter_700Bold",
                fontSize: 28,
                color: colors.text,
              }}
            >
              My Wallet
            </Text>
            <Text
              style={{
                fontFamily: "Inter_400Regular",
                fontSize: 16,
                color: colors.textSecondary,
              }}
            >
              {isVerified ? "Verified Account" : "Complete verification for full access"}
            </Text>
          </View>
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
            <Settings size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Tab Navigation */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8 }}
        >
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingVertical: 8,
                paddingHorizontal: 16,
                borderRadius: 20,
                backgroundColor: activeTab === tab.key ? colors.primary : colors.surfaceElevated,
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
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
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
        {activeTab === "wallet" && renderWalletTab()}
        {activeTab === "payment_plans" && renderPaymentPlansTab()}
        {activeTab === "savings" && renderSavingsTab()}
        {activeTab === "verification" && renderVerificationTab()}
      </ScrollView>

      {renderPaymentPlanModal()}
      {renderVerificationModal()}
    </View>
  );
}

