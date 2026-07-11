import { Animated, ScrollView } from "react-native";

import { CoordinatesCard } from "@/components/tracker/CoordinatesCard";
import { LoadingScreen } from "@/components/tracker/LoadingScreen";
import { NameSetupScreen } from "@/components/tracker/NameSetupScreen";
import { StatusCard } from "@/components/tracker/StatusCard";
import { SyncActivityCard } from "@/components/tracker/SyncActivityCard";
import { TrackerHeader } from "@/components/tracker/TrackerHeader";
import { TrackingButtons } from "@/components/tracker/TrackingButtons";
import { trackerLayout } from "@/constants/trackerTheme";
import { useLocationSyncStatus } from "@/hooks/useLocationSyncStatus";
import { useLocationTracking } from "@/hooks/useLocationTracking";
import { useFadeIn, usePulseAnimation } from "@/hooks/usePulseAnimation";
import { useUserName } from "@/hooks/useUserName";

export default function App() {
  const {
    nomeUsuario,
    nomeInput,
    setNomeInput,
    verificandoNome,
    salvarNome,
  } = useUserName();

  const {
    status,
    rastreando,
    carregando,
    latitude,
    longitude,
    iniciarRastreamento,
    pararRastreamento,
  } = useLocationTracking();

  const syncStatus = useLocationSyncStatus(rastreando);
  const pulseAnim = usePulseAnimation(rastreando);
  const fadeAnim = useFadeIn();

  if (verificandoNome) {
    return <LoadingScreen />;
  }

  if (!nomeUsuario) {
    return (
      <NameSetupScreen
        nomeInput={nomeInput}
        onChangeNome={setNomeInput}
        onConfirm={salvarNome}
      />
    );
  }

  if (carregando) {
    return <LoadingScreen message="Carregando..." />;
  }

  return (
    <Animated.View style={[trackerLayout.container, { opacity: fadeAnim }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        <TrackerHeader nomeUsuario={nomeUsuario} />

        <StatusCard
          rastreando={rastreando}
          status={status}
          pulseAnim={pulseAnim}
        />

        {rastreando && (
          <SyncActivityCard
            rastreando={rastreando}
            jaEnviou={syncStatus.jaEnviou}
            acabouDeEnviar={syncStatus.acabouDeEnviar}
            estado={syncStatus.estado}
          />
        )}

        <CoordinatesCard latitude={latitude} longitude={longitude} />

        <TrackingButtons
          rastreando={rastreando}
          onIniciar={iniciarRastreamento}
          onParar={pararRastreamento}
        />
      </ScrollView>
    </Animated.View>
  );
}
