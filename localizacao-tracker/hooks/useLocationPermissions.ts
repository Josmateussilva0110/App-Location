import { useCallback } from "react";
import * as Location from "expo-location";

/**
 * Encapsula os pedidos de permissao de localizacao.
 * Retorna helpers que resolvem para `true` quando a permissao foi concedida.
 */
export function useLocationPermissions() {
  const ensureForeground = useCallback(async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === "granted";
  }, []);

  const ensureBackground = useCallback(async () => {
    const { status } = await Location.requestBackgroundPermissionsAsync();
    return status === "granted";
  }, []);

  return { ensureForeground, ensureBackground };
}
