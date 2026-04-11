import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ChatThread, useApp } from "@/contexts/AppContext";
import { useColors } from "@/hooks/useColors";
import { useLanguage } from "@/contexts/LanguageContext";

export default function MessagesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();
  const { chats } = useApp();
  const router = useRouter();

  const sorted = [...chats].sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const formatTime = (isoStr: string) => {
    const d = new Date(isoStr);
    const now = new Date();
    const diffHours = (now.getTime() - d.getTime()) / 3600000;
    if (diffHours < 24) return d.toLocaleTimeString("en-EG", { hour: "2-digit", minute: "2-digit" });
    return d.toLocaleDateString("en-EG", { day: "numeric", month: "short" });
  };

  const renderThread = ({ item }: { item: ChatThread }) => {
    const lastMsg = item.messages[item.messages.length - 1];
    return (
      <TouchableOpacity
        style={[styles.thread, { backgroundColor: colors.card, borderColor: colors.border }]}
        onPress={() => router.push(`/chat/${item.id}`)}
        activeOpacity={0.85}
      >
        <View style={[styles.avatar, { backgroundColor: colors.primary + "22" }]}>
          <Text style={[styles.avatarText, { color: colors.primary }]}>
            {item.participantName.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.threadContent}>
          <View style={styles.threadTop}>
            <Text style={[styles.threadName, { color: colors.foreground }]} numberOfLines={1}>{item.participantName}</Text>
            <Text style={[styles.threadTime, { color: colors.mutedForeground }]}>{formatTime(item.lastUpdated)}</Text>
          </View>
          <Text style={[styles.threadListing, { color: colors.primary }]} numberOfLines={1}>{item.listingTitle}</Text>
          {lastMsg && (
            <Text style={[styles.threadLast, { color: colors.mutedForeground }]} numberOfLines={1}>
              {lastMsg.text}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: Platform.OS === "web" ? 67 : insets.top + 16 }]}>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>{t("messages")}</Text>
        <Text style={[styles.headerSub, { color: colors.mutedForeground }]}>{t("messagesSubtitle")}</Text>
      </View>

      <FlatList
        data={sorted}
        keyExtractor={item => item.id}
        renderItem={renderThread}
        contentContainerStyle={[styles.list, { paddingBottom: bottomPad + 16 }]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={[styles.empty, { backgroundColor: colors.muted }]}>
            <Feather name="message-circle" size={40} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>{t("noMessagesYet")}</Text>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              {t("messagesEmptyText")}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  headerSub: {
    fontSize: 14,
    marginTop: 2,
  },
  list: {
    paddingHorizontal: 16,
    paddingTop: 4,
    gap: 10,
  },
  thread: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 20,
    fontWeight: "800",
  },
  threadContent: {
    flex: 1,
    gap: 2,
  },
  threadTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  threadName: {
    fontSize: 15,
    fontWeight: "700",
    flex: 1,
  },
  threadTime: {
    fontSize: 12,
    marginLeft: 8,
  },
  threadListing: {
    fontSize: 12,
    fontWeight: "600",
  },
  threadLast: {
    fontSize: 13,
  },
  empty: {
    margin: 20,
    padding: 40,
    borderRadius: 16,
    alignItems: "center",
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  emptyText: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
});
