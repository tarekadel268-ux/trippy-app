import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  ImageBackground,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Review, useApp } from "@/contexts/AppContext";
import { useColors } from "@/hooks/useColors";

type Tab = "events" | "reviews";

export default function OrganizerProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const {
    organizers, events, trips, reviews,
    user, followOrganizer, unfollowOrganizer,
    isFollowing, getFollowerCount, getOrganizerRating,
    addReview, startChat,
    organizerPhotos, updateOrganizerPhotos, myOrganizerId,
  } = useApp();

  const [activeTab, setActiveTab] = useState<Tab>("events");
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewStars, setReviewStars] = useState(5);
  const [reviewComment, setReviewComment] = useState("");

  const organizer = organizers.find(o => o.id === id);
  if (!organizer) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.mutedForeground }}>Profile not found.</Text>
      </View>
    );
  }

  const following = isFollowing(organizer.id);
  const followerCount = getFollowerCount(organizer.id);
  const { avg: rating, count: reviewCount } = getOrganizerRating(organizer.id);

  const isOwnProfile = myOrganizerId === organizer.id;
  const photos = organizerPhotos[organizer.id] || {};

  const pickImage = async (type: "cover" | "profile") => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission needed", "Please allow photo library access to change your photos.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: type === "cover" ? [3, 1] : [1, 1],
      quality: 0.85,
    });
    if (!result.canceled && result.assets[0]?.uri) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await updateOrganizerPhotos(organizer.id, type === "cover" ? { coverUri: result.assets[0].uri } : { profileUri: result.assets[0].uri });
    }
  };

  const orgEvents = events.filter(e => e.organizerId === organizer.id);
  const orgTrips = trips.filter(t => t.organizerId === organizer.id);
  const listingCount = organizer.type === "lounge" ? orgEvents.length : orgTrips.length;
  const orgReviews = reviews.filter(r => r.organizerId === organizer.id);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 24 : insets.bottom;

  const handleFollow = async () => {
    Haptics.selectionAsync();
    if (following) {
      await unfollowOrganizer(organizer.id);
    } else {
      await followOrganizer(organizer.id);
    }
  };

  const handleSubmitReview = async () => {
    if (!reviewComment.trim()) {
      Alert.alert("Add a comment", "Please write something about your experience.");
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const review: Review = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      organizerId: organizer.id,
      reviewerName: user?.name || "Anonymous",
      stars: reviewStars,
      comment: reviewComment.trim(),
      createdAt: new Date().toISOString(),
    };
    await addReview(review);
    setShowReviewForm(false);
    setReviewComment("");
    setReviewStars(5);
    setActiveTab("reviews");
  };

  const formatFollowers = (n: number) => {
    if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
    return String(n);
  };

  const renderStars = (stars: number, size = 14, interactive = false, onPress?: (s: number) => void) => (
    <View style={{ flexDirection: "row", gap: 3 }}>
      {[1, 2, 3, 4, 5].map(s => (
        <TouchableOpacity
          key={s}
          onPress={() => interactive && onPress?.(s)}
          disabled={!interactive}
          activeOpacity={interactive ? 0.7 : 1}
        >
          <Feather
            name="star"
            size={size}
            color={s <= stars ? "#f59e0b" : colors.border}
          />
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderEventItem = ({ item }: { item: typeof orgEvents[0] }) => (
    <TouchableOpacity
      style={[styles.listingCard, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={() => router.push(`/events/${item.id}`)}
      activeOpacity={0.85}
    >
      <View style={[styles.listingLeft, { backgroundColor: organizer.coverColor + "22" }]}>
        <Feather name="calendar" size={20} color={organizer.coverColor} />
      </View>
      <View style={{ flex: 1, gap: 3 }}>
        <Text style={[styles.listingTitle, { color: colors.foreground }]} numberOfLines={1}>{item.title}</Text>
        <Text style={[styles.listingMeta, { color: colors.mutedForeground }]}>{item.venue} · {new Date(item.date).toLocaleDateString("en-EG", { day: "numeric", month: "short" })}</Text>
      </View>
      <Text style={[styles.listingPrice, { color: organizer.coverColor }]}>EGP {item.priceEGP.toLocaleString()}</Text>
    </TouchableOpacity>
  );

  const renderTripItem = ({ item }: { item: typeof orgTrips[0] }) => (
    <TouchableOpacity
      style={[styles.listingCard, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={() => router.push(`/trips/${item.id}`)}
      activeOpacity={0.85}
    >
      <View style={[styles.listingLeft, { backgroundColor: organizer.coverColor + "22" }]}>
        <Feather name="map" size={20} color={organizer.coverColor} />
      </View>
      <View style={{ flex: 1, gap: 3 }}>
        <Text style={[styles.listingTitle, { color: colors.foreground }]} numberOfLines={1}>{item.title}</Text>
        <Text style={[styles.listingMeta, { color: colors.mutedForeground }]}>{item.city} · {item.days} days</Text>
      </View>
      <Text style={[styles.listingPrice, { color: organizer.coverColor }]}>EGP {item.priceEGP.toLocaleString()}</Text>
    </TouchableOpacity>
  );

  const renderReview = ({ item }: { item: Review }) => (
    <View style={[styles.reviewCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.reviewHeader}>
        <View style={[styles.reviewAvatar, { backgroundColor: organizer.coverColor + "22" }]}>
          <Text style={[styles.reviewInitial, { color: organizer.coverColor }]}>{item.reviewerName.charAt(0)}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.reviewName, { color: colors.foreground }]}>{item.reviewerName}</Text>
          <Text style={[styles.reviewDate, { color: colors.mutedForeground }]}>
            {new Date(item.createdAt).toLocaleDateString("en-EG", { day: "numeric", month: "short", year: "numeric" })}
          </Text>
        </View>
        {renderStars(item.stars)}
      </View>
      <Text style={[styles.reviewComment, { color: colors.foreground }]}>{item.comment}</Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: bottomPad + 20 }}>
        {photos.coverUri ? (
          <ImageBackground
            source={{ uri: photos.coverUri }}
            style={[styles.coverBand, { paddingTop: topPad }]}
            resizeMode="cover"
          >
            <View style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(0,0,0,0.25)" }]} />
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
              <Feather name="arrow-left" size={22} color="rgba(255,255,255,0.9)" />
            </TouchableOpacity>
            {isOwnProfile && (
              <TouchableOpacity style={styles.coverEditBtn} onPress={() => pickImage("cover")} activeOpacity={0.85}>
                <Feather name="camera" size={16} color="#fff" />
                <Text style={styles.coverEditText}>Change Cover</Text>
              </TouchableOpacity>
            )}
          </ImageBackground>
        ) : (
          <View style={[styles.coverBand, { backgroundColor: organizer.coverColor, paddingTop: topPad }]}>
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
              <Feather name="arrow-left" size={22} color="rgba(255,255,255,0.9)" />
            </TouchableOpacity>
            {isOwnProfile && (
              <TouchableOpacity style={styles.coverEditBtn} onPress={() => pickImage("cover")} activeOpacity={0.85}>
                <Feather name="camera" size={16} color="#fff" />
                <Text style={styles.coverEditText}>Change Cover</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        <View style={styles.profileSection}>
          <View style={{ position: "relative" }}>
            {photos.profileUri ? (
              <Image
                source={{ uri: photos.profileUri }}
                style={[styles.avatarCircle, { borderColor: colors.background }]}
              />
            ) : (
              <View style={[styles.avatarCircle, { backgroundColor: organizer.avatarColor, borderColor: colors.background }]}>
                <Feather
                  name={organizer.type === "lounge" ? "coffee" : "map"}
                  size={36}
                  color="#fff"
                />
              </View>
            )}
            {isOwnProfile && (
              <TouchableOpacity
                style={[styles.avatarEditBtn, { backgroundColor: organizer.coverColor }]}
                onPress={() => pickImage("profile")}
                activeOpacity={0.85}
              >
                <Feather name="camera" size={13} color="#fff" />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.profileActions}>
            <TouchableOpacity
              style={[
                styles.followBtn,
                following
                  ? { backgroundColor: colors.muted, borderColor: colors.border, borderWidth: 1.5 }
                  : { backgroundColor: organizer.coverColor }
              ]}
              onPress={handleFollow}
              activeOpacity={0.85}
            >
              <Text style={[styles.followBtnText, { color: following ? colors.foreground : "#fff" }]}>
                {following ? "Following" : "Follow"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.messageBtn, { borderColor: colors.border }]}
              onPress={async () => {
                if (!user) return;
                Haptics.selectionAsync();
                const threadId = `org_${organizer.id}_${user.id}`;
                await startChat({
                  id: threadId,
                  participantId: organizer.id,
                  participantName: organizer.name,
                  listingId: organizer.id,
                  listingTitle: organizer.name,
                  messages: [],
                  lastUpdated: new Date().toISOString(),
                });
                router.push(`/chat/${threadId}`);
              }}
              activeOpacity={0.85}
            >
              <Feather name="message-circle" size={16} color={colors.foreground} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.nameSection}>
          <View style={styles.nameRow}>
            <Text style={[styles.orgName, { color: colors.foreground }]}>{organizer.name}</Text>
            {organizer.isVerified && (
              <View style={[styles.verifiedBadge, { backgroundColor: organizer.coverColor }]}>
                <Feather name="check" size={11} color="#fff" />
              </View>
            )}
          </View>
          <View style={styles.typePill}>
            <Feather
              name={organizer.type === "lounge" ? "coffee" : "map"}
              size={12}
              color={organizer.coverColor}
            />
            <Text style={[styles.typeText, { color: organizer.coverColor }]}>
              {organizer.type === "lounge" ? "Lounge & Events" : "Trip Planner"}
            </Text>
          </View>
          <Text style={[styles.cityText, { color: colors.mutedForeground }]}>
            <Feather name="map-pin" size={12} color={colors.mutedForeground} /> {organizer.city}
          </Text>
          <Text style={[styles.bioText, { color: colors.foreground }]}>{organizer.bio}</Text>

          {(organizer.instagram || organizer.website) && (
            <View style={styles.linksRow}>
              {organizer.instagram && (
                <View style={styles.linkItem}>
                  <Feather name="instagram" size={13} color={organizer.coverColor} />
                  <Text style={[styles.linkText, { color: organizer.coverColor }]}>{organizer.instagram}</Text>
                </View>
              )}
              {organizer.website && (
                <View style={styles.linkItem}>
                  <Feather name="globe" size={13} color={organizer.coverColor} />
                  <Text style={[styles.linkText, { color: organizer.coverColor }]}>{organizer.website}</Text>
                </View>
              )}
            </View>
          )}
        </View>

        <View style={[styles.statsRow, { borderColor: colors.border }]}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.foreground }]}>{formatFollowers(followerCount)}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Followers</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.foreground }]}>{listingCount}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
              {organizer.type === "lounge" ? "Events" : "Trips"}
            </Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <View style={styles.statItem}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
              <Feather name="star" size={14} color="#f59e0b" />
              <Text style={[styles.statValue, { color: colors.foreground }]}>
                {reviewCount > 0 ? rating.toFixed(1) : "—"}
              </Text>
            </View>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{reviewCount} reviews</Text>
          </View>
        </View>

        <View style={[styles.tabs, { borderBottomColor: colors.border }]}>
          {(["events", "reviews"] as Tab[]).map(tab => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && { borderBottomColor: organizer.coverColor, borderBottomWidth: 2.5 }]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[
                styles.tabText,
                { color: activeTab === tab ? organizer.coverColor : colors.mutedForeground }
              ]}>
                {tab === "events" ? (organizer.type === "lounge" ? "Events" : "Trips") : "Reviews"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.tabContent}>
          {activeTab === "events" && (
            <>
              {(organizer.type === "lounge" ? orgEvents : orgTrips).length === 0 ? (
                <View style={[styles.emptyTab, { backgroundColor: colors.muted }]}>
                  <Feather name={organizer.type === "lounge" ? "calendar" : "map"} size={32} color={colors.mutedForeground} />
                  <Text style={[styles.emptyTabText, { color: colors.mutedForeground }]}>No listings yet</Text>
                </View>
              ) : (
                <FlatList
                  data={organizer.type === "lounge" ? orgEvents : orgTrips}
                  keyExtractor={item => item.id}
                  renderItem={organizer.type === "lounge" ? renderEventItem : (renderTripItem as any)}
                  scrollEnabled={false}
                  contentContainerStyle={{ gap: 10, paddingHorizontal: 16, paddingTop: 12 }}
                />
              )}
            </>
          )}

          {activeTab === "reviews" && (
            <View style={{ paddingHorizontal: 16, paddingTop: 12 }}>
              {!showReviewForm ? (
                <TouchableOpacity
                  style={[styles.writeReviewBtn, { borderColor: organizer.coverColor, backgroundColor: organizer.coverColor + "12" }]}
                  onPress={() => setShowReviewForm(true)}
                  activeOpacity={0.85}
                >
                  <Feather name="edit-3" size={16} color={organizer.coverColor} />
                  <Text style={[styles.writeReviewText, { color: organizer.coverColor }]}>Write a Review</Text>
                </TouchableOpacity>
              ) : (
                <View style={[styles.reviewForm, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Text style={[styles.reviewFormTitle, { color: colors.foreground }]}>Your Review</Text>
                  <View style={styles.starsRow}>
                    <Text style={[styles.starsLabel, { color: colors.mutedForeground }]}>Rating:</Text>
                    {renderStars(reviewStars, 28, true, setReviewStars)}
                  </View>
                  <TextInput
                    style={[styles.reviewInput, { backgroundColor: colors.muted, borderColor: colors.border, color: colors.foreground }]}
                    placeholder="Share your experience..."
                    placeholderTextColor={colors.mutedForeground}
                    value={reviewComment}
                    onChangeText={setReviewComment}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                  <View style={styles.reviewFormBtns}>
                    <TouchableOpacity
                      style={[styles.cancelBtn, { borderColor: colors.border }]}
                      onPress={() => { setShowReviewForm(false); setReviewComment(""); setReviewStars(5); }}
                    >
                      <Text style={[styles.cancelBtnText, { color: colors.mutedForeground }]}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.submitBtn, { backgroundColor: organizer.coverColor }]}
                      onPress={handleSubmitReview}
                    >
                      <Text style={styles.submitBtnText}>Submit</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {orgReviews.length === 0 ? (
                <View style={[styles.emptyTab, { backgroundColor: colors.muted, marginTop: 12 }]}>
                  <Feather name="star" size={32} color={colors.mutedForeground} />
                  <Text style={[styles.emptyTabText, { color: colors.mutedForeground }]}>No reviews yet — be the first!</Text>
                </View>
              ) : (
                <FlatList
                  data={orgReviews}
                  keyExtractor={item => item.id}
                  renderItem={renderReview}
                  scrollEnabled={false}
                  contentContainerStyle={{ gap: 10, paddingTop: 12 }}
                />
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  coverBand: {
    height: 130,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    overflow: "hidden",
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(0,0,0,0.25)",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  coverEditBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(0,0,0,0.45)",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    marginTop: "auto" as any,
  },
  coverEditText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
  profileSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingHorizontal: 16,
    marginTop: -44,
    marginBottom: 12,
  },
  avatarCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 4,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarEditBtn: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  profileActions: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    marginTop: 40,
  },
  followBtn: {
    paddingHorizontal: 22,
    paddingVertical: 9,
    borderRadius: 22,
  },
  followBtnText: {
    fontWeight: "700",
    fontSize: 14,
  },
  messageBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  nameSection: {
    paddingHorizontal: 16,
    gap: 6,
    marginBottom: 16,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  orgName: {
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  verifiedBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  typePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  typeText: {
    fontSize: 13,
    fontWeight: "600",
  },
  cityText: {
    fontSize: 13,
  },
  bioText: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
  },
  linksRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 4,
  },
  linkItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  linkText: {
    fontSize: 13,
    fontWeight: "600",
  },
  statsRow: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    marginBottom: 4,
  },
  statItem: {
    flex: 1,
    paddingVertical: 14,
    alignItems: "center",
    gap: 3,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "800",
  },
  statLabel: {
    fontSize: 11,
    fontWeight: "500",
  },
  statDivider: {
    width: 1,
    marginVertical: 10,
  },
  tabs: {
    flexDirection: "row",
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 14,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "700",
  },
  tabContent: {},
  listingCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  listingLeft: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  listingTitle: {
    fontSize: 14,
    fontWeight: "700",
  },
  listingMeta: {
    fontSize: 12,
  },
  listingPrice: {
    fontSize: 14,
    fontWeight: "800",
  },
  reviewCard: {
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    gap: 10,
  },
  reviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  reviewAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  reviewInitial: {
    fontSize: 16,
    fontWeight: "800",
  },
  reviewName: {
    fontSize: 14,
    fontWeight: "700",
  },
  reviewDate: {
    fontSize: 11,
    marginTop: 1,
  },
  reviewComment: {
    fontSize: 14,
    lineHeight: 20,
  },
  emptyTab: {
    margin: 16,
    padding: 40,
    borderRadius: 16,
    alignItems: "center",
    gap: 12,
  },
  emptyTabText: {
    fontSize: 14,
    textAlign: "center",
  },
  writeReviewBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    justifyContent: "center",
  },
  writeReviewText: {
    fontSize: 14,
    fontWeight: "700",
  },
  reviewForm: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    gap: 14,
  },
  reviewFormTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  starsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  starsLabel: {
    fontSize: 14,
  },
  reviewInput: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    fontSize: 14,
    minHeight: 90,
  },
  reviewFormBtns: {
    flexDirection: "row",
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: "600",
  },
  submitBtn: {
    flex: 2,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  submitBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
});
