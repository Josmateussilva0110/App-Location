import { View, Text, StyleSheet } from "react-native";
import { MapPin } from "lucide-react-native";

import { trackerColors } from "@/constants/trackerTheme";

type CoordinatesCardProps = {
  latitude: number | null;
  longitude: number | null;
  city: string;
  state: string;
};

export function CoordinatesCard({
  latitude,
  longitude,
  city,
  state,
}: CoordinatesCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <MapPin size={20} color={trackerColors.primary} />
        <Text style={styles.title}>Coordenadas Atuais</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.grid}>
        <View style={styles.item}>
          <Text style={styles.label}>Latitude</Text>
          <Text style={styles.value}>
            {latitude !== null ? latitude.toFixed(6) : "—"}
          </Text>
        </View>

        <View style={styles.separator} />

        <View style={styles.item}>
          <Text style={styles.label}>Longitude</Text>
          <Text style={styles.value}>
            {longitude !== null ? longitude.toFixed(6) : "—"}
          </Text>
        </View>
      </View>

      {(city || state) && (
        <View style={styles.addressRow}>
          <Text style={styles.label}>Local</Text>
          <Text style={styles.addressValue}>
            {[city, state].filter(Boolean).join(" — ")}
          </Text>
        </View>
      )}

      {latitude === null && (
        <Text style={styles.hint}>
          Aguardando permissão de localização...
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: trackerColors.card,
    borderRadius: 20,
    padding: 20,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: trackerColors.border,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: trackerColors.textMuted,
  },
  divider: {
    height: 1,
    backgroundColor: trackerColors.border,
    marginBottom: 16,
  },
  grid: {
    flexDirection: "row",
    alignItems: "center",
  },
  item: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  separator: {
    width: 1,
    height: 40,
    backgroundColor: trackerColors.border,
  },
  label: {
    fontSize: 12,
    color: trackerColors.primaryLight,
    fontWeight: "600",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  value: {
    fontSize: 18,
    fontWeight: "700",
    color: trackerColors.text,
    fontVariant: ["tabular-nums"],
  },
  addressRow: {
    marginTop: 16,
    alignItems: "center",
    gap: 4,
  },
  addressValue: {
    fontSize: 16,
    fontWeight: "600",
    color: trackerColors.text,
    textAlign: "center",
  },
  hint: {
    fontSize: 12,
    color: trackerColors.textSubtle,
    textAlign: "center",
    marginTop: 12,
    fontStyle: "italic",
  },
});
