import { useEffect, useReducer } from "react";
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
import { useLocationPermissions } from "@/hooks/useLocationPermissions";

type Phase = "checking" | "idle" | "starting" | "active" | "error";
type Coords = { latitude: number; longitude: number };
type Address = { city: string; state: string };

type State = {
  phase: Phase;
  statusMessage: string;
  coords: Coords | null;
  address: Address;
  hasPermission: boolean;
};

type Action =
  | { type: "READY"; running: boolean }
  | { type: "PERMISSION"; granted: boolean }
  | { type: "STATUS"; message: string }
  | { type: "COORDS"; coords: Coords }
  | { type: "ADDRESS"; address: Address }
  | { type: "ACTIVE" }
  | { type: "STOPPED" }
  | { type: "ERROR"; message: string };

const initialState: State = {
  phase: "checking",
  statusMessage: "Verificando estado...",
  coords: null,
  address: { city: "", state: "" },
  hasPermission: false,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "READY":
      return action.running
        ? { ...state, phase: "active", statusMessage: "Rastreamento ativo" }
        : { ...state, phase: "idle", statusMessage: "Rastreamento parado" };
    case "PERMISSION":
      return { ...state, hasPermission: action.granted };
    case "STATUS":
      return { ...state, phase: "starting", statusMessage: action.message };
    case "COORDS":
      return { ...state, coords: action.coords };
    case "ADDRESS":
      return { ...state, address: action.address };
    case "ACTIVE":
      return { ...state, phase: "active", statusMessage: "Rastreamento ativo" };
    case "STOPPED":
      return { ...state, phase: "idle", statusMessage: "Rastreamento parado" };
    case "ERROR":
      return { ...state, phase: "error", statusMessage: action.message };
    default:
      return state;
  }
}

export function useLocationTracking() {
  const { showToast } = useToast();
  const { ensureForeground, ensureBackground } = useLocationPermissions();
  const [state, dispatch] = useReducer(reducer, initialState);

  async function readCurrentCoordinates(): Promise<Coords | null> {
    const granted = await ensureForeground();
    dispatch({ type: "PERMISSION", granted });
    if (!granted) return null;

    const loc = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    return { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
  }

  async function refreshCoordinates() {
    const coords = await readCurrentCoordinates();
    if (!coords) return;
    dispatch({ type: "COORDS", coords });
    const address = await getCityState(coords.latitude, coords.longitude);
    dispatch({ type: "ADDRESS", address });
  }

  useEffect(() => {
    (async () => {
      const running = await Location.hasStartedLocationUpdatesAsync(
        LOCATION_TASK_NAME
      );
      dispatch({ type: "READY", running });
    })();

    refreshCoordinates().catch(() => {
      // silencioso
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (state.phase !== "active" || !state.hasPermission) return;

    const interval = setInterval(() => {
      refreshCoordinates().catch(() => {
        // silencioso
      });
    }, 10000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.phase, state.hasPermission]);

  async function startTracking() {
    try {
      if (!(await ensureForeground())) {
        const msg = "Permissao em primeiro plano negada";
        dispatch({ type: "ERROR", message: msg });
        showToast(msg, "error");
        return;
      }
      if (!(await ensureBackground())) {
        const msg = "Permissao em segundo plano negada";
        dispatch({ type: "ERROR", message: msg });
        showToast(msg, "error");
        return;
      }

      dispatch({ type: "PERMISSION", granted: true });
      dispatch({ type: "STATUS", message: "Obtendo localizacao..." });

      const coords = await readCurrentCoordinates();
      if (!coords) {
        const msg = "Nao foi possivel obter a localizacao";
        dispatch({ type: "ERROR", message: msg });
        showToast(msg, "error");
        return;
      }

      dispatch({ type: "COORDS", coords });
      getCityState(coords.latitude, coords.longitude).then((address) =>
        dispatch({ type: "ADDRESS", address })
      );

      dispatch({ type: "STATUS", message: "Enviando localizacao..." });

      try {
        const result = await sendLocationToSheet(
          coords.latitude,
          coords.longitude,
          { force: true }
        );

        if (result.status === "ok") {
          showToast("Localizacao enviada com sucesso", "success");
        } else if (result.status === "ignored") {
          showToast("Posicao ja registrada", "info");
        } else {
          const msg = result.error ?? "Erro ao enviar para a planilha";
          dispatch({ type: "ERROR", message: msg });
          showToast(msg, "error");
          return;
        }
      } catch {
        const msg = "Erro ao enviar para a planilha";
        dispatch({ type: "ERROR", message: msg });
        showToast(msg, "error");
        return;
      }

      await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 5 * 60 * 1000,
        distanceInterval: 10,
        showsBackgroundLocationIndicator: true,
        foregroundService: {
          notificationTitle: "Rastreamento ativo",
          notificationBody: "Monitorando localizacao em segundo plano.",
        },
      });

      dispatch({ type: "ACTIVE" });
    } catch {
      const msg = "Erro ao iniciar rastreamento";
      dispatch({ type: "ERROR", message: msg });
      showToast(msg, "error");
    }
  }

  async function stopTracking() {
    try {
      const running = await Location.hasStartedLocationUpdatesAsync(
        LOCATION_TASK_NAME
      );
      if (running) {
        await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
      }

      await AsyncStorage.multiRemove([
        KEY_LAST_LOCATION,
        KEY_LAST_SEND,
        KEY_LAST_FAILURE,
      ]);

      dispatch({ type: "STOPPED" });
      showToast("Rastreamento parado", "info");
    } catch {
      const msg = "Erro ao parar rastreamento";
      dispatch({ type: "ERROR", message: msg });
      showToast(msg, "error");
    }
  }

  return {
    status: state.statusMessage,
    isTracking: state.phase === "active",
    isLoading: state.phase === "checking",
    latitude: state.coords?.latitude ?? null,
    longitude: state.coords?.longitude ?? null,
    city: state.address.city,
    state: state.address.state,
    hasLocationPermission: state.hasPermission,
    startTracking,
    stopTracking,
  };
}
