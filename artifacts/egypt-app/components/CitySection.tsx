import React from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import TripCard from "@/components/TripCard";
import { TripOffer } from "@/contexts/AppContext";
import { useColors } from "@/hooks/useColors";

interface Props {
  city: string;
  trips: TripOffer[];
}

export default function CitySection({ city, trips }: Props) {
  const colors = useColors();

  if (trips.length === 0) {
    return (
      <View style={styles.section}>
        <Text style={[styles.cityTitle, { color: colors.foreground }]}>{city}</Text>
        <View style={[styles.empty, { backgroundColor: colors.muted }]}>
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No trips listed yet for {city}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={[styles.cityTitle, { color: colors.foreground }]}>{city}</Text>
        <Text style={[styles.count, { color: colors.mutedForeground }]}>{trips.length} offer{trips.length !== 1 ? "s" : ""}</Text>
      </View>
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
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 28,
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
