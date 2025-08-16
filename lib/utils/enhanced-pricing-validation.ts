// lib/utils/enhanced-pricing-validation.ts
// Enhanced validation สำหรับ pricing ที่รวม pricePerBox

import { Decimal } from "@prisma/client/runtime/library";

export interface PricingData {
  packageSize?: number;
  packageCost?: number;
  unitCost?: number;
  pricePerBox?: number;
  currentStock?: number;
  lastPackageCost?: number;
  averageCost?: number;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

export interface PricingAnalysis {
  consistency: {
    unitVsPackage: boolean;
    packageVsBox: boolean;
    historicalTrend: 'increasing' | 'decreasing' | 'stable' | 'unknown';
  };
  variance: {
    packageVsBoxPercent: number;
    currentVsHistoricalPercent: number;
  };
  recommendations: string[];
}

export class EnhancedPricingValidator {
  
  /**
   * ตรวจสอบความถูกต้องของข้อมูลราคาแบบครบถ้วน
   */
  static validateEnhancedPricing(data: PricingData): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];
    
    // Basic validation
    if (data.packageSize !== undefined && data.packageSize <= 0) {
      errors.push('Package size must be greater than 0');
    }
    
    if (data.packageCost !== undefined && data.packageCost < 0) {
      errors.push('Package cost cannot be negative');
    }
    
    if (data.unitCost !== undefined && data.unitCost < 0) {
      errors.push('Unit cost cannot be negative');
    }
    
    if (data.pricePerBox !== undefined && data.pricePerBox < 0) {
      errors.push('Price per box cannot be negative');
    }
    
    if (data.currentStock !== undefined && data.currentStock < 0) {
      errors.push('Current stock cannot be negative');
    }
    
    // Consistency validation
    if (
      data.packageSize !== undefined && 
      data.packageCost !== undefined && 
      data.unitCost !== undefined
    ) {
      const expectedPackageCost = data.unitCost * data.packageSize;
      const tolerance = 0.01;
      
      if (Math.abs(data.packageCost - expectedPackageCost) > tolerance) {
        errors.push(
          `Package cost (${data.packageCost}) doesn't match unit cost × package size (${expectedPackageCost.toFixed(2)})`
        );
      }
    }
    
    // PricePerBox validation
    if (
      data.pricePerBox !== undefined && 
      data.packageCost !== undefined
    ) {
      const difference = Math.abs(data.pricePerBox - data.packageCost);
      const percentDifference = data.packageCost > 0 
        ? (difference / data.packageCost) * 100 
        : 0;
      
      if (percentDifference > 20) {
        warnings.push(
          `Large price variance: Listed box price (${data.pricePerBox}) differs significantly from calculated package cost (${data.packageCost})`
        );
      } else if (percentDifference > 5) {
        warnings.push(
          `Price variance detected: ${percentDifference.toFixed(1)}% difference between listed and calculated price`
        );
      }
    }
    
    // Historical comparison
    if (
      data.packageCost !== undefined && 
      data.lastPackageCost !== undefined && 
      data.lastPackageCost > 0
    ) {
      const historicalChange = ((data.packageCost - data.lastPackageCost) / data.lastPackageCost) * 100;
      
      if (Math.abs(historicalChange) > 30) {
        warnings.push(
          `Significant price change: ${historicalChange > 0 ? '+' : ''}${historicalChange.toFixed(1)}% from previous cost`
        );
      }
      
      if (historicalChange > 50) {
        errors.push('Price increase exceeds 50% - please verify data accuracy');
      }
    }
    
    // Zero price warnings
    if (data.pricePerBox === 0 || data.packageCost === 0 || data.unitCost === 0) {
      warnings.push('Zero pricing detected - ensure this is intentional (free samples, donations, etc.)');
    }
    
    // Suggestions
    if (data.pricePerBox === undefined && data.packageCost !== undefined) {
      suggestions.push('Consider setting pricePerBox for better price tracking');
    }
    
    if (data.packageSize && data.packageSize > 1000) {
      suggestions.push('Large package size detected - verify this is correct for the drug type');
    }
    
