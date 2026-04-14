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
    body: "We collect the following data when you use Trippy Events:\n\nData linked to your account:\n• Full name and username\n• Email address\n• Nationality and selected role\n• Profile photo (optional)\n• Bio (optional)\n• Phone number (optional)\n\nUsage data:\n• App interactions, taps, and screen views\n• Listings you view or save\n• Language and currency preferences\n• Device type and operating system\n\nWe do not collect precise location data or use your data for ad tracking.",
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
    body: "You can:\n• Edit or delete your profile information\n• Control visibility (email, phone, role) from settings\n• Request account deletion by contacting us",
  },
  {
    num: "6",
    title: "Your Rights",
    body: "As a user, you have the right to:\n• Request deletion of your account and associated data\n• Request access to the personal data we hold about you\n• Request correction or deletion of inaccurate data\n\nTo exercise any of these rights, contact us at tarekadel359@gmail.com",
  },
  {
    num: "7",
    title: "Security",
    body: "We take reasonable measures to protect your data, but no system is 100% secure.",
  },
  {
    num: "8",
    title: "Third-Party Services",
    body: "The app may use third-party services, including:\n• Google Sign-In\n• Apple Sign-In\n• Analytics tools (for usage insights)\n• Hosting services (for app infrastructure)\n\nThese services may collect data according to their own privacy policies. We are not responsible for the practices of third-party providers.",
  },
  {
    num: "9",
    title: "Children's Privacy",
    body: "Trippy Events is not intended for users under the age of 13.\n\nDuring signup, users must confirm that they are 13 years of age or older.\n\nWe do not knowingly collect or store personal data from children under 13.\n\nIf we discover that an account belongs to a user under 13, that account will be deleted and all associated data will be removed immediately.",
  },
  {
    num: "10",
    title: "Changes to This Policy",
    body: "We may update this Privacy Policy. Continued use of the app means you accept any updates.",
  },
  {
    num: "11",
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
        <View style={[styles.heroBadge, { backgroundColor: "#0abab518" }]}>
          <Feather name="shield" size={28} color="#0abab5" />
        </View>
        <Text style={[styles.title, { color: colors.foreground }]}>Privacy Policy</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          Trippy Events respects your privacy. This Privacy Policy explains how we collect, use, and protect your information.
        </Text>
        <Text style={[styles.date, { color: colors.mutedForeground }]}>Effective Date: {EFFECTIVE_DATE}</Text>

        {/* Company Information card at top */}
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
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: StyleSheet.hairlineWidth,
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
  companyCard: { borderRadius: 14, borderWidth: 1, padding: 16, marginBottom: 16, gap: 8 },
  companyRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 },
  companyTitle: { fontSize: 15, fontWeight: "700" },
  companyLine: { fontSize: 14, lineHeight: 21 },
  section: { borderRadius: 14, borderWidth: StyleSheet.hairlineWidth, padding: 16, marginBottom: 12 },
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
