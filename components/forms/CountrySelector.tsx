import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import CountryPicker, { 
  Country, 
  CountryCode, 
  DARK_THEME, 
  DEFAULT_THEME 
} from 'react-native-country-picker-modal';
import { useColorScheme } from '@/hooks/useColorScheme';

export interface CountrySelectorProps {
  selectedCountryCode: CountryCode;
  onCountryChange: (country: Country) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  errorMessage?: string;
  autoDetect?: boolean;
  showCallingCode?: boolean;
  withFilter?: boolean;
  withFlag?: boolean;
  withCountryNameButton?: boolean;
  withCallingCodeButton?: boolean;
  withCloseButton?: boolean;
}

export default function CountrySelector({
  selectedCountryCode,
  onCountryChange,
  placeholder = 'Select Country',
  disabled = false,
  error = false,
  errorMessage,
  autoDetect = true,
  showCallingCode = true,
  withFilter = true,
  withFlag = true,
  withCountryNameButton = false,
  withCallingCodeButton = true,
  withCloseButton = true,
}: CountrySelectorProps) {
  const [countryCode, setCountryCode] = useState<CountryCode>(selectedCountryCode);
  const [visible, setVisible] = useState(false);
  const [callingCode, setCallingCode] = useState<string>('');
  const colorScheme = useColorScheme();

  useEffect(() => {
    setCountryCode(selectedCountryCode);
  }, [selectedCountryCode]);

  const onSelect = (country: Country) => {
    setCountryCode(country.cca2);
    setCallingCode(country.callingCode[0] || '');
    onCountryChange(country);
    setVisible(false);
  };

  const togglePicker = () => {
    if (!disabled) {
      setVisible(!visible);
    }
  };

  return (
    <View style={styles.container}>
      <Pressable
        style={[
          styles.selector,
          disabled && styles.selectorDisabled,
          error && styles.selectorError,
        ]}
        onPress={togglePicker}
        accessibilityRole="button"
        accessibilityLabel={`Country selector, current selection: ${countryCode}`}
        accessibilityHint="Double tap to open country selection"
      >
        <CountryPicker
          {...{
            countryCode,
            withFilter,
            withFlag,
            withCountryNameButton,
            withCallingCodeButton,
            withCloseButton,
            onSelect,
            visible,
            theme: colorScheme === 'dark' ? DARK_THEME : DEFAULT_THEME,
            modalProps: {
              animationType: 'slide',
            },
            filterProps: {
              placeholder: 'Search country...',
              autoFocus: true,
            },
          }}
          onClose={() => setVisible(false)}
          onOpen={() => setVisible(true)}
        />
        
        {showCallingCode && callingCode ? (
          <Text style={[styles.callingCode, disabled && styles.textDisabled]}>
            +{callingCode}
          </Text>
        ) : null}
        
        <Text style={[styles.arrow, disabled && styles.textDisabled]}>▼</Text>
      </Pressable>
      
      {errorMessage && error && (
        <Text style={styles.errorText}>{errorMessage}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    backgroundColor: '#fff',
    minHeight: 48,
  },
  selectorDisabled: {
    backgroundColor: '#f5f5f5',
    opacity: 0.6,
  },
  selectorError: {
    borderColor: '#FF3B30',
  },
  callingCode: {
    fontSize: 16,
    color: '#000',
    marginLeft: 4,
    fontWeight: '500',
  },
  textDisabled: {
    color: '#999',
  },
  arrow: {
    fontSize: 10,
    color: '#999',
    marginLeft: 'auto',
    marginRight: 4,
  },
  errorText: {
    fontSize: 12,
    color: '#FF3B30',
    marginTop: 4,
    marginLeft: 4,
  },
});