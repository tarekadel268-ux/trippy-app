import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Image,
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
import { OrganizerProfile, useApp } from "@/contexts/AppContext";
import { useColors } from "@/hooks/useColors";

const CITIES = [
  "North Coast",
  "Alexandria",
  "Sharm El-Sheikh",
  "Dahab",
  "Nuweiba",
  "Hurghada",
  "Gouna",
  "Luxor",
  "Aswan",
];

function PlannerCard({ organizer }: { organizer: OrganizerProfile }) {
  const colors = useColors();
  const router = useRouter();
  const { getFollowerCount, getOrganizerRating, isFollowing, organizerPhotos } = useApp();
  const followerCount = getFollowerCount(organizer.id);
  const { avg: rating, count: reviewCount } = getOrganizerRating(organizer.id);
  const following = isFollowing(organizer.id);
  const photos = organizerPhotos[organizer.id] || {};

  const formatFollowers = (n: number) => {
    if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
    return String(n);
  };

  return (
    <TouchableOpacity
      style={[styles.plannerCard, { backgroundColor: colors.card, borderColor: following ? organizer.coverColor : colors.border }]}
      onPress={() => router.push(`/organizer/${organizer.id}`)}
      activeOpacity={0.85}
    >
      <View style={{ position: "relative", alignSelf: "center" }}>
        {photos.profileUri ? (
          <Image
            source={{ uri: photos.profileUri }}
            style={[styles.plannerAvatar, { borderColor: following ? organizer.coverColor : colors.border }]}
          />
        ) : (
          <View style={[styles.plannerAvatar, { backgroundColor: organizer.avatarColor, borderColor: following ? organizer.coverColor : colors.border }]}>
            <Feather name="map" size={22} color="#fff" />
          </View>
        )}
        {organizer.isVerified && (
          <View style={[styles.plannerVerifiedDot, { backgroundColor: organizer.coverColor }]}>
            <Feather name="check" size={8} color="#fff" />
          </View>
        )}
      </View>

      <Text style={[styles.plannerName, { color: colors.foreground }]} numberOfLines={1}>{organizer.name}</Text>
      <Text style={[styles.plannerCity, { color: colors.mutedForeground }]} numberOfLines={1}>{organizer.city}</Text>

      <View style={styles.plannerStats}>
        <View style={styles.plannerStat}>
          <Feather name="users" size={10} color={colors.mutedForeground} />
          <Text style={[styles.plannerStatText, { color: colors.mutedForeground }]}>{formatFollowers(followerCount)}</Text>
        </View>
        {reviewCount > 0 && (
          <View style={styles.plannerStat}>
            <Feather name="star" size={10} color="#f59e0b" />
            <Text style={[styles.plannerStatText, { color: colors.mutedForeground }]}>{rating.toFixed(1)}</Text>
          </View>
        )}
      </View>

      <View style={[
        styles.plannerFollowPill,
        { backgroundColor: following ? organizer.coverColor + "18" : organizer.coverColor }
      ]}>
        <Text style={[styles.plannerFollowText, { color: following ? organizer.coverColor : "#fff" }]}>
          {following ? "Following" : "View"}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export default function TripsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { trips, user, organizers } = useApp();
  const router = useRouter();
  const [sortMode, setSortMode] = useState<SortMode>("most_viewed");

  const isSubscribed = user?.subscriptionExpiry ? new Date(user.subscriptionExpiry) > new Date() : false;
  const canAdd = user?.role === "trip_planner" && user?.isVerified;
  const isPlanner = user?.role === "trip_planner";

  const tripPlanners = useMemo(() => organizers.filter(o => o.type === "trip_planner"), [organizers]);

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
        <View style={styles.headerBtns}>
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

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomPad + 16 }]}
        showsVerticalScrollIndicator={false}
      >
        {tripPlanners.length > 0 && (
          <View style={styles.plannersSection}>
            <View style={styles.plannersSectionHeader}>
              <View style={styles.plannersSectionLeft}>
                <Feather name="users" size={16} color={colors.primary} />
                <Text style={[styles.plannersSectionTitle, { color: colors.foreground }]}>Trip Planners</Text>
              </View>
              <Text style={[styles.plannersSectionSub, { color: colors.mutedForeground }]}>Tap to follow & book</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.plannersRow}
            >
              {tripPlanners.map(org => (
                <PlannerCard key={org.id} organizer={org} />
              ))}
            </ScrollView>
          </View>
        )}

        <FilterBar sortMode={sortMode} onSortChange={setSortMode} />

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
  headerBtns: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
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
    paddingTop: 8,
  },
  plannersSection: {
    marginBottom: 8,
  },
  plannersSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 12,
    marginTop: 8,
  },
  plannersSectionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  plannersSectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  plannersSectionSub: {
    fontSize: 12,
  },
  plannersRow: {
    paddingHorizontal: 16,
    gap: 12,
    paddingBottom: 4,
  },
  plannerCard: {
    width: 130,
    borderRadius: 18,
    borderWidth: 1.5,
    padding: 14,
    alignItems: "center",
    gap: 6,
  },
  plannerAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2.5,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  plannerVerifiedDot: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  plannerName: {
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
  },
  plannerCity: {
    fontSize: 11,
    textAlign: "center",
  },
  plannerStats: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  plannerStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  plannerStatText: {
    fontSize: 11,
    fontWeight: "600",
  },
  plannerFollowPill: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
    marginTop: 2,
  },
  plannerFollowText: {
    fontSize: 12,
    fontWeight: "700",
  },
});
