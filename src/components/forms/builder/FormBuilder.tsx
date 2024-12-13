import React, { useState } from 'react';
import { ToolboxPanel } from './ToolboxPanel';
import { Canvas } from './Canvas';

export interface FormElement {
  id: string;
  type: 'text' | 'file' | 'payment';
  label: string;
  required: boolean;
  properties: Record<string, any>;
}

export const FormBuilder: React.FC = () => {
  const [elements, setElements] = useState<FormElement[]>([]);

  const handleAddElement = (elementType: FormElement['type']) => {
    const newElement: FormElement = {
      id: `element-${Date.now()}`,
      type: elementType,
      label: `New ${elementType} field`,
      required: false,
      properties: {}
    };

    setElements([...elements, newElement]);
  };

  return (
    <div className="flex h-full">
      <div className="w-64 border-r border-gray-200 bg-white">
        <ToolboxPanel onAddElement={handleAddElement} />
      </div>
      <div className="flex-1 bg-gray-50">
        <Canvas elements={elements} />
      </div>
    </div>
  );
};
