export const LOCATION_TASK_NAME = "background-location-task";
export const SHEET_URL =
  "https://script.google.com/macros/s/AKfycbw2ITMv5PGFincaHN3fiyXi42x87x33Hz3QVEOGn8_bmHJjOZrIuGZuHvTmj8siEp5n5g/exec";

export const SYNC_TOKEN = "dbfkhdsfiriuysnakAHDKGEYhdgfewufrgutfajshdewyrgevfhsdgddfuguewytrgdhvfabksbdqowryegfsapfhdjsfmasskdjgwuetrqeweghs";
export const KEY_LAST_LOCATION = "last_location";
export const KEY_USER_NAME = "user_name";
export const KEY_LAST_SEND = "last_send_info";
export const KEY_LAST_FAILURE = "last_failure";
export const KEY_DEVICE_ID = "device_id";
export const KEY_OFFLINE_QUEUE = "offline_queue";

/** Maximum number of points kept in the offline queue. When exceeded, the
 * oldest points are dropped to avoid unbounded storage growth. */
export const QUEUE_MAX_SIZE = 2000;

/** Interval configured for background tracking (15 s) */
export const TRACKING_INTERVAL_MS = 15 * 1000;

/** Maximum acceptable GPS accuracy radius, in meters. Readings with a
 * reported accuracy worse (larger) than this are considered too imprecise
 * to register. Kept at 20 m because GPS accuracy degrades while moving. */
export const ACCURACY_MAX_M = 20;

export type LastSendInfo = {
  timestamp: string;
  latitude: number;
  longitude: number;
  city: string;
  state: string;
  deviceId: string;
  totalSent: number;
};

export type LastFailureInfo = {
  timestamp: string;
  error: string;
};

export type SyncStatus = "live" | "offline" | "failed" | "waiting";
