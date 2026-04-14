import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

export default function AdsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  return (
    <ScrollView contentContainerStyle={[styles.container, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 24, backgroundColor: colors.background }]}>
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>Ads</Text>
        <Text style={[styles.body, { color: colors.mutedForeground }]}>Test ads are used during development. Production ad settings are handled in app config.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
  },
  card: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 18,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    marginBottom: 14,
  },
  body: {
    fontSize: 15,
    lineHeight: 23,
    marginBottom: 14,
  },
});
