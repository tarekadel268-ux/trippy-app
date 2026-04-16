import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Image } from "expo-image";

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

const STAY_MS = 7000;
const FADE_MS = 900;

interface Props {
  paused?: boolean;
  overlayOpacity?: number;
  height?: number | string;
}

export const BackgroundSlideshow = React.memo(function BackgroundSlideshow({
  paused = false,
  overlayOpacity = 0.15,
  height = "100%",
}: Props) {
  const [idx, setIdx] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pausedRef = useRef(paused);
  const mountedRef = useRef(true);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    function tick() {
      if (!mountedRef.current) return;
      if (!pausedRef.current) {
        setIdx(prev => (prev + 1) % IMAGES.length);
      }
      timerRef.current = setTimeout(tick, STAY_MS);
    }

    timerRef.current = setTimeout(tick, STAY_MS);

    return () => {
      mountedRef.current = false;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <View
      style={[styles.root, typeof height === "number" ? { height } : { height: "100%" }]}
      pointerEvents="none"
    >
      <Image
        source={IMAGES[idx]}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        cachePolicy="memory-disk"
        transition={{ duration: FADE_MS, effect: "cross-dissolve", timing: "ease-in-out" }}
      />
      <View style={[styles.overlay, { backgroundColor: `rgba(0,0,0,${overlayOpacity})` }]} />
    </View>
  );
});

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
});
