import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { Image, StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AppProvider, useApp } from "@/contexts/AppContext";
import { LanguageProvider } from "@/contexts/LanguageContext";

SplashScreen.preventAutoHideAsync();

const loadingStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  splash: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
});

const queryClient = new QueryClient();

function NavigationGuard() {
  const { onboarded, user, isLoading } = useApp();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    const inTabs = segments[0] === "(tabs)";
    if (!onboarded || !user) {
      if (inTabs) {
        router.replace("/");
      }
    } else {
      const allowedOutsideTabs = ["events", "trips", "chat", "verify", "subscribe", "add-event", "add-trip", "organizer", "planner-subscribe", "purchase-ticket"];
      if (!inTabs && !allowedOutsideTabs.includes(segments[0] as string)) {
        router.replace("/(tabs)/trips");
      }
    }
  }, [onboarded, user, isLoading]);

  return null;
}

function RootLayoutNav() {
  return (
    <>
      <NavigationGuard />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
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
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return (
      <View style={loadingStyles.container}>
        <Image source={require("../assets/images/pyramids-bg.jpeg")} style={loadingStyles.splash} resizeMode="cover" />
        <View style={loadingStyles.overlay} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
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
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
