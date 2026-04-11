import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ImageBackground,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Nationality, UserProfile, UserRole, useApp } from "@/contexts/AppContext";

type Step = "nationality" | "role";

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const { setUser, setOnboarded } = useApp();
  const router = useRouter();

  const [step, setStep] = useState<Step>("nationality");
  const [nationality, setNationality] = useState<Nationality | null>(null);

  const handleNationality = (nat: Nationality) => {
    Haptics.selectionAsync();
    setNationality(nat);
    setStep("role");
  };

  const handleRole = async (role: UserRole) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const profile: UserProfile = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      nationality: nationality!,
      role,
      name: "",
      phone: "",
      isVerified: false,
      subscriptionExpiry: null,
      currency: nationality === "egyptian" ? "EGP" : "USD",
    };
    await setUser(profile);
    await setOnboarded(true);
    router.replace("/(tabs)/trips");
  };

  const topPad = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  return (
    <ImageBackground
      source={require("@/assets/images/pyramids-bg.jpeg")}
      style={styles.bg}
      resizeMode="cover"
    >
      <View style={styles.overlay} />
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: topPad + 40, paddingBottom: bottomPad + 40 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.logoWrap}>
          <Text style={styles.appName}>Egypt Events & Trips</Text>
          <Text style={styles.tagline}>Discover authentic Egypt</Text>
        </View>

        {step === "nationality" && (
          <View style={styles.stepWrap}>
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
            <TouchableOpacity style={styles.backBtn} onPress={() => setStep("nationality")}>
              <Feather name="arrow-left" size={18} color="rgba(255,255,255,0.7)" />
              <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>
            <Text style={styles.stepTitle}>What brings you here?</Text>
            <Text style={styles.stepSub}>Choose your role — this cannot be changed later</Text>

            {nationality === "egyptian" && (
              <>
                <TouchableOpacity
                  style={styles.roleCard}
                  onPress={() => handleRole("ticket_holder")}
                  activeOpacity={0.85}
                >
                  <View style={[styles.roleIcon, { backgroundColor: "rgba(224,104,72,0.25)" }]}>
                    <Feather name="tag" size={26} color="#ff8c6e" />
                  </View>
                  <Text style={styles.roleTitle}>Ticket Holder</Text>
                  <Text style={styles.roleDesc}>List event tickets you can't use — concerts, parties, and more</Text>
                  <View style={styles.roleFeatures}>
                    <Text style={styles.featureItem}>• List your tickets for free</Text>
                    <Text style={styles.featureItem}>• In-app chat with buyers</Text>
                    <Text style={styles.featureItem}>• Pay via Instapay / Vodafone Cash</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.roleCard}
                  onPress={() => handleRole("trip_planner")}
                  activeOpacity={0.85}
                >
                  <View style={[styles.roleIcon, { backgroundColor: "rgba(10,186,181,0.25)" }]}>
                    <Feather name="map" size={26} color="#0abab5" />
                  </View>
                  <Text style={styles.roleTitle}>Trip Planner</Text>
                  <Text style={styles.roleDesc}>Organize and list trips across Egypt's top destinations for tourists</Text>
                  <View style={styles.roleFeatures}>
                    <Text style={styles.featureItem}>• Verify with Egyptian ID</Text>
                    <Text style={styles.featureItem}>• 200 EGP/month subscription</Text>
                    <Text style={styles.featureItem}>• Reach verified tourists</Text>
                  </View>
                </TouchableOpacity>
              </>
            )}

            {nationality === "tourist" && (
              <TouchableOpacity
                style={styles.roleCard}
                onPress={() => handleRole("tourist_viewer")}
                activeOpacity={0.85}
              >
                <View style={[styles.roleIcon, { backgroundColor: "rgba(10,186,181,0.25)" }]}>
                  <Feather name="compass" size={26} color="#0abab5" />
                </View>
                <Text style={styles.roleTitle}>Tourist Explorer</Text>
                <Text style={styles.roleDesc}>Browse verified trip packages and authentic events across Egypt</Text>
                <View style={styles.roleFeatures}>
                  <Text style={styles.featureItem}>• Browse all events & trips</Text>
                  <Text style={styles.featureItem}>• $15/month for verified planners</Text>
                  <Text style={styles.featureItem}>• No scammers, verified only</Text>
                </View>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.62)",
  },
  scroll: {
    paddingHorizontal: 22,
  },
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
  stepWrap: {
    gap: 14,
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
  flagText: {
    fontSize: 28,
  },
  optionText: {
    flex: 1,
    gap: 3,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ffffff",
  },
  optionDesc: {
    fontSize: 13,
    color: "rgba(255,255,255,0.6)",
  },
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
  roleTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#ffffff",
  },
  roleDesc: {
    fontSize: 14,
    lineHeight: 20,
    color: "rgba(255,255,255,0.7)",
  },
  roleFeatures: {
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.15)",
    paddingTop: 12,
    gap: 5,
  },
  featureItem: {
    fontSize: 13,
    lineHeight: 19,
    color: "rgba(255,255,255,0.6)",
  },
});
