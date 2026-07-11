import { View, Text, StyleSheet } from "react-native";
import { MapPin, Globe } from "lucide-react-native";

import {
  trackerColors,
  trackerRadius,
  trackerShadow,
} from "@/constants/trackerTheme";

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
  const location = [city, state].filter(Boolean).join(", ");

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <MapPin size={16} color={trackerColors.primaryLight} strokeWidth={2.5} />
        </View>
        <Text style={styles.title}>Coordenadas atuais</Text>
      </View>

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

      {location ? (
        <View style={styles.addressRow}>
          <Globe size={15} color={trackerColors.textMuted} strokeWidth={2} />
          <Text style={styles.addressValue} numberOfLines={1}>
            {location}
          </Text>
        </View>
      ) : null}

      {latitude === null && (
        <Text style={styles.hint}>Aguardando permissão de localização…</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: trackerColors.card,
    borderRadius: trackerRadius.xl,
    padding: 22,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: trackerColors.border,
    ...trackerShadow.card,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 20,
  },
  headerIcon: {
    width: 30,
    height: 30,
    borderRadius: 9,
    backgroundColor: "rgba(99, 102, 241, 0.14)",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 14,
    fontWeight: "700",
    color: trackerColors.textMuted,
    letterSpacing: 0.2,
  },
  grid: {
    flexDirection: "row",
    alignItems: "center",
  },
  item: {
    flex: 1,
    alignItems: "center",
    gap: 6,
  },
  separator: {
    width: 1,
    height: 44,
    backgroundColor: trackerColors.border,
  },
  label: {
    fontSize: 11,
    color: trackerColors.primaryLight,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  value: {
    fontSize: 19,
    fontWeight: "700",
    color: trackerColors.text,
    fontVariant: ["tabular-nums"],
    letterSpacing: -0.3,
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 18,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: trackerColors.border,
  },
  addressValue: {
    fontSize: 15,
    fontWeight: "600",
    color: trackerColors.text,
    letterSpacing: 0.2,
  },
  hint: {
    fontSize: 12.5,
    color: trackerColors.textSubtle,
    textAlign: "center",
    marginTop: 14,
    fontStyle: "italic",
  },
});
