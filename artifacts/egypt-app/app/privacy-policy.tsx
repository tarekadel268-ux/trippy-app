import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLanguage } from "@/contexts/LanguageContext";
import { useColors } from "@/hooks/useColors";

export default function PrivacyPolicyScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();

  return (
    <ScrollView contentContainerStyle={[styles.container, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 24, backgroundColor: colors.background }]}>
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>{t("privacyPolicy")}</Text>
        <Text style={[styles.body, { color: colors.mutedForeground }]}>Trippy Events respects your privacy. We only use the data needed to run the app, improve the experience, and support core features like listings, messages, and profile settings.</Text>
        <Text style={[styles.body, { color: colors.mutedForeground }]}>We may store local app preferences such as language, currency, and saved listings on your device. We do not sell your personal information.</Text>
        <Text style={[styles.body, { color: colors.mutedForeground }]}>If you contact us, we may keep your message only to respond to support requests and improve the app.</Text>
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
