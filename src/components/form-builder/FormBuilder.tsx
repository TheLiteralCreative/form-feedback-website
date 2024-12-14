"use client";

import React, { useState } from 'react';
import FormCanvas from './FormCanvas';
import { TrashIcon, PlusIcon } from '@heroicons/react/24/solid';

interface FormField {
  id: string;
  label: string;
  value: string;
}

const FormBuilder: React.FC = () => {
  const [fields, setFields] = useState<FormField[]>([]);
  const [selectedFieldId, setSelectedFieldId] = useState<string | undefined>();

  const handleAddField = () => {
    const newField: FormField = {
      id: `field-${Date.now()}`,
      label: 'New Text Field',
      value: ''
    };
    setFields(prev => [...prev, newField]);
    setSelectedFieldId(newField.id);
  };

  const handleFieldMove = (dragIndex: number, hoverIndex: number) => {
    const newFields = [...fields];
    const [draggedField] = newFields.splice(dragIndex, 1);
    newFields.splice(hoverIndex, 0, draggedField);
    setFields(newFields);
  };

  const handleFieldChange = (id: string, value: string) => {
    setFields(prev => 
      prev.map(field => 
        field.id === id ? { ...field, value } : field
      )
    );
  };

  const handleLabelChange = (id: string, label: string) => {
    setFields(prev => 
      prev.map(field => 
        field.id === id ? { ...field, label } : field
      )
    );
  };

  const handleDeleteField = (id: string) => {
    setFields(prev => prev.filter(field => field.id !== id));
    if (selectedFieldId === id) {
      setSelectedFieldId(undefined);
    }
  };

  const selectedField = fields.find(f => f.id === selectedFieldId);

  return (
    <div className="flex gap-6">
      {/* Toolbox */}
      <div className="w-64 flex flex-col gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h2 className="font-medium text-gray-900 mb-3">Add Fields</h2>
          <button
            onClick={handleAddField}
            className="w-full py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
          >
            <PlusIcon className="w-4 h-4" />
            Add Text Field
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1">
        <FormCanvas
          fields={fields}
          selectedFieldId={selectedFieldId}
          onFieldMove={handleFieldMove}
          onFieldSelect={setSelectedFieldId}
          onFieldChange={handleFieldChange}
        />
      </div>

      {/* Property Panel */}
      <div className="w-64 flex flex-col gap-4">
        {selectedField ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h2 className="font-medium text-gray-900 mb-4">Field Properties</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Field Label
                </label>
                <input
                  type="text"
                  value={selectedField.label}
                  onChange={(e) => handleLabelChange(selectedField.id, e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
              
              <div className="pt-4 border-t border-gray-200">
                <button
                  onClick={() => handleDeleteField(selectedField.id)}
                  className="w-full py-2 px-4 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                >
                  <TrashIcon className="w-4 h-4" />
                  Delete Field
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <p className="text-gray-500 text-sm text-center">
              Select a field to edit its properties
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FormBuilder;
