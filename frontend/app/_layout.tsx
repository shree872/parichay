import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider } from '@/context/AuthContext';
import { paperDarkTheme, paperLightTheme } from '@/theme/theme';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const paperTheme = useMemo(
    () => (colorScheme === 'dark' ? paperDarkTheme : paperLightTheme),
    [colorScheme]
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <PaperProvider theme={paperTheme}>
              <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="index" />
                <Stack.Screen name="(auth)" />
                <Stack.Screen name="(tabs)" />
                <Stack.Screen
                  name="profile/edit"
                  options={{ headerShown: true, title: 'Edit Card', presentation: 'modal' }}
                />
                <Stack.Screen
                  name="connection/[id]"
                  options={{ headerShown: true, title: 'Contact' }}
                />
                <Stack.Screen
                  name="connection/add"
                  options={{ headerShown: true, title: 'Add Contact', presentation: 'modal' }}
                />
                <Stack.Screen
                  name="connection/preview"
                  options={{ headerShown: true, title: 'Scanned Card', presentation: 'modal' }}
                />
              </Stack>
            </PaperProvider>
          </AuthProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
