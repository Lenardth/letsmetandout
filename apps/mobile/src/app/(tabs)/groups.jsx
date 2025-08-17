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
} from "lucide-react-native";
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from "@expo-google-fonts/inter";
import { useTheme } from "../../utils/theme";

export default function GroupsScreen() {
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
      host: {
        name: "Sarah",
        avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b2c5?w=40&h=40&fit=crop&crop=face",
      },
      memberAvatars: [
        "https://images.unsplash.com/photo-1494790108755-2616b612b2c5?w=30&h=30&fit=crop&crop=face",
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=30&h=30&fit=crop&crop=face",
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=30&h=30&fit=crop&crop=face",
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=30&h=30&fit=crop&crop=face",
      ],
      status: "active",
      category: "coffee",
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
      host: {
        name: "Mandla",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
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
    },
    {
      id: 3,
      name: "Durban Hiking Squad",
      activity: "Table Mountain Hike",
      members: 3,
      maxMembers: 4,
      nextMeetup: "Sunday, 7:00 AM",
      location: "Table Mountain",
      budget: "R80",
      host: {
        name: "Nomsa",
        avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=40&h=40&fit=crop&crop=face",
      },
      memberAvatars: [
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=30&h=30&fit=crop&crop=face",
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=30&h=30&fit=crop&crop=face",
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=30&h=30&fit=crop&crop=face",
      ],
      status: "active",
      category: "outdoor",
    },
  ];

  const filterOptions = [
    { key: "all", label: "All Groups", count: groups.length },
    { key: "active", label: "Active", count: groups.filter(g => g.status === "active").length },
    { key: "available", label: "Join Available", count: groups.filter(g => g.members < g.maxMembers).length },
    { key: "my-groups", label: "My Groups", count: 2 },
  ];

  const getActivityIcon = (category) => {
    switch (category) {
      case "coffee": return Coffee;
      case "food": return Utensils;
      case "outdoor": return Mountain;
      default: return Users;
    }
  };

  const filteredGroups = groups.filter((group) => {
    switch (activeFilter) {
      case "active":
        return group.status === "active";
      case "available":
        return group.members < group.maxMembers;
      case "my-groups":
        return group.id <= 2; // Mock: user is in first 2 groups
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
        <Text
          style={{
            fontFamily: "Inter_400Regular",
            fontSize: 16,
            color: colors.textSecondary,
          }}
        >
          Join groups and plan amazing meetups
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
        {/* Create Group CTA */}
        <View
          style={{
            marginHorizontal: 20,
            marginBottom: 24,
          }}
        >
          <LinearGradient
            colors={[colors.primary, colors.primaryLight]}
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
                  Start Your Own Group
                </Text>
                <Text
                  style={{
                    fontFamily: "Inter_400Regular",
                    fontSize: 14,
                    color: "rgba(255,255,255,0.9)",
                    marginBottom: 16,
                  }}
                >
                  Create a group, invite friends, and plan activities together
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
                    Create Group
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
                <Plus size={30} color="#FFFFFF" />
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

        {/* Groups List */}
        <View style={{ paddingHorizontal: 20 }}>
          {filteredGroups.map((group, index) => {
            const ActivityIcon = getActivityIcon(group.category);
            const isJoinable = group.members < group.maxMembers;
            
            return (
              <TouchableOpacity
                key={group.id}
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: 16,
                  padding: 16,
                  marginBottom: index < filteredGroups.length - 1 ? 16 : 0,
                  borderWidth: isDark ? 1 : 0,
                  borderColor: colors.border,
                }}
              >
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
                        {group.name}
                      </Text>
                      <View
                        style={{
                          backgroundColor: isJoinable ? colors.success : colors.warning,
                          paddingHorizontal: 8,
                          paddingVertical: 4,
                          borderRadius: 12,
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
                          {isJoinable ? "OPEN" : "FULL"}
                        </Text>
                      </View>
                    </View>
                    <Text
                      style={{
                        fontFamily: "Inter_500Medium",
                        fontSize: 14,
                        color: colors.primary,
                        marginBottom: 8,
                      }}
                    >
                      {group.activity}
                    </Text>
                  </View>
                </View>

                {/* Group Details */}
                <View style={{ marginBottom: 12 }}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginBottom: 6,
                    }}
                  >
                    <Calendar size={14} color={colors.textSecondary} />
                    <Text
                      style={{
                        fontFamily: "Inter_400Regular",
                        fontSize: 14,
                        color: colors.textSecondary,
                        marginLeft: 6,
                      }}
                    >
                      {group.nextMeetup}
                    </Text>
                  </View>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginBottom: 6,
                    }}
                  >
                    <MapPin size={14} color={colors.textSecondary} />
                    <Text
                      style={{
                        fontFamily: "Inter_400Regular",
                        fontSize: 14,
                        color: colors.textSecondary,
                        marginLeft: 6,
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
                    <Text
                      style={{
                        fontFamily: "Inter_600SemiBold",
                        fontSize: 14,
                        color: colors.primary,
                      }}
                    >
                      {group.budget}
                    </Text>
                    <Text
                      style={{
                        fontFamily: "Inter_400Regular",
                        fontSize: 14,
                        color: colors.textSecondary,
                        marginLeft: 6,
                      }}
                    >
                      per person
                    </Text>
                  </View>
                </View>

                {/* Members */}
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
                      {group.memberAvatars.map((avatar, idx) => (
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
                      {group.members < group.maxMembers && (
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
                      {group.members}/{group.maxMembers} members
                    </Text>
                  </View>

                  <View style={{ flexDirection: "row", gap: 8 }}>
                    <TouchableOpacity
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 16,
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
                        backgroundColor: isJoinable ? colors.primary : colors.border,
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: "Inter_600SemiBold",
                          fontSize: 12,
                          color: isJoinable ? "#FFFFFF" : colors.textSecondary,
                        }}
                      >
                        {isJoinable ? "Join" : "View"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Empty State */}
        {filteredGroups.length === 0 && (
          <View
            style={{
              paddingHorizontal: 20,
              paddingVertical: 40,
              alignItems: "center",
            }}
          >
            <Users size={48} color={colors.border} />
            <Text
              style={{
                fontFamily: "Inter_600SemiBold",
                fontSize: 18,
                color: colors.textSecondary,
                marginTop: 16,
                marginBottom: 8,
              }}
            >
              No groups found
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
              Try adjusting your filters or create a new group to get started!
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}