import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Application from "expo-application";

import {
  KEY_LAST_LOCATION,
  KEY_LAST_SEND,
  KEY_USER_NAME,
  SHEET_URL,
  SYNC_TOKEN,
  type LastSendInfo,
} from "@/constants/location";
import { getCityState } from "@/services/reverseGeocode";
import { getDeviceId } from "@/services/deviceId";
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
      !last ||
      last.latitude !== latitude ||
      last.longitude !== longitude;

    if (!hasChanged) {
      return { status: "ignored", error: "unchanged locally" };
    }
  }

  try {
    const name = (await AsyncStorage.getItem(KEY_USER_NAME)) ?? "Unknown";
    const deviceId = await getDeviceId();
    const { city, state } = await geocodeWithTimeout(latitude, longitude);

    const params = new URLSearchParams({
      latitude: String(latitude),
      longitude: String(longitude),
      dateTime: now.toISOString(),
      appName: APP_NAME,
      name,
      city,
      state,
      deviceId,
      token: SYNC_TOKEN,
    });

    const url = `${SHEET_URL}?${params.toString()}`;

    const response = await fetch(url, { method: "GET" });
    const responseText = await response.text();

    const result = parseSheetResponse(responseText);

    if (result.status === "error") {
      return result;
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
    return result;
  } catch (err) {
    const error =
      err instanceof Error ? err.message : "Unknown error while sending";
    return { status: "error", error };
  }
}
