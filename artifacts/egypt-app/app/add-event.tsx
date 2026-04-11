import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { EventListing, useApp } from "@/contexts/AppContext";
import { useColors } from "@/hooks/useColors";

type Category = "concert" | "afro_techno" | "private_party";

const CATEGORIES: { key: Category; label: string }[] = [
  { key: "concert", label: "Concert" },
  { key: "afro_techno", label: "Afro & Techno" },
  { key: "private_party", label: "Private Party" },
];

export default function AddEventScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, addEvent } = useApp();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [venue, setVenue] = useState("");
  const [date, setDate] = useState("");
  const [category, setCategory] = useState<Category>("concert");
  const [description, setDescription] = useState("");
  const [priceEGP, setPriceEGP] = useState("");
  const [priceUSD, setPriceUSD] = useState("");
  const [contact, setContact] = useState(user?.phone || "");
  const [socialContact, setSocialContact] = useState("");

  const topPad = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const handleSubmit = async () => {
    if (!title.trim() || !venue.trim() || !date.trim() || !priceEGP || !description.trim()) {
      Alert.alert("Missing Fields", "Please fill in all required fields.");
      return;
    }
    const event: EventListing = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      holderName: user?.name || "Anonymous",
      holderPhone: contact,
      holderContact: socialContact,
      category,
      title: title.trim(),
      description: description.trim(),
      venue: venue.trim(),
      date: date.trim(),
      priceUSD: parseFloat(priceUSD) || Math.round(parseFloat(priceEGP) / 50),
      priceEGP: parseFloat(priceEGP),
      viewCount: 0,
      createdAt: new Date().toISOString(),
    };
    await addEvent(event);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert("Listed!", "Your ticket has been listed.", [{ text: "OK", onPress: () => router.back() }]);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 4, borderBottomColor: colors.border }]}>
        <TouchableOpacity style={[styles.backBtn, { backgroundColor: colors.muted }]} onPress={() => router.back()}>
          <Feather name="arrow-left" size={20} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>List a Ticket</Text>
      </View>

      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: bottomPad + 30 }]} showsVerticalScrollIndicator={false}>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.foreground }]}>Event Category</Text>
          <View style={styles.categoryRow}>
            {CATEGORIES.map(cat => (
              <TouchableOpacity
                key={cat.key}
                style={[styles.catBtn, { backgroundColor: category === cat.key ? colors.primary : colors.muted, borderColor: category === cat.key ? colors.primary : colors.border }]}
                onPress={() => setCategory(cat.key)}
              >
                <Text style={[styles.catBtnText, { color: category === cat.key ? "#fff" : colors.mutedForeground }]}>{cat.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.foreground }]}>Event Details</Text>
          {[
            { label: "Event Title *", value: title, set: setTitle, placeholder: "e.g. Amr Diab Live Concert" },
            { label: "Venue *", value: venue, set: setVenue, placeholder: "e.g. Cairo Stadium" },
            { label: "Date *", value: date, set: setDate, placeholder: "e.g. 2026-07-15" },
          ].map((f, i) => (
            <View key={i} style={styles.field}>
              <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>{f.label}</Text>
              <TextInput
                style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.muted }]}
                value={f.value}
                onChangeText={f.set}
                placeholder={f.placeholder}
                placeholderTextColor={colors.mutedForeground}
              />
            </View>
          ))}
          <View style={styles.field}>
            <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Description *</Text>
            <TextInput
              style={[styles.textarea, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.muted }]}
              value={description}
              onChangeText={setDescription}
              placeholder="Describe the ticket, section, any important details..."
              placeholderTextColor={colors.mutedForeground}
              multiline
              numberOfLines={4}
            />
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.foreground }]}>Pricing</Text>
          <View style={styles.priceRow}>
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Price (EGP) *</Text>
              <TextInput
                style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.muted }]}
                value={priceEGP}
                onChangeText={setPriceEGP}
                placeholder="1500"
                placeholderTextColor={colors.mutedForeground}
                keyboardType="numeric"
              />
            </View>
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Price (USD)</Text>
              <TextInput
                style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.muted }]}
                value={priceUSD}
                onChangeText={setPriceUSD}
                placeholder="auto"
                placeholderTextColor={colors.mutedForeground}
                keyboardType="numeric"
              />
            </View>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.foreground }]}>Your Contact Info</Text>
          <View style={styles.field}>
            <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Phone Number</Text>
            <TextInput
              style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.muted }]}
              value={contact}
              onChangeText={setContact}
              placeholder="+20 1XX XXX XXXX"
              placeholderTextColor={colors.mutedForeground}
              keyboardType="phone-pad"
            />
          </View>
          <View style={styles.field}>
            <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Social / WhatsApp</Text>
            <TextInput
              style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.muted }]}
              value={socialContact}
              onChangeText={setSocialContact}
              placeholder="@username or WhatsApp number"
              placeholderTextColor={colors.mutedForeground}
            />
          </View>
        </View>

        <TouchableOpacity style={[styles.submitBtn, { backgroundColor: colors.primary }]} onPress={handleSubmit}>
          <Feather name="plus-circle" size={18} color="#fff" />
          <Text style={styles.submitBtnText}>List My Ticket</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
  },
  scroll: {
    paddingHorizontal: 16,
    paddingTop: 20,
    gap: 16,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 18,
    gap: 14,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "700",
  },
  categoryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  catBtn: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  catBtnText: {
    fontWeight: "600",
    fontSize: 13,
  },
  field: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  textarea: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    height: 100,
    textAlignVertical: "top",
  },
  priceRow: {
    flexDirection: "row",
    gap: 12,
  },
  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 14,
  },
  submitBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});
