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
  Calendar,
  Clock,
  MapPin,
  Users,
  Plus,
  Filter,
  Search,
  Coffee,
  Utensils,
  Mountain,
  MessageCircle,
  CheckCircle,
  AlertCircle,
} from "lucide-react-native";
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from "@expo-google-fonts/inter";
import { useTheme } from "../../utils/theme";

export default function PlansScreen() {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
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

  const plans = [
    {
      id: 1,
      title: "Coffee & Photography Walk",
      groupName: "Cape Town Coffee Lovers",
      date: "Tomorrow",
      time: "2:00 PM",
      location: "V&A Waterfront",
      participants: 4,
      maxParticipants: 5,
      status: "confirmed",
      category: "coffee",
      budget: "R120",
      host: "Sarah",
      memberAvatars: [
        "https://images.unsplash.com/photo-1494790108755-2616b612b2c5?w=30&h=30&fit=crop&crop=face",
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=30&h=30&fit=crop&crop=face",
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=30&h=30&fit=crop&crop=face",
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=30&h=30&fit=crop&crop=face",
      ],
      description: "Let's explore the waterfront while enjoying some great coffee and taking photos of the beautiful scenery."
    },
    {
      id: 2,
      title: "Weekend Braai & Rugby",
      groupName: "Braai Masters JHB",
      date: "Saturday",
      time: "4:00 PM",
      location: "Johannesburg North",
      participants: 5,
      maxParticipants: 5,
      status: "pending",
      category: "food",
      budget: "R250",
      host: "Mandla",
      memberAvatars: [
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=30&h=30&fit=crop&crop=face",
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=30&h=30&fit=crop&crop=face",
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=30&h=30&fit=crop&crop=face",
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=30&h=30&fit=crop&crop=face",
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=30&h=30&fit=crop&crop=face",
      ],
      description: "Traditional South African braai with rugby match viewing. Bring your appetite and team spirit!"
    },
    {
      id: 3,
      title: "Table Mountain Sunrise Hike",
      groupName: "Durban Hiking Squad",
      date: "Sunday",
      time: "6:00 AM",
      location: "Table Mountain",
      participants: 3,
      maxParticipants: 4,
      status: "confirmed",
      category: "outdoor",
      budget: "R80",
      host: "Nomsa",
      memberAvatars: [
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=30&h=30&fit=crop&crop=face",
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=30&h=30&fit=crop&crop=face",
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=30&h=30&fit=crop&crop=face",
      ],
      description: "Early morning hike to catch the stunning sunrise from Table Mountain. Bring layers and a headlamp!"
    },
    {
      id: 4,
      title: "Wine Tasting in Stellenbosch",
      groupName: "Wine Enthusiasts CT",
      date: "Next Friday",
      time: "11:00 AM",
      location: "Stellenbosch",
      participants: 2,
      maxParticipants: 3,
      status: "planning",
      category: "wine",
      budget: "R350",
      host: "Johan",
      memberAvatars: [
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=30&h=30&fit=crop&crop=face",
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=30&h=30&fit=crop&crop=face",
      ],
      description: "Explore the beautiful wine farms of Stellenbosch with tastings and a vineyard tour."
    },
  ];

  const filterOptions = [
    { key: "all", label: "All Plans", count: plans.length },
    { key: "confirmed", label: "Confirmed", count: plans.filter(p => p.status === "confirmed").length },
    { key: "pending", label: "Pending", count: plans.filter(p => p.status === "pending").length },
    { key: "this-week", label: "This Week", count: 3 },
  ];

  const getActivityIcon = (category) => {
    switch (category) {
      case "coffee": return Coffee;
      case "food": return Utensils;
      case "outdoor": return Mountain;
      case "wine": return Utensils;
      default: return Calendar;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed": return colors.success;
      case "pending": return colors.warning;
      case "planning": return colors.info;
      default: return colors.textSecondary;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "confirmed": return CheckCircle;
      case "pending": return Clock;
      case "planning": return AlertCircle;
      default: return Clock;
    }
  };

  const filteredPlans = plans.filter((plan) => {
    switch (activeFilter) {
      case "confirmed":
        return plan.status === "confirmed";
      case "pending":
        return plan.status === "pending";
      case "this-week":
        return plan.date.includes("Tomorrow") || plan.date.includes("Saturday") || plan.date.includes("Sunday");
      default:
        return true;
    }
  });

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
            marginBottom: 8,
          }}
        >
          <Text
            style={{
              fontFamily: "Inter_600SemiBold",
              fontSize: 28,
              color: colors.text,
            }}
          >
            Plans
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
        <Text
          style={{
            fontFamily: "Inter_400Regular",
            fontSize: 16,
            color: colors.textSecondary,
          }}
        >
          Your upcoming meetups and activities
        </Text>
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
        {/* Create Plan CTA */}
        <View
          style={{
            marginHorizontal: 20,
            marginBottom: 24,
          }}
        >
          <LinearGradient
            colors={[colors.info, colors.primary]}
            style={{
              borderRadius: 16,
              padding: 20,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontFamily: "Inter_600SemiBold",
                    fontSize: 18,
                    color: "#FFFFFF",
                    marginBottom: 4,
                  }}
                >
                  Plan Something Amazing
                </Text>
                <Text
                  style={{
                    fontFamily: "Inter_400Regular",
                    fontSize: 14,
                    color: "rgba(255,255,255,0.9)",
                    marginBottom: 16,
                  }}
                >
                  Create a new meetup plan and invite your group members
                </Text>
                <TouchableOpacity
                  style={{
                    backgroundColor: "rgba(255,255,255,0.2)",
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderRadius: 12,
                    alignSelf: "flex-start",
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "Inter_600SemiBold",
                      fontSize: 14,
                      color: "#FFFFFF",
                    }}
                  >
                    Create Plan
                  </Text>
                </TouchableOpacity>
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
                <Calendar size={30} color="#FFFFFF" />
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Filter Tabs */}
        <View style={{ marginBottom: 20 }}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20 }}
          >
            {filterOptions.map((filter, index) => (
              <TouchableOpacity
                key={filter.key}
                onPress={() => setActiveFilter(filter.key)}
                style={{
                  backgroundColor:
                    activeFilter === filter.key
                      ? colors.primary
                      : colors.surfaceElevated,
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 12,
                  marginRight: 12,
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontFamily: "Inter_500Medium",
                    fontSize: 14,
                    color:
                      activeFilter === filter.key
                        ? "#FFFFFF"
                        : colors.textSecondary,
                  }}
                >
                  {filter.label}
                </Text>
                <View
                  style={{
                    backgroundColor:
                      activeFilter === filter.key
                        ? "rgba(255,255,255,0.3)"
                        : colors.border,
                    paddingHorizontal: 6,
                    paddingVertical: 2,
                    borderRadius: 10,
                    marginLeft: 8,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "Inter_600SemiBold",
                      fontSize: 12,
                      color:
                        activeFilter === filter.key
                          ? "#FFFFFF"
                          : colors.textSecondary,
                    }}
                  >
                    {filter.count}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Plans List */}
        <View style={{ paddingHorizontal: 20 }}>
          {filteredPlans.map((plan, index) => {
            const ActivityIcon = getActivityIcon(plan.category);
            const StatusIcon = getStatusIcon(plan.status);
            const statusColor = getStatusColor(plan.status);
            
            return (
              <TouchableOpacity
                key={plan.id}
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: 16,
                  padding: 16,
                  marginBottom: index < filteredPlans.length - 1 ? 16 : 0,
                  borderWidth: isDark ? 1 : 0,
                  borderColor: colors.border,
                }}
              >
                {/* Header */}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "flex-start",
                    marginBottom: 12,
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
                      marginRight: 12,
                    }}
                  >
                    <ActivityIcon size={24} color="#FFFFFF" />
                  </View>

                  <View style={{ flex: 1 }}>
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: 4,
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: "Inter_600SemiBold",
                          fontSize: 16,
                          color: colors.text,
                          flex: 1,
                        }}
                      >
                        {plan.title}
                      </Text>
                      <View
                        style={{
                          backgroundColor: statusColor,
                          paddingHorizontal: 8,
                          paddingVertical: 4,
                          borderRadius: 12,
                          marginLeft: 8,
                          flexDirection: "row",
                          alignItems: "center",
                        }}
                      >
                        <StatusIcon size={12} color="#FFFFFF" />
                        <Text
                          style={{
                            fontFamily: "Inter_600SemiBold",
                            fontSize: 10,
                            color: "#FFFFFF",
                            marginLeft: 4,
                          }}
                        >
                          {plan.status.toUpperCase()}
                        </Text>
                      </View>
                    </View>
                    <Text
                      style={{
                        fontFamily: "Inter_500Medium",
                        fontSize: 14,
                        color: colors.primary,
                        marginBottom: 4,
                      }}
                    >
                      {plan.groupName}
                    </Text>
                  </View>
                </View>

                {/* Description */}
                <Text
                  style={{
                    fontFamily: "Inter_400Regular",
                    fontSize: 14,
                    color: colors.textSecondary,
                    lineHeight: 20,
                    marginBottom: 16,
                  }}
                >
                  {plan.description}
                </Text>

                {/* Plan Details */}
                <View style={{ marginBottom: 16 }}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginBottom: 8,
                    }}
                  >
                    <Calendar size={16} color={colors.textSecondary} />
                    <Text
                      style={{
                        fontFamily: "Inter_500Medium",
                        fontSize: 14,
                        color: colors.text,
                        marginLeft: 8,
                      }}
                    >
                      {plan.date} at {plan.time}
                    </Text>
                  </View>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginBottom: 8,
                    }}
                  >
                    <MapPin size={16} color={colors.textSecondary} />
                    <Text
                      style={{
                        fontFamily: "Inter_400Regular",
                        fontSize: 14,
                        color: colors.textSecondary,
                        marginLeft: 8,
                      }}
                    >
                      {plan.location}
                    </Text>
                  </View>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: "Inter_600SemiBold",
                        fontSize: 14,
                        color: colors.primary,
                      }}
                    >
                      {plan.budget}
                    </Text>
                    <Text
                      style={{
                        fontFamily: "Inter_400Regular",
                        fontSize: 14,
                        color: colors.textSecondary,
                        marginLeft: 6,
                      }}
                    >
                      per person • Hosted by {plan.host}
                    </Text>
                  </View>
                </View>

                {/* Participants and Actions */}
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
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        marginRight: 12,
                      }}
                    >
                      {plan.memberAvatars.map((avatar, idx) => (
                        <Image
                          key={idx}
                          source={{ uri: avatar }}
                          style={{
                            width: 24,
                            height: 24,
                            borderRadius: 12,
                            borderWidth: 2,
                            borderColor: colors.surface,
                            marginLeft: idx > 0 ? -8 : 0,
                          }}
                        />
                      ))}
                      {plan.participants < plan.maxParticipants && (
                        <View
                          style={{
                            width: 24,
                            height: 24,
                            borderRadius: 12,
                            backgroundColor: colors.border,
                            borderWidth: 2,
                            borderColor: colors.surface,
                            marginLeft: -8,
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          <Plus size={12} color={colors.textSecondary} />
                        </View>
                      )}
                    </View>
                    <Text
                      style={{
                        fontFamily: "Inter_500Medium",
                        fontSize: 12,
                        color: colors.textSecondary,
                      }}
                    >
                      {plan.participants}/{plan.maxParticipants} going
                    </Text>
                  </View>

                  <View style={{ flexDirection: "row", gap: 8 }}>
                    <TouchableOpacity
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 18,
                        backgroundColor: colors.surfaceElevated,
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <MessageCircle size={16} color={colors.textSecondary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={{
                        paddingHorizontal: 16,
                        paddingVertical: 8,
                        borderRadius: 16,
                        backgroundColor: colors.primary,
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: "Inter_600SemiBold",
                          fontSize: 12,
                          color: "#FFFFFF",
                        }}
                      >
                        View Details
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Empty State */}
        {filteredPlans.length === 0 && (
          <View
            style={{
              paddingHorizontal: 20,
              paddingVertical: 40,
              alignItems: "center",
            }}
          >
            <Calendar size={48} color={colors.border} />
            <Text
              style={{
                fontFamily: "Inter_600SemiBold",
                fontSize: 18,
                color: colors.textSecondary,
                marginTop: 16,
                marginBottom: 8,
              }}
            >
              No plans found
            </Text>
            <Text
              style={{
                fontFamily: "Inter_400Regular",
                fontSize: 14,
                color: colors.textTertiary,
                textAlign: "center",
                lineHeight: 20,
              }}
            >
              Try adjusting your filters or create a new plan to get started!
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}