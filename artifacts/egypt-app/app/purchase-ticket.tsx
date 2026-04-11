import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PurchasedTicket, useApp } from "@/contexts/AppContext";
import { useColors } from "@/hooks/useColors";

type PaymentMethod = "card";

const CATEGORY_COLORS: Record<string, string> = {
  concert: "#e06848",
  afro_techno: "#7c3aed",
  private_party: "#c8963e",
};

export default function PurchaseTicketScreen() {
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { events, user, currency, addPurchasedTicket } = useApp();

  const event = events.find(e => e.id === eventId);

  const [qty, setQty] = useState(1);
  const [method] = useState<PaymentMethod>("card");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!event) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.mutedForeground }}>Event not found.</Text>
      </View>
    );
  }

  const catColor = CATEGORY_COLORS[event.category] || colors.primary;
  const totalUSD = event.priceUSD * qty;
  const totalEGP = event.priceEGP * qty;
  const totalDisplay = currency === "USD" ? `$${totalUSD}` : `EGP ${totalEGP.toLocaleString()}`;

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 24 : insets.bottom;

  const handleConfirm = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setLoading(true);
    await new Promise(r => setTimeout(r, 1800));
    const ticket: PurchasedTicket = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      eventId: event.id,
      eventTitle: event.title,
      quantity: qty,
      priceUSD: totalUSD,
      priceEGP: totalEGP,
      paymentMethod: method,
      purchasedAt: new Date().toISOString(),
    };
    await addPurchasedTicket(ticket);
    setLoading(false);
    setSuccess(true);
  };

  if (success) {
    return (
      <View style={[styles.successContainer, { backgroundColor: colors.background }]}>
        <View style={[styles.successCard, { backgroundColor: colors.card }]}>
          <View style={[styles.successIcon, { backgroundColor: colors.primary + "20" }]}>
            <Feather name="check-circle" size={56} color={colors.primary} />
          </View>
          <Text style={[styles.successTitle, { color: colors.foreground }]}>Ticket Confirmed!</Text>
          <Text style={[styles.successSub, { color: colors.mutedForeground }]}>
            Your {qty === 1 ? "ticket" : `${qty} tickets`} for{"\n"}
            <Text style={{ fontWeight: "700", color: colors.foreground }}>{event.title}</Text>
            {"\n"}have been reserved.
          </Text>
          <View style={[styles.successDetails, { backgroundColor: colors.muted, borderColor: colors.border }]}>
            <Row label="Event" value={event.title} colors={colors} />
            <Row label="Venue" value={event.venue} colors={colors} />
            <Row label="Date" value={new Date(event.date).toLocaleDateString("en-EG", { day: "numeric", month: "long", year: "numeric" })} colors={colors} />
            <Row label="Qty" value={`${qty} ticket${qty > 1 ? "s" : ""}`} colors={colors} />
            <Row label="Total Paid" value={totalDisplay} colors={colors} highlight catColor={catColor} />
          </View>
          <Text style={[styles.successNote, { color: colors.mutedForeground }]}>
            The ticket holder will contact you within 24h to confirm handover details.
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.doneBtn, { backgroundColor: colors.primary }]}
          onPress={() => router.replace("/(tabs)/events")}
        >
          <Text style={styles.doneBtnText}>Back to Events</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 8, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Purchase Ticket</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: bottomPad + 100 }]}
      >
        <View style={[styles.eventSummary, { backgroundColor: catColor + "18", borderColor: catColor + "44" }]}>
          <View style={[styles.catPill, { backgroundColor: catColor }]}>
            <Text style={styles.catPillText}>{event.category === "concert" ? "Concert" : event.category === "afro_techno" ? "Afro & Techno" : "Private Party"}</Text>
          </View>
          <Text style={[styles.eventTitle, { color: colors.foreground }]}>{event.title}</Text>
          <View style={styles.eventMeta}>
            <Feather name="map-pin" size={13} color={colors.mutedForeground} />
            <Text style={[styles.eventMetaText, { color: colors.mutedForeground }]}>{event.venue}</Text>
          </View>
          <View style={styles.eventMeta}>
            <Feather name="calendar" size={13} color={colors.mutedForeground} />
            <Text style={[styles.eventMetaText, { color: colors.mutedForeground }]}>
              {new Date(event.date).toLocaleDateString("en-EG", { day: "numeric", month: "long", year: "numeric" })}
            </Text>
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>NUMBER OF TICKETS</Text>
          <View style={styles.qtyRow}>
            <TouchableOpacity
              style={[styles.qtyBtn, { backgroundColor: colors.muted, borderColor: colors.border }]}
              onPress={() => setQty(q => Math.max(1, q - 1))}
            >
              <Feather name="minus" size={18} color={colors.foreground} />
            </TouchableOpacity>
            <Text style={[styles.qtyNum, { color: colors.foreground }]}>{qty}</Text>
            <TouchableOpacity
              style={[styles.qtyBtn, { backgroundColor: colors.muted, borderColor: colors.border }]}
              onPress={() => setQty(q => Math.min(10, q + 1))}
            >
              <Feather name="plus" size={18} color={colors.foreground} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>PAYMENT METHOD</Text>
          <View style={[styles.cardMethodBadge, { backgroundColor: colors.primary + "14", borderColor: colors.primary + "44" }]}>
            <Feather name="credit-card" size={18} color={colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.methodLabel, { color: colors.foreground }]}>Credit / Debit Card</Text>
              <Text style={[styles.methodDesc, { color: colors.mutedForeground }]}>Visa, Mastercard, Amex</Text>
            </View>
          </View>
          <View style={styles.cardFields}>
            <View style={styles.inputWrap}>
              <Text style={[styles.inputLabel, { color: colors.mutedForeground }]}>Card Number</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.muted, borderColor: colors.border, color: colors.foreground }]}
                placeholder="1234 5678 9012 3456"
                placeholderTextColor={colors.mutedForeground}
                value={cardNumber}
                onChangeText={t => setCardNumber(t.replace(/\D/g, "").replace(/(.{4})/g, "$1 ").trim().slice(0, 19))}
                keyboardType="numeric"
                maxLength={19}
              />
            </View>
            <View style={styles.cardRow}>
              <View style={[styles.inputWrap, { flex: 1 }]}>
                <Text style={[styles.inputLabel, { color: colors.mutedForeground }]}>Expiry</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.muted, borderColor: colors.border, color: colors.foreground }]}
                  placeholder="MM/YY"
                  placeholderTextColor={colors.mutedForeground}
                  value={cardExpiry}
                  onChangeText={t => {
                    const clean = t.replace(/\D/g, "");
                    setCardExpiry(clean.length > 2 ? `${clean.slice(0, 2)}/${clean.slice(2, 4)}` : clean);
                  }}
                  keyboardType="numeric"
                  maxLength={5}
                />
              </View>
              <View style={[styles.inputWrap, { flex: 1 }]}>
                <Text style={[styles.inputLabel, { color: colors.mutedForeground }]}>CVC</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.muted, borderColor: colors.border, color: colors.foreground }]}
                  placeholder="123"
                  placeholderTextColor={colors.mutedForeground}
                  value={cardCvc}
                  onChangeText={setCardCvc}
                  keyboardType="numeric"
                  maxLength={4}
                  secureTextEntry
                />
              </View>
            </View>
          </View>
        </View>

        <View style={[styles.orderSummary, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>ORDER SUMMARY</Text>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryKey, { color: colors.mutedForeground }]}>
              {qty} × ticket{qty > 1 ? "s" : ""}
            </Text>
            <Text style={[styles.summaryVal, { color: colors.foreground }]}>
              {currency === "USD" ? `$${event.priceUSD}` : `EGP ${event.priceEGP.toLocaleString()}`} each
            </Text>
          </View>
          <View style={[styles.totalRow, { borderTopColor: colors.border }]}>
            <Text style={[styles.totalLabel, { color: colors.foreground }]}>Total</Text>
            <Text style={[styles.totalValue, { color: catColor }]}>{totalDisplay}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: bottomPad + 12, borderTopColor: colors.border, backgroundColor: colors.background }]}>
        <TouchableOpacity
          style={[styles.confirmBtn, { backgroundColor: catColor, opacity: loading ? 0.7 : 1 }]}
          onPress={handleConfirm}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Feather name="lock" size={16} color="#fff" />
              <Text style={styles.confirmBtnText}>Confirm Purchase — {totalDisplay}</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

