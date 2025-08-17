import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen 
        name="index" 
        options={{ 
          title: 'Welcome',
          gestureEnabled: false, // Prevent going back on auth screens
        }} 
      />
      <Stack.Screen 
        name="phone" 
        options={{ 
          title: 'Phone Sign In',
          gestureEnabled: false, // Prevent going back on auth screens
        }} 
      />
      <Stack.Screen 
        name="register" 
        options={{ 
          title: 'Phone Registration',
          presentation: 'card',
        }} 
      />
      <Stack.Screen 
        name="otp" 
        options={{ 
          title: 'Verify Code',
          presentation: 'card',
        }} 
      />
      <Stack.Screen 
        name="profile" 
        options={{ 
          title: 'Profile Setup',
          gestureEnabled: false, // Prevent skipping profile setup
        }} 
      />
    </Stack>
  );
}