import { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { AlertTriangle, Satellite, WifiOff } from "lucide-react-native";

import {
  type EstadoSincronizacao,
} from "@/constants/location";
import { trackerColors } from "@/constants/trackerTheme";

type SyncActivityCardProps = {
  rastreando: boolean;
  jaEnviou: boolean;
  acabouDeEnviar: boolean;
  estado: EstadoSincronizacao;
};

const CONTEUDO_ESTADO: Record<
  EstadoSincronizacao,
  { titulo: string; subtitulo: string; badge: string }
> = {
  ao_vivo: {
    titulo: "Sincronização ativa",
    subtitulo: "Suas localizações estão sendo enviadas em segundo plano.",
    badge: "AO VIVO",
  },
  aguardando: {
    titulo: "Sincronização ativa",
    subtitulo: "Aguardando a primeira localização para enviar.",
    badge: "AGUARDANDO",
  },
  offline: {
    titulo: "Sem conexão",
    subtitulo:
      "A internet está indisponível. As localizações serão enviadas quando a rede voltar.",
    badge: "OFFLINE",
  },
  falha: {
    titulo: "Falha na sincronização",
    subtitulo:
      "Não foi possível enviar a última localização. Tentando novamente automaticamente.",
    badge: "ERRO",
  },
};

function PulseRing({
  delay,
  color,
}: {
  delay: number;
  color: string;
}) {
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

function SyncIcon({ estado }: { estado: EstadoSincronizacao }) {
  const corIcone =
    estado === "offline"
      ? trackerColors.inactiveText
      : estado === "falha"
        ? "#f59e0b"
        : trackerColors.primary;

  const fundoIcone =
    estado === "offline"
      ? "rgba(100, 116, 139, 0.2)"
      : estado === "falha"
        ? "rgba(245, 158, 11, 0.15)"
        : "rgba(99, 102, 241, 0.15)";

  const Icon =
    estado === "offline"
      ? WifiOff
      : estado === "falha"
        ? AlertTriangle
        : Satellite;

  return (
    <View style={[styles.iconCircle, { backgroundColor: fundoIcone }]}>
      <Icon size={26} color={corIcone} />
    </View>
  );
}

export function SyncActivityCard({
  rastreando,
  jaEnviou,
  acabouDeEnviar,
  estado,
}: SyncActivityCardProps) {
  const flashOpacity = useRef(new Animated.Value(0)).current;
  const conteudo = CONTEUDO_ESTADO[estado];
  const aoVivo = estado === "ao_vivo";
  const aguardando = estado === "aguardando";
  const animado = aoVivo || aguardando;

  const corPulse =
    estado === "offline"
      ? trackerColors.inactive
      : estado === "falha"
        ? "#f59e0b"
        : trackerColors.primary;

  const badgeStyle =
    estado === "offline"
      ? styles.badgeOffline
      : estado === "falha"
        ? styles.badgeFalha
        : aguardando
          ? styles.badgeAguardando
          : styles.badgeAoVivo;

  const badgeTextStyle =
    estado === "offline"
      ? styles.badgeTextOffline
      : estado === "falha"
        ? styles.badgeTextFalha
        : aguardando
          ? styles.badgeTextAguardando
          : styles.badgeTextAoVivo;

  const badgeDotColor =
    estado === "offline"
      ? trackerColors.inactive
      : estado === "falha"
        ? "#f59e0b"
        : aguardando
          ? trackerColors.primaryLight
          : trackerColors.success;

  useEffect(() => {
    if (!acabouDeEnviar) return;

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
  }, [acabouDeEnviar, flashOpacity]);

  if (!rastreando) return null;

  return (
    <View
      style={[
        styles.card,
        aoVivo && acabouDeEnviar && styles.cardFlash,
        estado === "offline" && styles.cardOffline,
        estado === "falha" && styles.cardFalha,
      ]}
    >
      <Animated.View
        style={[styles.flashOverlay, { opacity: flashOpacity }]}
        pointerEvents="none"
      />

      <View style={styles.iconArea}>
        {animado && (
          <>
            <PulseRing delay={0} color={corPulse} />
            <PulseRing delay={700} color={corPulse} />
          </>
        )}
        <SyncIcon estado={estado} />
      </View>

      <Text style={styles.title}>{conteudo.titulo}</Text>
      <Text style={styles.subtitle}>
        {estado === "ao_vivo" && !jaEnviou
          ? CONTEUDO_ESTADO.aguardando.subtitulo
          : conteudo.subtitulo}
      </Text>

      <View style={[styles.liveBadge, badgeStyle]}>
        {animado ? (
          <LiveDots color={badgeDotColor} />
        ) : (
          <View style={[styles.statusDot, { backgroundColor: badgeDotColor }]} />
        )}
        <Text style={[styles.liveText, badgeTextStyle]}>{conteudo.badge}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: trackerColors.card,
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: trackerColors.border,
    alignItems: "center",
    gap: 8,
    overflow: "hidden",
  },
  cardFlash: {
    borderColor: "rgba(34, 197, 94, 0.45)",
  },
  cardOffline: {
    borderColor: "rgba(100, 116, 139, 0.45)",
  },
  cardFalha: {
    borderColor: "rgba(245, 158, 11, 0.45)",
  },
  flashOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(34, 197, 94, 0.1)",
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
    fontSize: 14,
    color: trackerColors.textSubtle,
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 8,
  },
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginTop: 4,
  },
  badgeAoVivo: {
    backgroundColor: "rgba(34, 197, 94, 0.12)",
  },
  badgeAguardando: {
    backgroundColor: "rgba(99, 102, 241, 0.12)",
  },
  badgeOffline: {
    backgroundColor: "rgba(100, 116, 139, 0.15)",
  },
  badgeFalha: {
    backgroundColor: "rgba(245, 158, 11, 0.12)",
  },
  liveText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.2,
  },
  badgeTextAoVivo: {
    color: trackerColors.successLight,
  },
  badgeTextAguardando: {
    color: trackerColors.primaryLight,
  },
  badgeTextOffline: {
    color: trackerColors.inactiveText,
  },
  badgeTextFalha: {
    color: "#fbbf24",
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
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
