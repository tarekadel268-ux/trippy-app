import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { EventListing, OrganizerProfile } from "@/contexts/AppContext";
import { useColors } from "@/hooks/useColors";

interface Props {
  event: EventListing;
  width?: number;
  currency: "USD" | "EGP";
  organizer?: OrganizerProfile | null;
}

const CATEGORY_IMAGES: Record<string, any[]> = {
  lounge: [
    require("../assets/images/events/lounge1.jpeg"),
    require("../assets/images/events/lounge2.jpeg"),
    require("../assets/images/events/lounge3.jpeg"),
  ],
  concert: [
    require("../assets/images/events/concert.jpeg"),
  ],
  afro_techno: [
    require("../assets/images/events/afro1.jpeg"),
    require("../assets/images/events/afro2.jpeg"),
  ],
  private_party: [
    require("../assets/images/events/party1.jpeg"),
    require("../assets/images/events/party2.jpeg"),
  ],
};

function pickCategoryImage(category: string, eventId: string): any {
  const pool = CATEGORY_IMAGES[category];
  if (!pool || pool.length === 0) return null;
  const hash = eventId.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return pool[hash % pool.length];
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

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-EG", { day: "numeric", month: "short", year: "numeric" });
}

const EventCard = React.memo(function EventCard({ event, width = 280, currency, organizer }: Props) {
  const colors = useColors();
  const router = useRouter();

  const price = currency === "USD" ? `$${event.priceUSD}` : `EGP ${event.priceEGP.toLocaleString()}`;
  const catColor = CATEGORY_COLORS[event.category];
  const catIcon = CATEGORY_ICONS[event.category];
  const catLabel = CATEGORY_LABELS[event.category];

  return (
    <TouchableOpacity
      style={[styles.card, { width, backgroundColor: colors.card }]}
      onPress={() => router.push(`/events/${event.id}`)}
      activeOpacity={0.9}
    >
      <View style={styles.heroWrap}>
        {(() => {
          const isUserUri = event.imageUrl && (
            event.imageUrl.startsWith("file://") ||
            event.imageUrl.startsWith("content://") ||
            event.imageUrl.startsWith("ph://")
          );
          const localImg = pickCategoryImage(event.category, event.id);
          if (isUserUri) {
            return <Image source={{ uri: event.imageUrl }} style={styles.heroImage} resizeMode="cover" />;
          }
          if (localImg) {
            return <Image source={localImg} style={styles.heroImage} resizeMode="cover" />;
          }
          return <View style={[styles.heroFallback, { backgroundColor: catColor }]} />;
        })()}
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.72)"]}
          style={styles.heroGradient}
        />
        <View style={styles.heroBadge}>
          <View style={[styles.catPill, { backgroundColor: catColor }]}>
            <Feather name={catIcon as any} size={11} color="#fff" />
            <Text style={styles.catPillText}>{catLabel}</Text>
          </View>
          <View style={styles.viewsPill}>
            <Feather name="eye" size={10} color="rgba(255,255,255,0.8)" />
            <Text style={styles.viewsPillText}>{event.viewCount}</Text>
          </View>
        </View>
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
        <View style={styles.footer}>
          <Text style={[styles.price, { color: catColor }]}>{price}</Text>
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
});

export default EventCard;

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    overflow: "hidden",
    marginRight: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 5,
  },
  heroWrap: {
    height: 158,
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
  heroGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  heroBadge: {
    position: "absolute",
    bottom: 10,
    left: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  catPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  catPillText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 11,
  },
  viewsPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(0,0,0,0.45)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  viewsPillText: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 11,
    fontWeight: "600",
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
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 2,
  },
  price: {
    fontSize: 18,
    fontWeight: "800",
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
