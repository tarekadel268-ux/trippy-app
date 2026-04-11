import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/contexts/AppContext";
import { useColors } from "@/hooks/useColors";

const BENEFITS = [
  {
    icon: "trending-up" as const,
    title: "Top of the list",
    desc: "Your offers and plans appear first in search results and city carousels",
  },
  {
    icon: "bell" as const,
    title: "Push notifications",
    desc: "Viewers get notified instantly whenever you post new offers or plans",
  },
  {
    icon: "message-circle" as const,
    title: "Direct in-app messaging",
    desc: "Interested clients can message you directly without leaving the app",
  },
  {
    icon: "check-circle" as const,
    title: "Verified badge",
    desc: "A verified badge is claimed on your public organizer profile",
  },
];

export default function PlannerSubscribeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, setUser } = useApp();

  const [nationalId, setNationalId] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const isActive = user?.subscriptionExpiry
    ? new Date(user.subscriptionExpiry) > new Date()
    : false;

  const expiryDate = user?.subscriptionExpiry
    ? new Date(user.subscriptionExpiry).toLocaleDateString("en-EG", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  const handleSubscribe = async () => {
    if (nationalId.replace(/\D/g, "").length !== 14) {
      Alert.alert("Invalid ID", "Please enter your 14-digit Egyptian National ID.");
      return;
    }
    if (cardNumber.replace(/\s/g, "").length < 16) {
      Alert.alert("Invalid Card", "Please enter a valid 16-digit card number.");
      return;
    }
    if (cardExpiry.length < 5) {
      Alert.alert("Invalid Expiry", "Please enter a valid expiry date (MM/YY).");
      return;
    }
    if (cardCvc.length < 3) {
      Alert.alert("Invalid CVC", "Please enter a valid CVC.");
      return;
    }

    setSubmitting(true);
    await new Promise(r => setTimeout(r, 1500));

    const expiry = new Date();
    expiry.setMonth(expiry.getMonth() + 1);

    if (user) {
      await setUser({ ...user, subscriptionExpiry: expiry.toISOString(), isVerified: true });
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert(
      "Subscribed!",
      "Your subscription is now active. Your plans will be featured at the top and clients can message you directly.",
      [{ text: "Continue", onPress: () => router.back() }]
    );
    setSubmitting(false);
  };

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={[styles.header, { paddingTop: topPad + 12, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Planner Subscription</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: bottomPad + 24 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.heroCard, { backgroundColor: colors.primary + "14", borderColor: colors.primary + "40" }]}>
          <View style={[styles.heroIcon, { backgroundColor: colors.primary }]}>
            <Feather name="star" size={26} color="#fff" />
          </View>
          <Text style={[styles.heroTitle, { color: colors.foreground }]}>Boost your reach</Text>
          <Text style={[styles.heroSub, { color: colors.mutedForeground }]}>
            Subscribe to unlock exclusive planner benefits and grow your client base across Egypt
          </Text>
          <View style={[styles.priceBadge, { backgroundColor: colors.primary }]}>
            <Text style={styles.priceAmount}>50 EGP</Text>
            <Text style={styles.pricePer}>/month</Text>
          </View>
        </View>

        {isActive ? (
          <View style={[styles.activeCard, { backgroundColor: colors.success + "14", borderColor: colors.success + "40" }]}>
            <Feather name="check-circle" size={22} color={colors.success} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.activeTitle, { color: colors.success }]}>Subscription Active</Text>
              <Text style={[styles.activeSub, { color: colors.mutedForeground }]}>Renews on {expiryDate}</Text>
            </View>
          </View>
        ) : null}

        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>What you get</Text>
          {BENEFITS.map((b, i) => (
            <View key={i} style={[styles.benefitRow, i < BENEFITS.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
              <View style={[styles.benefitIcon, { backgroundColor: colors.primary + "18" }]}>
                <Feather name={b.icon} size={18} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.benefitTitle, { color: colors.foreground }]}>{b.title}</Text>
                <Text style={[styles.benefitDesc, { color: colors.mutedForeground }]}>{b.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        {!isActive && (
          <>
            <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Your Details</Text>

              <View style={styles.inputWrap}>
                <Text style={[styles.inputLabel, { color: colors.mutedForeground }]}>Egyptian National ID</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.muted, borderColor: colors.border, color: colors.foreground }]}
                  placeholder="14-digit National ID number"
                  placeholderTextColor={colors.mutedForeground}
                  value={nationalId}
                  onChangeText={t => setNationalId(t.replace(/\D/g, "").slice(0, 14))}
                  keyboardType="numeric"
                  maxLength={14}
                />
              </View>
            </View>

            <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Payment</Text>
              <View style={[styles.cardMethodBadge, { backgroundColor: colors.primary + "12", borderColor: colors.primary + "30" }]}>
                <Feather name="credit-card" size={16} color={colors.primary} />
                <Text style={[styles.methodLabel, { color: colors.foreground }]}>Credit / Debit Card — 50 EGP</Text>
              </View>

              <View style={styles.inputWrap}>
                <Text style={[styles.inputLabel, { color: colors.mutedForeground }]}>Card Number</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.muted, borderColor: colors.border, color: colors.foreground }]}
                  placeholder="1234 5678 9012 3456"
                  placeholderTextColor={colors.mutedForeground}
                  value={cardNumber}
                  onChangeText={t => setCardNumber(t.replace(/\D/g, "").replace(/(.{4})/g, "$1 ").trim().slice(0, 19))}
                  keyboardType="numeric"
                  maxLength={19}
                />
              </View>

              <View style={styles.cardRow}>
                <View style={[styles.inputWrap, { flex: 1 }]}>
                  <Text style={[styles.inputLabel, { color: colors.mutedForeground }]}>Expiry</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.muted, borderColor: colors.border, color: colors.foreground }]}
                    placeholder="MM/YY"
                    placeholderTextColor={colors.mutedForeground}
                    value={cardExpiry}
                    onChangeText={t => {
                      const clean = t.replace(/\D/g, "");
                      setCardExpiry(clean.length > 2 ? `${clean.slice(0, 2)}/${clean.slice(2, 4)}` : clean);
                    }}
                    keyboardType="numeric"
                    maxLength={5}
                  />
                </View>
                <View style={[styles.inputWrap, { flex: 1 }]}>
                  <Text style={[styles.inputLabel, { color: colors.mutedForeground }]}>CVC</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.muted, borderColor: colors.border, color: colors.foreground }]}
                    placeholder="123"
                    placeholderTextColor={colors.mutedForeground}
                    value={cardCvc}
                    onChangeText={setCardCvc}
                    keyboardType="numeric"
                    maxLength={4}
                    secureTextEntry
                  />
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.submitBtn, { backgroundColor: submitting ? colors.muted : colors.primary }]}
              onPress={handleSubscribe}
              disabled={submitting}
              activeOpacity={0.85}
            >
              {submitting ? (
                <Text style={[styles.submitText, { color: colors.mutedForeground }]}>Processing...</Text>
              ) : (
                <>
                  <Feather name="star" size={18} color="#fff" />
                  <Text style={styles.submitText}>Subscribe — 50 EGP/month</Text>
                </>
              )}
            </TouchableOpacity>

            <Text style={[styles.disclaimer, { color: colors.mutedForeground }]}>
              Your National ID is used for identity verification only. Subscription auto-renews monthly and can be cancelled anytime.
            </Text>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 17, fontWeight: "700" },
  scroll: { padding: 18, gap: 14 },
  heroCard: {
    alignItems: "center",
    padding: 24,
    borderRadius: 20,
    borderWidth: 1.5,
    gap: 10,
  },
  heroIcon: {
    width: 60,
    height: 60,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  heroTitle: { fontSize: 20, fontWeight: "800", letterSpacing: -0.3 },
  heroSub: { fontSize: 14, lineHeight: 20, textAlign: "center" },
  priceBadge: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 30,
    marginTop: 4,
  },
  priceAmount: { fontSize: 22, fontWeight: "900", color: "#fff" },
  pricePer: { fontSize: 14, fontWeight: "600", color: "rgba(255,255,255,0.75)" },
  activeCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  activeTitle: { fontSize: 15, fontWeight: "700" },
  activeSub: { fontSize: 12, marginTop: 2 },
  section: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 18,
    gap: 14,
  },
  sectionTitle: { fontSize: 15, fontWeight: "700", marginBottom: 2 },
  benefitRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    paddingVertical: 12,
  },
  benefitIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  benefitTitle: { fontSize: 14, fontWeight: "700", marginBottom: 3 },
  benefitDesc: { fontSize: 13, lineHeight: 18 },
  inputWrap: { gap: 6 },
  inputLabel: { fontSize: 12, fontWeight: "600", letterSpacing: 0.3 },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
  },
  cardMethodBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  methodLabel: { fontSize: 14, fontWeight: "600" },
  cardRow: { flexDirection: "row", gap: 12 },
  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 16,
    borderRadius: 16,
  },
  submitText: { fontSize: 16, fontWeight: "800", color: "#fff" },
  disclaimer: { fontSize: 12, lineHeight: 17, textAlign: "center" },
});
