import { Feather } from "@expo/vector-icons";
import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useApp } from "@/contexts/AppContext";
import { useColors } from "@/hooks/useColors";

export type SortMode = "most_viewed" | "price_high" | "price_low";

interface Props {
  sortMode: SortMode;
  onSortChange: (mode: SortMode) => void;
}

export default function FilterBar({ sortMode, onSortChange }: Props) {
  const colors = useColors();
  const { currency, setCurrency } = useApp();

  const sorts: { key: SortMode; label: string; icon: string }[] = [
    { key: "most_viewed", label: "Most Viewed", icon: "trending-up" },
    { key: "price_high", label: "Price: High", icon: "arrow-down" },
    { key: "price_low", label: "Price: Low", icon: "arrow-up" },
  ];

  return (
    <View style={[styles.container, { borderBottomColor: colors.border }]}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {sorts.map(s => {
          const active = sortMode === s.key;
          return (
            <TouchableOpacity
              key={s.key}
              style={[
                styles.chip,
                {
                  backgroundColor: active ? colors.primary : colors.muted,
                  borderColor: active ? colors.primary : colors.border,
                },
              ]}
              onPress={() => onSortChange(s.key)}
            >
              <Feather name={s.icon as any} size={12} color={active ? "#fff" : colors.mutedForeground} />
              <Text style={[styles.chipText, { color: active ? "#fff" : colors.mutedForeground }]}>{s.label}</Text>
            </TouchableOpacity>
          );
        })}
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <TouchableOpacity
          style={[styles.currencyToggle, { backgroundColor: colors.deepBlue }]}
          onPress={() => setCurrency(currency === "USD" ? "EGP" : "USD")}
        >
          <Feather name="refresh-cw" size={12} color="#fff" />
          <Text style={styles.currencyText}>{currency}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
  },
  scroll: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 13,
    fontWeight: "600",
  },
  divider: {
    width: 1,
    height: 24,
    marginHorizontal: 4,
  },
  currencyToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
  },
  currencyText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
  },
});
