import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";
import * as Application from "expo-application";
import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  CHAVE_NOME,
  CHAVE_ULTIMA_FALHA,
  CHAVE_ULTIMA_LOC,
  CHAVE_ULTIMO_ENVIO,
  LOCATION_TASK_NAME,
  SHEET_URL,
  type UltimaFalhaInfo,
  type UltimoEnvioInfo,
} from "@/constants/location";

async function registrarFalha(timestamp: string, erro: string) {
  const infoFalha: UltimaFalhaInfo = { timestamp, erro };
  await AsyncStorage.setItem(CHAVE_ULTIMA_FALHA, JSON.stringify(infoFalha));
}

const NOME_APP = Application.applicationName ?? "AppDesconhecido";

TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  if (error) {
    console.error("Erro na task de localização:", error);
    return;
  }
  if (!data) return;

  const { locations } = data as { locations: Location.LocationObject[] };
  const localizacaoAtual = locations[0];
  if (!localizacaoAtual) return;

  const { latitude, longitude } = localizacaoAtual.coords;

  const nome = (await AsyncStorage.getItem(CHAVE_NOME)) ?? "Desconhecido";

  const ultimaSalva = await AsyncStorage.getItem(CHAVE_ULTIMA_LOC);
  const ultima = ultimaSalva ? JSON.parse(ultimaSalva) : null;

  const mudou =
    !ultima ||
    ultima.latitude !== latitude ||
    ultima.longitude !== longitude;

  if (!mudou) {
    console.log("Localização não mudou, não envia.");
    return;
  }

  const agora = new Date();

  try {
    const params = new URLSearchParams({
      latitude: String(latitude),
      longitude: String(longitude),
      dataHora: agora.toISOString(),
      appName: NOME_APP,
      nome,
    });

    const response = await fetch(`${SHEET_URL}?${params.toString()}`, {
      method: "GET",
    });

    console.log("Resposta do Google Sheets:", response.status, response.ok);

    if (!response.ok) {
      await registrarFalha(
        agora.toISOString(),
        `Servidor respondeu com status ${response.status}`
      );
      return;
    }

    const envioAnterior = await AsyncStorage.getItem(CHAVE_ULTIMO_ENVIO);
    const totalAnterior = envioAnterior
      ? (JSON.parse(envioAnterior) as UltimoEnvioInfo).totalEnviados
      : 0;

    const infoEnvio: UltimoEnvioInfo = {
      timestamp: agora.toISOString(),
      latitude,
      longitude,
      totalEnviados: totalAnterior + 1,
    };

    await AsyncStorage.removeItem(CHAVE_ULTIMA_FALHA);
    await AsyncStorage.setItem(CHAVE_ULTIMO_ENVIO, JSON.stringify(infoEnvio));
    await AsyncStorage.setItem(
      CHAVE_ULTIMA_LOC,
      JSON.stringify({ latitude, longitude })
    );

    console.log("Localização enviada com sucesso.");
  } catch (err) {
    const mensagem =
      err instanceof Error ? err.message : "Erro desconhecido ao enviar";
    console.error("Erro ao enviar localização:", err);
    await registrarFalha(agora.toISOString(), mensagem);
  }
});
