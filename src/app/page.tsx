"use client";

import React from 'react';
import FormBuilder from '@/components/form-builder/FormBuilder';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900">
            Form Feedback
          </h1>
          <p className="mt-2 text-gray-600 mb-8">
            Create and manage your forms with ease
          </p>
          
          <FormBuilder />
        </div>
      </main>
    </div>
  );
}
