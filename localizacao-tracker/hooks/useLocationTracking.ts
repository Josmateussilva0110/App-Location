import { useEffect, useState } from "react";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  CHAVE_ULTIMA_FALHA,
  CHAVE_ULTIMA_LOC,
  CHAVE_ULTIMO_ENVIO,
  LOCATION_TASK_NAME,
} from "@/constants/location";
import { useToast } from "@/contexts/ToastContext";

export function useLocationTracking() {
  const { showToast } = useToast();
  const [status, setStatus] = useState("Verificando estado...");
  const [rastreando, setRastreando] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [locPermission, setLocPermission] = useState(false);

  useEffect(() => {
    verificarEstadoAtual();
    obterLocalizacaoAtual();
  }, []);

  useEffect(() => {
    let intervalo: ReturnType<typeof setInterval> | null = null;

    if (rastreando && locPermission) {
      intervalo = setInterval(async () => {
        try {
          const loc = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          setLatitude(loc.coords.latitude);
          setLongitude(loc.coords.longitude);
        } catch {
          // silencioso
        }
      }, 10000);
    }

    return () => {
      if (intervalo) clearInterval(intervalo);
    };
  }, [rastreando, locPermission]);

  async function obterLocalizacaoAtual() {
    try {
      const { status: fgStatus } =
        await Location.requestForegroundPermissionsAsync();
      if (fgStatus !== "granted") {
        setLocPermission(false);
        return;
      }
      setLocPermission(true);

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setLatitude(loc.coords.latitude);
      setLongitude(loc.coords.longitude);
    } catch (e) {
      console.error("Erro ao obter localização atual:", e);
    }
  }

  async function verificarEstadoAtual() {
    const jaRodando = await Location.hasStartedLocationUpdatesAsync(
      LOCATION_TASK_NAME
    );
    setRastreando(jaRodando);
    setStatus(jaRodando ? "Rastreamento ativo" : "Rastreamento parado");
    setCarregando(false);
  }

  async function iniciarRastreamento() {
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

      setLocPermission(true);

      await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 5 * 60 * 1000,
        distanceInterval: 0,
        showsBackgroundLocationIndicator: true,
        foregroundService: {
          notificationTitle: "Rastreamento ativo",
          notificationBody: "Monitorando localização em segundo plano.",
        },
      });

      await obterLocalizacaoAtual();

      setRastreando(true);
      setStatus("Rastreamento ativo");
      showToast("Rastreamento iniciado com sucesso", "success");
    } catch (e) {
      console.error("Erro ao iniciar rastreamento:", e);
      const msg = "Erro ao iniciar rastreamento";
      setStatus(msg);
      showToast(msg, "error");
    }
  }

  async function pararRastreamento() {
    try {
      const jaRodando = await Location.hasStartedLocationUpdatesAsync(
        LOCATION_TASK_NAME
      );
      if (jaRodando) {
        await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
      }

      await AsyncStorage.removeItem(CHAVE_ULTIMA_LOC);
      await AsyncStorage.removeItem(CHAVE_ULTIMO_ENVIO);
      await AsyncStorage.removeItem(CHAVE_ULTIMA_FALHA);

      setRastreando(false);
      setStatus("Rastreamento parado");
      showToast("Rastreamento parado", "info");
    } catch (e) {
      console.error("Erro ao parar rastreamento:", e);
      const msg = "Erro ao parar rastreamento";
      setStatus(msg);
      showToast(msg, "error");
    }
  }

  return {
    status,
    rastreando,
    carregando,
    latitude,
    longitude,
    locPermission,
    iniciarRastreamento,
    pararRastreamento,
  };
}
