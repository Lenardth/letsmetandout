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
  Book,
  Bookmark,
  Calendar,
  CheckCircle,
  ChevronRight,
  Coffee,
  Dumbbell,
  Filter,
  Heart,
  MapPin,
  Mountain,
  Music,
  Navigation,
  Palette,
  Plane,
  Search,
  Share2,
  Shield,
  Star,
  Target,
  TrendingUp,
  Users,
  Utensils,
  Zap
} from "lucide-react-native";
import { useCallback, useState } from "react";
import {
  Dimensions,
  Image,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../utils/theme";

const { width: screenWidth } = Dimensions.get("window");

export default function DiscoverScreen() {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeFilter, setActiveFilter] = useState("recommended");

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

  const categories = [
    { id: "all", title: "All", icon: Target, color: colors.primary },
    { id: "coffee", title: "Coffee", icon: Coffee, color: "#8B4513" },
    { id: "food", title: "Food", icon: Utensils, color: "#FF6B35" },
    { id: "outdoor", title: "Outdoor", icon: Mountain, color: "#4CAF50" },
    { id: "fitness", title: "Fitness", icon: Dumbbell, color: "#FF5722" },
    { id: "culture", title: "Culture", icon: Palette, color: "#9C27B0" },
    { id: "music", title: "Music", icon: Music, color: "#E91E63" },
    { id: "travel", title: "Travel", icon: Plane, color: "#2196F3" },
    { id: "books", title: "Books", icon: Book, color: "#795548" },
  ];

  const filters = [
    { id: "recommended", title: "Recommended", icon: Star },
    { id: "nearby", title: "Nearby", icon: Navigation },
    { id: "trending", title: "Trending", icon: TrendingUp },
    { id: "verified", title: "Verified", icon: Shield },
    { id: "new", title: "New", icon: Zap },
  ];

  const featuredEvents = [
    {
      id: 1,
      title: "Cape Town Coffee Crawl",
      description: "Explore the best coffee shops in the Mother City",
      image: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&h=200&fit=crop",
      category: "coffee",
      location: "Cape Town CBD",
      date: "Tomorrow",
      time: "10:00 AM",
      price: "R120",
      participants: 8,
      maxParticipants: 12,
      rating: 4.8,
      host: {
        name: "Sarah M.",
        avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b2c5?w=40&h=40&fit=crop&crop=face",
        verified: true,
        rating: 4.9,
      },
      safetyScore: 95,
      isVerified: true,
      isTrending: true,
      tags: ["Beginner Friendly", "Photography", "Local Guide"],
    },
    {
      id: 2,
      title: "Johannesburg Braai Experience",
      description: "Traditional South African braai with locals",
      image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=200&fit=crop",
      category: "food",
      location: "Johannesburg North",
      date: "Saturday",
      time: "4:00 PM",
      price: "R250",
      participants: 5,
      maxParticipants: 8,
      rating: 4.9,
      host: {
        name: "Mandla K.",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
        verified: true,
        rating: 4.8,
      },
      safetyScore: 92,
      isVerified: true,
      isTrending: false,
      tags: ["Cultural Experience", "Traditional Food", "Family Friendly"],
    },
    {
      id: 3,
      title: "Table Mountain Sunrise Hike",
      description: "Watch the sunrise from Africa's most famous mountain",
      image: "https://images.unsplash.com/photo-1580500550469-3e2b8e9c5b3b?w=400&h=200&fit=crop",
      category: "outdoor",
      location: "Table Mountain, Cape Town",
      date: "Sunday",
      time: "5:30 AM",
      price: "R180",
      participants: 6,
      maxParticipants: 10,
      rating: 4.7,
      host: {
        name: "Priya S.",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face",
        verified: true,
        rating: 4.7,
      },
      safetyScore: 88,
      isVerified: true,
      isTrending: true,
      tags: ["Adventure", "Photography", "Fitness"],
    },
  ];

  const quickDiscoverOptions = [
    {
      id: 1,
      title: "This Weekend",
      subtitle: "12 events",
      icon: Calendar,
      color: colors.primary,
      gradient: [colors.primary, colors.primaryLight],
    },
    {
      id: 2,
      title: "Near You",
      subtitle: "8 events",
      icon: MapPin,
      color: colors.success,
      gradient: [colors.success, "#4CAF50"],
    },
    {
      id: 3,
      title: "Verified Hosts",
      subtitle: "24 events",
      icon: Shield,
      color: colors.info,
      gradient: [colors.info, "#2196F3"],
    },
    {
      id: 4,
      title: "Free Events",
      subtitle: "6 events",
      icon: Heart,
      color: colors.warning,
      gradient: [colors.warning, "#FF9800"],
    },
  ];

  const trendingEvents = [
    {
      id: 4,
      title: "Wine Tasting in Stellenbosch",
      location: "Stellenbosch",
      date: "Next Friday",
      price: "R350",
      participants: 12,
      maxParticipants: 15,
      rating: 4.9,
      image: "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=300&h=150&fit=crop",
      safetyScore: 96,
      isVerified: true,
    },
    {
      id: 5,
      title: "Durban Beach Volleyball",
      location: "Durban Beachfront",
      date: "Saturday",
      price: "R80",
      participants: 8,
      maxParticipants: 12,
      rating: 4.6,
      image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=300&h=150&fit=crop",
      safetyScore: 89,
      isVerified: true,
    },
    {
      id: 6,
      title: "Pretoria Art Gallery Tour",
      location: "Pretoria CBD",
      date: "Sunday",
      price: "R150",
      participants: 6,
      maxParticipants: 10,
      rating: 4.8,
      image: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=300&h=150&fit=crop",
      safetyScore: 94,
      isVerified: true,
    },
  ];

  const renderEventCard = (event, isLarge = false) => (
    <TouchableOpacity
      key={event.id}
      style={{
        backgroundColor: colors.surface,
        borderRadius: 20,
        marginRight: isLarge ? 0 : 16,
        marginBottom: isLarge ? 16 : 0,
        width: isLarge ? "100%" : screenWidth * 0.8,
        borderWidth: isDark ? 1 : 0,
        borderColor: colors.border,
        overflow: "hidden",
      }}
    >
      {/* Event Image */}
      <View style={{ position: "relative" }}>
        <Image
          source={{ uri: event.image }}
          style={{
            width: "100%",
            height: isLarge ? 200 : 150,
          }}
        />
        
        {/* Overlay Badges */}
        <View
          style={{
            position: "absolute",
            top: 12,
            left: 12,
            right: 12,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <View style={{ flexDirection: "row", gap: 8 }}>
            {event.isVerified && (
              <View
                style={{
                  backgroundColor: colors.success,
                  borderRadius: 12,
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <Shield size={12} color="#FFFFFF" />
                <Text
                  style={{
                    fontFamily: "Inter_600SemiBold",
                    fontSize: 10,
                    color: "#FFFFFF",
                  }}
                >
                  VERIFIED
                </Text>
              </View>
            )}
            {event.isTrending && (
              <View
                style={{
                  backgroundColor: colors.warning,
                  borderRadius: 12,
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <TrendingUp size={12} color="#FFFFFF" />
                <Text
                  style={{
                    fontFamily: "Inter_600SemiBold",
                    fontSize: 10,
                    color: "#FFFFFF",
                  }}
                >
                  TRENDING
                </Text>
              </View>
            )}
          </View>
          
          <View style={{ flexDirection: "row", gap: 8 }}>
            <TouchableOpacity
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: "rgba(0,0,0,0.5)",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Bookmark size={16} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: "rgba(0,0,0,0.5)",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Share2 size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Safety Score */}
        <View
          style={{
            position: "absolute",
            bottom: 12,
            right: 12,
            backgroundColor: "rgba(0,0,0,0.7)",
            borderRadius: 12,
            paddingHorizontal: 8,
            paddingVertical: 4,
            flexDirection: "row",
            alignItems: "center",
            gap: 4,
          }}
        >
          <Shield size={12} color={colors.success} />
          <Text
            style={{
              fontFamily: "Inter_600SemiBold",
              fontSize: 10,
              color: "#FFFFFF",
            }}
          >
            {event.safetyScore}%
          </Text>
        </View>
      </View>

      {/* Event Content */}
      <View style={{ padding: 16 }}>
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
                fontFamily: "Inter_700Bold",
                fontSize: isLarge ? 18 : 16,
                color: colors.text,
                marginBottom: 4,
              }}
            >
              {event.title}
            </Text>
            <Text
              style={{
                fontFamily: "Inter_400Regular",
                fontSize: 14,
                color: colors.textSecondary,
                marginBottom: 8,
              }}
            >
              {event.description}
            </Text>
          </View>
          <Text
            style={{
              fontFamily: "Inter_700Bold",
              fontSize: isLarge ? 20 : 18,
              color: colors.primary,
              marginLeft: 12,
            }}
          >
            {event.price}
          </Text>
        </View>

        {/* Event Details */}
        <View style={{ gap: 6, marginBottom: 12 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
            }}
          >
            <MapPin size={14} color={colors.textSecondary} />
            <Text
              style={{
                fontFamily: "Inter_500Medium",
                fontSize: 14,
                color: colors.textSecondary,
              }}
            >
              {event.location}
            </Text>
          </View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
            }}
          >
            <Calendar size={14} color={colors.textSecondary} />
            <Text
              style={{
                fontFamily: "Inter_500Medium",
                fontSize: 14,
                color: colors.textSecondary,
              }}
            >
              {event.date} at {event.time}
            </Text>
          </View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
            }}
          >
            <Users size={14} color={colors.textSecondary} />
            <Text
              style={{
                fontFamily: "Inter_500Medium",
                fontSize: 14,
                color: colors.textSecondary,
              }}
            >
              {event.participants}/{event.maxParticipants} participants
            </Text>
          </View>
        </View>

        {/* Host Info */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 12,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Image
              source={{ uri: event.host.avatar }}
              style={{
                width: 24,
                height: 24,
                borderRadius: 12,
              }}
            />
            <Text
              style={{
                fontFamily: "Inter_500Medium",
                fontSize: 14,
                color: colors.text,
              }}
            >
              {event.host.name}
            </Text>
            {event.host.verified && (
              <CheckCircle size={14} color={colors.success} />
            )}
          </View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 4,
            }}
          >
            <Star size={14} color={colors.warning} />
            <Text
              style={{
                fontFamily: "Inter_600SemiBold",
                fontSize: 14,
                color: colors.text,
              }}
            >
              {event.rating}
            </Text>
          </View>
        </View>

        {/* Tags */}
        {event.tags && (
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 6,
              marginBottom: 12,
            }}
          >
            {event.tags.slice(0, 3).map((tag, index) => (
              <View
                key={index}
                style={{
                  backgroundColor: colors.primary + "20",
                  borderRadius: 8,
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                }}
              >
                <Text
                  style={{
                    fontFamily: "Inter_500Medium",
                    fontSize: 10,
                    color: colors.primary,
                  }}
                >
                  {tag}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Action Button */}
        <TouchableOpacity
          style={{
            backgroundColor: colors.primary,
            borderRadius: 12,
            paddingVertical: 12,
            alignItems: "center",
            flexDirection: "row",
            justifyContent: "center",
            gap: 6,
          }}
        >
          <Text
            style={{
              fontFamily: "Inter_600SemiBold",
              fontSize: 14,
              color: "#FFFFFF",
            }}
          >
            Join Event
          </Text>
          <ChevronRight size={16} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
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
          <View>
            <Text
              style={{
                fontFamily: "Inter_700Bold",
                fontSize: 28,
                color: colors.text,
              }}
            >
              Discover
            </Text>
            <Text
              style={{
                fontFamily: "Inter_400Regular",
                fontSize: 16,
                color: colors.textSecondary,
              }}
            >
              Find amazing experiences near you
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
            <Filter size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: colors.surfaceElevated,
            borderRadius: 16,
            paddingHorizontal: 16,
            marginBottom: 16,
          }}
        >
          <Search size={20} color={colors.textSecondary} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search events, locations, activities..."
            placeholderTextColor={colors.textTertiary}
            style={{
              flex: 1,
              paddingVertical: 16,
              paddingHorizontal: 12,
              fontFamily: "Inter_500Medium",
              fontSize: 16,
              color: colors.text,
            }}
          />
        </View>

        {/* Filter Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 12 }}
        >
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter.id}
              onPress={() => setActiveFilter(filter.id)}
              style={{
                backgroundColor:
                  activeFilter === filter.id ? colors.primary : colors.surfaceElevated,
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 20,
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
              }}
            >
              <filter.icon 
                size={16} 
                color={activeFilter === filter.id ? "#FFFFFF" : colors.textSecondary} 
              />
              <Text
                style={{
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 14,
                  color:
                    activeFilter === filter.id ? "#FFFFFF" : colors.text,
                }}
              >
                {filter.title}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: insets.top + 160,
          paddingBottom: insets.bottom + 20,
        }}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Quick Discover Options */}
        <View style={{ marginBottom: 24 }}>
          <Text
            style={{
              fontFamily: "Inter_600SemiBold",
              fontSize: 18,
              color: colors.text,
              marginBottom: 16,
              paddingHorizontal: 20,
            }}
          >
            Quick Discover
          </Text>
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              paddingHorizontal: 20,
              gap: 12,
            }}
          >
            {quickDiscoverOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={{
                  flex: 1,
                  minWidth: "45%",
                  borderRadius: 16,
                  overflow: "hidden",
                }}
              >
                <LinearGradient
                  colors={option.gradient}
                  style={{
                    padding: 16,
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <option.icon size={24} color="#FFFFFF" />
                  <Text
                    style={{
                      fontFamily: "Inter_600SemiBold",
                      fontSize: 14,
                      color: "#FFFFFF",
                      textAlign: "center",
                    }}
                  >
                    {option.title}
                  </Text>
                  <Text
                    style={{
                      fontFamily: "Inter_400Regular",
                      fontSize: 12,
                      color: "rgba(255,255,255,0.8)",
                      textAlign: "center",
                    }}
                  >
                    {option.subtitle}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Categories */}
        <View style={{ marginBottom: 24 }}>
          <Text
            style={{
              fontFamily: "Inter_600SemiBold",
              fontSize: 18,
              color: colors.text,
              marginBottom: 16,
              paddingHorizontal: 20,
            }}
          >
            Categories
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
          >
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                onPress={() => setActiveCategory(category.id)}
                style={{
                  backgroundColor:
                    activeCategory === category.id ? category.color : colors.surfaceElevated,
                  borderRadius: 16,
                  padding: 16,
                  alignItems: "center",
                  gap: 8,
                  minWidth: 80,
                }}
              >
                <category.icon 
                  size={24} 
                  color={activeCategory === category.id ? "#FFFFFF" : colors.textSecondary} 
                />
                <Text
                  style={{
                    fontFamily: "Inter_600SemiBold",
                    fontSize: 12,
                    color:
                      activeCategory === category.id ? "#FFFFFF" : colors.text,
                    textAlign: "center",
                  }}
                >
                  {category.title}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Featured Events */}
        <View style={{ marginBottom: 24 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
              paddingHorizontal: 20,
            }}
          >
            <Text
              style={{
                fontFamily: "Inter_600SemiBold",
                fontSize: 18,
                color: colors.text,
              }}
            >
              Featured Events
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
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20 }}
          >
            {featuredEvents.map((event) => renderEventCard(event, false))}
          </ScrollView>
        </View>

        {/* Trending Events */}
        <View style={{ marginBottom: 24 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
              paddingHorizontal: 20,
            }}
          >
            <Text
              style={{
                fontFamily: "Inter_600SemiBold",
                fontSize: 18,
                color: colors.text,
              }}
            >
              Trending This Week
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
          <View style={{ paddingHorizontal: 20 }}>
            {trendingEvents.map((event, index) => (
              <TouchableOpacity
                key={event.id}
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: 16,
                  padding: 16,
                  marginBottom: 12,
                  flexDirection: "row",
                  alignItems: "center",
                  borderWidth: isDark ? 1 : 0,
                  borderColor: colors.border,
                }}
              >
                <Image
                  source={{ uri: event.image }}
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 12,
                    marginRight: 16,
                  }}
                />
                <View style={{ flex: 1 }}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
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
                      {event.title}
                    </Text>
                    {event.isVerified && (
                      <Shield size={16} color={colors.success} />
                    )}
                  </View>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginBottom: 4,
                      gap: 12,
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <MapPin size={12} color={colors.textSecondary} />
                      <Text
                        style={{
                          fontFamily: "Inter_400Regular",
                          fontSize: 12,
                          color: colors.textSecondary,
                        }}
                      >
                        {event.location}
                      </Text>
                    </View>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <Calendar size={12} color={colors.textSecondary} />
                      <Text
                        style={{
                          fontFamily: "Inter_400Regular",
                          fontSize: 12,
                          color: colors.textSecondary,
                        }}
                      >
                        {event.date}
                      </Text>
                    </View>
                  </View>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: "Inter_700Bold",
                        fontSize: 16,
                        color: colors.primary,
                      }}
                    >
                      {event.price}
                    </Text>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
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
                            fontFamily: "Inter_500Medium",
                            fontSize: 12,
                            color: colors.text,
                          }}
                        >
                          {event.rating}
                        </Text>
                      </View>
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
                            fontFamily: "Inter_500Medium",
                            fontSize: 12,
                            color: colors.success,
                          }}
                        >
                          {event.safetyScore}%
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Safety Notice */}
        <View
          style={{
            marginHorizontal: 20,
            backgroundColor: colors.info + "20",
            borderRadius: 16,
            padding: 16,
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
              Your Safety Matters
            </Text>
          </View>
          <Text
            style={{
              fontFamily: "Inter_400Regular",
              fontSize: 14,
              color: colors.textSecondary,
              marginBottom: 12,
            }}
          >
            All events are safety-rated and hosts are verified. Your location is shared with emergency contacts during meetups.
          </Text>
          <TouchableOpacity
            style={{
              backgroundColor: colors.info,
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
              Learn More
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
