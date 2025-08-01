// components/forms/sections/ReviewSection.tsx

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calculator, Loader2 } from 'lucide-react';

import { usePatientForm } from '@/components/forms/PatientInputForm';

const stepVariants = {
  hidden: { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -50 }
};

export function ReviewSection() {
  const { 
    form,
    selectedDrug,
    selectedConcentration,
    selectedFrequency,
    setCurrentStep,
    setCalculation,
    loading,
    setLoading
  } = usePatientForm();

  // Calculate dose
  const handleCalculate = async () => {
    if (!selectedDrug || !selectedConcentration || !selectedFrequency) {
      return;
    }

    try {
      setLoading(true);
      
      const formData = form.getValues();
      
      const requestBody = {
        patientData: {
          ageYears: Number(formData.ageYears),
          ageMonths: Number(formData.ageMonths) || 0,
          weight: formData.weight ? Number(formData.weight) : undefined,
          gender: formData.gender
        },
        drugId: selectedDrug.id,
        concentration: selectedConcentration,
        frequency: selectedFrequency
      };

      const response = await fetch('/api/calculations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      if (data.success) {
        setCalculation(data.data);
        setCurrentStep(6); // Show results
      } else {
        // Handle calculation error
        console.error('Calculation failed:', data.error);
        // TODO: Show error toast/alert
      }
    } catch (error) {
      console.error('Calculation request failed:', error);
      // TODO: Show error toast/alert
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="w-5 h-5" />
          ตรวจสอบข้อมูล
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
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-medium mb-4">ตรวจสอบข้อมูล</h3>
            <div className="space-y-2 text-sm">
              <div className="grid grid-cols-2 gap-4 text-left">
                <div>
                  <strong>อายุ:</strong> {form.watch('ageYears')} ปี {form.watch('ageMonths') && `${form.watch('ageMonths')} เดือน`}
                </div>
                <div>
                  <strong>น้ำหนัก:</strong> {form.watch('weight')} kg
                </div>
                <div>
                  <strong>ยา:</strong> {selectedDrug?.genericName}
                </div>
                <div>
                  <strong>ขนาดยา:</strong> {selectedConcentration?.label}
                </div>
                <div className="col-span-2">
                  <strong>ความถี่:</strong> {selectedFrequency}
                </div>
              </div>
            </div>
          </div>
          
          {/* Summary card */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-800 mb-2">สรุป</h4>
            <div className="text-sm text-blue-700 space-y-1">
              <div>• ผู้ป่วย: เด็ก {form.watch('ageYears')} ปี น้ำหนัก {form.watch('weight')} kg</div>
              <div>• ยาที่จะให้: {selectedDrug?.genericName} ({selectedConcentration?.label})</div>
              <div>• ความถี่: {selectedFrequency}</div>
              <div className="mt-2 font-medium">กดคำนวณเพื่อดูขนาดยาที่แนะนำ</div>
            </div>
          </div>
          
          <div className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={() => setCurrentStep(4)}
            >
              ย้อนกลับ
            </Button>
            <Button 
              onClick={handleCalculate}
              disabled={loading}
              className="px-8"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  กำลังคำนวณ...
                </>
              ) : (
                'คำนวณขนาดยา'
              )}
            </Button>
          </div>
        </motion.div>
      </CardContent>
    </Card>
  );
}