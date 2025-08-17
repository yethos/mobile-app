import { AuthService } from '@/services/api';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

export default function RegisterScreen() {
  const { phone } = useLocalSearchParams<{
    phone?: string;
  }>();

  const [phoneNumber, setPhoneNumber] = useState(phone || '');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    const trimmedPhone = phoneNumber.trim();
    
    if (!trimmedPhone) {
      Alert.alert('Error', 'Please enter your phone number');
      return;
    }

    setIsLoading(true);

    try {
      // Format phone number with country code if needed
      let formattedPhone = trimmedPhone;
      if (!trimmedPhone.startsWith('+')) {
        formattedPhone = '+1' + trimmedPhone.replace(/\D/g, '');
      }
      
      const registrationData = {
        phoneNumber: formattedPhone,
        primaryAuthMethod: 'phone' as const,
      };
      
      console.log('Creating user with data:', registrationData);
      const user = await AuthService.requestOTP(registrationData);
      console.log('User created successfully:', user);
      
      // Request OTP for phone verification
      const otpData = {
        phoneNumber: formattedPhone,
        primaryAuthMethod: 'phone' as const,
      };
      
      console.log('Requesting OTP for new user:', otpData);
      const otpResponse = await AuthService.requestOTP(otpData);
      console.log('OTP request response:', otpResponse);
      
      if (otpResponse.success) {
        // Navigate to OTP screen for phone verification
        const queryParams = new URLSearchParams({
          phone: formattedPhone,
          method: 'PHONE',
        }).toString();
        
        (router.push as any)(`/(auth)/otp?${queryParams}`);
      } else {
        Alert.alert('Error', otpResponse.message || 'Failed to send verification code.');
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      Alert.alert('Registration Failed', error.message || 'Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Create Your Account</Text>
        <Text style={styles.subtitle}>
          Enter your phone number to get started with Yethos
        </Text>

        {/* Phone Input Field */}
        <TextInput
          style={styles.input}
          placeholder="Enter phone number"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          keyboardType="phone-pad"
          autoCapitalize="none"
          autoComplete="tel"
          editable={!isLoading}
        />

        {/* Register Button */}
        <Pressable
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleRegister}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Creating Account...' : 'Continue'}
          </Text>
        </Pressable>

        {/* Sign In Link */}
        <View style={styles.signInContainer}>
          <Text style={styles.signInText}>Already have an account? </Text>
          <Pressable
            onPress={() => router.replace('/(auth)/phone')}
            disabled={isLoading}
          >
            <Text style={styles.signInLink}>Sign In</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#000',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    color: '#666',
    lineHeight: 24,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    marginBottom: 24,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  signInContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
  },
  signInText: {
    fontSize: 14,
    color: '#666',
  },
  signInLink: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
});