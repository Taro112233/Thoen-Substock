// components/forms/sections/FrequencySection.tsx

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Calculator } from 'lucide-react';

import { usePatientForm } from '@/components/forms/PatientInputForm';
import { type FrequencyKey } from '@/lib/constants/drugs';

const stepVariants = {
  hidden: { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -50 }
};

export function FrequencySection() {
  const { 
    selectedDrug,
    selectedFrequency, 
    setSelectedFrequency, 
    setCurrentStep 
  } = usePatientForm();
  
  const [availableFrequencies, setAvailableFrequencies] = useState<FrequencyKey[]>([]);

  // Load drug details when selected
  useEffect(() => {
    const loadDrugDetails = async () => {
      if (!selectedDrug) return;

      try {
        const response = await fetch(`/api/drugs/${selectedDrug.id}`);
        const data = await response.json();
        
        if (data.success) {
          const drugData = data.data;
          
          // Extract available frequencies from dosing rules
          const frequencies = new Set<FrequencyKey>();
          drugData.dosingRules.forEach((rule: any) => {
            rule.frequencies.forEach((freq: FrequencyKey) => frequencies.add(freq));
          });
          
          setAvailableFrequencies(Array.from(frequencies));
        }
      } catch (error) {
        console.error('Failed to load drug details:', error);
      }
    };

    loadDrugDetails();
  }, [selectedDrug]);

  const frequencyLabels: Record<FrequencyKey, string> = {
    'OD': 'วันละ 1 ครั้ง',
    'BID': 'วันละ 2 ครั้ง',
    'TID': 'วันละ 3 ครั้ง',
    'QID': 'วันละ 4 ครั้ง',
    'q4-6h': 'ทุก 4-6 ชั่วโมง',
    'q6-8h': 'ทุก 6-8 ชั่วโมง',
    'q8h': 'ทุก 8 ชั่วโมง',
    'q12h': 'ทุก 12 ชั่วโมง',
    'PRN': 'เมื่อจำเป็น'
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="w-5 h-5" />
          ความถี่การให้ยา
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
          <div>
            <Label>เลือกความถี่การให้ยา</Label>
            <div className="mt-2 grid gap-2">
              {availableFrequencies.map((freq) => (
                <motion.div 
                  key={freq}
                  className={`p-3 border rounded-lg cursor-pointer transition-all
                    ${selectedFrequency === freq 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'}
                  `}
                  onClick={() => setSelectedFrequency(freq)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="font-medium">{frequencyLabels[freq]}</div>
                  <div className="text-sm text-gray-500">{freq}</div>
                </motion.div>
              ))}
            </div>
          </div>
          
          <div className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={() => setCurrentStep(3)}
            >
              ย้อนกลับ
            </Button>
            <Button 
              onClick={() => setCurrentStep(5)}
              disabled={!selectedFrequency}
              className="px-8"
            >
              ถัดไป
            </Button>
          </div>
        </motion.div>
      </CardContent>
    </Card>
  );
}