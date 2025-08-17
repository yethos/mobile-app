import { View, Text, TextInput, Pressable, StyleSheet, Alert } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { AuthService } from '@/services/api';

export default function OTPScreen() {
  const { phone, email, method } = useLocalSearchParams<{
    phone?: string;
    email?: string;
    method: 'PHONE' | 'EMAIL';
  }>();
  
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [canResend, setCanResend] = useState(false);
  
  const inputRef = useRef<TextInput>(null);
  const { login } = useAuth();

  // Auto-focus input when screen loads
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Countdown timer
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleOtpChange = (value: string) => {
    // Only allow numbers and limit to 6 digits
    const numericValue = value.replace(/[^0-9]/g, '').slice(0, 6);
    setOtp(numericValue);

    // Auto-submit when 6 digits are entered
    if (numericValue.length === 6) {
      handleSubmit(numericValue);
    }
  };

  const handleSubmit = async (otpCode: string = otp) => {
    if (otpCode.length !== 6) {
      Alert.alert('Error', 'Please enter a 6-digit code');
      return;
    }

    setIsLoading(true);

    try {
      // Call API to verify OTP
      const verificationData = method === 'PHONE' 
        ? { phoneNumber: phone, code: otp }
        : { email: email, code: otp };
      
      console.log('Verifying OTP with data:', verificationData);
      const response = await AuthService.verifyOTP(verificationData);
      console.log('OTP verification response:', response);
      
      if (response.tokens && response.user) {
        // Login the user (this will update auth state)
        await login(response.tokens, response.user);

        // Navigate to profile setup for new users
        router.replace('/(auth)/profile');
      } else {
        Alert.alert('Error', 'Invalid verification response from server.');
        setOtp('');
      }
      
    } catch (error: any) {
      console.error('OTP verification error:', error);
      Alert.alert('Error', error.message || 'Invalid verification code. Please try again.');
      setOtp(''); // Clear the OTP on error
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;

    try {
      // Call API to resend OTP with primaryAuthMethod
      const authMethod = method.toLowerCase() as 'phone' | 'email';
      const otpData: { phoneNumber?: string; email?: string; primaryAuthMethod: 'phone' | 'email' } = {
        primaryAuthMethod: authMethod,
      };
      
      if (method === 'PHONE') {
        otpData.phoneNumber = phone;
      } else {
        otpData.email = email;
      }
      
      const response = await AuthService.requestOTP(otpData);
      
      if (response.success) {
        Alert.alert('Success', response.message || 'Verification code sent!');
        setTimeLeft(600); // Reset timer
        setCanResend(false);
        setOtp(''); // Clear current OTP
      } else {
        Alert.alert('Error', response.message || 'Failed to resend code.');
      }
    } catch (error: any) {
      console.error('Resend OTP error:', error);
      Alert.alert('Error', error.message || 'Failed to resend code. Please try again.');
    }
  };

  const contactInfo = method === 'PHONE' ? phone : email;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Enter Verification Code</Text>
        <Text style={styles.subtitle}>
          We sent a 6-digit code to {'\n'}
          <Text style={styles.contact}>{contactInfo}</Text>
        </Text>

        {/* OTP Input */}
        <TextInput
          ref={inputRef}
          style={[styles.otpInput, { fontSize: 32, letterSpacing: 8 }]}
          value={otp}
          onChangeText={handleOtpChange}
          placeholder="000000"
          keyboardType="number-pad"
          maxLength={6}
          textAlign="center"
          editable={!isLoading}
          autoFocus
        />

        {/* Timer */}
        {!canResend && (
          <Text style={styles.timer}>
            Code expires in {formatTime(timeLeft)}
          </Text>
        )}

        {/* Manual Submit Button */}
        {otp.length === 6 && (
          <Pressable
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={() => handleSubmit()}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? 'Verifying...' : 'Verify Code'}
            </Text>
          </Pressable>
        )}

        {/* Resend Button */}
        <Pressable
          style={[styles.resendButton, !canResend && styles.resendButtonDisabled]}
          onPress={handleResend}
          disabled={!canResend}
        >
          <Text style={[styles.resendText, !canResend && styles.resendTextDisabled]}>
            {canResend ? 'Resend Code' : `Resend available in ${formatTime(timeLeft)}`}
          </Text>
        </Pressable>

        {/* Back Button */}
        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
          disabled={isLoading}
        >
          <Text style={styles.backText}>Change {method === 'PHONE' ? 'Phone Number' : 'Email'}</Text>
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
  contact: {
    fontWeight: '600',
    color: '#007AFF',
  },
  otpInput: {
    borderWidth: 2,
    borderColor: '#007AFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    backgroundColor: '#f8f9fa',
    fontWeight: '600',
    color: '#000',
  },
  timer: {
    textAlign: 'center',
    color: '#666',
    fontSize: 14,
    marginBottom: 24,
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
  resendButton: {
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  resendButtonDisabled: {
    opacity: 0.5,
  },
  resendText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '500',
  },
  resendTextDisabled: {
    color: '#999',
  },
  backButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  backText: {
    color: '#666',
    fontSize: 14,
  },
});