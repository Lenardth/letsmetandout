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
  Bell,
  CheckCircle,
  ChevronRight,
  Edit3,
  Lock,
  MapPin,
  MessageCircle,
  Navigation,
  Phone,
  PhoneCall,
  Settings,
  Shield,
  ShieldCheck,
  UserCheck,
  Users,
  Zap
} from "lucide-react-native";
import { useCallback, useState } from "react";
import {
  Alert,
  Image,
  RefreshControl,
  ScrollView,
  Switch,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../utils/theme";

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [safetyMode, setSafetyMode] = useState(true);
  const [locationSharing, setLocationSharing] = useState(true);
  const [emergencyMode, setEmergencyMode] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState("verified");

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

  const handleEmergencyAlert = () => {
    Alert.alert(
      "Emergency Alert",
      "This will send your location and alert to your emergency contacts and local authorities. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Send Alert", 
          style: "destructive",
          onPress: () => {
            setEmergencyMode(true);
            // Trigger emergency protocol
          }
        },
      ]
    );
  };

  const userProfile = {
    name: "Thabo Mthembu",
    username: "@thabo_m",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&crop=face",
    location: "Cape Town, South Africa",
    joinDate: "March 2023",
    rating: 4.8,
    totalMeetups: 47,
    groupsJoined: 12,
    safetyScore: 95,
    verificationBadges: ["ID Verified", "Phone Verified", "Address Verified"],
  };

  const emergencyContacts = [
    { name: "Nomsa Mthembu", relation: "Sister", phone: "+27 82 123 4567" },
    { name: "Sipho Dlamini", relation: "Friend", phone: "+27 83 987 6543" },
  ];

  const safetyFeatures = [
    {
      id: 1,
      title: "Real-time Location Sharing",
      description: "Share your location with trusted contacts during meetups",
      icon: Navigation,
      enabled: locationSharing,
      toggle: setLocationSharing,
      color: colors.primary,
    },
    {
      id: 2,
      title: "Safety Check-ins",
      description: "Automatic safety check-ins during events",
      icon: ShieldCheck,
      enabled: safetyMode,
      toggle: setSafetyMode,
      color: colors.success,
    },
    {
      id: 3,
      title: "Emergency Alert",
      description: "Quick access to emergency services and contacts",
      icon: AlertTriangle,
      enabled: true,
      action: handleEmergencyAlert,
      color: colors.error,
    },
    {
      id: 4,
      title: "Group Verification",
      description: "Only join verified groups with background-checked hosts",
      icon: UserCheck,
      enabled: true,
      color: colors.info,
    },
  ];

  const profileSections = [
    {
      title: "Account Settings",
      items: [
        { title: "Edit Profile", icon: Edit3, action: () => {} },
        { title: "Privacy Settings", icon: Lock, action: () => {} },
        { title: "Notification Preferences", icon: Bell, action: () => {} },
      ],
    },
    {
      title: "Safety & Security",
      items: [
        { title: "Emergency Contacts", icon: PhoneCall, action: () => {} },
        { title: "Safety Settings", icon: Shield, action: () => {} },
        { title: "Verification Center", icon: CheckCircle, action: () => {} },
        { title: "Report Safety Issue", icon: AlertTriangle, action: () => {} },
      ],
    },
    {
      title: "Support",
      items: [
        { title: "Help Center", icon: MessageCircle, action: () => {} },
        { title: "Contact Support", icon: Phone, action: () => {} },
        { title: "Community Guidelines", icon: Users, action: () => {} },
      ],
    },
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
            Profile
          </Text>
          <View style={{ flexDirection: "row", gap: 12 }}>
            {emergencyMode && (
              <TouchableOpacity
                style={{
                  backgroundColor: colors.error,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 16,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <Zap size={16} color="#FFFFFF" />
                <Text
                  style={{
                    fontFamily: "Inter_600SemiBold",
                    fontSize: 12,
                    color: "#FFFFFF",
                  }}
                >
                  EMERGENCY
                </Text>
              </TouchableOpacity>
            )}
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
        {/* Profile Header */}
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
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <View style={{ position: "relative" }}>
                <Image
                  source={{ uri: userProfile.avatar }}
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 40,
                    borderWidth: 3,
                    borderColor: "#FFFFFF",
                  }}
                />
                {verificationStatus === "verified" && (
                  <View
                    style={{
                      position: "absolute",
                      bottom: 0,
                      right: 0,
                      width: 24,
                      height: 24,
                      borderRadius: 12,
                      backgroundColor: colors.success,
                      justifyContent: "center",
                      alignItems: "center",
                      borderWidth: 2,
                      borderColor: "#FFFFFF",
                    }}
                  >
                    <CheckCircle size={14} color="#FFFFFF" />
                  </View>
                )}
              </View>

              <View style={{ flex: 1, marginLeft: 16 }}>
                <Text
                  style={{
                    fontFamily: "Inter_700Bold",
                    fontSize: 24,
                    color: "#FFFFFF",
                    marginBottom: 4,
                  }}
                >
                  {userProfile.name}
                </Text>
                <Text
                  style={{
                    fontFamily: "Inter_400Regular",
                    fontSize: 16,
                    color: "rgba(255,255,255,0.8)",
                    marginBottom: 8,
                  }}
                >
                  {userProfile.username}
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <MapPin size={14} color="rgba(255,255,255,0.8)" />
                  <Text
                    style={{
                      fontFamily: "Inter_400Regular",
                      fontSize: 14,
                      color: "rgba(255,255,255,0.8)",
                      marginLeft: 4,
                    }}
                  >
                    {userProfile.location}
                  </Text>
                </View>
              </View>
            </View>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <View style={{ alignItems: "center" }}>
                <Text
                  style={{
                    fontFamily: "Inter_700Bold",
                    fontSize: 20,
                    color: "#FFFFFF",
                  }}
                >
                  {userProfile.rating}
                </Text>
                <Text
                  style={{
                    fontFamily: "Inter_400Regular",
                    fontSize: 12,
                    color: "rgba(255,255,255,0.7)",
                  }}
                >
                  Rating
                </Text>
              </View>
              <View style={{ alignItems: "center" }}>
                <Text
                  style={{
                    fontFamily: "Inter_700Bold",
                    fontSize: 20,
                    color: "#FFFFFF",
                  }}
                >
                  {userProfile.totalMeetups}
                </Text>
                <Text
                  style={{
                    fontFamily: "Inter_400Regular",
                    fontSize: 12,
                    color: "rgba(255,255,255,0.7)",
                  }}
                >
                  Meetups
                </Text>
              </View>
              <View style={{ alignItems: "center" }}>
                <Text
                  style={{
                    fontFamily: "Inter_700Bold",
                    fontSize: 20,
                    color: "#FFFFFF",
                  }}
                >
                  {userProfile.groupsJoined}
                </Text>
                <Text
                  style={{
                    fontFamily: "Inter_400Regular",
                    fontSize: 12,
                    color: "rgba(255,255,255,0.7)",
                  }}
                >
                  Groups
                </Text>
              </View>
              <View style={{ alignItems: "center" }}>
                <Text
                  style={{
                    fontFamily: "Inter_700Bold",
                    fontSize: 20,
                    color: "#FFFFFF",
                  }}
                >
                  {userProfile.safetyScore}%
                </Text>
                <Text
                  style={{
                    fontFamily: "Inter_400Regular",
                    fontSize: 12,
                    color: "rgba(255,255,255,0.7)",
                  }}
                >
                  Safety
                </Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Safety Features */}
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
            Safety Features
          </Text>

          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: 16,
              borderWidth: isDark ? 1 : 0,
              borderColor: colors.border,
            }}
          >
            {safetyFeatures.map((feature, index) => (
              <View
                key={feature.id}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  padding: 16,
                  borderBottomWidth: index < safetyFeatures.length - 1 ? 1 : 0,
                  borderBottomColor: colors.divider,
                }}
              >
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: feature.color,
                    justifyContent: "center",
                    alignItems: "center",
                    marginRight: 12,
                  }}
                >
                  <feature.icon size={20} color="#FFFFFF" />
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
                    {feature.title}
                  </Text>
                  <Text
                    style={{
                      fontFamily: "Inter_400Regular",
                      fontSize: 14,
                      color: colors.textSecondary,
                    }}
                  >
                    {feature.description}
                  </Text>
                </View>

                {feature.toggle ? (
                  <Switch
                    value={feature.enabled}
                    onValueChange={feature.toggle}
                    trackColor={{ false: colors.border, true: feature.color }}
                    thumbColor="#FFFFFF"
                  />
                ) : feature.action ? (
                  <TouchableOpacity
                    onPress={feature.action}
                    style={{
                      backgroundColor: feature.color,
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
                      ALERT
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <ChevronRight size={20} color={colors.textSecondary} />
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Emergency Contacts */}
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
              Emergency Contacts
            </Text>
            <TouchableOpacity>
              <Text
                style={{
                  fontFamily: "Inter_500Medium",
                  fontSize: 14,
                  color: colors.primary,
                }}
              >
                Add Contact
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
            {emergencyContacts.map((contact, index) => (
              <View
                key={index}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  padding: 16,
                  borderBottomWidth: index < emergencyContacts.length - 1 ? 1 : 0,
                  borderBottomColor: colors.divider,
                }}
              >
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: colors.error,
                    justifyContent: "center",
                    alignItems: "center",
                    marginRight: 12,
                  }}
                >
                  <PhoneCall size={20} color="#FFFFFF" />
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
                    {contact.name}
                  </Text>
                  <Text
                    style={{
                      fontFamily: "Inter_400Regular",
                      fontSize: 14,
                      color: colors.textSecondary,
                      marginBottom: 2,
                    }}
                  >
                    {contact.relation} • {contact.phone}
                  </Text>
                </View>

                <TouchableOpacity
                  style={{
                    backgroundColor: colors.success,
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
                    CALL
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        {/* Verification Badges */}
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
            Verification Status
          </Text>

          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 8,
            }}
          >
            {userProfile.verificationBadges.map((badge, index) => (
              <View
                key={index}
                style={{
                  backgroundColor: colors.success,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 16,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <CheckCircle size={14} color="#FFFFFF" />
                <Text
                  style={{
                    fontFamily: "Inter_600SemiBold",
                    fontSize: 12,
                    color: "#FFFFFF",
                  }}
                >
                  {badge}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Profile Sections */}
        {profileSections.map((section, sectionIndex) => (
          <View
            key={sectionIndex}
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
              {section.title}
            </Text>

            <View
              style={{
                backgroundColor: colors.surface,
                borderRadius: 16,
                borderWidth: isDark ? 1 : 0,
                borderColor: colors.border,
              }}
            >
              {section.items.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={item.action}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    padding: 16,
                    borderBottomWidth: index < section.items.length - 1 ? 1 : 0,
                    borderBottomColor: colors.divider,
                  }}
                >
                  <item.icon size={20} color={colors.textSecondary} style={{ marginRight: 12 }} />
                  <Text
                    style={{
                      flex: 1,
                      fontFamily: "Inter_500Medium",
                      fontSize: 16,
                      color: colors.text,
                    }}
                  >
                    {item.title}
                  </Text>
                  <ChevronRight size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}