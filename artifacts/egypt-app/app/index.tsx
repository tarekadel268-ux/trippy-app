import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Nationality, UserProfile, UserRole, useApp } from "@/contexts/AppContext";
import { useColors } from "@/hooks/useColors";

type Step = "nationality" | "role";

export default function OnboardingScreen() {
  const colors = useColors();
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

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: topPad + 24, paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.logoWrap}>
          <Image source={require("@/assets/images/icon.png")} style={styles.logo} />
          <Text style={[styles.appName, { color: colors.foreground }]}>Egypt Events & Trips</Text>
          <Text style={[styles.tagline, { color: colors.mutedForeground }]}>Discover authentic Egypt</Text>
        </View>

        {step === "nationality" && (
          <View style={styles.stepWrap}>
            <Text style={[styles.stepTitle, { color: colors.foreground }]}>Where are you from?</Text>
            <Text style={[styles.stepSub, { color: colors.mutedForeground }]}>This helps us tailor your experience</Text>
            <TouchableOpacity
              style={[styles.optionCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => handleNationality("egyptian")}
              activeOpacity={0.85}
            >
              <View style={[styles.flagCircle, { backgroundColor: "#e8392a" }]}>
                <Text style={styles.flagText}>🇪🇬</Text>
              </View>
              <View style={styles.optionText}>
                <Text style={[styles.optionTitle, { color: colors.foreground }]}>Egyptian Resident</Text>
                <Text style={[styles.optionDesc, { color: colors.mutedForeground }]}>I live in Egypt</Text>
              </View>
              <Feather name="chevron-right" size={20} color={colors.mutedForeground} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.optionCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => handleNationality("tourist")}
              activeOpacity={0.85}
            >
              <View style={[styles.flagCircle, { backgroundColor: "#2d4a6b" }]}>
                <Feather name="globe" size={24} color="#fff" />
              </View>
              <View style={styles.optionText}>
                <Text style={[styles.optionTitle, { color: colors.foreground }]}>International Tourist</Text>
                <Text style={[styles.optionDesc, { color: colors.mutedForeground }]}>I'm visiting Egypt</Text>
              </View>
              <Feather name="chevron-right" size={20} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>
        )}

        {step === "role" && (
          <View style={styles.stepWrap}>
            <TouchableOpacity style={styles.backBtn} onPress={() => setStep("nationality")}>
              <Feather name="arrow-left" size={18} color={colors.mutedForeground} />
              <Text style={[styles.backText, { color: colors.mutedForeground }]}>Back</Text>
            </TouchableOpacity>
            <Text style={[styles.stepTitle, { color: colors.foreground }]}>What brings you here?</Text>
            <Text style={[styles.stepSub, { color: colors.mutedForeground }]}>Choose your role — this cannot be changed later</Text>

            {nationality === "egyptian" && (
              <>
                <TouchableOpacity
                  style={[styles.roleCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                  onPress={() => handleRole("ticket_holder")}
                  activeOpacity={0.85}
                >
                  <View style={[styles.roleIcon, { backgroundColor: "#e06848" + "20" }]}>
                    <Feather name="tag" size={26} color="#e06848" />
                  </View>
                  <Text style={[styles.roleTitle, { color: colors.foreground }]}>Ticket Holder</Text>
                  <Text style={[styles.roleDesc, { color: colors.mutedForeground }]}>
                    List event tickets you can't use — concerts, parties, and more
                  </Text>
                  <View style={[styles.roleFeatures, { borderTopColor: colors.border }]}>
                    <Text style={[styles.featureItem, { color: colors.mutedForeground }]}>• List your tickets for free</Text>
                    <Text style={[styles.featureItem, { color: colors.mutedForeground }]}>• In-app chat with buyers</Text>
                    <Text style={[styles.featureItem, { color: colors.mutedForeground }]}>• Pay via Instapay / Vodafone Cash</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.roleCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                  onPress={() => handleRole("trip_planner")}
                  activeOpacity={0.85}
                >
                  <View style={[styles.roleIcon, { backgroundColor: "#2d8a4e" + "20" }]}>
                    <Feather name="map" size={26} color="#2d8a4e" />
                  </View>
                  <Text style={[styles.roleTitle, { color: colors.foreground }]}>Trip Planner</Text>
                  <Text style={[styles.roleDesc, { color: colors.mutedForeground }]}>
                    Organize and list trips across Egypt's top destinations for tourists
                  </Text>
                  <View style={[styles.roleFeatures, { borderTopColor: colors.border }]}>
                    <Text style={[styles.featureItem, { color: colors.mutedForeground }]}>• Verify with Egyptian ID</Text>
                    <Text style={[styles.featureItem, { color: colors.mutedForeground }]}>• 200 EGP/month subscription</Text>
                    <Text style={[styles.featureItem, { color: colors.mutedForeground }]}>• Reach verified tourists</Text>
                  </View>
                </TouchableOpacity>
              </>
            )}

            {nationality === "tourist" && (
              <TouchableOpacity
                style={[styles.roleCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => handleRole("tourist_viewer")}
                activeOpacity={0.85}
              >
                <View style={[styles.roleIcon, { backgroundColor: "#2d4a6b" + "20" }]}>
                  <Feather name="compass" size={26} color="#2d4a6b" />
                </View>
                <Text style={[styles.roleTitle, { color: colors.foreground }]}>Tourist Explorer</Text>
                <Text style={[styles.roleDesc, { color: colors.mutedForeground }]}>
                  Browse verified trip packages and authentic events across Egypt
                </Text>
                <View style={[styles.roleFeatures, { borderTopColor: colors.border }]}>
                  <Text style={[styles.featureItem, { color: colors.mutedForeground }]}>• Browse all events & trips</Text>
                  <Text style={[styles.featureItem, { color: colors.mutedForeground }]}>• $15/month for verified planners</Text>
                  <Text style={[styles.featureItem, { color: colors.mutedForeground }]}>• No scammers, verified only</Text>
                </View>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 20 },
  logoWrap: {
    alignItems: "center",
    marginBottom: 40,
    gap: 8,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 20,
    marginBottom: 8,
  },
  appName: {
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 15,
  },
  stepWrap: {
    gap: 14,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  stepSub: {
    fontSize: 14,
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
  },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 18,
    borderRadius: 16,
    borderWidth: 1.5,
    gap: 14,
  },
  flagCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  flagText: {
    fontSize: 28,
  },
  optionText: {
    flex: 1,
    gap: 2,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  optionDesc: {
    fontSize: 13,
  },
  roleCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1.5,
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
  },
  roleDesc: {
    fontSize: 14,
    lineHeight: 20,
  },
  roleFeatures: {
    borderTopWidth: 1,
    paddingTop: 12,
    gap: 5,
  },
  featureItem: {
    fontSize: 13,
    lineHeight: 19,
  },
});
