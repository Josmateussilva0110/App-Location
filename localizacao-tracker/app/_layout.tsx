import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-reanimated';

import { ToastContainer } from '@/components/ui/ToastContainer';
import { ToastProvider } from '@/contexts/ToastContext';
import { trackerColors } from '@/constants/trackerTheme';

import '@/services/backgroundLocationTask';

export const unstable_settings = {
  anchor: '(tabs)',
};

const navTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: trackerColors.background,
    card: trackerColors.background,
    border: trackerColors.border,
    primary: trackerColors.primary,
    text: trackerColors.text,
  },
};

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ToastProvider>
        <ThemeProvider value={navTheme}>
          <Stack screenOptions={{ contentStyle: { backgroundColor: trackerColors.background } }}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          </Stack>
          <StatusBar style="light" />
          <ToastContainer />
        </ThemeProvider>
      </ToastProvider>
    </SafeAreaProvider>
  );
}
