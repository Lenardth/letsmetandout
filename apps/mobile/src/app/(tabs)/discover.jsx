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
  MapPin,
  Users,
  MessageCircle,
  Calendar,
  Heart,
  Bell,
  X,
  Star,
  Coffee,
  Utensils,
  Camera,
} from "lucide-react-native";
import {
  useFonts,
  Inter_300Light,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from "@expo-google-fonts/inter";
import { useTheme } from "../../utils/theme";

export default function DiscoverScreen() {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [currentProfileIndex, setCurrentProfileIndex] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);

  const [loaded, error] = useFonts({
    Inter_300Light,
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

  // Profile data for discovery - people looking for meetups
  const profiles = [
    {
      id: 1,
      name: "Sipho",
      age: 24,
      distance: "2.1 km from you",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop",
      interests: ["Coffee", "Hiking", "Photography", "Art"],
      groupSize: 3,
      activity: "Coffee & Photography Walk",
      location: "Cape Town, WC",
      budget: "R150",
    },
    {
      id: 2,
      name: "Thandi",
      age: 28,
      distance: "1.8 km from you",
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=500&fit=crop",
      interests: ["Food", "Music", "Dancing", "Culture"],
      groupSize: 4,
      activity: "Dinner & Live Music",
      location: "Johannesburg, GP",
      budget: "R300",
    },
    {
      id: 3,
      name: "Mandla",
      age: 26,
      distance: "3.2 km from you",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=500&fit=crop",
      interests: ["Sports", "Braai", "Rugby", "Outdoor"],
      groupSize: 5,
      activity: "Braai & Rugby",
      location: "Durban, KZN",
      budget: "R200",
    },
  ];

  const currentProfile = profiles[currentProfileIndex];

  const handleConnect = useCallback(() => {
    if (currentProfileIndex < profiles.length - 1) {
      setCurrentProfileIndex(currentProfileIndex + 1);
    } else {
      setCurrentProfileIndex(0);
    }
  }, [currentProfileIndex, profiles.length]);

  const handlePass = useCallback(() => {
    if (currentProfileIndex < profiles.length - 1) {
      setCurrentProfileIndex(currentProfileIndex + 1);
    } else {
      setCurrentProfileIndex(0);
    }
  }, [currentProfileIndex, profiles.length]);

  const getActivityIcon = (activity) => {
    if (activity.toLowerCase().includes('coffee')) return Coffee;
    if (activity.toLowerCase().includes('dinner') || activity.toLowerCase().includes('braai')) return Utensils;
    if (activity.toLowerCase().includes('photo')) return Camera;
    return Calendar;
  };

  const ActivityIcon = getActivityIcon(currentProfile?.activity || '');

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
          paddingTop: insets.top + 16,
          paddingHorizontal: 20,
          paddingBottom: 20,
          borderBottomWidth: isScrolled ? 1 : 0,
          borderBottomColor: colors.border,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Left: Avatar */}
          <Image
            source={{
              uri: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&h=40&fit=crop&crop=face",
            }}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
            }}
          />

          {/* Center: Greeting and Location */}
          <View style={{ flex: 1, alignItems: "center", marginHorizontal: 16 }}>
            <Text
              style={{
                fontFamily: "Inter_500Medium",
                fontSize: 16,
                color: colors.text,
                marginBottom: 4,
              }}
            >
              Discover Meetups
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <MapPin
                size={14}
                color={colors.textSecondary}
                strokeWidth={1.5}
              />
              <Text
                style={{
                  fontFamily: "Inter_400Regular",
                  fontSize: 14,
                  color: colors.textSecondary,
                  marginLeft: 4,
                }}
              >
                Cape Town, WC
              </Text>
            </View>
          </View>

          {/* Right: Notification Bell */}
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
            <Bell size={20} color={colors.textSecondary} strokeWidth={1.5} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: insets.top + 76,
          paddingBottom: insets.bottom + 20,
        }}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.text}
          />
        }
      >
        {/* Profile Card */}
        <View
          style={{
            marginHorizontal: 20,
            marginBottom: 20,
            borderRadius: 20,
            overflow: "hidden",
            height: 580,
            position: "relative",
          }}
        >
          <Image
            source={{ uri: currentProfile.image }}
            style={{
              width: "100%",
              height: "100%",
              position: "absolute",
            }}
            resizeMode="cover"
          />

          {/* Gradient overlay */}
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.7)"]}
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: 300,
            }}
          />

          {/* Group Size Badge */}
          <View
            style={{
              position: "absolute",
              top: 20,
              right: 20,
              backgroundColor: colors.primary,
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 20,
            }}
          >
            <Users size={16} color="#FFFFFF" />
            <Text
              style={{
                fontFamily: "Inter_600SemiBold",
                fontSize: 14,
                color: "#FFFFFF",
                marginLeft: 4,
              }}
            >
              {currentProfile.groupSize} people
            </Text>
          </View>

          {/* Activity Badge */}
          <View
            style={{
              position: "absolute",
              top: 20,
              left: 20,
              backgroundColor: "rgba(255,255,255,0.9)",
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 20,
            }}
          >
            <ActivityIcon size={16} color={colors.primary} />
            <Text
              style={{
                fontFamily: "Inter_600SemiBold",
                fontSize: 12,
                color: colors.primary,
                marginLeft: 4,
              }}
            >
              {currentProfile.activity}
            </Text>
          </View>

          {/* Profile Info */}
          <View
            style={{
              position: "absolute",
              bottom: 20,
              left: 20,
              right: 20,
            }}
          >
            <Text
              style={{
                fontFamily: "Inter_600SemiBold",
                fontSize: 28,
                color: "#FFFFFF",
                marginBottom: 6,
              }}
            >
              {currentProfile.name}, {currentProfile.age}
            </Text>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <MapPin size={14} color="#F1F1F1" strokeWidth={1.5} />
              <Text
                style={{
                  fontFamily: "Inter_400Regular",
                  fontSize: 14,
                  color: "#F1F1F1",
                  marginLeft: 4,
                }}
              >
                {currentProfile.distance} • {currentProfile.location}
              </Text>
            </View>

            {/* Budget */}
            <View
              style={{
                backgroundColor: "rgba(255,255,255,0.25)",
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 16,
                alignSelf: "flex-start",
                marginBottom: 16,
              }}
            >
              <Text
                style={{
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 16,
                  color: "#FFFFFF",
                }}
              >
                Budget: {currentProfile.budget}
              </Text>
            </View>

            {/* Interest Chips */}
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: 8,
              }}
            >
              {currentProfile.interests.map((interest, index) => (
                <View
                  key={index}
                  style={{
                    backgroundColor: "rgba(255,255,255,0.25)",
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
          </View>
        </View>

        {/* Action Buttons */}
        <View
          style={{
            marginHorizontal: 20,
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            gap: 24,
          }}
        >
          {/* Pass Button */}
          <TouchableOpacity
            onPress={handlePass}
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: colors.surface,
              justifyContent: "center",
              alignItems: "center",
              borderWidth: isDark ? 1 : 0,
              borderColor: colors.border,
            }}
          >
            <X size={24} color={colors.textSecondary} strokeWidth={2} />
          </TouchableOpacity>

          {/* Super Interest Button */}
          <TouchableOpacity
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: colors.warning,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Star size={20} color="#FFFFFF" fill="#FFFFFF" />
          </TouchableOpacity>

          {/* Connect Button */}
          <TouchableOpacity
            onPress={handleConnect}
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              backgroundColor: colors.primary,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Users size={28} color="#FFFFFF" strokeWidth={2} />
          </TouchableOpacity>

          {/* Message Button */}
          <TouchableOpacity
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: colors.info,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <MessageCircle size={20} color="#FFFFFF" strokeWidth={2} />
          </TouchableOpacity>

          {/* Plan Activity Button */}
          <TouchableOpacity
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: colors.success,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Calendar size={20} color="#FFFFFF" strokeWidth={2} />
          </TouchableOpacity>
        </View>

        {/* Profile Indicators */}
        <View
          style={{
            marginHorizontal: 20,
            marginTop: 24,
            flexDirection: "row",
            justifyContent: "center",
            gap: 8,
          }}
        >
          {profiles.map((_, index) => (
            <View
              key={index}
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor:
                  index === currentProfileIndex
                    ? colors.primary
                    : colors.border,
              }}
            />
          ))}
        </View>

        {/* Quick Stats */}
        <View
          style={{
            marginHorizontal: 20,
            marginTop: 32,
            backgroundColor: colors.surface,
            borderRadius: 16,
            padding: 20,
            flexDirection: "row",
            justifyContent: "space-around",
            borderWidth: isDark ? 1 : 0,
            borderColor: colors.border,
          }}
        >
          <View style={{ alignItems: "center" }}>
            <Text
              style={{
                fontFamily: "Inter_600SemiBold",
                fontSize: 24,
                color: colors.primary,
                marginBottom: 4,
              }}
            >
              8
            </Text>
            <Text
              style={{
                fontFamily: "Inter_400Regular",
                fontSize: 12,
                color: colors.textSecondary,
              }}
            >
              Connections Today
            </Text>
          </View>
          <View style={{ alignItems: "center" }}>
            <Text
              style={{
                fontFamily: "Inter_600SemiBold",
                fontSize: 24,
                color: colors.success,
                marginBottom: 4,
              }}
            >
              3
            </Text>
            <Text
              style={{
                fontFamily: "Inter_400Regular",
                fontSize: 12,
                color: colors.textSecondary,
              }}
            >
              Active Groups
            </Text>
          </View>
          <View style={{ alignItems: "center" }}>
            <Text
              style={{
                fontFamily: "Inter_600SemiBold",
                fontSize: 24,
                color: colors.warning,
                marginBottom: 4,
              }}
            >
              5
            </Text>
            <Text
              style={{
                fontFamily: "Inter_400Regular",
                fontSize: 12,
                color: colors.textSecondary,
              }}
            >
              Planned Meetups
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}