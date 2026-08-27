import { useEffect, useState } from "react";
import * as Application from "expo-application";

import { useToast } from "@/contexts/ToastContext";
import {
  getSheetConfig,
  saveSheetConfig,
  testSheetConnection,
  validateSheetConfig,
} from "@/services/sheetConfig";

const APP_NAME = Application.applicationName ?? "UnknownApp";

export function useSheetConfig() {
  const { showToast } = useToast();
  const [urlInput, setUrlInput] = useState("");
  const [tokenInput, setTokenInput] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isCustom, setIsCustom] = useState(false);

  useEffect(() => {
    async function loadConfig() {
      const config = await getSheetConfig();
      setUrlInput(config.url);
      setTokenInput(config.token);
      setIsCustom(config.isCustom);
      setIsLoading(false);
    }

    void loadConfig();
  }, []);

  async function saveConfig() {
    const validation = validateSheetConfig(urlInput, tokenInput);
    if (!validation.valid) {
      showToast(validation.error ?? "Configuração inválida.", "error");
      return false;
    }

    setIsSaving(true);
    try {
      const result = await saveSheetConfig(urlInput, tokenInput);
      if (!result.valid) {
        showToast(result.error ?? "Não foi possível salvar.", "error");
        return false;
      }
      setIsCustom(true);
      showToast("Configurações salvas com sucesso.", "success");
      return true;
    } finally {
      setIsSaving(false);
    }
  }

  async function testConnection() {
    const validation = validateSheetConfig(urlInput, tokenInput);
    if (!validation.valid) {
      showToast(validation.error ?? "Configuração inválida.", "error");
      return;
    }

    setIsTesting(true);
    try {
      const result = await testSheetConnection(urlInput, tokenInput, APP_NAME);
      showToast(result.message, result.ok ? "success" : "error");
    } finally {
      setIsTesting(false);
    }
  }

  const canSave =
    validateSheetConfig(urlInput, tokenInput).valid && !isSaving && !isTesting;

  return {
    urlInput,
    setUrlInput,
    tokenInput,
    setTokenInput,
    isLoading,
    isSaving,
    isTesting,
    isCustom,
    canSave,
    saveConfig,
    testConnection,
  };
}
