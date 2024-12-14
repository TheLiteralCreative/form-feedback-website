"use client";

import { useState, useCallback } from 'react';

export interface FormField {
  id: string;
  type: string;
  label: string;
  required: boolean;
  properties: Record<string, any>;
}

export function useFormFields(initialFields: FormField[] = []) {
  const [fields, setFields] = useState<FormField[]>(initialFields);
  const [selectedFieldId, setSelectedFieldId] = useState<string | undefined>();

  const addField = useCallback((type: string) => {
    const newField: FormField = {
      id: `field-${Date.now()}`,
      type,
      label: `New ${type} field`,
      required: false,
      properties: getDefaultProperties(type),
    };

    setFields(prev => [...prev, newField]);
    setSelectedFieldId(newField.id);
    return newField;
  }, []);

  const updateField = useCallback((fieldId: string, updates: Partial<FormField>) => {
    setFields(prev => 
      prev.map(field => 
        field.id === fieldId ? { ...field, ...updates } : field
      )
    );
  }, []);

  const moveField = useCallback((fromIndex: number, toIndex: number) => {
    setFields(prev => {
      const newFields = [...prev];
      const [movedField] = newFields.splice(fromIndex, 1);
      newFields.splice(toIndex, 0, movedField);
      return newFields;
    });
  }, []);

  const removeField = useCallback((fieldId: string) => {
    setFields(prev => prev.filter(field => field.id !== fieldId));
    if (selectedFieldId === fieldId) {
      setSelectedFieldId(undefined);
    }
  }, [selectedFieldId]);

  return {
    fields,
    selectedFieldId,
    selectedField: fields.find(f => f.id === selectedFieldId),
    setSelectedFieldId,
    addField,
    updateField,
    moveField,
    removeField,
  };
}

function getDefaultProperties(type: string): Record<string, any> {
  switch (type) {
    case 'text':
      return { placeholder: '', maxLength: 100 };
    case 'textarea':
      return { placeholder: '', rows: 3 };
    case 'number':
      return { min: 0, max: 100, step: 1 };
    case 'select':
    case 'radio':
    case 'checkbox':
      return { options: [] };
    case 'file':
      return { accept: '', maxSize: 5242880 }; // 5MB default
    default:
      return {};
  }
}
