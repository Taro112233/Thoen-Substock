// lib/utils/package-pricing.ts
// Utilities สำหรับการคำนวณและจัดการราคาระดับ package

import { Decimal } from "@prisma/client/runtime/library";

// 📦 Package Pricing Types
export interface PackagePricing {
  packageSize: number;
  packageUnit: string;
  unitCost: number;        // ราคาต่อหน่วย
  packageCost: number;     // ราคาต่อแพ็ค
  totalUnits: number;      // จำนวนหน่วยทั้งหมด
  totalPackages: number;   // จำนวนแพ็คทั้งหมด
  totalValue: number;      // มูลค่ารวม
}

export interface StockCardWithPackaging {
  id: string;
  currentStock: number;
  packageSize: number;
  packageUnit?: string | null;
  averageCost: Decimal;
  packageCost: Decimal;
  lastCost: Decimal;
  lastPackageCost: Decimal;
  pricePerBox: Decimal;        // 🆕 ราคาต่อกล่อง
  totalValue: Decimal;
  monthlyUsage: number;
  monthlyPackageUsage: number;
  drug: {
    name: string;
    genericName?: string | null;
    dosageForm: string;
    strength?: string | null;
    unit?: string | null;
    packageSize?: number | null;
    packageUnit?: string | null;
  };
}

// 🔢 Package Calculation Functions
export class PackagePricingCalculator {
  
  /**
   * คำนวณราคาและจำนวนระดับ package
   */
  static calculatePackagePricing(
    currentStock: number,
    packageSize: number,
    unitCost: number
  ): PackagePricing {
    const packageCost = unitCost * packageSize;
    const totalUnits = currentStock * packageSize;
    const totalValue = currentStock * packageCost;
    
    return {
      packageSize,
      packageUnit: '',
      unitCost,
      packageCost,
      totalUnits,
      totalPackages: currentStock,
      totalValue
    };
  }
  
  /**
   * แปลงจำนวนหน่วยเป็นจำนวนแพ็ค
   */
  static unitsToPackages(units: number, packageSize: number): number {
    return Math.floor(units / packageSize);
  }
  
  /**
   * แปลงจำนวนแพ็คเป็นจำนวนหน่วย
   */
  static packagesToUnits(packages: number, packageSize: number): number {
    return packages * packageSize;
  }
  
  /**
   * คำนวณราคารวมจากจำนวนแพ็ค
   */
  static calculateTotalFromPackages(packages: number, packageCost: number): number {
    return packages * packageCost;
  }
  
  /**
   * คำนวณราคารวมจากจำนวนหน่วย
   */
  static calculateTotalFromUnits(units: number, unitCost: number): number {
    return units * unitCost;
  }
  
  /**
   * อัพเดทราคาเฉลี่ยแบบ weighted average
   */
  static updateWeightedAverageCost(
    currentStock: number,
    currentAvgCost: number,
    newStock: number,
    newCost: number
  ): number {
    const totalStock = currentStock + newStock;
    if (totalStock === 0) return 0;
    
    const currentValue = currentStock * currentAvgCost;
    const newValue = newStock * newCost;
    
    return (currentValue + newValue) / totalStock;
  }
}

// 🎨 Display Formatting Functions
export class PackageDisplayFormatter {
  
  /**
   * แสดงจำนวนในรูปแบบที่อ่านง่าย
   */
  static formatQuantity(
    packages: number,
    packageSize: number,
    packageUnit: string = 'units'
  ): string {
    const totalUnits = packages * packageSize;
    
    if (packages === 1) {
      return `1 package (${packageSize} ${packageUnit})`;
    }
    
    return `${packages.toLocaleString()} packages (${totalUnits.toLocaleString()} ${packageUnit})`;
  }
  
  /**
   * แสดงราคาในรูปแบบที่อ่านง่าย (รวม pricePerBox)
   */
  static formatPricing(
    packageCost: number,
    unitCost: number,
    packageSize: number,
    pricePerBox?: number,
    currency: string = '฿'
  ): string {
    const baseInfo = `${currency}${packageCost.toFixed(2)}/package (${currency}${unitCost.toFixed(2)}/unit × ${packageSize})`;
    
    if (pricePerBox && Math.abs(pricePerBox - packageCost) > 0.01) {
      return `${baseInfo} | Listed: ${currency}${pricePerBox.toFixed(2)}/box`;
    }
    
    return baseInfo;
  }
  
