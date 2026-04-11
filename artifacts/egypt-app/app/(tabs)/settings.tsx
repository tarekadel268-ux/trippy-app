import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLanguage } from "@/contexts/LanguageContext";
import { useApp } from "@/contexts/AppContext";
import { useColors } from "@/hooks/useColors";

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { language, setLanguage, t, isRTL } = useLanguage();
  const { currency, setCurrency, user, setUser } = useApp();
  const router = useRouter();

  const topPad = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const handleLanguageChange = async (lang: "en" | "ar") => {
    await setLanguage(lang);
    if (lang === "ar") {
      Alert.alert(
        lang === "ar" ? "تم تغيير اللغة" : "Language Changed",
        lang === "ar"
          ? "أعد تشغيل التطبيق لتطبيق تخطيط اليمين-إلى-اليسار بالكامل."
          : "Restart the app to apply full right-to-left layout.",
        [{ text: lang === "ar" ? "حسناً" : "OK" }]
      );
    }
  };

  const textAlign = isRTL ? "right" : "left" as const;
  const rowDir = isRTL ? "row-reverse" : "row" as const;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 8, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.foreground, textAlign }]}>{t("settingsTitle")}</Text>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: bottomPad + 30 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Language */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.sectionHeader, { flexDirection: rowDir }]}>
            <View style={[styles.sectionIconWrap, { backgroundColor: colors.primary + "18" }]}>
              <Feather name="globe" size={16} color={colors.primary} />
            </View>
            <Text style={[styles.sectionTitle, { color: colors.foreground, textAlign }]}>{t("languageSection")}</Text>
          </View>

          <View style={[styles.langRow, { flexDirection: rowDir }]}>
            <TouchableOpacity
              style={[
                styles.langBtn,
                {
                  backgroundColor: language === "en" ? colors.primary : colors.muted,
                  borderColor: language === "en" ? colors.primary : colors.border,
                },
              ]}
              onPress={() => handleLanguageChange("en")}
              activeOpacity={0.8}
            >
              <Text style={styles.langFlag}>🇬🇧</Text>
              <Text style={[styles.langBtnText, { color: language === "en" ? "#fff" : colors.foreground }]}>
                {t("english")}
              </Text>
              {language === "en" && <Feather name="check" size={14} color="#fff" />}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.langBtn,
                {
                  backgroundColor: language === "ar" ? colors.primary : colors.muted,
                  borderColor: language === "ar" ? colors.primary : colors.border,
                },
              ]}
              onPress={() => handleLanguageChange("ar")}
              activeOpacity={0.8}
            >
              <Text style={styles.langFlag}>🇪🇬</Text>
              <Text style={[styles.langBtnText, { color: language === "ar" ? "#fff" : colors.foreground }]}>
                {t("arabic")}
              </Text>
              {language === "ar" && <Feather name="check" size={14} color="#fff" />}
            </TouchableOpacity>
          </View>

          <View style={[styles.noteRow, { flexDirection: rowDir }]}>
            <Feather name="info" size={13} color={colors.mutedForeground} />
            <Text style={[styles.noteText, { color: colors.mutedForeground, textAlign }]}>{t("languageNote")}</Text>
          </View>
        </View>

        {/* Currency */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.sectionHeader, { flexDirection: rowDir }]}>
            <View style={[styles.sectionIconWrap, { backgroundColor: "#22c55e18" }]}>
              <Feather name="dollar-sign" size={16} color="#22c55e" />
            </View>
            <Text style={[styles.sectionTitle, { color: colors.foreground, textAlign }]}>{t("currencySection")}</Text>
          </View>

          {(["EGP", "USD"] as const).map((cur) => (
            <TouchableOpacity
              key={cur}
              style={[styles.row, { flexDirection: rowDir, borderTopColor: colors.border }]}
              onPress={() => setCurrency(cur)}
              activeOpacity={0.7}
            >
              <Text style={[styles.rowLabel, { color: colors.foreground, textAlign }]}>
                {cur === "EGP" ? t("currencyEGP") : t("currencyUSD")}
              </Text>
              <View style={[styles.radioOuter, { borderColor: cur === currency ? colors.primary : colors.border }]}>
                {cur === currency && <View style={[styles.radioInner, { backgroundColor: colors.primary }]} />}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Privacy */}
        {user && (
          <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.sectionHeader, { flexDirection: rowDir }]}>
              <View style={[styles.sectionIconWrap, { backgroundColor: "#f59e0b18" }]}>
                <Feather name="shield" size={16} color="#f59e0b" />
              </View>
              <Text style={[styles.sectionTitle, { color: colors.foreground, textAlign }]}>{t("privacySection")}</Text>
            </View>

            {([
              { key: "hideEmail", label: t("showEmail") },
              { key: "hidePhone", label: t("showPhone") },
              { key: "hideRole", label: t("showRole") },
            ] as { key: "hideEmail" | "hidePhone" | "hideRole"; label: string }[]).map(({ key, label }) => {
              const privacy = user.privacy ?? { hideEmail: true, hidePhone: true, hideRole: false };
              const isVisible = !privacy[key];
              return (
                <View key={key} style={[styles.row, { flexDirection: rowDir, borderTopColor: colors.border }]}>
                  <Text style={[styles.rowLabel, { color: colors.foreground, textAlign }]}>{label}</Text>
                  <Switch
                    value={isVisible}
                    onValueChange={(val) =>
                      setUser({ ...user, privacy: { ...privacy, [key]: !val } })
                    }
                    trackColor={{ false: colors.border, true: colors.primary + "88" }}
                    thumbColor={isVisible ? colors.primary : colors.mutedForeground}
                  />
                </View>
              );
            })}
          </View>
        )}

        {/* About */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.sectionHeader, { flexDirection: rowDir }]}>
            <View style={[styles.sectionIconWrap, { backgroundColor: "#6366f118" }]}>
              <Feather name="info" size={16} color="#6366f1" />
            </View>
            <Text style={[styles.sectionTitle, { color: colors.foreground, textAlign }]}>{t("aboutSection")}</Text>
          </View>

          {[
            { label: t("version"), value: "1.0.0", icon: "tag" },
            { label: t("termsOfService"), value: "", icon: "file-text" },
            { label: t("privacyPolicy"), value: "", icon: "lock" },
            { label: t("contactSupport"), value: "", icon: "mail" },
          ].map(({ label, value, icon }, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.row, { flexDirection: rowDir, borderTopColor: colors.border }]}
              activeOpacity={0.7}
            >
              <View style={[styles.rowLeft, { flexDirection: rowDir }]}>
                <Feather name={icon as any} size={15} color={colors.mutedForeground} />
                <Text style={[styles.rowLabel, { color: colors.foreground, textAlign }]}>{label}</Text>
              </View>
              {value ? (
                <Text style={[styles.rowValue, { color: colors.mutedForeground }]}>{value}</Text>
              ) : (
                <Feather name={isRTL ? "chevron-left" : "chevron-right"} size={16} color={colors.mutedForeground} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout */}
        {user && (
          <TouchableOpacity
            style={[styles.logoutBtn, { borderColor: "#ef4444" }]}
            onPress={() => {
              Alert.alert(
                t("logout"),
                isRTL ? "هل أنت متأكد أنك تريد تسجيل الخروج؟" : "Are you sure you want to log out?",
                [
                  { text: t("cancel"), style: "cancel" },
                  { text: t("logout"), style: "destructive", onPress: async () => { await setUser(null); router.replace("/"); } },
                ]
              );
            }}
            activeOpacity={0.8}
          >
            <Feather name="log-out" size={18} color="#ef4444" />
            <Text style={styles.logoutText}>{t("logout")}</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 28, fontWeight: "800" },
  scroll: { paddingHorizontal: 16, paddingTop: 20, gap: 16 },
  section: {
    borderRadius: 18,
    borderWidth: 1,
    overflow: "hidden",
  },
  sectionHeader: {
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  sectionIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: { fontSize: 15, fontWeight: "700", flex: 1 },
  langRow: {
    gap: 10,
    paddingHorizontal: 16,
    paddingBottom: 14,
  },
  langBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  langFlag: { fontSize: 18 },
  langBtnText: { fontWeight: "700", fontSize: 14 },
  noteRow: {
    alignItems: "flex-start",
    gap: 6,
    paddingHorizontal: 16,
    paddingBottom: 14,
  },
  noteText: { fontSize: 12, lineHeight: 17, flex: 1 },
  row: {
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  rowLeft: { alignItems: "center", gap: 10, flex: 1 },
  rowLabel: { fontSize: 15, flex: 1 },
  rowValue: { fontSize: 14 },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  radioInner: { width: 11, height: 11, borderRadius: 6 },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 15,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  logoutText: { color: "#ef4444", fontWeight: "700", fontSize: 15 },
});
