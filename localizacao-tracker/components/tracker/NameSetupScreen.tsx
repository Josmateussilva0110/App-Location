import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Navigation, User } from "lucide-react-native";

import {
  trackerColors,
  trackerGradients,
  trackerLayout,
  trackerRadius,
  trackerShadow,
} from "@/constants/trackerTheme";

type NameSetupScreenProps = {
  nameInput: string;
  onChangeName: (text: string) => void;
  onConfirm: () => void;
};

export function NameSetupScreen({
  nameInput,
  onChangeName,
  onConfirm,
}: NameSetupScreenProps) {
  const [focused, setFocused] = useState(false);
  const canConfirm = nameInput.trim().length > 0;

  return (
    <View style={trackerLayout.container}>
      <View style={styles.wrapper}>
        <View style={styles.card}>
          <LinearGradient
            colors={trackerGradients.brand}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.iconCircle}
          >
            <User size={28} color="#fff" strokeWidth={2.2} />
          </LinearGradient>

          <Text style={styles.title}>Quem é você?</Text>
          <Text style={styles.subtitle}>
            Informe seu nome para identificar suas localizações no
            rastreamento.
          </Text>

          <TextInput
            value={nameInput}
            onChangeText={onChangeName}
            placeholder="Digite seu nome"
            placeholderTextColor={trackerColors.textSubtle}
            style={[styles.input, focused && styles.inputFocused]}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            autoFocus
            returnKeyType="done"
            onSubmitEditing={canConfirm ? onConfirm : undefined}
          />

          <TouchableOpacity
            style={styles.buttonWrap}
            onPress={onConfirm}
            disabled={!canConfirm}
            activeOpacity={0.85}
          >
            {canConfirm ? (
              <LinearGradient
                colors={trackerGradients.brand}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.button, trackerShadow.glow]}
              >
                <Text style={styles.buttonText}>Confirmar</Text>
              </LinearGradient>
            ) : (
              <View style={[styles.button, styles.buttonDisabled]}>
                <Text style={styles.buttonTextDisabled}>Confirmar</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Navigation size={15} color={trackerColors.primaryLight} />
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
    borderRadius: trackerRadius.xl,
    padding: 28,
    borderWidth: 1,
    borderColor: trackerColors.border,
    alignItems: "center",
    gap: 14,
    ...trackerShadow.card,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  title: {
    fontSize: 23,
    fontWeight: "800",
    color: trackerColors.text,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 14,
    color: trackerColors.textMuted,
    textAlign: "center",
    lineHeight: 21,
    marginBottom: 8,
  },
  input: {
    backgroundColor: trackerColors.backgroundElevated,
    borderWidth: 1.5,
    borderColor: trackerColors.border,
    borderRadius: trackerRadius.sm,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: trackerColors.text,
    fontSize: 16,
    fontWeight: "500",
    width: "100%",
  },
  inputFocused: {
    borderColor: trackerColors.primary,
  },
  buttonWrap: {
    alignSelf: "stretch",
    marginTop: 4,
    borderRadius: trackerRadius.sm,
  },
  button: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    borderRadius: trackerRadius.sm,
  },
  buttonDisabled: {
    backgroundColor: trackerColors.cardElevated,
    borderWidth: 1,
    borderColor: trackerColors.border,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15.5,
    letterSpacing: 0.3,
  },
  buttonTextDisabled: {
    color: trackerColors.textSubtle,
    fontWeight: "700",
    fontSize: 15.5,
    letterSpacing: 0.3,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    marginTop: 26,
  },
  footerText: {
    fontSize: 13,
    color: trackerColors.primaryLight,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
});
