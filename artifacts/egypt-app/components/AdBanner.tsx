import React, { useEffect, useState } from "react";
import { Platform, View, ViewStyle } from "react-native";
import { AD_UNIT_IDS } from "@/lib/ads";

interface AdBannerProps {
  style?: ViewStyle;
}

export function AdBanner({ style }: AdBannerProps) {
  const [Comp, setComp] = useState<any>(null);
  const [size, setSize] = useState<any>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (Platform.OS === "web") return;
    import("react-native-google-mobile-ads")
      .then(({ BannerAd, BannerAdSize }) => {
        setComp(() => BannerAd);
        setSize(BannerAdSize.BANNER);
      })
      .catch(() => setFailed(true));
  }, []);

  if (Platform.OS === "web" || !Comp || !size || failed) return null;

  return (
    <View style={[{ alignItems: "center", overflow: "hidden" }, style]}>
      <Comp
        unitId={AD_UNIT_IDS.BANNER}
        size={size}
        onAdFailedToLoad={() => setFailed(true)}
      />
    </View>
  );
}
