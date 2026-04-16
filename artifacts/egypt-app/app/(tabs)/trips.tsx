import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BackgroundSlideshow } from "@/components/BackgroundSlideshow";
import { AdBanner } from "@/components/AdBanner";
import { NativeAdCard } from "@/components/NativeAdCard";
import CitySection from "@/components/CitySection";
import FilterBar, { SortMode } from "@/components/FilterBar";
import { OrganizerProfile, TripOffer, useApp } from "@/contexts/AppContext";
import { supabase } from "@/lib/supabase";
import { useColors } from "@/hooks/useColors";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";

const CITIES = [
  "North Coast",
  "Alexandria",
  "Ain El Sokhna",
  "Sharm El-Sheikh",
  "Dahab",
  "Nuweiba",
  "Hurghada",
  "Gouna",
  "Luxor",
  "Aswan",
  "Fayoum",
];

const CITY_IMAGES: Record<string, any> = {
  "Ain El Sokhna": require("@/assets/images/ain-el-sokhna-yacht.jpeg"),
};

const CITY_TAGLINES: Record<string, string> = {
  "Ain El Sokhna": "Yachts · Red Sea · Day Trips",
};

function PlannerCard({ organizer }: { organizer: OrganizerProfile }) {
  const colors = useColors();
  const router = useRouter();
  const { t } = useLanguage();
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
        {organizer.isVerified && organizer.subscriptionActive && (
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
          {following ? t("following") : t("view")}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export default function TripsScreen() {
  const colors = useColors();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();
  const { trips, user, organizers } = useApp();
  const router = useRouter();
  const [sortMode, setSortMode] = useState<SortMode>("most_viewed");
  const [slideshowPaused, setSlideshowPaused] = useState(false);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [remoteTrips, setRemoteTrips] = useState<TripOffer[]>([]);

  useEffect(() => {
    const fetchFayoum = async () => {
      try {
        const { data, error } = await supabase
          .from("Fayoum")
          .select("*");

        console.log("RAW DATA:", data);
        console.log("ERROR:", error);

        const mapped = (data || []).map((row: any) => ({
          ...row,
          city: "Fayoum",
          priceUSD: row.priceUSD ?? row.price_usd ?? 0,
          priceEGP: row.priceEGP ?? row.price_egp ?? 0,
          pricePerPerson: row.pricePerPerson ?? row.price_per_person ?? row.priceUSD ?? row.price_usd ?? 0,
          days: row.days ?? row.duration_days ?? 1,
          includes: row.includes ?? row.inclusions ?? [],
          viewCount: row.viewCount ?? row.view_count ?? 0,
          plannerName: row.plannerName ?? row.planner_name ?? row.organizer_name ?? "",
          plannerVerified: row.plannerVerified ?? row.planner_verified ?? false,
          organizerId: row.organizerId ?? row.organizer_id ?? null,
          imageUrl: row.imageUrl ?? row.image_url ?? null,
        }));

        console.log("Mapped trips:", mapped);

        setRemoteTrips(mapped);
      } catch (err) {
        console.error("Exception:", err);
      }
    };
    fetchFayoum();
  }, []);

  const canAdd = user?.role === "event_planner" && user?.isVerified;
  const isPlanner = user?.role === "event_planner";

  const tripPlanners = useMemo(() => organizers.filter(o => o.type === "event_planner"), [organizers]);

  const allTrips = useMemo(() => [...trips, ...remoteTrips], [trips, remoteTrips]);

  const sortedTrips = useMemo(() => {
    const list = [...allTrips];
    if (sortMode === "most_viewed") return list.sort((a, b) => b.viewCount - a.viewCount);
    if (sortMode === "price_high") return list.sort((a, b) => b.priceUSD - a.priceUSD);
    if (sortMode === "price_low") return list.sort((a, b) => a.priceUSD - b.priceUSD);
    return list;
  }, [allTrips, sortMode]);

  const tripsByCity = useMemo(() => {
    const map: Record<string, typeof sortedTrips> = {};
    for (const city of CITIES) {
      map[city] = sortedTrips.filter(t => t.city === city);
    }
    return map;
  }, [sortedTrips]);

  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;
  const topPad = Platform.OS === "web" ? 67 : insets.top + 16;

  const handleScrollBegin = () => {
    if (idleTimer.current) clearTimeout(idleTimer.current);
    setSlideshowPaused(true);
  };

  const handleScrollEnd = (_e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (idleTimer.current) clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => setSlideshowPaused(false), 1200);
  };

  return (
    <View style={styles.container}>
      {/* ── Fixed full-screen background slideshow ── */}
      <BackgroundSlideshow
        paused={slideshowPaused}
        overlayOpacity={isDark ? 0.45 : 0.08}
        height="100%"
      />
      {/* ── Gradient overlay: top-only for light, full for dark ── */}
      <LinearGradient
        colors={isDark
          ? ["rgba(0,0,0,0.68)", "rgba(0,0,0,0.52)", "rgba(0,0,0,0.62)"] as const
          : ["rgba(0,0,0,0.30)", "rgba(0,0,0,0.10)", "transparent"] as const
        }
        locations={isDark ? [0, 0.45, 1] : [0, 0.38, 0.62]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      {/* ── Header (floats above background) ── */}
      <View style={[styles.header, { paddingTop: topPad }]}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>{t("trips")}</Text>
          <Text style={styles.headerSub}>{t("tripsSubtitle")}</Text>
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
              <Text style={styles.verifyBtnText}>{t("getVerified")}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ── Scrollable content ── */}
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomPad + 16 }]}
        showsVerticalScrollIndicator={false}
        onScrollBeginDrag={handleScrollBegin}
        onScrollEndDrag={handleScrollEnd}
        onMomentumScrollBegin={handleScrollBegin}
        onMomentumScrollEnd={handleScrollEnd}
      >
        {tripPlanners.length > 0 && (
          <View style={styles.plannersSection}>
            <View style={styles.plannersSectionHeader}>
              <View style={styles.plannersSectionLeft}>
                <Feather name="users" size={16} color="#fff" />
                <Text style={styles.plannersSectionTitle}>{t("eventsPlannersSection")}</Text>
              </View>
              <Text style={styles.plannersSectionSub}>{t("tapToFollowBook")}</Text>
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

        {CITIES.map((city, idx) => (
          <View key={city}>
            {idx === 2 && <AdBanner style={{ marginHorizontal: 16, marginBottom: 8 }} />}
            {idx === 5 && <NativeAdCard style={{ marginHorizontal: 16, marginBottom: 8 }} />}
            <CitySection
              city={city}
              trips={tripsByCity[city] || []}
              image={CITY_IMAGES[city]}
              tagline={CITY_TAGLINES[city]}
            />
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingHorizontal: 20,
    paddingBottom: 14,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: -0.5,
    color: "#ffffff",
    textShadowColor: "rgba(0,0,0,0.65)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 10,
  },
  headerSub: {
    fontSize: 14,
    marginTop: 3,
    color: "rgba(255,255,255,0.72)",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
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
    color: "#ffffff",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  plannersSectionSub: {
    fontSize: 12,
    color: "rgba(255,255,255,0.62)",
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
