import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { Navigation, User } from "lucide-react-native";

import { trackerColors, trackerLayout } from "@/constants/trackerTheme";

type NameSetupScreenProps = {
  nomeInput: string;
  onChangeNome: (text: string) => void;
  onConfirm: () => void;
};

export function NameSetupScreen({
  nomeInput,
  onChangeNome,
  onConfirm,
}: NameSetupScreenProps) {
  const podeConfirmar = nomeInput.trim().length > 0;

  return (
    <View style={trackerLayout.container}>
      <View style={styles.wrapper}>
        <View style={styles.card}>
          <View style={styles.iconCircle}>
            <User size={28} color={trackerColors.primary} />
          </View>

          <Text style={styles.title}>Quem é você?</Text>
          <Text style={styles.subtitle}>
            Informe seu nome para identificar suas localizações no rastreamento.
          </Text>

          <TextInput
            value={nomeInput}
            onChangeText={onChangeNome}
            placeholder="Digite seu nome"
            placeholderTextColor={trackerColors.textSubtle}
            style={styles.input}
            autoFocus
            returnKeyType="done"
            onSubmitEditing={podeConfirmar ? onConfirm : undefined}
          />

          <TouchableOpacity
            style={[styles.botao, !podeConfirmar && styles.botaoDesabilitado]}
            onPress={onConfirm}
            disabled={!podeConfirmar}
            activeOpacity={0.7}
          >
            <Text style={styles.botaoTexto}>Confirmar</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Navigation size={16} color={trackerColors.primaryLight} />
          <Text style={styles.footerText}>Rastreador de Localização</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    justifyContent: "center",
    paddingBottom: 40,
  },
  card: {
    backgroundColor: trackerColors.card,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: trackerColors.border,
    alignItems: "center",
    gap: 12,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(99, 102, 241, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: trackerColors.text,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 14,
    color: trackerColors.textSubtle,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 8,
  },
  input: {
    backgroundColor: trackerColors.background,
    borderWidth: 1,
    borderColor: trackerColors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: trackerColors.text,
    fontSize: 16,
    width: "100%",
  },
  botao: {
    alignSelf: "stretch",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: trackerColors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 4,
  },
  botaoDesabilitado: {
    opacity: 0.4,
  },
  botaoTexto: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 24,
  },
  footerText: {
    fontSize: 13,
    color: trackerColors.primaryLight,
    fontWeight: "500",
  },
});
