import { ConvexProvider, ConvexReactClient } from 'convex/react';
import { ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import '../global.css';

import { palette } from '@/constants/recharge-theme';

const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL!);

const warmTheme = {
  dark: false,
  colors: {
    primary: palette.ember,
    background: palette.canvas,
    card: palette.paper,
    text: palette.ink,
    border: palette.line,
    notification: palette.gold,
  },
  fonts: {
    regular: {
      fontFamily: 'System',
      fontWeight: '400' as const,
    },
    medium: {
      fontFamily: 'System',
      fontWeight: '500' as const,
    },
    bold: {
      fontFamily: 'System',
      fontWeight: '700' as const,
    },
    heavy: {
      fontFamily: 'System',
      fontWeight: '800' as const,
    },
  },
};

export default function RootLayout() {
  return (
    <ConvexProvider client={convex}>
      <ThemeProvider value={warmTheme}>
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: palette.canvas } }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="challenge" />
          <Stack.Screen name="check-in" />
          <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
        </Stack>
        <StatusBar style="dark" />
      </ThemeProvider>
    </ConvexProvider>
  );
}
