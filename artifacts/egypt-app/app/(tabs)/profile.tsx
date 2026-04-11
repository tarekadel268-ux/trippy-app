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
  const { user, setUser, currency, setCurrency, organizers, myOrganizerId, setMyOrganizerId, events, trips, purchasedTickets } = useApp();
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [username, setUsername] = useState(user?.username || "");
  const [usernameError, setUsernameError] = useState("");

  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const roleLabels: Record<string, string> = {
    ticket_holder: "Ticket Holder",
    trip_planner: "Events Planner",
    tourist_viewer: "Tourist Explorer",
    resident_viewer: "View Events & Tickets",
  };

  const roleColors: Record<string, string> = {
    ticket_holder: "#e06848",
    trip_planner: "#0abab5",
    resident_viewer: "#c9a800",
    tourist_viewer: "#2d4a6b",
  };

  const validateUsername = (val: string) => {
    if (val.length < 3) return "At least 3 characters";
    if (val.length > 20) return "Max 20 characters";
    if (!/^[a-z0-9_]+$/.test(val)) return "Lowercase letters, numbers, underscores only";
    return "";
  };

  const handleUsernameChange = (val: string) => {
    const clean = val.toLowerCase().replace(/[^a-z0-9_]/g, "");
    setUsername(clean);
    setUsernameError(clean.length > 0 ? validateUsername(clean) : "");
  };

  const handleSave = async () => {
    if (!user) return;
    if (usernameError) return;
    await setUser({ ...user, name: name.trim(), phone: phone.trim(), username: username.trim() });
    setEditing(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleLogout = () => {
    Alert.alert("Sign Out", "This will clear your profile and take you back to the start.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
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
  const myOrg = organizers.find(o => o.id === myOrganizerId);
  const initials = (user.name || user.username || "?").slice(0, 2).toUpperCase();
  const isPlannerSub = user.subscriptionExpiry ? new Date(user.subscriptionExpiry) > new Date() : false;
  const subExpiry = user.subscriptionExpiry
    ? new Date(user.subscriptionExpiry).toLocaleDateString("en-EG", { day: "numeric", month: "short", year: "numeric" })
    : null;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: Platform.OS === "web" ? 67 : insets.top + 20, paddingBottom: bottomPad + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, { color: colors.foreground }]}>Profile</Text>

        <View style={[styles.profileHero, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.avatar, { backgroundColor: roleColor }]}>
            <Text style={styles.avatarInitials}>{initials}</Text>
            {user.authProvider && (
              <View style={[styles.providerBadge, { backgroundColor: user.authProvider === "google" ? "#4285F4" : "#000" }]}>
                <Text style={styles.providerBadgeText}>{user.authProvider === "google" ? "G" : ""}</Text>
                {user.authProvider === "apple" && <Feather name="smartphone" size={8} color="#fff" />}
              </View>
            )}
          </View>
          <View style={styles.heroInfo}>
            <Text style={[styles.heroName, { color: colors.foreground }]}>{user.name || "Set your name"}</Text>
            <Text style={[styles.heroUsername, { color: colors.primary }]}>@{user.username || "username"}</Text>
            {user.email && (
              <Text style={[styles.heroEmail, { color: colors.mutedForeground }]}>{user.email}</Text>
            )}
          </View>
          <View style={[styles.roleChip, { backgroundColor: roleColor + "18" }]}>
            <View style={[styles.roleDot, { backgroundColor: roleColor }]} />
            <Text style={[styles.roleText, { color: roleColor }]}>{roleLabels[user.role]}</Text>
          </View>
          {user.isVerified && isPlannerSub && (
            <View style={[styles.verifiedRow, { backgroundColor: colors.success + "18" }]}>
              <Feather name="shield" size={14} color={colors.success} />
              <Text style={[styles.verifiedLabel, { color: colors.success }]}>Verified Planner</Text>
            </View>
          )}
        </View>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: colors.foreground }]}>Account Info</Text>
            <TouchableOpacity onPress={() => { setEditing(!editing); setName(user.name); setPhone(user.phone); setUsername(user.username || ""); }}>
              <Feather name={editing ? "x" : "edit-2"} size={18} color={colors.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.field}>
            <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Display Name</Text>
            {editing ? (
              <TextInput style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.muted }]}
                value={name} onChangeText={setName} placeholder="Your name" placeholderTextColor={colors.mutedForeground} />
            ) : (
              <Text style={[styles.fieldValue, { color: colors.foreground }]}>{user.name || "Not set"}</Text>
            )}
          </View>

          <View style={styles.field}>
            <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Username</Text>
            {editing ? (
              <View>
                <View style={[styles.usernameRow, { borderColor: usernameError ? "#f87171" : colors.border, backgroundColor: colors.muted }]}>
                  <Text style={[styles.atPrefix, { color: colors.primary }]}>@</Text>
                  <TextInput
                    style={[styles.usernameInput, { color: colors.foreground }]}
                    value={username}
                    onChangeText={handleUsernameChange}
                    placeholder="yourhandle"
                    placeholderTextColor={colors.mutedForeground}
                    autoCapitalize="none"
                    autoCorrect={false}
                    maxLength={20}
                  />
                </View>
                {usernameError ? (
                  <Text style={styles.fieldError}>{usernameError}</Text>
                ) : null}
              </View>
            ) : (
              <Text style={[styles.fieldValue, { color: colors.primary, fontWeight: "700" }]}>@{user.username || "not set"}</Text>
            )}
          </View>

          <View style={styles.field}>
            <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Phone</Text>
            {editing ? (
              <TextInput style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.muted }]}
                value={phone} onChangeText={setPhone} placeholder="+20 XXX XXX XXXX" placeholderTextColor={colors.mutedForeground} keyboardType="phone-pad" />
            ) : (
              <Text style={[styles.fieldValue, { color: colors.foreground }]}>{user.phone || "Not set"}</Text>
            )}
          </View>

          {user.email && (
            <View style={styles.field}>
              <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>
                {user.authProvider === "google" ? "Gmail" : user.authProvider === "apple" ? "Apple ID" : "Email"}
              </Text>
              <View style={styles.emailRow}>
                <Text style={[styles.fieldValue, { color: colors.foreground }]}>{user.email}</Text>
                <View style={[styles.providerPill, { backgroundColor: user.authProvider === "google" ? "#4285F420" : "#00000020" }]}>
                  <Text style={[styles.providerPillText, { color: user.authProvider === "google" ? "#4285F4" : colors.foreground }]}>
                    {user.authProvider === "google" ? "Google" : "Apple"}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {editing && (
            <TouchableOpacity style={[styles.saveBtn, { backgroundColor: colors.primary }]} onPress={handleSave}>
              <Text style={styles.saveBtnText}>Save Changes</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.foreground }]}>Currency</Text>
          <View style={styles.currencyRow}>
            <TouchableOpacity style={[styles.currencyBtn, { backgroundColor: currency === "EGP" ? colors.primary : colors.muted }]} onPress={() => setCurrency("EGP")}>
              <Text style={[styles.currencyBtnText, { color: currency === "EGP" ? "#fff" : colors.mutedForeground }]}>EGP</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.currencyBtn, { backgroundColor: currency === "USD" ? colors.primary : colors.muted }]} onPress={() => setCurrency("USD")}>
              <Text style={[styles.currencyBtnText, { color: currency === "USD" ? "#fff" : colors.mutedForeground }]}>USD</Text>
            </TouchableOpacity>
          </View>
        </View>

        {user.role === "trip_planner" && (
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.cardTitle, { color: colors.foreground }]}>Account Verification</Text>
            {user.isVerified ? (
              <View style={[styles.subActive, { backgroundColor: colors.success + "18" }]}>
                <Feather name="shield" size={18} color={colors.success} />
                <Text style={[styles.subActiveTitle, { color: colors.success }]}>Verified Events Planner</Text>
              </View>
            ) : (
              <TouchableOpacity style={[styles.subBtn, { backgroundColor: colors.success }]} onPress={() => router.push("/verify")}>
                <Feather name="shield" size={16} color="#fff" />
                <Text style={styles.subBtnText}>Verify My Account</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {user.role === "trip_planner" && (
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.subCardHeader}>
              <View style={[styles.subCardIconWrap, { backgroundColor: colors.primary + "18" }]}>
                <Feather name="star" size={18} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.cardTitle, { color: colors.foreground, marginBottom: 0 }]}>Planner Subscription</Text>
                <Text style={[styles.subCardPrice, { color: colors.primary }]}>50 EGP / month</Text>
              </View>
              {isPlannerSub && (
                <View style={[styles.activePill, { backgroundColor: colors.success + "20" }]}>
                  <View style={[styles.activeDot, { backgroundColor: colors.success }]} />
                  <Text style={[styles.activePillText, { color: colors.success }]}>Active</Text>
                </View>
              )}
            </View>
            {[
              { icon: "trending-up" as const, text: "Your plans appear at the top of the list" },
              { icon: "bell" as const, text: "Viewers get notified of your new offers" },
              { icon: "message-circle" as const, text: "Clients can message you directly in-app" },
              { icon: "check-circle" as const, text: "Verified badge on your public profile" },
            ].map((b, i) => (
              <View key={i} style={styles.subBenefitRow}>
                <Feather name={b.icon} size={14} color={colors.primary} />
                <Text style={[styles.subBenefitText, { color: colors.foreground }]}>{b.text}</Text>
              </View>
            ))}
            {isPlannerSub ? (
              <View style={[styles.subActive, { backgroundColor: colors.success + "14", marginTop: 4 }]}>
                <Feather name="check-circle" size={16} color={colors.success} />
                <Text style={[styles.subActiveTitle, { color: colors.success, fontSize: 13 }]}>Active until {subExpiry}</Text>
              </View>
            ) : (
              <TouchableOpacity style={[styles.subBtn, { backgroundColor: colors.primary, marginTop: 4 }]} onPress={() => router.push("/planner-subscribe")} activeOpacity={0.85}>
                <Feather name="star" size={16} color="#fff" />
                <Text style={styles.subBtnText}>Subscribe — 50 EGP/month</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {(user.role === "trip_planner" || user.role === "ticket_holder") && myOrg && (
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.cardTitle, { color: colors.foreground }]}>My Public Profile</Text>
            <TouchableOpacity
              style={[styles.orgRow, { backgroundColor: myOrg.coverColor + "15", borderColor: myOrg.coverColor + "40", borderWidth: 1, borderRadius: 14, padding: 14 }]}
              onPress={() => router.push(`/organizer/${myOrg.id}`)}
              activeOpacity={0.85}
            >
              <View style={[styles.orgDot, { backgroundColor: myOrg.avatarColor }]}>
                <Feather name={myOrg.type === "lounge" ? "coffee" : "map"} size={16} color="#fff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.orgRowName, { color: colors.foreground }]}>{myOrg.name}</Text>
                <Text style={[styles.orgRowUsername, { color: myOrg.coverColor }]}>@{user.username}</Text>
              </View>
              <View style={styles.orgViewHint}>
                <Feather name="external-link" size={14} color={myOrg.coverColor} />
                <Text style={[styles.orgViewHintText, { color: myOrg.coverColor }]}>View</Text>
              </View>
            </TouchableOpacity>
            <Text style={[styles.subNote, { color: colors.mutedForeground }]}>
              This is your public-facing page visible to all users.
            </Text>
          </View>
        )}

        {(user.role === "ticket_holder" || user.role === "trip_planner" || user.role === "resident_viewer") && (() => {
          const myPostedEvents = events.filter(e => e.organizerId === myOrganizerId);
          const myPostedTrips = trips.filter(t => t.organizerId === myOrganizerId);
          const hasListings = myPostedEvents.length > 0 || myPostedTrips.length > 0;
          const hasTickets = purchasedTickets.length > 0;
          if (!hasListings && !hasTickets) return null;
          return (
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.cardTitle, { color: colors.foreground }]}>My Events & Tickets</Text>
              {hasListings && (
                <>
                  <Text style={[styles.subSectionLabel, { color: colors.mutedForeground }]}>POSTED LISTINGS</Text>
                  {myPostedEvents.map(ev => (
                    <TouchableOpacity key={ev.id} style={[styles.listingRow, { backgroundColor: colors.muted }]} onPress={() => router.push(`/events/${ev.id}`)} activeOpacity={0.85}>
                      <View style={[styles.listingIcon, { backgroundColor: colors.primary + "20" }]}>
                        <Feather name="calendar" size={15} color={colors.primary} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.listingTitle, { color: colors.foreground }]} numberOfLines={1}>{ev.title}</Text>
                        <Text style={[styles.listingMeta, { color: colors.mutedForeground }]}>{ev.venue}</Text>
                      </View>
                      <Text style={[styles.listingPrice, { color: colors.primary }]}>EGP {ev.priceEGP.toLocaleString()}</Text>
                    </TouchableOpacity>
                  ))}
                  {myPostedTrips.map(tr => (
                    <TouchableOpacity key={tr.id} style={[styles.listingRow, { backgroundColor: colors.muted }]} onPress={() => router.push(`/trips/${tr.id}`)} activeOpacity={0.85}>
                      <View style={[styles.listingIcon, { backgroundColor: colors.primary + "20" }]}>
                        <Feather name="map" size={15} color={colors.primary} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.listingTitle, { color: colors.foreground }]} numberOfLines={1}>{tr.title}</Text>
                        <Text style={[styles.listingMeta, { color: colors.mutedForeground }]}>{tr.city} · {tr.days} days</Text>
                      </View>
                      <Text style={[styles.listingPrice, { color: colors.primary }]}>EGP {tr.priceEGP.toLocaleString()}</Text>
                    </TouchableOpacity>
                  ))}
                </>
              )}
              {hasTickets && (
                <>
                  <Text style={[styles.subSectionLabel, { color: colors.mutedForeground, marginTop: hasListings ? 8 : 0 }]}>PURCHASED TICKETS</Text>
                  {purchasedTickets.map(ticket => (
                    <View key={ticket.id} style={[styles.ticketRow, { backgroundColor: colors.primary + "10", borderColor: colors.primary + "30" }]}>
                      <View style={[styles.listingIcon, { backgroundColor: colors.primary + "20" }]}>
                        <Feather name="tag" size={15} color={colors.primary} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.listingTitle, { color: colors.foreground }]} numberOfLines={1}>{ticket.eventTitle}</Text>
                        <Text style={[styles.listingMeta, { color: colors.mutedForeground }]}>
                          {ticket.quantity} ticket{ticket.quantity > 1 ? "s" : ""} · {new Date(ticket.purchasedAt).toLocaleDateString("en-EG", { day: "numeric", month: "short" })}
                        </Text>
                      </View>
                      <Text style={[styles.listingPrice, { color: colors.primary }]}>EGP {ticket.priceEGP.toLocaleString()}</Text>
                    </View>
                  ))}
                </>
              )}
            </View>
          );
        })()}

        <TouchableOpacity style={[styles.logoutBtn, { borderColor: colors.destructive }]} onPress={handleLogout}>
          <Feather name="log-out" size={16} color={colors.destructive} />
          <Text style={[styles.logoutText, { color: colors.destructive }]}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 20, gap: 16 },
  title: { fontSize: 32, fontWeight: "800", letterSpacing: -0.5, marginBottom: 4 },
  profileHero: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    gap: 12,
    alignItems: "center",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  avatarInitials: {
    fontSize: 30,
    fontWeight: "800",
    color: "#fff",
  },
  providerBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  providerBadgeText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#fff",
  },
  heroInfo: {
    alignItems: "center",
    gap: 3,
  },
  heroName: {
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  heroUsername: {
    fontSize: 15,
    fontWeight: "700",
  },
  heroEmail: {
    fontSize: 13,
  },
  roleChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: "center",
  },
  roleDot: { width: 8, height: 8, borderRadius: 4 },
  roleText: { fontWeight: "700", fontSize: 13 },
  verifiedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    alignSelf: "center",
  },
  verifiedLabel: { fontWeight: "700", fontSize: 13 },
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
  cardTitle: { fontSize: 17, fontWeight: "700" },
  field: { gap: 4 },
  fieldLabel: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  fieldValue: { fontSize: 15, fontWeight: "500" },
  fieldError: { fontSize: 12, color: "#f87171", marginTop: 3 },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
  },
  usernameRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 10,
    overflow: "hidden",
  },
  atPrefix: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    fontWeight: "800",
  },
  usernameInput: {
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 10,
    fontSize: 15,
  },
  emailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  providerPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  providerPillText: {
    fontSize: 11,
    fontWeight: "700",
  },
  saveBtn: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 4,
  },
  saveBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  currencyRow: { flexDirection: "row", gap: 10 },
  currencyBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: "center" },
  currencyBtnText: { fontWeight: "700", fontSize: 15 },
  subActive: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
  },
  subActiveTitle: { fontWeight: "700", fontSize: 14 },
  subBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 13,
    borderRadius: 12,
  },
  subBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  subCardHeader: { flexDirection: "row", alignItems: "center", gap: 12 },
  subCardIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  subCardPrice: { fontSize: 13, fontWeight: "700", marginTop: 1 },
  activePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  activeDot: { width: 7, height: 7, borderRadius: 3.5 },
  activePillText: { fontSize: 12, fontWeight: "700" },
  subBenefitRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  subBenefitText: { fontSize: 13, flex: 1 },
  orgRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  orgDot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  orgRowName: { fontSize: 15, fontWeight: "700" },
  orgRowUsername: { fontSize: 13, fontWeight: "600", marginTop: 2 },
  orgViewHint: { flexDirection: "row", alignItems: "center", gap: 4 },
  orgViewHintText: { fontSize: 13, fontWeight: "700" },
  subNote: { fontSize: 12, lineHeight: 17 },
  subSectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  listingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    borderRadius: 12,
  },
  ticketRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  listingIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  listingTitle: { fontSize: 14, fontWeight: "600" },
  listingMeta: { fontSize: 12, marginTop: 1 },
  listingPrice: { fontSize: 13, fontWeight: "700" },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    marginTop: 4,
  },
  logoutText: { fontSize: 15, fontWeight: "700" },
});