  /**
   * แสดงข้อมูลสต็อกแบบครบถ้วน (รวม pricePerBox)
   */
  static formatStockSummary(stockCard: StockCardWithPackaging): string {
    const { currentStock, packageSize, packageUnit, packageCost, averageCost, pricePerBox } = stockCard;
    const totalUnits = currentStock * packageSize;
    const totalValue = currentStock * Number(packageCost);
    
    return `
📦 Stock: ${currentStock.toLocaleString()} packages
🔢 Units: ${totalUnits.toLocaleString()} ${packageUnit || 'units'}
💰 Package Price: ฿${Number(packageCost).toFixed(2)}
💰 Unit Price: ฿${Number(averageCost).toFixed(2)}
💰 Listed Box Price: ฿${Number(pricePerBox).toFixed(2)}
💎 Total Value: ฿${totalValue.toLocaleString()}
    `.trim();
  }
  
  /**
   * แสดงข้อมูลการใช้งานรายเดือน
   */
  static formatUsageSummary(
    monthlyUsage: number,
    monthlyPackageUsage: number,
    packageUnit: string = 'units'
  ): string {
    return `${monthlyPackageUsage.toLocaleString()} packages/month (${monthlyUsage.toLocaleString()} ${packageUnit}/month)`;
  }
}

// 🔍 Package Validation Functions
export class PackageValidator {
  
  /**
   * ตรวจสอบข้อมูล package ที่ถูกต้อง
   */
  static validatePackageData(data: {
    packageSize?: number;
    packageCost?: number;
    unitCost?: number;
    currentStock?: number;
  }): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (data.packageSize !== undefined && data.packageSize <= 0) {
      errors.push('Package size must be greater than 0');
    }
    
    if (data.packageCost !== undefined && data.packageCost < 0) {
      errors.push('Package cost cannot be negative');
    }
    
    if (data.unitCost !== undefined && data.unitCost < 0) {
      errors.push('Unit cost cannot be negative');
    }
    
    if (data.currentStock !== undefined && data.currentStock < 0) {
      errors.push('Current stock cannot be negative');
    }
    
