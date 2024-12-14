import React from 'react';
import BaseField, { BaseFieldProps } from './BaseField';

interface RadioGroupProps extends Omit<BaseFieldProps, 'children'> {
  options: Array<{ value: string; label: string }>;
  value?: string;
  onChange?: (value: string) => void;
}

const RadioGroup: React.FC<RadioGroupProps> = ({
  options,
  value,
  onChange,
  ...baseProps
}) => {
  return (
    <BaseField {...baseProps}>
      <div className="space-y-2">
        {options.map((option) => (
          <label
            key={option.value}
            className="flex items-center space-x-3 cursor-pointer"
          >
            <input
              type="radio"
              value={option.value}
              checked={value === option.value}
              onChange={(e) => onChange?.(e.target.value)}
              className="
                w-4 h-4 text-blue-600 border-gray-300
                focus:ring-blue-500 disabled:opacity-50
              "
              disabled={baseProps.isPreview}
            />
            <span className="text-sm text-gray-700">{option.label}</span>
          </label>
        ))}
      </div>
    </BaseField>
  );
};

export default RadioGroup;
