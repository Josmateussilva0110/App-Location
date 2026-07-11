import { Platform, StyleSheet } from "react-native";

export const trackerColors = {
  background: "#0f0f23",
  card: "#1a1a3e",
  border: "#2a2a5e",
  primary: "#6366f1",
  primaryLight: "#818cf8",
  text: "#e0e7ff",
  textMuted: "#c7d2fe",
  textSubtle: "#64748b",
  accent: "#a5b4fc",
  success: "#22c55e",
  successLight: "#4ade80",
  danger: "#ef4444",
  inactive: "#64748b",
  inactiveText: "#94a3b8",
};

export const trackerLayout = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: trackerColors.background,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === "android" ? 48 : 60,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  loadingText: {
    color: trackerColors.accent,
    fontSize: 16,
  },
});
