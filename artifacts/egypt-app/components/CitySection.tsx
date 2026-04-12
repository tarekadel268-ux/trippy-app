import React from "react";
import { FlatList, Image, ImageSourcePropType, StyleSheet, Text, View } from "react-native";
import TripCard from "@/components/TripCard";
import { TripOffer } from "@/contexts/AppContext";
import { useColors } from "@/hooks/useColors";

interface Props {
  city: string;
  trips: TripOffer[];
  image?: ImageSourcePropType;
  tagline?: string;
}

export default function CitySection({ city, trips, image, tagline }: Props) {
  const colors = useColors();

  return (
    <View style={styles.section}>
      {image ? (
        <View style={styles.photoBanner}>
          <Image source={image} style={styles.bannerImage} resizeMode="cover" />
          <View style={styles.bannerOverlay} />
          <View style={styles.bannerTextRow}>
            <View>
              <Text style={styles.bannerCity}>{city}</Text>
              {tagline ? <Text style={styles.bannerTagline}>{tagline}</Text> : null}
            </View>
            {trips.length > 0 && (
              <View style={styles.bannerBadge}>
                <Text style={styles.bannerBadgeTxt}>{trips.length} offer{trips.length !== 1 ? "s" : ""}</Text>
              </View>
            )}
          </View>
        </View>
      ) : (
        <View style={styles.header}>
          <Text style={[styles.cityTitle, { color: colors.foreground }]}>{city}</Text>
          {trips.length > 0 && (
            <Text style={[styles.count, { color: colors.mutedForeground }]}>{trips.length} offer{trips.length !== 1 ? "s" : ""}</Text>
          )}
        </View>
      )}

      {trips.length === 0 ? (
        <View style={[styles.empty, { backgroundColor: colors.muted }]}>
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No trips listed yet for {city}</Text>
        </View>
      ) : (
        <FlatList
          data={trips}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <TripCard trip={item} width={280} />}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.list}
          snapToInterval={294}
          decelerationRate="fast"
          pagingEnabled={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 28,
  },
  photoBanner: {
    marginHorizontal: 16,
    marginBottom: 14,
    borderRadius: 18,
    overflow: "hidden",
    height: 160,
  },
  bannerImage: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  },
  bannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.40)",
  },
  bannerTextRow: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    padding: 16,
  },
  bannerCity: {
    fontSize: 22,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: -0.3,
    textShadowColor: "rgba(0,0,0,0.55)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  bannerTagline: {
    fontSize: 12,
    color: "rgba(255,255,255,0.88)",
    marginTop: 3,
    textShadowColor: "rgba(0,0,0,0.4)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  bannerBadge: {
    backgroundColor: "rgba(255,255,255,0.20)",
    borderRadius: 20,
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.38)",
  },
  bannerBadgeTxt: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  cityTitle: {
    fontSize: 20,
    fontWeight: "800",
  },
  count: {
    fontSize: 13,
  },
  list: {
    paddingLeft: 16,
    paddingRight: 4,
  },
  empty: {
    marginHorizontal: 16,
    padding: 20,
    borderRadius: 14,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
  },
});
