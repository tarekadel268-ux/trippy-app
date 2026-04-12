import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Keyboard,
  Modal,
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

function OrganizerRow({ org, onClose }: { org: OrganizerProfile; onClose: () => void }) {
  const colors = useColors();
  const router = useRouter();
  const { getFollowerCount, getOrganizerRating, isFollowing, organizerPhotos } = useApp();
  const photos = organizerPhotos[org.id] || {};
  const followerCount = getFollowerCount(org.id);
  const { avg, count } = getOrganizerRating(org.id);
  const following = isFollowing(org.id);

  return (
    <TouchableOpacity
      style={[styles.row, { backgroundColor: colors.card, borderColor: following ? org.coverColor : colors.border }]}
      onPress={() => { onClose(); router.push(`/organizer/${org.id}`); }}
      activeOpacity={0.82}
    >
      <View style={[styles.orgAvatar, { backgroundColor: org.avatarColor, borderColor: org.coverColor }]}>
        {photos.profileUri
          ? <Image source={{ uri: photos.profileUri }} style={StyleSheet.absoluteFill as any} borderRadius={20} />
          : <Text style={styles.orgAvatarText}>{org.name[0]}</Text>}
      </View>
      <View style={styles.rowInfo}>
        <View style={styles.rowTitleLine}>
          <Text style={[styles.rowTitle, { color: colors.foreground }]} numberOfLines={1}>{org.name}</Text>
          {org.isVerified && <Feather name="check-circle" size={12} color={org.coverColor} />}
        </View>
        <Text style={[styles.rowSub, { color: colors.mutedForeground }]} numberOfLines={1}>
          {org.type === "lounge" ? "Lounge / Club" : "Event Planner"} · {org.city}
        </Text>
        <View style={styles.rowMeta}>
          <Feather name="users" size={11} color={colors.mutedForeground} />
          <Text style={[styles.rowMetaTxt, { color: colors.mutedForeground }]}>{followerCount}</Text>
          {count > 0 && <>
            <Feather name="star" size={11} color="#f59e0b" style={{ marginLeft: 6 }} />
            <Text style={[styles.rowMetaTxt, { color: colors.mutedForeground }]}>{avg.toFixed(1)}</Text>
          </>}
        </View>
      </View>
      <Feather name="chevron-right" size={15} color={colors.mutedForeground} />
    </TouchableOpacity>
  );
}

