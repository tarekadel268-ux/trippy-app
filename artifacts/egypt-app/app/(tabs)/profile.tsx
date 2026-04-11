import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
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

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const {
    user, setUser, currency, setCurrency,
    organizers, events, trips, purchasedTickets,
    reviews, addReview,
    followOrganizer, unfollowOrganizer, isFollowing, getFollowerCount, getOrganizerRating,
    organizerPhotos, updateOrganizerPhotos,
    myOrganizerId, startChat,
  } = useApp();

  const [activeTab, setActiveTab] = useState<Tab>("events");
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewStars, setReviewStars] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [username, setUsername] = useState(user?.username || "");
  const [usernameError, setUsernameError] = useState("");

  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;
  const topPad = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;

  const roleLabels: Record<string, string> = {
    ticket_holder: "Ticket Holder",
    trip_planner: "Events Planner",
    tourist_viewer: "Tourist Explorer",
    resident_viewer: "View Events & Tickets",
  };
  const roleColors: Record<string, string> = {
    ticket_holder: "#e06848",
    trip_planner: "#0abab5",
    resident_viewer: "#c9a800",
    tourist_viewer: "#2d4a6b",
  };

  const validateUsername = (val: string) => {
    if (val.length < 3) return "At least 3 characters";
    if (val.length > 20) return "Max 20 characters";
    if (!/^[a-z0-9_]+$/.test(val)) return "Lowercase letters, numbers, underscores only";
    return "";
  };
  const handleUsernameChange = (val: string) => {
    const clean = val.toLowerCase().replace(/[^a-z0-9_]/g, "");
    setUsername(clean);
    setUsernameError(clean.length > 0 ? validateUsername(clean) : "");
  };
  const handleSave = async () => {
    if (!user || usernameError) return;
    await setUser({ ...user, name: name.trim(), phone: phone.trim(), username: username.trim() });
    setEditing(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };
  const handleLogout = () => {
    Alert.alert("Sign Out", "This will clear your profile and take you back to the start.", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", style: "destructive", onPress: async () => { await setUser(null); router.replace("/"); } },
    ]);
  };

  if (!user) return null;

  const roleColor = roleColors[user.role] || colors.primary;
  const myOrg = organizers.find(o => o.id === myOrganizerId);
  const isOrgUser = (user.role === "trip_planner" || user.role === "ticket_holder") && !!myOrg;

  if (isOrgUser && myOrg) {
    return (
      <OrganizerProfileView
        user={user}
        myOrg={myOrg}
        colors={colors}
        topPad={topPad}
        bottomPad={bottomPad}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        showReviewForm={showReviewForm}
        setShowReviewForm={setShowReviewForm}
        reviewStars={reviewStars}
        setReviewStars={setReviewStars}
        reviewComment={reviewComment}
        setReviewComment={setReviewComment}
        editing={editing}
        setEditing={setEditing}
        name={name}
        setName={setName}
        phone={phone}
        setPhone={setPhone}
        username={username}
        setUsername={setUsername}
        usernameError={usernameError}
        handleUsernameChange={handleUsernameChange}
        handleSave={handleSave}
        handleLogout={handleLogout}
        currency={currency}
        setCurrency={setCurrency}
        events={events}
        trips={trips}
        reviews={reviews}
        addReview={addReview}
        isFollowing={isFollowing}
        followOrganizer={followOrganizer}
        unfollowOrganizer={unfollowOrganizer}
        getFollowerCount={getFollowerCount}
        getOrganizerRating={getOrganizerRating}
        organizerPhotos={organizerPhotos}
        updateOrganizerPhotos={updateOrganizerPhotos}
        purchasedTickets={purchasedTickets}
        router={router}
        startChat={startChat}
        isPlannerSub={user.subscriptionExpiry ? new Date(user.subscriptionExpiry) > new Date() : false}
        setUser={setUser}
      />
    );
  }

  const initials = (user.name || user.username || "?").slice(0, 2).toUpperCase();
  const isPlannerSub = user.subscriptionExpiry ? new Date(user.subscriptionExpiry) > new Date() : false;
  const subExpiry = user.subscriptionExpiry
    ? new Date(user.subscriptionExpiry).toLocaleDateString("en-EG", { day: "numeric", month: "short", year: "numeric" })
    : null;

  const pickPhoto = async (type: "profile" | "cover") => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") { Alert.alert("Permission needed", "Please allow access to your photo library."); return; }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: type === "profile" ? [1, 1] : [3, 1],
      quality: 0.85,
    });
    if (!result.canceled && result.assets[0] && user) {
      const update = type === "profile" ? { ...user, profileUri: result.assets[0].uri } : { ...user, coverUri: result.assets[0].uri };
      await setUser(update);
      Haptics.selectionAsync();
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: topPad + 12, paddingBottom: bottomPad + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.pageTitle, { color: colors.foreground }]}>Profile</Text>

        <View style={[styles.heroCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <TouchableOpacity style={styles.coverWrap} onPress={() => pickPhoto("cover")} activeOpacity={0.88}>
            {user.coverUri ? (
              <Image source={{ uri: user.coverUri }} style={styles.coverImage} resizeMode="cover" />
            ) : (
              <LinearGradient colors={[roleColor + "cc", roleColor + "55"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.coverGradient} />
            )}
            <View style={styles.coverEditBtn}>
              <Feather name="camera" size={14} color="#fff" />
              <Text style={styles.coverEditText}>Edit Cover</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.avatarRow}>
            <TouchableOpacity style={styles.avatarWrap} onPress={() => pickPhoto("profile")} activeOpacity={0.88}>
              {user.profileUri ? (
                <Image source={{ uri: user.profileUri }} style={styles.avatarImage} />
              ) : (
                <View style={[styles.avatarFallback, { backgroundColor: roleColor }]}>
                  <Text style={styles.avatarInitials}>{initials}</Text>
                </View>
              )}
              <View style={[styles.avatarCameraBtn, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Feather name="camera" size={12} color={colors.foreground} />
              </View>
              {user.authProvider && (
                <View style={[styles.providerBadge, { backgroundColor: user.authProvider === "google" ? "#4285F4" : "#000" }]}>
                  <Text style={styles.providerBadgeText}>{user.authProvider === "google" ? "G" : "A"}</Text>
                </View>
              )}
            </TouchableOpacity>
            <View style={styles.heroMeta}>
              <Text style={[styles.heroName, { color: colors.foreground }]} numberOfLines={1}>{user.name || "Set your name"}</Text>
              <Text style={[styles.heroUsername, { color: colors.primary }]}>@{user.username || "username"}</Text>
              {user.email && <Text style={[styles.heroEmail, { color: colors.mutedForeground }]} numberOfLines={1}>{user.email}</Text>}
            </View>
          </View>

          <View style={styles.chipRow}>
            <View style={[styles.roleChip, { backgroundColor: roleColor + "18" }]}>
              <View style={[styles.roleDot, { backgroundColor: roleColor }]} />
              <Text style={[styles.roleText, { color: roleColor }]}>{roleLabels[user.role]}</Text>
            </View>
            {user.isVerified && isPlannerSub && (
              <View style={[styles.verifiedChip, { backgroundColor: colors.success + "18" }]}>
                <Feather name="shield" size={12} color={colors.success} />
                <Text style={[styles.verifiedText, { color: colors.success }]}>Verified</Text>
              </View>
            )}
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: colors.foreground }]}>Account Info</Text>
            <TouchableOpacity onPress={() => { setEditing(!editing); setName(user.name); setPhone(user.phone); setUsername(user.username || ""); }}>
              <Feather name={editing ? "x" : "edit-2"} size={18} color={colors.primary} />
            </TouchableOpacity>
          </View>
          <View style={styles.field}>
            <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Display Name</Text>
            {editing ? <TextInput style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.muted }]} value={name} onChangeText={setName} placeholder="Your name" placeholderTextColor={colors.mutedForeground} /> : <Text style={[styles.fieldValue, { color: colors.foreground }]}>{user.name || "Not set"}</Text>}
          </View>
          <View style={styles.field}>
            <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Username</Text>
            {editing ? (
              <View>
                <View style={[styles.usernameRow, { borderColor: usernameError ? "#f87171" : colors.border, backgroundColor: colors.muted }]}>
                  <Text style={[styles.atPrefix, { color: colors.primary }]}>@</Text>
                  <TextInput style={[styles.usernameInput, { color: colors.foreground }]} value={username} onChangeText={handleUsernameChange} placeholder="yourhandle" placeholderTextColor={colors.mutedForeground} autoCapitalize="none" autoCorrect={false} maxLength={20} />
                </View>
                {usernameError ? <Text style={styles.fieldError}>{usernameError}</Text> : null}
              </View>
            ) : <Text style={[styles.fieldValue, { color: colors.primary, fontWeight: "700" }]}>@{user.username || "not set"}</Text>}
          </View>
          <View style={styles.field}>
            <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Phone</Text>
            {editing ? <TextInput style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.muted }]} value={phone} onChangeText={setPhone} placeholder="+20 XXX XXX XXXX" placeholderTextColor={colors.mutedForeground} keyboardType="phone-pad" /> : <Text style={[styles.fieldValue, { color: colors.foreground }]}>{user.phone || "Not set"}</Text>}
          </View>
          {user.email && (
            <View style={styles.field}>
              <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>{user.authProvider === "google" ? "Gmail" : user.authProvider === "apple" ? "Apple ID" : "Email"}</Text>
              <View style={styles.emailRow}>
                <Text style={[styles.fieldValue, { color: colors.foreground }]}>{user.email}</Text>
                <View style={[styles.providerPill, { backgroundColor: user.authProvider === "google" ? "#4285F420" : colors.muted }]}>
                  <Text style={[styles.providerPillText, { color: user.authProvider === "google" ? "#4285F4" : colors.mutedForeground }]}>{user.authProvider === "google" ? "Google" : "Apple"}</Text>
                </View>
              </View>
            </View>
          )}
          {editing && <TouchableOpacity style={[styles.saveBtn, { backgroundColor: colors.primary }]} onPress={handleSave}><Text style={styles.saveBtnText}>Save Changes</Text></TouchableOpacity>}
        </View>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.foreground }]}>Currency</Text>
          <View style={styles.currencyRow}>
            <TouchableOpacity style={[styles.currencyBtn, { backgroundColor: currency === "EGP" ? colors.primary : colors.muted }]} onPress={() => setCurrency("EGP")}><Text style={[styles.currencyBtnText, { color: currency === "EGP" ? "#fff" : colors.mutedForeground }]}>EGP</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.currencyBtn, { backgroundColor: currency === "USD" ? colors.primary : colors.muted }]} onPress={() => setCurrency("USD")}><Text style={[styles.currencyBtnText, { color: currency === "USD" ? "#fff" : colors.mutedForeground }]}>USD</Text></TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={[styles.logoutBtn, { borderColor: colors.destructive }]} onPress={handleLogout}>
          <Feather name="log-out" size={16} color={colors.destructive} />
          <Text style={[styles.logoutText, { color: colors.destructive }]}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

