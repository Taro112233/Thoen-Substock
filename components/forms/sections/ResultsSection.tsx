// components/forms/sections/ResultsSection.tsx

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Calculator } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

import { usePatientForm } from '@/components/forms/PatientInputForm';

const stepVariants = {
  hidden: { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -50 }
};

export function ResultsSection() {
  const { calculation, setCurrentStep, resetForm } = usePatientForm();
  const [resultUnit, setResultUnit] = useState<'ml' | 'mg'>('ml');

  if (!calculation) return null;

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="w-5 h-5" />
          ผลการคำนวณ
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <motion.div
          variants={stepVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="space-y-6"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-green-50 border border-green-200 rounded-lg p-6"
          >
            <h3 className="text-xl font-bold text-green-800 mb-4 text-center">
              ผลการคำนวณ
            </h3>
            
            <div className="space-y-4">
              <div className="text-center">
                <div className="flex justify-center items-center gap-2 mb-2">
                  <Button
                    variant={resultUnit === 'ml' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setResultUnit('ml')}
                  >
                    mL
                  </Button>
                  <Button
                    variant={resultUnit === 'mg' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setResultUnit('mg')}
                  >
                    mg
                  </Button>
                </div>
                
                <motion.div 
                  className="text-4xl font-bold text-green-600"
                  key={resultUnit}
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", duration: 0.3 }}
                >
                  {resultUnit === 'ml' 
                    ? `${calculation.calculation.volumeInMl} mL` 
                    : `${calculation.calculation.doseInMg} mg`}
                </motion.div>
                <div className="text-lg text-gray-600 mt-1">
                  ต่อมื้อ ({calculation.calculation.frequencyLabel})
                </div>
              </div>
              
              {/* Details */}
              <div className="border-t pt-4 space-y-2 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex justify-between">
                    <span>ยา:</span>
                    <span className="font-medium">{calculation.drug.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>ขนาดยา:</span>
                    <span className="font-medium">{calculation.calculation.concentration.label}</span>
                  </div>
                  <div className="flex justify-between col-span-2">
                    <span>ขนาดต่อมื้อ:</span>
                    <span className="font-medium">
                      {calculation.calculation.doseInMg} mg = {calculation.calculation.volumeInMl} mL
                    </span>
                  </div>
                  <div className="flex justify-between col-span-2">
                    <span>ความถี่:</span>
                    <span className="font-medium">{calculation.calculation.frequencyLabel}</span>
                  </div>
                </div>
              </div>

              {/* Calculation Steps */}
              {(calculation.steps.step1 || calculation.steps.step2 || calculation.steps.step3) && (
                <div className="bg-blue-50 border border-blue-200 rounded p-3 mt-4">
                  <h4 className="font-medium text-blue-800 mb-2">ขั้นตอนการคำนวณ</h4>
                  <div className="text-sm text-blue-700 space-y-1">
                    {calculation.steps.step1 && <div>1. {calculation.steps.step1}</div>}
                    {calculation.steps.step2 && <div>2. {calculation.steps.step2}</div>}
                    {calculation.steps.step3 && <div>3. {calculation.steps.step3}</div>}
                  </div>
                </div>
              )}
              
              {/* Measurement Guidance */}
              {calculation.measurementGuidance && (
                <div className="bg-blue-50 border border-blue-200 rounded p-3">
                  <h4 className="font-medium text-blue-800 mb-2">คำแนะนำการวัดยา</h4>
                  <div className="text-sm text-blue-700">
                    {calculation.measurementGuidance}
                  </div>
                </div>
              )}
              
              {/* Daily total */}
              <div className="bg-gray-50 border border-gray-200 rounded p-3">
                <h4 className="font-medium text-gray-800 mb-2">ปริมาณรวมต่อวัน</h4>
                <div className="text-sm text-gray-700">
                  <div>รวมต่อวัน: {(calculation.calculation.doseInMg * calculation.calculation.timesPerDay).toFixed(2)} mg 
                    = {(calculation.calculation.volumeInMl * calculation.calculation.timesPerDay).toFixed(2)} mL</div>
                  <div>แบ่งเป็น {calculation.calculation.timesPerDay} มื้อ</div>
                </div>
              </div>
              
              {/* Warnings */}
              {calculation.warnings && calculation.warnings.length > 0 && (
                <Alert className="border-yellow-200 bg-yellow-50">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <AlertDescription className="text-yellow-800">
                    <div className="font-medium mb-1">ข้อควรระวัง:</div>
                    {calculation.warnings.map((warning: string, index: number) => (
                      <div key={index}>• {warning}</div>
                    ))}
                  </AlertDescription>
                </Alert>
              )}
              
              {/* Action buttons */}
              <div className="flex gap-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setCurrentStep(5)}
                  className="flex-1"
                >
                  แก้ไขข้อมูล
                </Button>
                <Button 
                  onClick={resetForm}
                  className="flex-1"
                >
                  ผู้ป่วยใหม่
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </CardContent>
    </Card>
  );
}