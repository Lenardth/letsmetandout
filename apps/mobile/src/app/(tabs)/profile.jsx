import { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import {
  Edit3,
  Settings,
  Camera,
  MapPin,
  Users,
  Calendar,
  Star,
  Award,
  TrendingUp,
  ChevronRight,
  Shield,
  Bell,
  HelpCircle,
  LogOut,
  Wallet,
  UserPlus,
} from "lucide-react-native";
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from "@expo-google-fonts/inter";
import { useTheme } from "../../utils/theme";

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const [loaded, error] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const handleScroll = useCallback((event) => {
    const scrollY = event.nativeEvent.contentOffset.y;
    setIsScrolled(scrollY > 0);
  }, []);

  const userProfile = {
    name: "Sipho Mthembu",
    age: 26,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&crop=face",
    location: "Cape Town, WC",
    bio: "Love exploring SA's beautiful landscapes, trying new restaurants, and meeting interesting people. Always up for a good braai or coffee chat!",
    interests: ["Coffee", "Hiking", "Photography", "Braai", "Rugby", "Travel"],
    joinedDate: "March 2024",
    photos: [
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face",
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&h=200&fit=crop",
      "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=200&h=200&fit=crop",
      "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=200&h=200&fit=crop",
    ],
  };

  const stats = [
    { label: "Connections", value: 47, icon: UserPlus },
    { label: "Groups Joined", value: 8, icon: Users },
    { label: "Meetups", value: 15, icon: Calendar },
  ];

  const achievements = [
    {
      title: "Social Explorer",
      description: "Joined 5+ different groups",
      icon: Users,
      color: colors.primary,
    },
    {
      title: "Adventure Seeker",
      description: "Attended outdoor activities",
      icon: TrendingUp,
      color: colors.success,
    },
    {
      title: "Community Builder",
      description: "Helped organize 3+ meetups",
      icon: Star,
      color: colors.warning,
    },
  ];

  const menuItems = [
    { title: "Edit Profile", icon: Edit3, color: colors.primary },
    { title: "My Groups", icon: Users, color: colors.textSecondary },
    { title: "Wallet & Payments", icon: Wallet, color: colors.textSecondary },
    { title: "Privacy & Safety", icon: Shield, color: colors.textSecondary },
    { title: "Notifications", icon: Bell, color: colors.textSecondary },
    { title: "Settings", icon: Settings, color: colors.textSecondary },
    { title: "Help & Support", icon: HelpCircle, color: colors.textSecondary },
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
            <Edit3 size={20} color={colors.textSecondary} />
          </TouchableOpacity>
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
        {/* Profile Card */}
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
              padding: 20,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 16,
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
                <TouchableOpacity
                  style={{
                    position: "absolute",
                    bottom: 2,
                    right: 2,
                    width: 28,
                    height: 28,
                    borderRadius: 14,
                    backgroundColor: "#FFFFFF",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Camera size={16} color={colors.primary} />
                </TouchableOpacity>
              </View>

              <View style={{ flex: 1, marginLeft: 16 }}>
                <Text
                  style={{
                    fontFamily: "Inter_600SemiBold",
                    fontSize: 24,
                    color: "#FFFFFF",
                    marginBottom: 4,
                  }}
                >
                  {userProfile.name}, {userProfile.age}
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 4,
                  }}
                >
                  <MapPin size={16} color="rgba(255,255,255,0.8)" />
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
                <Text
                  style={{
                    fontFamily: "Inter_400Regular",
                    fontSize: 12,
                    color: "rgba(255,255,255,0.7)",
                  }}
                >
                  Member since {userProfile.joinedDate}
                </Text>
              </View>
            </View>

            <Text
              style={{
                fontFamily: "Inter_400Regular",
                fontSize: 14,
                color: "rgba(255,255,255,0.9)",
                lineHeight: 20,
                marginBottom: 16,
              }}
            >
              {userProfile.bio}
            </Text>

            {/* Interests */}
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: 8,
              }}
            >
              {userProfile.interests.map((interest, index) => (
                <View
                  key={index}
                  style={{
                    backgroundColor: "rgba(255,255,255,0.2)",
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 12,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "Inter_500Medium",
                      fontSize: 12,
                      color: "#FFFFFF",
                    }}
                  >
                    {interest}
                  </Text>
                </View>
              ))}
            </View>
          </LinearGradient>
        </View>

        {/* Stats */}
        <View
          style={{
            marginHorizontal: 20,
            marginBottom: 24,
          }}
        >
          <View
            style={{
              backgroundColor: colors.surfaceElevated,
              borderRadius: 16,
              padding: 20,
              flexDirection: "row",
              justifyContent: "space-between",
              borderWidth: isDark ? 1 : 0,
              borderColor: colors.border,
            }}
          >
            {stats.map((stat, index) => (
              <View
                key={index}
                style={{
                  alignItems: "center",
                  flex: 1,
                }}
              >
                <View
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    backgroundColor: colors.primary,
                    justifyContent: "center",
                    alignItems: "center",
                    marginBottom: 8,
                  }}
                >
                  <stat.icon size={24} color="#FFFFFF" />
                </View>
                <Text
                  style={{
                    fontFamily: "Inter_600SemiBold",
                    fontSize: 20,
                    color: colors.text,
                    marginBottom: 2,
                  }}
                >
                  {stat.value}
                </Text>
                <Text
                  style={{
                    fontFamily: "Inter_400Regular",
                    fontSize: 12,
                    color: colors.textSecondary,
                    textAlign: "center",
                  }}
                >
                  {stat.label}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Photo Gallery */}
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
                fontSize: 20,
                color: colors.text,
              }}
            >
              My Photos
            </Text>
            <TouchableOpacity>
              <Text
                style={{
                  fontFamily: "Inter_500Medium",
                  fontSize: 14,
                  color: colors.primary,
                }}
              >
                Add Photos
              </Text>
            </TouchableOpacity>
          </View>

          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 8,
            }}
          >
            {userProfile.photos.map((photo, index) => (
              <TouchableOpacity
                key={index}
                style={{
                  width: (100 - 3 * 8) / 4 + "%",
                  aspectRatio: 1,
                  borderRadius: 12,
                  overflow: "hidden",
                }}
              >
                <Image
                  source={{ uri: photo }}
                  style={{
                    width: "100%",
                    height: "100%",
                  }}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Achievements */}
        <View
          style={{
            marginHorizontal: 20,
            marginBottom: 24,
          }}
        >
          <Text
            style={{
              fontFamily: "Inter_600SemiBold",
              fontSize: 20,
              color: colors.text,
              marginBottom: 16,
            }}
          >
            Achievements
          </Text>

          <View style={{ gap: 12 }}>
            {achievements.map((achievement, index) => (
              <TouchableOpacity
                key={index}
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: 16,
                  padding: 16,
                  flexDirection: "row",
                  alignItems: "center",
                  borderWidth: isDark ? 1 : 0,
                  borderColor: colors.border,
                }}
              >
                <View
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    backgroundColor: achievement.color,
                    justifyContent: "center",
                    alignItems: "center",
                    marginRight: 16,
                  }}
                >
                  <achievement.icon size={24} color="#FFFFFF" />
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
                    {achievement.title}
                  </Text>
                  <Text
                    style={{
                      fontFamily: "Inter_400Regular",
                      fontSize: 14,
                      color: colors.textSecondary,
                    }}
                  >
                    {achievement.description}
                  </Text>
                </View>

                <Award size={20} color={achievement.color} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Settings Menu */}
        <View
          style={{
            marginHorizontal: 20,
            marginBottom: 24,
          }}
        >
          <Text
            style={{
              fontFamily: "Inter_600SemiBold",
              fontSize: 20,
              color: colors.text,
              marginBottom: 16,
            }}
          >
            Settings
          </Text>

          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: 16,
              borderWidth: isDark ? 1 : 0,
              borderColor: colors.border,
            }}
          >
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  padding: 16,
                  borderBottomWidth: index < menuItems.length - 1 ? 1 : 0,
                  borderBottomColor: colors.divider,
                }}
              >
                <item.icon size={20} color={item.color} />
                <Text
                  style={{
                    fontFamily: "Inter_500Medium",
                    fontSize: 16,
                    color: colors.text,
                    marginLeft: 16,
                    flex: 1,
                  }}
                >
                  {item.title}
                </Text>
                <ChevronRight size={20} color={colors.border} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Logout Button */}
        <View
          style={{
            marginHorizontal: 20,
            marginBottom: 20,
          }}
        >
          <TouchableOpacity
            style={{
              backgroundColor: colors.surface,
              borderRadius: 16,
              paddingVertical: 16,
              alignItems: "center",
              flexDirection: "row",
              justifyContent: "center",
              borderWidth: isDark ? 1 : 0,
              borderColor: colors.border,
            }}
          >
            <LogOut size={20} color={colors.danger} />
            <Text
              style={{
                fontFamily: "Inter_600SemiBold",
                fontSize: 16,
                color: colors.danger,
                marginLeft: 8,
              }}
            >
              Sign Out
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}