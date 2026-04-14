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
    body: "Users and event organizers are responsible for the accuracy of their listings, including event details, pricing, and descriptions.\n\nWe may review, moderate, and remove content that violates our policies at any time without notice.\n\nUsers can report inappropriate listings directly from the listing page.\n\nWe reserve the right to suspend accounts for repeated or serious violations.",
  },
  {
    num: "4",
    title: "Payments & Transactions",
    body: "Trippy Events displays pricing information for events and trips. We are NOT a payment processor.\n\nPayments are handled directly between users and service providers outside of the app.\n\nRefund responsibility lies solely with the service provider (organizer or trip planner). Trippy Events is not responsible for refunds, cancellations, or disputes unless explicitly stated in a separate agreement.",
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
    title: "Service Disclaimer",
    body: "Trippy Events is a marketplace platform that connects users with event organizers and trip planners.\n\nWe do not organize, operate, or deliver any trips or events directly.\n\nAll service providers listed are independent third parties. Providers are solely responsible for delivering the services they advertise.",
  },
  {
    num: "9",
    title: "Cancellations & Refunds",
    body: "Each service provider sets their own cancellation and refund policy. Users must review the provider's policy before booking or paying.\n\nTrippy Events is not responsible for refunds, partial refunds, or cancellations unless explicitly stated in a separate written agreement with the platform.\n\nAll refund disputes must be resolved directly between the user and the service provider.",
  },
  {
    num: "10",
    title: "Changes to Terms",
    body: "We may update these Terms from time to time. Continued use of the app means you accept the updated terms.",
  },
  {
    num: "11",
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
        <View style={[styles.heroBadge, { backgroundColor: "#0abab518" }]}>
          <Feather name="file-text" size={28} color="#0abab5" />
        </View>
        <Text style={[styles.title, { color: colors.foreground }]}>Terms of Service</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          Welcome to Trippy Events. By accessing or using our application, you agree to be bound by these Terms of Service.
        </Text>
        <Text style={[styles.date, { color: colors.mutedForeground }]}>Effective Date: {EFFECTIVE_DATE}</Text>

        {/* Company Information card at the top */}
        <View style={[styles.companyCard, { backgroundColor: "#0abab510", borderColor: "#0abab540" }]}>
          <View style={styles.companyRow}>
            <Feather name="briefcase" size={18} color="#0abab5" />
            <Text style={[styles.companyTitle, { color: colors.foreground }]}>Company Information</Text>
          </View>
          <Text style={[styles.companyLine, { color: colors.mutedForeground }]}>
            <Text style={{ fontWeight: "700" }}>App Name: </Text>Trippy Events
          </Text>
          <Text style={[styles.companyLine, { color: colors.mutedForeground }]}>
            <Text style={{ fontWeight: "700" }}>Legal Entity: </Text>Tarek Adel Mohamed
          </Text>
          <Text style={[styles.companyLine, { color: colors.mutedForeground }]}>
            <Text style={{ fontWeight: "700" }}>Country: </Text>Egypt
          </Text>
          <Text style={[styles.companyLine, { color: colors.mutedForeground }]}>
            <Text style={{ fontWeight: "700" }}>Contact: </Text>tarekadel359@gmail.com
          </Text>
        </View>

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
          © {new Date().getFullYear()} Trippy Events — Tarek Adel Mohamed. All rights reserved.
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
  backBtn: { width: 36, height: 36, justifyContent: "center" },
  headerTitle: { fontSize: 17, fontWeight: "700" },
  container: { paddingHorizontal: 16, paddingTop: 24 },
  heroBadge: {
    width: 60, height: 60, borderRadius: 30,
    justifyContent: "center", alignItems: "center",
    marginBottom: 14, alignSelf: "center",
  },
  title: { fontSize: 26, fontWeight: "800", textAlign: "center", marginBottom: 10 },
  subtitle: { fontSize: 15, lineHeight: 22, textAlign: "center", marginBottom: 6 },
  date: { fontSize: 13, textAlign: "center", marginBottom: 20, fontStyle: "italic" },
  companyCard: {
    borderRadius: 14, borderWidth: 1, padding: 16, marginBottom: 16, gap: 8,
  },
  companyRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 },
  companyTitle: { fontSize: 15, fontWeight: "700" },
  companyLine: { fontSize: 14, lineHeight: 21 },
  section: {
    borderRadius: 14, borderWidth: StyleSheet.hairlineWidth, padding: 16, marginBottom: 12,
  },
  sectionHeader: { flexDirection: "row", alignItems: "center", marginBottom: 8, gap: 10 },
  numBadge: {
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: "#0abab5", justifyContent: "center", alignItems: "center",
  },
  numText: { color: "#fff", fontSize: 12, fontWeight: "800" },
  sectionTitle: { fontSize: 15, fontWeight: "700", flex: 1 },
  sectionBody: { fontSize: 14, lineHeight: 22 },
  footer: { fontSize: 12, textAlign: "center", marginTop: 8, marginBottom: 8 },
});
