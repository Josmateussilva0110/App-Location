import { Platform, StyleSheet } from "react-native";

/**
 * Premium dark design system.
 * Slate/zinc neutral base with a refined indigo accent.
 */
export const trackerColors = {
  // Surfaces
  background: "#08080C",
  backgroundElevated: "#0D0D13",
  card: "#121219",
  cardElevated: "#17171F",
  cardHover: "#1C1C26",
  border: "#22222E",
  borderSubtle: "rgba(255, 255, 255, 0.06)",
  borderStrong: "#2C2C3A",

  // Brand / accent
  primary: "#6366F1",
  primaryLight: "#818CF8",
  primaryDark: "#4F46E5",
  accent: "#A5B4FC",

  // Text
  text: "#F4F4F5",
  textMuted: "#A1A1AA",
  textSubtle: "#5B5B66",

  // Semantic
  success: "#10B981",
  successLight: "#34D399",
  danger: "#EF4444",
  dangerLight: "#F87171",
  warning: "#F59E0B",
  warningLight: "#FBBF24",

  // Inactive
  inactive: "#3F3F49",
  inactiveText: "#8A8A96",
};

export const trackerGradients = {
  brand: ["#6366F1", "#4F46E5", "#7C3AED"] as const,
  brandSoft: ["#4F46E5", "#4338CA"] as const,
  success: ["#10B981", "#059669"] as const,
  danger: ["#F43F5E", "#E11D48"] as const,
  surface: ["#17171F", "#101017"] as const,
  hero: ["#1B1B27", "#111119"] as const,
};

export const trackerShadow = {
  card: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 8,
  },
  glow: {
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 20,
    elevation: 12,
  },
  glowSuccess: {
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 18,
    elevation: 12,
  },
};

export const trackerRadius = {
  sm: 12,
  md: 16,
  lg: 20,
  xl: 26,
  pill: 999,
};

export const trackerLayout = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: trackerColors.background,
    paddingHorizontal: 22,
    paddingTop: Platform.OS === "android" ? 44 : 60,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 18,
  },
  loadingText: {
    color: trackerColors.textMuted,
    fontSize: 15,
    fontWeight: "500",
    letterSpacing: 0.2,
  },
});
