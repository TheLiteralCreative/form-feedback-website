import React from 'react';
import BaseField, { BaseFieldProps } from './BaseField';

interface TextFieldProps extends Omit<BaseFieldProps, 'children'> {
  value?: string;
  onChange?: (value: string) => void;
}

const TextField: React.FC<TextFieldProps> = ({
  value = '',
  onChange,
  ...baseProps
}) => {
  return (
    <BaseField {...baseProps}>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="
          w-full p-2 border border-gray-300 rounded-md
          focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          disabled:bg-gray-50 disabled:text-gray-500
          placeholder:text-gray-400
          transition-colors duration-200
        "
        placeholder="Enter text..."
      />
    </BaseField>
  );
};

export default TextField;
