import { Redirect } from 'expo-router';

export default function AuthIndex() {
  // Redirect to the phone screen as the entry point for authentication
  return <Redirect href="/phone" />;
}