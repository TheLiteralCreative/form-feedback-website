"use client";

import React from 'react';
import TextField from '../form-fields/TextField';

interface FormField {
  id: string;
  label: string;
  value: string;
}

interface FormCanvasProps {
  fields: FormField[];
  selectedFieldId?: string;
  onFieldMove: (dragIndex: number, hoverIndex: number) => void;
  onFieldSelect: (fieldId: string) => void;
  onFieldChange: (fieldId: string, value: string) => void;
}

const FormCanvas: React.FC<FormCanvasProps> = ({
  fields,
  selectedFieldId,
  onFieldMove,
  onFieldSelect,
  onFieldChange,
}) => {
  return (
    <div className="min-h-[400px] p-4 bg-white rounded-lg border border-gray-200">
      {fields.length === 0 ? (
        <div className="h-[300px] border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
          <div className="text-center text-gray-500">
            <p className="text-lg font-medium mb-1">No Fields Added</p>
            <p className="text-sm">Click "Add Text Field" to start building your form</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {fields.map((field, index) => (
            <TextField
              key={field.id}
              id={field.id}
              label={field.label}
              value={field.value}
              index={index}
              isSelected={field.id === selectedFieldId}
              onMove={onFieldMove}
              onSelect={onFieldSelect}
              onChange={(value) => onFieldChange(field.id, value)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FormCanvas;
