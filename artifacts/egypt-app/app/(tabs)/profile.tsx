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

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, setUser, currency, setCurrency } = useApp();
  const router = useRouter();
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [editing, setEditing] = useState(false);

  const isSubscribed = user?.subscriptionExpiry ? new Date(user.subscriptionExpiry) > new Date() : false;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const roleLabels: Record<string, string> = {
    ticket_holder: "Ticket Holder",
    trip_planner: "Trip Planner",
    tourist_viewer: "Tourist Explorer",
  };

  const roleColors: Record<string, string> = {
    ticket_holder: "#e06848",
    trip_planner: "#2d8a4e",
    tourist_viewer: "#2d4a6b",
  };

  const handleSave = async () => {
    if (!user) return;
    await setUser({ ...user, name, phone });
    setEditing(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleLogout = () => {
    Alert.alert("Reset Profile", "This will clear your profile and take you back to the start.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Reset",
        style: "destructive",
        onPress: async () => {
          await setUser(null);
          router.replace("/");
        },
      },
    ]);
  };

  if (!user) return null;

  const roleColor = roleColors[user.role] || colors.primary;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: Platform.OS === "web" ? 67 : insets.top + 20, paddingBottom: bottomPad + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, { color: colors.foreground }]}>Profile</Text>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.roleChip, { backgroundColor: roleColor + "18" }]}>
            <View style={[styles.roleDot, { backgroundColor: roleColor }]} />
            <Text style={[styles.roleText, { color: roleColor }]}>{roleLabels[user.role]}</Text>
          </View>
          <View style={styles.natRow}>
            <Text style={[styles.natLabel, { color: colors.mutedForeground }]}>Nationality:</Text>
            <Text style={[styles.natValue, { color: colors.foreground }]}>
              {user.nationality === "egyptian" ? "🇪🇬 Egyptian" : "International Tourist"}
            </Text>
          </View>
          {user.isVerified && (
            <View style={[styles.verifiedRow, { backgroundColor: colors.success + "18" }]}>
              <Feather name="shield" size={14} color={colors.success} />
              <Text style={[styles.verifiedLabel, { color: colors.success }]}>Verified Planner</Text>
            </View>
          )}
        </View>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: colors.foreground }]}>Personal Info</Text>
            <TouchableOpacity onPress={() => setEditing(!editing)}>
              <Feather name={editing ? "x" : "edit-2"} size={18} color={colors.primary} />
            </TouchableOpacity>
          </View>
          <View style={styles.field}>
            <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Name</Text>
            {editing ? (
              <TextInput
                style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.muted }]}
                value={name}
                onChangeText={setName}
                placeholder="Your name"
                placeholderTextColor={colors.mutedForeground}
              />
            ) : (
              <Text style={[styles.fieldValue, { color: colors.foreground }]}>{user.name || "Not set"}</Text>
            )}
          </View>
          <View style={styles.field}>
            <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Phone</Text>
            {editing ? (
              <TextInput
                style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.muted }]}
                value={phone}
                onChangeText={setPhone}
                placeholder="+20 XXX XXX XXXX"
                placeholderTextColor={colors.mutedForeground}
                keyboardType="phone-pad"
              />
            ) : (
              <Text style={[styles.fieldValue, { color: colors.foreground }]}>{user.phone || "Not set"}</Text>
            )}
          </View>
          {editing && (
            <TouchableOpacity style={[styles.saveBtn, { backgroundColor: colors.primary }]} onPress={handleSave}>
              <Text style={styles.saveBtnText}>Save Changes</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.foreground }]}>Currency</Text>
          <View style={styles.currencyRow}>
            <TouchableOpacity
              style={[styles.currencyBtn, { backgroundColor: currency === "EGP" ? colors.primary : colors.muted }]}
              onPress={() => setCurrency("EGP")}
            >
              <Text style={[styles.currencyBtnText, { color: currency === "EGP" ? "#fff" : colors.mutedForeground }]}>EGP</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.currencyBtn, { backgroundColor: currency === "USD" ? colors.primary : colors.muted }]}
              onPress={() => setCurrency("USD")}
            >
              <Text style={[styles.currencyBtnText, { color: currency === "USD" ? "#fff" : colors.mutedForeground }]}>USD</Text>
            </TouchableOpacity>
          </View>
        </View>

        {user.nationality === "tourist" && (
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.cardTitle, { color: colors.foreground }]}>Tourist Subscription</Text>
            {isSubscribed ? (
              <View style={[styles.subActive, { backgroundColor: colors.success + "18" }]}>
                <Feather name="check-circle" size={18} color={colors.success} />
                <View>
                  <Text style={[styles.subActiveTitle, { color: colors.success }]}>Active — $15/month</Text>
                  <Text style={[styles.subActiveSub, { color: colors.mutedForeground }]}>
                    Expires {new Date(user.subscriptionExpiry!).toLocaleDateString()}
                  </Text>
                </View>
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.subBtn, { backgroundColor: colors.deepBlue }]}
                onPress={() => router.push("/subscribe")}
              >
                <Feather name="unlock" size={16} color="#fff" />
                <Text style={styles.subBtnText}>Subscribe — $15/month</Text>
              </TouchableOpacity>
            )}
            <Text style={[styles.subNote, { color: colors.mutedForeground }]}>
              See contact info of all verified trip planners. No scammers, no fake listings.
            </Text>
          </View>
        )}

        {user.role === "trip_planner" && (
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.cardTitle, { color: colors.foreground }]}>Planner Verification</Text>
            {user.isVerified ? (
              <View style={[styles.subActive, { backgroundColor: colors.success + "18" }]}>
                <Feather name="shield" size={18} color={colors.success} />
                <Text style={[styles.subActiveTitle, { color: colors.success }]}>Verified Planner</Text>
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.subBtn, { backgroundColor: colors.success }]}
                onPress={() => router.push("/verify")}
              >
                <Feather name="shield" size={16} color="#fff" />
                <Text style={styles.subBtnText}>Verify — 200 EGP/month</Text>
              </TouchableOpacity>
            )}
            <Text style={[styles.subNote, { color: colors.mutedForeground }]}>
              Requires Egyptian National ID and valid phone number.
            </Text>
          </View>
        )}

        <TouchableOpacity style={[styles.logoutBtn, { borderColor: colors.destructive }]} onPress={handleLogout}>
          <Feather name="log-out" size={16} color={colors.destructive} />
          <Text style={[styles.logoutText, { color: colors.destructive }]}>Reset Profile</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 20, gap: 16 },
  title: {
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 18,
    gap: 12,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "700",
  },
  roleChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  roleDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  roleText: {
    fontWeight: "700",
    fontSize: 14,
  },
  natRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  natLabel: {
    fontSize: 14,
  },
  natValue: {
    fontSize: 14,
    fontWeight: "600",
  },
  verifiedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    alignSelf: "flex-start",
  },
  verifiedLabel: {
    fontWeight: "700",
    fontSize: 13,
  },
  field: {
    gap: 4,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  fieldValue: {
    fontSize: 16,
    fontWeight: "500",
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
  },
  saveBtn: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 4,
  },
  saveBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
  currencyRow: {
    flexDirection: "row",
    gap: 10,
  },
  currencyBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  currencyBtnText: {
    fontWeight: "700",
    fontSize: 15,
  },
  subActive: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
  },
  subActiveTitle: {
    fontWeight: "700",
    fontSize: 14,
  },
  subActiveSub: {
    fontSize: 12,
  },
  subBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderRadius: 12,
    justifyContent: "center",
  },
  subBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
  subNote: {
    fontSize: 12,
    lineHeight: 17,
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    justifyContent: "center",
    borderWidth: 1.5,
  },
  logoutText: {
    fontWeight: "700",
    fontSize: 15,
  },
});
