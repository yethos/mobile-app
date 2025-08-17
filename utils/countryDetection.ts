import { getLocales } from 'expo-localization';
import { CountryCode } from 'react-native-country-picker-modal';

export interface DetectedCountry {
  code: CountryCode;
  callingCode: string;
}

// Common country calling codes mapping
const COUNTRY_CALLING_CODES: Record<string, string> = {
  US: '1',
  GB: '44',
  CA: '1',
  AU: '61',
  FR: '33',
  DE: '49',
  IT: '39',
  ES: '34',
  NL: '31',
  BE: '32',
  CH: '41',
  AT: '43',
  SE: '46',
  NO: '47',
  DK: '45',
  FI: '358',
  PT: '351',
  PL: '48',
  RU: '7',
  JP: '81',
  CN: '86',
  IN: '91',
  BR: '55',
  MX: '52',
  AR: '54',
  ZA: '27',
  EG: '20',
  NG: '234',
  KE: '254',
  IL: '972',
  AE: '971',
  SA: '966',
  TR: '90',
  ID: '62',
  MY: '60',
  PH: '63',
  TH: '66',
  VN: '84',
  KR: '82',
  SG: '65',
  NZ: '64',
  IE: '353',
  GR: '30',
  CZ: '420',
  HU: '36',
  RO: '40',
  BG: '359',
  HR: '385',
  SK: '421',
  SI: '386',
  LT: '370',
  LV: '371',
  EE: '372',
  IS: '354',
  MT: '356',
  CY: '357',
  LU: '352',
};

/**
 * Detects the user's country from device locale settings
 * Falls back to US if detection fails
 */
export async function detectCountryFromDevice(): Promise<DetectedCountry> {
  try {
    const locales = getLocales();
    
    // Get the region code from the first locale
    const regionCode = locales[0]?.regionCode || 'US';
    
    // Ensure it's a valid CountryCode (2-letter ISO code)
    const countryCode = (regionCode.length === 2 ? regionCode : 'US') as CountryCode;
    
    // Get the calling code for the country
    const callingCode = COUNTRY_CALLING_CODES[countryCode] || '1';
    
    console.log('Detected country:', countryCode, 'Calling code:', callingCode);
    
    return {
      code: countryCode,
      callingCode,
    };
  } catch (error) {
    console.error('Error detecting country:', error);
    // Fallback to US
    return {
      code: 'US',
      callingCode: '1',
    };
  }
}

/**
 * Gets country by code with calling code
 */
export function getCountryByCode(code: CountryCode): DetectedCountry {
  return {
    code,
    callingCode: COUNTRY_CALLING_CODES[code] || '1',
  };
}

/**
 * Formats a phone number with country code
 */
export function formatPhoneWithCountryCode(phoneNumber: string, countryCode: string): string {
  // Remove any non-digit characters
  const cleanPhone = phoneNumber.replace(/\D/g, '');
  
  // If already has country code, return as is
  if (cleanPhone.startsWith(countryCode)) {
    return `+${cleanPhone}`;
  }
  
  // Add country code
  return `+${countryCode}${cleanPhone}`;
}

/**
 * Validates if a phone number is valid for a given country
 * This is a basic validation - for production, use a library like libphonenumber
 */
export function validatePhoneForCountry(phoneNumber: string, countryCode: CountryCode): boolean {
  const cleanPhone = phoneNumber.replace(/\D/g, '');
  
  // Basic length validation based on country
  switch (countryCode) {
    case 'US':
    case 'CA':
      return cleanPhone.length === 10 || cleanPhone.length === 11; // With or without country code
    case 'GB':
      return cleanPhone.length === 10 || cleanPhone.length === 11;
    case 'FR':
      return cleanPhone.length === 9 || cleanPhone.length === 10;
    case 'DE':
      return cleanPhone.length >= 10 && cleanPhone.length <= 11;
    case 'IN':
      return cleanPhone.length === 10;
    case 'CN':
      return cleanPhone.length === 11;
    case 'JP':
      return cleanPhone.length === 10 || cleanPhone.length === 11;
    case 'BR':
      return cleanPhone.length === 10 || cleanPhone.length === 11;
    default:
      // Default validation: between 7 and 15 digits
      return cleanPhone.length >= 7 && cleanPhone.length <= 15;
  }
}