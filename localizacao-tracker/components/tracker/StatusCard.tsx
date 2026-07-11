import { View, Text, Animated, StyleSheet } from "react-native";
import { Satellite, MapPinOff } from "lucide-react-native";

import { trackerColors } from "@/constants/trackerTheme";

type StatusCardProps = {
  rastreando: boolean;
  status: string;
  pulseAnim: Animated.Value;
};

export function StatusCard({ rastreando, status, pulseAnim }: StatusCardProps) {
  return (
    <View style={styles.card}>
      <Animated.View
        style={[
          styles.iconContainer,
          rastreando ? styles.iconAtivo : styles.iconInativo,
          { transform: [{ scale: pulseAnim }] },
        ]}
      >
        {rastreando ? (
          <Satellite size={32} color="#fff" />
        ) : (
          <MapPinOff size={32} color="#fff" />
        )}
      </Animated.View>

      <Text
        style={[
          styles.statusText,
          rastreando ? styles.statusAtivo : styles.statusInativo,
        ]}
      >
        {status}
      </Text>

      <View
        style={[
          styles.badge,
          rastreando ? styles.badgeAtivo : styles.badgeInativo,
        ]}
      >
        <View
          style={[
            styles.dot,
            rastreando ? styles.dotAtivo : styles.dotInativo,
          ]}
        />
        <Text
          style={[
            styles.badgeText,
            rastreando ? styles.badgeTextoAtivo : styles.badgeTextoInativo,
          ]}
        >
          {rastreando ? "ATIVO" : "INATIVO"}
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
  iconAtivo: {
    backgroundColor: trackerColors.success,
  },
  iconInativo: {
    backgroundColor: trackerColors.inactive,
  },
  statusText: {
    fontSize: 20,
    fontWeight: "700",
  },
  statusAtivo: {
    color: trackerColors.successLight,
  },
  statusInativo: {
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
  badgeAtivo: {
    backgroundColor: "rgba(34, 197, 94, 0.15)",
  },
  badgeInativo: {
    backgroundColor: "rgba(100, 116, 139, 0.15)",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotAtivo: {
    backgroundColor: trackerColors.success,
  },
  dotInativo: {
    backgroundColor: trackerColors.inactive,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.5,
  },
  badgeTextoAtivo: {
    color: trackerColors.successLight,
  },
  badgeTextoInativo: {
    color: trackerColors.inactiveText,
  },
});
