import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { AD_UNIT_IDS } from "@/lib/ads";
import { isExpoGo } from "@/lib/isExpoGo";
import { useColors } from "@/hooks/useColors";

interface NativeAdCardProps {
  style?: ViewStyle;
}

export function NativeAdCard({ style }: NativeAdCardProps) {
  const colors = useColors();
  const [adState, setAdState] = useState<{
    ad: any;
    NativeAdView: any;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    if (Platform.OS === "web" || isExpoGo) {
      setLoading(false);
      return;
    }

    import("react-native-google-mobile-ads")
      .then(async ({ NativeAd, NativeAdView }) => {
        try {
          // createForAdRequest is async — resolves with ad data already filled
          const ad = await NativeAd.createForAdRequest(AD_UNIT_IDS.NATIVE);
          if (!mountedRef.current) {
            ad.destroy();
            return;
          }
          setAdState({ ad, NativeAdView });
          setLoading(false);
        } catch {
          if (mountedRef.current) {
            setFailed(true);
            setLoading(false);
          }
        }
      })
      .catch(() => {
        if (mountedRef.current) {
          setFailed(true);
          setLoading(false);
        }
      });

    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Destroy native ad on unmount
  useEffect(() => {
    return () => {
      if (adState?.ad) {
        try {
          adState.ad.destroy();
        } catch {}
      }
    };
  }, [adState]);

  if (Platform.OS === "web" || failed) return null;

  if (loading) {
    return (
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            alignItems: "center",
            justifyContent: "center",
            height: 100,
          },
          style,
        ]}
      >
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  }

  if (!adState) return null;

  const { ad, NativeAdView } = adState;
  const iconUrl = ad.icon?.url;
  const imageUrl = ad.images?.[0]?.url;

  return (
    <NativeAdView nativeAd={ad} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }, style]}>
      <View style={styles.adLabel}>
        <Text style={styles.adLabelText}>Ad</Text>
      </View>

      <View style={styles.body}>
        {(iconUrl || imageUrl) && (
          <Image
            source={{ uri: iconUrl ?? imageUrl }}
            style={styles.image}
            resizeMode="cover"
          />
        )}

        <View style={styles.content}>
          {ad.advertiser ? (
            <Text style={[styles.advertiser, { color: colors.mutedForeground }]}>
              {ad.advertiser}
            </Text>
          ) : null}

          {ad.headline ? (
            <Text style={[styles.headline, { color: colors.foreground }]} numberOfLines={2}>
              {ad.headline}
            </Text>
          ) : null}

          {ad.body ? (
            <Text style={[styles.bodyText, { color: colors.mutedForeground }]} numberOfLines={2}>
              {ad.body}
            </Text>
          ) : null}

          {ad.callToAction ? (
            <TouchableOpacity
              style={[styles.cta, { backgroundColor: colors.primary }]}
              activeOpacity={0.85}
            >
              <Text style={styles.ctaText}>{ad.callToAction}</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    </NativeAdView>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    padding: 14,
    gap: 10,
  },
  adLabel: {
    alignSelf: "flex-start",
    backgroundColor: "#f59e0b",
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
  },
  adLabelText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 0.5,
  },
  body: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },
  image: {
    width: 72,
    height: 72,
    borderRadius: 10,
  },
  content: {
    flex: 1,
    gap: 5,
  },
  advertiser: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  headline: {
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 20,
  },
  bodyText: {
    fontSize: 13,
    lineHeight: 18,
  },
  cta: {
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 4,
  },
  ctaText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
  },
});
