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
    const newCallingCode = country.callingCode[0] || '1';
    
    // Clean the current phone number to remove ANY calling code
    let cleanedPhone = value.replace(/\D/g, '');
    
    // Remove any calling code from the beginning (current or new)
    if (cleanedPhone.startsWith(callingCode)) {
      cleanedPhone = cleanedPhone.substring(callingCode.length);
    } else if (cleanedPhone.startsWith(newCallingCode)) {
      cleanedPhone = cleanedPhone.substring(newCallingCode.length);
    }
    
    // Update state with new country and calling code
    setCountryCode(country.cca2);
    setCallingCode(newCallingCode);
    
    // Update the phone number with just the local number
    onChangeText(cleanedPhone);
    
    if (onCountryChange) {
      onCountryChange(country);
    }
  };

  const handlePhoneChange = (text: string) => {
    // Remove any non-digit characters
    let cleanedText = text.replace(/\D/g, '');
    
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
      
      <View style={[styles.inputContainer, error && styles.inputContainerError]}>
        <CountrySelector
          selectedCountryCode={countryCode}
          onCountryChange={handleCountryChange}
          disabled={!editable}
          error={false}
          showCallingCode={false}
          withFlag={true}
          withCountryNameButton={false}
          withCallingCodeButton={true}
          noBorder={true}
        />
        
        <View style={styles.divider} />
        
        <TextInput
          {...textInputProps}
          style={[
            styles.phoneInput,
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
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  inputContainerError: {
    borderColor: '#FF3B30',
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: '#e0e0e0',
  },
  phoneInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    minHeight: 48,
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