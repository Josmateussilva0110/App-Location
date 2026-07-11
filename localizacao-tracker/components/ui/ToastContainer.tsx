import { useEffect, useRef } from "react";
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CheckCircle, Info, XCircle, X } from "lucide-react-native";

import { trackerColors } from "@/constants/trackerTheme";
import { useToast, type Toast, type ToastType } from "@/contexts/ToastContext";

const toastStyles: Record<
  ToastType,
  { bg: string; border: string; icon: string; accent: string }
> = {
  success: {
    bg: "rgba(16, 185, 129, 0.14)",
    border: "rgba(16, 185, 129, 0.4)",
    icon: trackerColors.successLight,
    accent: trackerColors.successLight,
  },
  error: {
    bg: "rgba(239, 68, 68, 0.14)",
    border: "rgba(239, 68, 68, 0.4)",
    icon: trackerColors.dangerLight,
    accent: trackerColors.dangerLight,
  },
  info: {
    bg: "rgba(99, 102, 241, 0.14)",
    border: "rgba(99, 102, 241, 0.4)",
    icon: trackerColors.primaryLight,
    accent: trackerColors.primaryLight,
  },
};

function ToastIcon({ type }: { type: ToastType }) {
  const color = toastStyles[type].icon;
  const size = 20;

  switch (type) {
    case "success":
      return <CheckCircle size={size} color={color} />;
    case "error":
      return <XCircle size={size} color={color} />;
    default:
      return <Info size={size} color={color} />;
  }
}

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: Toast;
  onDismiss: () => void;
}) {
  const translateY = useRef(new Animated.Value(-20)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const style = toastStyles[toast.type];

  useEffect(() => {
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        damping: 18,
        stiffness: 200,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, translateY]);

  return (
    <Animated.View
      style={[
        styles.toast,
        {
          backgroundColor: style.bg,
          borderColor: style.border,
          opacity,
          transform: [{ translateY }],
        },
      ]}
    >
      <View style={[styles.accentBar, { backgroundColor: style.accent }]} />
      <ToastIcon type={toast.type} />
      <Text style={styles.message} numberOfLines={3}>
        {toast.message}
      </Text>
      <Pressable onPress={onDismiss} hitSlop={8} style={styles.closeBtn}>
        <X size={16} color={trackerColors.textSubtle} />
      </Pressable>
    </Animated.View>
  );
}

export function ToastContainer() {
  const insets = useSafeAreaInsets();
  const { toasts, dismissToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <View
      style={[styles.container, { top: insets.top + 8 }]}
      pointerEvents="box-none"
    >
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onDismiss={() => dismissToast(toast.id)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 16,
    right: 16,
    zIndex: 9999,
    gap: 8,
  },
  toast: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    paddingVertical: 13,
    paddingLeft: 18,
    paddingRight: 14,
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 8,
  },
  accentBar: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  message: {
    flex: 1,
    color: trackerColors.text,
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 20,
  },
  closeBtn: {
    padding: 2,
  },
});
