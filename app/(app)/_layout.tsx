import { Stack } from 'expo-router';

export default function AppLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Simplified for Scenario 1 - phone registration only */}
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  );
}