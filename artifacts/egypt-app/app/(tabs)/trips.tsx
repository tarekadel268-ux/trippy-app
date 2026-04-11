import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CitySection from "@/components/CitySection";
import FilterBar, { SortMode } from "@/components/FilterBar";
import { useApp } from "@/contexts/AppContext";
import { useColors } from "@/hooks/useColors";

const CITIES = [
  "Alexandria",
  "Sharm El-Sheikh",
  "Dahab",
  "Nuweiba",
  "Hurghada",
  "Gouna",
  "Luxor",
  "Aswan",
];

export default function TripsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { trips, user } = useApp();
  const router = useRouter();
  const [sortMode, setSortMode] = useState<SortMode>("most_viewed");

  const isSubscribed = user?.subscriptionExpiry ? new Date(user.subscriptionExpiry) > new Date() : false;
  const canAdd = user?.role === "trip_planner" && user?.isVerified;
  const isPlanner = user?.role === "trip_planner";

  const sortedTrips = useMemo(() => {
    const list = [...trips];
    if (sortMode === "most_viewed") return list.sort((a, b) => b.viewCount - a.viewCount);
    if (sortMode === "price_high") return list.sort((a, b) => b.priceUSD - a.priceUSD);
    if (sortMode === "price_low") return list.sort((a, b) => a.priceUSD - b.priceUSD);
    return list;
  }, [trips, sortMode]);

  const tripsByCity = useMemo(() => {
    const map: Record<string, typeof sortedTrips> = {};
    for (const city of CITIES) {
      map[city] = sortedTrips.filter(t => t.city === city);
    }
    return map;
  }, [sortedTrips]);

  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: Platform.OS === "web" ? 67 : insets.top + 16 }]}>
        <View>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>Trips</Text>
          <Text style={[styles.headerSub, { color: colors.mutedForeground }]}>Explore Egypt's top destinations</Text>
        </View>
        {(canAdd || isPlanner) && (
          <TouchableOpacity
            style={[styles.addBtn, { backgroundColor: colors.primary }]}
            onPress={() => router.push("/add-trip")}
          >
            <Feather name="plus" size={20} color="#fff" />
          </TouchableOpacity>
        )}
        {isPlanner && !user?.isVerified && (
          <TouchableOpacity
            style={[styles.verifyBtn, { backgroundColor: colors.success }]}
            onPress={() => router.push("/verify")}
          >
            <Feather name="shield" size={16} color="#fff" />
            <Text style={styles.verifyBtnText}>Get Verified</Text>
          </TouchableOpacity>
        )}
      </View>

      {user?.nationality === "tourist" && !isSubscribed && (
        <TouchableOpacity
          style={[styles.subscribeBanner, { backgroundColor: colors.deepBlue }]}
          onPress={() => router.push("/subscribe")}
          activeOpacity={0.85}
        >
          <Feather name="lock" size={16} color="#fff" />
          <View style={{ flex: 1 }}>
            <Text style={styles.bannerTitle}>Unlock Verified Planners</Text>
            <Text style={styles.bannerSub}>Subscribe for $15/month to see contact info of all verified trip planners</Text>
          </View>
          <Feather name="chevron-right" size={18} color="#fff" />
        </TouchableOpacity>
      )}

      <FilterBar sortMode={sortMode} onSortChange={setSortMode} />

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomPad + 16 }]}
        showsVerticalScrollIndicator={false}
      >
        {CITIES.map(city => (
          <CitySection key={city} city={city} trips={tripsByCity[city] || []} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  headerSub: {
    fontSize: 14,
    marginTop: 2,
  },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  verifyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
  },
  verifyBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
  },
  subscribeBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginHorizontal: 16,
    marginBottom: 10,
    padding: 14,
    borderRadius: 14,
  },
  bannerTitle: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
  bannerSub: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 12,
    lineHeight: 16,
    marginTop: 2,
  },
  scrollContent: {
    paddingTop: 16,
  },
});
