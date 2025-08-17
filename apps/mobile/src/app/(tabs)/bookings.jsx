// app/bookings.jsx
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  useFonts,
} from "@expo-google-fonts/inter";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import {
  ArrowRight,
  Calendar,
  CheckCircle,
  Coffee,
  HelpCircle,
  MapPin,
  Plus,
  ShoppingBag,
  Users,
  Utensils,
  XCircle,
} from "lucide-react-native";
import { useCallback, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../utils/theme"; // adjust path if needed

export default function BookingsScreen() {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState("upcoming");
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

  const bookings = [
    {
      id: 1,
      title: "Coffee Tasting",
      store: "Truth Coffee Roasting",
      date: "Tomorrow, 10:00 AM",
      location: "36 Buitenkant St, Cape Town",
      participants: 4,
      status: "confirmed",
      type: "coffee",
      amount: 320.0,
    },
    {
      id: 2,
      title: "Group Dinner",
      store: "Gold Restaurant",
      date: "Saturday, 7:00 PM",
      location: "15 Bennett St, Cape Town",
      participants: 6,
      status: "pending",
      type: "restaurant",
      amount: 1200.0,
    },
    {
      id: 3,
      title: "Brunch Meetup",
      store: "Knead Bakery",
      date: "Sunday, 11:00 AM",
      location: "50 Regent Rd, Sea Point",
      participants: 5,
      status: "confirmed",
      type: "bakery",
      amount: 750.0,
    },
    {
      id: 4,
      title: "Team Coffee Break",
      store: "Vida e Caffè",
      date: "Monday, 3:00 PM",
      location: "V&A Waterfront",
      participants: 8,
      status: "cancelled",
      type: "coffee",
      amount: 480.0,
    },
  ];

  const filterOptions = [
    { key: "upcoming", label: "Upcoming" },
    { key: "pending", label: "Pending" },
    { key: "past", label: "Past" },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed":
        return colors.success;
      case "pending":
        return colors.warning;
      case "cancelled":
        return colors.danger ?? colors.error ?? "#e74c3c"; // ✅ fallback
      default:
        return colors.textSecondary;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "confirmed":
        return CheckCircle;
      case "pending":
        return HelpCircle;
      case "cancelled":
        return XCircle;
      default:
        return HelpCircle;
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "coffee":
        return Coffee;
      case "restaurant":
        return Utensils;
      case "bakery":
        return ShoppingBag;
      default:
        return ShoppingBag;
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    if (activeFilter === "upcoming") return booking.status === "confirmed";
    if (activeFilter === "pending") return booking.status === "pending";
    if (activeFilter === "past") return booking.status === "cancelled";
    return true;
  });

  if (!loaded && !error) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.background,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
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
            Bookings
          </Text>
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
        <Text
          style={{
            fontFamily: "Inter_400Regular",
            fontSize: 16,
            color: colors.textSecondary,
          }}
        >
          Manage your group bookings
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
        {/* Quick Book Banner */}
        <View style={{ marginHorizontal: 20, marginBottom: 24 }}>
          <LinearGradient
            colors={[colors.success, colors.primary]}
            style={{ borderRadius: 16, padding: 20 }}
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
                  Instant Group Booking
                </Text>
                <Text
                  style={{
                    fontFamily: "Inter_400Regular",
                    fontSize: 14,
                    color: "rgba(255,255,255,0.9)",
                    marginBottom: 16,
                  }}
                >
                  Book now and invite your group later
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
                    Quick Book
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
            {filterOptions.map((filter) => (
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
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Bookings List */}
        <View style={{ paddingHorizontal: 20 }}>
          {filteredBookings.map((booking) => {
            const StatusIcon = getStatusIcon(booking.status);
            const TypeIcon = getTypeIcon(booking.type);
            const statusColor = getStatusColor(booking.status);

            return (
              <TouchableOpacity
                key={booking.id}
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: 16,
                  padding: 16,
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
                    marginBottom: 12,
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <TypeIcon size={24} color={colors.primary} />
                    <Text
                      style={{
                        fontFamily: "Inter_600SemiBold",
                        fontSize: 18,
                        color: colors.text,
                        marginLeft: 12,
                      }}
                    >
                      {booking.title}
                    </Text>
                  </View>

                  <View
                    style={{
                      backgroundColor: statusColor,
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      borderRadius: 12,
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <StatusIcon size={14} color="#FFFFFF" />
                    <Text
                      style={{
                        fontFamily: "Inter_600SemiBold",
                        fontSize: 12,
                        color: "#FFFFFF",
                        marginLeft: 4,
                      }}
                    >
                      {booking.status.toUpperCase()}
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
                  {booking.store}
                </Text>

                <View style={{ marginBottom: 12 }}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginBottom: 6,
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
                      {booking.date}
                    </Text>
                  </View>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginBottom: 6,
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
                      {booking.location}
                    </Text>
                  </View>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Users size={16} color={colors.textSecondary} />
                    <Text
                      style={{
                        fontFamily: "Inter_400Regular",
                        fontSize: 14,
                        color: colors.textSecondary,
                        marginLeft: 8,
                      }}
                    >
                      {booking.participants} people
                    </Text>

                    <View style={{ flex: 1 }} />

                    <Text
                      style={{
                        fontFamily: "Inter_600SemiBold",
                        fontSize: 16,
                        color: colors.text,
                      }}
                    >
                      R{booking.amount.toFixed(2)}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    backgroundColor: colors.surfaceElevated,
                    borderRadius: 12,
                    padding: 12,
                    marginTop: 8,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "Inter_500Medium",
                      fontSize: 14,
                      color: colors.text,
                    }}
                  >
                    View booking details
                  </Text>
                  <ArrowRight size={18} color={colors.textSecondary} />
                </TouchableOpacity>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Empty State */}
        {filteredBookings.length === 0 && (
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
              No bookings found
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
              Try creating a new booking or adjust your filters
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
