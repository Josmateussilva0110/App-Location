export const LOCATION_TASK_NAME = "background-location-task";
export const SHEET_URL =
  "https://script.google.com/macros/s/AKfycbwMasNFeLt17tf5u8t-icmYGNY0b0cuZUHsotwLwztRRBI0rG-PEiNE0hanhkIQMOI/exec";
export const CHAVE_ULTIMA_LOC = "ultima_localizacao";
export const CHAVE_NOME = "nome_usuario";
export const CHAVE_ULTIMO_ENVIO = "ultimo_envio_info";
export const CHAVE_ULTIMA_FALHA = "ultima_falha_envio";

/** Intervalo configurado no rastreamento em background (5 min) */
export const INTERVALO_RASTREAMENTO_MS = 5 * 60 * 1000;

export type UltimoEnvioInfo = {
  timestamp: string;
  latitude: number;
  longitude: number;
  totalEnviados: number;
};

export type UltimaFalhaInfo = {
  timestamp: string;
  erro: string;
};

export type EstadoSincronizacao = "ao_vivo" | "offline" | "falha" | "aguardando";
