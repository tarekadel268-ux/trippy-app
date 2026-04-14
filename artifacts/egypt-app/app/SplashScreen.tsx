import { useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import { Animated, ImageBackground, StyleSheet, Text, View } from "react-native";

export default function SplashScreen() {
  const router = useRouter();
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      router.replace("/(tabs)");
    }, 10000);

    return () => clearTimeout(timer);
  }, [opacity, router, scale]);

  return (
    <View style={styles.container}>
      <ImageBackground
        source={{ uri: "https://pin.it/1x0eZWAbq" }}
        style={styles.image}
        resizeMode="cover"
      >
        <View style={styles.overlay} />
        <Animated.Text style={[styles.text, { opacity, transform: [{ scale }] }]}>Trippy</Animated.Text>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  image: {
    flex: 1,
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  text: {
    color: "#000",
    fontSize: 54,
    fontWeight: "900",
    fontFamily: "System",
    textAlign: "center",
  },
});
