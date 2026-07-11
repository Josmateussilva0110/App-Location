import { AppState, type AppStateStatus } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";

import {
  KEY_LAST_FAILURE,
  KEY_LAST_SEND,
  type LastFailureInfo,
  type LastSendInfo,
  type SyncStatus,
} from "@/constants/location";

export type SyncSnapshot = {
  isConnected: boolean;
  hasSent: boolean;
  syncStatus: SyncStatus;
  lastSendTimestamp: string | null;
};

const POLL_INTERVAL_MS = 5000;

function computeStatus(
  isConnected: boolean,
  hasSent: boolean,
  lastSend: LastSendInfo | null,
  lastFailure: LastFailureInfo | null
): SyncStatus {
  if (!isConnected) return "offline";
  const failureMoreRecent =
    lastFailure &&
    (!lastSend ||
      new Date(lastFailure.timestamp) > new Date(lastSend.timestamp));
  if (failureMoreRecent) return "failed";
  if (hasSent) return "live";
  return "waiting";
}

let snapshot: SyncSnapshot = {
  isConnected: true,
  hasSent: false,
  syncStatus: "waiting",
  lastSendTimestamp: null,
};

let isConnected = true;
let active = false;
let pollTimer: ReturnType<typeof setInterval> | null = null;
let netUnsub: (() => void) | null = null;
let appStateSub: { remove: () => void } | null = null;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function setSnapshot(next: SyncSnapshot) {
  if (
    next.isConnected === snapshot.isConnected &&
    next.hasSent === snapshot.hasSent &&
    next.syncStatus === snapshot.syncStatus &&
    next.lastSendTimestamp === snapshot.lastSendTimestamp
  ) {
    return;
  }
  snapshot = next;
  emit();
}

export async function refresh() {
  const [rawSend, rawFailure] = await Promise.all([
    AsyncStorage.getItem(KEY_LAST_SEND),
    AsyncStorage.getItem(KEY_LAST_FAILURE),
  ]);
  const lastSend = rawSend ? (JSON.parse(rawSend) as LastSendInfo) : null;
  const lastFailure = rawFailure
    ? (JSON.parse(rawFailure) as LastFailureInfo)
    : null;
  const hasSent = lastSend !== null;

  setSnapshot({
    isConnected,
    hasSent,
    syncStatus: computeStatus(isConnected, hasSent, lastSend, lastFailure),
    lastSendTimestamp: lastSend?.timestamp ?? null,
  });
}

function handleConnectivity(online: boolean) {
  isConnected = online;
  void refresh();
}

function startSources() {
  if (netUnsub) return;

  netUnsub = NetInfo.addEventListener((state) => {
    handleConnectivity(
      state.isConnected === true && state.isInternetReachable !== false
    );
  });

  NetInfo.fetch().then((state) => {
    handleConnectivity(
      state.isConnected === true && state.isInternetReachable !== false
    );
  });

  appStateSub = AppState.addEventListener("change", (s: AppStateStatus) => {
    if (s === "active") void refresh();
  });
}

function stopSources() {
  netUnsub?.();
  netUnsub = null;
  appStateSub?.remove();
  appStateSub = null;
  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
}

export function subscribe(listener: () => void) {
  listeners.add(listener);
  if (listeners.size === 1) startSources();
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) stopSources();
  };
}

export function getSnapshot(): SyncSnapshot {
  return snapshot;
}

/**
 * Liga/desliga a reconciliacao periodica com o AsyncStorage. So faz sentido
 * enquanto o rastreamento esta ativo (a task de background grava em outro
 * contexto JS, entao precisamos reler a persistencia de tempos em tempos).
 */
export function setActive(next: boolean) {
  if (next === active) return;
  active = next;
  if (active) {
    void refresh();
    if (!pollTimer) pollTimer = setInterval(() => void refresh(), POLL_INTERVAL_MS);
  } else if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
}
