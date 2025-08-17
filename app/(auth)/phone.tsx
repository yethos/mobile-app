import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { AuthService } from '@/services/api';
import PhoneInput from '@/components/forms/PhoneInput';
import { Country } from 'react-native-country-picker-modal';
import { formatPhoneWithCountryCode } from '@/utils/countryDetection';

export default function PhoneScreen() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCallingCode, setCountryCallingCode] = useState('1');
  const [isLoading, setIsLoading] = useState(false);
  
  const { clearAuthState } = useAuth();

  // Clear any existing auth state when entering this screen
  const handleClearAuth = () => {
    clearAuthState();
  };

  const handleCountryChange = (country: Country) => {
    setCountryCallingCode(country.callingCode[0] || '1');
  };

  const handleSubmit = async () => {
    const trimmedPhone = phoneNumber.trim();
    
    if (!trimmedPhone) {
      Alert.alert('Error', 'Please enter your phone number');
      return;
    }

    setIsLoading(true);

    try {
      // Format phone number with country code
      const formattedPhone = formatPhoneWithCountryCode(trimmedPhone, countryCallingCode);
      
      const otpData = {
        phoneNumber: formattedPhone,
        primaryAuthMethod: 'phone' as const,
      };
      
      console.log('Requesting OTP with data:', otpData);
      
      try {
        // Try to request OTP first
        const response = await AuthService.requestOTP(otpData);
        console.log('OTP request response:', response);
        
        if (response.success) {
          // Navigate to OTP screen with parameters
          const queryParams = new URLSearchParams({
            phone: formattedPhone,
            method: 'PHONE',
          }).toString();
          
          (router.push as any)(`/(auth)/otp?${queryParams}`);
        } else {
          Alert.alert('Error', response.message || 'Failed to send verification code.');
        }
      } catch (error: any) {
        console.error('OTP request error:', error);
        
        // Show error message
        Alert.alert('Error', error.message || 'Failed to send verification code. Please try again.');
      }
    } catch (error: any) {
      console.error('Unexpected error:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Welcome to Yethos</Text>
        <Text style={styles.subtitle}>
          Enter your phone number to get started
        </Text>

        {/* Phone Input with Country Selector */}
        <PhoneInput
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          onCountryChange={handleCountryChange}
          autoDetectCountry={true}
          editable={!isLoading}
          label="Phone Number"
          required={true}
        />

        {/* Submit Button */}
        <Pressable
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Sending...' : 'Send Verification Code'}
          </Text>
        </Pressable>

        {/* Debug Helper */}
        <Pressable style={styles.debugButton} onPress={handleClearAuth}>
          <Text style={styles.debugText}>Clear Auth State (Debug)</Text>
        </Pressable>
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
  debugButton: {
    padding: 8,
    alignItems: 'center',
  },
  debugText: {
    color: '#999',
    fontSize: 12,
  },
});