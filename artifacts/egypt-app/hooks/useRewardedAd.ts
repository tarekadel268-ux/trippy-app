import { useCallback, useEffect, useRef, useState } from "react";
import { Platform } from "react-native";
import { AD_UNIT_IDS } from "@/lib/ads";

export function useRewardedAd() {
  const [isLoaded, setIsLoaded] = useState(false);
  const s = useRef({
    ad: null as any,
    listeners: [] as (() => void)[],
    rewardEarned: false,
    resolve: null as ((earned: boolean) => void) | null,
  });
  const loadRef = useRef<() => void>(() => {});

  const load = useCallback(async () => {
    if (Platform.OS === "web") return;
    try {
      const { RewardedAd, RewardedAdEventType, AdEventType } =
        await import("react-native-google-mobile-ads");

      const state = s.current;
      state.listeners.forEach((fn) => fn());
      state.listeners = [];
      state.rewardEarned = false;

      const ad = RewardedAd.createForAdRequest(AD_UNIT_IDS.REWARDED, {
        requestNonPersonalizedAdsOnly: false,
      });
      state.ad = ad;

      state.listeners = [
        ad.addAdEventListener(RewardedAdEventType.LOADED, () =>
          setIsLoaded(true)
        ),
        ad.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => {
          state.rewardEarned = true;
        }),
        ad.addAdEventListener(AdEventType.CLOSED, () => {
          const earned = state.rewardEarned;
          state.rewardEarned = false;
          state.ad = null;
          setIsLoaded(false);
          state.resolve?.(earned);
          state.resolve = null;
          setTimeout(() => loadRef.current(), 500);
        }),
        ad.addAdEventListener(AdEventType.ERROR, () => {
          state.ad = null;
          setIsLoaded(false);
          setTimeout(() => loadRef.current(), 5000);
        }),
      ];

      ad.load();
    } catch {
      // react-native-google-mobile-ads unavailable in Expo Go
    }
  }, []);

  useEffect(() => {
    loadRef.current = load;
  });

  useEffect(() => {
    load();
    return () => {
      const state = s.current;
      state.listeners.forEach((fn) => fn());
      state.listeners = [];
      state.ad = null;
      state.resolve = null;
    };
  }, [load]);

  const showRewardedAd = useCallback(
    (): Promise<boolean> =>
      new Promise((resolve) => {
        const state = s.current;
        if (!state.ad || !isLoaded) {
          resolve(false);
          return;
        }
        state.resolve = resolve;
        state.ad.show();
      }),
    [isLoaded]
  );

  return { isLoaded, showRewardedAd };
}
