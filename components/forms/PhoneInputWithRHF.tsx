import React from 'react';
import { Controller, UseControllerProps } from 'react-hook-form';
import PhoneInput, { PhoneInputProps } from './PhoneInput';

interface PhoneInputWithRHFProps extends Omit<PhoneInputProps, 'value' | 'onChangeText'> {
  name: string;
  control: UseControllerProps['control'];
  rules?: UseControllerProps['rules'];
  defaultValue?: string;
}

/**
 * PhoneInput component wrapped with React Hook Form Controller
 * Usage example:
 * 
 * const { control, handleSubmit } = useForm();
 * 
 * <PhoneInputWithRHF
 *   name="phoneNumber"
 *   control={control}
 *   rules={{ 
 *     required: 'Phone number is required',
 *     minLength: { value: 7, message: 'Phone number is too short' }
 *   }}
 *   label="Phone Number"
 *   required
 * />
 */
export default function PhoneInputWithRHF({
  name,
  control,
  rules,
  defaultValue = '',
  ...phoneInputProps
}: PhoneInputWithRHFProps) {
  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      defaultValue={defaultValue}
      render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
        <PhoneInput
          {...phoneInputProps}
          value={value}
          onChangeText={onChange}
          error={!!error}
          errorMessage={error?.message}
        />
      )}
    />
  );
}