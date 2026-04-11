import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  Alert,
  Image,
  Linking,
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
  const { events, user, currency, startChat } = useApp();
  const router = useRouter();

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
          <View style={[styles.catBadge, { backgroundColor: catColor }]}>
            <Feather name={catIcon as any} size={13} color="#fff" />
            <Text style={styles.catBadgeText}>{catLabel}</Text>
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
          <TouchableOpacity
            style={[styles.phoneBtn, { backgroundColor: colors.muted, borderColor: colors.border }]}
            onPress={() => Linking.openURL(`tel:${event.holderPhone}`)}
          >
            <Feather name="phone" size={15} color={colors.foreground} />
            <Text style={[styles.phoneBtnText, { color: colors.foreground }]}>{event.holderPhone}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: bottomPad + 10, borderTopColor: colors.border, backgroundColor: colors.background }]}>
        <View style={[styles.comingSoonBanner, { backgroundColor: colors.muted, borderColor: colors.border }]}>
          <Feather name="lock" size={16} color={colors.mutedForeground} />
          <Text style={[styles.comingSoonText, { color: colors.mutedForeground }]}>Ticket purchasing coming soon</Text>
        </View>
        <TouchableOpacity style={[styles.chatOutlineBtn, { borderColor: catColor }]} onPress={handleChat}>
          <Feather name="message-circle" size={18} color={catColor} />
          <Text style={[styles.chatOutlineBtnText, { color: catColor }]}>Message Holder</Text>
        </TouchableOpacity>
      </View>
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
});
