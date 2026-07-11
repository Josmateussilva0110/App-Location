import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Play, Square } from "lucide-react-native";

import { trackerColors } from "@/constants/trackerTheme";

type TrackingButtonsProps = {
  rastreando: boolean;
  onIniciar: () => void;
  onParar: () => void;
};

export function TrackingButtons({
  rastreando,
  onIniciar,
  onParar,
}: TrackingButtonsProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.botao, styles.botaoIniciar, rastreando && styles.desabilitado]}
        onPress={onIniciar}
        disabled={rastreando}
        activeOpacity={0.7}
      >
        <Play size={20} color="#fff" fill="#fff" />
        <Text style={styles.texto}>Iniciar</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.botao, styles.botaoParar, !rastreando && styles.desabilitado]}
        onPress={onParar}
        disabled={!rastreando}
        activeOpacity={0.7}
      >
        <Square size={20} color="#fff" fill="#fff" />
        <Text style={styles.texto}>Parar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 14,
  },
  botao: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 16,
    borderRadius: 16,
  },
  botaoIniciar: {
    backgroundColor: trackerColors.success,
  },
  botaoParar: {
    backgroundColor: trackerColors.danger,
  },
  desabilitado: {
    opacity: 0.3,
  },
  texto: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});
