import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";

import { LOCATION_TASK_NAME } from "@/constants/location";
import { sendLocationToSheet } from "@/services/locationSync";

TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  if (error) {
    return;
  }
  if (!data) return;

  const { locations } = data as { locations: Location.LocationObject[] };
  const currentLocation = locations[0];
  if (!currentLocation) return;

  const { latitude, longitude } = currentLocation.coords;

  await sendLocationToSheet(latitude, longitude);
});