function TripRow({ trip, onClose }: { trip: TripOffer; onClose: () => void }) {
  const colors = useColors();
  const router = useRouter();
  const { currency } = useApp();
  return (
    <TouchableOpacity
      style={[styles.row, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={() => { onClose(); router.push(`/trips/${trip.id}` as any); }}
      activeOpacity={0.82}
    >
      <View style={[styles.iconBox, { backgroundColor: colors.primary + "15" }]}>
        <Feather name="map-pin" size={18} color={colors.primary} />
      </View>
      <View style={styles.rowInfo}>
        <Text style={[styles.rowTitle, { color: colors.foreground }]} numberOfLines={1}>{trip.title}</Text>
        <Text style={[styles.rowSub, { color: colors.mutedForeground }]} numberOfLines={1}>
          {trip.city} · {trip.days}d · {trip.plannerName}
        </Text>
        <Text style={[styles.price, { color: colors.primary }]}>
          {currency === "USD" ? `$${trip.priceUSD}` : `EGP ${trip.priceEGP.toLocaleString()}`}
        </Text>
      </View>
      <Feather name="chevron-right" size={15} color={colors.mutedForeground} />
    </TouchableOpacity>
  );
}

function EventRow({ event, onClose }: { event: EventListing; onClose: () => void }) {
  const colors = useColors();
  const router = useRouter();
  const { currency } = useApp();
  const catLabel: Record<string, string> = {
    lounge: "Lounge", concert: "Concert",
    afro_techno: "Afro/Techno", private_party: "Private Party",
  };
  return (
    <TouchableOpacity
      style={[styles.row, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={() => { onClose(); router.push(`/events/${event.id}` as any); }}
      activeOpacity={0.82}
    >
      <View style={[styles.iconBox, { backgroundColor: "#7c3aed15" }]}>
        <Feather name="music" size={18} color="#7c3aed" />
      </View>
      <View style={styles.rowInfo}>
        <Text style={[styles.rowTitle, { color: colors.foreground }]} numberOfLines={1}>{event.title}</Text>
        <Text style={[styles.rowSub, { color: colors.mutedForeground }]} numberOfLines={1}>
          {catLabel[event.category] ?? event.category} · {event.venue}
        </Text>
        <Text style={[styles.price, { color: "#7c3aed" }]}>
          {currency === "USD" ? `$${event.priceUSD}` : `EGP ${event.priceEGP.toLocaleString()}`}
        </Text>
      </View>
      <Feather name="chevron-right" size={15} color={colors.mutedForeground} />
    </TouchableOpacity>
  );
}

function ProfileRow({ profile }: { profile: UserProfile }) {
  const colors = useColors();
  const roleLabel: Record<string, string> = {
    ticket_holder: "Ticket Holder", event_planner: "Event Planner",
    tourist_viewer: "Tourist", resident_viewer: "Resident",
  };
  return (
    <View style={[styles.row, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={[styles.profileCircle, { backgroundColor: colors.primary + "20" }]}>
        {profile.profileUri
          ? <Image source={{ uri: profile.profileUri }} style={StyleSheet.absoluteFill as any} borderRadius={20} />
          : <Text style={[styles.profileCircleTxt, { color: colors.primary }]}>{(profile.name || profile.username)[0].toUpperCase()}</Text>}
      </View>
      <View style={styles.rowInfo}>
        <Text style={[styles.rowTitle, { color: colors.foreground }]} numberOfLines={1}>{profile.name}</Text>
        <Text style={[styles.rowSub, { color: colors.mutedForeground }]}>@{profile.username}</Text>
        {!profile.privacy?.hideRole && (
          <View style={[styles.rolePill, { backgroundColor: colors.primary + "18" }]}>
            <Text style={[styles.rolePillTxt, { color: colors.primary }]}>{roleLabel[profile.role] ?? profile.role}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

interface SearchModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function SearchModal({ visible, onClose }: SearchModalProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();
  const { organizers, trips, events } = useApp();

  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");
  const [userProfiles, setUserProfiles] = useState<UserProfile[]>([]);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (visible) {
      AsyncStorage.getItem("@users_registry").then(raw => {
        if (raw) setUserProfiles(Object.values(JSON.parse(raw) as Record<string, UserProfile>));
      }).catch(() => {});
      setTimeout(() => inputRef.current?.focus(), 150);
    } else {
      setQuery("");
      setDebouncedQuery("");
      setActiveFilter("all");
    }
  }, [visible]);

  const handleChange = useCallback((text: string) => {
    setQuery(text);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => setDebouncedQuery(text), 220);
  }, []);

  const results = useMemo<SearchResults>(() => {
    const q = debouncedQuery.trim().toLowerCase();
    if (!q) return { organizers: [], trips: [], events: [], profiles: [] };
    return {
      organizers: organizers.filter(o =>
        o.name.toLowerCase().includes(q) || o.city.toLowerCase().includes(q) ||
        o.bio?.toLowerCase().includes(q) || o.type.toLowerCase().includes(q) ||
        o.instagram?.toLowerCase().includes(q)
      ),
      trips: trips.filter(t =>
        t.title.toLowerCase().includes(q) || t.city.toLowerCase().includes(q) ||
        t.plannerName.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)
      ),
      events: events.filter(e =>
        e.title.toLowerCase().includes(q) || e.venue.toLowerCase().includes(q) ||
        e.holderName.toLowerCase().includes(q) || e.description.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q)
      ),
      profiles: userProfiles.filter(p =>
        p.name.toLowerCase().includes(q) || p.username.toLowerCase().includes(q)
      ),
    };
  }, [debouncedQuery, organizers, trips, events, userProfiles]);

  const total = results.organizers.length + results.trips.length + results.events.length + results.profiles.length;

  const filterTabs: { key: FilterTab; label: string; count: number }[] = [
    { key: "all", label: t("searchAll"), count: total },
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
    const showOrg = activeFilter === "all" || activeFilter === "organizers";
    const showTrip = activeFilter === "all" || activeFilter === "trips";
    const showEv = activeFilter === "all" || activeFilter === "events";
    const showProf = activeFilter === "all" || activeFilter === "profiles";

    if (showOrg && results.organizers.length > 0) {
      items.push({ kind: "sectionHeader", label: t("searchOrganizers") });
      results.organizers.forEach(o => items.push({ kind: "organizer", data: o }));
    }
    if (showTrip && results.trips.length > 0) {
      items.push({ kind: "sectionHeader", label: t("trips") });
      results.trips.forEach(trip => items.push({ kind: "trip", data: trip }));
    }
    if (showEv && results.events.length > 0) {
      items.push({ kind: "sectionHeader", label: t("events") });
      results.events.forEach(ev => items.push({ kind: "event", data: ev }));
    }
    if (showProf && results.profiles.length > 0) {
      items.push({ kind: "sectionHeader", label: t("searchProfiles") });
      results.profiles.forEach(p => items.push({ kind: "profile", data: p }));
    }
    const shown = (showOrg ? results.organizers.length : 0) + (showTrip ? results.trips.length : 0) + (showEv ? results.events.length : 0) + (showProf ? results.profiles.length : 0);
    if (shown === 0) items.push({ kind: "empty" });
    return items;
  }, [hasQuery, activeFilter, results, t]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.modal, { backgroundColor: colors.background }]}>
        <View style={[styles.modalHeader, { paddingTop: insets.top + 12, borderBottomColor: colors.border }]}>
          <View style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name="search" size={16} color={colors.mutedForeground} />
            <TextInput
              ref={inputRef}
              style={[styles.searchInput, { color: colors.foreground }]}
              placeholder={t("searchPlaceholder")}
              placeholderTextColor={colors.mutedForeground}
              value={query}
              onChangeText={handleChange}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="search"
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => { setQuery(""); setDebouncedQuery(""); }}>
                <Feather name="x-circle" size={16} color={colors.mutedForeground} />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity style={styles.cancelBtn} onPress={() => { Keyboard.dismiss(); onClose(); }}>
            <Text style={[styles.cancelTxt, { color: colors.primary }]}>{t("cancel") || "Cancel"}</Text>
          </TouchableOpacity>
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
                  style={[styles.chip, active ? { backgroundColor: colors.primary, borderColor: colors.primary } : { borderColor: colors.border }]}
                  onPress={() => setActiveFilter(item.key)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.chipTxt, { color: active ? "#fff" : colors.mutedForeground }]}>
                    {item.label}{item.count > 0 ? ` (${item.count})` : ""}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />
        )}

        {!hasQuery ? (
          <View style={styles.hint}>
            <Feather name="search" size={48} color={colors.muted} />
            <Text style={[styles.hintTitle, { color: colors.foreground }]}>{t("searchEmptyTitle")}</Text>
            <Text style={[styles.hintSub, { color: colors.mutedForeground }]}>{t("searchEmptySubtitle")}</Text>
          </View>
        ) : (
          <FlatList
            data={listData}
            keyExtractor={(item, i) => {
              if (item.kind === "sectionHeader") return `sh_${i}`;
              if (item.kind === "empty") return "empty";
              return `${item.kind}_${(item as any).data.id}`;
            }}
            contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 100 }]}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => {
              if (item.kind === "sectionHeader") return (
                <Text style={[styles.section, { color: colors.mutedForeground }]}>{item.label.toUpperCase()}</Text>
              );
              if (item.kind === "organizer") return <OrganizerRow org={item.data} onClose={onClose} />;
              if (item.kind === "trip") return <TripRow trip={item.data} onClose={onClose} />;
              if (item.kind === "event") return <EventRow event={item.data} onClose={onClose} />;
              if (item.kind === "profile") return <ProfileRow profile={item.data} />;
              if (item.kind === "empty") return (
                <View style={styles.noResults}>
                  <Feather name="search" size={32} color={colors.muted} />
                  <Text style={[styles.noResultsTxt, { color: colors.mutedForeground }]}>{t("searchNoResults")}</Text>
                </View>
              );
              return null;
            }}
          />
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modal: { flex: 1 },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 12,
    borderWidth: 1.5,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === "ios" ? 9 : 7,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 0,
  },
  cancelBtn: { paddingVertical: 4 },
  cancelTxt: { fontSize: 15, fontWeight: "600" },
  filterRow: {
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  chipTxt: { fontSize: 13, fontWeight: "600" },
  listContent: { padding: 16 },
  section: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
    marginTop: 16,
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    padding: 12,
    marginBottom: 8,
  },
  orgAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  orgAvatarText: { fontSize: 16, fontWeight: "700", color: "#fff" },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  profileCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  profileCircleTxt: { fontSize: 16, fontWeight: "700" },
  rowInfo: { flex: 1, gap: 2 },
  rowTitleLine: { flexDirection: "row", alignItems: "center", gap: 5 },
  rowTitle: { fontSize: 14, fontWeight: "600", flexShrink: 1 },
  rowSub: { fontSize: 12 },
  rowMeta: { flexDirection: "row", alignItems: "center", gap: 3, marginTop: 2 },
  rowMetaTxt: { fontSize: 12 },
  price: { fontSize: 13, fontWeight: "700", marginTop: 2 },
  rolePill: { alignSelf: "flex-start", borderRadius: 7, paddingHorizontal: 7, paddingVertical: 2, marginTop: 3 },
  rolePillTxt: { fontSize: 11, fontWeight: "600" },
  hint: { flex: 1, alignItems: "center", justifyContent: "center", gap: 14, paddingHorizontal: 40 },
  hintTitle: { fontSize: 20, fontWeight: "700", textAlign: "center" },
  hintSub: { fontSize: 14, textAlign: "center", lineHeight: 20 },
  noResults: { alignItems: "center", justifyContent: "center", paddingVertical: 48, gap: 12 },
  noResultsTxt: { fontSize: 15, textAlign: "center" },
});
