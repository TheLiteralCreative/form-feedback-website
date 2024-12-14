"use client";

import React from 'react';
import FormBuilder from '../../components/form-builder/FormBuilder';
import DndWrapper from '../../components/providers/DndWrapper';

export default function TestPage() {
  const handleFormChange = (fields: any[]) => {
    console.log('Form fields updated:', fields);
  };

  const handleFormSubmit = (data: Record<string, any>) => {
    console.log('Form submitted with data:', data);
  };

  return (
    <DndWrapper>
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Form Builder Test</h1>
            <p className="text-gray-600">
              Create, preview, and test form functionality
            </p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 min-h-[800px]">
            <FormBuilder
              onChange={handleFormChange}
              onSubmit={handleFormSubmit}
            />
          </div>
        </div>
      </div>
    </DndWrapper>
  );
}
