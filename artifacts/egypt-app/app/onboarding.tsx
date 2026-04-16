import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
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
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Nationality, OrganizerProfile, UserProfile, UserRole, useApp } from "@/contexts/AppContext";
import { useTheme } from "@/contexts/ThemeContext";
import { supabase } from "@/lib/supabase";

const BG_DEFAULT = require("@/assets/images/pyramids-bg.jpeg");
const BG_EGYPTIAN = require("@/assets/images/egyptian-bg.jpeg");
const BG_TOURIST = require("@/assets/images/tourist-bg.jpeg");

type Step = "auth" | "nationality" | "role" | "username" | "password";
type AuthMode = "signup" | "login";

interface AuthDraft {
  name: string;
  email: string;
  provider: "google" | "apple";
}

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const { setUser, setOnboarded, addOrganizer, setMyOrganizerId, loginWithCredentials } = useApp();
  const router = useRouter();

  const [step, setStep] = useState<Step>("auth");
  const [authMode, setAuthMode] = useState<AuthMode>("signup");
  const [authDraft, setAuthDraft] = useState<AuthDraft | null>(null);
  const [nationality, setNationality] = useState<Nationality | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [username, setUsername] = useState("");
  const [usernameError, setUsernameError] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const [signInModal, setSignInModal] = useState<"google" | "apple" | null>(null);
  const [modalName, setModalName] = useState("");
  const [modalEmail, setModalEmail] = useState("");

  const topPad = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const egyptianOpacity = useSharedValue(0);
  const touristOpacity = useSharedValue(0);
  const egyptianBgStyle = useAnimatedStyle(() => ({
    opacity: egyptianOpacity.value,
  }));
  const touristBgStyle = useAnimatedStyle(() => ({
    opacity: touristOpacity.value,
  }));

  const openSignIn = (provider: "google" | "apple") => {
    Haptics.selectionAsync();
    setModalName("");
    setModalEmail("");
    setSignInModal(provider);
  };

  const confirmSignIn = () => {
    const name = modalName.trim();
    const email = modalEmail.trim().toLowerCase();
    if (!name || !email || !email.includes("@")) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setAuthDraft({ name, email, provider: signInModal! });
    setSignInModal(null);
    setStep("nationality");
  };

  const handleNationality = (nat: Nationality) => {
    Haptics.selectionAsync();
    setNationality(nat);
    const fadeCfg = { duration: 350, easing: Easing.inOut(Easing.ease) };
    egyptianOpacity.value = withTiming(nat === "egyptian" ? 1 : 0, fadeCfg);
    touristOpacity.value = withTiming(nat === "tourist" ? 1 : 0, fadeCfg);
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

  const handleUsernameNext = () => {
    const err = validateUsername(username);
    if (err) { setUsernameError(err); return; }
    setPassword("");
    setConfirmPassword("");
    setStep("password");
  };

  const passwordStrength = (pw: string): { label: string; color: string; level: number } => {
    if (pw.length === 0) return { label: "", color: "transparent", level: 0 };
    if (pw.length < 6) return { label: "Too short", color: "#f87171", level: 1 };
    if (pw.length < 8) return { label: "Weak", color: "#fb923c", level: 2 };
    if (!/[0-9]/.test(pw) && !/[^a-zA-Z0-9]/.test(pw)) return { label: "Fair", color: "#fbbf24", level: 3 };
    if (pw.length >= 10 && /[0-9]/.test(pw)) return { label: "Strong", color: "#4ade80", level: 5 };
    return { label: "Good", color: "#0abab5", level: 4 };
  };

  const strength = passwordStrength(password);
  const passwordsMatch = password.length > 0 && confirmPassword.length > 0 && password === confirmPassword;
  const canCreateAccount = password.length >= 6 && passwordsMatch && ageConfirmed && agreedToTerms;

  const handleFinish = async () => {
    if (!authDraft || !nationality || !role || !username) return;
    if (!canCreateAccount) return;
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
      password,
    };
    await setUser(profile);

    if (role === "event_planner" || role === "ticket_holder") {
      const orgId = `org_user_${userId}`;
      const newOrg: OrganizerProfile = {
        id: orgId,
        name: authDraft.name,
        type: role === "event_planner" ? "event_planner" : "lounge",
        bio: "",
        city: "",
        phone: "",
        isVerified: false,
        subscriptionActive: false,
        coverColor: role === "event_planner" ? "#0abab5" : "#e06848",
        avatarColor: role === "event_planner" ? "#0abab5" : "#e06848",
        instagram: `@${username}`,
      };
      await addOrganizer(newOrg);
      await setMyOrganizerId(orgId);
    }

    await setOnboarded(true);

    // Register with Supabase auth + store profile (non-blocking, fallback if offline)
    try {
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: authDraft.email,
        password,
        options: { data: { username, name: authDraft.name } },
      });
      if (!signUpError && authData.user) {
        await supabase.from("profiles").upsert({
          id: authData.user.id,
          username,
          name: authDraft.name,
          email: authDraft.email,
          role,
          nationality,
          phone: "",
          is_verified: false,
          currency: nationality === "egyptian" ? "EGP" : "USD",
          followed_organizers: [],
          auth_provider: authDraft.provider,
          created_at: new Date().toISOString(),
        });
      }
    } catch {
      // Supabase unavailable — local account still created above
    }

    router.replace("/(tabs)/trips");
  };

  const handleLogin = async () => {
    const uname = loginUsername.trim().toLowerCase().replace(/^@/, "");
    if (!uname) { setLoginError("Please enter your username"); return; }
    if (!loginPassword) { setLoginError("Please enter your password"); return; }
    setLoginError("");
    setLoginLoading(true);
    Haptics.selectionAsync();
    const result = await loginWithCredentials(uname, loginPassword);
    setLoginLoading(false);
    if (result === "ok") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace("/(tabs)/trips");
    } else if (result === "not_found") {
      setLoginError("No account found with that username");
    } else {
      setLoginError("Incorrect password");
    }
  };

  return (
    <View style={styles.bg}>
      <Image
        source={BG_DEFAULT}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        cachePolicy="memory-disk"
        transition={0}
      />
      <Animated.View style={[StyleSheet.absoluteFill, egyptianBgStyle]}>
        <Image
          source={BG_EGYPTIAN}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          cachePolicy="memory-disk"
          transition={0}
        />
      </Animated.View>
      <Animated.View style={[StyleSheet.absoluteFill, touristBgStyle]}>
        <Image
          source={BG_TOURIST}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          cachePolicy="memory-disk"
          transition={0}
        />
      </Animated.View>
      <View style={[styles.overlay, { backgroundColor: isDark ? "rgba(0,0,0,0.55)" : "rgba(0,0,0,0.22)" }]} />

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
          { paddingTop: topPad + 16, paddingBottom: bottomPad + 40 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {step === "auth" && (
          <View style={styles.stepWrap}>
            <View style={styles.modeTabs}>
              <TouchableOpacity
                style={[styles.modeTab, authMode === "signup" && styles.modeTabActive]}
                onPress={() => { setAuthMode("signup"); setLoginError(""); }}
                activeOpacity={0.8}
              >
                <Text style={[styles.modeTabText, authMode === "signup" && styles.modeTabTextActive]}>Sign Up</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modeTab, authMode === "login" && styles.modeTabActive]}
                onPress={() => { setAuthMode("login"); setLoginError(""); }}
                activeOpacity={0.8}
              >
                <Text style={[styles.modeTabText, authMode === "login" && styles.modeTabTextActive]}>Log In</Text>
              </TouchableOpacity>
            </View>

            {authMode === "signup" && (
              <>
                <Text style={styles.stepTitle}>Create your account</Text>
                <Text style={styles.stepSub}>Sign in to discover events, buy tickets, and connect with planners across Egypt</Text>

                <TouchableOpacity style={styles.googleBtn} onPress={() => openSignIn("google")} activeOpacity={0.9}>
                  <View style={styles.googleIconWrap}>
                    <Text style={styles.gLetterBtn}>G</Text>
                  </View>
                  <Text style={styles.googleBtnText}>Continue with Google</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.appleBtn} onPress={() => openSignIn("apple")} activeOpacity={0.9}>
                  <Feather name={Platform.OS === "ios" ? "smartphone" : "log-in"} size={20} color="#fff" style={{ marginRight: 4 }} />
                  <Text style={styles.appleBtnText}>Continue with Apple ID</Text>
                </TouchableOpacity>

                <Text style={styles.termsText}>
                  By continuing, you agree to our Terms of Service and Privacy Policy
                </Text>
              </>
            )}

            {authMode === "login" && (
              <>
                <Text style={styles.stepTitle}>Welcome back</Text>
                <Text style={styles.stepSub}>Enter your username and password to continue</Text>

                <View style={styles.loginField}>
                  <Text style={styles.loginLabel}>Username</Text>
                  <View style={styles.loginInputRow}>
                    <Text style={styles.loginAt}>@</Text>
                    <TextInput
                      style={styles.loginInput}
                      value={loginUsername}
                      onChangeText={t => { setLoginUsername(t.toLowerCase().replace(/[^a-z0-9_]/g, "")); setLoginError(""); }}
                      placeholder="yourhandle"
                      placeholderTextColor="rgba(255,255,255,0.35)"
                      autoCapitalize="none"
                      autoCorrect={false}
                      returnKeyType="next"
                    />
                  </View>
                </View>

                <View style={styles.loginField}>
                  <Text style={styles.loginLabel}>Password</Text>
                  <View style={styles.loginInputRow}>
                    <Feather name="lock" size={16} color="rgba(255,255,255,0.5)" style={{ marginRight: 8 }} />
                    <TextInput
                      style={[styles.loginInput, { flex: 1 }]}
                      value={loginPassword}
                      onChangeText={t => { setLoginPassword(t); setLoginError(""); }}
                      placeholder="Your password"
                      placeholderTextColor="rgba(255,255,255,0.35)"
                      secureTextEntry={!showLoginPassword}
                      autoCapitalize="none"
                      returnKeyType="done"
                      onSubmitEditing={handleLogin}
                    />
                    <TouchableOpacity onPress={() => setShowLoginPassword(v => !v)} activeOpacity={0.7}>
                      <Feather name={showLoginPassword ? "eye-off" : "eye"} size={18} color="rgba(255,255,255,0.5)" />
                    </TouchableOpacity>
                  </View>
                </View>

                {loginError ? (
                  <View style={styles.loginErrorRow}>
                    <Feather name="alert-circle" size={14} color="#f87171" />
                    <Text style={styles.loginErrorText}>{loginError}</Text>
                  </View>
                ) : null}

                <TouchableOpacity
                  style={[
                    styles.loginBtn,
                    (!loginUsername || !loginPassword || loginLoading) && styles.loginBtnDisabled,
                  ]}
                  onPress={handleLogin}
                  disabled={!loginUsername || !loginPassword || loginLoading}
                  activeOpacity={0.85}
                >
                  {loginLoading ? (
                    <Text style={styles.loginBtnText}>Signing in...</Text>
                  ) : (
                    <>
                      <Feather name="log-in" size={18} color="#fff" />
                      <Text style={styles.loginBtnText}>Sign In</Text>
                    </>
                  )}
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setAuthMode("signup")} activeOpacity={0.7}>
                  <Text style={styles.switchModeText}>
                    Don't have an account?{" "}
                    <Text style={{ color: "#0abab5", fontWeight: "700" }}>Sign up</Text>
                  </Text>
                </TouchableOpacity>
              </>
            )}
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

            <TouchableOpacity style={styles.optionCard} onPress={() => handleNationality("egyptian")} activeOpacity={0.85}>
              <View style={styles.flagCircle}><Text style={styles.flagText}>🇪🇬</Text></View>
              <View style={styles.optionText}>
                <Text style={styles.optionTitle}>Egyptian Resident</Text>
                <Text style={styles.optionDesc}>I live in Egypt</Text>
              </View>
              <Feather name="chevron-right" size={20} color="rgba(255,255,255,0.6)" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionCard} onPress={() => handleNationality("tourist")} activeOpacity={0.85}>
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

                <TouchableOpacity style={styles.roleCard} onPress={() => handleRole("event_planner")} activeOpacity={0.85}>
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
              {[1, 2, 3, 4].map(n => (
                <View key={n} style={[styles.stepDot, n <= 3 && styles.stepDotActive]} />
              ))}
            </View>
            <TouchableOpacity style={styles.backBtn} onPress={() => setStep("role")}>
              <Feather name="arrow-left" size={18} color="rgba(255,255,255,0.7)" />
              <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>
            <Text style={styles.stepTitle}>Choose your username</Text>
            <Text style={styles.stepSub}>
              {role === "event_planner"
                ? "This becomes your public organizer handle — how people find and follow you"
                : "This is how you appear on Trippy Events"}
            </Text>

            <View style={styles.usernameWrap}>
              <View style={styles.usernameInputRow}>
                <View style={styles.atWrap}><Text style={styles.atSign}>@</Text></View>
                <TextInput
                  style={styles.usernameInput}
                  value={username}
                  onChangeText={handleUsernameChange}
                  placeholder="yourhandle"
                  placeholderTextColor="rgba(255,255,255,0.35)"
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="next"
                  onSubmitEditing={handleUsernameNext}
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
              <Text style={styles.usernameHint}>3–20 characters · lowercase letters, numbers, underscores only</Text>
            </View>

            {role === "event_planner" && (
              <View style={styles.plannerNotice}>
                <Feather name="map" size={16} color="#0abab5" />
                <Text style={styles.plannerNoticeText}>
                  Your public organizer profile will be created at <Text style={{ color: "#0abab5", fontWeight: "700" }}>@{username || "yourhandle"}</Text>
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={[styles.finishBtn, (!username || !!usernameError || username.length < 3) && styles.finishBtnDisabled]}
              onPress={handleUsernameNext}
              disabled={!username || !!usernameError || username.length < 3}
              activeOpacity={0.85}
            >
              <Text style={styles.finishBtnText}>Next — Create Password</Text>
              <Feather name="arrow-right" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        )}

        {step === "password" && (
          <View style={styles.stepWrap}>
            <View style={styles.stepProgressRow}>
              {[1, 2, 3, 4].map(n => (
                <View key={n} style={[styles.stepDot, styles.stepDotActive]} />
              ))}
            </View>
            <TouchableOpacity style={styles.backBtn} onPress={() => setStep("username")}>
              <Feather name="arrow-left" size={18} color="rgba(255,255,255,0.7)" />
              <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>
            <Text style={styles.stepTitle}>Secure your account</Text>
            <Text style={styles.stepSub}>
              Create a password so you can log back in with <Text style={{ color: "#0abab5", fontWeight: "700" }}>@{username}</Text> anytime
            </Text>

            <View style={styles.passwordCard}>
              <View style={styles.pwField}>
                <Text style={styles.pwLabel}>New Password</Text>
                <View style={styles.pwInputRow}>
                  <Feather name="lock" size={16} color="rgba(255,255,255,0.5)" />
                  <TextInput
                    style={styles.pwInput}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Minimum 6 characters"
                    placeholderTextColor="rgba(255,255,255,0.3)"
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    returnKeyType="next"
                  />
                  <TouchableOpacity onPress={() => setShowPassword(v => !v)} activeOpacity={0.7}>
                    <Feather name={showPassword ? "eye-off" : "eye"} size={18} color="rgba(255,255,255,0.5)" />
                  </TouchableOpacity>
                </View>
                {password.length > 0 && (
                  <View style={styles.strengthRow}>
                    {[1, 2, 3, 4, 5].map(i => (
                      <View
                        key={i}
                        style={[styles.strengthBar, { backgroundColor: i <= strength.level ? strength.color : "rgba(255,255,255,0.15)" }]}
                      />
                    ))}
                    {strength.label ? <Text style={[styles.strengthLabel, { color: strength.color }]}>{strength.label}</Text> : null}
                  </View>
                )}
              </View>

              <View style={styles.pwField}>
                <Text style={styles.pwLabel}>Confirm Password</Text>
                <View style={[styles.pwInputRow, confirmPassword.length > 0 && { borderColor: passwordsMatch ? "#4ade80" : "#f87171" }]}>
                  <Feather name="lock" size={16} color="rgba(255,255,255,0.5)" />
                  <TextInput
                    style={styles.pwInput}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Repeat your password"
                    placeholderTextColor="rgba(255,255,255,0.3)"
                    secureTextEntry={!showConfirm}
                    autoCapitalize="none"
                    returnKeyType="done"
                    onSubmitEditing={handleFinish}
                  />
                  <TouchableOpacity onPress={() => setShowConfirm(v => !v)} activeOpacity={0.7}>
                    <Feather name={showConfirm ? "eye-off" : "eye"} size={18} color="rgba(255,255,255,0.5)" />
                  </TouchableOpacity>
                </View>
                {confirmPassword.length > 0 && (
                  <View style={styles.matchRow}>
                    <Feather name={passwordsMatch ? "check-circle" : "x-circle"} size={13} color={passwordsMatch ? "#4ade80" : "#f87171"} />
                    <Text style={{ color: passwordsMatch ? "#4ade80" : "#f87171", fontSize: 12 }}>
                      {passwordsMatch ? "Passwords match" : "Passwords don't match"}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            <View style={styles.loginReminderBanner}>
              <Feather name="info" size={14} color="#0abab5" />
              <Text style={styles.loginReminderText}>
                You'll use <Text style={{ color: "#0abab5", fontWeight: "700" }}>@{username}</Text> + this password to log in next time
              </Text>
            </View>

            {/* Age confirmation */}
            <TouchableOpacity
              style={styles.checkRow}
              onPress={() => setAgeConfirmed(v => !v)}
              activeOpacity={0.8}
            >
              <View style={[styles.checkBox, ageConfirmed && styles.checkBoxActive]}>
                {ageConfirmed && <Feather name="check" size={13} color="#fff" />}
              </View>
              <Text style={styles.checkText}>
                I confirm that I am <Text style={{ fontWeight: "700", color: "#fff" }}>13 years of age or older</Text>
              </Text>
            </TouchableOpacity>

            {/* Terms & Privacy agreement */}
            <TouchableOpacity
              style={styles.checkRow}
              onPress={() => setAgreedToTerms(v => !v)}
              activeOpacity={0.8}
            >
              <View style={[styles.checkBox, agreedToTerms && styles.checkBoxActive]}>
                {agreedToTerms && <Feather name="check" size={13} color="#fff" />}
              </View>
              <Text style={styles.checkText}>
                I agree to the{" "}
                <Text
                  style={styles.checkLink}
                  onPress={() => router.push("/terms")}
                >
                  Terms of Service
                </Text>
                {" "}and{" "}
                <Text
                  style={styles.checkLink}
                  onPress={() => router.push("/privacy-policy")}
                >
                  Privacy Policy
                </Text>
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.finishBtn, !canCreateAccount && styles.finishBtnDisabled]}
              onPress={handleFinish}
              disabled={!canCreateAccount}
              activeOpacity={0.85}
            >
              <Text style={styles.finishBtnText}>Create Account</Text>
              <Feather name="check" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  overlay: { ...StyleSheet.absoluteFillObject },
  scroll: { paddingHorizontal: 22 },
  stepWrap: { gap: 14 },
  stepProgressRow: { flexDirection: "row", gap: 8, marginBottom: 4 },
  stepDot: { flex: 1, height: 4, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.25)" },
  stepDotActive: { backgroundColor: "#0abab5" },
  stepTitle: { fontSize: 24, fontWeight: "800", color: "#ffffff", letterSpacing: -0.5 },
  stepSub: { fontSize: 14, color: "rgba(255,255,255,0.65)", marginBottom: 4, lineHeight: 20 },
  backBtn: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 },
  backText: { fontSize: 14, color: "rgba(255,255,255,0.7)" },

  modeTabs: { flexDirection: "row", backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 14, padding: 4, marginBottom: 6 },
  modeTab: { flex: 1, paddingVertical: 10, alignItems: "center", borderRadius: 11 },
  modeTabActive: { backgroundColor: "#0abab5" },
  modeTabText: { fontSize: 15, fontWeight: "700", color: "rgba(255,255,255,0.55)" },
  modeTabTextActive: { color: "#fff" },

  googleBtn: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderRadius: 16, paddingVertical: 16, paddingHorizontal: 20, gap: 14, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 12, elevation: 8 },
  googleIconWrap: { width: 32, height: 32, borderRadius: 16, backgroundColor: "#4285F4", alignItems: "center", justifyContent: "center" },
  gLetterBtn: { fontSize: 18, fontWeight: "800", color: "#fff", lineHeight: 22 },
  googleBtnText: { fontSize: 16, fontWeight: "700", color: "#111", flex: 1, textAlign: "center" },
  appleBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "#000", borderRadius: 16, paddingVertical: 16, paddingHorizontal: 20, gap: 10, borderWidth: 1, borderColor: "rgba(255,255,255,0.2)" },
  appleBtnText: { fontSize: 16, fontWeight: "700", color: "#fff" },
  termsText: { fontSize: 12, color: "rgba(255,255,255,0.45)", textAlign: "center", lineHeight: 18, marginTop: 6 },

  loginField: { gap: 6 },
  loginLabel: { fontSize: 12, fontWeight: "700", color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: 0.5 },
  loginInputRow: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 14, paddingHorizontal: 14, paddingVertical: 14, borderWidth: 1, borderColor: "rgba(255,255,255,0.18)", gap: 4 },
  loginAt: { fontSize: 18, fontWeight: "800", color: "#0abab5", marginRight: 2 },
  loginInput: { flex: 1, fontSize: 16, color: "#fff", fontWeight: "600" },
  loginErrorRow: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "rgba(248,113,113,0.15)", borderRadius: 10, padding: 10 },
  loginErrorText: { color: "#f87171", fontSize: 13, flex: 1 },
  loginBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, backgroundColor: "#0abab5", borderRadius: 16, paddingVertical: 16, marginTop: 4 },
  loginBtnDisabled: { opacity: 0.5 },
  loginBtnText: { fontSize: 16, fontWeight: "800", color: "#fff" },
  switchModeText: { textAlign: "center", color: "rgba(255,255,255,0.55)", fontSize: 13, marginTop: 4 },

  optionCard: { flexDirection: "row", alignItems: "center", padding: 18, borderRadius: 18, borderWidth: 1, borderColor: "rgba(255,255,255,0.18)", backgroundColor: "rgba(255,255,255,0.1)", gap: 14 },
  flagCircle: { width: 52, height: 52, borderRadius: 26, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.15)" },
  flagText: { fontSize: 28 },
  optionText: { flex: 1, gap: 3 },
  optionTitle: { fontSize: 17, fontWeight: "700", color: "#fff" },
  optionDesc: { fontSize: 13, color: "rgba(255,255,255,0.6)" },

  roleCard: { backgroundColor: "rgba(255,255,255,0.09)", borderRadius: 20, borderWidth: 1, borderColor: "rgba(255,255,255,0.16)", padding: 20, gap: 10 },
  roleIcon: { width: 60, height: 60, borderRadius: 18, alignItems: "center", justifyContent: "center", marginBottom: 4 },
  roleTitle: { fontSize: 19, fontWeight: "800", color: "#fff" },
  roleDesc: { fontSize: 13, color: "rgba(255,255,255,0.65)", lineHeight: 19 },
  roleFeatures: { gap: 4, marginTop: 4 },
  featureItem: { fontSize: 12, color: "rgba(255,255,255,0.55)" },

  usernameWrap: { gap: 10 },
  usernameInputRow: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 16, overflow: "hidden", borderWidth: 1, borderColor: "rgba(255,255,255,0.2)" },
  atWrap: { paddingHorizontal: 14, paddingVertical: 16, backgroundColor: "rgba(10,186,181,0.2)" },
  atSign: { fontSize: 20, fontWeight: "800", color: "#0abab5" },
  usernameInput: { flex: 1, fontSize: 18, fontWeight: "700", color: "#fff", paddingHorizontal: 14, paddingVertical: 14 },
  errorRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  errorText: { fontSize: 13, color: "#f87171" },
  successRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  checkRow: { flexDirection: "row", alignItems: "flex-start", gap: 12, backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 14, padding: 14, borderWidth: 1, borderColor: "rgba(255,255,255,0.14)" },
  checkBox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: "rgba(255,255,255,0.5)", alignItems: "center", justifyContent: "center", marginTop: 1, flexShrink: 0 },
  checkBoxActive: { backgroundColor: "#0abab5", borderColor: "#0abab5" },
  checkText: { flex: 1, fontSize: 13, color: "rgba(255,255,255,0.75)", lineHeight: 19 },
  checkLink: { color: "#0abab5", fontWeight: "700", textDecorationLine: "underline" },
  successText: { fontSize: 13, color: "#4ade80" },
  usernameHint: { fontSize: 12, color: "rgba(255,255,255,0.4)" },
  plannerNotice: { flexDirection: "row", alignItems: "flex-start", gap: 10, backgroundColor: "rgba(10,186,181,0.12)", borderRadius: 14, padding: 14, borderWidth: 1, borderColor: "rgba(10,186,181,0.3)" },
  plannerNoticeText: { flex: 1, fontSize: 13, color: "rgba(255,255,255,0.7)", lineHeight: 18 },

  passwordCard: { backgroundColor: "rgba(255,255,255,0.07)", borderRadius: 20, borderWidth: 1, borderColor: "rgba(255,255,255,0.15)", padding: 18, gap: 18 },
  pwField: { gap: 8 },
  pwLabel: { fontSize: 12, fontWeight: "700", color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: 0.5 },
  pwInputRow: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13, borderWidth: 1, borderColor: "rgba(255,255,255,0.15)" },
  pwInput: { flex: 1, fontSize: 15, color: "#fff", fontWeight: "600" },
  strengthRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 },
  strengthBar: { flex: 1, height: 3, borderRadius: 2 },
  strengthLabel: { fontSize: 11, fontWeight: "700", marginLeft: 6, minWidth: 48 },
  matchRow: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 2 },
  loginReminderBanner: { flexDirection: "row", alignItems: "flex-start", gap: 8, backgroundColor: "rgba(10,186,181,0.1)", borderRadius: 12, padding: 12, borderWidth: 1, borderColor: "rgba(10,186,181,0.25)" },
  loginReminderText: { flex: 1, fontSize: 13, color: "rgba(255,255,255,0.65)", lineHeight: 18 },

  finishBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, backgroundColor: "#0abab5", borderRadius: 16, paddingVertical: 16 },
  finishBtnDisabled: { opacity: 0.45 },
  finishBtnText: { fontSize: 16, fontWeight: "800", color: "#fff" },

  modalWrap: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.5)" },
  modalSheet: { backgroundColor: "#fff", borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, gap: 16, paddingBottom: 40 },
  modalHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: "#e5e7eb", alignSelf: "center", marginBottom: 4 },
  modalProviderRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  providerIcon: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  gLetter: { fontSize: 22, fontWeight: "800", color: "#4285F4" },
  modalTitle: { fontSize: 20, fontWeight: "800", color: "#111" },
  modalSub: { fontSize: 14, color: "#666", marginTop: -4 },
  modalField: { gap: 6 },
  modalLabel: { fontSize: 12, fontWeight: "700", color: "#666", textTransform: "uppercase", letterSpacing: 0.5 },
  modalInput: { borderWidth: 1.5, borderColor: "#e5e7eb", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13, fontSize: 15, color: "#111", backgroundColor: "#f9fafb" },
  modalConfirm: { borderRadius: 14, paddingVertical: 15, alignItems: "center" },
  modalConfirmDisabled: { opacity: 0.45 },
  modalConfirmText: { color: "#fff", fontWeight: "800", fontSize: 16 },
  modalCancel: { alignItems: "center", paddingVertical: 8 },
  modalCancelText: { color: "#999", fontSize: 14 },
});
