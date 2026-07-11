import { useEffect, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";

import {
  CHAVE_ULTIMA_FALHA,
  CHAVE_ULTIMO_ENVIO,
  type EstadoSincronizacao,
  type UltimaFalhaInfo,
  type UltimoEnvioInfo,
} from "@/constants/location";

function calcularEstado(
  conectado: boolean,
  jaEnviou: boolean,
  ultimoEnvio: UltimoEnvioInfo | null,
  ultimaFalha: UltimaFalhaInfo | null
): EstadoSincronizacao {
  if (!conectado) return "offline";

  const falhaMaisRecente =
    ultimaFalha &&
    (!ultimoEnvio ||
      new Date(ultimaFalha.timestamp) > new Date(ultimoEnvio.timestamp));

  if (falhaMaisRecente) return "falha";
  if (jaEnviou) return "ao_vivo";
  return "aguardando";
}

export function useLocationSyncStatus(rastreando: boolean) {
  const [jaEnviou, setJaEnviou] = useState(false);
  const [acabouDeEnviar, setAcabouDeEnviar] = useState(false);
  const [conectado, setConectado] = useState(true);
  const [estado, setEstado] = useState<EstadoSincronizacao>("aguardando");
  const ultimoTimestampRef = useRef<string | null>(null);
  const conectadoRef = useRef(true);

  useEffect(() => {
    if (!rastreando) {
      setJaEnviou(false);
      setAcabouDeEnviar(false);
      setConectado(true);
      setEstado("aguardando");
      ultimoTimestampRef.current = null;
      conectadoRef.current = true;
      return;
    }

    function atualizarConexao(online: boolean) {
      conectadoRef.current = online;
      setConectado(online);
    }

    async function lerEstadoSync() {
      const [rawEnvio, rawFalha] = await Promise.all([
        AsyncStorage.getItem(CHAVE_ULTIMO_ENVIO),
        AsyncStorage.getItem(CHAVE_ULTIMA_FALHA),
      ]);

      const ultimoEnvio = rawEnvio
        ? (JSON.parse(rawEnvio) as UltimoEnvioInfo)
        : null;
      const ultimaFalha = rawFalha
        ? (JSON.parse(rawFalha) as UltimaFalhaInfo)
        : null;
      const enviou = ultimoEnvio !== null;

      setJaEnviou(enviou);
      setEstado(
        calcularEstado(conectadoRef.current, enviou, ultimoEnvio, ultimaFalha)
      );

      if (
        ultimoEnvio &&
        ultimoTimestampRef.current &&
        ultimoTimestampRef.current !== ultimoEnvio.timestamp
      ) {
        setAcabouDeEnviar(true);
        setTimeout(() => setAcabouDeEnviar(false), 2000);
      }

      if (ultimoEnvio) {
        ultimoTimestampRef.current = ultimoEnvio.timestamp;
      }
    }

    NetInfo.fetch().then((state) => {
      const online =
        state.isConnected === true && state.isInternetReachable !== false;
      atualizarConexao(online);
      lerEstadoSync();
    });

    const unsubscribeNet = NetInfo.addEventListener((state) => {
      const online =
        state.isConnected === true && state.isInternetReachable !== false;
      atualizarConexao(online);
      lerEstadoSync();
    });

    lerEstadoSync();
    const intervalo = setInterval(lerEstadoSync, 3000);

    return () => {
      unsubscribeNet();
      clearInterval(intervalo);
    };
  }, [rastreando]);

  return { jaEnviou, acabouDeEnviar, conectado, estado };
}