    if (data.unitCost && data.unitCost > 100) {
      suggestions.push('High unit cost detected - consider if this drug should be flagged as high-value');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions
    };
  }
  
  /**
   * วิเคราะห์ราคาแบบละเอียด
   */
  static analyzePricing(data: PricingData): PricingAnalysis {
    const analysis: PricingAnalysis = {
      consistency: {
        unitVsPackage: true,
        packageVsBox: true,
        historicalTrend: 'unknown'
      },
      variance: {
        packageVsBoxPercent: 0,
        currentVsHistoricalPercent: 0
      },
      recommendations: []
    };
    
    // Unit vs Package consistency
    if (
      data.packageSize !== undefined && 
      data.packageCost !== undefined && 
      data.unitCost !== undefined
    ) {
      const expectedPackageCost = data.unitCost * data.packageSize;
      const tolerance = 0.01;
      analysis.consistency.unitVsPackage = Math.abs(data.packageCost - expectedPackageCost) <= tolerance;
    }
    
    // Package vs Box price comparison
    if (data.pricePerBox !== undefined && data.packageCost !== undefined) {
      const difference = data.pricePerBox - data.packageCost;
      analysis.variance.packageVsBoxPercent = data.packageCost > 0 
        ? (difference / data.packageCost) * 100 
        : 0;
      
      analysis.consistency.packageVsBox = Math.abs(analysis.variance.packageVsBoxPercent) <= 5;
      
      if (analysis.variance.packageVsBoxPercent > 5) {
        analysis.recommendations.push('Listed box price is higher than calculated cost - check for markup or pricing errors');
      } else if (analysis.variance.packageVsBoxPercent < -5) {
        analysis.recommendations.push('Listed box price is lower than calculated cost - verify discount or pricing strategy');
      }
    }
    
    // Historical trend analysis
    if (
      data.packageCost !== undefined && 
      data.lastPackageCost !== undefined && 
      data.lastPackageCost > 0
    ) {
      const change = ((data.packageCost - data.lastPackageCost) / data.lastPackageCost) * 100;
      analysis.variance.currentVsHistoricalPercent = change;
      
      if (change > 2) {
        analysis.consistency.historicalTrend = 'increasing';
        if (change > 15) {
          analysis.recommendations.push('Consider price trend monitoring - significant cost increase detected');
        }
      } else if (change < -2) {
        analysis.consistency.historicalTrend = 'decreasing';
        if (change < -15) {
          analysis.recommendations.push('Cost reduction detected - verify supplier changes or bulk discounts');
        }
      } else {
        analysis.consistency.historicalTrend = 'stable';
      }
    }
    
    // Value-based recommendations
    if (data.pricePerBox && data.pricePerBox > 1000) {
      analysis.recommendations.push('High-value drug detected - consider enhanced security measures');
    }
    
    if (data.unitCost && data.unitCost < 0.1) {
      analysis.recommendations.push('Low-cost drug - verify accuracy and consider bulk purchasing');
    }
    
    return analysis;
  }
  
  /**
   * แก้ไขข้อมูลราคาอัตโนมัติ
   */
  static sanitizeEnhancedPricing(data: PricingData): PricingData {
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
    
    if (sanitized.pricePerBox !== undefined && sanitized.pricePerBox < 0) {
      sanitized.pricePerBox = 0;
    }
    
    if (sanitized.currentStock !== undefined && sanitized.currentStock < 0) {
      sanitized.currentStock = 0;
    }
    
    // คำนวณราคาที่สอดคล้องกัน - ให้ priority กับ pricePerBox
    if (
      sanitized.packageSize !== undefined && 
      sanitized.pricePerBox !== undefined &&
      (sanitized.packageCost === undefined || sanitized.unitCost === undefined)
    ) {
      // ใช้ pricePerBox เป็นหลัก
      sanitized.packageCost = sanitized.pricePerBox;
      sanitized.unitCost = sanitized.pricePerBox / sanitized.packageSize;
    } else if (
      sanitized.packageSize !== undefined && 
      sanitized.unitCost !== undefined &&
      sanitized.packageCost === undefined
    ) {
      sanitized.packageCost = sanitized.unitCost * sanitized.packageSize;
      if (sanitized.pricePerBox === undefined) {
        sanitized.pricePerBox = sanitized.packageCost;
      }
    } else if (
      sanitized.packageSize !== undefined && 
      sanitized.packageCost !== undefined &&
      sanitized.unitCost === undefined
    ) {
      sanitized.unitCost = sanitized.packageCost / sanitized.packageSize;
      if (sanitized.pricePerBox === undefined) {
        sanitized.pricePerBox = sanitized.packageCost;
      }
    }
    
    return sanitized;
  }
  
  /**
   * เปรียบเทียบราคาระหว่างยาหลายตัว
   */
  static comparePricing(pricingData: PricingData[]): {
    summary: {
      averageUnitCost: number;
      averagePackageCost: number;
      priceRange: { min: number; max: number };
      standardDeviation: number;
    };
    outliers: {
      highCost: PricingData[];
      lowCost: PricingData[];
    };
    insights: string[];
  } {
    const validData = pricingData.filter(d => d.unitCost !== undefined && d.unitCost > 0);
    
    if (validData.length === 0) {
      return {
        summary: {
          averageUnitCost: 0,
          averagePackageCost: 0,
          priceRange: { min: 0, max: 0 },
          standardDeviation: 0
        },
        outliers: { highCost: [], lowCost: [] },
        insights: ['No valid pricing data available for comparison']
      };
    }
    
    const unitCosts = validData.map(d => d.unitCost!);
    const packageCosts = validData.map(d => d.packageCost || 0);
    
    const averageUnitCost = unitCosts.reduce((sum, cost) => sum + cost, 0) / unitCosts.length;
    const averagePackageCost = packageCosts.reduce((sum, cost) => sum + cost, 0) / packageCosts.length;
    
    const minCost = Math.min(...unitCosts);
    const maxCost = Math.max(...unitCosts);
    
    // คำนวณ standard deviation
    const variance = unitCosts.reduce((sum, cost) => sum + Math.pow(cost - averageUnitCost, 2), 0) / unitCosts.length;
    const standardDeviation = Math.sqrt(variance);
    
    // หา outliers (มากกว่า 2 standard deviations)
    const threshold = 2 * standardDeviation;
    const highCost = validData.filter(d => d.unitCost! > averageUnitCost + threshold);
    const lowCost = validData.filter(d => d.unitCost! < averageUnitCost - threshold);
    
    // สร้าง insights
    const insights: string[] = [];
    
    if (maxCost / minCost > 10) {
      insights.push(`Wide price range detected: ${(maxCost/minCost).toFixed(1)}x difference between highest and lowest cost`);
    }
    
    if (highCost.length > 0) {
      insights.push(`${highCost.length} high-cost outliers detected`);
    }
    
    if (lowCost.length > 0) {
      insights.push(`${lowCost.length} low-cost outliers detected`);
    }
    
    if (standardDeviation / averageUnitCost > 0.5) {
      insights.push('High price variability detected - consider price standardization strategies');
    }
    
    return {
      summary: {
        averageUnitCost,
        averagePackageCost,
        priceRange: { min: minCost, max: maxCost },
        standardDeviation
      },
      outliers: { highCost, lowCost },
      insights
    };
  }
}

