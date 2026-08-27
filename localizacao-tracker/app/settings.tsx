import { LoadingScreen } from "@/components/tracker/LoadingScreen";
import { SettingsScreen } from "@/components/tracker/SettingsScreen";
import { useSheetConfig } from "@/hooks/useSheetConfig";

export default function SettingsRoute() {
  const {
    urlInput,
    setUrlInput,
    tokenInput,
    setTokenInput,
    isLoading,
    isSaving,
    isTesting,
    canSave,
    saveConfig,
    testConnection,
  } = useSheetConfig();

  if (isLoading) {
    return <LoadingScreen message="Carregando configurações..." />;
  }

  return (
    <SettingsScreen
      urlInput={urlInput}
      onChangeUrl={setUrlInput}
      tokenInput={tokenInput}
      onChangeToken={setTokenInput}
      isSaving={isSaving}
      isTesting={isTesting}
      canSave={canSave}
      onSave={saveConfig}
      onTestConnection={testConnection}
    />
  );
}
