import { View, Text, StyleSheet, Platform, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Settings } from "lucide-react-native";

import {
  trackerColors,
  trackerRadius,
  trackerShadow,
} from "@/constants/trackerTheme";

type TrackerHeaderProps = {
  userName: string;
  deviceId?: string | null;
};

export function TrackerHeader({ userName, deviceId }: TrackerHeaderProps) {
  const router = useRouter();

  return (
    <View style={styles.header}>
      <View style={styles.textGroup}>
        <Text style={styles.title}>Rastreador</Text>
        <View style={styles.userRow}>
          <View style={styles.userDot} />
          <Text style={styles.subtitle} numberOfLines={1}>
            {userName}
          </Text>
        </View>
        {deviceId ? (
          <Text style={styles.deviceId} numberOfLines={1}>
            ID: {deviceId}
          </Text>
        ) : null}
      </View>

      <TouchableOpacity
        style={styles.settingsButton}
        onPress={() => router.push("/settings")}
        activeOpacity={0.7}
        accessibilityLabel="Configurações"
      >
        <Settings size={20} color={trackerColors.textMuted} strokeWidth={2.2} />
      </TouchableOpacity>
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
  settingsButton: {
    width: 42,
    height: 42,
    borderRadius: trackerRadius.sm,
    borderWidth: 1,
    borderColor: trackerColors.border,
    backgroundColor: trackerColors.card,
    justifyContent: "center",
    alignItems: "center",
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
  deviceId: {
    fontSize: 11,
    fontWeight: "500",
    color: trackerColors.textMuted,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    letterSpacing: 0.3,
    marginTop: 3,
  },
});
