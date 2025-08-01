// components/forms/sections/PatientFormHeader.tsx

import React from 'react';
import { motion } from 'framer-motion';

const itemVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0 }
};

export function PatientFormHeader() {
  return (
    <motion.div 
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      className="text-center mb-8"
    >
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        เครื่องคำนวณขนาดยาเด็ก
      </h1>
      <p className="text-gray-600">
        Pharmacy Assistant Toolkit - Pediatric Dose Calculator
      </p>
    </motion.div>
  );
}