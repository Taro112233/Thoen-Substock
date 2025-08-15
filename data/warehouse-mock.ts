// data/warehouse-mock.ts
import { PendingRequisition, Transaction, PendingReceiving } from '../types/warehouse';

export const mockPendingRequisitions: PendingRequisition[] = [
  {
    id: "req-001",
    requisitionNumber: "REQ-2025-0001",
    fromDepartment: {
      id: "dept-001",
      name: "แผนกอายุรกรรม",
      code: "INT"
    },
    requestDate: "2025-08-14T09:30:00.000Z",
    priority: "NORMAL",
    status: "SUBMITTED",
    totalItems: 3,
    totalEstimatedValue: 2850,
    requester: {
      firstName: "สมหญิง",
      lastName: "ใจดี",
      role: "STAFF_NURSE"
    },
    items: [
      {
        id: "item-001",
        drug: {
          hospitalDrugCode: "PAR001",
          name: "Paracetamol 500mg",
          strength: "500mg",
          unit: "เม็ด"
        },
        requestedQuantity: 100,
        availableStock: 1250,
        estimatedCost: 500,
        notes: "สำหรับผู้ป่วยไข้หวัดใหญ่"
      },
      {
        id: "item-002",
        drug: {
          hospitalDrugCode: "AMX001",
          name: "Amoxicillin 250mg",
          strength: "250mg",
          unit: "แคปซูล"
        },
        requestedQuantity: 50,
        availableStock: 800,
        estimatedCost: 1250,
        notes: null
      },
      {
        id: "item-003",
        drug: {
          hospitalDrugCode: "IBU001",
          name: "Ibuprofen 400mg",
          strength: "400mg",
          unit: "เม็ด"
        },
        requestedQuantity: 60,
        availableStock: 450,
        estimatedCost: 1100,
        notes: "สำหรับผู้ป่วยปวดข้อ"
      }
    ]
  },
  {
    id: "req-002",
    requisitionNumber: "REQ-2025-0002",
    fromDepartment: {
      id: "dept-002",
      name: "แผนกฉุกเฉิน",
      code: "ER"
    },
    requestDate: "2025-08-15T14:15:00.000Z",
    priority: "URGENT",
    status: "UNDER_REVIEW",
    totalItems: 2,
    totalEstimatedValue: 4200,
    requester: {
      firstName: "วิชัย",
      lastName: "รักษาชีพ",
      role: "STAFF_PHARMACIST"
    },
    items: [
      {
        id: "item-004",
        drug: {
          hospitalDrugCode: "ADR001",
          name: "Adrenaline 1mg/ml",
          strength: "1mg/ml",
          unit: "แอมพูล"
        },
        requestedQuantity: 10,
        availableStock: 45,
        estimatedCost: 2500,
        notes: "สำหรับการช่วยชีวิตฉุกเฉิน"
      },
      {
        id: "item-005",
        drug: {
          hospitalDrugCode: "MOR001",
          name: "Morphine 10mg/ml",
          strength: "10mg/ml",
          unit: "แอมพูล"
        },
        requestedQuantity: 5,
        availableStock: 25,
        estimatedCost: 1700,
        notes: "ยาควบคุม - ต้องมีลายเซ็นแพทย์"
      }
    ]
  }
];

export const mockRecentTransactions: Transaction[] = [
  {
    id: "tx-001",
    transactionType: "RECEIVE",
    quantity: 500,
    unitCost: 5.50,
    totalCost: 2750,
    createdAt: "2025-08-15T08:30:00.000Z",
    drug: {
      name: "Paracetamol 500mg",
      hospitalDrugCode: "PAR001"
    },
    performer: {
      firstName: "สุรีย์",
      lastName: "เภสัชกรรม",
      role: "PHARMACY_MANAGER"
    },
    reference: "PO-2025-0156",
    description: "รับยาจากผู้จัดจำหน่าย ABC Pharma"
  },
  {
    id: "tx-002",
    transactionType: "DISPENSE",
    quantity: -120,
    unitCost: 15.75,
    totalCost: -1890,
    createdAt: "2025-08-15T10:45:00.000Z",
    drug: {
      name: "Amoxicillin 250mg",
      hospitalDrugCode: "AMX001"
    },
    performer: {
      firstName: "วารี",
      lastName: "จ่ายยา",
      role: "STAFF_PHARMACIST"
    },
    reference: "REQ-2025-0145",
    description: "จ่ายให้แผนกศัลยกรรม"
  },
  {
    id: "tx-003",
    transactionType: "TRANSFER_IN",
    quantity: 200,
    unitCost: 12.25,
    totalCost: 2450,
    createdAt: "2025-08-15T13:20:00.000Z",
    drug: {
      name: "Ibuprofen 400mg",
      hospitalDrugCode: "IBU001"
    },
    performer: {
      firstName: "มานพ",
      lastName: "คลังยา",
      role: "PHARMACY_TECHNICIAN"
    },
    reference: "TRF-2025-0089",
    description: "โอนจากคลังกลางอาคาร B"
  }
];