function OrganizerProfileView({
  user, myOrg, colors, topPad, bottomPad,
  activeTab, setActiveTab,
  showReviewForm, setShowReviewForm,
  reviewStars, setReviewStars,
  reviewComment, setReviewComment,
  editing, setEditing,
  name, setName, phone, setPhone,
  username, setUsername, usernameError, handleUsernameChange,
  handleSave, handleLogout,
  currency, setCurrency,
  events, trips, reviews, addReview,
  isFollowing, followOrganizer, unfollowOrganizer,
  getFollowerCount, getOrganizerRating,
  organizerPhotos, updateOrganizerPhotos,
  purchasedTickets, router, startChat,
  isPlannerSub, setUser,
}: any) {
  const photos = organizerPhotos[myOrg.id] || {};
  const followerCount = getFollowerCount(myOrg.id);
  const { avg: rating, count: reviewCount } = getOrganizerRating(myOrg.id);
  const orgEvents = events.filter((e: any) => e.organizerId === myOrg.id);
  const orgTrips = trips.filter((t: any) => t.organizerId === myOrg.id);
  const orgReviews = reviews.filter((r: any) => r.organizerId === myOrg.id);
  const listingCount = myOrg.type === "lounge" ? orgEvents.length : orgTrips.length;
  const isVerifiedBadge = user?.isVerified && isPlannerSub;
  const subExpiry = user.subscriptionExpiry
    ? new Date(user.subscriptionExpiry).toLocaleDateString("en-EG", { day: "numeric", month: "short", year: "numeric" })
    : null;

  const pickImage = async (type: "cover" | "profile") => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) { Alert.alert("Permission needed", "Please allow photo library access."); return; }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: type === "cover" ? [3, 1] : [1, 1],
      quality: 0.85,
    });
    if (!result.canceled && result.assets[0]?.uri) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await updateOrganizerPhotos(myOrg.id, type === "cover" ? { coverUri: result.assets[0].uri } : { profileUri: result.assets[0].uri });
    }
  };

  const formatFollowers = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);

  const renderStars = (stars: number, size = 14, interactive = false, onPress?: (s: number) => void) => (
    <View style={{ flexDirection: "row", gap: 3 }}>
      {[1, 2, 3, 4, 5].map(s => (
        <TouchableOpacity key={s} onPress={() => interactive && onPress?.(s)} disabled={!interactive} activeOpacity={interactive ? 0.7 : 1}>
          <Feather name="star" size={size} color={s <= stars ? "#f59e0b" : colors.border} />
        </TouchableOpacity>
      ))}
    </View>
  );

  const handleSubmitReview = async () => {
    if (!reviewComment.trim()) { Alert.alert("Add a comment", "Please write something about your experience."); return; }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const review: Review = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      organizerId: myOrg.id,
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

  const renderEventItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={[orgStyles.listingCard, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => router.push(`/events/${item.id}`)} activeOpacity={0.85}>
      <View style={[orgStyles.listingLeft, { backgroundColor: myOrg.coverColor + "22" }]}>
        <Feather name="calendar" size={20} color={myOrg.coverColor} />
      </View>
      <View style={{ flex: 1, gap: 3 }}>
        <Text style={[orgStyles.listingTitle, { color: colors.foreground }]} numberOfLines={1}>{item.title}</Text>
        <Text style={[orgStyles.listingMeta, { color: colors.mutedForeground }]}>{item.venue} · {new Date(item.date).toLocaleDateString("en-EG", { day: "numeric", month: "short" })}</Text>
      </View>
      <Text style={[orgStyles.listingPrice, { color: myOrg.coverColor }]}>EGP {item.priceEGP.toLocaleString()}</Text>
    </TouchableOpacity>
  );

  const renderTripItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={[orgStyles.listingCard, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => router.push(`/trips/${item.id}`)} activeOpacity={0.85}>
      <View style={[orgStyles.listingLeft, { backgroundColor: myOrg.coverColor + "22" }]}>
        <Feather name="map" size={20} color={myOrg.coverColor} />
      </View>
      <View style={{ flex: 1, gap: 3 }}>
        <Text style={[orgStyles.listingTitle, { color: colors.foreground }]} numberOfLines={1}>{item.title}</Text>
        <Text style={[orgStyles.listingMeta, { color: colors.mutedForeground }]}>{item.city} · {item.days} days</Text>
      </View>
      <Text style={[orgStyles.listingPrice, { color: myOrg.coverColor }]}>EGP {item.priceEGP.toLocaleString()}</Text>
    </TouchableOpacity>
  );

  const renderReview = ({ item }: { item: Review }) => (
    <View style={[orgStyles.reviewCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={orgStyles.reviewHeader}>
        <View style={[orgStyles.reviewAvatar, { backgroundColor: myOrg.coverColor + "22" }]}>
          <Text style={[orgStyles.reviewInitial, { color: myOrg.coverColor }]}>{item.reviewerName.charAt(0)}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[orgStyles.reviewName, { color: colors.foreground }]}>{item.reviewerName}</Text>
          <Text style={[orgStyles.reviewDate, { color: colors.mutedForeground }]}>{new Date(item.createdAt).toLocaleDateString("en-EG", { day: "numeric", month: "short", year: "numeric" })}</Text>
        </View>
        {renderStars(item.stars)}
      </View>
      <Text style={[orgStyles.reviewComment, { color: colors.foreground }]}>{item.comment}</Text>
    </View>
  );

  return (
    <View style={[orgStyles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: bottomPad + 20 }}>
        {photos.coverUri ? (
          <ImageBackground source={{ uri: photos.coverUri }} style={[orgStyles.coverBand, { paddingTop: topPad }]} resizeMode="cover">
            <View style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(0,0,0,0.28)" }]} />
            <Text style={orgStyles.coverPageTitle}>Profile</Text>
            <TouchableOpacity style={orgStyles.coverEditBtn} onPress={() => pickImage("cover")} activeOpacity={0.85}>
              <Feather name="camera" size={15} color="#fff" />
              <Text style={orgStyles.coverEditText}>Change Cover</Text>
            </TouchableOpacity>
          </ImageBackground>
        ) : (
          <View style={[orgStyles.coverBand, { backgroundColor: myOrg.coverColor, paddingTop: topPad }]}>
            <Text style={orgStyles.coverPageTitle}>Profile</Text>
            <TouchableOpacity style={orgStyles.coverEditBtn} onPress={() => pickImage("cover")} activeOpacity={0.85}>
              <Feather name="camera" size={15} color="#fff" />
              <Text style={orgStyles.coverEditText}>Change Cover</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={orgStyles.profileSection}>
          <View style={{ position: "relative" }}>
            {photos.profileUri ? (
              <Image source={{ uri: photos.profileUri }} style={[orgStyles.avatarCircle, { borderColor: colors.background }]} />
            ) : (
              <View style={[orgStyles.avatarCircle, { backgroundColor: myOrg.avatarColor, borderColor: colors.background }]}>
                <Feather name={myOrg.type === "lounge" ? "coffee" : "map"} size={36} color="#fff" />
              </View>
            )}
            <TouchableOpacity style={[orgStyles.avatarEditBtn, { backgroundColor: myOrg.coverColor }]} onPress={() => pickImage("profile")} activeOpacity={0.85}>
              <Feather name="camera" size={13} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={orgStyles.profileActions}>
            <TouchableOpacity
              style={[orgStyles.editProfileBtn, { backgroundColor: myOrg.coverColor }]}
              onPress={() => { setEditing(!editing); setName(user.name); setPhone(user.phone); setUsername(user.username || ""); }}
              activeOpacity={0.85}
            >
              <Feather name="edit-2" size={14} color="#fff" />
              <Text style={orgStyles.editProfileBtnText}>{editing ? "Cancel" : "Edit Profile"}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={orgStyles.nameSection}>
          <View style={orgStyles.nameRow}>
            <Text style={[orgStyles.orgName, { color: colors.foreground }]}>{myOrg.name}</Text>
            {isVerifiedBadge && (
              <View style={[orgStyles.verifiedBadge, { backgroundColor: myOrg.coverColor }]}>
                <Feather name="check" size={11} color="#fff" />
              </View>
            )}
          </View>
          <Text style={[orgStyles.usernameHandle, { color: myOrg.coverColor }]}>@{user.username || user.name}</Text>
          <View style={orgStyles.typePill}>
            <Feather name={myOrg.type === "lounge" ? "coffee" : "map"} size={12} color={myOrg.coverColor} />
            <Text style={[orgStyles.typeText, { color: myOrg.coverColor }]}>
              {myOrg.type === "lounge" ? "Lounge & Events" : "Trip Planner"}
            </Text>
          </View>
          <Text style={[orgStyles.cityText, { color: colors.mutedForeground }]}>
            {myOrg.city}
          </Text>
          <Text style={[orgStyles.bioText, { color: colors.foreground }]}>{myOrg.bio}</Text>
        </View>

        {editing && (
          <View style={[orgStyles.editCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[orgStyles.editCardTitle, { color: colors.foreground }]}>Edit Profile</Text>
            <View style={orgStyles.editField}>
              <Text style={[orgStyles.editLabel, { color: colors.mutedForeground }]}>Display Name</Text>
              <TextInput style={[orgStyles.editInput, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.muted }]} value={name} onChangeText={setName} placeholder="Your name" placeholderTextColor={colors.mutedForeground} />
            </View>
            <View style={orgStyles.editField}>
              <Text style={[orgStyles.editLabel, { color: colors.mutedForeground }]}>Username</Text>
              <View style={[orgStyles.usernameRow, { borderColor: usernameError ? "#f87171" : colors.border, backgroundColor: colors.muted }]}>
                <Text style={[orgStyles.atPrefix, { color: colors.primary }]}>@</Text>
                <TextInput style={[orgStyles.usernameInput, { color: colors.foreground }]} value={username} onChangeText={handleUsernameChange} placeholder="yourhandle" placeholderTextColor={colors.mutedForeground} autoCapitalize="none" autoCorrect={false} maxLength={20} />
              </View>
              {usernameError ? <Text style={orgStyles.fieldError}>{usernameError}</Text> : null}
            </View>
            <View style={orgStyles.editField}>
              <Text style={[orgStyles.editLabel, { color: colors.mutedForeground }]}>Phone</Text>
              <TextInput style={[orgStyles.editInput, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.muted }]} value={phone} onChangeText={setPhone} placeholder="+20 XXX XXX XXXX" placeholderTextColor={colors.mutedForeground} keyboardType="phone-pad" />
            </View>
            <TouchableOpacity style={[orgStyles.saveBtn, { backgroundColor: myOrg.coverColor }]} onPress={handleSave}>
              <Feather name="check" size={16} color="#fff" />
              <Text style={orgStyles.saveBtnText}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={[orgStyles.statsRow, { borderColor: colors.border }]}>
          <View style={orgStyles.statItem}>
            <Text style={[orgStyles.statValue, { color: colors.foreground }]}>{formatFollowers(followerCount)}</Text>
            <Text style={[orgStyles.statLabel, { color: colors.mutedForeground }]}>Followers</Text>
          </View>
          <View style={[orgStyles.statDivider, { backgroundColor: colors.border }]} />
          <View style={orgStyles.statItem}>
            <Text style={[orgStyles.statValue, { color: colors.foreground }]}>{listingCount}</Text>
            <Text style={[orgStyles.statLabel, { color: colors.mutedForeground }]}>{myOrg.type === "lounge" ? "Events" : "Trips"}</Text>
          </View>
          <View style={[orgStyles.statDivider, { backgroundColor: colors.border }]} />
          <View style={orgStyles.statItem}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
              <Feather name="star" size={14} color="#f59e0b" />
              <Text style={[orgStyles.statValue, { color: colors.foreground }]}>{reviewCount > 0 ? rating.toFixed(1) : "—"}</Text>
            </View>
            <Text style={[orgStyles.statLabel, { color: colors.mutedForeground }]}>{reviewCount} reviews</Text>
          </View>
        </View>

        <View style={[orgStyles.tabs, { borderBottomColor: colors.border }]}>
          {(["events", "reviews"] as Tab[]).map(tab => (
            <TouchableOpacity key={tab} style={[orgStyles.tab, activeTab === tab && { borderBottomColor: myOrg.coverColor, borderBottomWidth: 2.5 }]} onPress={() => setActiveTab(tab)}>
              <Text style={[orgStyles.tabText, { color: activeTab === tab ? myOrg.coverColor : colors.mutedForeground }]}>
                {tab === "events" ? (myOrg.type === "lounge" ? "Events" : "Trips") : "Reviews"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={orgStyles.tabContent}>
          {activeTab === "events" && (
            (myOrg.type === "lounge" ? orgEvents : orgTrips).length === 0 ? (
              <View style={[orgStyles.emptyTab, { backgroundColor: colors.muted }]}>
                <Feather name={myOrg.type === "lounge" ? "calendar" : "map"} size={32} color={colors.mutedForeground} />
                <Text style={[orgStyles.emptyTabText, { color: colors.mutedForeground }]}>No listings yet</Text>
              </View>
            ) : (
              <FlatList
                data={(myOrg.type === "lounge" ? orgEvents : orgTrips) as any[]}
                keyExtractor={(item: any) => item.id}
                renderItem={myOrg.type === "lounge" ? renderEventItem as any : renderTripItem as any}
                scrollEnabled={false}
                contentContainerStyle={{ gap: 10, paddingHorizontal: 16, paddingTop: 12 }}
              />
            )
          )}
          {activeTab === "reviews" && (
            <View style={{ paddingHorizontal: 16, paddingTop: 12 }}>
              {!showReviewForm ? (
                <TouchableOpacity style={[orgStyles.writeReviewBtn, { borderColor: myOrg.coverColor, backgroundColor: myOrg.coverColor + "12" }]} onPress={() => setShowReviewForm(true)} activeOpacity={0.85}>
                  <Feather name="edit-3" size={16} color={myOrg.coverColor} />
                  <Text style={[orgStyles.writeReviewText, { color: myOrg.coverColor }]}>Write a Review</Text>
                </TouchableOpacity>
              ) : (
                <View style={[orgStyles.reviewForm, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Text style={[orgStyles.reviewFormTitle, { color: colors.foreground }]}>Your Review</Text>
                  <View style={orgStyles.starsRow}>
                    <Text style={[orgStyles.starsLabel, { color: colors.mutedForeground }]}>Rating:</Text>
                    {renderStars(reviewStars, 28, true, setReviewStars)}
                  </View>
                  <TextInput style={[orgStyles.reviewInput, { backgroundColor: colors.muted, borderColor: colors.border, color: colors.foreground }]} placeholder="Share your experience..." placeholderTextColor={colors.mutedForeground} value={reviewComment} onChangeText={setReviewComment} multiline numberOfLines={4} textAlignVertical="top" />
                  <View style={orgStyles.reviewFormBtns}>
                    <TouchableOpacity style={[orgStyles.cancelBtn, { borderColor: colors.border }]} onPress={() => { setShowReviewForm(false); setReviewComment(""); setReviewStars(5); }}>
                      <Text style={[orgStyles.cancelBtnText, { color: colors.mutedForeground }]}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[orgStyles.submitBtn, { backgroundColor: myOrg.coverColor }]} onPress={handleSubmitReview}>
                      <Text style={orgStyles.submitBtnText}>Submit</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
              {orgReviews.length === 0 ? (
                <View style={[orgStyles.emptyTab, { backgroundColor: colors.muted, marginTop: 12 }]}>
                  <Feather name="star" size={32} color={colors.mutedForeground} />
                  <Text style={[orgStyles.emptyTabText, { color: colors.mutedForeground }]}>No reviews yet</Text>
                </View>
              ) : (
                <FlatList data={orgReviews} keyExtractor={(item: any) => item.id} renderItem={renderReview} scrollEnabled={false} contentContainerStyle={{ gap: 10, paddingTop: 12 }} />
              )}
            </View>
          )}
        </View>

        <View style={[orgStyles.settingsSection, { borderTopColor: colors.border }]}>
          <Text style={[orgStyles.settingsSectionTitle, { color: colors.mutedForeground }]}>SETTINGS</Text>

          <View style={[orgStyles.settingsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[orgStyles.settingsLabel, { color: colors.foreground }]}>Currency</Text>
            <View style={orgStyles.currencyRow}>
              <TouchableOpacity style={[orgStyles.currencyBtn, { backgroundColor: currency === "EGP" ? myOrg.coverColor : colors.muted }]} onPress={() => setCurrency("EGP")}>
                <Text style={[orgStyles.currencyBtnText, { color: currency === "EGP" ? "#fff" : colors.mutedForeground }]}>EGP</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[orgStyles.currencyBtn, { backgroundColor: currency === "USD" ? myOrg.coverColor : colors.muted }]} onPress={() => setCurrency("USD")}>
                <Text style={[orgStyles.currencyBtnText, { color: currency === "USD" ? "#fff" : colors.mutedForeground }]}>USD</Text>
              </TouchableOpacity>
            </View>
          </View>

          {user.role === "trip_planner" && (
            <View style={[orgStyles.settingsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={orgStyles.settingsRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[orgStyles.settingsLabel, { color: colors.foreground }]}>Account Verification</Text>
                  <Text style={[orgStyles.settingsSub, { color: colors.mutedForeground }]}>Required for verified badge</Text>
                </View>
                {user.isVerified ? (
                  <View style={[orgStyles.badgePill, { backgroundColor: colors.success + "18" }]}>
                    <Feather name="shield" size={12} color={colors.success} />
                    <Text style={[orgStyles.badgePillText, { color: colors.success }]}>Verified</Text>
                  </View>
                ) : (
                  <TouchableOpacity style={[orgStyles.settingsBtn, { backgroundColor: colors.success }]} onPress={() => router.push("/verify")}>
                    <Text style={orgStyles.settingsBtnText}>Verify Now</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}

          {user.role === "trip_planner" && (
            <View style={[orgStyles.settingsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={orgStyles.settingsRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[orgStyles.settingsLabel, { color: colors.foreground }]}>Planner Subscription</Text>
                  <Text style={[orgStyles.settingsSub, { color: colors.mutedForeground }]}>
                    {isPlannerSub ? `Active until ${subExpiry}` : "50 EGP / month"}
                  </Text>
                </View>
                {isPlannerSub ? (
                  <View style={[orgStyles.badgePill, { backgroundColor: colors.success + "18" }]}>
                    <View style={[orgStyles.activeDot, { backgroundColor: colors.success }]} />
                    <Text style={[orgStyles.badgePillText, { color: colors.success }]}>Active</Text>
                  </View>
                ) : (
                  <TouchableOpacity style={[orgStyles.settingsBtn, { backgroundColor: myOrg.coverColor }]} onPress={() => router.push("/planner-subscribe")}>
                    <Text style={orgStyles.settingsBtnText}>Subscribe</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}

          {purchasedTickets.length > 0 && (
            <View style={[orgStyles.settingsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[orgStyles.settingsLabel, { color: colors.foreground }]}>Purchased Tickets</Text>
              {purchasedTickets.map((ticket: any) => (
                <View key={ticket.id} style={[orgStyles.ticketRow, { backgroundColor: colors.muted }]}>
                  <Feather name="tag" size={14} color={myOrg.coverColor} />
                  <View style={{ flex: 1 }}>
                    <Text style={[orgStyles.ticketTitle, { color: colors.foreground }]} numberOfLines={1}>{ticket.eventTitle}</Text>
                    <Text style={[orgStyles.ticketMeta, { color: colors.mutedForeground }]}>{ticket.quantity} ticket{ticket.quantity > 1 ? "s" : ""}</Text>
                  </View>
                  <Text style={[orgStyles.ticketPrice, { color: myOrg.coverColor }]}>EGP {ticket.priceEGP.toLocaleString()}</Text>
                </View>
              ))}
            </View>
          )}

          <TouchableOpacity style={[orgStyles.logoutBtn, { borderColor: colors.destructive }]} onPress={handleLogout}>
            <Feather name="log-out" size={16} color={colors.destructive} />
            <Text style={[orgStyles.logoutText, { color: colors.destructive }]}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const COVER_HEIGHT = 160;
const AVATAR_SIZE = 88;
const AVATAR_OFFSET = AVATAR_SIZE / 2;

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { gap: 16, paddingHorizontal: 16 },
  pageTitle: { fontSize: 32, fontWeight: "800", letterSpacing: -0.5 },
  heroCard: { borderRadius: 20, borderWidth: 1, overflow: "hidden", marginTop: 8 },
  coverWrap: { height: COVER_HEIGHT, position: "relative" },
  coverImage: { width: "100%", height: "100%" },
  coverGradient: { width: "100%", height: "100%" },
  coverEditBtn: { position: "absolute", bottom: 10, right: 12, flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "rgba(0,0,0,0.5)", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.25)" },
  coverEditText: { fontSize: 12, fontWeight: "700", color: "#fff" },
  avatarRow: { flexDirection: "row", alignItems: "flex-end", paddingHorizontal: 16, paddingBottom: 16, marginTop: -AVATAR_OFFSET, gap: 14 },
  avatarWrap: { position: "relative", width: AVATAR_SIZE, height: AVATAR_SIZE },
  avatarImage: { width: AVATAR_SIZE, height: AVATAR_SIZE, borderRadius: AVATAR_SIZE / 2, borderWidth: 3, borderColor: "#fff" },
  avatarFallback: { width: AVATAR_SIZE, height: AVATAR_SIZE, borderRadius: AVATAR_SIZE / 2, alignItems: "center", justifyContent: "center", borderWidth: 3, borderColor: "#fff" },
  avatarInitials: { fontSize: 30, fontWeight: "800", color: "#fff" },
  avatarCameraBtn: { position: "absolute", bottom: 4, right: 4, width: 24, height: 24, borderRadius: 12, alignItems: "center", justifyContent: "center", borderWidth: 2 },
  providerBadge: { position: "absolute", top: 2, left: 2, width: 20, height: 20, borderRadius: 10, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "#fff" },
  providerBadgeText: { fontSize: 9, fontWeight: "900", color: "#fff" },
  heroMeta: { flex: 1, gap: 2, paddingBottom: 4 },
  heroName: { fontSize: 20, fontWeight: "800" },
  heroUsername: { fontSize: 15, fontWeight: "700" },
  heroEmail: { fontSize: 12 },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, paddingHorizontal: 16, paddingBottom: 14 },
  roleChip: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  roleDot: { width: 7, height: 7, borderRadius: 4 },
  roleText: { fontSize: 12, fontWeight: "700" },
  verifiedChip: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  verifiedText: { fontSize: 12, fontWeight: "700" },
  card: { borderRadius: 16, borderWidth: 1, padding: 18, gap: 14 },
  cardHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  cardTitle: { fontSize: 17, fontWeight: "700" },
  field: { gap: 6 },
  fieldLabel: { fontSize: 12, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5 },
  fieldValue: { fontSize: 15 },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15 },
  usernameRow: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10 },
  atPrefix: { fontSize: 16, fontWeight: "700", marginRight: 2 },
  usernameInput: { flex: 1, fontSize: 15 },
  fieldError: { fontSize: 12, color: "#f87171", marginTop: 2 },
  emailRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  providerPill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  providerPillText: { fontSize: 11, fontWeight: "700" },
  saveBtn: { borderRadius: 12, paddingVertical: 12, alignItems: "center", marginTop: 4 },
  saveBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  currencyRow: { flexDirection: "row", gap: 10 },
  currencyBtn: { flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: "center" },
  currencyBtnText: { fontWeight: "700", fontSize: 15 },
  logoutBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 14, borderRadius: 14, borderWidth: 1.5 },
  logoutText: { fontWeight: "700", fontSize: 15 },
});

const orgStyles = StyleSheet.create({
  container: { flex: 1 },
  coverBand: { height: 150, flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", paddingHorizontal: 16, paddingBottom: 14, overflow: "hidden" },
  coverPageTitle: { fontSize: 26, fontWeight: "800", color: "#fff", letterSpacing: -0.5, textShadowColor: "rgba(0,0,0,0.4)", textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 6 },
  coverEditBtn: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "rgba(0,0,0,0.45)", paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20 },
  coverEditText: { color: "#fff", fontSize: 13, fontWeight: "600" },
  profileSection: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", paddingHorizontal: 16, marginTop: -44, marginBottom: 12 },
  avatarCircle: { width: 88, height: 88, borderRadius: 44, borderWidth: 4, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  avatarEditBtn: { position: "absolute", bottom: 2, right: 2, width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "#fff" },
  profileActions: { flexDirection: "row", gap: 10, alignItems: "center", marginTop: 40 },
  editProfileBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 18, paddingVertical: 9, borderRadius: 22 },
  editProfileBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  nameSection: { paddingHorizontal: 16, gap: 5, marginBottom: 16 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  orgName: { fontSize: 22, fontWeight: "800", letterSpacing: -0.5 },
  usernameHandle: { fontSize: 14, fontWeight: "700" },
  verifiedBadge: { width: 22, height: 22, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  typePill: { flexDirection: "row", alignItems: "center", gap: 5 },
  typeText: { fontSize: 13, fontWeight: "600" },
  cityText: { fontSize: 13 },
  bioText: { fontSize: 14, lineHeight: 20 },
  editCard: { marginHorizontal: 16, borderRadius: 16, borderWidth: 1, padding: 18, gap: 14, marginBottom: 16 },
  editCardTitle: { fontSize: 17, fontWeight: "700" },
  editField: { gap: 6 },
  editLabel: { fontSize: 12, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5 },
  editInput: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15 },
  usernameRow: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10 },
  atPrefix: { fontSize: 16, fontWeight: "700", marginRight: 2 },
  usernameInput: { flex: 1, fontSize: 15 },
  fieldError: { fontSize: 12, color: "#f87171", marginTop: 2 },
  saveBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 12, paddingVertical: 12, marginTop: 4 },
  saveBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  statsRow: { flexDirection: "row", borderTopWidth: 1, borderBottomWidth: 1, paddingVertical: 16, marginBottom: 0 },
  statItem: { flex: 1, alignItems: "center", gap: 3 },
  statValue: { fontSize: 20, fontWeight: "800" },
  statLabel: { fontSize: 12 },
  statDivider: { width: 1, marginVertical: 4 },
  tabs: { flexDirection: "row", borderBottomWidth: 1, marginTop: 0 },
  tab: { flex: 1, paddingVertical: 14, alignItems: "center" },
  tabText: { fontSize: 14, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5 },
  tabContent: { minHeight: 120 },
  listingCard: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 14, borderWidth: 1 },
  listingLeft: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  listingTitle: { fontSize: 14, fontWeight: "700" },
  listingMeta: { fontSize: 12 },
  listingPrice: { fontSize: 13, fontWeight: "700" },
  emptyTab: { margin: 16, borderRadius: 16, padding: 32, alignItems: "center", gap: 10 },
  emptyTabText: { fontSize: 14 },
  writeReviewBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 12, borderRadius: 12, borderWidth: 1.5, marginBottom: 8 },
  writeReviewText: { fontWeight: "700", fontSize: 15 },
  reviewForm: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 12, marginBottom: 12 },
  reviewFormTitle: { fontSize: 16, fontWeight: "700" },
  starsRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  starsLabel: { fontSize: 14 },
  reviewInput: { borderWidth: 1, borderRadius: 12, padding: 12, fontSize: 14, minHeight: 90 },
  reviewFormBtns: { flexDirection: "row", gap: 10 },
  cancelBtn: { flex: 1, paddingVertical: 11, borderRadius: 12, borderWidth: 1.5, alignItems: "center" },
  cancelBtnText: { fontWeight: "600", fontSize: 14 },
  submitBtn: { flex: 2, paddingVertical: 11, borderRadius: 12, alignItems: "center" },
  submitBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  reviewCard: { borderRadius: 14, borderWidth: 1, padding: 14, gap: 8 },
  reviewHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  reviewAvatar: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  reviewInitial: { fontSize: 15, fontWeight: "800" },
  reviewName: { fontSize: 14, fontWeight: "700" },
  reviewDate: { fontSize: 11 },
  reviewComment: { fontSize: 13, lineHeight: 19 },
  settingsSection: { marginTop: 24, borderTopWidth: 1, paddingTop: 24, paddingHorizontal: 16, gap: 12, paddingBottom: 8 },
  settingsSectionTitle: { fontSize: 11, fontWeight: "700", letterSpacing: 1, textTransform: "uppercase" },
  settingsCard: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 12 },
  settingsRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  settingsLabel: { fontSize: 15, fontWeight: "700" },
  settingsSub: { fontSize: 12, marginTop: 2 },
  settingsBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  settingsBtnText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  badgePill: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  activeDot: { width: 7, height: 7, borderRadius: 4 },
  badgePillText: { fontSize: 12, fontWeight: "700" },
  currencyRow: { flexDirection: "row", gap: 10 },
  currencyBtn: { flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: "center" },
  currencyBtnText: { fontWeight: "700", fontSize: 15 },
  ticketRow: { flexDirection: "row", alignItems: "center", gap: 10, padding: 12, borderRadius: 12 },
  ticketTitle: { fontSize: 13, fontWeight: "600" },
  ticketMeta: { fontSize: 11 },
  ticketPrice: { fontSize: 13, fontWeight: "700" },
  logoutBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 14, borderRadius: 14, borderWidth: 1.5 },
  logoutText: { fontWeight: "700", fontSize: 15 },
});
