import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold, useFonts } from "@expo-google-fonts/inter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import React, { useEffect } from "react";
import { Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AppProvider } from "@/contexts/AppContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ThemeProvider } from "@/contexts/ThemeContext";

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="events/[id]" />
      <Stack.Screen name="trips/[id]" />
      <Stack.Screen name="chat/[id]" />
      <Stack.Screen name="verify" />
      <Stack.Screen name="subscribe" />
      <Stack.Screen name="add-event" />
      <Stack.Screen name="add-trip" />
      <Stack.Screen name="organizer/[id]" />
      <Stack.Screen name="planner-subscribe" />
      <Stack.Screen name="purchase-ticket" />
      <Stack.Screen name="about" />
      <Stack.Screen name="terms" />
      <Stack.Screen name="privacy-policy" />
      <Stack.Screen name="admin" />
      <Stack.Screen name="ads" />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (Platform.OS === "web") return;

    async function initAds() {
      try {
        // iOS 14+: request App Tracking Transparency before initializing ads
        if (Platform.OS === "ios") {
          const { requestTrackingPermissionsAsync } = await import(
            "expo-tracking-transparency"
          );
          await requestTrackingPermissionsAsync();
        }
        const { MobileAds } = await import("react-native-google-mobile-ads");
        await MobileAds().initialize();
      } catch {
        // Native module not available (Expo Go) — silently skip
      }
    }

    initAds();
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <ThemeProvider>
        <LanguageProvider>
          <AppProvider>
            <QueryClientProvider client={queryClient}>
              <GestureHandlerRootView style={{ flex: 1 }}>
                <KeyboardProvider>
                  <RootLayoutNav />
                </KeyboardProvider>
              </GestureHandlerRootView>
            </QueryClientProvider>
          </AppProvider>
        </LanguageProvider>
        </ThemeProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
