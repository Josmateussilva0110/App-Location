import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { KEY_USER_NAME } from "@/constants/location";
import { useToast } from "@/contexts/ToastContext";

const LEGACY_USER_NAME_KEY = "nome_usuario";

export function useUserName() {
  const { showToast } = useToast();
  const [userName, setUserName] = useState<string | null>(null);
  const [nameInput, setNameInput] = useState("");
  const [isCheckingName, setIsCheckingName] = useState(true);

  useEffect(() => {
    async function loadUserName() {
      const savedName = await AsyncStorage.getItem(KEY_USER_NAME);

      if (savedName) {
        setUserName(savedName);
        setIsCheckingName(false);
        return;
      }

      const legacyName = await AsyncStorage.getItem(LEGACY_USER_NAME_KEY);
      if (legacyName) {
        await AsyncStorage.setItem(KEY_USER_NAME, legacyName);
        await AsyncStorage.removeItem(LEGACY_USER_NAME_KEY);
        setUserName(legacyName);
      }

      setIsCheckingName(false);
    }

    loadUserName();
  }, []);

  async function saveName() {
    const trimmedName = nameInput.trim();
    if (!trimmedName) return;
    await AsyncStorage.setItem(KEY_USER_NAME, trimmedName);
    setUserName(trimmedName);
    showToast(`Bem-vindo, ${trimmedName}!`, "success");
  }

  return {
    userName,
    nameInput,
    setNameInput,
    isCheckingName,
    saveName,
  };
}