// 📊 Pricing Report Generator
export class PricingReportGenerator {
  
  /**
   * สร้างรายงานราคาแบบสรุป
   */
  static generatePricingSummaryReport(stockCards: any[]): {
    overview: {
      totalDrugs: number;
      totalValue: number;
      averagePackagePrice: number;
      priceConsistencyRate: number;
    };
    categories: {
      highValue: number;
      mediumValue: number;
      lowValue: number;
    };
    alerts: {
      inconsistentPricing: number;
      missingPriceData: number;
      unusualPriceChanges: number;
    };
    recommendations: string[];
  } {
    const total = stockCards.length;
    const totalValue = stockCards.reduce((sum, card) => sum + (Number(card.totalValue) || 0), 0);
    const averagePackagePrice = stockCards.length > 0 
      ? stockCards.reduce((sum, card) => sum + (Number(card.pricePerBox) || Number(card.packageCost) || 0), 0) / stockCards.length
      : 0;
    
    // Price consistency check
    let consistentPricing = 0;
    let inconsistentPricing = 0;
    let missingPriceData = 0;
    let unusualPriceChanges = 0;
    
    stockCards.forEach(card => {
      const hasCompleteData = card.pricePerBox && card.packageCost && card.averageCost;
      
      if (!hasCompleteData) {
        missingPriceData++;
        return;
      }
      
      const priceDifference = Math.abs(Number(card.pricePerBox) - Number(card.packageCost));
      const priceConsistency = Number(card.packageCost) > 0 
        ? (priceDifference / Number(card.packageCost)) * 100 
        : 0;
      
      if (priceConsistency <= 5) {
        consistentPricing++;
      } else {
        inconsistentPricing++;
      }
      
      // Check for unusual price changes
      if (card.lastPackageCost && Number(card.packageCost) > 0 && Number(card.lastPackageCost) > 0) {
        const changePercent = Math.abs((Number(card.packageCost) - Number(card.lastPackageCost)) / Number(card.lastPackageCost)) * 100;
        if (changePercent > 25) {
          unusualPriceChanges++;
        }
      }
    });
    
    const priceConsistencyRate = total > 0 ? (consistentPricing / (consistentPricing + inconsistentPricing)) * 100 : 0;
    
    // Categorize by value
    const highValueThreshold = averagePackagePrice * 3;
    const lowValueThreshold = averagePackagePrice * 0.3;
    
    const categories = {
      highValue: stockCards.filter(card => Number(card.pricePerBox || card.packageCost) > highValueThreshold).length,
      mediumValue: stockCards.filter(card => {
        const price = Number(card.pricePerBox || card.packageCost);
        return price >= lowValueThreshold && price <= highValueThreshold;
      }).length,
      lowValue: stockCards.filter(card => Number(card.pricePerBox || card.packageCost) < lowValueThreshold).length
    };
    
    // Generate recommendations
    const recommendations: string[] = [];
    
    if (priceConsistencyRate < 80) {
      recommendations.push('Improve price data consistency across drug records');
    }
    
    if (missingPriceData > total * 0.1) {
      recommendations.push('Complete missing price information for better inventory valuation');
    }
    
    if (unusualPriceChanges > 0) {
      recommendations.push(`Review ${unusualPriceChanges} drugs with significant price changes`);
    }
    
    if (categories.highValue > total * 0.1) {
      recommendations.push('Consider enhanced security measures for high-value drugs');
    }
    
    return {
      overview: {
        totalDrugs: total,
        totalValue,
        averagePackagePrice,
        priceConsistencyRate
      },
      categories,
      alerts: {
        inconsistentPricing,
        missingPriceData,
        unusualPriceChanges
      },
      recommendations
    };
  }
}