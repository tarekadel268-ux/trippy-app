import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLanguage } from "@/contexts/LanguageContext";
import { useColors } from "@/hooks/useColors";

export default function AboutScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();

  return (
    <ScrollView contentContainerStyle={[styles.container, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 24, backgroundColor: colors.background }]}>
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>{t("contactSupport")}</Text>
        <Text style={[styles.body, { color: colors.mutedForeground }]}>Email: tarekadel359@gmail.com</Text>
        <Text style={[styles.body, { color: colors.mutedForeground }]}>Phone: +20155 5989625</Text>
        <Text style={[styles.body, { color: colors.mutedForeground }]}>For help with listings, tickets, or organizers, contact us anytime.</Text>
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
