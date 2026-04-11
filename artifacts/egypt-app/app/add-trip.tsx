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
import { TripOffer, useApp } from "@/contexts/AppContext";
import { useColors } from "@/hooks/useColors";

const CITIES = ["Alexandria", "Sharm El-Sheikh", "Dahab", "Nuweiba", "Hurghada", "Gouna", "Luxor", "Aswan"];

const INCLUDE_OPTIONS = ["Hotel", "Hostel", "Beach Camp", "Breakfast", "Half-board", "All-inclusive", "Guide", "Transport", "Airport Transfer", "Diving", "Snorkeling", "Water Sports", "Desert Trip", "Boat Tour", "Balloon Ride", "Felucca"];

export default function AddTripScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, addTrip } = useApp();
  const router = useRouter();

  const [city, setCity] = useState(CITIES[0]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priceEGP, setPriceEGP] = useState("");
  const [priceUSD, setPriceUSD] = useState("");
  const [days, setDays] = useState("");
  const [includes, setIncludes] = useState<string[]>([]);

  const topPad = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const toggleInclude = (item: string) => {
    setIncludes(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);
  };

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim() || !priceEGP || !days) {
      Alert.alert("Missing Fields", "Please fill in all required fields.");
      return;
    }
    const trip: TripOffer = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      plannerName: user?.name || "Trip Planner",
      plannerPhone: user?.phone || "",
      plannerVerified: user?.isVerified || false,
      city,
      title: title.trim(),
      description: description.trim(),
      priceUSD: parseFloat(priceUSD) || Math.round(parseFloat(priceEGP) / 50),
      priceEGP: parseFloat(priceEGP),
      days: parseInt(days) || 1,
      viewCount: 0,
      includes,
      createdAt: new Date().toISOString(),
    };
    await addTrip(trip);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert("Published!", "Your trip offer is now live.", [{ text: "OK", onPress: () => router.back() }]);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 4, borderBottomColor: colors.border }]}>
        <TouchableOpacity style={[styles.backBtn, { backgroundColor: colors.muted }]} onPress={() => router.back()}>
          <Feather name="arrow-left" size={20} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>List a Trip</Text>
      </View>

      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: bottomPad + 30 }]} showsVerticalScrollIndicator={false}>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.foreground }]}>Destination City</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cityRow}>
            {CITIES.map(c => (
              <TouchableOpacity
                key={c}
                style={[styles.cityBtn, { backgroundColor: city === c ? colors.primary : colors.muted, borderColor: city === c ? colors.primary : colors.border }]}
                onPress={() => setCity(c)}
              >
                <Text style={[styles.cityBtnText, { color: city === c ? "#fff" : colors.mutedForeground }]}>{c}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.foreground }]}>Trip Details</Text>
          {[
            { label: "Trip Title *", value: title, set: setTitle, placeholder: "e.g. Luxor Pharaohs 3-Day Package" },
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
              placeholder="What will the tourist experience? What's included?"
              placeholderTextColor={colors.mutedForeground}
              multiline
              numberOfLines={4}
            />
          </View>
          <View style={styles.field}>
            <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Duration (Days) *</Text>
            <TextInput
              style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.muted }]}
              value={days}
              onChangeText={setDays}
              placeholder="3"
              placeholderTextColor={colors.mutedForeground}
              keyboardType="numeric"
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
                placeholder="5000"
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
          <Text style={[styles.cardTitle, { color: colors.foreground }]}>What's Included?</Text>
          <View style={styles.includesGrid}>
            {INCLUDE_OPTIONS.map(item => {
              const selected = includes.includes(item);
              return (
                <TouchableOpacity
                  key={item}
                  style={[styles.includeBtn, { backgroundColor: selected ? colors.primary + "18" : colors.muted, borderColor: selected ? colors.primary : colors.border }]}
                  onPress={() => toggleInclude(item)}
                >
                  {selected && <Feather name="check" size={12} color={colors.primary} />}
                  <Text style={[styles.includeBtnText, { color: selected ? colors.primary : colors.mutedForeground }]}>{item}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <TouchableOpacity style={[styles.submitBtn, { backgroundColor: colors.success }]} onPress={handleSubmit}>
          <Feather name="map-pin" size={18} color="#fff" />
          <Text style={styles.submitBtnText}>Publish Trip Offer</Text>
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
  cityRow: {
    gap: 8,
    flexDirection: "row",
  },
  cityBtn: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  cityBtnText: {
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
  includesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  includeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  includeBtnText: {
    fontSize: 13,
    fontWeight: "500",
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
