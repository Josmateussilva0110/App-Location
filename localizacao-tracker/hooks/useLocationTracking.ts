import { useEffect, useState } from "react";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  KEY_LAST_FAILURE,
  KEY_LAST_LOCATION,
  KEY_LAST_SEND,
  LOCATION_TASK_NAME,
} from "@/constants/location";
import { useToast } from "@/contexts/ToastContext";
import { getCityState } from "@/services/reverseGeocode";
import { sendLocationToSheet } from "@/services/locationSync";

export function useLocationTracking() {
  const { showToast } = useToast();
  const [status, setStatus] = useState("Verificando estado...");
  const [isTracking, setIsTracking] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [hasLocationPermission, setHasLocationPermission] = useState(false);

  async function updateAddress(lat: number, lon: number) {
    const address = await getCityState(lat, lon);
    setCity(address.city);
    setState(address.state);
  }

  async function readCurrentCoordinates() {
    const { status: fgStatus } =
      await Location.requestForegroundPermissionsAsync();
    if (fgStatus !== "granted") {
      setHasLocationPermission(false);
      return null;
    }

    setHasLocationPermission(true);

    const loc = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    return {
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
    };
  }

  useEffect(() => {
    checkCurrentState();
    loadInitialLocation();
  }, []);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    if (isTracking && hasLocationPermission) {
      interval = setInterval(async () => {
        try {
          const coords = await readCurrentCoordinates();
          if (!coords) return;

          setLatitude(coords.latitude);
          setLongitude(coords.longitude);
          await updateAddress(coords.latitude, coords.longitude);
        } catch {
          // silent
        }
      }, 10000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTracking, hasLocationPermission]);

  async function loadInitialLocation() {
    try {
      const coords = await readCurrentCoordinates();
      if (!coords) return;

      setLatitude(coords.latitude);
      setLongitude(coords.longitude);
      await updateAddress(coords.latitude, coords.longitude);
    } catch (e) {
      console.error("Error getting current location:", e);
    }
  }

  async function checkCurrentState() {
    const isRunning = await Location.hasStartedLocationUpdatesAsync(
      LOCATION_TASK_NAME
    );
    setIsTracking(isRunning);
    setStatus(isRunning ? "Rastreamento ativo" : "Rastreamento parado");
    setIsLoading(false);
  }

  async function startTracking() {
    try {
      const { status: fgStatus } =
        await Location.requestForegroundPermissionsAsync();
      if (fgStatus !== "granted") {
        const msg = "Permissão em primeiro plano negada";
        setStatus(msg);
        showToast(msg, "error");
        return;
      }

      const { status: bgStatus } =
        await Location.requestBackgroundPermissionsAsync();
      if (bgStatus !== "granted") {
        const msg = "Permissão em segundo plano negada";
        setStatus(msg);
        showToast(msg, "error");
        return;
      }

      setHasLocationPermission(true);
      setStatus("Obtendo localização...");

      const currentCoords = await readCurrentCoordinates();
      if (!currentCoords) {
        const msg = "Não foi possível obter a localização";
        setStatus(msg);
        showToast(msg, "error");
        return;
      }

      setLatitude(currentCoords.latitude);
      setLongitude(currentCoords.longitude);
      updateAddress(currentCoords.latitude, currentCoords.longitude);

      setStatus("Enviando localização...");

      try {
        const result = await sendLocationToSheet(
          currentCoords.latitude,
          currentCoords.longitude,
          { force: true }
        );

        if (result.status === "ok") {
          showToast("Localização enviada com sucesso", "success");
        } else if (result.status === "ignored") {
          showToast(
            "Posição já registrada",
            "info"
          );
        } else {
          showToast(result.error ?? "Erro ao enviar para a planilha", "error");
          return;
        }
      } catch {
        showToast("Erro ao enviar para a planilha", "error");
        return;
      }

      await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 5 * 60 * 1000,
        distanceInterval: 10,
        showsBackgroundLocationIndicator: true,
        foregroundService: {
          notificationTitle: "Rastreamento ativo",
          notificationBody: "Monitorando localização em segundo plano.",
        },
      });

      setIsTracking(true);
      setStatus("Rastreamento ativo");
    } catch (e) {
      console.error("Error starting tracking:", e);
      const msg = "Erro ao iniciar rastreamento";
      setStatus(msg);
      showToast(msg, "error");
    }
  }

  async function stopTracking() {
    try {
      const isRunning = await Location.hasStartedLocationUpdatesAsync(
        LOCATION_TASK_NAME
      );
      if (isRunning) {
        await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
      }

      await AsyncStorage.removeItem(KEY_LAST_LOCATION);
      await AsyncStorage.removeItem(KEY_LAST_SEND);
      await AsyncStorage.removeItem(KEY_LAST_FAILURE);

      setIsTracking(false);
      setStatus("Rastreamento parado");
      showToast("Rastreamento parado", "info");
    } catch (e) {
      console.error("Error stopping tracking:", e);
      const msg = "Erro ao parar rastreamento";
      setStatus(msg);
      showToast(msg, "error");
    }
  }

  return {
    status,
    isTracking,
    isLoading,
    latitude,
    longitude,
    city,
    state,
    hasLocationPermission,
    startTracking,
    stopTracking,
  };
}
