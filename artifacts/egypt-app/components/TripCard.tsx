import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Image, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { TripOffer, useApp } from "@/contexts/AppContext";
import { useColors } from "@/hooks/useColors";

interface Props {
  trip: TripOffer;
  width?: number;
}

const CITY_IMAGES: Record<string, any> = {
  "North Coast": require("@/assets/images/northcoast.png"),
  Alexandria: require("@/assets/images/alexandria.png"),
  "Sharm El-Sheikh": require("@/assets/images/sharm.png"),
  Dahab: require("@/assets/images/dahab.png"),
  Nuweiba: require("@/assets/images/nuweiba.png"),
  Hurghada: require("@/assets/images/hurghada.png"),
  Gouna: require("@/assets/images/gouna.png"),
  Luxor: require("@/assets/images/luxor.png"),
  Aswan: require("@/assets/images/aswan.png"),
};

export default function TripCard({ trip, width = 280 }: Props) {
  const colors = useColors();
  const { currency, user, organizers } = useApp();
  const router = useRouter();
  const isSubscribed = user?.subscriptionExpiry ? new Date(user.subscriptionExpiry) > new Date() : false;
  const canSeeContact = user?.nationality === "egyptian" || isSubscribed || user?.role === "event_planner";
  const price = currency === "USD" ? `$${trip.priceUSD}` : `EGP ${trip.priceEGP.toLocaleString()}`;
  const organizer = trip.organizerId ? organizers.find(o => o.id === trip.organizerId) : null;

  return (
    <TouchableOpacity
      style={[styles.card, { width, backgroundColor: colors.card }]}
      onPress={() => router.push(`/trips/${trip.id}`)}
      activeOpacity={0.9}
    >
      <View style={styles.imageContainer}>
        <Image
          source={
            trip.imageUrl
              ? { uri: trip.imageUrl }
              : { uri: "https://via.placeholder.com/300" }
          }
          style={styles.image}
          resizeMode="cover"
        />
        <View style={styles.imageBadge}>
          <Text style={styles.imageBadgeText}>{trip.days} days</Text>
        </View>
        {trip.plannerVerified && (
          <View style={[styles.verifiedBadge, { backgroundColor: colors.success }]}>
            <Feather name="shield" size={10} color="#fff" />
            <Text style={styles.verifiedText}>Verified</Text>
          </View>
        )}
      </View>
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.foreground }]} numberOfLines={2}>{trip.title}</Text>
        <TouchableOpacity
          style={styles.plannerRow}
          onPress={e => {
            e.stopPropagation();
            if (organizer) router.push(`/organizer/${organizer.id}`);
          }}
          disabled={!organizer}
          activeOpacity={organizer ? 0.7 : 1}
        >
          <Feather name="user" size={12} color={organizer ? colors.primary : colors.mutedForeground} />
          <Text style={[styles.planner, { color: organizer ? colors.primary : colors.mutedForeground }]}>
            {trip.plannerName}
          </Text>
          {organizer && <Feather name="chevron-right" size={12} color={colors.primary} />}
        </TouchableOpacity>
        <Text style={[styles.desc, { color: colors.mutedForeground }]} numberOfLines={2}>{trip.description}</Text>
        <View style={styles.includes}>
          {trip.includes.slice(0, 3).map((item, i) => (
            <View key={i} style={[styles.tag, { backgroundColor: colors.muted }]}>
              <Text style={[styles.tagText, { color: colors.mutedForeground }]}>{item}</Text>
            </View>
          ))}
        </View>
        <View style={styles.footer}>
          <Text style={[styles.price, { color: colors.primary }]}>{price}</Text>
          <View style={styles.views}>
            <Feather name="eye" size={12} color={colors.mutedForeground} />
            <Text style={[styles.viewCount, { color: colors.mutedForeground }]}>{trip.viewCount}</Text>
          </View>
        </View>
        {!canSeeContact && (
          <View style={[styles.blurContact, { backgroundColor: colors.primary + "22" }]}>
            <Feather name="lock" size={14} color={colors.primary} />
            <Text style={[styles.blurText, { color: colors.primary }]}>Subscribe to view contact</Text>
          </View>
        )}
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
  imageContainer: {
    position: "relative",
    height: 160,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imageBadge: {
    position: "absolute",
    bottom: 10,
    left: 10,
    backgroundColor: "rgba(0,0,0,0.65)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  imageBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  verifiedBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  verifiedText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
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
  plannerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  planner: {
    fontSize: 12,
    flex: 1,
  },
  desc: {
    fontSize: 12,
    lineHeight: 17,
  },
  includes: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 11,
    fontWeight: "500",
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
  blurContact: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    marginTop: 4,
  },
  blurText: {
    fontSize: 12,
    fontWeight: "600",
  },
});