function MethodOption({
  id, label, icon, desc, selected, onSelect, colors, accentColor,
}: {
  id: string; label: string; icon: any; desc: string;
  selected: boolean; onSelect: () => void; colors: any; accentColor: string;
}) {
  return (
    <TouchableOpacity
      style={[
        styles.methodOption,
        {
          backgroundColor: selected ? accentColor + "15" : colors.muted,
          borderColor: selected ? accentColor : colors.border,
        },
      ]}
      onPress={onSelect}
      activeOpacity={0.8}
    >
      <View style={[styles.methodIcon, { backgroundColor: accentColor + "20" }]}>
        <Feather name={icon} size={20} color={accentColor} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.methodLabel, { color: colors.foreground }]}>{label}</Text>
        <Text style={[styles.methodDesc, { color: colors.mutedForeground }]}>{desc}</Text>
      </View>
      <View style={[
        styles.radio,
        { borderColor: selected ? accentColor : colors.border, backgroundColor: selected ? accentColor : "transparent" }
      ]}>
        {selected && <Feather name="check" size={12} color="#fff" />}
      </View>
    </TouchableOpacity>
  );
}

function Row({ label, value, colors, highlight, catColor }: any) {
  return (
    <View style={styles.detailRow}>
      <Text style={[styles.detailKey, { color: colors.mutedForeground }]}>{label}</Text>
      <Text style={[styles.detailVal, { color: highlight ? catColor : colors.foreground }]} numberOfLines={1}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 17, fontWeight: "700" },
  scroll: { padding: 16, gap: 14 },
  eventSummary: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 8,
  },
  catPill: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 4,
  },
  catPillText: { color: "#fff", fontWeight: "700", fontSize: 11 },
  eventTitle: { fontSize: 18, fontWeight: "800", lineHeight: 24 },
  eventMeta: { flexDirection: "row", alignItems: "center", gap: 6 },
  eventMetaText: { fontSize: 13 },
  section: { borderRadius: 16, padding: 18, gap: 12 },
  sectionLabel: { fontSize: 11, fontWeight: "700", letterSpacing: 1 },
  qtyRow: { flexDirection: "row", alignItems: "center", gap: 20 },
  qtyBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  qtyNum: { fontSize: 26, fontWeight: "800", minWidth: 32, textAlign: "center" },
  cardMethodBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  methodList: { gap: 10 },
  methodOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  methodIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  methodLabel: { fontSize: 15, fontWeight: "700" },
  methodDesc: { fontSize: 12, marginTop: 2 },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  payInfo: {
    flexDirection: "row",
    gap: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  payInfoTitle: { fontSize: 13, fontWeight: "700" },
  payInfoValue: { fontSize: 14, fontWeight: "800", marginTop: 2 },
  payInfoNote: { fontSize: 12, marginTop: 4, lineHeight: 17 },
  inputWrap: { gap: 6 },
  inputLabel: { fontSize: 12, fontWeight: "600", letterSpacing: 0.5 },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  cardFields: { gap: 12 },
  cardRow: { flexDirection: "row", gap: 12 },
  orderSummary: { borderRadius: 16, padding: 18, gap: 12, borderWidth: 1 },
  summaryRow: { flexDirection: "row", justifyContent: "space-between" },
  summaryKey: { fontSize: 14 },
  summaryVal: { fontSize: 14 },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    paddingTop: 12,
  },
  totalLabel: { fontSize: 17, fontWeight: "700" },
  totalValue: { fontSize: 24, fontWeight: "900" },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  confirmBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 16,
    borderRadius: 16,
  },
  confirmBtnText: { color: "#fff", fontSize: 16, fontWeight: "800" },
  successContainer: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    gap: 20,
  },
  successCard: {
    borderRadius: 24,
    padding: 28,
    gap: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  successIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  successTitle: { fontSize: 28, fontWeight: "900", letterSpacing: -0.5 },
  successSub: { fontSize: 15, lineHeight: 22, textAlign: "center" },
  successDetails: {
    width: "100%",
    borderRadius: 14,
    padding: 16,
    gap: 10,
    borderWidth: 1,
  },
  detailRow: { flexDirection: "row", justifyContent: "space-between", gap: 12 },
  detailKey: { fontSize: 13 },
  detailVal: { fontSize: 13, fontWeight: "700", flexShrink: 1, textAlign: "right" },
  successNote: { fontSize: 12, textAlign: "center", lineHeight: 18, paddingHorizontal: 8 },
  doneBtn: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  doneBtnText: { color: "#fff", fontWeight: "800", fontSize: 16 },
});
