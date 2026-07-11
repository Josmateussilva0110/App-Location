import { useEffect, useRef } from "react";
import { View, Text, Animated, Easing, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Navigation } from "lucide-react-native";

import {
  trackerColors,
  trackerGradients,
  trackerLayout,
  trackerShadow,
} from "@/constants/trackerTheme";

type LoadingScreenProps = {
  message?: string;
};

export function LoadingScreen({ message }: LoadingScreenProps) {
  const spin = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 1400,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.08,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [spin, pulse]);

  const rotate = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View style={trackerLayout.container}>
      <View style={trackerLayout.loadingContainer}>
        <Animated.View
          style={[styles.wrap, { transform: [{ scale: pulse }] }]}
        >
          <Animated.View
            style={[styles.ring, { transform: [{ rotate }] }]}
          />

          <LinearGradient
            colors={trackerGradients.brand}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.iconCore}
          >
            <Navigation size={22} color="#fff" strokeWidth={2.5} />
          </LinearGradient>
        </Animated.View>

        {message ? (
          <Text style={trackerLayout.loadingText}>{message}</Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: 76,
    height: 76,
    justifyContent: "center",
    alignItems: "center",
  },
  ring: {
    position: "absolute",
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 3,
    borderColor: trackerColors.border,
    borderTopColor: trackerColors.primary,
    borderRightColor: trackerColors.primaryLight,
  },
  iconCore: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    ...trackerShadow.glow,
  },
});
