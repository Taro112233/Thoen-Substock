// components/forms/sections/PatientInfoSection.tsx

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, User, Weight, Calendar } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

import { usePatientForm } from '@/components/forms/PatientInputForm';
import { validateWeightForAge } from '@/lib/validations/patient';

const stepVariants = {
  hidden: { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -50 }
};

export function PatientInfoSection() {
  const { form, setCurrentStep } = usePatientForm();
  
  const watchedAge = form.watch('ageYears');
  const watchedWeight = form.watch('weight');
  const shouldShowMonths = watchedAge && Number(watchedAge) < 10;

  // Weight validation warnings
  const weightWarnings = React.useMemo(() => {
    if (!watchedAge || !watchedWeight) return [];
    
    const ageNum = Number(watchedAge);
    const weightNum = Number(watchedWeight);
    
    if (isNaN(ageNum) || isNaN(weightNum)) return [];
    
    const validation = validateWeightForAge(ageNum, weightNum);
    return validation.warning ? [validation.warning] : [];
  }, [watchedAge, watchedWeight]);

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5" />
          ข้อมูลผู้ป่วย
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <Form {...form}>
          <motion.div
            variants={stepVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-6"
          >
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="ageYears"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        อายุ (ปี) *
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="กรอกอายุเป็นปี"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <AnimatePresence>
                  {shouldShowMonths && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <FormField
                        control={form.control}
                        name="ageMonths"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>เดือนเพิ่มเติม</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="0"
                                min="0"
                                max="11"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="weight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Weight className="w-4 h-4" />
                        น้ำหนัก (kg) *
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="น้ำหนักเป็นกิโลกรัม"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>เพศ</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="เลือกเพศ" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="male">ชาย</SelectItem>
                          <SelectItem value="female">หญิง</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>  
            </div>
            
            {/* Weight Warnings */}
            {weightWarnings.length > 0 && (
              <Alert className="border-yellow-200 bg-yellow-50">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800">
                  {weightWarnings.map((warning, index) => (
                    <div key={index}>{warning}</div>
                  ))}
                </AlertDescription>
              </Alert>
            )}
            
            <div className="flex justify-end">
              <Button 
                onClick={() => setCurrentStep(2)}
                disabled={!form.watch('ageYears') || !form.watch('weight')}
                className="px-8"
              >
                ถัดไป
              </Button>
            </div>
          </motion.div>
        </Form>
      </CardContent>
    </Card>
  );
}