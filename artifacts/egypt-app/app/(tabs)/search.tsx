import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { OrganizerProfile, TripOffer, EventListing, UserProfile, useApp } from "@/contexts/AppContext";
import { useColors } from "@/hooks/useColors";
import { useLanguage } from "@/contexts/LanguageContext";

type FilterTab = "all" | "organizers" | "trips" | "events" | "profiles";

interface SearchResults {
  organizers: OrganizerProfile[];
  trips: TripOffer[];
  events: EventListing[];
  profiles: UserProfile[];
}

function OrganizerResult({ org }: { org: OrganizerProfile }) {
  const colors = useColors();
  const router = useRouter();
  const { getFollowerCount, getOrganizerRating, isFollowing, organizerPhotos } = useApp();
  const photos = organizerPhotos[org.id] || {};
  const followerCount = getFollowerCount(org.id);
  const { avg, count } = getOrganizerRating(org.id);
  const following = isFollowing(org.id);

  return (
    <TouchableOpacity
      style={[styles.resultCard, { backgroundColor: colors.card, borderColor: following ? org.coverColor : colors.border }]}
      onPress={() => router.push(`/organizer/${org.id}`)}
      activeOpacity={0.85}
    >
      <View style={[styles.orgAvatar, { backgroundColor: org.avatarColor, borderColor: org.coverColor }]}>
        {photos.profileUri ? (
          <Image source={{ uri: photos.profileUri }} style={StyleSheet.absoluteFill as any} borderRadius={22} />
        ) : (
          <Text style={styles.orgAvatarText}>{org.name[0]}</Text>
        )}
      </View>
      <View style={styles.resultInfo}>
        <View style={styles.resultTitleRow}>
          <Text style={[styles.resultTitle, { color: colors.foreground }]} numberOfLines={1}>{org.name}</Text>
          {org.isVerified && (
            <View style={[styles.verifiedBadge, { backgroundColor: org.coverColor + "20" }]}>
              <Feather name="check-circle" size={11} color={org.coverColor} />
            </View>
          )}
        </View>
        <Text style={[styles.resultSubtitle, { color: colors.mutedForeground }]} numberOfLines={1}>
          {org.type === "lounge" ? "Lounge / Club" : "Event Planner"} · {org.city}
        </Text>
        <View style={styles.resultMeta}>
          <Feather name="users" size={11} color={colors.mutedForeground} />
          <Text style={[styles.resultMetaText, { color: colors.mutedForeground }]}>{followerCount}</Text>
          {count > 0 && (
            <>
              <Feather name="star" size={11} color="#f59e0b" style={{ marginLeft: 8 }} />
              <Text style={[styles.resultMetaText, { color: colors.mutedForeground }]}>{avg.toFixed(1)}</Text>
            </>
          )}
        </View>
      </View>
      <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
    </TouchableOpacity>
  );
}