export const mockPendingReceivings: PendingReceiving[] = [
  {
    id: "recv-001",
    purchaseOrderNumber: "PO-2025-0156",
    supplierName: "บริษัท ABC ฟาร์มา จำกัด",
    expectedDate: "2025-08-16T09:00:00.000Z",
    status: "CONFIRMED",
    priority: "NORMAL",
    totalItems: 4,
    totalEstimatedValue: 15750,
    deliveryNote: "DN-ABC-2025-0089",
    items: [
      {
        id: "recv-item-001",
        drug: {
          hospitalDrugCode: "PAR001",
          name: "Paracetamol 500mg",
          strength: "500mg",
          unit: "เม็ด"
        },
        orderedQuantity: 1000,
        receivedQuantity: 0,
        remainingQuantity: 1000,
        unitPrice: 5.50,
        totalPrice: 5500,
        batchNumber: "ABC2025001",
        expiryDate: "2027-08-15",
        manufacturer: "ABC Pharmaceutical",
        notes: "ยาที่สั่งประจำเดือน"
      },
      {
        id: "recv-item-002",
        drug: {
          hospitalDrugCode: "AMX001",
          name: "Amoxicillin 250mg",
          strength: "250mg",
          unit: "แคปซูล"
        },
        orderedQuantity: 500,
        receivedQuantity: 0,
        remainingQuantity: 500,
        unitPrice: 15.75,
        totalPrice: 7875,
        batchNumber: "ABC2025002",
        expiryDate: "2026-12-20",
        manufacturer: "ABC Pharmaceutical",
        notes: null
      },
      {
        id: "recv-item-003",
        drug: {
          hospitalDrugCode: "IBU001",
          name: "Ibuprofen 400mg",
          strength: "400mg",
          unit: "เม็ด"
        },
        orderedQuantity: 200,
        receivedQuantity: 0,
        remainingQuantity: 200,
        unitPrice: 12.25,
        totalPrice: 2450,
        batchNumber: "ABC2025003",
        expiryDate: "2027-03-10",
        manufacturer: "ABC Pharmaceutical",
        notes: "ยาแก้ปวดหลัก"
      },
      {
        id: "recv-item-004",
        drug: {
          hospitalDrugCode: "ASP001",
          name: "Aspirin 100mg",
          strength: "100mg",
          unit: "เม็ด"
        },
        orderedQuantity: 2000,
        receivedQuantity: 1500,
        remainingQuantity: 500,
        unitPrice: 0.95,
        totalPrice: 475,
        batchNumber: "ABC2025004",
        expiryDate: "2028-01-15",
        manufacturer: "ABC Pharmaceutical",
        notes: "รับมาแล้วบางส่วน"
      }
    ]
  },
  {
    id: "recv-002",
    purchaseOrderNumber: "PO-2025-0157",
    supplierName: "บริษัท XYZ เมดิคัล จำกัด",
    expectedDate: "2025-08-17T14:30:00.000Z",
    status: "IN_TRANSIT",
    priority: "URGENT",
    totalItems: 2,
    totalEstimatedValue: 8950,
    deliveryNote: null,
    items: [
      {
        id: "recv-item-005",
        drug: {
          hospitalDrugCode: "ADR001",
          name: "Adrenaline 1mg/ml",
          strength: "1mg/ml",
          unit: "แอมพูล"
        },
        orderedQuantity: 20,
        receivedQuantity: 0,
        remainingQuantity: 20,
        unitPrice: 225.00,
        totalPrice: 4500,
        batchNumber: null,
        expiryDate: null,
        manufacturer: "XYZ Medical Co.",
        notes: "ยาฉุกเฉิน - ต้องเก็บในตู้เย็น"
      },
      {
        id: "recv-item-006",
        drug: {
          hospitalDrugCode: "INS001",
          name: "Insulin Human 100 IU/ml",
          strength: "100 IU/ml",
          unit: "แอมพูล"
        },
        orderedQuantity: 10,
        receivedQuantity: 0,
        remainingQuantity: 10,
        unitPrice: 445.00,
        totalPrice: 4450,
        batchNumber: null,
        expiryDate: null,
        manufacturer: "XYZ Medical Co.",
        notes: "เก็บที่อุณหภูมิ 2-8°C"
      }
    ]
  },
  {
    id: "recv-003",
    purchaseOrderNumber: "PO-2025-0158",
    supplierName: "บริษัท เดลต้า ฟาร์มาซิวติคอล จำกัด",
    expectedDate: "2025-08-18T10:15:00.000Z",
    status: "PARTIALLY_RECEIVED",
    priority: "HIGH",
    totalItems: 5,
    totalEstimatedValue: 22350,
    deliveryNote: "DN-DELTA-2025-0125",
    items: [
      {
        id: "recv-item-007",
        drug: {
          hospitalDrugCode: "OME001",
          name: "Omeprazole 20mg",
          strength: "20mg",
          unit: "แคปซูล"
        },
        orderedQuantity: 800,
        receivedQuantity: 500,
        remainingQuantity: 300,
        unitPrice: 8.75,
        totalPrice: 2625,
        batchNumber: "DLT2025001",
        expiryDate: "2026-10-30",
        manufacturer: "Delta Pharmaceutical",
        notes: "รับมาแล้ว 500 แคปซูล"
      },
      {
        id: "recv-item-008",
        drug: {
          hospitalDrugCode: "MET001",
          name: "Metformin 500mg",
          strength: "500mg",
          unit: "เม็ด"
        },
        orderedQuantity: 1500,
        receivedQuantity: 1500,
        remainingQuantity: 0,
        unitPrice: 2.50,
        totalPrice: 0,
        batchNumber: "DLT2025002",
        expiryDate: "2027-05-20",
        manufacturer: "Delta Pharmaceutical",
        notes: "รับครบแล้ว"
      },
      {
        id: "recv-item-009",
        drug: {
          hospitalDrugCode: "AML001",
          name: "Amlodipine 5mg",
          strength: "5mg",
          unit: "เม็ด"
        },
        orderedQuantity: 600,
        receivedQuantity: 0,
        remainingQuantity: 600,
        unitPrice: 4.25,
        totalPrice: 2550,
        batchNumber: "DLT2025003",
        expiryDate: "2027-12-15",
        manufacturer: "Delta Pharmaceutical",
        notes: "ยังไม่ได้รับ"
      },
      {
        id: "recv-item-010",
        drug: {
          hospitalDrugCode: "ATO001",
          name: "Atorvastatin 20mg",
          strength: "20mg",
          unit: "เม็ด"
        },
        orderedQuantity: 400,
        receivedQuantity: 200,
        remainingQuantity: 200,
        unitPrice: 12.50,
        totalPrice: 2500,
        batchNumber: "DLT2025004",
        expiryDate: "2026-08-25",
        manufacturer: "Delta Pharmaceutical",
        notes: "รับมาแล้วครึ่งหนึ่ง"
      },
      {
        id: "recv-item-011",
        drug: {
          hospitalDrugCode: "LOS001",
          name: "Losartan 50mg",
          strength: "50mg",
          unit: "เม็ด"
        },
        orderedQuantity: 1000,
        receivedQuantity: 750,
        remainingQuantity: 250,
        unitPrice: 6.50,
        totalPrice: 1625,
        batchNumber: "DLT2025005",
        expiryDate: "2027-02-10",
        manufacturer: "Delta Pharmaceutical",
        notes: "รับมาแล้ว 750 เม็ด"
      }
    ]
  },
  {
    id: "recv-004",
    purchaseOrderNumber: "PO-2025-0159",
    supplierName: "บริษัท ไทยฟาร์มา อินดัสทรี่ จำกัด",
    expectedDate: "2025-08-19T08:45:00.000Z",
    status: "DELAYED",
    priority: "NORMAL",
    totalItems: 3,
    totalEstimatedValue: 18900,
    deliveryNote: "DN-THAI-2025-0067",
    items: [
      {
        id: "recv-item-012",
        drug: {
          hospitalDrugCode: "CIP001",
          name: "Ciprofloxacin 500mg",
          strength: "500mg",
          unit: "เม็ด"
        },
        orderedQuantity: 300,
        receivedQuantity: 0,
        remainingQuantity: 300,
        unitPrice: 18.50,
        totalPrice: 5550,
        batchNumber: "TPI2025001",
        expiryDate: "2026-11-12",
        manufacturer: "Thai Pharma Industry",
        notes: "ล่าช้าเนื่องจากปัญหาการผลิต"
      },
      {
        id: "recv-item-013",
        drug: {
          hospitalDrugCode: "CEF001",
          name: "Ceftriaxone 1g",
          strength: "1g",
          unit: "ไวอัล"
        },
        orderedQuantity: 100,
        receivedQuantity: 0,
        remainingQuantity: 100,
        unitPrice: 85.00,
        totalPrice: 8500,
        batchNumber: "TPI2025002",
        expiryDate: "2026-09-08",
        manufacturer: "Thai Pharma Industry",
        notes: "รอการอนุมัติจาก FDA"
      },
      {
        id: "recv-item-014",
        drug: {
          hospitalDrugCode: "FLU001",
          name: "Fluconazole 150mg",
          strength: "150mg",
          unit: "แคปซูล"
        },
        orderedQuantity: 200,
        receivedQuantity: 0,
        remainingQuantity: 200,
        unitPrice: 23.75,
        totalPrice: 4750,
        batchNumber: "TPI2025003",
        expiryDate: "2027-04-18",
        manufacturer: "Thai Pharma Industry",
        notes: "คาดว่าจะได้รับในสัปดาห์หน้า"
      }
    ]
  },
  {
    id: "recv-005",
    purchaseOrderNumber: "PO-2025-0160",
    supplierName: "บริษัท ยูนิเวอร์แซล เมดิซีน จำกัด",
    expectedDate: "2025-08-20T13:20:00.000Z",
    status: "RECEIVED",
    priority: "LOW",
    totalItems: 6,
    totalEstimatedValue: 12450,
    deliveryNote: "DN-UNI-2025-0198",
    items: [
      {
        id: "recv-item-015",
        drug: {
          hospitalDrugCode: "VIT001",
          name: "Vitamin B Complex",
          strength: null,
          unit: "เม็ด"
        },
        orderedQuantity: 1000,
        receivedQuantity: 1000,
        remainingQuantity: 0,
        unitPrice: 1.50,
        totalPrice: 0,
        batchNumber: "UNI2025001",
        expiryDate: "2027-06-30",
        manufacturer: "Universal Medicine",
        notes: "รับครบแล้ว"
      },
      {
        id: "recv-item-016",
        drug: {
          hospitalDrugCode: "CAL001",
          name: "Calcium Carbonate 500mg",
          strength: "500mg",
          unit: "เม็ด"
        },
        orderedQuantity: 800,
        receivedQuantity: 800,
        remainingQuantity: 0,
        unitPrice: 2.25,
        totalPrice: 0,
        batchNumber: "UNI2025002",
        expiryDate: "2028-01-25",
        manufacturer: "Universal Medicine",
        notes: "รับครบแล้ว"
      },
      {
        id: "recv-item-017",
        drug: {
          hospitalDrugCode: "ZIN001",
          name: "Zinc Sulfate 20mg",
          strength: "20mg",
          unit: "เม็ด"
        },
        orderedQuantity: 500,
        receivedQuantity: 500,
        remainingQuantity: 0,
        unitPrice: 3.80,
        totalPrice: 0,
        batchNumber: "UNI2025003",
        expiryDate: "2027-11-10",
        manufacturer: "Universal Medicine",
        notes: "รับครบแล้ว"
      },
      {
        id: "recv-item-018",
        drug: {
          hospitalDrugCode: "FER001",
          name: "Ferrous Sulfate 200mg",
          strength: "200mg",
          unit: "เม็ด"
        },
        orderedQuantity: 600,
        receivedQuantity: 600,
        remainingQuantity: 0,
        unitPrice: 1.95,
        totalPrice: 0,
        batchNumber: "UNI2025004",
        expiryDate: "2026-12-05",
        manufacturer: "Universal Medicine",
        notes: "รับครบแล้ว"
      },
      {
        id: "recv-item-019",
        drug: {
          hospitalDrugCode: "FOL001",
          name: "Folic Acid 5mg",
          strength: "5mg",
          unit: "เม็ด"
        },
        orderedQuantity: 300,
        receivedQuantity: 300,
        remainingQuantity: 0,
        unitPrice: 2.50,
        totalPrice: 0,
        batchNumber: "UNI2025005",
        expiryDate: "2027-09-15",
        manufacturer: "Universal Medicine",
        notes: "รับครบแล้ว"
      },
      {
        id: "recv-item-020",
        drug: {
          hospitalDrugCode: "MAG001",
          name: "Magnesium Oxide 400mg",
          strength: "400mg",
          unit: "เม็ด"
        },
        orderedQuantity: 400,
        receivedQuantity: 400,
        remainingQuantity: 0,
        unitPrice: 3.25,
        totalPrice: 0,
        batchNumber: "UNI2025006",
        expiryDate: "2028-03-20",
        manufacturer: "Universal Medicine",
        notes: "รับครบแล้ว"
      }
    ]
  }
];