import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  DEFAULT_SHEET_URL,
  DEFAULT_SYNC_TOKEN,
  KEY_SHEET_URL,
  KEY_SYNC_TOKEN,
} from "@/constants/location";

const APPS_SCRIPT_URL_PATTERN =
  /^https:\/\/script\.google\.com\/macros\/s\/[^/]+\/exec$/;

export type SheetConfigValidation = {
  valid: boolean;
  error?: string;
};

export function validateSheetUrl(url: string): SheetConfigValidation {
  const trimmed = url.trim();
  if (!trimmed) {
    return { valid: false, error: "Informe a URL do Apps Script." };
  }
  if (!APPS_SCRIPT_URL_PATTERN.test(trimmed)) {
    return {
      valid: false,
      error:
        "URL inválida. Use o link /exec do Google Apps Script (script.google.com/macros/s/.../exec).",
    };
  }
  return { valid: true };
}

export function validateSyncToken(token: string): SheetConfigValidation {
  const trimmed = token.trim();
  if (!trimmed) {
    return { valid: false, error: "Informe o token de sincronização." };
  }
  return { valid: true };
}

export function validateSheetConfig(
  url: string,
  token: string
): SheetConfigValidation {
  const urlResult = validateSheetUrl(url);
  if (!urlResult.valid) return urlResult;
  return validateSyncToken(token);
}

export async function getSheetUrl(): Promise<string> {
  const saved = await AsyncStorage.getItem(KEY_SHEET_URL);
  return saved?.trim() || DEFAULT_SHEET_URL;
}

export async function getSyncToken(): Promise<string> {
  const saved = await AsyncStorage.getItem(KEY_SYNC_TOKEN);
  return saved?.trim() || DEFAULT_SYNC_TOKEN;
}

export async function getSheetConfig(): Promise<{
  url: string;
  token: string;
  isCustom: boolean;
}> {
  const [savedUrl, savedToken] = await Promise.all([
    AsyncStorage.getItem(KEY_SHEET_URL),
    AsyncStorage.getItem(KEY_SYNC_TOKEN),
  ]);

  return {
    url: savedUrl?.trim() || DEFAULT_SHEET_URL,
    token: savedToken?.trim() || DEFAULT_SYNC_TOKEN,
    isCustom: Boolean(savedUrl?.trim() || savedToken?.trim()),
  };
}

export async function saveSheetConfig(
  url: string,
  token: string
): Promise<SheetConfigValidation> {
  const validation = validateSheetConfig(url, token);
  if (!validation.valid) return validation;

  await AsyncStorage.multiSet([
    [KEY_SHEET_URL, url.trim()],
    [KEY_SYNC_TOKEN, token.trim()],
  ]);

  return { valid: true };
}

export async function testSheetConnection(
  url: string,
  token: string,
  appName: string
): Promise<{ ok: boolean; message: string }> {
  const validation = validateSheetConfig(url, token);
  if (!validation.valid) {
    return { ok: false, message: validation.error ?? "Configuração inválida." };
  }

  const params = new URLSearchParams({
    latitude: "0",
    longitude: "0",
    dateTime: new Date().toISOString(),
    appName,
    name: "Teste",
    city: "",
    state: "",
    deviceId: "connection-test",
    token: token.trim(),
  });

  try {
    const response = await fetch(url.trim(), {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });
    const text = await response.text();

    if (text.includes('"status":"ok"') || text.includes('"status":"ignored"')) {
      return { ok: true, message: "Conexão estabelecida com sucesso." };
    }
    if (text.includes("unauthorized")) {
      return { ok: false, message: "Token inválido ou não autorizado." };
    }

    return {
      ok: false,
      message: "Resposta inesperada do servidor. Verifique URL e token.",
    };
  } catch {
    return {
      ok: false,
      message: "Falha de rede. Verifique sua conexão e a URL informada.",
    };
  }
}
