import { View, Text, StyleSheet } from "react-native";
import { Navigation } from "lucide-react-native";

import { trackerColors } from "@/constants/trackerTheme";

type TrackerHeaderProps = {
  nomeUsuario: string;
};

export function TrackerHeader({ nomeUsuario }: TrackerHeaderProps) {
  return (
    <View style={styles.header}>
      <Navigation size={28} color={trackerColors.primary} />
      <View>
        <Text style={styles.title}>Rastreador</Text>
        <Text style={styles.subtitle}>{nomeUsuario}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: trackerColors.text,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: "600",
    color: trackerColors.primaryLight,
    marginTop: 2,
  },
});
