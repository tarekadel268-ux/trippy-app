import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Modal,
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
  const { user, setUser, currency, setCurrency, organizers, myOrganizerId, setMyOrganizerId } = useApp();
  const router = useRouter();
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [editing, setEditing] = useState(false);
  const [showOrgPicker, setShowOrgPicker] = useState(false);

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

        {(user.role === "trip_planner" || user.role === "ticket_holder") && (() => {
          const myOrg = organizers.find(o => o.id === myOrganizerId);
          const relevantOrgs = organizers.filter(o =>
            user.role === "ticket_holder" ? o.type === "lounge" : o.type === "trip_planner"
          );
          return (
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.cardHeader}>
                <Text style={[styles.cardTitle, { color: colors.foreground }]}>My Public Profile</Text>
                <TouchableOpacity onPress={() => setShowOrgPicker(true)}>
                  <Feather name="settings" size={18} color={colors.primary} />
                </TouchableOpacity>
              </View>
              {myOrg ? (
                <TouchableOpacity
                  style={[styles.orgRow, { backgroundColor: myOrg.coverColor + "15", borderColor: myOrg.coverColor + "40" }]}
                  onPress={() => router.push(`/organizer/${myOrg.id}`)}
                  activeOpacity={0.85}
                >
                  <View style={[styles.orgDot, { backgroundColor: myOrg.avatarColor }]}>
                    <Feather name={myOrg.type === "lounge" ? "coffee" : "map"} size={16} color="#fff" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.orgRowName, { color: colors.foreground }]}>{myOrg.name}</Text>
                    <Text style={[styles.orgRowCity, { color: colors.mutedForeground }]}>{myOrg.city}</Text>
                  </View>
                  <View style={styles.orgEditHint}>
                    <Feather name="edit-2" size={13} color={myOrg.coverColor} />
                    <Text style={[styles.orgEditHintText, { color: myOrg.coverColor }]}>Edit photos</Text>
                  </View>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[styles.linkOrgBtn, { borderColor: colors.primary + "60" }]}
                  onPress={() => setShowOrgPicker(true)}
                  activeOpacity={0.85}
                >
                  <Feather name="link" size={16} color={colors.primary} />
                  <Text style={[styles.linkOrgBtnText, { color: colors.primary }]}>Link your organizer profile</Text>
                </TouchableOpacity>
              )}
              <Text style={[styles.subNote, { color: colors.mutedForeground }]}>
                Link your organizer page to update your profile & cover photos directly.
              </Text>

              <Modal visible={showOrgPicker} transparent animationType="slide" onRequestClose={() => setShowOrgPicker(false)}>
                <View style={styles.modalOverlay}>
                  <View style={[styles.modalSheet, { backgroundColor: colors.card }]}>
                    <View style={styles.modalHandle} />
                    <Text style={[styles.modalTitle, { color: colors.foreground }]}>Select Your Organizer Profile</Text>
                    <Text style={[styles.modalSub, { color: colors.mutedForeground }]}>
                      This links your account so you can edit photos on that profile.
                    </Text>
                    {relevantOrgs.map(org => (
                      <TouchableOpacity
                        key={org.id}
                        style={[
                          styles.orgPickerRow,
                          {
                            backgroundColor: myOrganizerId === org.id ? org.coverColor + "18" : colors.muted,
                            borderColor: myOrganizerId === org.id ? org.coverColor : colors.border,
                          }
                        ]}
                        onPress={async () => {
                          await setMyOrganizerId(myOrganizerId === org.id ? null : org.id);
                          Haptics.selectionAsync();
                          setShowOrgPicker(false);
                        }}
                        activeOpacity={0.85}
                      >
                        <View style={[styles.orgPickerDot, { backgroundColor: org.avatarColor }]}>
                          <Feather name={org.type === "lounge" ? "coffee" : "map"} size={15} color="#fff" />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.orgPickerName, { color: colors.foreground }]}>{org.name}</Text>
                          <Text style={[styles.orgPickerCity, { color: colors.mutedForeground }]}>{org.city}</Text>
                        </View>
                        {myOrganizerId === org.id && <Feather name="check-circle" size={18} color={org.coverColor} />}
                      </TouchableOpacity>
                    ))}
                    <TouchableOpacity
                      style={[styles.modalClose, { backgroundColor: colors.muted, borderColor: colors.border }]}
                      onPress={() => setShowOrgPicker(false)}
                    >
                      <Text style={[styles.modalCloseText, { color: colors.foreground }]}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Modal>
            </View>
          );
        })()}

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
  orgRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  orgDot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  orgRowName: {
    fontSize: 15,
    fontWeight: "700",
  },
  orgRowCity: {
    fontSize: 12,
    marginTop: 2,
  },
  orgEditHint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  orgEditHintText: {
    fontSize: 12,
    fontWeight: "600",
  },
  linkOrgBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderStyle: "dashed" as any,
    justifyContent: "center",
  },
  linkOrgBtnText: {
    fontSize: 14,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 36,
    gap: 12,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(120,120,128,0.4)",
    alignSelf: "center",
    marginBottom: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  modalSub: {
    fontSize: 13,
    lineHeight: 18,
  },
  orgPickerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  orgPickerDot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  orgPickerName: {
    fontSize: 15,
    fontWeight: "700",
  },
  orgPickerCity: {
    fontSize: 12,
    marginTop: 2,
  },
  modalClose: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    borderWidth: 1,
    marginTop: 4,
  },
  modalCloseText: {
    fontSize: 15,
    fontWeight: "700",
  },
});
