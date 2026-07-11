import { useEffect, useRef, useState, useSyncExternalStore } from "react";

import type { SyncStatus } from "@/constants/location";
import * as syncStore from "@/services/syncStore";

const RESET = {
  hasSent: false,
  justSent: false,
  isConnected: true,
  syncStatus: "waiting" as SyncStatus,
};

/** Deriva o "acabou de enviar" (transiente de 2s) a partir do timestamp. */
function useJustSent(timestamp: string | null) {
  const [justSent, setJustSent] = useState(false);
  const previous = useRef<string | null>(null);

  useEffect(() => {
    if (timestamp && previous.current && previous.current !== timestamp) {
      previous.current = timestamp;
      setJustSent(true);
      const t = setTimeout(() => setJustSent(false), 2000);
      return () => clearTimeout(t);
    }
    previous.current = timestamp;
  }, [timestamp]);

  return justSent;
}

export function useLocationSyncStatus(isTracking: boolean) {
  const snapshot = useSyncExternalStore(
    syncStore.subscribe,
    syncStore.getSnapshot,
    syncStore.getSnapshot
  );

  const justSent = useJustSent(isTracking ? snapshot.lastSendTimestamp : null);

  useEffect(() => {
    syncStore.setActive(isTracking);
    return () => syncStore.setActive(false);
  }, [isTracking]);

  if (!isTracking) return RESET;

  return {
    hasSent: snapshot.hasSent,
    justSent,
    isConnected: snapshot.isConnected,
    syncStatus: snapshot.syncStatus,
  };
}
