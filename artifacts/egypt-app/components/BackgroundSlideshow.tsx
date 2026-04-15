import React, { useCallback, useEffect, useRef, useState } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import { Image } from "expo-image";
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const { width: SCREEN_W } = Dimensions.get("screen");

const IMAGES = [
  require("../assets/images/slideshow/slide1.jpeg"),
  require("../assets/images/slideshow/slide2.jpeg"),
  require("../assets/images/slideshow/slide3.jpeg"),
  require("../assets/images/slideshow/slide4.jpeg"),
  require("../assets/images/slideshow/slide5.jpeg"),
  require("../assets/images/slideshow/slide6.jpeg"),
  require("../assets/images/slideshow/slide7.jpeg"),
  require("../assets/images/slideshow/slide8.jpeg"),
];

const CONFIGS = [
  { stay: 4600, zoomTo: 1.05, ease: Easing.bezier(0.25, 0.1, 0.25, 1) },
  { stay: 5100, zoomTo: 1.04, ease: Easing.bezier(0.3, 0.0, 0.2, 1) },
  { stay: 4800, zoomTo: 1.06, ease: Easing.bezier(0.2, 0.1, 0.3, 1) },
  { stay: 5000, zoomTo: 1.05, ease: Easing.bezier(0.25, 0.0, 0.25, 1) },
  { stay: 4700, zoomTo: 1.05, ease: Easing.bezier(0.3, 0.1, 0.2, 1) },
  { stay: 4900, zoomTo: 1.04, ease: Easing.bezier(0.25, 0.1, 0.35, 1) },
  { stay: 5200, zoomTo: 1.06, ease: Easing.bezier(0.2, 0.0, 0.3, 1) },
  { stay: 4500, zoomTo: 1.05, ease: Easing.bezier(0.3, 0.0, 0.25, 1) },
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
  height = "100%",
}: Props) {
  const [aImg, setAImg] = useState(0);
  const [bImg, setBImg] = useState(1);
  const aIsFront = useRef(true);
  const imgIdxRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pausedRef = useRef(paused);
  const mountedRef = useRef(true);

  const aOpacity = useSharedValue(1);
  const aScale = useSharedValue(1);
  const bOpacity = useSharedValue(0);
  const bScale = useSharedValue(1);

  const aStyle = useAnimatedStyle(() => ({
    opacity: aOpacity.value,
    transform: [{ scale: aScale.value }],
  }));

  const bStyle = useAnimatedStyle(() => ({
    opacity: bOpacity.value,
    transform: [{ scale: bScale.value }],
  }));

  const advance = useCallback(() => {
    if (!mountedRef.current) return;
    if (pausedRef.current) {
      timerRef.current = setTimeout(advance, 500);
      return;
    }

    const nextIdx = (imgIdxRef.current + 1) % IMAGES.length;
    const cfg = CONFIGS[nextIdx];

    if (aIsFront.current) {
      bOpacity.value = 0;
      bScale.value = 1;
      setBImg(nextIdx);

      timerRef.current = setTimeout(() => {
        if (!mountedRef.current) return;
        bScale.value = withTiming(cfg.zoomTo, {
          duration: cfg.stay + FADE_MS,
          easing: cfg.ease,
        });
        bOpacity.value = withTiming(1, {
          duration: FADE_MS,
          easing: Easing.out(Easing.ease),
        });
        aOpacity.value = withTiming(0, {
          duration: FADE_MS,
          easing: Easing.in(Easing.ease),
        });

        aIsFront.current = false;
        imgIdxRef.current = nextIdx;
        timerRef.current = setTimeout(advance, cfg.stay);
      }, 50);
    } else {
      aOpacity.value = 0;
      aScale.value = 1;
      setAImg(nextIdx);

      timerRef.current = setTimeout(() => {
        if (!mountedRef.current) return;
        aScale.value = withTiming(cfg.zoomTo, {
          duration: cfg.stay + FADE_MS,
          easing: cfg.ease,
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
        timerRef.current = setTimeout(advance, cfg.stay);
      }, 50);
    }
  }, []);

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
      mountedRef.current = false;
      if (timerRef.current) clearTimeout(timerRef.current);
      cancelAnimation(aOpacity);
      cancelAnimation(aScale);
      cancelAnimation(bOpacity);
      cancelAnimation(bScale);
    };
  }, []);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  return (
    <View
      style={[styles.root, typeof height === "number" ? { height } : { height: "100%" }]}
      pointerEvents="none"
    >
      <Animated.View style={[styles.slide, bStyle]}>
        <Image
          source={IMAGES[bImg]}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          cachePolicy="memory-disk"
          recyclingKey={`slide-b-${bImg}`}
          transition={0}
        />
      </Animated.View>
      <Animated.View style={[styles.slide, aStyle]}>
        <Image
          source={IMAGES[aImg]}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          cachePolicy="memory-disk"
          recyclingKey={`slide-a-${aImg}`}
          transition={0}
        />
      </Animated.View>
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
