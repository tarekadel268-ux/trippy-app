import { useCallback, useEffect, useRef } from "react";
import { Platform } from "react-native";
import { AD_UNIT_IDS } from "@/lib/ads";
import { isExpoGo } from "@/lib/isExpoGo";

const THRESHOLD = 4;
let globalActions = 0;

export function useInterstitialAd() {
  const s = useRef({
    ad: null as any,
    listeners: [] as (() => void)[],
    loaded: false,
  });
  const loadRef = useRef<() => void>(() => {});

  const load = useCallback(async () => {
    if (Platform.OS === "web" || isExpoGo) return;
    try {
      const { InterstitialAd, AdEventType } = await import(
        "react-native-google-mobile-ads"
      );

      const state = s.current;
      state.listeners.forEach((fn) => fn());
      state.listeners = [];
      state.loaded = false;

      const ad = InterstitialAd.createForAdRequest(AD_UNIT_IDS.INTERSTITIAL);
      state.ad = ad;

      state.listeners = [
        ad.addAdEventListener(AdEventType.LOADED, () => {
          state.loaded = true;
        }),
        ad.addAdEventListener(AdEventType.CLOSED, () => {
          state.loaded = false;
          state.ad = null;
          setTimeout(() => loadRef.current(), 1000);
        }),
        ad.addAdEventListener(AdEventType.ERROR, () => {
          state.loaded = false;
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
    };
  }, [load]);

  const trackAction = useCallback(() => {
    globalActions += 1;
    if (globalActions >= THRESHOLD) {
      globalActions = 0;
      const state = s.current;
      if (state.ad && state.loaded) {
        try {
          state.ad.show();
        } catch {
          /* ignore */
        }
      }
    }
  }, []);

  return { trackAction };
}
