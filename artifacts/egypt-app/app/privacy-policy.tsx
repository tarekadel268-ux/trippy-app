import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

const EFFECTIVE_DATE = "April 14, 2026";

const sections = [
  {
    num: "1",
    title: "Information We Collect",
    body: "We may collect:\n• Account information (name, email, username)\n• Profile details (optional photos, bio)\n• Usage data (app interactions, preferences)",
  },
  {
    num: "2",
    title: "How We Use Information",
    body: "We use your information to:\n• Provide and improve the app\n• Personalize your experience\n• Enable communication between users\n• Maintain security and prevent fraud",
  },
  {
    num: "3",
    title: "Data Storage",
    body: "We may store certain preferences locally on your device (such as saved listings, language, or currency settings).",
  },
  {
    num: "4",
    title: "Data Sharing",
    body: "We do NOT sell your personal information. We may share limited data only:\n• With service providers (for hosting, analytics)\n• If required by law",
  },
  {
    num: "5",
    title: "User Control",
    body: "You can:\n• Edit or delete your profile information\n• Control visibility (email, phone, role) from settings",
  },
  {
    num: "6",
    title: "Security",
    body: "We take reasonable measures to protect your data, but no system is 100% secure.",
  },
  {
    num: "7",
    title: "Third-Party Services",
    body: "The app may use third-party services such as:\n• Google Sign-In\n• Apple Sign-In\n\nThese services have their own privacy policies.",
  },
  {
    num: "8",
    title: "Children's Privacy",
    body: "Trippy Events is not intended for users under the age of 13.",
  },
  {
    num: "9",
    title: "Changes to This Policy",
    body: "We may update this Privacy Policy. Continued use of the app means you accept any updates.",
  },
  {
    num: "10",
    title: "Contact Us",
    body: "If you have any questions about this Privacy Policy, please contact us at:\ntarekadel359@gmail.com",
  },
];

export default function PrivacyPolicyScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={[styles.header, { paddingTop: insets.top + 10, borderBottomColor: colors.border, backgroundColor: colors.background }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Privacy Policy</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={[styles.container, { paddingBottom: insets.bottom + 32 }]} showsVerticalScrollIndicator={false}>
        <View style={[styles.heroBadge, { backgroundColor: "#0abab5" + "18" }]}>
          <Feather name="shield" size={28} color="#0abab5" />
        </View>
        <Text style={[styles.title, { color: colors.foreground }]}>Privacy Policy</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          Trippy Events respects your privacy. This Privacy Policy explains how we collect, use, and protect your information.
        </Text>
        <Text style={[styles.date, { color: colors.mutedForeground }]}>Effective Date: {EFFECTIVE_DATE}</Text>

        {sections.map((s) => (
          <View key={s.num} style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.sectionHeader}>
              <View style={styles.numBadge}>
                <Text style={styles.numText}>{s.num}</Text>
              </View>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{s.title}</Text>
            </View>
            <Text style={[styles.sectionBody, { color: colors.mutedForeground }]}>{s.body}</Text>
          </View>
        ))}

        <Text style={[styles.footer, { color: colors.mutedForeground }]}>
          © {new Date().getFullYear()} Trippy Events. All rights reserved.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn: {
    width: 36,
    height: 36,
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
  },
  container: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  heroBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
    alignSelf: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
    marginBottom: 6,
  },
  date: {
    fontSize: 13,
    textAlign: "center",
    marginBottom: 24,
    fontStyle: "italic",
  },
  section: {
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 10,
  },
  numBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#0abab5",
    justifyContent: "center",
    alignItems: "center",
  },
  numText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "800",
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    flex: 1,
  },
  sectionBody: {
    fontSize: 14,
    lineHeight: 22,
  },
  footer: {
    fontSize: 12,
    textAlign: "center",
    marginTop: 8,
    marginBottom: 8,
  },
});
