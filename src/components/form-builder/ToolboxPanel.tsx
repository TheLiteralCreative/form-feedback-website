"use client";

import React from 'react';
import { useDrag } from 'react-dnd';
import { usePreview } from '../../contexts/PreviewContext';

interface FieldType {
  type: string;
  icon: string;
  label: string;
  description: string;
}

const FIELD_TYPES: FieldType[] = [
  {
    type: 'text',
    icon: '📝',
    label: 'Text Input',
    description: 'Single line text input'
  },
  {
    type: 'textarea',
    icon: '📄',
    label: 'Text Area',
    description: 'Multi-line text input'
  },
  {
    type: 'number',
    icon: '🔢',
    label: 'Number',
    description: 'Numeric input field'
  },
  {
    type: 'select',
    icon: '📋',
    label: 'Dropdown',
    description: 'Single selection from options'
  },
  {
    type: 'checkbox',
    icon: '☑️',
    label: 'Checkbox',
    description: 'Multiple choice selection'
  },
  {
    type: 'radio',
    icon: '⭕',
    label: 'Radio',
    description: 'Single choice selection'
  }
];

interface ToolboxPanelProps {
  onAddField?: (fieldType: string) => void;
}

const FieldTypeItem: React.FC<{ field: FieldType; onAddField?: (type: string) => void }> = ({
  field,
  onAddField
}) => {
  const { isPreview } = usePreview();
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'FIELD',
    item: { type: field.type },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    }),
    canDrag: !isPreview
  }));

  if (isPreview) {
    return null;
  }

  return (
    <div
      ref={drag}
      className={`p-3 border rounded-md cursor-move transition-all ${
        isDragging ? 'opacity-50' : 'hover:border-blue-500 hover:bg-blue-50'
      }`}
      onClick={() => onAddField?.(field.type)}
    >
      <div className="flex items-center space-x-3">
        <span className="text-xl">{field.icon}</span>
        <div>
          <h3 className="font-medium text-sm">{field.label}</h3>
          <p className="text-xs text-gray-500">{field.description}</p>
        </div>
      </div>
    </div>
  );
};

const ToolboxPanel: React.FC<ToolboxPanelProps> = ({ onAddField }) => {
  const { isPreview } = usePreview();

  if (isPreview) {
    return null;
  }

  return (
    <div className="w-64 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <h2 className="font-medium text-lg mb-4">Form Fields</h2>
      <div className="space-y-2">
        {FIELD_TYPES.map((field) => (
          <FieldTypeItem
            key={field.type}
            field={field}
            onAddField={onAddField}
          />
        ))}
      </div>
    </div>
  );
};

export default ToolboxPanel;