    // ตรวจสอบความสอดคล้องของราคา
    if (
      data.packageSize !== undefined && 
      data.packageCost !== undefined && 
      data.unitCost !== undefined
    ) {
      const expectedPackageCost = data.unitCost * data.packageSize;
      const tolerance = 0.01; // ยอมรับความผิดพลาดราคา 1 สตางค์
      
      if (Math.abs(data.packageCost - expectedPackageCost) > tolerance) {
        errors.push(`Package cost (${data.packageCost}) doesn't match unit cost × package size (${expectedPackageCost})`);
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  /**
   * ตรวจสอบและแก้ไขข้อมูล package อัตโนมัติ
   */
  static sanitizePackageData(data: {
    packageSize?: number;
    packageCost?: number;
    unitCost?: number;
    currentStock?: number;
  }): typeof data {
    const sanitized = { ...data };
    
    // แก้ไขค่าติดลบ
    if (sanitized.packageSize !== undefined && sanitized.packageSize <= 0) {
      sanitized.packageSize = 1;
    }
    
    if (sanitized.packageCost !== undefined && sanitized.packageCost < 0) {
      sanitized.packageCost = 0;
    }
    
    if (sanitized.unitCost !== undefined && sanitized.unitCost < 0) {
      sanitized.unitCost = 0;
    }
    
    if (sanitized.currentStock !== undefined && sanitized.currentStock < 0) {
      sanitized.currentStock = 0;
    }
    
    // คำนวณราคาที่สอดคล้องกัน
    if (
      sanitized.packageSize !== undefined && 
      sanitized.unitCost !== undefined &&
      sanitized.packageCost === undefined
    ) {
      sanitized.packageCost = sanitized.unitCost * sanitized.packageSize;
    } else if (
      sanitized.packageSize !== undefined && 
      sanitized.packageCost !== undefined &&
      sanitized.unitCost === undefined
    ) {
      sanitized.unitCost = sanitized.packageCost / sanitized.packageSize;
    }
    
    return sanitized;
  }
}

// 📊 Package Analytics Functions
export class PackageAnalytics {
  
  /**
   * คำนวณสถิติการใช้งาน package
   */
  static calculateUsageStatistics(stockCards: StockCardWithPackaging[]) {
    const totalPackages = stockCards.reduce((sum, card) => sum + card.currentStock, 0);
    const totalValue = stockCards.reduce((sum, card) => sum + Number(card.totalValue), 0);
    const totalMonthlyUsage = stockCards.reduce((sum, card) => sum + card.monthlyPackageUsage, 0);
    
    const averagePackageSize = stockCards.length > 0 
      ? stockCards.reduce((sum, card) => sum + card.packageSize, 0) / stockCards.length 
      : 0;
    
    const averagePackageCost = stockCards.length > 0
      ? stockCards.reduce((sum, card) => sum + Number(card.packageCost), 0) / stockCards.length
      : 0;
    
    return {
      totalDrugs: stockCards.length,
      totalPackages,
      totalValue,
      totalMonthlyUsage,
      averagePackageSize: Math.round(averagePackageSize * 100) / 100,
      averagePackageCost: Math.round(averagePackageCost * 100) / 100,
      turnoverRate: totalPackages > 0 ? (totalMonthlyUsage / totalPackages) * 100 : 0
    };
  }
  
  /**
   * หายาที่มีการใช้งานสูง/ต่ำผิดปกติ
   */
  static findAnomalousUsage(
    stockCards: StockCardWithPackaging[],
    options: {
      highUsageThreshold?: number;
      lowUsageThreshold?: number;
      zeroStockAlert?: boolean;
    } = {}
  ) {
    const {
      highUsageThreshold = 0.5, // ใช้มากกว่า 50% ต่อเดือน
      lowUsageThreshold = 0.01,  // ใช้น้อยกว่า 1% ต่อเดือน
      zeroStockAlert = true
    } = options;
    
    const highUsage = stockCards.filter(card => {
      const usageRate = card.currentStock > 0 ? card.monthlyPackageUsage / card.currentStock : 0;
      return usageRate > highUsageThreshold;
    });
    
    const lowUsage = stockCards.filter(card => {
      const usageRate = card.currentStock > 0 ? card.monthlyPackageUsage / card.currentStock : 0;
      return usageRate < lowUsageThreshold && card.currentStock > 0;
    });
    
    const zeroStock = zeroStockAlert 
      ? stockCards.filter(card => card.currentStock === 0)
      : [];
    
    return {
      highUsage,
      lowUsage,
      zeroStock,
      summary: {
        highUsageCount: highUsage.length,
        lowUsageCount: lowUsage.length,
        zeroStockCount: zeroStock.length
      }
    };
  }
}

// 🎯 Example Usage Functions
export class PackageExamples {
  
  /**
   * ตัวอย่างการใช้งานสำหรับแสดงในหน้า UI
   */
  static getDisplayExamples() {
    return {
      // แสดงจำนวนสต็อก
      stockDisplay: PackageDisplayFormatter.formatQuantity(10, 100, 'tablets'),
      // แสดงราคา
      priceDisplay: PackageDisplayFormatter.formatPricing(120, 1.2, 100),
      // แสดงการใช้งาน
      usageDisplay: PackageDisplayFormatter.formatUsageSummary(500, 5, 'tablets')
    };
  }
  
  /**
   * ตัวอย่างการคำนวณสำหรับใช้ในระบบ
   */
  static getCalculationExamples() {
    const calculator = PackagePricingCalculator;
    
    return {
      // คำนวณราคา package
      pricing: calculator.calculatePackagePricing(10, 100, 1.2),
      // แปลงหน่วย
      conversion: {
        unitsToPackages: calculator.unitsToPackages(1500, 100), // 15 packages
        packagesToUnits: calculator.packagesToUnits(15, 100)    // 1500 units
      },
      // คำนวณราคาเฉลี่ยใหม่
      weightedAverage: calculator.updateWeightedAverageCost(10, 120, 5, 130)
    };
  }
}