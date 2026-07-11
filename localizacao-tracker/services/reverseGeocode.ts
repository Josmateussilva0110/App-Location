import * as Location from "expo-location";

export type LocalAddress = {
  city: string;
  state: string;
};

export async function getCityState(
  latitude: number,
  longitude: number
): Promise<LocalAddress> {
  try {
    const [address] = await Location.reverseGeocodeAsync({
      latitude,
      longitude,
    });

    if (!address) {
      return { city: "", state: "" };
    }

    const city = address.city ?? address.subregion ?? address.district ?? "";
    const state = address.region ?? "";

    return { city, state };
  } catch {
    return { city: "", state: "" };
  }
}
