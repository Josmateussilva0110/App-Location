import { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { AlertTriangle, Satellite, WifiOff } from "lucide-react-native";

import { type SyncStatus } from "@/constants/location";
import {
  trackerColors,
  trackerGradients,
  trackerRadius,
  trackerShadow,
} from "@/constants/trackerTheme";

type SyncActivityCardProps = {
  isTracking: boolean;
  hasSent: boolean;
  justSent: boolean;
  syncStatus: SyncStatus;
};

const STATUS_CONTENT: Record<
  SyncStatus,
  { title: string; subtitle: string; badge: string }
> = {
  live: {
    title: "Sincronização ativa",
    subtitle: "Suas localizações estão sendo enviadas em segundo plano.",
    badge: "AO VIVO",
  },
  waiting: {
    title: "Sincronização ativa",
    subtitle: "Aguardando a primeira localização para enviar.",
    badge: "AGUARDANDO",
  },
  offline: {
    title: "Sem conexão",
    subtitle:
      "A internet está indisponível. As localizações serão enviadas quando a rede voltar.",
    badge: "OFFLINE",
  },
  failed: {
    title: "Falha na sincronização",
    subtitle:
      "Não foi possível enviar a última localização. Tentando novamente automaticamente.",
    badge: "ERRO",
  },
};

function PulseRing({ delay, color }: { delay: number; color: string }) {
  const scale = useRef(new Animated.Value(0.8)).current;
  const opacity = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(scale, {
            toValue: 2.2,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(scale, { toValue: 0.8, duration: 0, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0.5, duration: 0, useNativeDriver: true }),
        ]),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [delay, opacity, scale]);

  return (
    <Animated.View
      style={[
        styles.pulseRing,
        { opacity, transform: [{ scale }], borderColor: color },
      ]}
    />
  );
}

function LiveDots({ color }: { color: string }) {
  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const anim = (dot: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0.3, duration: 400, useNativeDriver: true }),
        ])
      );

    const a1 = anim(dot1, 0);
    const a2 = anim(dot2, 200);
    const a3 = anim(dot3, 400);
    a1.start();
    a2.start();
    a3.start();
    return () => {
      a1.stop();
      a2.stop();
      a3.stop();
    };
  }, [dot1, dot2, dot3]);

  return (
    <View style={styles.dotsRow}>
      {[dot1, dot2, dot3].map((dot, i) => (
        <Animated.View
          key={i}
          style={[styles.liveDot, { opacity: dot, backgroundColor: color }]}
        />
      ))}
    </View>
  );
}

function SyncIcon({ syncStatus }: { syncStatus: SyncStatus }) {
  const iconColor =
    syncStatus === "offline"
      ? trackerColors.inactiveText
      : syncStatus === "failed"
        ? trackerColors.warningLight
        : trackerColors.primaryLight;

  const iconBackground =
    syncStatus === "offline"
      ? "rgba(138, 138, 150, 0.16)"
      : syncStatus === "failed"
        ? "rgba(245, 158, 11, 0.15)"
        : "rgba(99, 102, 241, 0.16)";

  const Icon =
    syncStatus === "offline"
      ? WifiOff
      : syncStatus === "failed"
        ? AlertTriangle
        : Satellite;

  return (
    <View style={[styles.iconCircle, { backgroundColor: iconBackground }]}>
      <Icon size={26} color={iconColor} strokeWidth={2} />
    </View>
  );
}

