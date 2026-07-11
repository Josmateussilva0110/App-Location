import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Navigation } from "lucide-react-native";

import {
  trackerColors,
  trackerGradients,
  trackerRadius,
  trackerShadow,
} from "@/constants/trackerTheme";

type TrackerHeaderProps = {
  userName: string;
};

export function TrackerHeader({ userName }: TrackerHeaderProps) {
  return (
    <View style={styles.header}>
      <LinearGradient
        colors={trackerGradients.brand}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.iconBadge}
      >
        <Navigation size={24} color="#fff" strokeWidth={2.5} />
      </LinearGradient>

      <View style={styles.textGroup}>
        <Text style={styles.title}>Rastreador</Text>
        <View style={styles.userRow}>
          <View style={styles.userDot} />
          <Text style={styles.subtitle} numberOfLines={1}>
            {userName}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 28,
  },
  iconBadge: {
    width: 50,
    height: 50,
    borderRadius: trackerRadius.md,
    justifyContent: "center",
    alignItems: "center",
    ...trackerShadow.glow,
  },
  textGroup: {
    flex: 1,
    gap: 3,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: trackerColors.text,
    letterSpacing: -0.6,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  userDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: trackerColors.primaryLight,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: "600",
    color: trackerColors.textMuted,
    letterSpacing: 0.2,
  },
});
