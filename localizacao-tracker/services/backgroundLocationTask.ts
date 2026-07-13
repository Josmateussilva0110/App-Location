import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";

import { ACCURACY_MAX_M, LOCATION_TASK_NAME } from "@/constants/location";
import { getBestReading, type Reading } from "@/services/locationReading";
import { sendLocationToSheet } from "@/services/locationSync";

TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  if (error) {
    return;
  }

  // 1) Best candidate from the batch the OS delivered.
  let best: Reading | null = null;
  if (data) {
    const { locations } = data as { locations: Location.LocationObject[] };
    if (locations && locations.length > 0) {
      const b = locations.reduce((a, c) =>
        (a.coords.accuracy ?? Number.POSITIVE_INFINITY) <=
        (c.coords.accuracy ?? Number.POSITIVE_INFINITY)
          ? a
          : c
      );
      best = {
        latitude: b.coords.latitude,
        longitude: b.coords.longitude,
        accuracy: b.coords.accuracy ?? Number.POSITIVE_INFINITY,
      };
    }
  }

  // 2) Refine with a single fresh high-accuracy sample. A short warm-up avoids
  // mixing positions while the device is moving; we keep whichever of the batch
  // fix or this fresh reading is most precise.
  const refined = await getBestReading(1, ACCURACY_MAX_M);
  if (refined && (!best || refined.accuracy < best.accuracy)) {
    best = refined;
  }

  if (!best) return;
  if (best.accuracy > ACCURACY_MAX_M) return; // too imprecise to register

  await sendLocationToSheet(best.latitude, best.longitude);
});
