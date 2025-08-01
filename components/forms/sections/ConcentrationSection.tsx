// components/forms/sections/ConcentrationSection.tsx

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Pill } from 'lucide-react';

import { usePatientForm } from '@/components/forms/PatientInputForm';

const stepVariants = {
  hidden: { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -50 }
};

export function ConcentrationSection() {
  const { 
    selectedDrug, 
    selectedConcentration, 
    setSelectedConcentration, 
    setCurrentStep 
  } = usePatientForm();
  
  const [customConcentration, setCustomConcentration] = useState({ mg: '', ml: '' });

  if (!selectedDrug) return null;

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Pill className="w-5 h-5" />
          ขนาดยา
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
            <Label>ขนาดยาที่มี</Label>
            <div className="mt-2 space-y-2">
              {selectedDrug.availableConcentrations.map((conc: any, index: number) => (
                <motion.div 
                  key={index}
                  className={`p-3 border rounded-lg cursor-pointer transition-all
                    ${selectedConcentration === conc 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'}
                  `}
                  onClick={() => setSelectedConcentration(conc)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="font-medium">{conc.label}</div>
                  <div className="text-sm text-gray-500">
                    {conc.mg} mg ใน {conc.ml} mL
                  </div>
                </motion.div>
              ))}
              
              {/* Custom concentration */}
              <motion.div 
                className="p-3 border border-dashed border-gray-300 rounded-lg"
                whileHover={{ scale: 1.01 }}
              >
                <div className="font-medium mb-2">ขนาดยาอื่นๆ</div>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="mg"
                    value={customConcentration.mg}
                    onChange={(e) => setCustomConcentration({
                      ...customConcentration, 
                      mg: e.target.value
                    })}
                  />
                  <Input
                    placeholder="mL"
                    value={customConcentration.ml}
                    onChange={(e) => setCustomConcentration({
                      ...customConcentration, 
                      ml: e.target.value
                    })}
                  />
                </div>
                {customConcentration.mg && customConcentration.ml && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => {
                      const customConc = {
                        mg: parseFloat(customConcentration.mg),
                        ml: parseFloat(customConcentration.ml),
                        label: `${customConcentration.mg}mg/${customConcentration.ml}mL`
                      };
                      setSelectedConcentration(customConc);
                    }}
                  >
                    ใช้ขนาดนี้
                  </Button>
                )}
              </motion.div>
            </div>
          </div>
          
          <div className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={() => setCurrentStep(2)}
            >
              ย้อนกลับ
            </Button>
            <Button 
              onClick={() => setCurrentStep(4)}
              disabled={!selectedConcentration}
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