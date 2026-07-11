import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Application from "expo-application";

import { KEY_DEVICE_ID } from "@/constants/location";

/**
 * UUID v4 fallback (used when the native device id is unavailable).
 * Not cryptographically strong, but stable per install once cached.
 */
function generateFallbackId(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Returns a stable identifier for the device.
 * - Android: Android ID (SSAID), persistent across app reinstalls.
 * - iOS: identifierForVendor.
 * - Fallback: a generated UUID.
 * The resolved value is cached so it never changes for this install.
 */
export async function getDeviceId(): Promise<string> {
  const cached = await AsyncStorage.getItem(KEY_DEVICE_ID);
  if (cached) return cached;

  let id: string | null = null;

  try {
    if (Platform.OS === "android") {
      id = Application.getAndroidId();
    } else if (Platform.OS === "ios") {
      id = await Application.getIosIdForVendorAsync();
    }
  } catch {
    id = null;
  }

  if (!id) {
    id = generateFallbackId();
  }

  await AsyncStorage.setItem(KEY_DEVICE_ID, id);
  return id;
}
