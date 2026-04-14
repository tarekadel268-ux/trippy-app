import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Linking, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ChatThread, OrganizerProfile, useApp } from "@/contexts/AppContext";
import { useColors } from "@/hooks/useColors";

export default function ContactOrganizer({ organizer }: { organizer: OrganizerProfile | null }) {
  const colors = useColors();
  const router = useRouter();
  const { user, chats, startChat } = useApp();

  if (!organizer) return null;

  const phone = organizer.phone?.replace(/[^\d+]/g, "");
  const existingThread = user
    ? chats.find((chat) => chat.participantId === organizer.id || chat.id === `org_${organizer.id}_${user.id}`)
    : null;

  const handleMessage = async () => {
    if (!user) {
      router.push("/" as any);
      return;
    }
    const threadId = existingThread?.id || `org_${organizer.id}_${user.id}`;
    const thread: ChatThread =
      existingThread || {
        id: threadId,
        participantId: organizer.id,
        participantName: organizer.name,
        listingId: organizer.id,
        listingTitle: organizer.name,
        messages: [],
        lastUpdated: new Date().toISOString(),
      };
    await startChat(thread);
    router.push(`/chat/${threadId}`);
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={[styles.title, { color: colors.foreground }]}>Contact Organizer</Text>
      <Text style={[styles.hostedBy, { color: colors.mutedForeground }]}>Hosted by {organizer.name}</Text>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: "#25D366" }, !phone && styles.disabled]}
          disabled={!phone}
          onPress={() => Linking.openURL(`https://wa.me/${phone.replace(/\D/g, "")}`)}
        >
          <Feather name="message-circle" size={16} color="#fff" />
          <Text style={styles.btnText}>WhatsApp</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btn, { backgroundColor: colors.primary }, !phone && styles.disabled]}
          disabled={!phone}
          onPress={() => Linking.openURL(`tel:${phone}`)}
        >
          <Feather name="phone" size={16} color="#fff" />
          <Text style={styles.btnText}>Call</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btn, { backgroundColor: colors.deepBlue }]}
          onPress={handleMessage}
        >
          <Feather name="mail" size={16} color="#fff" />
          <Text style={styles.btnText}>Message</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 18,
    gap: 10,
  },
  title: {
    fontSize: 17,
    fontWeight: "800",
  },
  hostedBy: {
    fontSize: 13,
    fontWeight: "600",
  },
  actions: {
    gap: 10,
  },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 13,
    borderRadius: 14,
  },
  btnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
  disabled: {
    opacity: 0.45,
  },
});
