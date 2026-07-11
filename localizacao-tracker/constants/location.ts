export const LOCATION_TASK_NAME = "background-location-task";
export const SHEET_URL =
  "https://script.google.com/macros/s/AKfycbzsrFWO-2R442W4orjx0I1so4b7whcTrsYZyDVyeou2JAXSpVDc3wlWH8olIxhat20Y/exec";
export const KEY_LAST_LOCATION = "last_location";
export const KEY_USER_NAME = "user_name";
export const KEY_LAST_SEND = "last_send_info";
export const KEY_LAST_FAILURE = "last_failure";

/** Interval configured for background tracking (5 min) */
export const TRACKING_INTERVAL_MS = 5 * 60 * 1000;

export type LastSendInfo = {
  timestamp: string;
  latitude: number;
  longitude: number;
  city: string;
  state: string;
  totalSent: number;
};

export type LastFailureInfo = {
  timestamp: string;
  error: string;
};

export type SyncStatus = "live" | "offline" | "failed" | "waiting";
