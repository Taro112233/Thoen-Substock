// components/forms/sections/DrugSelectionSection.tsx

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Pill, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

import { usePatientForm } from '@/components/forms/PatientInputForm';
import { type DrugConcentration } from '@/lib/constants/drugs';

interface ApiDrug {
  id: string;
  genericName: string;
  brandNames: string[];
  category: string;
  availableConcentrations: DrugConcentration[];
  ageRanges: string[];
  dosingRules?: any[];
}

const stepVariants = {
  hidden: { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -50 }
};

export function DrugSelectionSection() {
  const { selectedDrug, setSelectedDrug, setCurrentStep, loading, setLoading } = usePatientForm();
  const [availableDrugs, setAvailableDrugs] = useState<ApiDrug[]>([]);

  // Load drugs on component mount
  useEffect(() => {
    const loadDrugs = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/drugs');
        const data = await response.json();
        
        if (data.success) {
          setAvailableDrugs(data.data.drugs);
        }
      } catch (error) {
        console.error('Failed to load drugs:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDrugs();
  }, [setLoading]);

  // Group drugs by category
  const drugsByCategory = React.useMemo(() => {
    return availableDrugs.reduce((acc, drug) => {
      if (!acc[drug.category]) {
        acc[drug.category] = [];
      }
      acc[drug.category].push(drug);
      return acc;
    }, {} as Record<string, ApiDrug[]>);
  }, [availableDrugs]);

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Pill className="w-5 h-5" />
          เลือกยา
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
          {loading ? (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
              <p>กำลังโหลดข้อมูลยา...</p>
            </div>
          ) : (
            <div>
              <Label>เลือกยา</Label>
              <div className="mt-2 space-y-4">
                {Object.entries(drugsByCategory).map(([category, drugs]) => (
                  <div key={category}>
                    <h3 className="font-medium text-gray-900 mb-2">{category}</h3>
                    <div className="grid gap-2">
                      {drugs.map((drug) => (
                        <motion.div 
                          key={drug.id}
                          className={`p-3 border rounded-lg cursor-pointer transition-all
                            ${selectedDrug?.id === drug.id 
                              ? 'border-blue-500 bg-blue-50' 
                              : 'border-gray-200 hover:border-gray-300'}
                          `}
                          onClick={() => setSelectedDrug(drug)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="font-medium">{drug.genericName}</div>
                          <div className="text-sm text-gray-500 mt-1">
                            {drug.brandNames.join(', ')}
                          </div>
                          {drug.ageRanges.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {drug.ageRanges.map((range) => (
                                <Badge key={range} variant="secondary" className="text-xs">
                                  {range}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={() => setCurrentStep(1)}
            >
              ย้อนกลับ
            </Button>
            <Button 
              onClick={() => setCurrentStep(3)}
              disabled={!selectedDrug}
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