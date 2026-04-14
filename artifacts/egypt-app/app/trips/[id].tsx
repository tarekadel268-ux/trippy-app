import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Dimensions,
  Image,
  Linking,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ChatThread, useApp } from "@/contexts/AppContext";
import { useColors } from "@/hooks/useColors";

const SCREEN_W = Dimensions.get("window").width;

const CITY_IMAGES: Record<string, any> = {
  Alexandria: require("@/assets/images/alexandria.png"),
  "Sharm El-Sheikh": require("@/assets/images/sharm.png"),
  Dahab: require("@/assets/images/dahab.png"),
  Nuweiba: require("@/assets/images/nuweiba.png"),
  Hurghada: require("@/assets/images/hurghada.png"),
  Gouna: require("@/assets/images/gouna.png"),
  Luxor: require("@/assets/images/luxor.png"),
  Aswan: require("@/assets/images/aswan.png"),
};

export default function TripDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { trips, user, currency, startChat } = useApp();
  const router = useRouter();

  const [lightboxUri, setLightboxUri] = useState<string | null>(null);

  const handleReport = () => {
    Alert.alert(
      "Report Listing",
      "Why are you reporting this listing?",
      [
        { text: "Misleading or inaccurate", onPress: () => Alert.alert("Report Submitted", "Thank you. We'll review this listing shortly.") },
        { text: "Fraudulent or scam", onPress: () => Alert.alert("Report Submitted", "Thank you. We'll review this listing shortly.") },
        { text: "Inappropriate content", onPress: () => Alert.alert("Report Submitted", "Thank you. We'll review this listing shortly.") },
        { text: "Cancel", style: "cancel" },
      ]
    );
  };

  const trip = trips.find(t => t.id === id);
  if (!trip) return null;

  const price = currency === "USD" ? `$${trip.priceUSD}` : `EGP ${trip.priceEGP.toLocaleString()}`;
  const isSubscribed = user?.subscriptionExpiry ? new Date(user.subscriptionExpiry) > new Date() : false;
  const canSeeContact = user?.nationality === "egyptian" || isSubscribed || user?.role === "event_planner";
  const topPad = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const handleChat = async () => {
    if (!user) return;
    Haptics.selectionAsync();
    const threadId = `trip_${trip.id}_${user.id}`;
    const thread: ChatThread = {
      id: threadId,
      participantId: trip.id,
      participantName: trip.plannerName,
      listingId: trip.id,
      listingTitle: trip.title,
      messages: [],
      lastUpdated: new Date().toISOString(),
    };
    await startChat(thread);
    router.push(`/chat/${threadId}`);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.heroContainer}>
        <Image source={CITY_IMAGES[trip.city]} style={styles.heroImage} resizeMode="cover" />
        <View style={[styles.heroOverlay, { paddingTop: topPad + 4 }]}>
          <TouchableOpacity style={[styles.backBtn, { backgroundColor: "rgba(0,0,0,0.45)" }]} onPress={() => router.back()}>
            <Feather name="arrow-left" size={20} color="#fff" />
          </TouchableOpacity>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            {trip.plannerVerified && (
              <View style={[styles.verifiedBadge, { backgroundColor: colors.success }]}>
                <Feather name="shield" size={12} color="#fff" />
                <Text style={styles.verifiedText}>Verified</Text>
              </View>
            )}
            <TouchableOpacity
              style={[styles.backBtn, { backgroundColor: "rgba(0,0,0,0.45)" }]}
              onPress={handleReport}
            >
              <Feather name="flag" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.heroBadge}>
          <Text style={styles.heroDays}>{trip.days} days</Text>
          <Text style={styles.heroCity}>{trip.city}</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: bottomPad + 90 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.titleSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.tripTitle, { color: colors.foreground }]}>{trip.title}</Text>
          <View style={styles.priceRow}>
            <Text style={[styles.price, { color: colors.primary }]}>{price}</Text>
            <View style={styles.viewsRow}>
              <Feather name="eye" size={13} color={colors.mutedForeground} />
              <Text style={[styles.viewsText, { color: colors.mutedForeground }]}>{trip.viewCount} views</Text>
            </View>
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>About this trip</Text>
          <Text style={[styles.desc, { color: colors.mutedForeground }]}>{trip.description}</Text>
        </View>

        {trip.photos && trip.photos.length > 0 && (
          <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Photos</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.photoRow}>
              {trip.photos.map((uri, i) => (
                <TouchableOpacity key={i} onPress={() => setLightboxUri(uri)} activeOpacity={0.85}>
                  <Image source={{ uri }} style={styles.photoThumb} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>What's included</Text>
          <View style={styles.includesGrid}>
            {trip.includes.map((item, i) => (
              <View key={i} style={[styles.includeItem, { backgroundColor: colors.muted }]}>
                <Feather name="check" size={14} color={colors.success} />
                <Text style={[styles.includeText, { color: colors.foreground }]}>{item}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Trip Organizer</Text>
          <View style={styles.plannerRow}>
            <View style={[styles.plannerAvatar, { backgroundColor: colors.primary + "22" }]}>
              <Text style={[styles.plannerInitial, { color: colors.primary }]}>{trip.plannerName.charAt(0)}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.plannerNameRow}>
                <Text style={[styles.plannerName, { color: colors.foreground }]}>{trip.plannerName}</Text>
                {trip.plannerVerified && (
                  <Feather name="shield" size={14} color={colors.success} />
                )}
              </View>
              <Text style={[styles.plannerLabel, { color: colors.mutedForeground }]}>Trip Organizer</Text>
            </View>
          </View>

          {canSeeContact ? (
            <TouchableOpacity
              style={[styles.phoneBtn, { backgroundColor: colors.muted, borderColor: colors.border }]}
              onPress={() => Linking.openURL(`tel:${trip.plannerPhone}`)}
            >
              <Feather name="phone" size={15} color={colors.foreground} />
              <Text style={[styles.phoneBtnText, { color: colors.foreground }]}>{trip.plannerPhone}</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.blurContact, { backgroundColor: colors.primary + "15", borderColor: colors.primary + "44" }]}
              onPress={() => router.push("/subscribe")}
            >
              <Feather name="lock" size={16} color={colors.primary} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.blurTitle, { color: colors.primary }]}>Contact hidden</Text>
                <Text style={[styles.blurSub, { color: colors.mutedForeground }]}>Subscribe for $15/month to view</Text>
              </View>
              <Feather name="chevron-right" size={16} color={colors.primary} />
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: bottomPad + 10, borderTopColor: colors.border, backgroundColor: colors.background }]}>
        {canSeeContact ? (
          <TouchableOpacity style={[styles.chatBtn, { backgroundColor: colors.primary }]} onPress={handleChat}>
            <Feather name="message-circle" size={18} color="#fff" />
            <Text style={styles.chatBtnText}>Message Organizer</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={[styles.chatBtn, { backgroundColor: colors.deepBlue }]} onPress={() => router.push("/subscribe")}>
            <Feather name="unlock" size={18} color="#fff" />
            <Text style={styles.chatBtnText}>Subscribe to Contact — $15/mo</Text>
          </TouchableOpacity>
        )}
      </View>

      <Modal visible={!!lightboxUri} transparent animationType="fade" onRequestClose={() => setLightboxUri(null)}>
        <View style={styles.lightboxBg}>
          <TouchableOpacity style={styles.lightboxClose} onPress={() => setLightboxUri(null)}>
            <Feather name="x" size={22} color="#fff" />
          </TouchableOpacity>
          {lightboxUri && (
            <Image source={{ uri: lightboxUri }} style={styles.lightboxImg} resizeMode="contain" />
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  heroContainer: {
    height: 260,
    position: "relative",
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  heroOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  verifiedText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 12,
  },
  heroBadge: {
    position: "absolute",
    bottom: 14,
    left: 16,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  heroDays: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 12,
  },
  heroCity: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 18,
  },
  scroll: {
    paddingHorizontal: 16,
    paddingTop: 14,
    gap: 14,
  },
  titleSection: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 18,
    gap: 10,
  },
  tripTitle: {
    fontSize: 22,
    fontWeight: "800",
    lineHeight: 28,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  price: {
    fontSize: 28,
    fontWeight: "800",
  },
  viewsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  viewsText: {
    fontSize: 13,
  },
  section: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 18,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
  },
  desc: {
    fontSize: 15,
    lineHeight: 22,
  },
  includesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  includeItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
  },
  includeText: {
    fontSize: 13,
    fontWeight: "500",
  },
  plannerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  plannerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  plannerInitial: {
    fontSize: 20,
    fontWeight: "800",
  },
  plannerNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  plannerName: {
    fontSize: 16,
    fontWeight: "700",
  },
  plannerLabel: {
    fontSize: 13,
    marginTop: 2,
  },
  phoneBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  phoneBtnText: {
    fontSize: 15,
    fontWeight: "600",
  },
  blurContact: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  blurTitle: {
    fontWeight: "700",
    fontSize: 14,
  },
  blurSub: {
    fontSize: 12,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  chatBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 15,
    borderRadius: 14,
  },
  chatBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  photoRow: { flexDirection: "row", gap: 10 },
  photoThumb: { width: 140, height: 100, borderRadius: 10 },
  lightboxBg: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.92)",
    alignItems: "center", justifyContent: "center",
  },
  lightboxImg: { width: SCREEN_W, height: SCREEN_W * 0.75 },
  lightboxClose: {
    position: "absolute", top: 54, right: 20,
    backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 20,
    width: 40, height: 40, alignItems: "center", justifyContent: "center",
  },
});
