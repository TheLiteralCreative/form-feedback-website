"use client";

import React from 'react';
import { usePreview } from '../../contexts/PreviewContext';

interface PreviewModeProps {
  onSubmit?: (data: Record<string, any>) => void;
}

const PreviewMode: React.FC<PreviewModeProps> = ({ onSubmit }) => {
  const { isPreview, formData, togglePreview } = usePreview();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.(formData);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white rounded-lg shadow-lg p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-gray-900">
            {isPreview ? 'Preview Mode' : 'Edit Mode'}
          </h3>
          <button
            onClick={togglePreview}
            className={`
              px-4 py-2 rounded-md text-sm font-medium
              ${isPreview
                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                : 'bg-blue-600 text-white hover:bg-blue-700'
              }
            `}
          >
            {isPreview ? 'Exit Preview' : 'Preview Form'}
          </button>
        </div>

        {isPreview && (
          <div className="space-y-2">
            <button
              onClick={handleSubmit}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-md
                hover:bg-green-700 text-sm font-medium"
            >
              Submit Form
            </button>
            <p className="text-xs text-gray-500 text-center">
              Test your form as respondents will see it
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PreviewMode;
