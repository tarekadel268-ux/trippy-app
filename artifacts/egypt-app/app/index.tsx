import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ImageBackground,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Nationality, OrganizerProfile, UserProfile, UserRole, useApp } from "@/contexts/AppContext";

type Step = "auth" | "nationality" | "role" | "username";

interface AuthDraft {
  name: string;
  email: string;
  provider: "google" | "apple";
}

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const { setUser, setOnboarded, addOrganizer, setMyOrganizerId } = useApp();
  const router = useRouter();

  const [step, setStep] = useState<Step>("auth");
  const [authDraft, setAuthDraft] = useState<AuthDraft | null>(null);
  const [nationality, setNationality] = useState<Nationality | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [username, setUsername] = useState("");
  const [usernameError, setUsernameError] = useState("");

  const [signInModal, setSignInModal] = useState<"google" | "apple" | null>(null);
  const [modalName, setModalName] = useState("");
  const [modalEmail, setModalEmail] = useState("");

  const topPad = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const openSignIn = (provider: "google" | "apple") => {
    Haptics.selectionAsync();
    setModalName("");
    setModalEmail("");
    setSignInModal(provider);
  };

  const confirmSignIn = () => {
    const name = modalName.trim();
    const email = modalEmail.trim().toLowerCase();
    if (!name) return;
    if (!email || !email.includes("@")) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setAuthDraft({ name, email, provider: signInModal! });
    setSignInModal(null);
    setStep("nationality");
  };

  const handleNationality = (nat: Nationality) => {
    Haptics.selectionAsync();
    setNationality(nat);
    setStep("role");
  };

  const handleRole = (r: UserRole) => {
    Haptics.selectionAsync();
    setRole(r);
    setStep("username");
  };

  const validateUsername = (val: string) => {
    if (val.length < 3) return "Username must be at least 3 characters";
    if (val.length > 20) return "Username must be 20 characters or less";
    if (!/^[a-z0-9_]+$/.test(val)) return "Only lowercase letters, numbers, and underscores allowed";
    return "";
  };

  const handleUsernameChange = (val: string) => {
    const clean = val.toLowerCase().replace(/[^a-z0-9_]/g, "");
    setUsername(clean);
    if (clean.length > 0) setUsernameError(validateUsername(clean));
    else setUsernameError("");
  };

  const handleFinish = async () => {
    const err = validateUsername(username);
    if (err) { setUsernameError(err); return; }
    if (!authDraft || !nationality || !role) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const userId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const profile: UserProfile = {
      id: userId,
      nationality,
      role,
      name: authDraft.name,
      username,
      email: authDraft.email,
      avatarUrl: undefined,
      phone: "",
      isVerified: false,
      subscriptionExpiry: null,
      currency: nationality === "egyptian" ? "EGP" : "USD",
      followedOrganizers: [],
      authProvider: authDraft.provider,
    };
    await setUser(profile);

    if (role === "trip_planner" || role === "ticket_holder") {
      const orgId = `org_user_${userId}`;
      const newOrg: OrganizerProfile = {
        id: orgId,
        name: authDraft.name,
        type: role === "trip_planner" ? "trip_planner" : "lounge",
        bio: "",
        city: "",
        phone: "",
        isVerified: false,
        subscriptionActive: false,
        coverColor: role === "trip_planner" ? "#0abab5" : "#e06848",
        avatarColor: role === "trip_planner" ? "#0abab5" : "#e06848",
        instagram: `@${username}`,
      };
      await addOrganizer(newOrg);
      await setMyOrganizerId(orgId);
    }

    await setOnboarded(true);
    router.replace("/(tabs)/trips");
  };

  return (
    <ImageBackground
      source={require("@/assets/images/pyramids-bg.jpeg")}
      style={styles.bg}
      resizeMode="cover"
    >
      <View style={styles.overlay} />

      <Modal
        visible={signInModal !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setSignInModal(null)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalWrap}
        >
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <View style={styles.modalProviderRow}>
              {signInModal === "google" ? (
                <View style={[styles.providerIcon, { backgroundColor: "#fff" }]}>
                  <Text style={styles.gLetter}>G</Text>
                </View>
              ) : (
                <View style={[styles.providerIcon, { backgroundColor: "#000" }]}>
                  <Feather name="smartphone" size={20} color="#fff" />
                </View>
              )}
              <Text style={styles.modalTitle}>
                Continue with {signInModal === "google" ? "Google" : "Apple"}
              </Text>
            </View>
            <Text style={styles.modalSub}>
              Enter the details from your {signInModal === "google" ? "Google" : "Apple"} account
            </Text>

            <View style={styles.modalField}>
              <Text style={styles.modalLabel}>Full Name</Text>
              <TextInput
                style={styles.modalInput}
                value={modalName}
                onChangeText={setModalName}
                placeholder="Your full name"
                placeholderTextColor="#999"
                autoCapitalize="words"
                returnKeyType="next"
              />
            </View>
            <View style={styles.modalField}>
              <Text style={styles.modalLabel}>
                {signInModal === "google" ? "Gmail Address" : "Apple ID Email"}
              </Text>
              <TextInput
                style={styles.modalInput}
                value={modalEmail}
                onChangeText={setModalEmail}
                placeholder={signInModal === "google" ? "you@gmail.com" : "you@icloud.com"}
                placeholderTextColor="#999"
                keyboardType="email-address"
                autoCapitalize="none"
                returnKeyType="done"
                onSubmitEditing={confirmSignIn}
              />
            </View>

            <TouchableOpacity
              style={[
                styles.modalConfirm,
                { backgroundColor: signInModal === "google" ? "#4285F4" : "#000" },
                (!modalName.trim() || !modalEmail.trim()) && styles.modalConfirmDisabled,
              ]}
              onPress={confirmSignIn}
              disabled={!modalName.trim() || !modalEmail.trim()}
            >
              <Text style={styles.modalConfirmText}>Continue</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalCancel} onPress={() => setSignInModal(null)}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: topPad + 40, paddingBottom: bottomPad + 40 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.logoWrap}>
          <Text style={styles.appName}>Egypt Events & Trips</Text>
          <Text style={styles.tagline}>Discover authentic Egypt</Text>
        </View>

        {step === "auth" && (
          <View style={styles.stepWrap}>
            <Text style={styles.stepTitle}>Create your account</Text>
            <Text style={styles.stepSub}>Sign in to discover events, buy tickets, and connect with planners across Egypt</Text>

            <TouchableOpacity
              style={styles.googleBtn}
              onPress={() => openSignIn("google")}
              activeOpacity={0.9}
            >
              <View style={styles.googleIconWrap}>
                <Text style={styles.gLetterBtn}>G</Text>
              </View>
              <Text style={styles.googleBtnText}>Continue with Google</Text>
            </TouchableOpacity>

            {Platform.OS === "ios" && (
              <TouchableOpacity
                style={styles.appleBtn}
                onPress={() => openSignIn("apple")}
                activeOpacity={0.9}
              >
                <Feather name="smartphone" size={20} color="#fff" style={{ marginRight: 4 }} />
                <Text style={styles.appleBtnText}>Continue with Apple</Text>
              </TouchableOpacity>
            )}

            {Platform.OS !== "ios" && (
              <TouchableOpacity
                style={styles.appleBtn}
                onPress={() => openSignIn("apple")}
                activeOpacity={0.9}
              >
                <Feather name="log-in" size={20} color="#fff" style={{ marginRight: 4 }} />
                <Text style={styles.appleBtnText}>Continue with Apple ID</Text>
              </TouchableOpacity>
            )}

            <Text style={styles.termsText}>
              By continuing, you agree to our Terms of Service and Privacy Policy
            </Text>
          </View>
        )}

        {step === "nationality" && (
          <View style={styles.stepWrap}>
            <View style={styles.stepProgressRow}>
              {[1, 2, 3].map(n => (
                <View key={n} style={[styles.stepDot, n === 1 && styles.stepDotActive]} />
              ))}
            </View>
            <Text style={styles.stepTitle}>Where are you from?</Text>
            <Text style={styles.stepSub}>This helps us tailor your experience</Text>

            <TouchableOpacity
              style={styles.optionCard}
              onPress={() => handleNationality("egyptian")}
              activeOpacity={0.85}
            >
              <View style={styles.flagCircle}>
                <Text style={styles.flagText}>🇪🇬</Text>
              </View>
              <View style={styles.optionText}>
                <Text style={styles.optionTitle}>Egyptian Resident</Text>
                <Text style={styles.optionDesc}>I live in Egypt</Text>
              </View>
              <Feather name="chevron-right" size={20} color="rgba(255,255,255,0.6)" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.optionCard}
              onPress={() => handleNationality("tourist")}
              activeOpacity={0.85}
            >
              <View style={[styles.flagCircle, { backgroundColor: "rgba(10,186,181,0.35)" }]}>
                <Feather name="globe" size={24} color="#0abab5" />
              </View>
              <View style={styles.optionText}>
                <Text style={styles.optionTitle}>International Tourist</Text>
                <Text style={styles.optionDesc}>I'm visiting Egypt</Text>
              </View>
              <Feather name="chevron-right" size={20} color="rgba(255,255,255,0.6)" />
            </TouchableOpacity>
          </View>
        )}

        {step === "role" && (
          <View style={styles.stepWrap}>
            <View style={styles.stepProgressRow}>
              {[1, 2, 3].map(n => (
                <View key={n} style={[styles.stepDot, n <= 2 && styles.stepDotActive]} />
              ))}
            </View>
            <TouchableOpacity style={styles.backBtn} onPress={() => setStep("nationality")}>
              <Feather name="arrow-left" size={18} color="rgba(255,255,255,0.7)" />
              <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>
            <Text style={styles.stepTitle}>What brings you here?</Text>
            <Text style={styles.stepSub}>Choose your role — this cannot be changed later</Text>

            {nationality === "egyptian" && (
              <>
                <TouchableOpacity style={styles.roleCard} onPress={() => handleRole("ticket_holder")} activeOpacity={0.85}>
                  <View style={[styles.roleIcon, { backgroundColor: "rgba(224,104,72,0.25)" }]}>
                    <Feather name="tag" size={26} color="#ff8c6e" />
                  </View>
                  <Text style={styles.roleTitle}>Ticket Holder</Text>
                  <Text style={styles.roleDesc}>List event tickets you can't use — concerts, parties, and more</Text>
                  <View style={styles.roleFeatures}>
                    <Text style={styles.featureItem}>• List your tickets for free</Text>
                    <Text style={styles.featureItem}>• In-app chat with buyers</Text>
                    <Text style={styles.featureItem}>• Build your organizer profile</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity style={styles.roleCard} onPress={() => handleRole("trip_planner")} activeOpacity={0.85}>
                  <View style={[styles.roleIcon, { backgroundColor: "rgba(10,186,181,0.25)" }]}>
                    <Feather name="map" size={26} color="#0abab5" />
                  </View>
                  <Text style={styles.roleTitle}>Events Planner</Text>
                  <Text style={styles.roleDesc}>Organize and list trips & events across Egypt's top destinations</Text>
                  <View style={styles.roleFeatures}>
                    <Text style={styles.featureItem}>• Verify with Egyptian ID</Text>
                    <Text style={styles.featureItem}>• Build your public organizer profile</Text>
                    <Text style={styles.featureItem}>• Get followed by users</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity style={styles.roleCard} onPress={() => handleRole("resident_viewer")} activeOpacity={0.85}>
                  <View style={[styles.roleIcon, { backgroundColor: "rgba(255,205,70,0.2)" }]}>
                    <Feather name="eye" size={26} color="#f5c842" />
                  </View>
                  <Text style={styles.roleTitle}>View Events & Tickets</Text>
                  <Text style={styles.roleDesc}>Browse events, buy tickets, and discover trips around Egypt</Text>
                  <View style={styles.roleFeatures}>
                    <Text style={styles.featureItem}>• Browse all events & trips</Text>
                    <Text style={styles.featureItem}>• Purchase tickets in-app</Text>
                    <Text style={styles.featureItem}>• Follow your favourite planners</Text>
                  </View>
                </TouchableOpacity>
              </>
            )}

            {nationality === "tourist" && (
              <TouchableOpacity style={styles.roleCard} onPress={() => handleRole("tourist_viewer")} activeOpacity={0.85}>
                <View style={[styles.roleIcon, { backgroundColor: "rgba(10,186,181,0.25)" }]}>
                  <Feather name="compass" size={26} color="#0abab5" />
                </View>
                <Text style={styles.roleTitle}>Tourist Explorer</Text>
                <Text style={styles.roleDesc}>Browse verified trip packages and authentic events across Egypt</Text>
                <View style={styles.roleFeatures}>
                  <Text style={styles.featureItem}>• Browse all events & trips</Text>
                  <Text style={styles.featureItem}>• Follow your favourite planners</Text>
                  <Text style={styles.featureItem}>• Review & rate experiences</Text>
                </View>
              </TouchableOpacity>
            )}
          </View>
        )}

        {step === "username" && (
          <View style={styles.stepWrap}>
            <View style={styles.stepProgressRow}>
              {[1, 2, 3].map(n => (
                <View key={n} style={[styles.stepDot, styles.stepDotActive]} />
              ))}
            </View>
            <TouchableOpacity style={styles.backBtn} onPress={() => setStep("role")}>
              <Feather name="arrow-left" size={18} color="rgba(255,255,255,0.7)" />
              <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>
            <Text style={styles.stepTitle}>Choose your username</Text>
            <Text style={styles.stepSub}>
              {role === "trip_planner"
                ? "This becomes your public organizer handle — how people find and follow you"
                : "This is how you appear on Egypt Events & Trips"}
            </Text>

            <View style={styles.usernameWrap}>
              <View style={styles.usernameInputRow}>
                <View style={styles.atWrap}>
                  <Text style={styles.atSign}>@</Text>
                </View>
                <TextInput
                  style={styles.usernameInput}
                  value={username}
                  onChangeText={handleUsernameChange}
                  placeholder="yourhandle"
                  placeholderTextColor="rgba(255,255,255,0.35)"
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="done"
                  onSubmitEditing={handleFinish}
                  maxLength={20}
                />
              </View>
              {usernameError ? (
                <View style={styles.errorRow}>
                  <Feather name="alert-circle" size={13} color="#f87171" />
                  <Text style={styles.errorText}>{usernameError}</Text>
                </View>
              ) : username.length >= 3 ? (
                <View style={styles.successRow}>
                  <Feather name="check-circle" size={13} color="#4ade80" />
                  <Text style={styles.successText}>@{username} looks great!</Text>
                </View>
              ) : null}
              <Text style={styles.usernameHint}>
                3–20 characters · lowercase letters, numbers, underscores only
              </Text>
            </View>

            {role === "trip_planner" && (
              <View style={styles.plannerNotice}>
                <Feather name="map" size={16} color="#0abab5" />
                <Text style={styles.plannerNoticeText}>
                  Your public organizer profile will be created at <Text style={{ color: "#0abab5", fontWeight: "700" }}>@{username || "yourhandle"}</Text>
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={[
                styles.finishBtn,
                (!username || usernameError.length > 0 || username.length < 3) && styles.finishBtnDisabled,
              ]}
              onPress={handleFinish}
              disabled={!username || usernameError.length > 0 || username.length < 3}
              activeOpacity={0.85}
            >
              <Text style={styles.finishBtnText}>Create Account</Text>
              <Feather name="arrow-right" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.62)",
  },
  scroll: { paddingHorizontal: 22 },
  logoWrap: {
    alignItems: "center",
    marginBottom: 44,
    gap: 8,
  },
  appName: {
    fontSize: 32,
    fontWeight: "800",
    color: "#ffffff",
    letterSpacing: -0.5,
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  tagline: {
    fontSize: 15,
    color: "#0abab5",
    fontWeight: "600",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  stepWrap: { gap: 14 },
  stepProgressRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 4,
  },
  stepDot: {
    width: 28,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.25)",
  },
  stepDotActive: {
    backgroundColor: "#0abab5",
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#ffffff",
    letterSpacing: -0.5,
  },
  stepSub: {
    fontSize: 14,
    color: "rgba(255,255,255,0.65)",
    marginBottom: 4,
    lineHeight: 20,
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  backText: {
    fontSize: 14,
    color: "rgba(255,255,255,0.7)",
  },
  googleBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  googleIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#4285F4",
    alignItems: "center",
    justifyContent: "center",
  },
  gLetterBtn: {
    fontSize: 18,
    fontWeight: "800",
    color: "#fff",
    lineHeight: 22,
  },
  googleBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111",
    flex: 1,
    textAlign: "center",
  },
  appleBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#000",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  appleBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
  termsText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.45)",
    textAlign: "center",
    lineHeight: 18,
    marginTop: 6,
  },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    backgroundColor: "rgba(255,255,255,0.1)",
    gap: 14,
  },
  flagCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  flagText: { fontSize: 28 },
  optionText: { flex: 1, gap: 3 },
  optionTitle: { fontSize: 16, fontWeight: "700", color: "#ffffff" },
  optionDesc: { fontSize: 13, color: "rgba(255,255,255,0.6)" },
  roleCard: {
    padding: 20,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    backgroundColor: "rgba(255,255,255,0.1)",
    gap: 10,
  },
  roleIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  roleTitle: { fontSize: 18, fontWeight: "800", color: "#ffffff" },
  roleDesc: { fontSize: 14, lineHeight: 20, color: "rgba(255,255,255,0.7)" },
  roleFeatures: {
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.15)",
    paddingTop: 12,
    gap: 5,
  },
  featureItem: { fontSize: 13, lineHeight: 19, color: "rgba(255,255,255,0.6)" },
  usernameWrap: {
    padding: 20,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    gap: 10,
  },
  usernameInputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
    overflow: "hidden",
  },
  atWrap: {
    width: 44,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(10,186,181,0.25)",
    paddingVertical: 14,
  },
  atSign: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0abab5",
  },
  usernameInput: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },
  errorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  errorText: {
    fontSize: 13,
    color: "#f87171",
  },
  successRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  successText: {
    fontSize: 13,
    color: "#4ade80",
    fontWeight: "600",
  },
  usernameHint: {
    fontSize: 12,
    color: "rgba(255,255,255,0.45)",
    lineHeight: 16,
  },
  plannerNotice: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    padding: 16,
    borderRadius: 14,
    backgroundColor: "rgba(10,186,181,0.15)",
    borderWidth: 1,
    borderColor: "rgba(10,186,181,0.35)",
  },
  plannerNoticeText: {
    flex: 1,
    fontSize: 14,
    color: "rgba(255,255,255,0.85)",
    lineHeight: 20,
  },
  finishBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "#0abab5",
    borderRadius: 16,
    paddingVertical: 17,
    marginTop: 4,
  },
  finishBtnDisabled: {
    backgroundColor: "rgba(10,186,181,0.35)",
  },
  finishBtnText: {
    fontSize: 17,
    fontWeight: "800",
    color: "#fff",
  },
  modalWrap: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalSheet: {
    backgroundColor: "#1a1a1a",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    gap: 14,
    paddingBottom: 40,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignSelf: "center",
    marginBottom: 8,
  },
  modalProviderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  providerIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  gLetter: {
    fontSize: 22,
    fontWeight: "800",
    color: "#4285F4",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#fff",
  },
  modalSub: {
    fontSize: 14,
    color: "rgba(255,255,255,0.55)",
    lineHeight: 20,
  },
  modalField: { gap: 6 },
  modalLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "rgba(255,255,255,0.5)",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  modalInput: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontSize: 16,
    color: "#fff",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  modalConfirm: {
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 4,
  },
  modalConfirmDisabled: {
    opacity: 0.45,
  },
  modalConfirmText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
  modalCancel: {
    paddingVertical: 12,
    alignItems: "center",
  },
  modalCancelText: {
    fontSize: 15,
    color: "rgba(255,255,255,0.5)",
  },
});
