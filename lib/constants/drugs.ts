// lib/constants/drugs.ts
// Drug database constants based on provided Excel data

export const FREQUENCY_LABELS = {
    'OD': 'วันละ 1 ครั้ง',
    'BID': 'วันละ 2 ครั้ง', 
    'TID': 'วันละ 3 ครั้ง',
    'QID': 'วันละ 4 ครั้ง',
    'q4-6h': 'ทุก 4-6 ชั่วโมง',
    'q6-8h': 'ทุก 6-8 ชั่วโมง',
    'q8h': 'ทุก 8 ชั่วโมง',
    'q12h': 'ทุก 12 ชั่วโมง',
    'PRN': 'เมื่อจำเป็น'
  } as const;
  
  export const FREQUENCY_TIMES_PER_DAY = {
    'OD': 1,
    'BID': 2, 
    'TID': 3,
    'QID': 4,
    'q4-6h': 4, // ใช้ 4 เป็นค่ากลาง
    'q6-8h': 3, // ใช้ 3 เป็นค่ากลาง
    'q8h': 3,
    'q12h': 2,
    'PRN': 1 // ใช้ 1 เป็นค่าเริ่มต้น
  } as const;
  
  export const DRUG_CATEGORIES = {
    ANALGESIC_ANTIPYRETIC: 'ยาแก้ปวดลดไข้',
    COUGH_EXPECTORANT: 'ยาแก้ไอขับเสมหะ',
    ANTIHISTAMINE: 'ยาแก้แพ้แก้คันลดน้ำมูก',
    ANTIBIOTIC: 'ยาปฏิชีวนะ',
    GASTROINTESTINAL: 'ยาระบบทางเดิน',
    RESPIRATORY: 'ยาระบบทางเดินหายใจ'
  } as const;
  
  // Drug database from Excel table
  export const DRUG_DATABASE = [
    // ยาแก้ปวดลดไข้
    {
      id: 'paracetamol',
      genericName: 'Paracetamol',
      brandNames: ['Tylenol', 'Panadol', 'Crocin'],
      category: DRUG_CATEGORIES.ANALGESIC_ANTIPYRETIC,
      dosingRules: [
        {
          id: 'paracetamol_weight',
          type: 'weight_based' as const,
          minDose: 10,
          maxDose: 15,
          unit: 'mg/kg/dose' as const,
          frequencies: ['q4-6h'],
          ageMinYears: 0,
          ageMaxYears: 100,
          concentrations: [
            { mg: 250, ml: 5, label: '250mg/5mL' },
            { mg: 160, ml: 5, label: '160mg/5mL' },
            { mg: 120, ml: 5, label: '120mg/5mL' }
          ]
        }
      ]
    },
    {
      id: 'ibuprofen',
      genericName: 'Ibuprofen',
      brandNames: ['Brufen', 'Advil', 'Nurofen'],
      category: DRUG_CATEGORIES.ANALGESIC_ANTIPYRETIC,
      dosingRules: [
        {
          id: 'ibuprofen_weight',
          type: 'weight_based' as const,
          minDose: 5,
          maxDose: 10,
          unit: 'mg/kg/dose' as const,
          frequencies: ['q6-8h'],
          ageMinYears: 0.5, // มากกว่า 6 เดือน
          ageMaxYears: 100,
          concentrations: [
            { mg: 100, ml: 5, label: '100mg/5mL' },
            { mg: 200, ml: 5, label: '200mg/5mL' }
          ]
        }
      ]
    },
  
    // ยาแก้ไอขับเสมหะ
    {
      id: 'bromhexine',
      genericName: 'Bromhexine',
      brandNames: ['Bisolvon', 'Mucosolvan'],
      category: DRUG_CATEGORIES.COUGH_EXPECTORANT,
      dosingRules: [
        {
          id: 'bromhexine_weight',
          type: 'weight_based' as const,
          minDose: 0.6,
          maxDose: 0.8,
          unit: 'mg/kg/day' as const,
          frequencies: ['TID'],
          ageMinYears: 0,
          ageMaxYears: 100,
          concentrations: [{ mg: 4, ml: 5, label: '4mg/5mL' }]
        },
        {
          id: 'bromhexine_under2',
          type: 'age_based' as const,
          dose: 1,
          unit: 'mg/dose' as const,
          frequencies: ['TID'],
          ageMinYears: 0,
          ageMaxYears: 1.999,
          ageDisplay: '<2 ปี',
          priority: 1, // higher priority than weight-based
          concentrations: [{ mg: 4, ml: 5, label: '4mg/5mL' }]
        },
        {
          id: 'bromhexine_2to5',
          type: 'age_based' as const,
          dose: 2,
          unit: 'mg/dose' as const,
          frequencies: ['TID'],
          ageMinYears: 2,
          ageMaxYears: 5.999,
          ageDisplay: '2-5 ปี',
          priority: 1,
          concentrations: [{ mg: 4, ml: 5, label: '4mg/5mL' }]
        },
        {
          id: 'bromhexine_6to10',
          type: 'age_based' as const,
          dose: 4,
          unit: 'mg/dose' as const,
          frequencies: ['TID'],
          ageMinYears: 6,
          ageMaxYears: 10.999,
          ageDisplay: '6-10 ปี',
          priority: 1,
          concentrations: [{ mg: 4, ml: 5, label: '4mg/5mL' }]
        },
        {
          id: 'bromhexine_over10',
          type: 'age_based' as const,
          dose: 8,
          unit: 'mg/dose' as const,
          frequencies: ['TID'],
          ageMinYears: 11,
          ageMaxYears: 100,
          ageDisplay: '>10 ปี',
          priority: 1,
          concentrations: [{ mg: 4, ml: 5, label: '4mg/5mL' }]
        }
      ]
    },
    {
      id: 'ambroxol',
      genericName: 'Ambroxol',
      brandNames: ['Mucosolvan', 'Ambril'],
      category: DRUG_CATEGORIES.COUGH_EXPECTORANT,
      dosingRules: [
        {
          id: 'ambroxol_weight',
          type: 'weight_based' as const,
          minDose: 1.2,
          maxDose: 1.6,
          unit: 'mg/kg/day' as const,
          frequencies: ['TID'],
          ageMinYears: 0,
          ageMaxYears: 100,
          concentrations: [{ mg: 4, ml: 5, label: '4mg/5mL' }]
        },
        {
          id: 'ambroxol_under2',
          type: 'age_based' as const,
          minDose: 10,
          maxDose: 15,
          unit: 'mg/dose' as const,
          frequencies: ['BID'],
          ageMinYears: 0,
          ageMaxYears: 1.999,
          ageDisplay: '<2 ปี',
          priority: 1,
          concentrations: [{ mg: 4, ml: 5, label: '4mg/5mL' }]
        },
        {
          id: 'ambroxol_2to6',
          type: 'age_based' as const,
          dose: 15,
          unit: 'mg/dose' as const,
          frequencies: ['TID'],
          ageMinYears: 2,
          ageMaxYears: 5.999,
          ageDisplay: '2-6 ปี',
          priority: 1,
          concentrations: [{ mg: 4, ml: 5, label: '4mg/5mL' }]
        },
        {
          id: 'ambroxol_6to12',
          type: 'age_based' as const,
          dose: 30,
          unit: 'mg/dose' as const,
          frequencies: ['TID'],
          ageMinYears: 6,
          ageMaxYears: 11.999,
          ageDisplay: '6-12 ปี',
          priority: 1,
          concentrations: [{ mg: 4, ml: 5, label: '4mg/5mL' }]
        },
        {
          id: 'ambroxol_over12',
          type: 'age_based' as const,
          dose: 30,
          unit: 'mg/dose' as const,
          frequencies: ['BID', 'TID'],
          ageMinYears: 12,
          ageMaxYears: 100,
          ageDisplay: '>12 ปี',
          priority: 1,
          concentrations: [{ mg: 4, ml: 5, label: '4mg/5mL' }]
        }
      ]
    },
  
    // ยาแก้แพ้แก้คันลดน้ำมูก
    {
      id: 'cetirizine',
      genericName: 'Cetirizine',
      brandNames: ['Zyrtec', 'Alerid'],
      category: DRUG_CATEGORIES.ANTIHISTAMINE,
      dosingRules: [
        {
          id: 'cetirizine_0.5to2',
          type: 'age_based' as const,
          dose: 2.5,
          unit: 'mg/day' as const,
          frequencies: ['OD'],
          ageMinYears: 0.5,
          ageMaxYears: 1.999,
          ageDisplay: '0.5-2 ปี',
          concentrations: [{ mg: 5, ml: 5, label: '5mg/5mL' }]
        },
        {
          id: 'cetirizine_1to2', // overlap case
          type: 'age_based' as const,
          minDose: 2.5,
          maxDose: 5,
          unit: 'mg/day' as const,
          frequencies: ['OD'],
          ageMinYears: 1,
          ageMaxYears: 1.999,
          ageDisplay: '1-2 ปี',
          priority: 2, // lower priority, will use 0.5-2 rule instead
          concentrations: [{ mg: 5, ml: 5, label: '5mg/5mL' }]
        },
        {
          id: 'cetirizine_2to6',
          type: 'age_based' as const,
          minDose: 2.5,
          maxDose: 5,
          unit: 'mg/day' as const,
          frequencies: ['OD', 'BID'],
          ageMinYears: 2,
          ageMaxYears: 5.999,
          ageDisplay: '2-6 ปี',
          concentrations: [{ mg: 5, ml: 5, label: '5mg/5mL' }]
        },
        {
          id: 'cetirizine_over6',
          type: 'age_based' as const,
          minDose: 5,
          maxDose: 10,
          unit: 'mg/day' as const,
          frequencies: ['OD'],
          ageMinYears: 6,
          ageMaxYears: 100,
          ageDisplay: '>6 ปี',
          concentrations: [{ mg: 5, ml: 5, label: '5mg/5mL' }]
        }
      ]
    },
    {
      id: 'loratadine',
      genericName: 'Loratadine',
      brandNames: ['Claritin', 'Allergex'],
      category: DRUG_CATEGORIES.ANTIHISTAMINE,
      dosingRules: [
        {
          id: 'loratadine_2to5',
          type: 'age_based' as const,
          dose: 5,
          unit: 'mg/day' as const,
          frequencies: ['OD'],
          ageMinYears: 2,
          ageMaxYears: 5.999,
          ageDisplay: '2-5 ปี',
          concentrations: [
            { mg: 5, ml: 5, label: '5mg/5mL' },
            { mg: 10, ml: 10, label: '10mg/10mL' }
          ]
        },
        {
          id: 'loratadine_over6',
          type: 'age_based' as const,
          dose: 10,
          unit: 'mg/day' as const,
          frequencies: ['OD'],
          ageMinYears: 6,
          ageMaxYears: 100,
          ageDisplay: '≥6 ปี',
          concentrations: [
            { mg: 5, ml: 5, label: '5mg/5mL' },
            { mg: 10, ml: 10, label: '10mg/10mL' }
          ]
        }
      ]
    }
  ] as const;
  
  // Types derived from the constants
  export type FrequencyKey = keyof typeof FREQUENCY_LABELS;
  export type DrugCategory = typeof DRUG_CATEGORIES[keyof typeof DRUG_CATEGORIES];
  
  export interface DrugConcentration {
    mg: number;
    ml: number;
    label: string;
  }
  
  export interface DosingRule {
    id: string;
    type: 'weight_based' | 'age_based';
    minDose?: number;
    maxDose?: number;
    dose?: number; // for fixed dose age-based rules
    unit: 'mg/kg/dose' | 'mg/kg/day' | 'mg/dose' | 'mg/day';
    frequencies: FrequencyKey[];
    ageMinYears: number;
    ageMaxYears: number;
    ageDisplay?: string; // for age-based rules
    priority?: number; // higher number = higher priority
    concentrations: DrugConcentration[];
  }
  
  export interface Drug {
    id: string;
    genericName: string;
    brandNames: string[];
    category: DrugCategory;
    dosingRules: DosingRule[];
  }
  
  // Helper functions
  export const getDrugsByCategory = (category: DrugCategory) => 
    DRUG_DATABASE.filter(drug => drug.category === category);
  
  export const getDrugById = (id: string) => 
    DRUG_DATABASE.find(drug => drug.id === id);
  
  export const getAllCategories = () => 
    Object.values(DRUG_CATEGORIES);
  
  export const getFrequencyLabel = (frequency: FrequencyKey) => 
    FREQUENCY_LABELS[frequency];
  
  export const getTimesPerDay = (frequency: FrequencyKey) => 
    FREQUENCY_TIMES_PER_DAY[frequency];