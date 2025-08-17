import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps } from 'react-native';
import CountrySelector from './CountrySelector';
import { Country, CountryCode } from 'react-native-country-picker-modal';
import { detectCountryFromDevice, formatPhoneWithCountryCode, validatePhoneForCountry } from '@/utils/countryDetection';

export interface PhoneInputProps extends Omit<TextInputProps, 'value' | 'onChangeText'> {
  value: string;
  onChangeText: (phoneNumber: string) => void;
  onCountryChange?: (country: Country) => void;
  defaultCountryCode?: CountryCode;
  autoDetectCountry?: boolean;
  error?: boolean;
  errorMessage?: string;
  label?: string;
  required?: boolean;
}

export default function PhoneInput({
  value,
  onChangeText,
  onCountryChange,
  defaultCountryCode = 'US',
  autoDetectCountry = true,
  error = false,
  errorMessage,
  label = 'Phone Number',
  required = false,
  editable = true,
  ...textInputProps
}: PhoneInputProps) {
  const [countryCode, setCountryCode] = useState<CountryCode>(defaultCountryCode);
  const [callingCode, setCallingCode] = useState<string>('1');
  const [isDetectingCountry, setIsDetectingCountry] = useState(autoDetectCountry);

  // Auto-detect country on mount
  useEffect(() => {
    if (autoDetectCountry && isDetectingCountry) {
      detectCountryFromDevice().then((detected) => {
        setCountryCode(detected.code);
        setCallingCode(detected.callingCode);
        setIsDetectingCountry(false);
      });
    }
  }, [autoDetectCountry, isDetectingCountry]);

  const handleCountryChange = (country: Country) => {
    setCountryCode(country.cca2);
    setCallingCode(country.callingCode[0] || '1');
    
    if (onCountryChange) {
      onCountryChange(country);
    }
  };

  const handlePhoneChange = (text: string) => {
    // Remove any non-digit characters except + at the beginning
    let cleanedText = text.replace(/[^\d+]/g, '');
    
    // If the text starts with +, remove it for now
    if (cleanedText.startsWith('+')) {
      cleanedText = cleanedText.substring(1);
    }
    
    // If the text starts with the calling code, remove it
    if (cleanedText.startsWith(callingCode)) {
      cleanedText = cleanedText.substring(callingCode.length);
    }
    
    onChangeText(cleanedText);
  };

  // Get the full phone number with country code
  const getFullPhoneNumber = (): string => {
    if (!value) return '';
    return formatPhoneWithCountryCode(value, callingCode);
  };

  // Validate the phone number
  const isValidPhone = (): boolean => {
    if (!value) return true; // Empty is valid (required validation is separate)
    return validatePhoneForCountry(value, countryCode);
  };

  return (
    <View style={styles.container}>
      {label && (
        <Text style={styles.label}>
          {label}{required && <Text style={styles.required}> *</Text>}
        </Text>
      )}
      
      <View style={styles.inputContainer}>
        <View style={styles.countrySelector}>
          <CountrySelector
            selectedCountryCode={countryCode}
            onCountryChange={handleCountryChange}
            disabled={!editable}
            error={error}
            showCallingCode={true}
          />
        </View>
        
        <View style={styles.phoneInputWrapper}>
          <TextInput
            {...textInputProps}
            style={[
              styles.phoneInput,
              error && styles.phoneInputError,
              !editable && styles.phoneInputDisabled,
            ]}
            value={value}
            onChangeText={handlePhoneChange}
            placeholder="Phone number"
            keyboardType="phone-pad"
            autoComplete="tel"
            autoCapitalize="none"
            editable={editable}
            accessibilityLabel={`${label} input field`}
            accessibilityHint={`Enter your phone number without country code`}
          />
        </View>
      </View>
      
      {errorMessage && error && (
        <Text style={styles.errorText}>{errorMessage}</Text>
      )}
      
      {/* Debug info - remove in production */}
      {__DEV__ && (
        <Text style={styles.debugText}>
          Full number: {getFullPhoneNumber()} | Valid: {isValidPhone() ? 'Yes' : 'No'}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  required: {
    color: '#FF3B30',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 8,
  },
  countrySelector: {
    minWidth: 100,
    maxWidth: 120,
  },
  phoneInputWrapper: {
    flex: 1,
  },
  phoneInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    backgroundColor: '#fff',
    minHeight: 48,
  },
  phoneInputError: {
    borderColor: '#FF3B30',
  },
  phoneInputDisabled: {
    backgroundColor: '#f5f5f5',
    opacity: 0.6,
  },
  errorText: {
    fontSize: 12,
    color: '#FF3B30',
    marginTop: 4,
    marginLeft: 4,
  },
  debugText: {
    fontSize: 10,
    color: '#999',
    marginTop: 4,
    fontStyle: 'italic',
  },
});