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
    userName,
    nameInput,
    setNameInput,
    isCheckingName,
    saveName,
  } = useUserName();

  const {
    status,
    isTracking,
    isLoading,
    latitude,
    longitude,
    city,
    state,
    startTracking,
    stopTracking,
  } = useLocationTracking();

  const sync = useLocationSyncStatus(isTracking);
  const pulseAnim = usePulseAnimation(isTracking);
  const fadeAnim = useFadeIn();

  if (isCheckingName) {
    return <LoadingScreen />;
  }

  if (!userName) {
    return (
      <NameSetupScreen
        nameInput={nameInput}
        onChangeName={setNameInput}
        onConfirm={saveName}
      />
    );
  }

  if (isLoading) {
    return <LoadingScreen message="Carregando..." />;
  }

  return (
    <Animated.View style={[trackerLayout.container, { opacity: fadeAnim }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        <TrackerHeader userName={userName} />

        <StatusCard
          isTracking={isTracking}
          status={status}
          pulseAnim={pulseAnim}
        />

        {isTracking && (
          <SyncActivityCard
            isTracking={isTracking}
            hasSent={sync.hasSent}
            justSent={sync.justSent}
            syncStatus={sync.syncStatus}
          />
        )}

        <CoordinatesCard
          latitude={latitude}
          longitude={longitude}
          city={city}
          state={state}
        />

        <TrackingButtons
          isTracking={isTracking}
          onStart={startTracking}
          onStop={stopTracking}
        />
      </ScrollView>
    </Animated.View>
  );
}
