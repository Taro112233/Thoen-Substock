// components/forms/PatientInputForm.tsx
// Modular structure following showcase pattern

'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

// Import sections
import { PatientFormHeader } from '@/components/forms/sections/PatientFormHeader';
import { PatientProgressIndicator } from '@/components/forms/sections/PatientProgressIndicator';
import { PatientInfoSection } from '@/components/forms/sections/PatientInfoSection';
import { DrugSelectionSection } from '@/components/forms/sections/DrugSelectionSection';
import { ConcentrationSection } from '@/components/forms/sections/ConcentrationSection';
import { FrequencySection } from '@/components/forms/sections/FrequencySection';
import { ReviewSection } from '@/components/forms/sections/ReviewSection';
import { ResultsSection } from '@/components/forms/sections/ResultsSection';
import { PatientFormFooter } from '@/components/forms/sections/PatientFormFooter';

// Types and validation
import { PatientInputSchema, type PatientInput } from '@/lib/validations/patient';
import { type DrugConcentration, type FrequencyKey } from '@/lib/constants/drugs';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const stepVariants = {
  hidden: { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -50 }
};

// Form context for sharing state between sections
export interface PatientFormContextType {
  currentStep: number;
  setCurrentStep: (step: number) => void;
  selectedDrug: any | null;
  setSelectedDrug: (drug: any) => void;
  selectedConcentration: DrugConcentration | null;
  setSelectedConcentration: (conc: DrugConcentration | null) => void;
  selectedFrequency: FrequencyKey | '';
  setSelectedFrequency: (freq: FrequencyKey | '') => void;
  calculation: any | null;
  setCalculation: (calc: any) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  form: any;
  resetForm: () => void;
}

export const PatientFormContext = React.createContext<PatientFormContextType | null>(null);

// Hook to use form context
export const usePatientForm = () => {
  const context = React.useContext(PatientFormContext);
  if (!context) {
    throw new Error('usePatientForm must be used within PatientFormProvider');
  }
  return context;
};

// Main form component
const PatientInputForm: React.FC = () => {
  // Form state
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedDrug, setSelectedDrug] = useState<any | null>(null);
  const [selectedConcentration, setSelectedConcentration] = useState<DrugConcentration | null>(null);
  const [selectedFrequency, setSelectedFrequency] = useState<FrequencyKey | ''>('');
  const [calculation, setCalculation] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  // React Hook Form
  const form = useForm<any>({
    resolver: zodResolver(PatientInputSchema),
    defaultValues: {
      ageYears: '' as any,
      ageMonths: '' as any,
      weight: '' as any,
      gender: undefined
    }
  });

  // Reset form function
  const resetForm = () => {
    setCurrentStep(1);
    form.reset();
    setSelectedDrug(null);
    setSelectedConcentration(null);
    setSelectedFrequency('');
    setCalculation(null);
  };

  // Context value
  const contextValue: PatientFormContextType = {
    currentStep,
    setCurrentStep,
    selectedDrug,
    setSelectedDrug,
    selectedConcentration,
    setSelectedConcentration,
    selectedFrequency,
    setSelectedFrequency,
    calculation,
    setCalculation,
    loading,
    setLoading,
    form,
    resetForm
  };

  return (
    <PatientFormContext.Provider value={contextValue}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-4xl mx-auto">
          
          {/* Header */}
          <PatientFormHeader />

          {/* Progress Indicator */}
          <PatientProgressIndicator />

          {/* Main Content */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8"
          >
            {/* Form Sections */}
            {currentStep === 1 && <PatientInfoSection />}
            {currentStep === 2 && <DrugSelectionSection />}
            {currentStep === 3 && <ConcentrationSection />}
            {currentStep === 4 && <FrequencySection />}
            {currentStep === 5 && <ReviewSection />}
            {currentStep === 6 && <ResultsSection />}

            {/* Footer - Only show on drug selection step */}
            {currentStep === 2 && <PatientFormFooter />}
          </motion.div>
        </div>
      </div>
    </PatientFormContext.Provider>
  );
};

export default PatientInputForm;