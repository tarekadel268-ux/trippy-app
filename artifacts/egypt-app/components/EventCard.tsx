import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { EventListing, useApp } from "@/contexts/AppContext";
import { useColors } from "@/hooks/useColors";

interface Props {
  event: EventListing;
  width?: number;
}

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

export default function EventCard({ event, width = 280 }: Props) {
  const colors = useColors();
  const { currency, organizers } = useApp();
  const router = useRouter();
  const price = currency === "USD" ? `$${event.priceUSD}` : `EGP ${event.priceEGP.toLocaleString()}`;
  const catColor = CATEGORY_COLORS[event.category];
  const catIcon = CATEGORY_ICONS[event.category];
  const organizer = event.organizerId ? organizers.find(o => o.id === event.organizerId) : null;

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-EG", { day: "numeric", month: "short", year: "numeric" });
  };

  return (
    <TouchableOpacity
      style={[styles.card, { width, backgroundColor: colors.card }]}
      onPress={() => router.push(`/events/${event.id}`)}
      activeOpacity={0.9}
    >
      <View style={[styles.catBanner, { backgroundColor: catColor }]}>
        <Feather name={catIcon as any} size={12} color="#fff" />
        <Text style={styles.catText}>{CATEGORY_LABELS[event.category]}</Text>
      </View>
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.foreground }]} numberOfLines={2}>{event.title}</Text>
        <View style={styles.row}>
          <Feather name="map-pin" size={12} color={colors.mutedForeground} />
          <Text style={[styles.venue, { color: colors.mutedForeground }]} numberOfLines={1}>{event.venue}</Text>
        </View>
        <View style={styles.row}>
          <Feather name="calendar" size={12} color={colors.mutedForeground} />
          <Text style={[styles.date, { color: colors.mutedForeground }]}>{formatDate(event.date)}</Text>
        </View>
        <Text style={[styles.desc, { color: colors.mutedForeground }]} numberOfLines={2}>{event.description}</Text>
        <View style={styles.footer}>
          <Text style={[styles.price, { color: catColor }]}>{price}</Text>
          <View style={styles.views}>
            <Feather name="eye" size={12} color={colors.mutedForeground} />
            <Text style={[styles.viewCount, { color: colors.mutedForeground }]}>{event.viewCount}</Text>
          </View>
        </View>
        <TouchableOpacity
          style={[styles.holderRow, { borderTopColor: colors.border }]}
          onPress={e => {
            e.stopPropagation();
            if (organizer) router.push(`/organizer/${organizer.id}`);
          }}
          disabled={!organizer}
          activeOpacity={organizer ? 0.7 : 1}
        >
          <Feather name="user" size={12} color={organizer ? catColor : colors.mutedForeground} />
          <Text style={[styles.holderName, { color: organizer ? catColor : colors.mutedForeground }]}>
            {event.holderName}
          </Text>
          {organizer && <Feather name="chevron-right" size={12} color={catColor} />}
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    overflow: "hidden",
    marginRight: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  catBanner: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  catText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 12,
    letterSpacing: 0.5,
  },
  content: {
    padding: 14,
    gap: 6,
  },
  title: {
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 20,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  venue: {
    fontSize: 12,
    flex: 1,
  },
  date: {
    fontSize: 12,
  },
  desc: {
    fontSize: 12,
    lineHeight: 17,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  price: {
    fontSize: 18,
    fontWeight: "800",
  },
  views: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  viewCount: {
    fontSize: 12,
  },
  holderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingTop: 8,
    borderTopWidth: 1,
    marginTop: 4,
  },
  holderName: {
    fontSize: 11,
    flex: 1,
  },
});