export function SyncActivityCard({
  isTracking,
  hasSent,
  justSent,
  syncStatus,
}: SyncActivityCardProps) {
  const flashOpacity = useRef(new Animated.Value(0)).current;
  const content = STATUS_CONTENT[syncStatus];
  const isLive = syncStatus === "live";
  const isWaiting = syncStatus === "waiting";
  const isAnimated = isLive || isWaiting;

  const pulseColor =
    syncStatus === "offline"
      ? trackerColors.inactive
      : syncStatus === "failed"
        ? trackerColors.warning
        : trackerColors.primary;

  const badgeStyle =
    syncStatus === "offline"
      ? styles.badgeOffline
      : syncStatus === "failed"
        ? styles.badgeFailed
        : isWaiting
          ? styles.badgeWaiting
          : styles.badgeLive;

  const badgeTextStyle =
    syncStatus === "offline"
      ? styles.badgeTextOffline
      : syncStatus === "failed"
        ? styles.badgeTextFailed
        : isWaiting
          ? styles.badgeTextWaiting
          : styles.badgeTextLive;

  const badgeDotColor =
    syncStatus === "offline"
      ? trackerColors.inactive
      : syncStatus === "failed"
        ? trackerColors.warning
        : isWaiting
          ? trackerColors.primaryLight
          : trackerColors.successLight;

  useEffect(() => {
    if (!justSent) return;

    Animated.sequence([
      Animated.timing(flashOpacity, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(flashOpacity, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, [justSent, flashOpacity]);

  if (!isTracking) return null;

  return (
    <LinearGradient
      colors={trackerGradients.surface}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        styles.card,
        syncStatus === "offline" && styles.cardOffline,
        syncStatus === "failed" && styles.cardFailed,
        isLive && justSent && styles.cardFlash,
      ]}
    >
      <Animated.View
        style={[styles.flashOverlay, { opacity: flashOpacity }]}
        pointerEvents="none"
      />

      <View style={styles.iconArea}>
        {isAnimated && (
          <>
            <PulseRing delay={0} color={pulseColor} />
            <PulseRing delay={700} color={pulseColor} />
          </>
        )}
        <SyncIcon syncStatus={syncStatus} />
      </View>

      <Text style={styles.title}>{content.title}</Text>
      <Text style={styles.subtitle}>
        {syncStatus === "live" && !hasSent
          ? STATUS_CONTENT.waiting.subtitle
          : content.subtitle}
      </Text>

      <View style={[styles.liveBadge, badgeStyle]}>
        {isAnimated ? (
          <LiveDots color={badgeDotColor} />
        ) : (
          <View style={[styles.statusDot, { backgroundColor: badgeDotColor }]} />
        )}
        <Text style={[styles.liveText, badgeTextStyle]}>{content.badge}</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: trackerRadius.xl,
    padding: 26,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: trackerColors.borderSubtle,
    alignItems: "center",
    gap: 10,
    overflow: "hidden",
    ...trackerShadow.card,
  },
  cardFlash: {
    borderColor: "rgba(16, 185, 129, 0.5)",
  },
  cardOffline: {
    borderColor: "rgba(138, 138, 150, 0.35)",
  },
  cardFailed: {
    borderColor: "rgba(245, 158, 11, 0.4)",
  },
  flashOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(16, 185, 129, 0.1)",
  },
  iconArea: {
    width: 72,
    height: 72,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  pulseRing: {
    position: "absolute",
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1.5,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: trackerColors.text,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 13.5,
    color: trackerColors.textMuted,
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 8,
  },
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingVertical: 6,
    paddingHorizontal: 13,
    borderRadius: trackerRadius.pill,
    marginTop: 6,
    borderWidth: 1,
  },
  badgeLive: {
    backgroundColor: "rgba(16, 185, 129, 0.12)",
    borderColor: "rgba(16, 185, 129, 0.28)",
  },
  badgeWaiting: {
    backgroundColor: "rgba(99, 102, 241, 0.12)",
    borderColor: "rgba(99, 102, 241, 0.28)",
  },
  badgeOffline: {
    backgroundColor: "rgba(138, 138, 150, 0.14)",
    borderColor: "rgba(138, 138, 150, 0.28)",
  },
  badgeFailed: {
    backgroundColor: "rgba(245, 158, 11, 0.12)",
    borderColor: "rgba(245, 158, 11, 0.3)",
  },
  liveText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.3,
  },
  badgeTextLive: {
    color: trackerColors.successLight,
  },
  badgeTextWaiting: {
    color: trackerColors.primaryLight,
  },
  badgeTextOffline: {
    color: trackerColors.inactiveText,
  },
  badgeTextFailed: {
    color: trackerColors.warningLight,
  },
  dotsRow: {
    flexDirection: "row",
    gap: 3,
  },
  liveDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
});
