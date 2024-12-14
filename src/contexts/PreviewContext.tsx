"use client";

import React, { createContext, useContext, useState } from 'react';

interface PreviewContextType {
  isPreview: boolean;
  formData: Record<string, any>;
  togglePreview: () => void;
  updateFormData: (fieldId: string, value: any) => void;
  resetFormData: () => void;
}

const PreviewContext = createContext<PreviewContextType | undefined>(undefined);

export const PreviewProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isPreview, setIsPreview] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});

  const togglePreview = () => setIsPreview(prev => !prev);

  const updateFormData = (fieldId: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const resetFormData = () => setFormData({});

  return (
    <PreviewContext.Provider
      value={{
        isPreview,
        formData,
        togglePreview,
        updateFormData,
        resetFormData
      }}
    >
      {children}
    </PreviewContext.Provider>
  );
};

export const usePreview = () => {
  const context = useContext(PreviewContext);
  if (context === undefined) {
    throw new Error('usePreview must be used within a PreviewProvider');
  }
  return context;
};
