import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  Alert,
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
  concert: "Concert",
  afro_techno: "Afro & Techno",
  private_party: "Private Party",
};

const CATEGORY_COLORS: Record<string, string> = {
  concert: "#e06848",
  afro_techno: "#7c3aed",
  private_party: "#c8963e",
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
      <View style={[styles.topBar, { paddingTop: topPad + 4 }]}>
        <TouchableOpacity style={[styles.backBtn, { backgroundColor: colors.muted }]} onPress={() => router.back()}>
          <Feather name="arrow-left" size={20} color={colors.foreground} />
        </TouchableOpacity>
        <View style={[styles.catBadge, { backgroundColor: catColor }]}>
          <Text style={styles.catBadgeText}>{CATEGORY_LABELS[event.category]}</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: bottomPad + 90 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.headerCard, { backgroundColor: catColor + "18", borderColor: catColor + "44" }]}>
          <Text style={[styles.eventTitle, { color: colors.foreground }]}>{event.title}</Text>
          <View style={styles.infoRow}>
            <Feather name="map-pin" size={14} color={colors.mutedForeground} />
            <Text style={[styles.infoText, { color: colors.mutedForeground }]}>{event.venue}</Text>
          </View>
          <View style={styles.infoRow}>
            <Feather name="calendar" size={14} color={colors.mutedForeground} />
            <Text style={[styles.infoText, { color: colors.mutedForeground }]}>{formatDate(event.date)}</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={[styles.price, { color: catColor }]}>{price}</Text>
            <View style={styles.viewsRow}>
              <Feather name="eye" size={13} color={colors.mutedForeground} />
              <Text style={[styles.viewsText, { color: colors.mutedForeground }]}>{event.viewCount} views</Text>
            </View>
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
        <TouchableOpacity style={[styles.chatBtn, { backgroundColor: catColor }]} onPress={handleChat}>
          <Feather name="message-circle" size={18} color="#fff" />
          <Text style={styles.chatBtnText}>Message Holder</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
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
    alignItems: "center",
    justifyContent: "center",
  },
  catBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  catBadgeText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
  },
  scroll: {
    paddingHorizontal: 16,
    gap: 14,
  },
  headerCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 18,
    gap: 10,
  },
  eventTitle: {
    fontSize: 22,
    fontWeight: "800",
    lineHeight: 28,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  infoText: {
    fontSize: 14,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
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
});
