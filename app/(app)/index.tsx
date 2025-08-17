import { View, Text, StyleSheet } from 'react-native';

export default function AppIndex() {
  // Placeholder for post-authentication content
  // This will be reached after successful phone verification and profile setup
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Yethos!</Text>
      <Text style={styles.subtitle}>
        Phone registration successful.{'\n'}
        Main app features will be implemented in future phases.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
});