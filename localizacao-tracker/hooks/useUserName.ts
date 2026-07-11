import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { CHAVE_NOME } from "@/constants/location";
import { useToast } from "@/contexts/ToastContext";

export function useUserName() {
  const { showToast } = useToast();
  const [nomeUsuario, setNomeUsuario] = useState<string | null>(null);
  const [nomeInput, setNomeInput] = useState("");
  const [verificandoNome, setVerificandoNome] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(CHAVE_NOME).then((nomeSalvo) => {
      setNomeUsuario(nomeSalvo);
      setVerificandoNome(false);
    });
  }, []);

  async function salvarNome() {
    const nomeTrimado = nomeInput.trim();
    if (!nomeTrimado) return;
    await AsyncStorage.setItem(CHAVE_NOME, nomeTrimado);
    setNomeUsuario(nomeTrimado);
    showToast(`Bem-vindo, ${nomeTrimado}!`, "success");
  }

  return {
    nomeUsuario,
    nomeInput,
    setNomeInput,
    verificandoNome,
    salvarNome,
  };
}
