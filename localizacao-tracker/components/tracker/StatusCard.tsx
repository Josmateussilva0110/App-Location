import { View, Text, Animated, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Satellite, MapPinOff } from "lucide-react-native";

import {
  trackerColors,
  trackerGradients,
  trackerRadius,
  trackerShadow,
} from "@/constants/trackerTheme";

type StatusCardProps = {
  isTracking: boolean;
  status: string;
  pulseAnim: Animated.Value;
};

export function StatusCard({ isTracking, status, pulseAnim }: StatusCardProps) {
  return (
    <LinearGradient
      colors={trackerGradients.hero}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}
    >
      <Animated.View
        style={[styles.iconWrap, { transform: [{ scale: pulseAnim }] }]}
      >
        <LinearGradient
          colors={
            isTracking
              ? trackerGradients.success
              : ["#3F3F49", "#2A2A32"]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.iconCircle,
            isTracking && trackerShadow.glowSuccess,
          ]}
        >
          {isTracking ? (
            <Satellite size={30} color="#fff" strokeWidth={2} />
          ) : (
            <MapPinOff size={30} color="#fff" strokeWidth={2} />
          )}
        </LinearGradient>
      </Animated.View>

      <Text
        style={[
          styles.statusText,
          isTracking ? styles.statusActive : styles.statusInactive,
        ]}
      >
        {status}
      </Text>

      <View
        style={[
          styles.badge,
          isTracking ? styles.badgeActive : styles.badgeInactive,
        ]}
      >
        <View
          style={[
            styles.dot,
            isTracking ? styles.dotActive : styles.dotInactive,
          ]}
        />
        <Text
          style={[
            styles.badgeText,
            isTracking ? styles.badgeTextActive : styles.badgeTextInactive,
          ]}
        >
          {isTracking ? "ATIVO" : "INATIVO"}
        </Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: trackerRadius.xl,
    paddingVertical: 32,
    paddingHorizontal: 28,
    alignItems: "center",
    gap: 18,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: trackerColors.borderSubtle,
    ...trackerShadow.card,
  },
  iconWrap: {
    width: 76,
    height: 76,
    justifyContent: "center",
    alignItems: "center",
  },
  iconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    justifyContent: "center",
    alignItems: "center",
  },
  statusText: {
    fontSize: 21,
    fontWeight: "700",
    letterSpacing: -0.3,
    textAlign: "center",
  },
  statusActive: {
    color: trackerColors.text,
  },
  statusInactive: {
    color: trackerColors.textMuted,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingVertical: 7,
    paddingHorizontal: 16,
    borderRadius: trackerRadius.pill,
    borderWidth: 1,
  },
  badgeActive: {
    backgroundColor: "rgba(16, 185, 129, 0.12)",
    borderColor: "rgba(16, 185, 129, 0.3)",
  },
  badgeInactive: {
    backgroundColor: "rgba(138, 138, 150, 0.1)",
    borderColor: "rgba(138, 138, 150, 0.22)",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    backgroundColor: trackerColors.successLight,
  },
  dotInactive: {
    backgroundColor: trackerColors.inactiveText,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.6,
  },
  badgeTextActive: {
    color: trackerColors.successLight,
  },
  badgeTextInactive: {
    color: trackerColors.inactiveText,
  },
});
