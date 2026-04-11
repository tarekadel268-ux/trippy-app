import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  FlatList,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import EventCard from "@/components/EventCard";
import FilterBar, { SortMode } from "@/components/FilterBar";
import { EventListing, useApp } from "@/contexts/AppContext";
import { useColors } from "@/hooks/useColors";

type Category = "all" | "lounge" | "concert" | "afro_techno" | "private_party";

const CATEGORIES: { key: Category; label: string; icon: string; color: string }[] = [
  { key: "all", label: "All Events", icon: "star", color: "#c8963e" },
  { key: "lounge", label: "Lounges", icon: "coffee", color: "#0abab5" },
  { key: "concert", label: "Concerts", icon: "music", color: "#e06848" },
  { key: "afro_techno", label: "Afro & Techno", icon: "headphones", color: "#7c3aed" },
  { key: "private_party", label: "Private Parties", icon: "zap", color: "#2d4a6b" },
];

const CAT_KEYS = ["lounge", "concert", "afro_techno", "private_party"] as const;

export default function EventsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { events, user, currency, organizers } = useApp();
  const router = useRouter();
  const [sortMode, setSortMode] = useState<SortMode>("most_viewed");
  const [activeCategory, setActiveCategory] = useState<Category>("all");

  const canAddEvent = user?.role === "ticket_holder" || user?.role === "event_planner";
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: Platform.OS === "web" ? 67 : insets.top + 16 }]}>
        <View>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>Events</Text>
          <Text style={[styles.headerSub, { color: colors.mutedForeground }]}>Lounges, concerts & nightlife</Text>
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
        style={[styles.catScroll, { borderBottomColor: colors.border }]}
        contentContainerStyle={styles.catScrollContent}
      >
        {CATEGORIES.map(cat => {
          const active = activeCategory === cat.key;
          return (
            <TouchableOpacity
              key={cat.key}
              style={[
                styles.catChip,
                { backgroundColor: active ? cat.color : colors.muted, borderColor: active ? cat.color : colors.border }
              ]}
              onPress={() => setActiveCategory(cat.key)}
            >
              <Feather name={cat.icon as any} size={14} color={active ? "#fff" : colors.mutedForeground} />
              <Text style={[styles.catChipText, { color: active ? "#fff" : colors.mutedForeground }]}>{cat.label}</Text>
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
          {CAT_KEYS.map(cat => {
            const catInfo = CATEGORIES.find(c => c.key === cat)!;
            const catEvents = eventsByCategory[cat] || [];
            return (
              <View key={cat} style={styles.catSection}>
                <View style={styles.catHeader}>
                  <View style={[styles.catDot, { backgroundColor: catInfo.color }]} />
                  <Text style={[styles.catSectionTitle, { color: colors.foreground }]}>{catInfo.label}</Text>
                  <Text style={[styles.catCount, { color: colors.mutedForeground }]}>{catEvents.length}</Text>
                </View>
                {catEvents.length === 0 ? (
                  <View style={[styles.emptyState, { backgroundColor: colors.muted }]}>
                    <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No listings yet</Text>
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
            <View style={[styles.emptyBig, { backgroundColor: colors.muted }]}>
              <Feather name="calendar" size={36} color={colors.mutedForeground} />
              <Text style={[styles.emptyBigText, { color: colors.mutedForeground }]}>No events in this category yet</Text>
            </View>
          }
        />
      )}
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
  headerTitle: { fontSize: 32, fontWeight: "800", letterSpacing: -0.5 },
  headerSub: { fontSize: 14, marginTop: 2 },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  catScroll: { borderBottomWidth: 1, flexGrow: 0 },
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
  },
  emptyText: { fontSize: 14 },
  flatContent: { paddingHorizontal: 16, paddingTop: 12, gap: 14 },
  listCard: { marginBottom: 0 },
  emptyBig: {
    margin: 20,
    padding: 40,
    borderRadius: 16,
    alignItems: "center",
    gap: 12,
  },
  emptyBigText: { fontSize: 15, textAlign: "center" },
});
