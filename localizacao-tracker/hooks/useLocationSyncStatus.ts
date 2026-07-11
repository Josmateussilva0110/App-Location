import { useEffect, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";

import {
  KEY_LAST_FAILURE,
  KEY_LAST_SEND,
  type LastFailureInfo,
  type LastSendInfo,
  type SyncStatus,
} from "@/constants/location";

function calculateSyncStatus(
  isConnected: boolean,
  hasSent: boolean,
  lastSend: LastSendInfo | null,
  lastFailure: LastFailureInfo | null
): SyncStatus {
  if (!isConnected) return "offline";

  const isFailureMoreRecent =
    lastFailure &&
    (!lastSend ||
      new Date(lastFailure.timestamp) > new Date(lastSend.timestamp));

  if (isFailureMoreRecent) return "failed";
  if (hasSent) return "live";
  return "waiting";
}

export function useLocationSyncStatus(isTracking: boolean) {
  const [hasSent, setHasSent] = useState(false);
  const [justSent, setJustSent] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("waiting");
  const lastTimestampRef = useRef<string | null>(null);
  const isConnectedRef = useRef(true);

  useEffect(() => {
    if (!isTracking) {
      setHasSent(false);
      setJustSent(false);
      setIsConnected(true);
      setSyncStatus("waiting");
      lastTimestampRef.current = null;
      isConnectedRef.current = true;
      return;
    }

    function updateConnection(online: boolean) {
      isConnectedRef.current = online;
      setIsConnected(online);
    }

    async function readSyncState() {
      const [rawSend, rawFailure] = await Promise.all([
        AsyncStorage.getItem(KEY_LAST_SEND),
        AsyncStorage.getItem(KEY_LAST_FAILURE),
      ]);

      const lastSend = rawSend ? (JSON.parse(rawSend) as LastSendInfo) : null;
      const lastFailure = rawFailure
        ? (JSON.parse(rawFailure) as LastFailureInfo)
        : null;
      const sent = lastSend !== null;

      setHasSent(sent);
      setSyncStatus(
        calculateSyncStatus(
          isConnectedRef.current,
          sent,
          lastSend,
          lastFailure
        )
      );

      if (
        lastSend &&
        lastTimestampRef.current &&
        lastTimestampRef.current !== lastSend.timestamp
      ) {
        setJustSent(true);
        setTimeout(() => setJustSent(false), 2000);
      }

      if (lastSend) {
        lastTimestampRef.current = lastSend.timestamp;
      }
    }

    NetInfo.fetch().then((state) => {
      const online =
        state.isConnected === true && state.isInternetReachable !== false;
      updateConnection(online);
      readSyncState();
    });

    const unsubscribeNet = NetInfo.addEventListener((state) => {
      const online =
        state.isConnected === true && state.isInternetReachable !== false;
      updateConnection(online);
      readSyncState();
    });

    readSyncState();
    const interval = setInterval(readSyncState, 3000);

    return () => {
      unsubscribeNet();
      clearInterval(interval);
    };
  }, [isTracking]);

  return { hasSent, justSent, isConnected, syncStatus };
}
