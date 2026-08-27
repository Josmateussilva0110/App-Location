import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Eye, EyeOff, Link, Save, Settings, Wifi } from "lucide-react-native";

import {
  trackerColors,
  trackerGradients,
  trackerRadius,
  trackerShadow,
} from "@/constants/trackerTheme";

type SettingsScreenProps = {
  urlInput: string;
  onChangeUrl: (text: string) => void;
  tokenInput: string;
  onChangeToken: (text: string) => void;
  isSaving: boolean;
  isTesting: boolean;
  canSave: boolean;
  onSave: () => void;
  onTestConnection: () => void;
};

export function SettingsScreen({
  urlInput,
  onChangeUrl,
  tokenInput,
  onChangeToken,
  isSaving,
  isTesting,
  canSave,
  onSave,
  onTestConnection,
}: SettingsScreenProps) {
  const [urlFocused, setUrlFocused] = useState(false);
  const [tokenFocused, setTokenFocused] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const isBusy = isSaving || isTesting;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.card}>
        <LinearGradient
          colors={trackerGradients.brand}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.iconCircle}
        >
          <Settings size={28} color="#fff" strokeWidth={2.2} />
        </LinearGradient>

        <Text style={styles.title}>Configurações</Text>
        <Text style={styles.subtitle}>
          Informe a URL do Google Apps Script (/exec) e o token usados para
          salvar as localizações na planilha.
        </Text>

        <View style={styles.fieldGroup}>
          <View style={styles.labelRow}>
            <Link size={14} color={trackerColors.primaryLight} />
            <Text style={styles.label}>URL do Apps Script</Text>
          </View>
          <TextInput
            value={urlInput}
            onChangeText={onChangeUrl}
            placeholder="https://script.google.com/macros/s/.../exec"
            placeholderTextColor={trackerColors.textSubtle}
            style={[styles.input, styles.urlInput, urlFocused && styles.inputFocused]}
            onFocus={() => setUrlFocused(true)}
            onBlur={() => setUrlFocused(false)}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            multiline
          />
          <Text style={styles.hint}>
            Use o link de implantação do Apps Script, não o link direto da
            planilha (docs.google.com).
          </Text>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Token de sincronização</Text>
          <View style={styles.tokenRow}>
            <TextInput
              value={tokenInput}
              onChangeText={onChangeToken}
              placeholder="Token configurado no Apps Script"
              placeholderTextColor={trackerColors.textSubtle}
              style={[
                styles.input,
                styles.tokenInput,
                tokenFocused && styles.inputFocused,
              ]}
              onFocus={() => setTokenFocused(true)}
              onBlur={() => setTokenFocused(false)}
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry={!showToken}
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowToken((v) => !v)}
              activeOpacity={0.7}
            >
              {showToken ? (
                <EyeOff size={18} color={trackerColors.textMuted} />
              ) : (
                <Eye size={18} color={trackerColors.textMuted} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={styles.secondaryButtonWrap}
          onPress={onTestConnection}
          disabled={isBusy}
          activeOpacity={0.85}
        >
          <View style={[styles.secondaryButton, isBusy && styles.buttonDisabled]}>
            {isTesting ? (
              <ActivityIndicator size="small" color={trackerColors.primaryLight} />
            ) : (
              <Wifi size={16} color={trackerColors.primaryLight} />
            )}
            <Text style={styles.secondaryButtonText}>
              {isTesting ? "Testando..." : "Testar conexão"}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.buttonWrap}
          onPress={onSave}
          disabled={!canSave}
          activeOpacity={0.85}
        >
          {canSave ? (
            <LinearGradient
              colors={trackerGradients.brand}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.button, trackerShadow.glow]}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Save size={16} color="#fff" />
                  <Text style={styles.buttonText}>Salvar</Text>
                </>
              )}
            </LinearGradient>
          ) : (
            <View style={[styles.button, styles.buttonDisabled]}>
              <Text style={styles.buttonTextDisabled}>Salvar</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: trackerColors.background,
    paddingHorizontal: 22,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingVertical: 24,
  },
  card: {
    backgroundColor: trackerColors.card,
    borderRadius: trackerRadius.xl,
    padding: 28,
    borderWidth: 1,
    borderColor: trackerColors.border,
    alignItems: "stretch",
    gap: 14,
    ...trackerShadow.card,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 4,
  },
  title: {
    fontSize: 23,
    fontWeight: "800",
    color: trackerColors.text,
    letterSpacing: -0.4,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: trackerColors.textMuted,
    textAlign: "center",
    lineHeight: 21,
    marginBottom: 8,
  },
  fieldGroup: {
    gap: 8,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: trackerColors.textMuted,
    letterSpacing: 0.2,
  },
  input: {
    backgroundColor: trackerColors.backgroundElevated,
    borderWidth: 1.5,
    borderColor: trackerColors.border,
    borderRadius: trackerRadius.sm,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: trackerColors.text,
    fontSize: 15,
    fontWeight: "500",
  },
  urlInput: {
    minHeight: 72,
    textAlignVertical: "top",
  },
  tokenInput: {
    flex: 1,
    paddingRight: 44,
  },
  inputFocused: {
    borderColor: trackerColors.primary,
  },
  hint: {
    fontSize: 12,
    color: trackerColors.textSubtle,
    lineHeight: 18,
  },
  tokenRow: {
    position: "relative",
    justifyContent: "center",
  },
  eyeButton: {
    position: "absolute",
    right: 12,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  secondaryButtonWrap: {
    marginTop: 4,
    borderRadius: trackerRadius.sm,
  },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: trackerRadius.sm,
    borderWidth: 1,
    borderColor: trackerColors.border,
    backgroundColor: trackerColors.backgroundElevated,
  },
  secondaryButtonText: {
    color: trackerColors.primaryLight,
    fontWeight: "700",
    fontSize: 14.5,
    letterSpacing: 0.2,
  },
  buttonWrap: {
    borderRadius: trackerRadius.sm,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
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
});
