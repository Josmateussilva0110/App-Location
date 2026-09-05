import AsyncStorage from "@react-native-async-storage/async-storage";

import { KEY_OFFLINE_QUEUE, QUEUE_MAX_SIZE } from "@/constants/location";

/**
 * A location fix waiting to be delivered to the sheet. Carries its original
 * capture timestamp so a delayed send still records the real time (the Apps
 * Script uses this `timestamp` for the date column).
 */
export type QueuedPoint = {
  latitude: number;
  longitude: number;
  timestamp: string; // ISO 8601, captured when the fix was taken
  name: string;
  city: string;
  state: string;
  deviceId: string;
};

async function readQueue(): Promise<QueuedPoint[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY_OFFLINE_QUEUE);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as QueuedPoint[]) : [];
  } catch {
    return [];
  }
}

async function writeQueue(points: QueuedPoint[]): Promise<void> {
  // Keep only the most recent QUEUE_MAX_SIZE points (drop oldest on overflow).
  const trimmed =
    points.length > QUEUE_MAX_SIZE ? points.slice(points.length - QUEUE_MAX_SIZE) : points;
  await AsyncStorage.setItem(KEY_OFFLINE_QUEUE, JSON.stringify(trimmed));
}

export async function getQueue(): Promise<QueuedPoint[]> {
  return readQueue();
}

export async function getQueueSize(): Promise<number> {
  return (await readQueue()).length;
}

export async function enqueue(point: QueuedPoint): Promise<void> {
  const queue = await readQueue();
  queue.push(point);
  await writeQueue(queue);
}

export async function setQueue(points: QueuedPoint[]): Promise<void> {
  await writeQueue(points);
}

export async function clearQueue(): Promise<void> {
  await AsyncStorage.removeItem(KEY_OFFLINE_QUEUE);
}
