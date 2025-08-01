// components/forms/sections/PatientProgressIndicator.tsx

import React from 'react';
import { usePatientForm } from '@/components/forms/PatientInputForm';

export function PatientProgressIndicator() {
  const { currentStep } = usePatientForm();

  return (
    <div className="flex justify-center mb-8">
      <div className="flex items-center space-x-4">
        {[1, 2, 3, 4, 5, 6].map((step) => (
          <div key={step} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
              ${step <= currentStep ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500'}
              ${step === currentStep ? 'ring-2 ring-blue-300' : ''}
            `}>
              {step}
            </div>
            {step < 6 && (
              <div className={`w-8 h-0.5 mx-2 
                ${step < currentStep ? 'bg-blue-500' : 'bg-gray-200'}
              `} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}