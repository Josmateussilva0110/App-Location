import * as Location from "expo-location";

import { ACCURACY_MAX_M } from "@/constants/location";

export type Reading = {
  latitude: number;
  longitude: number;
  accuracy: number;
};

const SAMPLE_TIMEOUT_MS = 8000;

// A single high-accuracy fix, guarded by a timeout so a cold/hanging GPS read
// can't block the caller indefinitely (important inside the background task,
// which has a limited execution budget).
async function getPositionWithTimeout(
  timeoutMs: number
): Promise<Location.LocationObject | null> {
  return Promise.race([
    Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.BestForNavigation,
    }),
    new Promise<null>((resolve) => setTimeout(() => resolve(null), timeoutMs)),
  ]);
}

/**
 * Takes up to `samples` high-accuracy readings and returns the most precise
 * one (smallest accuracy radius). Stops early as soon as a reading within
 * `targetAccuracy` meters is obtained. Repeated calls keep the GPS warm, so
 * later samples tend to be more precise than the first cold fix.
 *
 * Returns `null` only if no reading could be obtained at all.
 */
export async function getBestReading(
  samples = 4,
  targetAccuracy = ACCURACY_MAX_M
): Promise<Reading | null> {
  let best: Reading | null = null;

  for (let i = 0; i < samples; i++) {
    const loc = await getPositionWithTimeout(SAMPLE_TIMEOUT_MS);
    if (!loc) continue;

    const accuracy = loc.coords.accuracy ?? Number.POSITIVE_INFINITY;
    if (!best || accuracy < best.accuracy) {
      best = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        accuracy,
      };
    }

    if (accuracy <= targetAccuracy) break;
  }

  return best;
}
