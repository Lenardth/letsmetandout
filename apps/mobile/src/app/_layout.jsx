
import { useAuth } from '@/utils/auth/useAuth';
import { hasCompleteProfile } from '@/utils/auth/profile';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { Image, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function RootLayout() {
  const { initiate, isReady, auth } = useAuth();
  const [fontsLoaded, fontError] = useFonts({ Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold });
  const [logoLoaded, setLogoLoaded] = useState(false);
  const [startupFinished, setStartupFinished] = useState(false);

  useEffect(() => {
    queryClient.clear();
  }, [auth?.access_token]);

  useEffect(() => {
    initiate();
  }, [initiate]);

  useEffect(() => {
    if (!logoLoaded) return;
    SplashScreen.hideAsync();
    const timeout = setTimeout(() => setStartupFinished(true), 1200);
    return () => clearTimeout(timeout);
  }, [logoLoaded]);

  if (!isReady || !startupFinished || (!fontsLoaded && !fontError)) {
    return (
      <View style={{ flex: 1, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' }}>
        <Image
          source={require('../../assets/branding/safemeet-logo-v1.png')}
          accessibilityLabel="SafeMeet"
          accessible
          resizeMode="contain"
          onLoad={() => setLogoLoaded(true)}
          onError={() => setLogoLoaded(true)}
          style={{ width: '80%', maxWidth: 360, aspectRatio: 1.5 }}
        />
      </View>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Stack screenOptions={{ headerShown: false }} initialRouteName="index">
          <Stack.Screen name="index" />
          <Stack.Protected guard={!auth}>
            <Stack.Screen name="signup" />
            <Stack.Screen name="login" />
          </Stack.Protected>
          <Stack.Protected guard={!!auth}>
            <Stack.Screen name="complete-profile" />
          </Stack.Protected>
          <Stack.Protected guard={!!auth && hasCompleteProfile(auth.profile)}>
            <Stack.Screen name="(tabs)" />
          </Stack.Protected>
        </Stack>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
