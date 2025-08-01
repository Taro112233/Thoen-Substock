// components/forms/sections/PatientFormFooter.tsx

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

interface ApiDrug {
  id: string;
  genericName: string;
  brandNames: string[];
  category: string;
  availableConcentrations: any[];
  ageRanges: string[];
}

export function PatientFormFooter() {
  const [availableDrugs, setAvailableDrugs] = useState<ApiDrug[]>([]);
  const [loading, setLoading] = useState(false);

  // Load drugs for stats
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
  }, []);

  // Group drugs by category for stats
  const drugsByCategory = React.useMemo(() => {
    return availableDrugs.reduce((acc, drug) => {
      if (!acc[drug.category]) {
        acc[drug.category] = [];
      }
      acc[drug.category].push(drug);
      return acc;
    }, {} as Record<string, ApiDrug[]>);
  }, [availableDrugs]);

  if (loading || availableDrugs.length === 0) return null;

  return (
    <motion.div 
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      className="mt-8"
    >
      <Card className="bg-gray-50">
        <CardHeader>
          <CardTitle className="text-lg">
            ยาในระบบ ({availableDrugs.length} รายการ)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Category badges */}
            <div className="flex flex-wrap gap-2">
              {Object.entries(drugsByCategory).map(([category, drugs]) => (
                <Badge 
                  key={category} 
                  variant="secondary" 
                  className="text-xs"
                >
                  {category} ({drugs.length})
                </Badge>
              ))}
            </div>
            
            {/* Stats grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-500">
                  {availableDrugs.length}
                </div>
                <div className="text-sm text-gray-500">ยาทั้งหมด</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500">
                  {Object.keys(drugsByCategory).length}
                </div>
                <div className="text-sm text-gray-500">หมวดหมู่</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-500">
                  {availableDrugs.reduce((acc, drug) => acc + drug.ageRanges.length, 0)}
                </div>
                <div className="text-sm text-gray-500">ช่วงอายุ</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-500">
                  {availableDrugs.reduce((acc, drug) => acc + drug.availableConcentrations.length, 0)}
                </div>
                <div className="text-sm text-gray-500">ขนาดยา</div>
              </div>
            </div>
            
            {/* Reference note */}
            <div className="text-xs text-gray-500 mt-4 text-center">
              * อิงจากแนวทางปฏิบัติ TPPG และกรมการแพทย์
            </div>
            
            {/* Popular drugs preview */}
            <div className="pt-4 border-t">
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                ยาที่ใช้บ่อย
              </h4>
              <div className="flex flex-wrap gap-1">
                {availableDrugs.slice(0, 6).map((drug) => (
                  <Badge 
                    key={drug.id} 
                    variant="outline" 
                    className="text-xs"
                  >
                    {drug.genericName}
                  </Badge>
                ))}
                {availableDrugs.length > 6 && (
                  <Badge variant="outline" className="text-xs">
                    +{availableDrugs.length - 6} อื่นๆ
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}