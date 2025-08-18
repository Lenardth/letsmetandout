import { Tabs } from "expo-router";
import {
  CalendarDays,
  Compass, // For Wallet (better than CreditCard)
  UserRound // For Profile (softer than User)
  , // For Discover (more exploratory than Home)
  Users2, // For Plans (more detailed than Calendar)
  WalletCards
} from "lucide-react-native";
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
          borderTopWidth: 1,
          borderTopColor: colors.border,
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
        name="discover"
        options={{
          title: "Discover",
          tabBarIcon: ({ color }) => (
            <Compass 
              color={color} 
              size={24}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="groups"
        options={{
          title: "Groups",
          tabBarIcon: ({ color }) => (
            <Users2 
              color={color} 
              size={24}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="plans"
        options={{
          title: "Plans",
          tabBarIcon: ({ color }) => (
            <CalendarDays 
              color={color} 
              size={24}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="wallet"
        options={{
          title: "Wallet",
          tabBarIcon: ({ color }) => (
            <WalletCards 
              color={color} 
              size={24}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => (
            <UserRound 
              color={color} 
              size={24}
            />
          ),
        }}
      />
    </Tabs>
  );
}