import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Alert,
  Animated,
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
import { AdBanner } from "@/components/AdBanner";
import { NativeAdCard } from "@/components/NativeAdCard";
import { ChatThread, useApp } from "@/contexts/AppContext";
import { useInterstitialAd } from "@/hooks/useInterstitialAd";
import { useRewardedAd } from "@/hooks/useRewardedAd";
import { useColors } from "@/hooks/useColors";

const SCREEN_W = Dimensions.get("window").width;

const CATEGORY_LABELS: Record<string, string> = {
  lounge: "Lounge",
  concert: "Concert",
  afro_techno: "Afro & Techno",
  private_party: "Private Party",
};

const CATEGORY_COLORS: Record<string, string> = {
  lounge: "#0abab5",
  concert: "#e06848",
  afro_techno: "#7c3aed",
  private_party: "#c8963e",
};

const CATEGORY_ICONS: Record<string, string> = {
  lounge: "coffee",
  concert: "music",
  afro_techno: "headphones",
  private_party: "zap",
};

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { events, user, currency, startChat, submitReport, blockUser, unblockUser, isBlocked } = useApp();
  const router = useRouter();

  const [lightboxUri, setLightboxUri] = useState<string | null>(null);
  const [phoneUnlocked, setPhoneUnlocked] = useState(false);
  const [chatUnlocked, setChatUnlocked] = useState(false);
  const [isPhoneUnlocking, setIsPhoneUnlocking] = useState(false);
  const [isChatUnlocking, setIsChatUnlocking] = useState(false);

  const phoneFade = useRef(new Animated.Value(0)).current;
  const phoneBtnScale = useRef(new Animated.Value(1)).current;
  const chatBtnScale = useRef(new Animated.Value(1)).current;

  const { isLoaded: adLoaded, showRewardedAd } = useRewardedAd();
  const { trackAction } = useInterstitialAd();

  const animateScale = (anim: Animated.Value) =>
    Animated.sequence([
      Animated.timing(anim, { toValue: 0.95, duration: 80, useNativeDriver: true }),
      Animated.timing(anim, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start();

  const runAd = async (): Promise<boolean> => {
    if (adLoaded) {
      return showRewardedAd();
    }
    // Mock: 2.5s delay when real ad isn't available (Expo Go / dev)
    await new Promise<void>((res) => setTimeout(res, 2500));
    return true;
  };

  const handleUnlockPhone = async () => {
    if (isPhoneUnlocking) return;
    animateScale(phoneBtnScale);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsPhoneUnlocking(true);
    const earned = await runAd();
    if (earned) {
      setPhoneUnlocked(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Animated.timing(phoneFade, { toValue: 1, duration: 500, useNativeDriver: true }).start();
      trackAction();
    } else {
      Alert.alert("Ad skipped", "Watch the full ad to unlock contact info.");
    }
    setIsPhoneUnlocking(false);
  };

  const handleUnlockChat = async () => {
    if (isChatUnlocking) return;
    animateScale(chatBtnScale);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsChatUnlocking(true);
    const earned = await runAd();
    if (earned) {
      setChatUnlocked(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      trackAction();
      handleChat();
    } else {
      Alert.alert("Ad skipped", "Watch the full ad to unlock messaging.");
    }
    setIsChatUnlocking(false);
  };

  const handleReportListing = (eventId: string, eventTitle: string) => {
    Alert.alert(
      "Report Listing",
      "Why are you reporting this listing?",
      [
        {
          text: "Misleading or inaccurate",
          onPress: () => {
            submitReport({ reportedById: user?.id || "anon", targetId: eventId, targetName: eventTitle, type: "listing", reason: "Misleading or inaccurate" });
            Alert.alert("Report Submitted", "Thank you. We'll review this listing shortly.");
          },
        },
        {
          text: "Fraudulent or scam",
          onPress: () => {
            submitReport({ reportedById: user?.id || "anon", targetId: eventId, targetName: eventTitle, type: "listing", reason: "Fraudulent or scam" });
            Alert.alert("Report Submitted", "Thank you. We'll review this listing shortly.");
          },
        },
        {
          text: "Inappropriate content",
          onPress: () => {
            submitReport({ reportedById: user?.id || "anon", targetId: eventId, targetName: eventTitle, type: "listing", reason: "Inappropriate content" });
            Alert.alert("Report Submitted", "Thank you. We'll review this listing shortly.");
          },
        },
        { text: "Cancel", style: "cancel" },
      ]
    );
  };

  const handleReportUser = (holderId: string, holderName: string) => {
    Alert.alert(
      "Report User",
      `Why are you reporting ${holderName}?`,
      [
        {
          text: "Harassment or abuse",
          onPress: () => {
            submitReport({ reportedById: user?.id || "anon", targetId: holderId, targetName: holderName, type: "user", reason: "Harassment or abuse" });
            Alert.alert("Report Submitted", "We'll review this account shortly.");
          },
        },
        {
          text: "Fraudulent activity",
          onPress: () => {
            submitReport({ reportedById: user?.id || "anon", targetId: holderId, targetName: holderName, type: "user", reason: "Fraudulent activity" });
            Alert.alert("Report Submitted", "We'll review this account shortly.");
          },
        },
        {
          text: "Spam",
          onPress: () => {
            submitReport({ reportedById: user?.id || "anon", targetId: holderId, targetName: holderName, type: "user", reason: "Spam" });
            Alert.alert("Report Submitted", "We'll review this account shortly.");
          },
        },
        { text: "Cancel", style: "cancel" },
      ]
    );
  };

  const handleBlockUser = (holderId: string, holderName: string) => {
    const blocked = isBlocked(holderId);
    Alert.alert(
      blocked ? "Unblock User" : "Block User",
      blocked
        ? `Unblock ${holderName}? You'll see their listings again.`
        : `Block ${holderName}? You won't see their listings or messages.`,
      [
        {
          text: blocked ? "Unblock" : "Block",
          style: "destructive",
          onPress: () => blocked ? unblockUser(holderId) : blockUser(holderId),
        },
        { text: "Cancel", style: "cancel" },
      ]
    );
  };

  const event = events.find(e => e.id === id);
  if (!event) return null;

  const price = currency === "USD" ? `$${event.priceUSD}` : `EGP ${event.priceEGP.toLocaleString()}`;
  const catColor = CATEGORY_COLORS[event.category] || colors.primary;
  const catLabel = CATEGORY_LABELS[event.category] || event.category;
  const catIcon = CATEGORY_ICONS[event.category] || "calendar";
  const formatDate = (d: string) => new Date(d).toLocaleDateString("en-EG", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  const topPad = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const handleChat = async () => {
    if (!user) return;
    Haptics.selectionAsync();
    const threadId = `evt_${event.id}_${user.id}`;
    const thread: ChatThread = {
      id: threadId,
      participantId: event.id,
      participantName: event.holderName,
      listingId: event.id,
      listingTitle: event.title,
      messages: [],
      lastUpdated: new Date().toISOString(),
    };
    await startChat(thread);
    router.push(`/chat/${threadId}`);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.heroContainer}>
        {event.imageUrl ? (
          <Image source={{ uri: event.imageUrl }} style={styles.heroImage} resizeMode="cover" />
        ) : (
          <View style={[styles.heroFallback, { backgroundColor: catColor }]} />
        )}
        <LinearGradient
          colors={["rgba(0,0,0,0.18)", "rgba(0,0,0,0.72)"]}
          style={StyleSheet.absoluteFill}
        />
        <View style={[styles.heroTop, { paddingTop: topPad + 10 }]}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Feather name="arrow-left" size={20} color="#fff" />
          </TouchableOpacity>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <View style={[styles.catBadge, { backgroundColor: catColor }]}>
              <Feather name={catIcon as any} size={13} color="#fff" />
              <Text style={styles.catBadgeText}>{catLabel}</Text>
            </View>
            <TouchableOpacity
              style={[styles.backBtn, { backgroundColor: "rgba(0,0,0,0.45)" }]}
              onPress={() => handleReportListing(event.id, event.title)}
            >
              <Feather name="flag" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.heroBottom}>
          <Text style={styles.heroTitle}>{event.title}</Text>
          <View style={styles.heroMeta}>
            <View style={styles.heroMetaItem}>
              <Feather name="map-pin" size={13} color="rgba(255,255,255,0.8)" />
              <Text style={styles.heroMetaText}>{event.venue}</Text>
            </View>
            <View style={styles.heroMetaDot} />
            <View style={styles.heroMetaItem}>
              <Feather name="eye" size={13} color="rgba(255,255,255,0.8)" />
              <Text style={styles.heroMetaText}>{event.viewCount} views</Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: bottomPad + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.priceDateRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.priceBlock}>
            <Text style={[styles.priceLabel, { color: colors.mutedForeground }]}>Ticket Price</Text>
            <Text style={[styles.price, { color: catColor }]}>{price}</Text>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.dateBlock}>
            <Text style={[styles.priceLabel, { color: colors.mutedForeground }]}>Date</Text>
            <Text style={[styles.dateText, { color: colors.foreground }]}>{formatDate(event.date)}</Text>
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>About this listing</Text>
          <Text style={[styles.desc, { color: colors.mutedForeground }]}>{event.description}</Text>
        </View>

        <AdBanner style={{ marginHorizontal: -16, marginBottom: -14 }} />

        <NativeAdCard />

        {event.photos && event.photos.length > 0 && (
          <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Photos</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.photoRow}>
              {event.photos.map((uri, i) => (
                <TouchableOpacity key={i} onPress={() => setLightboxUri(uri)} activeOpacity={0.85}>
                  <Image source={{ uri }} style={styles.photoThumb} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Ticket Holder</Text>
          <View style={styles.holderRow}>
            <View style={[styles.holderAvatar, { backgroundColor: catColor + "22" }]}>
              <Text style={[styles.holderInitial, { color: catColor }]}>{event.holderName.charAt(0)}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.holderName, { color: colors.foreground }]}>{event.holderName}</Text>
              <Text style={[styles.holderContact, { color: colors.mutedForeground }]}>{event.holderContact}</Text>
            </View>
          </View>
          {phoneUnlocked ? (
            <Animated.View style={{ opacity: phoneFade, gap: 8 }}>
              <TouchableOpacity
                style={[styles.phoneBtn, { backgroundColor: colors.muted, borderColor: colors.border }]}
                onPress={() => Linking.openURL(`tel:${event.holderPhone}`)}
              >
                <Feather name="unlock" size={15} color={colors.success} />
                <Text style={[styles.phoneBtnText, { color: colors.foreground }]}>{event.holderPhone}</Text>
              </TouchableOpacity>
              <View style={[styles.successBanner, { backgroundColor: colors.success + "18", borderColor: colors.success + "44" }]}>
                <Feather name="check-circle" size={13} color={colors.success} />
                <Text style={[styles.successText, { color: colors.success }]}>Contact unlocked successfully</Text>
              </View>
            </Animated.View>
          ) : (
            <View style={{ gap: 6 }}>
              <View style={[styles.phoneBtn, { backgroundColor: colors.muted, borderColor: colors.border }]}>
                <Feather name="lock" size={15} color={colors.mutedForeground} />
                <Text style={[styles.phoneBtnText, { color: colors.mutedForeground, letterSpacing: 2 }]}>+20 ••• ••• ••••</Text>
              </View>
              <Text style={[styles.helperText, { color: colors.mutedForeground }]}>Watch a short ad to reveal contact info</Text>
              <Animated.View style={{ transform: [{ scale: phoneBtnScale }] }}>
                <TouchableOpacity
                  style={[styles.phoneBtn, { backgroundColor: isPhoneUnlocking ? colors.primary + "88" : colors.primary + "18", borderColor: colors.primary + "44" }]}
                  onPress={handleUnlockPhone}
                  disabled={isPhoneUnlocking}
                  activeOpacity={0.85}
                >
                  <Feather name={isPhoneUnlocking ? "loader" : "play-circle"} size={15} color={colors.primary} />
                  <Text style={[styles.phoneBtnText, { color: colors.primary }]}>
                    {isPhoneUnlocking ? "Unlocking..." : "Unlock Contact"}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            </View>
          )}
          {user && (
            <View style={styles.safetyRow}>
              <TouchableOpacity
                style={[styles.safetyBtn, { backgroundColor: "#f9731615" }]}
                onPress={() => handleReportUser(event.id, event.holderName)}
              >
                <Feather name="flag" size={14} color="#f97316" />
                <Text style={[styles.safetyBtnText, { color: "#f97316" }]}>Report User</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.safetyBtn, { backgroundColor: isBlocked(event.id) ? "#ef444415" : "#6b728015" }]}
                onPress={() => handleBlockUser(event.id, event.holderName)}
              >
                <Feather name="slash" size={14} color={isBlocked(event.id) ? "#ef4444" : colors.mutedForeground} />
                <Text style={[styles.safetyBtnText, { color: isBlocked(event.id) ? "#ef4444" : colors.mutedForeground }]}>
                  {isBlocked(event.id) ? "Unblock User" : "Block User"}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: bottomPad + 10, borderTopColor: colors.border, backgroundColor: colors.background }]}>
        <View style={[styles.comingSoonBanner, { backgroundColor: colors.muted, borderColor: colors.border }]}>
          <Feather name="lock" size={16} color={colors.mutedForeground} />
          <Text style={[styles.comingSoonText, { color: colors.mutedForeground }]}>Ticket purchasing coming soon</Text>
        </View>
        {chatUnlocked ? (
          <TouchableOpacity style={[styles.chatOutlineBtn, { borderColor: catColor }]} onPress={handleChat}>
            <Feather name="message-circle" size={18} color={catColor} />
            <Text style={[styles.chatOutlineBtnText, { color: catColor }]}>Message Holder</Text>
          </TouchableOpacity>
        ) : (
          <Animated.View style={{ transform: [{ scale: chatBtnScale }] }}>
            <TouchableOpacity
              style={[styles.chatOutlineBtn, { borderColor: colors.primary, backgroundColor: isChatUnlocking ? colors.primary + "15" : "transparent" }]}
              onPress={handleUnlockChat}
              disabled={isChatUnlocking}
              activeOpacity={0.85}
            >
              <Feather name={isChatUnlocking ? "loader" : "play-circle"} size={18} color={colors.primary} />
              <Text style={[styles.chatOutlineBtnText, { color: colors.primary }]}>
                {isChatUnlocking ? "Unlocking..." : "Unlock to Message"}
              </Text>
            </TouchableOpacity>
          </Animated.View>
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
    height: 280,
    position: "relative",
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  heroFallback: {
    width: "100%",
    height: "100%",
  },
  heroTop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  catBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
  },
  catBadgeText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
  },
  heroBottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 18,
    paddingBottom: 18,
    gap: 8,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#fff",
    lineHeight: 30,
    letterSpacing: -0.3,
  },
  heroMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  heroMetaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  heroMetaText: {
    fontSize: 13,
    color: "rgba(255,255,255,0.8)",
  },
  heroMetaDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: "rgba(255,255,255,0.5)",
  },
  scroll: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 14,
  },
  priceDateRow: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 18,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 16,
  },
  priceBlock: { flex: 1, gap: 4 },
  dateBlock: { flex: 2, gap: 4 },
  divider: { width: 1, height: "100%", minHeight: 36 },
  priceLabel: { fontSize: 11, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5 },
  price: { fontSize: 26, fontWeight: "800" },
  dateText: { fontSize: 14, fontWeight: "600", lineHeight: 20 },
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
  holderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  holderAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  holderInitial: {
    fontSize: 18,
    fontWeight: "800",
  },
  holderName: {
    fontSize: 15,
    fontWeight: "700",
  },
  holderContact: {
    fontSize: 13,
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
  safetyRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 10,
  },
  safetyBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
  },
  safetyBtnText: {
    fontSize: 13,
    fontWeight: "600",
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
  comingSoonBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 15,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  comingSoonText: {
    fontWeight: "600",
    fontSize: 15,
  },
  chatOutlineBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 13,
    borderRadius: 14,
    borderWidth: 1.5,
    marginTop: 10,
  },
  chatOutlineBtnText: {
    fontWeight: "700",
    fontSize: 15,
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
  successBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  successText: {
    fontSize: 12,
    fontWeight: "600",
  },
  helperText: {
    fontSize: 12,
    textAlign: "center",
  },
});
