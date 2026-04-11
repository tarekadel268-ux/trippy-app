import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
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

export default function VerifyScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, setUser } = useApp();
  const router = useRouter();

  const [nationalId, setNationalId] = useState("");
  const [phone, setPhone] = useState(user?.phone || "");
  const [submitting, setSubmitting] = useState(false);

  const topPad = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const handleSubmit = async () => {
    if (nationalId.length < 14) {
      Alert.alert("Invalid ID", "Please enter a valid 14-digit Egyptian National ID.");
      return;
    }
    if (phone.length < 10) {
      Alert.alert("Invalid Phone", "Please enter a valid Egyptian phone number.");
      return;
    }
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 1500));
    const expiry = new Date();
    expiry.setMonth(expiry.getMonth() + 1);
    await setUser({
      ...user!,
      isVerified: true,
      phone,
      subscriptionExpiry: expiry.toISOString(),
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert(
      "Verified!",
      "Your profile is now verified. You can list trips and be shown to tourists. Your 200 EGP/month subscription is active.",
      [{ text: "Continue", onPress: () => router.back() }]
    );
    setSubmitting(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 4, borderBottomColor: colors.border }]}>
        <TouchableOpacity style={[styles.backBtn, { backgroundColor: colors.muted }]} onPress={() => router.back()}>
          <Feather name="arrow-left" size={20} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Get Verified</Text>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: bottomPad + 30 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.heroBanner, { backgroundColor: colors.success + "18", borderColor: colors.success + "44" }]}>
          <Feather name="shield" size={32} color={colors.success} />
          <Text style={[styles.heroTitle, { color: colors.foreground }]}>Become a Verified Planner</Text>
          <Text style={[styles.heroSub, { color: colors.mutedForeground }]}>
            Verified planners are listed first and shown to tourist subscribers. No fake organizers — just trustworthy trips.
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.foreground }]}>Verification Requirements</Text>
          {[
            { icon: "credit-card", text: "Egyptian National ID (14 digits)" },
            { icon: "phone", text: "Valid Egyptian phone number" },
            { icon: "dollar-sign", text: "200 EGP/month subscription" },
          ].map((r, i) => (
            <View key={i} style={styles.reqRow}>
              <View style={[styles.reqIcon, { backgroundColor: colors.muted }]}>
                <Feather name={r.icon as any} size={16} color={colors.primary} />
              </View>
              <Text style={[styles.reqText, { color: colors.foreground }]}>{r.text}</Text>
            </View>
          ))}
        </View>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.foreground }]}>Your Information</Text>

          <View style={styles.field}>
            <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Egyptian National ID</Text>
            <TextInput
              style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.muted }]}
              value={nationalId}
              onChangeText={t => setNationalId(t.replace(/\D/g, "").slice(0, 14))}
              placeholder="14-digit National ID number"
              placeholderTextColor={colors.mutedForeground}
              keyboardType="numeric"
              maxLength={14}
            />
            {nationalId.length > 0 && (
              <Text style={[styles.charCount, { color: nationalId.length === 14 ? colors.success : colors.mutedForeground }]}>
                {nationalId.length}/14
              </Text>
            )}
          </View>

          <View style={styles.field}>
            <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Phone Number</Text>
            <TextInput
              style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.muted }]}
              value={phone}
              onChangeText={setPhone}
              placeholder="+20 1XX XXX XXXX"
              placeholderTextColor={colors.mutedForeground}
              keyboardType="phone-pad"
            />
          </View>
        </View>

        <View style={[styles.paymentCard, { backgroundColor: colors.deepBlue }]}>
          <Feather name="credit-card" size={20} color="#fff" />
          <View style={{ flex: 1 }}>
            <Text style={styles.paymentTitle}>Payment: 200 EGP/month</Text>
            <Text style={styles.paymentSub}>Via Instapay or Vodafone Cash</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.submitBtn, { backgroundColor: submitting ? colors.muted : colors.success }]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <Text style={[styles.submitBtnText, { color: colors.mutedForeground }]}>Verifying...</Text>
          ) : (
            <>
              <Feather name="shield" size={18} color="#fff" />
              <Text style={styles.submitBtnText}>Submit & Pay 200 EGP</Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={[styles.disclaimer, { color: colors.mutedForeground }]}>
          By submitting, you agree that your ID will be verified by our team. Verification is valid for one month.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
  },
  scroll: {
    paddingHorizontal: 16,
    paddingTop: 20,
    gap: 16,
  },
  heroBanner: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    alignItems: "center",
    gap: 10,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: "800",
    textAlign: "center",
  },
  heroSub: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 18,
    gap: 14,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "700",
  },
  reqRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  reqIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  reqText: {
    fontSize: 14,
    flex: 1,
  },
  field: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  charCount: {
    fontSize: 12,
    alignSelf: "flex-end",
  },
  paymentCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderRadius: 14,
  },
  paymentTitle: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
  paymentSub: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
    marginTop: 2,
  },
  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 15,
    borderRadius: 14,
  },
  submitBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  disclaimer: {
    fontSize: 12,
    textAlign: "center",
    lineHeight: 18,
  },
});
