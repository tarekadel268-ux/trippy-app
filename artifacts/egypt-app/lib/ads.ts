import { Platform } from "react-native";

const IS_DEV = __DEV__;

// Google-provided test IDs — safe to use during development
const TEST_IDS = {
  BANNER:
    Platform.OS === "ios"
      ? "ca-app-pub-3940256099942544/2934735716"
      : "ca-app-pub-3940256099942544/6300978111",
  REWARDED:
    Platform.OS === "ios"
      ? "ca-app-pub-3940256099942544/1712485313"
      : "ca-app-pub-3940256099942544/5224354917",
  INTERSTITIAL:
    Platform.OS === "ios"
      ? "ca-app-pub-3940256099942544/4411468910"
      : "ca-app-pub-3940256099942544/1033173712",
  NATIVE:
    Platform.OS === "ios"
      ? "ca-app-pub-3940256099942544/3986624511"
      : "ca-app-pub-3940256099942544/2247696110",
};

// Production ad unit IDs
const REAL_IDS = {
  BANNER: "ca-app-pub-7464041677255169/8197802834",
  REWARDED: "ca-app-pub-7464041677255169/8556895483",
  INTERSTITIAL: "ca-app-pub-7464041677255169/5779235049",
  NATIVE: "ca-app-pub-7464041677255169/2364402512",
};

export const AD_UNIT_IDS = {
  BANNER: IS_DEV ? TEST_IDS.BANNER : REAL_IDS.BANNER,
  REWARDED: IS_DEV ? TEST_IDS.REWARDED : REAL_IDS.REWARDED,
  INTERSTITIAL: IS_DEV ? TEST_IDS.INTERSTITIAL : REAL_IDS.INTERSTITIAL,
  NATIVE: IS_DEV ? TEST_IDS.NATIVE : REAL_IDS.NATIVE,
};

// Android App ID — used in app.json plugin config
export const ADMOB_ANDROID_APP_ID = "ca-app-pub-7464041677255169~3280518077";
export const ADMOB_IOS_APP_ID = "ca-app-pub-7464041677255169~7362399160";
