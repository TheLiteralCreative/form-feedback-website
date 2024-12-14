import React from 'react';
import BaseField, { BaseFieldProps } from './BaseField';

interface SelectFieldProps extends Omit<BaseFieldProps, 'children'> {
  options: Array<{ value: string; label: string }>;
  value?: string;
  placeholder?: string;
  onChange?: (value: string) => void;
}

const SelectField: React.FC<SelectFieldProps> = ({
  options,
  value,
  placeholder,
  onChange,
  ...baseProps
}) => {
  return (
    <BaseField {...baseProps}>
      <select
        value={value || ''}
        onChange={(e) => onChange?.(e.target.value)}
        className={`
          w-full px-3 py-2 rounded-md border-gray-300 shadow-sm
          focus:border-blue-500 focus:ring-1 focus:ring-blue-500
          disabled:bg-gray-50 disabled:text-gray-500
          ${baseProps.error ? 'border-red-300' : 'border-gray-300'}
        `}
        disabled={baseProps.isPreview}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </BaseField>
  );
};

export default SelectField;
