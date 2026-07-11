import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Play, Square } from "lucide-react-native";

import { trackerColors } from "@/constants/trackerTheme";

type TrackingButtonsProps = {
  isTracking: boolean;
  onStart: () => void;
  onStop: () => void;
};

export function TrackingButtons({
  isTracking,
  onStart,
  onStop,
}: TrackingButtonsProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, styles.startButton, isTracking && styles.disabled]}
        onPress={onStart}
        disabled={isTracking}
        activeOpacity={0.7}
      >
        <Play size={20} color="#fff" fill="#fff" />
        <Text style={styles.label}>Iniciar</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.stopButton, !isTracking && styles.disabled]}
        onPress={onStop}
        disabled={!isTracking}
        activeOpacity={0.7}
      >
        <Square size={20} color="#fff" fill="#fff" />
        <Text style={styles.label}>Parar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 14,
  },
  button: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 16,
    borderRadius: 16,
  },
  startButton: {
    backgroundColor: trackerColors.success,
  },
  stopButton: {
    backgroundColor: trackerColors.danger,
  },
  disabled: {
    opacity: 0.3,
  },
  label: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});
