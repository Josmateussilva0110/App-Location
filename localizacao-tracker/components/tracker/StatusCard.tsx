import { View, Text, Animated, StyleSheet } from "react-native";
import { Satellite, MapPinOff } from "lucide-react-native";

import { trackerColors } from "@/constants/trackerTheme";

type StatusCardProps = {
  isTracking: boolean;
  status: string;
  pulseAnim: Animated.Value;
};

export function StatusCard({ isTracking, status, pulseAnim }: StatusCardProps) {
  return (
    <View style={styles.card}>
      <Animated.View
        style={[
          styles.iconContainer,
          isTracking ? styles.iconActive : styles.iconInactive,
          { transform: [{ scale: pulseAnim }] },
        ]}
      >
        {isTracking ? (
          <Satellite size={32} color="#fff" />
        ) : (
          <MapPinOff size={32} color="#fff" />
        )}
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
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: trackerColors.card,
    borderRadius: 20,
    padding: 28,
    alignItems: "center",
    gap: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: trackerColors.border,
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  iconActive: {
    backgroundColor: trackerColors.success,
  },
  iconInactive: {
    backgroundColor: trackerColors.inactive,
  },
  statusText: {
    fontSize: 20,
    fontWeight: "700",
  },
  statusActive: {
    color: trackerColors.successLight,
  },
  statusInactive: {
    color: trackerColors.inactiveText,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  badgeActive: {
    backgroundColor: "rgba(34, 197, 94, 0.15)",
  },
  badgeInactive: {
    backgroundColor: "rgba(100, 116, 139, 0.15)",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    backgroundColor: trackerColors.success,
  },
  dotInactive: {
    backgroundColor: trackerColors.inactive,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.5,
  },
  badgeTextActive: {
    color: trackerColors.successLight,
  },
  badgeTextInactive: {
    color: trackerColors.inactiveText,
  },
});
