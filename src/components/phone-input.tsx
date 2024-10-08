import React from 'react';
import InputMask,{ Props as InputMaskProps } from 'react-input-mask';
import { Input } from "@/components/ui/input";  // Altere para o caminho correto do seu componente ShadCN Input

interface PhoneInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const PhoneInput: React.FC<PhoneInputProps> = ({ value, onChange,...rest }) => {
  return (
    <InputMask
      mask="(99) 99999-9999"
      value={value}
      onChange={onChange}
      {...rest}
    >
        {(inputProps: InputMaskProps) => (
        <Input
          {...inputProps}
          type="tel"
          placeholder="(XX) XXXXX-XXXX"
        />
      )}
    </InputMask>
  );
};