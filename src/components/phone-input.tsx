import React from 'react';
import { Input, InputProps } from "@/components/ui/input";

type PhoneInputProps = Omit<InputProps, 'value' | 'onChange'> & {
  value: string;
  onChange: (value: string) => void;
};

export const PhoneInput: React.FC<PhoneInputProps> = ({ value, onChange, ...rest }) => {
  const formatPhoneNumber = (input: string): string => {
    const numbers = input.replace(/\D/g, '');
    const match = numbers.match(/^(\d{0,2})(\d{0,5})(\d{0,4})$/);
    if (!match) return input;
    
    let formatted = '';
    if (match[1]) formatted += `(${match[1]}`;
    if (match[2]) formatted += `) ${match[2]}`;
    if (match[3]) formatted += `-${match[3]}`;
    
    return formatted.trim();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    onChange(formatted);
  };

  return (
    <Input
      {...rest}
      type="tel"
      value={formatPhoneNumber(value)}
      onChange={handleChange}
      placeholder="(XX) XXXXX-XXXX"
    />
  );
};
