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

  const hasAuth = !!user?.authProvider && !!user?.email;
  const providerLabel = user?.authProvider === "google" ? "Google" : user?.authProvider === "apple" ? "Apple ID" : null;
  const providerColor = user?.authProvider === "google" ? "#4285F4" : "#000";

  const canSubmit = hasAuth && nationalId.length === 14 && phone.length >= 10;

  const handleSubmit = async () => {
    if (!hasAuth) {
      Alert.alert(
        "Sign-in Required",
        "You must sign in with Google or Apple before verifying your account. Please sign out and sign back in.",
      );
      return;
    }
    if (nationalId.length < 14) {
      Alert.alert("Invalid ID", "Please enter a valid 14-digit Egyptian National ID.");
      return;
    }
    if (phone.length < 10) {
      Alert.alert("Invalid Phone", "Please enter a valid Egyptian phone number.");
      return;
    }
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 1800));
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
      "Your profile is now verified. You can list trips and events and reach users across Egypt.",
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
            Verified planners are listed first and shown to users across Egypt. Complete all three steps below to get your badge.
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.foreground }]}>Verification Steps</Text>

          <View style={[styles.stepRow, { borderColor: colors.border }]}>
            <View style={[styles.stepNum, hasAuth ? { backgroundColor: colors.success } : { backgroundColor: "#e06848" }]}>
              {hasAuth ? (
                <Feather name="check" size={14} color="#fff" />
              ) : (
                <Text style={styles.stepNumText}>1</Text>
              )}
            </View>
            <View style={{ flex: 1, gap: 3 }}>
              <Text style={[styles.stepLabel, { color: colors.foreground }]}>Sign in with Google or Apple</Text>
              {hasAuth ? (
                <View style={styles.authConfirmedRow}>
                  <View style={[styles.providerDot, { backgroundColor: providerColor }]}>
                    <Text style={styles.providerDotText}>{user?.authProvider === "google" ? "G" : "A"}</Text>
                  </View>
                  <Text style={[styles.authConfirmedText, { color: colors.success }]}>
                    {providerLabel} account confirmed
                  </Text>
                </View>
              ) : (
                <Text style={[styles.stepSub, { color: "#e06848" }]}>
                  Not connected — sign out and sign back in with Google or Apple
                </Text>
              )}
            </View>
            {hasAuth && (
              <View style={[styles.doneTag, { backgroundColor: colors.success + "18" }]}>
                <Text style={[styles.doneTagText, { color: colors.success }]}>Done</Text>
              </View>
            )}
          </View>

          <View style={[styles.stepRow, { borderColor: colors.border }]}>
            <View style={[styles.stepNum, nationalId.length === 14 ? { backgroundColor: colors.success } : { backgroundColor: colors.primary + "30" }]}>
              {nationalId.length === 14 ? (
                <Feather name="check" size={14} color="#fff" />
              ) : (
                <Text style={styles.stepNumText}>2</Text>
              )}
            </View>
            <Text style={[styles.stepLabel, { color: colors.foreground, flex: 1 }]}>Egyptian National ID (14 digits)</Text>
          </View>

          <View style={[styles.stepRow, { borderColor: colors.border, borderBottomWidth: 0 }]}>
            <View style={[styles.stepNum, phone.length >= 10 ? { backgroundColor: colors.success } : { backgroundColor: colors.primary + "30" }]}>
              {phone.length >= 10 ? (
                <Feather name="check" size={14} color="#fff" />
              ) : (
                <Text style={styles.stepNumText}>3</Text>
              )}
            </View>
            <Text style={[styles.stepLabel, { color: colors.foreground, flex: 1 }]}>Valid Egyptian phone number</Text>
          </View>
        </View>

        {!hasAuth ? (
          <View style={[styles.gateCard, { backgroundColor: "#e0684818", borderColor: "#e0684840" }]}>
            <Feather name="alert-triangle" size={24} color="#e06848" />
            <Text style={[styles.gateTitle, { color: colors.foreground }]}>Social Sign-In Required</Text>
            <Text style={[styles.gateSub, { color: colors.mutedForeground }]}>
              To verify your identity, you must be signed in with Google or Apple ID. This confirms you are a real person before your National ID is reviewed.
            </Text>
            <TouchableOpacity
              style={[styles.gateBtn, { backgroundColor: "#e06848" }]}
              onPress={() => {
                Alert.alert(
                  "Sign Out Required",
                  "Please sign out from your Profile tab and sign back in using Google or Apple.",
                  [{ text: "OK" }]
                );
              }}
            >
              <Feather name="log-in" size={16} color="#fff" />
              <Text style={styles.gateBtnText}>How to Connect</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.cardTitle, { color: colors.foreground }]}>Your Information</Text>

              <View style={[styles.linkedAccountRow, { backgroundColor: providerColor + "12", borderColor: providerColor + "35" }]}>
                <View style={[styles.linkedIcon, { backgroundColor: providerColor }]}>
                  <Text style={styles.linkedIconText}>{user?.authProvider === "google" ? "G" : "A"}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.linkedLabel, { color: colors.mutedForeground }]}>
                    {providerLabel} Account
                  </Text>
                  <Text style={[styles.linkedEmail, { color: colors.foreground }]}>{user?.email}</Text>
                </View>
                <Feather name="check-circle" size={18} color={colors.success} />
              </View>

              <View style={styles.field}>
                <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Egyptian National ID</Text>
                <TextInput
                  style={[styles.input, { color: colors.foreground, borderColor: nationalId.length === 14 ? colors.success : colors.border, backgroundColor: colors.muted }]}
                  value={nationalId}
                  onChangeText={t => setNationalId(t.replace(/\D/g, "").slice(0, 14))}
                  placeholder="14-digit National ID number"
                  placeholderTextColor={colors.mutedForeground}
                  keyboardType="numeric"
                  maxLength={14}
                />
                {nationalId.length > 0 && (
                  <Text style={[styles.charCount, { color: nationalId.length === 14 ? colors.success : colors.mutedForeground }]}>
                    {nationalId.length}/14 {nationalId.length === 14 ? "✓" : ""}
                  </Text>
                )}
              </View>

              <View style={styles.field}>
                <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Phone Number</Text>
                <TextInput
                  style={[styles.input, { color: colors.foreground, borderColor: phone.length >= 10 ? colors.success : colors.border, backgroundColor: colors.muted }]}
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="+20 1XX XXX XXXX"
                  placeholderTextColor={colors.mutedForeground}
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.submitBtn,
                { backgroundColor: canSubmit && !submitting ? colors.success : colors.muted },
              ]}
              onPress={handleSubmit}
              disabled={!canSubmit || submitting}
              activeOpacity={0.85}
            >
              {submitting ? (
                <Text style={[styles.submitBtnText, { color: colors.mutedForeground }]}>Verifying...</Text>
              ) : (
                <>
                  <Feather name="shield" size={18} color={canSubmit ? "#fff" : colors.mutedForeground} />
                  <Text style={[styles.submitBtnText, { color: canSubmit ? "#fff" : colors.mutedForeground }]}>
                    Submit for Verification
                  </Text>
                </>
              )}
            </TouchableOpacity>

            <Text style={[styles.disclaimer, { color: colors.mutedForeground }]}>
              Your {providerLabel} account and National ID will be reviewed by our team. Verification is valid for one month.
            </Text>
          </>
        )}
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
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  stepNum: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  stepNumText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 13,
  },
  stepLabel: {
    fontSize: 14,
    fontWeight: "600",
  },
  stepSub: {
    fontSize: 12,
    lineHeight: 17,
    marginTop: 1,
  },
  authConfirmedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 2,
  },
  providerDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  providerDotText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#fff",
  },
  authConfirmedText: {
    fontSize: 12,
    fontWeight: "600",
  },
  doneTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  doneTagText: {
    fontSize: 11,
    fontWeight: "800",
  },
  gateCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    alignItems: "center",
    gap: 12,
  },
  gateTitle: {
    fontSize: 18,
    fontWeight: "800",
    textAlign: "center",
  },
  gateSub: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  gateBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 4,
  },
  gateBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
  linkedAccountRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  linkedIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  linkedIconText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#fff",
  },
  linkedLabel: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  linkedEmail: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 2,
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
    fontWeight: "600",
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
    fontWeight: "700",
    fontSize: 16,
  },
  disclaimer: {
    fontSize: 12,
    textAlign: "center",
    lineHeight: 18,
  },
});
