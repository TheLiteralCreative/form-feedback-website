"use client";

import React from 'react';
import { usePreview } from '../../contexts/PreviewContext';

interface PropertyPanelProps {
  selectedField?: {
    id: string;
    type: string;
    label: string;
    required: boolean;
    properties: Record<string, any>;
  };
  onPropertyChange?: (fieldId: string, property: string, value: any) => void;
}

const PropertyPanel: React.FC<PropertyPanelProps> = ({
  selectedField,
  onPropertyChange,
}) => {
  const { isPreview } = usePreview();

  if (isPreview) {
    return null;
  }

  if (!selectedField) {
    return (
      <div className="w-72 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="text-center text-gray-500">
          <p>Select a field to edit its properties</p>
        </div>
      </div>
    );
  }

  const handleChange = (property: string, value: any) => {
    onPropertyChange?.(selectedField.id, property, value);
  };

  const renderPropertyInput = (key: string, value: any) => {
    const label = key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');

    if (typeof value === 'boolean') {
      return (
        <div key={key} className="flex items-center space-x-2">
          <input
            type="checkbox"
            id={key}
            checked={value}
            onChange={(e) => handleChange(key, e.target.checked)}
            className="rounded text-blue-500 focus:ring-blue-500"
          />
          <label htmlFor={key} className="text-sm font-medium text-gray-700">
            {label}
          </label>
        </div>
      );
    }

    if (typeof value === 'number') {
      return (
        <div key={key} className="space-y-1">
          <label htmlFor={key} className="block text-sm font-medium text-gray-700">
            {label}
          </label>
          <input
            type="number"
            id={key}
            value={value}
            onChange={(e) => handleChange(key, Number(e.target.value))}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      );
    }

    if (Array.isArray(value)) {
      return (
        <div key={key} className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            {label}
          </label>
          <div className="space-y-2">
            {value.map((item, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={item}
                  onChange={(e) => {
                    const newValue = [...value];
                    newValue[index] = e.target.value;
                    handleChange(key, newValue);
                  }}
                  className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button
                  onClick={() => {
                    const newValue = value.filter((_, i) => i !== index);
                    handleChange(key, newValue);
                  }}
                  className="p-2 text-red-500 hover:text-red-700"
                >
                  ×
                </button>
              </div>
            ))}
            <button
              onClick={() => handleChange(key, [...value, ''])}
              className="w-full px-3 py-2 text-sm text-blue-600 border border-blue-300 rounded-md hover:bg-blue-50"
            >
              Add Option
            </button>
          </div>
        </div>
      );
    }

    return (
      <div key={key} className="space-y-1">
        <label htmlFor={key} className="block text-sm font-medium text-gray-700">
          {label}
        </label>
        <input
          type="text"
          id={key}
          value={value}
          onChange={(e) => handleChange(key, e.target.value)}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>
    );
  };

  return (
    <div className="w-72 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <h2 className="font-medium text-lg mb-4">Field Properties</h2>
      
      <div className="space-y-4">
        {/* Label */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            Label
          </label>
          <input
            type="text"
            value={selectedField.label}
            onChange={(e) => handleChange('label', e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Required */}
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="required"
            checked={selectedField.required}
            onChange={(e) => handleChange('required', e.target.checked)}
            className="rounded text-blue-500 focus:ring-blue-500"
          />
          <label htmlFor="required" className="text-sm font-medium text-gray-700">
            Required
          </label>
        </div>

        {/* Field-specific properties */}
        <div className="pt-4 border-t space-y-4">
          <h3 className="font-medium text-sm text-gray-900">Field Settings</h3>
          {Object.entries(selectedField.properties).map(([key, value]) => 
            renderPropertyInput(key, value)
          )}
        </div>
      </div>
    </div>
  );
};

export default PropertyPanel;
