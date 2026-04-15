import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  FlatList,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AdBanner } from "@/components/AdBanner";
import { NativeAdCard } from "@/components/NativeAdCard";
import EventCard from "@/components/EventCard";
import FilterBar, { SortMode } from "@/components/FilterBar";
import { EventListing, useApp } from "@/contexts/AppContext";
import { useColors } from "@/hooks/useColors";
import { useLanguage } from "@/contexts/LanguageContext";

type Category = "all" | "lounge" | "concert" | "afro_techno" | "private_party";
const CAT_KEYS = ["lounge", "concert", "afro_techno", "private_party"] as const;

const BG_IMAGES: Record<Category, any> = {
  all: require("@/assets/images/events/finedining.jpeg"),
  lounge: require("@/assets/images/events/restaurant.jpeg"),
  concert: require("@/assets/images/events/concert.jpeg"),
  afro_techno: require("@/assets/images/events/party.jpeg"),
  private_party: require("@/assets/images/events/bar.jpeg"),
};

const ALL_CATS: Category[] = ["all", "lounge", "concert", "afro_techno", "private_party"];
const FADE_CFG = { duration: 380, easing: Easing.inOut(Easing.ease) };
const SCALE_CFG = { duration: 600, easing: Easing.out(Easing.ease) };

export default function EventsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();
  const { events, user, currency, organizers } = useApp();
  const router = useRouter();
  const [sortMode, setSortMode] = useState<SortMode>("most_viewed");
  const [activeCategory, setActiveCategory] = useState<Category>("all");
  const prevCatRef = useRef<Category>("all");

  const allOpacity = useSharedValue(1);
  const loungeOpacity = useSharedValue(0);
  const concertOpacity = useSharedValue(0);
  const afroOpacity = useSharedValue(0);
  const partyOpacity = useSharedValue(0);

  const allScale = useSharedValue(1);
  const loungeScale = useSharedValue(1.05);
  const concertScale = useSharedValue(1.05);
  const afroScale = useSharedValue(1.05);
  const partyScale = useSharedValue(1.05);

  const opacities = { all: allOpacity, lounge: loungeOpacity, concert: concertOpacity, afro_techno: afroOpacity, private_party: partyOpacity };
  const scales = { all: allScale, lounge: loungeScale, concert: concertScale, afro_techno: afroScale, private_party: partyScale };

  const allStyle = useAnimatedStyle(() => ({ opacity: allOpacity.value, transform: [{ scale: allScale.value }] }));
  const loungeStyle = useAnimatedStyle(() => ({ opacity: loungeOpacity.value, transform: [{ scale: loungeScale.value }] }));
  const concertStyle = useAnimatedStyle(() => ({ opacity: concertOpacity.value, transform: [{ scale: concertScale.value }] }));
  const afroStyle = useAnimatedStyle(() => ({ opacity: afroOpacity.value, transform: [{ scale: afroScale.value }] }));
  const partyStyle = useAnimatedStyle(() => ({ opacity: partyOpacity.value, transform: [{ scale: partyScale.value }] }));

  const bgStyles = [allStyle, loungeStyle, concertStyle, afroStyle, partyStyle];

  const switchCategory = useCallback((cat: Category) => {
    if (cat === prevCatRef.current) return;
    for (const c of ALL_CATS) {
      if (c === cat) {
        scales[c].value = 1.05;
        scales[c].value = withTiming(1, SCALE_CFG);
        opacities[c].value = withTiming(1, FADE_CFG);
      } else {
        opacities[c].value = withTiming(0, FADE_CFG);
      }
    }
    prevCatRef.current = cat;
    setActiveCategory(cat);
  }, []);

  const CATEGORIES: { key: Category; label: string; icon: string; color: string }[] = [
    { key: "all", label: t("catAll"), icon: "star", color: "#c8963e" },
    { key: "lounge", label: t("catLounge"), icon: "coffee", color: "#0abab5" },
    { key: "concert", label: t("catConcert"), icon: "music", color: "#e06848" },
    { key: "afro_techno", label: t("catAfroTechno"), icon: "headphones", color: "#7c3aed" },
    { key: "private_party", label: t("catPrivateParty"), icon: "zap", color: "#2d4a6b" },
  ];

  const canAddEvent = user?.role === "ticket_holder" || user?.role === "event_planner";
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;
  const topPad = Platform.OS === "web" ? 67 : insets.top + 16;

  const organizerMap = useMemo(() => {
    const map: Record<string, (typeof organizers)[number]> = {};
    for (const o of organizers) map[o.id] = o;
    return map;
  }, [organizers]);

  const sortedEvents = useMemo(() => {
    let list = [...events];
    if (activeCategory !== "all") {
      list = list.filter(e => e.category === activeCategory);
    }
    if (sortMode === "most_viewed") return list.sort((a, b) => b.viewCount - a.viewCount);
    if (sortMode === "price_high") return list.sort((a, b) => b.priceUSD - a.priceUSD);
    if (sortMode === "price_low") return list.sort((a, b) => a.priceUSD - b.priceUSD);
    return list;
  }, [events, sortMode, activeCategory]);

  const eventsByCategory = useMemo(() => {
    const map: Record<string, EventListing[]> = {};
    for (const cat of CAT_KEYS) {
      map[cat] = events.filter(e => e.category === cat);
    }
    return map;
  }, [events]);

  const renderHorizontalItem = useCallback(({ item }: { item: EventListing }) => (
    <EventCard
      event={item}
      width={280}
      currency={currency}
      organizer={item.organizerId ? organizerMap[item.organizerId] : null}
    />
  ), [currency, organizerMap]);

  const renderVerticalItem = useCallback(({ item }: { item: EventListing }) => (
    <View style={styles.listCard}>
      <EventCard
        event={item}
        width={undefined as any}
        currency={currency}
        organizer={item.organizerId ? organizerMap[item.organizerId] : null}
      />
    </View>
  ), [currency, organizerMap]);

  return (
    <View style={styles.container}>
      {ALL_CATS.map((cat, i) => (
        <Animated.View key={cat} style={[styles.bgLayer, bgStyles[i]]} pointerEvents="none">
          <Image
            source={BG_IMAGES[cat]}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            cachePolicy="memory-disk"
            transition={0}
          />
        </Animated.View>
      ))}
      <LinearGradient
        colors={["rgba(0,0,0,0.50)", "rgba(7,15,30,0.62)", "rgba(7,15,30,0.88)"]}
        locations={[0, 0.3, 1]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      <View style={[styles.header, { paddingTop: topPad }]}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>{t("events")}</Text>
          <Text style={styles.headerSub}>{t("eventsSubtitle")}</Text>
        </View>
        {canAddEvent && (
          <TouchableOpacity
            style={[styles.addBtn, { backgroundColor: colors.primary }]}
            onPress={() => router.push("/add-event")}
          >
            <Feather name="plus" size={20} color="#fff" />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.catScroll}
        contentContainerStyle={styles.catScrollContent}
      >
        {CATEGORIES.map(cat => {
          const active = activeCategory === cat.key;
          return (
            <TouchableOpacity
              key={cat.key}
              style={[
                styles.catChip,
                { backgroundColor: active ? cat.color : "rgba(255,255,255,0.12)", borderColor: active ? cat.color : "rgba(255,255,255,0.2)" }
              ]}
              onPress={() => switchCategory(cat.key)}
            >
              <Feather name={cat.icon as any} size={14} color={active ? "#fff" : "rgba(255,255,255,0.7)"} />
              <Text style={[styles.catChipText, { color: active ? "#fff" : "rgba(255,255,255,0.7)" }]}>{cat.label}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <FilterBar sortMode={sortMode} onSortChange={setSortMode} />

      {activeCategory === "all" ? (
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomPad + 16 }]}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews
        >
          {CAT_KEYS.map((cat, idx) => {
            const catInfo = CATEGORIES.find(c => c.key === cat)!;
            const catEvents = eventsByCategory[cat] || [];
            return (
              <View key={cat}>
              {idx === 1 && <AdBanner style={{ marginHorizontal: 16, marginBottom: 8 }} />}
              {idx === 2 && <NativeAdCard style={{ marginHorizontal: 16, marginBottom: 8 }} />}
              <View style={styles.catSection}>
                <View style={styles.catHeader}>
                  <View style={[styles.catDot, { backgroundColor: catInfo.color }]} />
                  <Text style={[styles.catSectionTitle, { color: "#fff" }]}>{catInfo.label}</Text>
                  <Text style={[styles.catCount, { color: "rgba(255,255,255,0.55)" }]}>{catEvents.length}</Text>
                </View>
                {catEvents.length === 0 ? (
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>{t("noListings")}</Text>
                  </View>
                ) : (
                  <FlatList
                    data={catEvents}
                    keyExtractor={item => item.id}
                    renderItem={renderHorizontalItem}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.hList}
                    snapToInterval={294}
                    decelerationRate="fast"
                    removeClippedSubviews
                    initialNumToRender={3}
                    maxToRenderPerBatch={3}
                    windowSize={5}
                    getItemLayout={(_, index) => ({ length: 294, offset: 294 * index, index })}
                  />
                )}
              </View>
              </View>
            );
          })}
        </ScrollView>
      ) : (
        <FlatList
          data={sortedEvents}
          keyExtractor={item => item.id}
          renderItem={renderVerticalItem}
          contentContainerStyle={[styles.flatContent, { paddingBottom: bottomPad + 16 }]}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews
          initialNumToRender={5}
          maxToRenderPerBatch={5}
          windowSize={7}
          ListEmptyComponent={
            <View style={styles.emptyBig}>
              <Feather name="calendar" size={36} color="rgba(255,255,255,0.45)" />
              <Text style={styles.emptyBigText}>{t("noEventsCategory")}</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  bgLayer: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  headerLeft: { flex: 1 },
  headerTitle: {
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: -0.5,
    color: "#ffffff",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  headerSub: {
    fontSize: 14,
    marginTop: 2,
    color: "rgba(255,255,255,0.78)",
    textShadowColor: "rgba(0,0,0,0.4)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  catScroll: { flexGrow: 0, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.1)" },
  catScrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  catChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  catChipText: { fontSize: 13, fontWeight: "600" },
  scrollContent: { paddingTop: 16 },
  catSection: { marginBottom: 26 },
  catHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  catDot: { width: 10, height: 10, borderRadius: 5 },
  catSectionTitle: { fontSize: 20, fontWeight: "800", flex: 1 },
  catCount: { fontSize: 14 },
  hList: { paddingLeft: 16, paddingRight: 4 },
  emptyState: {
    marginHorizontal: 16,
    padding: 20,
    borderRadius: 14,
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  emptyText: { fontSize: 14, color: "rgba(255,255,255,0.5)" },
  flatContent: { paddingHorizontal: 16, paddingTop: 12, gap: 14 },
  listCard: { marginBottom: 0 },
  emptyBig: {
    margin: 20,
    padding: 40,
    borderRadius: 16,
    alignItems: "center",
    gap: 12,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  emptyBigText: { fontSize: 15, textAlign: "center", color: "rgba(255,255,255,0.5)" },
});
