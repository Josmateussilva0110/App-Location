import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Application from "expo-application";

import {
  KEY_LAST_LOCATION,
  KEY_LAST_SEND,
  KEY_USER_NAME,
  type LastSendInfo,
} from "@/constants/location";
import { getCityState } from "@/services/reverseGeocode";
import { getDeviceId } from "@/services/deviceId";
import { getSheetUrl, getSyncToken } from "@/services/sheetConfig";
import {
  enqueue,
  getQueue,
  setQueue,
  type QueuedPoint,
} from "@/services/offlineQueue";
import * as syncStore from "@/services/syncStore";

const APP_NAME = Application.applicationName ?? "UnknownApp";
const GEOCODE_MAX_WAIT_MS = 3000;

type SendOptions = {
  force?: boolean;
};

export type SendResult = {
  status: "ok" | "ignored" | "error";
  error?: string;
};

type TransmitResult = {
  ok: boolean;
  /** Whether a failed attempt is worth retrying later (network / busy). */
  retryable: boolean;
  status: "ok" | "ignored" | "error";
  reason?: string;
};

async function geocodeWithTimeout(latitude: number, longitude: number) {
  try {
    return await Promise.race([
      getCityState(latitude, longitude),
      new Promise<{ city: string; state: string }>((resolve) =>
        setTimeout(() => resolve({ city: "", state: "" }), GEOCODE_MAX_WAIT_MS)
      ),
    ]);
  } catch {
    return { city: "", state: "" };
  }
}

function parseSheetResponse(text: string): SendResult {
  try {
    const body = JSON.parse(text) as { status?: string; reason?: string };
    if (body.status === "ok") return { status: "ok" };
    if (body.status === "ignored") {
      return {
        status: "ignored",
        error: body.reason ?? "duplicate position",
      };
    }
    return { status: "error", error: body.reason ?? "unknown response" };
  } catch {
    if (text.includes('"status":"ok"')) return { status: "ok" };
    if (text.includes("ignored")) return { status: "ignored" };
    return { status: "error", error: text.slice(0, 120) };
  }
}

// Permanent errors that will never succeed on retry — do not queue these.
const PERMANENT_REASONS = new Set([
  "unauthorized",
  "invalid coordinates",
  "missing deviceId",
]);

// Sends a single point. Classifies the outcome so callers know whether a
// failure is worth queueing for a later retry.
async function transmit(point: QueuedPoint): Promise<TransmitResult> {
  const [sheetUrl, syncToken] = await Promise.all([
    getSheetUrl(),
    getSyncToken(),
  ]);

  const params = new URLSearchParams({
    latitude: String(point.latitude),
    longitude: String(point.longitude),
    dateTime: point.timestamp,
    appName: APP_NAME,
    name: point.name,
    city: point.city,
    state: point.state,
    deviceId: point.deviceId,
    token: syncToken,
  });

  let responseText: string;
  try {
    const response = await fetch(sheetUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });
    responseText = await response.text();
  } catch {
    // Network failure — worth retrying once connectivity returns.
    return { ok: false, retryable: true, status: "error", reason: "network" };
  }

  const result = parseSheetResponse(responseText);
  if (result.status === "ok" || result.status === "ignored") {
    return { ok: true, retryable: false, status: result.status };
  }

  const reason = result.error ?? "unknown response";
  // Only permanent server rejections are non-retryable; anything else
  // (e.g. "busy", transient parse issues) can be retried.
  const retryable = !PERMANENT_REASONS.has(reason);
  return { ok: false, retryable, status: "error", reason };
}

// Drains the backlog oldest-first. Stops (keeping the rest) on the first
// retryable failure so ordering is preserved. Returns `blocked: true` when it
// stopped due to a retryable failure (i.e. the network still looks down).
async function flushQueue(): Promise<{ blocked: boolean }> {
  const queue = await getQueue();
  if (queue.length === 0) return { blocked: false };

  for (let i = 0; i < queue.length; i++) {
    const res = await transmit(queue[i]);
    if (res.ok) continue; // delivered (or ignored) — drop it
    if (res.retryable) {
      await setQueue(queue.slice(i)); // keep this one and everything after
      return { blocked: true };
    }
    // Permanent failure — drop this point and keep going.
  }

  await setQueue([]);
  return { blocked: false };
}

export async function sendLocationToSheet(
  latitude: number,
  longitude: number,
  options: SendOptions = {}
): Promise<SendResult> {
  const now = new Date();

  if (!options.force) {
    const lastSaved = await AsyncStorage.getItem(KEY_LAST_LOCATION);
    const last = lastSaved ? JSON.parse(lastSaved) : null;

    const hasChanged =
      !last || last.latitude !== latitude || last.longitude !== longitude;

    if (!hasChanged) {
      return { status: "ignored", error: "unchanged locally" };
    }
  }

  const name = (await AsyncStorage.getItem(KEY_USER_NAME)) ?? "Unknown";
  const deviceId = await getDeviceId();
  const { city, state } = await geocodeWithTimeout(latitude, longitude);

  const point: QueuedPoint = {
    latitude,
    longitude,
    timestamp: now.toISOString(),
    name,
    city,
    state,
    deviceId,
  };

  // Try to clear any backlog first, oldest-first, to preserve order.
  const flush = await flushQueue();
  if (flush.blocked) {
    // Network still down — queue the current point instead of failing it.
    await enqueue(point);
    await AsyncStorage.setItem(
      KEY_LAST_LOCATION,
      JSON.stringify({ latitude, longitude })
    );
    void syncStore.refresh();
    return { status: "error", error: "queued (offline)" };
  }

  const res = await transmit(point);

  if (!res.ok) {
    if (res.retryable) {
      await enqueue(point);
      await AsyncStorage.setItem(
        KEY_LAST_LOCATION,
        JSON.stringify({ latitude, longitude })
      );
      void syncStore.refresh();
      return { status: "error", error: "queued (offline)" };
    }
    return { status: "error", error: res.reason };
  }

  const previousSend = await AsyncStorage.getItem(KEY_LAST_SEND);
  const previousTotal = previousSend
    ? (JSON.parse(previousSend) as LastSendInfo).totalSent
    : 0;

  const sendInfo: LastSendInfo = {
    timestamp: now.toISOString(),
    latitude,
    longitude,
    city,
    state,
    deviceId,
    totalSent: previousTotal + 1,
  };

  await AsyncStorage.setItem(KEY_LAST_SEND, JSON.stringify(sendInfo));
  await AsyncStorage.setItem(
    KEY_LAST_LOCATION,
    JSON.stringify({ latitude, longitude })
  );

  void syncStore.refresh();
  return { status: res.status };
}
