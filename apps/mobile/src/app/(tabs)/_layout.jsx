import { Tabs } from "expo-router";
import { BookOpen, Calendar, LogIn, MapPin, Search, Store, TrendingUp, User, UserPlus, Users, Wallet } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../utils/theme";

export default function TabLayout() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          paddingBottom: insets.bottom + 8,
          paddingTop: 12,
          paddingHorizontal: 8,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarLabelStyle: {
          fontSize: 10,
          fontFamily: "Inter_600SemiBold",
          marginTop: 4,
        },
        tabBarItemStyle: {
          paddingVertical: 8,
          flex: 1,
        },
      }}
    >
      <Tabs.Screen
        name="login"
        options={{
          title: "Login",
          tabBarIcon: ({ color, focused }) => (
            <LogIn
              color={color}
              size={24}
              strokeWidth={focused ? 2 : 1.5}
              fill={focused ? "none" : "none"}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="signup"
        options={{
          title: "Sign Up",
          tabBarIcon: ({ color, focused }) => (
            <UserPlus 
              color={color} 
              size={24} 
              strokeWidth={focused ? 2 : 1.5}
              fill={focused ? "none" : "none"}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="discover"
        options={{
          title: "Discover",
          tabBarIcon: ({ color, focused }) => (
            <Search
              color={color}
              size={24}
              strokeWidth={focused ? 2 : 1.5}
              fill={focused ? "none" : "none"}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="sa-attractions"
        options={{
          title: "SA Attractions",
          tabBarIcon: ({ color, focused }) => (
            <MapPin
              color={color}
              size={24}
              strokeWidth={focused ? 2 : 1.5}
              fill={focused ? "none" : "none"}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="trends"
        options={{
          title: "Trends",
          tabBarIcon: ({ color, focused }) => (
            <TrendingUp
              color={color}
              size={24}
              strokeWidth={focused ? 2 : 1.5}
              fill={focused ? "none" : "none"}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="groups"
        options={{
          title: "Groups",
          tabBarIcon: ({ color, focused }) => (
            <Users 
              color={color} 
              size={24} 
              strokeWidth={focused ? 2 : 1.5}
              fill={focused ? "none" : "none"}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="plans"
        options={{
          title: "Plans",
          tabBarIcon: ({ color, focused }) => (
            <Calendar 
              color={color} 
              size={24} 
              strokeWidth={focused ? 2 : 1.5}
              fill={focused ? "none" : "none"}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="bookings"
        options={{
          title: "Bookings",
          tabBarIcon: ({ color, focused }) => (
            <BookOpen 
              color={color} 
              size={24} 
              strokeWidth={focused ? 2 : 1.5}
              fill={focused ? "none" : "none"}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="stores"
        options={{
          title: "Stores",
          tabBarIcon: ({ color, focused }) => (
            <Store 
              color={color} 
              size={24} 
              strokeWidth={focused ? 2 : 1.5}
              fill={focused ? "none" : "none"}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="wallet"
        options={{
          title: "Wallet",
          tabBarIcon: ({ color, focused }) => (
            <Wallet 
              color={color} 
              size={24} 
              strokeWidth={focused ? 2 : 1.5}
              fill={focused ? "none" : "none"}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <User 
              color={color} 
              size={24} 
              strokeWidth={focused ? 2 : 1.5}
              fill={focused ? "none" : "none"}
            />
          ),
        }}
      />
    </Tabs>
  );
}