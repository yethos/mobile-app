import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { AuthService } from '@/services/api';

export default function PhoneScreen() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { clearAuthState } = useAuth();

  // Clear any existing auth state when entering this screen
  const handleClearAuth = () => {
    clearAuthState();
  };

  const handleSubmit = async () => {
    const trimmedPhone = phoneNumber.trim();
    
    if (!trimmedPhone) {
      Alert.alert('Error', 'Please enter your phone number');
      return;
    }

    setIsLoading(true);

    try {
      // Add country code if not present
      let formattedPhone = trimmedPhone;
      if (!formattedPhone.startsWith('+')) {
        // Default to US country code if no country code is provided
        // TODO: Implement country detection for Scenario 1
        formattedPhone = '+1' + formattedPhone.replace(/\D/g, '');
      }
      
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
        
        // Check if error is due to user not found
        if (error.message && (error.message.includes('not found') || error.message.includes('does not exist') || error.code === 'USER_NOT_FOUND')) {
          // User doesn't exist, show message and suggest registration
          console.log('User not found');
          
          Alert.alert(
            'Account Not Found',
            'No account found with this phone number. Please create an account first.',
            [
              {
                text: 'Cancel',
                style: 'cancel',
              },
              {
                text: 'Create Account',
                onPress: () => {
                  const queryParams = new URLSearchParams({
                    phone: formattedPhone,
                  }).toString();
                  (router.push as any)(`/(auth)/register?${queryParams}`);
                },
              },
            ]
          );
        } else {
          // Other error
          Alert.alert('Error', error.message || 'Failed to send verification code. Please try again.');
        }
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

        {/* Sign Up Link */}
        <View style={styles.signUpContainer}>
          <Text style={styles.signUpText}>New to Yethos? </Text>
          <Pressable
            onPress={() => {
              const queryParams = new URLSearchParams({
                phone: phoneNumber,
              }).toString();
              (router.push as any)(`/(auth)/register?${queryParams}`);
            }}
            disabled={isLoading}
          >
            <Text style={styles.signUpLink}>Create Account</Text>
          </Pressable>
        </View>

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
  debugButton: {
    padding: 8,
    alignItems: 'center',
  },
  debugText: {
    color: '#999',
    fontSize: 12,
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
  },
  signUpText: {
    fontSize: 14,
    color: '#666',
  },
  signUpLink: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
});