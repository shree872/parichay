import { Redirect, Stack } from 'expo-router';

import { useAuth } from '@/hooks/useAuth';

export default function AuthLayout() {
  const { status } = useAuth();

  // Already signed in? Don't allow navigating back into the auth flow.
  if (status === 'signedIn') {
    return <Redirect href="/(tabs)/card" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
    </Stack>
  );
}
