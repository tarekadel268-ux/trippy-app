import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import {
  Alert,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { HighlightPost, useApp } from "@/contexts/AppContext";
import { useColors } from "@/hooks/useColors";

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days} day${days > 1 ? "s" : ""} ago`;
  if (weeks < 5) return `${weeks} week${weeks > 1 ? "s" : ""} ago`;
  return `${months} month${months > 1 ? "s" : ""} ago`;
}

export default function FeedScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, highlights, organizers, organizerPhotos, reportPost } = useApp();

  const handleReport = (post: HighlightPost) => {
    Alert.alert(
      "Report this post?",
      "Choose a reason. Our team will review it.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Inappropriate", onPress: () => submit(post, "Inappropriate") },
        { text: "Spam", onPress: () => submit(post, "Spam") },
        { text: "Harassment", onPress: () => submit(post, "Harassment") },
        { text: "Other", onPress: () => submit(post, "Other") },
      ],
    );
  };

  const submit = async (post: HighlightPost, reason: string) => {
    const ok = await reportPost(post, reason);
    if (ok) Alert.alert("Thanks", "Your report has been submitted.");
  };

  const topPad = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const followed = user?.followedOrganizers || [];

  // Posts in DB store user_id = Supabase UUID.
  // followedOrganizers contains organizer IDs like "org_user_<uuid>".
  // Strip the "org_user_" prefix to compare against post.userId.
  const followedUserIds = useMemo(
    () => followed.map((f) => (f.startsWith("org_user_") ? f.slice("org_user_".length) : f)),
    [followed],
  );

  const feedPosts = useMemo(() => {
    return highlights
      .filter((h) => followedUserIds.includes(h.userId))
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }, [highlights, followedUserIds]);

  const getAuthor = (userId: string) => {
    // Posts have a bare UUID; organizers have id "org_user_<uuid>"
    const orgId = `org_user_${userId}`;
    const org =
      organizers.find((o) => o.id === orgId) ||
      organizers.find((o) => o.id === userId);
    const photos = org ? organizerPhotos[org.id] : undefined;
    return {
      name: org?.name || "User",
      subtitle:
        org?.city ||
        (org?.type === "lounge"
          ? "Lounge"
          : org?.type === "event_planner"
          ? "Event Planner"
          : ""),
      avatarUri: photos?.profileUri,
      avatarColor: org?.avatarColor || colors.primary,
      isLounge: org?.type === "lounge",
      isVerified: org?.isVerified,
    };
  };

  const renderPost = ({ item }: { item: HighlightPost }) => {
    const author = getAuthor(item.userId);
    return (
      <View
        style={[
          styles.postCard,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <View style={styles.postHeader}>
        <TouchableOpacity
          style={{ flexDirection: "row", alignItems: "center", gap: 10, flex: 1 }}
          onPress={() => router.push(`/organizer/${item.userId}` as any)}
          activeOpacity={0.88}
        >
          {author.avatarUri ? (
            <Image source={{ uri: author.avatarUri }} style={styles.avatar} />
          ) : (
            <View
              style={[
                styles.avatar,
                {
                  backgroundColor: author.avatarColor,
                  alignItems: "center",
                  justifyContent: "center",
                },
              ]}
            >
              <Feather
                name={author.isLounge ? "coffee" : "map"}
                size={18}
                color="#fff"
              />
            </View>
          )}
          <View style={{ flex: 1 }}>
            <View style={styles.authorRow}>
              <Text
                style={[styles.author, { color: colors.foreground }]}
                numberOfLines={1}
              >
                {author.name}
              </Text>
              {author.isVerified && (
                <View
                  style={[
                    styles.verifiedDot,
                    { backgroundColor: colors.primary },
                  ]}
                >
                  <Feather name="check" size={9} color="#fff" />
                </View>
              )}
            </View>
            {author.subtitle ? (
              <Text
                style={[styles.subtitle, { color: colors.mutedForeground }]}
                numberOfLines={1}
              >
                {author.subtitle}
              </Text>
            ) : null}
          </View>
        </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleReport(item)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={{ paddingHorizontal: 6, paddingVertical: 4 }}
            activeOpacity={0.7}
          >
            <Feather name="more-horizontal" size={22} color={colors.mutedForeground} />
          </TouchableOpacity>
        </View>

        <View style={styles.mediaWrap}>
          <Image
            source={{ uri: item.uri }}
            style={styles.media}
            contentFit="cover"
          />
          {item.type === "video" && (
            <View style={styles.playBadge}>
              <Feather name="play" size={14} color="#fff" />
            </View>
          )}
        </View>

        {item.caption ? (
          <Text
            style={[styles.caption, { color: colors.foreground }]}
            numberOfLines={2}
          >
            {item.caption}
          </Text>
        ) : null}
        <Text style={[styles.date, { color: colors.mutedForeground }]}>
          {timeAgo(item.createdAt)}
        </Text>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 10 }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>Feed</Text>
      </View>

      {feedPosts.length === 0 ? (
        <View style={styles.empty}>
          <Feather name="image" size={44} color={colors.mutedForeground} />
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
            No posts yet
          </Text>
          <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>
            Follow organizers to see their highlights here
          </Text>
        </View>
      ) : (
        <FlatList
          data={feedPosts}
          keyExtractor={(item) => item.id}
          renderItem={renderPost}
          contentContainerStyle={{
            paddingHorizontal: 14,
            paddingBottom: bottomPad + 80,
            gap: 18,
          }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 10 },
  title: { fontSize: 28, fontWeight: "800", letterSpacing: -0.5 },
  postCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 3,
  },
  postHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  avatar: { width: 42, height: 42, borderRadius: 21 },
  authorRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  author: { fontSize: 15, fontWeight: "700" },
  verifiedDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  subtitle: { fontSize: 12, marginTop: 1 },
  mediaWrap: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "#000",
  },
  media: { width: "100%", height: "100%" },
  playBadge: {
    position: "absolute",
    bottom: 12,
    left: 12,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  caption: { fontSize: 14, lineHeight: 20 },
  date: { fontSize: 12, opacity: 0.6 },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingHorizontal: 40,
  },
  emptyTitle: { fontSize: 18, fontWeight: "700" },
  emptySub: { fontSize: 14, textAlign: "center" },
});
