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

export default function SubscribeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, setUser } = useApp();
  const router = useRouter();
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const topPad = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const formatCard = (val: string) => {
    const cleaned = val.replace(/\D/g, "").slice(0, 16);
    return cleaned.replace(/(.{4})/g, "$1 ").trim();
  };

  const formatExpiry = (val: string) => {
    const cleaned = val.replace(/\D/g, "").slice(0, 4);
    if (cleaned.length >= 2) return cleaned.slice(0, 2) + "/" + cleaned.slice(2);
    return cleaned;
  };

  const handleSubscribe = async () => {
    if (cardNumber.replace(/\s/g, "").length < 16 || expiry.length < 5 || cvv.length < 3 || !name.trim()) {
      Alert.alert("Missing Info", "Please fill in all card details.");
      return;
    }
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 1800));
    const exp = new Date();
    exp.setMonth(exp.getMonth() + 1);
    await setUser({ ...user!, subscriptionExpiry: exp.toISOString() });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert(
      "Subscribed!",
      "You now have full access to all verified event planners' contact information for 30 days. Explore Egypt safely!",
      [{ text: "Explore Trips", onPress: () => { router.replace("/(tabs)/trips"); } }]
    );
    setSubmitting(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 4, borderBottomColor: colors.border }]}>
        <TouchableOpacity style={[styles.backBtn, { backgroundColor: colors.muted }]} onPress={() => router.back()}>
          <Feather name="arrow-left" size={20} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Tourist Subscription</Text>
      </View>

      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: bottomPad + 30 }]} showsVerticalScrollIndicator={false}>
        <View style={[styles.heroBanner, { backgroundColor: colors.deepBlue }]}>
          <Feather name="globe" size={36} color="#fff" />
          <Text style={styles.heroPrice}>$15 / month</Text>
          <Text style={styles.heroTitle}>Access Verified Planners</Text>
          <Text style={styles.heroSub}>Browse safely — every planner is ID-verified. No scammers, no false advertising.</Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.foreground }]}>What you get</Text>
          {[
            { icon: "shield", text: "View contact info of all verified event planners" },
            { icon: "message-circle", text: "Direct in-app messaging with organizers" },
            { icon: "filter", text: "Filter by city, price, and duration" },
            { icon: "eye-off", text: "Zero unverified listings in your feed" },
          ].map((b, i) => (
            <View key={i} style={styles.benefitRow}>
              <View style={[styles.benefitIcon, { backgroundColor: colors.primary + "18" }]}>
                <Feather name={b.icon as any} size={16} color={colors.primary} />
              </View>
              <Text style={[styles.benefitText, { color: colors.foreground }]}>{b.text}</Text>
            </View>
          ))}
        </View>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.foreground }]}>Payment Details</Text>
          <Text style={[styles.cardSub, { color: colors.mutedForeground }]}>Visa or Debit Card only</Text>

          <View style={styles.field}>
            <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Cardholder Name</Text>
            <TextInput
              style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.muted }]}
              value={name}
              onChangeText={setName}
              placeholder="Full name on card"
              placeholderTextColor={colors.mutedForeground}
            />
          </View>
          <View style={styles.field}>
            <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Card Number</Text>
            <TextInput
              style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.muted }]}
              value={cardNumber}
              onChangeText={t => setCardNumber(formatCard(t))}
              placeholder="1234 5678 9012 3456"
              placeholderTextColor={colors.mutedForeground}
              keyboardType="numeric"
              maxLength={19}
            />
          </View>
          <View style={styles.row}>
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Expiry</Text>
              <TextInput
                style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.muted }]}
                value={expiry}
                onChangeText={t => setExpiry(formatExpiry(t))}
                placeholder="MM/YY"
                placeholderTextColor={colors.mutedForeground}
                keyboardType="numeric"
                maxLength={5}
              />
            </View>
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>CVV</Text>
              <TextInput
                style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.muted }]}
                value={cvv}
                onChangeText={t => setCvv(t.replace(/\D/g, "").slice(0, 3))}
                placeholder="123"
                placeholderTextColor={colors.mutedForeground}
                keyboardType="numeric"
                maxLength={3}
                secureTextEntry
              />
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.submitBtn, { backgroundColor: submitting ? colors.muted : colors.deepBlue }]}
          onPress={handleSubscribe}
          disabled={submitting}
        >
          {submitting ? (
            <Text style={[styles.submitBtnText, { color: colors.mutedForeground }]}>Processing...</Text>
          ) : (
            <>
              <Feather name="unlock" size={18} color="#fff" />
              <Text style={styles.submitBtnText}>Subscribe — $15/month</Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={[styles.disclaimer, { color: colors.mutedForeground }]}>
          Subscription renews monthly. Cancel anytime from your profile. Payments are processed securely.
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
    padding: 24,
    alignItems: "center",
    gap: 8,
  },
  heroPrice: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: -1,
  },
  heroTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  heroSub: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 13,
    textAlign: "center",
    lineHeight: 19,
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
  cardSub: {
    fontSize: 13,
    marginTop: -8,
  },
  benefitRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  benefitIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  benefitText: {
    fontSize: 14,
    flex: 1,
    lineHeight: 19,
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
  row: {
    flexDirection: "row",
    gap: 12,
  },
  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
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