function TripResult({ trip }: { trip: TripOffer }) {
  const colors = useColors();
  const router = useRouter();
  const { currency } = useApp();

  return (
    <TouchableOpacity
      style={[styles.resultCard, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={() => router.push(`/trips/${trip.id}` as any)}
      activeOpacity={0.85}
    >
      <View style={[styles.listingIcon, { backgroundColor: colors.primary + "15" }]}>
        <Feather name="map-pin" size={20} color={colors.primary} />
      </View>
      <View style={styles.resultInfo}>
        <Text style={[styles.resultTitle, { color: colors.foreground }]} numberOfLines={1}>{trip.title}</Text>
        <Text style={[styles.resultSubtitle, { color: colors.mutedForeground }]} numberOfLines={1}>
          {trip.city} · {trip.days}d · by {trip.plannerName}
        </Text>
        <Text style={[styles.priceTag, { color: colors.primary }]}>
          {currency === "USD" ? `$${trip.priceUSD}` : `EGP ${trip.priceEGP.toLocaleString()}`}
        </Text>
      </View>
      <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
    </TouchableOpacity>
  );
}

function EventResult({ event }: { event: EventListing }) {
  const colors = useColors();
  const router = useRouter();
  const { currency } = useApp();

  const catLabel: Record<string, string> = {
    lounge: "Lounge",
    concert: "Concert",
    afro_techno: "Afro/Techno",
    private_party: "Private Party",
  };

  return (
    <TouchableOpacity
      style={[styles.resultCard, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={() => router.push(`/events/${event.id}` as any)}
      activeOpacity={0.85}
    >
      <View style={[styles.listingIcon, { backgroundColor: "#7c3aed15" }]}>
        <Feather name="music" size={20} color="#7c3aed" />
      </View>
      <View style={styles.resultInfo}>
        <Text style={[styles.resultTitle, { color: colors.foreground }]} numberOfLines={1}>{event.title}</Text>
        <Text style={[styles.resultSubtitle, { color: colors.mutedForeground }]} numberOfLines={1}>
          {catLabel[event.category] ?? event.category} · {event.venue}
        </Text>
        <Text style={[styles.priceTag, { color: "#7c3aed" }]}>
          {currency === "USD" ? `$${event.priceUSD}` : `EGP ${event.priceEGP.toLocaleString()}`}
        </Text>
      </View>
      <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
    </TouchableOpacity>
  );
}

function ProfileResult({ profile }: { profile: UserProfile }) {
  const colors = useColors();
  const roleLabel: Record<string, string> = {
    ticket_holder: "Ticket Holder",
    event_planner: "Event Planner",
    tourist_viewer: "Tourist",
    resident_viewer: "Resident",
  };

  return (
    <View style={[styles.resultCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={[styles.profileCircle, { backgroundColor: colors.primary + "25" }]}>
        {profile.profileUri ? (
          <Image source={{ uri: profile.profileUri }} style={StyleSheet.absoluteFill as any} borderRadius={22} />
        ) : (
          <Text style={[styles.profileCircleText, { color: colors.primary }]}>{(profile.name || profile.username)[0].toUpperCase()}</Text>
        )}
      </View>
      <View style={styles.resultInfo}>
        <Text style={[styles.resultTitle, { color: colors.foreground }]} numberOfLines={1}>{profile.name}</Text>
        <Text style={[styles.resultSubtitle, { color: colors.mutedForeground }]}>@{profile.username}</Text>
        {!profile.privacy?.hideRole && (
          <View style={[styles.rolePill, { backgroundColor: colors.primary + "18" }]}>
            <Text style={[styles.rolePillText, { color: colors.primary }]}>{roleLabel[profile.role] ?? profile.role}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

export default function SearchScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();
  const { organizers, trips, events } = useApp();

  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");
  const [userProfiles, setUserProfiles] = useState<UserProfile[]>([]);
  const [loadingProfiles, setLoadingProfiles] = useState(false);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setLoadingProfiles(true);
    AsyncStorage.getItem("@users_registry").then(raw => {
      if (raw) {
        const registry = JSON.parse(raw) as Record<string, UserProfile>;
        setUserProfiles(Object.values(registry));
      }
      setLoadingProfiles(false);
    }).catch(() => setLoadingProfiles(false));
  }, []);

  const handleQueryChange = useCallback((text: string) => {
    setQuery(text);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => setDebouncedQuery(text), 250);
  }, []);

  const results = useMemo<SearchResults>(() => {
    const q = debouncedQuery.trim().toLowerCase();
    if (!q) return { organizers: [], trips: [], events: [], profiles: [] };

    return {
      organizers: organizers.filter(o =>
        o.name.toLowerCase().includes(q) ||
        o.city.toLowerCase().includes(q) ||
        o.bio?.toLowerCase().includes(q) ||
        o.type.toLowerCase().includes(q) ||
        o.instagram?.toLowerCase().includes(q)
      ),
      trips: trips.filter(t =>
        t.title.toLowerCase().includes(q) ||
        t.city.toLowerCase().includes(q) ||
        t.plannerName.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q)
      ),
      events: events.filter(e =>
        e.title.toLowerCase().includes(q) ||
        e.venue.toLowerCase().includes(q) ||
        e.holderName.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q)
      ),
      profiles: userProfiles.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.username.toLowerCase().includes(q)
      ),
    };
  }, [debouncedQuery, organizers, trips, events, userProfiles]);

  const totalCount =
    results.organizers.length + results.trips.length +
    results.events.length + results.profiles.length;

  const filterTabs: { key: FilterTab; label: string; count: number }[] = [
    { key: "all", label: t("searchAll"), count: totalCount },
    { key: "organizers", label: t("searchOrganizers"), count: results.organizers.length },
    { key: "trips", label: t("searchTrips"), count: results.trips.length },
    { key: "events", label: t("searchEvents"), count: results.events.length },
    { key: "profiles", label: t("searchProfiles"), count: results.profiles.length },
  ];

  const hasQuery = debouncedQuery.trim().length > 0;

  type ListItem =
    | { kind: "sectionHeader"; label: string }
    | { kind: "organizer"; data: OrganizerProfile }
    | { kind: "trip"; data: TripOffer }
    | { kind: "event"; data: EventListing }
    | { kind: "profile"; data: UserProfile }
    | { kind: "empty" };

  const listData = useMemo<ListItem[]>(() => {
    if (!hasQuery) return [];

    const items: ListItem[] = [];

    const showOrganizers = activeFilter === "all" || activeFilter === "organizers";
    const showTrips = activeFilter === "all" || activeFilter === "trips";
    const showEvents = activeFilter === "all" || activeFilter === "events";
    const showProfiles = activeFilter === "all" || activeFilter === "profiles";

    if (showOrganizers && results.organizers.length > 0) {
      items.push({ kind: "sectionHeader", label: t("searchOrganizers") });
      results.organizers.forEach(o => items.push({ kind: "organizer", data: o }));
    }
    if (showTrips && results.trips.length > 0) {
      items.push({ kind: "sectionHeader", label: t("trips") });
      results.trips.forEach(trip => items.push({ kind: "trip", data: trip }));
    }
    if (showEvents && results.events.length > 0) {
      items.push({ kind: "sectionHeader", label: t("events") });
      results.events.forEach(ev => items.push({ kind: "event", data: ev }));
    }
    if (showProfiles && results.profiles.length > 0) {
      items.push({ kind: "sectionHeader", label: t("searchProfiles") });
      results.profiles.forEach(p => items.push({ kind: "profile", data: p }));
    }

    const shown =
      (showOrganizers ? results.organizers.length : 0) +
      (showTrips ? results.trips.length : 0) +
      (showEvents ? results.events.length : 0) +
      (showProfiles ? results.profiles.length : 0);

    if (shown === 0) items.push({ kind: "empty" });

    return items;
  }, [hasQuery, activeFilter, results, t]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>{t("search")}</Text>

        <View style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="search" size={17} color={colors.mutedForeground} />
          <TextInput
            style={[styles.searchInput, { color: colors.foreground }]}
            placeholder={t("searchPlaceholder")}
            placeholderTextColor={colors.mutedForeground}
            value={query}
            onChangeText={handleQueryChange}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => { setQuery(""); setDebouncedQuery(""); }}>
              <Feather name="x" size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
          )}
        </View>

        {hasQuery && (
          <FlatList
            data={filterTabs}
            horizontal
            keyExtractor={item => item.key}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterRow}
            renderItem={({ item }) => {
              const active = activeFilter === item.key;
              return (
                <TouchableOpacity
                  style={[
                    styles.filterTab,
                    active
                      ? { backgroundColor: colors.primary, borderColor: colors.primary }
                      : { backgroundColor: "transparent", borderColor: colors.border },
                  ]}
                  onPress={() => setActiveFilter(item.key)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.filterTabText, { color: active ? "#fff" : colors.mutedForeground }]}>
                    {item.label}
                    {item.count > 0 ? ` (${item.count})` : ""}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />
        )}
      </View>

      {!hasQuery ? (
        <View style={styles.emptyState}>
          <Feather name="search" size={52} color={colors.muted} />
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>{t("searchEmptyTitle")}</Text>
          <Text style={[styles.emptySubtitle, { color: colors.mutedForeground }]}>{t("searchEmptySubtitle")}</Text>
        </View>
      ) : (
        <FlatList
          data={listData}
          keyExtractor={(item, i) => {
            if (item.kind === "sectionHeader") return `sh_${item.label}_${i}`;
            if (item.kind === "empty") return "empty";
            return `${item.kind}_${(item as any).data.id}`;
          }}
          contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 90 }]}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => {
            if (item.kind === "sectionHeader") {
              return (
                <Text style={[styles.sectionHeader, { color: colors.mutedForeground }]}>{item.label.toUpperCase()}</Text>
              );
            }
            if (item.kind === "organizer") return <OrganizerResult org={item.data} />;
            if (item.kind === "trip") return <TripResult trip={item.data} />;
            if (item.kind === "event") return <EventResult event={item.data} />;
            if (item.kind === "profile") return <ProfileResult profile={item.data} />;
            if (item.kind === "empty") {
              return (
                <View style={styles.noResults}>
                  <Feather name="search" size={36} color={colors.muted} />
                  <Text style={[styles.noResultsText, { color: colors.mutedForeground }]}>{t("searchNoResults")}</Text>
                </View>
              );
            }
            return null;
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 0,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 10,
    letterSpacing: -0.5,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 14,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === "ios" ? 10 : 8,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 0,
  },
  filterRow: {
    gap: 8,
    paddingBottom: 10,
    paddingRight: 4,
  },
  filterTab: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  filterTabText: {
    fontSize: 13,
    fontWeight: "600",
  },
  listContent: {
    padding: 16,
    gap: 0,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
    marginTop: 18,
    marginBottom: 8,
  },
  resultCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    padding: 12,
    marginBottom: 8,
  },
  orgAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  orgAvatarText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },
  listingIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  profileCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  profileCircleText: {
    fontSize: 18,
    fontWeight: "700",
  },
  resultInfo: {
    flex: 1,
    gap: 2,
  },
  resultTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  resultTitle: {
    fontSize: 15,
    fontWeight: "600",
    flexShrink: 1,
  },
  verifiedBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  resultSubtitle: {
    fontSize: 12,
  },
  resultMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginTop: 2,
  },
  resultMetaText: {
    fontSize: 12,
  },
  priceTag: {
    fontSize: 13,
    fontWeight: "700",
    marginTop: 2,
  },
  rolePill: {
    alignSelf: "flex-start",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginTop: 4,
  },
  rolePillText: {
    fontSize: 11,
    fontWeight: "600",
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
    gap: 14,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  noResults: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
    gap: 12,
  },
  noResultsText: {
    fontSize: 15,
    textAlign: "center",
  },
});
