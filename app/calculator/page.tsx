// app/calculator/page.tsx
// Simple calculator page without dashboard

import React from 'react';
import PatientInputForm from '@/components/forms/PatientInputForm';

export default function CalculatorPage() {
  return (
    <main className="min-h-screen">
      <PatientInputForm />
    </main>
  );
}