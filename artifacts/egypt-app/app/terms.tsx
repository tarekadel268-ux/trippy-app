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
    title: "Use of the App",
    body: "Trippy Events provides a platform to discover events, trips, and connect with organizers. You agree to use the app only for lawful purposes and in a way that does not harm other users or the platform.",
  },
  {
    num: "2",
    title: "User Accounts",
    body: "You are responsible for maintaining the confidentiality of your account information. You agree to provide accurate and complete information when creating an account.",
  },
  {
    num: "3",
    title: "Content & Listings",
    body: "Users and event organizers are responsible for the accuracy of their listings, including event details, pricing, and descriptions. We reserve the right to remove or modify content that violates our policies.",
  },
  {
    num: "4",
    title: "Payments & Transactions",
    body: "Trippy Events may display events or trips with pricing information. We are not responsible for disputes between users and organizers unless explicitly stated.",
  },
  {
    num: "5",
    title: "Prohibited Activities",
    body: "You agree not to:\n• Use the app for illegal activities\n• Post misleading or fraudulent content\n• Harass, abuse, or harm other users\n• Attempt to access unauthorized parts of the app",
  },
  {
    num: "6",
    title: "Account Suspension",
    body: "We reserve the right to suspend or terminate accounts that violate these terms without prior notice.",
  },
  {
    num: "7",
    title: "Limitation of Liability",
    body: "Trippy Events is provided \"as is.\" We are not liable for any damages resulting from the use of the app, including event cancellations, inaccuracies, or user interactions.",
  },
  {
    num: "8",
    title: "Changes to Terms",
    body: "We may update these Terms from time to time. Continued use of the app means you accept the updated terms.",
  },
  {
    num: "9",
    title: "Contact Us",
    body: "For any questions about these Terms of Service, contact us at:\ntarekadel359@gmail.com",
  },
];

export default function TermsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={[styles.header, { paddingTop: insets.top + 10, borderBottomColor: colors.border, backgroundColor: colors.background }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Terms of Service</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={[styles.container, { paddingBottom: insets.bottom + 32 }]} showsVerticalScrollIndicator={false}>
        <View style={[styles.heroBadge, { backgroundColor: "#0abab5" + "18" }]}>
          <Feather name="file-text" size={28} color="#0abab5" />
        </View>
        <Text style={[styles.title, { color: colors.foreground }]}>Terms of Service</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          Welcome to Trippy Events. By accessing or using our application, you agree to be bound by these Terms of Service.
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
