import { BlurView } from "expo-blur";
import { isLiquidGlassAvailable } from "expo-glass-effect";
import { Tabs, useRouter } from "expo-router";
import { Icon, Label, NativeTabs } from "expo-router/unstable-native-tabs";
import { SymbolView } from "expo-symbols";
import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import { Platform, StyleSheet, TouchableOpacity, View, useColorScheme } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import { useLanguage } from "@/contexts/LanguageContext";
import SearchModal from "@/components/SearchModal";

function SearchFAB() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);

  return (
    <>
      <TouchableOpacity
        style={[
          styles.fab,
          {
            right: 16,
            backgroundColor: colors.primary,
            top: (Platform.OS === "web" ? 16 : insets.top) + 10,
          },
        ]}
        onPress={() => setOpen(true)}
        activeOpacity={0.85}
      >
        <Feather name="search" size={18} color="#fff" />
      </TouchableOpacity>
      <SearchModal visible={open} onClose={() => setOpen(false)} />
    </>
  );
}

function MessagesFAB() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <TouchableOpacity
      style={[
        styles.fab,
        {
          right: 64,
          backgroundColor: colors.card,
          borderWidth: 1,
          borderColor: colors.border,
          top: (Platform.OS === "web" ? 16 : insets.top) + 10,
        },
      ]}
      onPress={() => router.push("/messages")}
      activeOpacity={0.85}
    >
      <Feather name="message-circle" size={18} color={colors.foreground} />
    </TouchableOpacity>
  );
}

function NativeTabLayout() {
  const { t } = useLanguage();
  return (
    <View style={{ flex: 1 }}>
      <NativeTabs>
        <NativeTabs.Trigger name="feed">
          <Icon sf={{ default: "house", selected: "house.fill" }} />
          <Label>Feed</Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="trips">
          <Icon sf={{ default: "map", selected: "map.fill" }} />
          <Label>{t("trips")}</Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="events">
          <Icon sf={{ default: "ticket", selected: "ticket.fill" }} />
          <Label>{t("events")}</Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="profile">
          <Icon sf={{ default: "person", selected: "person.fill" }} />
          <Label>{t("profile")}</Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="settings">
          <Icon sf={{ default: "gearshape", selected: "gearshape.fill" }} />
          <Label>{t("settings")}</Label>
        </NativeTabs.Trigger>
      </NativeTabs>
      <MessagesFAB />
      <SearchFAB />
    </View>
  );
}

function ClassicTabLayout() {
  const colors = useColors();
  const { t } = useLanguage();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const isIOS = Platform.OS === "ios";
  const isWeb = Platform.OS === "web";

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.mutedForeground,
          headerShown: false,
          tabBarStyle: {
            position: "absolute",
            backgroundColor: isIOS ? "transparent" : colors.background,
            borderTopWidth: isWeb ? 1 : 0,
            borderTopColor: colors.border,
            elevation: 0,
            ...(isWeb ? { height: 84 } : {}),
          },
          tabBarBackground: () =>
            isIOS ? (
              <BlurView
                intensity={100}
                tint={isDark ? "dark" : "light"}
                style={StyleSheet.absoluteFill}
              />
            ) : isWeb ? (
              <View
                style={[
                  StyleSheet.absoluteFill,
                  { backgroundColor: colors.background },
                ]}
              />
            ) : null,
        }}
      >
        <Tabs.Screen
          name="feed"
          options={{
            title: "Feed",
            tabBarIcon: ({ color }) =>
              isIOS ? (
                <SymbolView name="house" tintColor={color} size={24} />
              ) : (
                <Feather name="home" size={22} color={color} />
              ),
          }}
        />
        <Tabs.Screen
          name="trips"
          options={{
            title: t("trips"),
            tabBarIcon: ({ color }) =>
              isIOS ? (
                <SymbolView name="map" tintColor={color} size={24} />
              ) : (
                <Feather name="map" size={22} color={color} />
              ),
          }}
        />
        <Tabs.Screen
          name="events"
          options={{
            title: t("events"),
            tabBarIcon: ({ color }) =>
              isIOS ? (
                <SymbolView name="ticket" tintColor={color} size={24} />
              ) : (
                <Feather name="music" size={22} color={color} />
              ),
          }}
        />
        <Tabs.Screen
          name="messages"
          options={{
            href: null,
            title: t("messages"),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: t("profile"),
            tabBarIcon: ({ color }) =>
              isIOS ? (
                <SymbolView name="person" tintColor={color} size={24} />
              ) : (
                <Feather name="user" size={22} color={color} />
              ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: t("settings"),
            tabBarIcon: ({ color }) =>
              isIOS ? (
                <SymbolView name="gearshape" tintColor={color} size={24} />
              ) : (
                <Feather name="settings" size={22} color={color} />
              ),
          }}
        />
      </Tabs>
      <MessagesFAB />
      <SearchFAB />
    </View>
  );
}

export default function TabLayout() {
  if (isLiquidGlassAvailable()) {
    return <NativeTabLayout />;
  }
  return <ClassicTabLayout />;
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 5,
    zIndex: 999,
  },
});
