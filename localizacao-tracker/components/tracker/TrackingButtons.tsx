import { Text, TouchableOpacity, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Play, Square } from "lucide-react-native";

import {
  trackerColors,
  trackerGradients,
  trackerRadius,
  trackerShadow,
} from "@/constants/trackerTheme";

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
        style={styles.buttonWrap}
        onPress={onStart}
        disabled={isTracking}
        activeOpacity={0.85}
      >
        {isTracking ? (
          <View style={[styles.button, styles.disabledButton]}>
            <Play size={19} color={trackerColors.textSubtle} fill={trackerColors.textSubtle} />
            <Text style={[styles.label, styles.disabledLabel]}>Iniciar</Text>
          </View>
        ) : (
          <LinearGradient
            colors={trackerGradients.success}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.button, trackerShadow.glowSuccess]}
          >
            <Play size={19} color="#fff" fill="#fff" />
            <Text style={styles.label}>Iniciar</Text>
          </LinearGradient>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.buttonWrap}
        onPress={onStop}
        disabled={!isTracking}
        activeOpacity={0.85}
      >
        {!isTracking ? (
          <View style={[styles.button, styles.disabledButton]}>
            <Square size={18} color={trackerColors.textSubtle} fill={trackerColors.textSubtle} />
            <Text style={[styles.label, styles.disabledLabel]}>Parar</Text>
          </View>
        ) : (
          <LinearGradient
            colors={trackerGradients.danger}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.button}
          >
            <Square size={18} color="#fff" fill="#fff" />
            <Text style={styles.label}>Parar</Text>
          </LinearGradient>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 14,
  },
  buttonWrap: {
    flex: 1,
    borderRadius: trackerRadius.md,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 17,
    borderRadius: trackerRadius.md,
  },
  disabledButton: {
    backgroundColor: trackerColors.cardElevated,
    borderWidth: 1,
    borderColor: trackerColors.border,
  },
  label: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
    letterSpacing: 0.2,
  },
  disabledLabel: {
    color: trackerColors.textSubtle,
  },
});
