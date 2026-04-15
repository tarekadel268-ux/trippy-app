import React, { useCallback, useEffect, useRef, useState } from "react";
import { Dimensions, ImageRequireSource, StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  cancelAnimation,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("screen");

const IMAGES: ImageRequireSource[] = [
  require("../assets/images/slideshow/slide1.jpeg"),
  require("../assets/images/slideshow/slide2.jpeg"),
  require("../assets/images/slideshow/slide3.jpeg"),
  require("../assets/images/slideshow/slide4.jpeg"),
  require("../assets/images/slideshow/slide5.jpeg"),
  require("../assets/images/slideshow/slide6.jpeg"),
  require("../assets/images/slideshow/slide7.jpeg"),
  require("../assets/images/slideshow/slide8.jpeg"),
];

// Each slide has slightly different timing for cinematic feel
const CONFIGS = [
  { stay: 4600, zoomTo: 1.13, ease: Easing.bezier(0.25, 0.1, 0.25, 1) },
  { stay: 5100, zoomTo: 1.09, ease: Easing.bezier(0.3, 0.0, 0.2, 1) },
  { stay: 4800, zoomTo: 1.15, ease: Easing.bezier(0.2, 0.1, 0.3, 1) },
  { stay: 5000, zoomTo: 1.10, ease: Easing.bezier(0.25, 0.0, 0.25, 1) },
  { stay: 4700, zoomTo: 1.12, ease: Easing.bezier(0.3, 0.1, 0.2, 1) },
  { stay: 4900, zoomTo: 1.08, ease: Easing.bezier(0.25, 0.1, 0.35, 1) },
  { stay: 5200, zoomTo: 1.14, ease: Easing.bezier(0.2, 0.0, 0.3, 1) },
  { stay: 4500, zoomTo: 1.11, ease: Easing.bezier(0.3, 0.0, 0.25, 1) },
];

const FADE_MS = 800;

interface Props {
  paused?: boolean;
  overlayOpacity?: number;
  height?: number | string;
}

export function BackgroundSlideshow({
  paused = false,
  overlayOpacity = 0.42,
  height = SCREEN_H,
}: Props) {
  // Two alternating layers: A (front) and B (back)
  const [aImg, setAImg] = useState(0);
  const [bImg, setBImg] = useState(1);
  const aIsFront = useRef(true);
  const imgIdxRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pausedRef = useRef(paused);

  // Shared values for layer A
  const aOpacity = useSharedValue(1);
  const aScale = useSharedValue(1);

  // Shared values for layer B
  const bOpacity = useSharedValue(0);
  const bScale = useSharedValue(CONFIGS[1].zoomTo);

  const aStyle = useAnimatedStyle(() => ({
    opacity: aOpacity.value,
    transform: [{ scale: aScale.value }],
  }));

  const bStyle = useAnimatedStyle(() => ({
    opacity: bOpacity.value,
    transform: [{ scale: bScale.value }],
  }));

  const advance = useCallback(() => {
    if (pausedRef.current) {
      timerRef.current = setTimeout(advance, 500);
      return;
    }

    const current = imgIdxRef.current;
    const nextIdx = (current + 1) % IMAGES.length;
    const nextConfig = CONFIGS[nextIdx];
    const currentConfig = CONFIGS[current];

    if (aIsFront.current) {
      // A is front, B is back — bring B to front
      // Reset B scale to 1 and set its image
      bOpacity.value = 0;
      bScale.value = 1;
      runOnJS(setBImg)(nextIdx);

      // After a tick for the image to render, start transition
      timerRef.current = setTimeout(() => {
        // Start B's Ken Burns zoom over the full stay + fade duration
        bScale.value = withTiming(nextConfig.zoomTo, {
          duration: nextConfig.stay + FADE_MS,
          easing: nextConfig.ease,
        });
        // Fade B in
        bOpacity.value = withTiming(1, {
          duration: FADE_MS,
          easing: Easing.out(Easing.ease),
        });
        // Fade A out simultaneously
        aOpacity.value = withTiming(0, {
          duration: FADE_MS,
          easing: Easing.in(Easing.ease),
        });

        aIsFront.current = false;
        imgIdxRef.current = nextIdx;

        // Schedule next advance
        timerRef.current = setTimeout(advance, nextConfig.stay);
      }, 80);
    } else {
      // B is front, A is back — bring A to front
      aOpacity.value = 0;
      aScale.value = 1;
      runOnJS(setAImg)(nextIdx);

      timerRef.current = setTimeout(() => {
        aScale.value = withTiming(nextConfig.zoomTo, {
          duration: nextConfig.stay + FADE_MS,
          easing: nextConfig.ease,
        });
        aOpacity.value = withTiming(1, {
          duration: FADE_MS,
          easing: Easing.out(Easing.ease),
        });
        bOpacity.value = withTiming(0, {
          duration: FADE_MS,
          easing: Easing.in(Easing.ease),
        });

        aIsFront.current = true;
        imgIdxRef.current = nextIdx;

        timerRef.current = setTimeout(advance, nextConfig.stay);
      }, 80);
    }
  }, []);

  // Start first slide Ken Burns on mount
  useEffect(() => {
    const cfg0 = CONFIGS[0];
    aOpacity.value = 1;
    aScale.value = 1;
    aScale.value = withTiming(cfg0.zoomTo, {
      duration: cfg0.stay + FADE_MS,
      easing: cfg0.ease,
    });

    timerRef.current = setTimeout(advance, cfg0.stay);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      cancelAnimation(aOpacity);
      cancelAnimation(aScale);
      cancelAnimation(bOpacity);
      cancelAnimation(bScale);
    };
  }, []);

  // Sync pause ref
  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  return (
    <View style={[styles.root, typeof height === "number" ? { height } : { height: "100%" }]} pointerEvents="none">
      <Animated.Image
        source={IMAGES[bImg]}
        style={[styles.slide, bStyle]}
        resizeMode="cover"
        fadeDuration={0}
      />
      <Animated.Image
        source={IMAGES[aImg]}
        style={[styles.slide, aStyle]}
        resizeMode="cover"
        fadeDuration={0}
      />
      <View style={[styles.overlay, { backgroundColor: `rgba(0,0,0,${overlayOpacity})` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },
  slide: {
    position: "absolute",
    top: 0,
    left: 0,
    width: SCREEN_W,
    height: "100%",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
});
