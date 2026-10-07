import { Redirect, Tabs } from "expo-router";
import { Calendar, Home, Search, User, Users, Wallet, Store, CalendarCheck } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../utils/theme";

import { useExperience } from "../../utils/experience";

export default function TabLayout() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const { mode, ready } = useExperience();
  if (!ready) return null;
  if (!mode) return <Redirect href="/choose-experience" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: "transparent",
          borderTopWidth: 0,
          height: 72 + insets.bottom,
          paddingBottom: Math.max(insets.bottom, 8),
          paddingTop: 10,
          paddingHorizontal: 12,
          shadowColor: colors.shadow,
          shadowOpacity: colors.shadowOpacity,
          shadowRadius: 18,
          shadowOffset: { width: 0, height: -5 },
          elevation: 12,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarLabelStyle: {
          fontSize: 10,
          fontFamily: "Inter_600SemiBold",
          marginTop: 4,
        },
        tabBarItemStyle: {
          paddingVertical: 4,
          flex: 1,
        },
      }}
    >
      <Tabs.Protected guard={mode === "customer"}>
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => <Home color={color} size={23} strokeWidth={focused ? 2.2 : 1.6} />,
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
          tabBarIcon: ({ color }) => <CalendarCheck size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="stores"
        options={{
          title: "Places",
          tabBarIcon: ({ color }) => <Store size={22} color={color} />,
        }}
      />
      </Tabs.Protected>
      <Tabs.Protected guard={mode === "provider"}>
        <Tabs.Screen name="provider" options={{ title: "My business", tabBarIcon: ({ color }) => <Store size={22} color={color} /> }} />
      </Tabs.Protected>
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
