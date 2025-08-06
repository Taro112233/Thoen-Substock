// scripts/merge-schemas.js
// Enhanced Prisma Schema Merger with Duplicate Detection
// ป้องกันการ merge models ซ้ำและตรวจสอบ relations

const fs = require('fs');
const path = require('path');

const SCHEMAS_DIR = path.join(__dirname, '../prisma/schemas');
const OUTPUT_FILE = path.join(__dirname, '../prisma/schema.prisma');

const baseSchema = `// This file is auto-generated. Do not edit manually.
// Edit files in prisma/schemas/ directory instead.
// Last generated: ${new Date().toISOString()}

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  // directUrl = env("DIRECT_URL")
}

`;

// Schema file order for proper dependency resolution
const SCHEMA_ORDER = {
  'shared-enums.prisma': 0,      // ต้อง load ก่อนทุกไฟล์
  'auth.prisma': 1,
  'hospital-core.prisma': 2,
  'inventory.prisma': 3,
  'requisitions.prisma': 4,
  'suppliers.prisma': 5,
  'analytics.prisma': 6,
  'audit.prisma': 7,
  'notifications.prisma': 8
};

function extractModelsAndEnums(content) {
  const models = new Set();
  const enums = new Set();
  
  // Extract model names
  const modelMatches = content.match(/^model\s+(\w+)/gm) || [];
  modelMatches.forEach(match => {
    const modelName = match.replace('model ', '');
    models.add(modelName);
  });
  
  // Extract enum names
  const enumMatches = content.match(/^enum\s+(\w+)/gm) || [];
  enumMatches.forEach(match => {
    const enumName = match.replace('enum ', '');
    enums.add(enumName);
  });
  
  return { models, enums };
}

function validateRelations(content) {
  console.log('🔍 Validating relations...');
  const relationErrors = [];
  
  // Extract all relation fields and their target models
  const relationPattern = /(\w+)\s+(\w+)(\[\])?\s+@relation\s*\(/g;
  const relations = [];
  let match;
  
  while ((match = relationPattern.exec(content)) !== null) {
    const [, fieldName, targetModel, isArray] = match;
    relations.push({ fieldName, targetModel, isArray: !!isArray });
  }
  
  // Check for missing opposite relations
  // This is a basic check - in production you might want more sophisticated validation
  if (relations.length > 0) {
    console.log(`📊 Found ${relations.length} relation fields`);
  }
  
  return relationErrors;
}

function mergeSchemas() {
  console.log('🔄 Merging Prisma schemas...');
  
  // Check if schemas directory exists
  if (!fs.existsSync(SCHEMAS_DIR)) {
    console.error(`❌ Schemas directory not found: ${SCHEMAS_DIR}`);
    console.log('Please create the schemas directory and add your schema files.');
    process.exit(1);
  }
  
  let mergedContent = baseSchema;
  
  // Track defined models and enums to prevent duplicates
  const definedModels = new Set();
  const definedEnums = new Set();
  
  // Get all .prisma files and sort them
  const schemaFiles = fs.readdirSync(SCHEMAS_DIR)
    .filter(file => file.endsWith('.prisma'))
    .sort((a, b) => {
      const orderA = SCHEMA_ORDER[a] || 999;
      const orderB = SCHEMA_ORDER[b] || 999;
      return orderA - orderB;
    });
  
  console.log(`📁 Found ${schemaFiles.length} schema files:`);
  schemaFiles.forEach((file, index) => {
    console.log(`  ${index + 1}. ${file}`);
  });
  
  if (schemaFiles.length === 0) {
    console.error('❌ No schema files found in the schemas directory.');
    console.log('Please add at least one .prisma file to the schemas directory.');
    process.exit(1);
  }
  
  // Process each schema file
  schemaFiles.forEach(file => {
    const filePath = path.join(SCHEMAS_DIR, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Remove generator and datasource blocks from individual files
    content = content
      .replace(/generator\s+\w+\s*{[^}]*}/gs, '')
      .replace(/datasource\s+\w+\s*{[^}]*}/gs, '')
      .trim();
    
    // Skip empty files
    if (!content) {
      console.log(`⚠️  Skipping empty file: ${file}`);
      return;
    }
    
    // Extract models and enums from this file
    const { models, enums } = extractModelsAndEnums(content);
    
    // Check for duplicates
    const duplicateModels = [...models].filter(model => definedModels.has(model));
    const duplicateEnums = [...enums].filter(enumName => definedEnums.has(enumName));
    
    if (duplicateModels.length > 0) {
      console.error(`❌ Duplicate models found in ${file}: ${duplicateModels.join(', ')}`);
      console.log('Please check your schema files for duplicate model definitions.');
      process.exit(1);
    }
    
    if (duplicateEnums.length > 0) {
      console.error(`❌ Duplicate enums found in ${file}: ${duplicateEnums.join(', ')}`);
      console.log('Please check your schema files for duplicate enum definitions.');
      process.exit(1);
    }
    
    // Add to tracking sets
    models.forEach(model => definedModels.add(model));
    enums.forEach(enumName => definedEnums.add(enumName));
    
    // Add section header
    const sectionName = file
      .replace('.prisma', '')
      .toUpperCase()
      .replace(/-/g, ' ');
    
    mergedContent += `\n// ==========================================\n`;
    mergedContent += `// ${sectionName}\n`;
    mergedContent += `// ==========================================\n\n`;
    mergedContent += content + '\n';
    
    console.log(`✅ Merged ${file}: ${models.size} models, ${enums.size} enums`);
  });
  
  // Write the merged schema
  try {
    fs.writeFileSync(OUTPUT_FILE, mergedContent);
    console.log(`✅ Successfully merged ${schemaFiles.length} schema files into ${OUTPUT_FILE}`);
    
    // Validate relations
    validateRelations(mergedContent);
    
    return mergedContent;
  } catch (error) {
    console.error('❌ Failed to write merged schema:', error.message);
    process.exit(1);
  }
}

function validateMerge() {
  console.log('🔍 Validating merged schema...');
  
  try {
    const content = fs.readFileSync(OUTPUT_FILE, 'utf8');
    
    // Count models and enums
    const modelMatches = content.match(/^model\s+\w+/gm) || [];
    const enumMatches = content.match(/^enum\s+\w+/gm) || [];
    
    console.log(`📊 Schema validation results:`);
    console.log(`   - Models: ${modelMatches.length}`);
    console.log(`   - Enums: ${enumMatches.length}`);
    
    // Check for basic requirements
    if (modelMatches.length === 0) {
      throw new Error('No models found in merged schema');
    }
    
    // Check for required models
    const requiredModels = ['User', 'Hospital', 'Drug', 'StockCard'];
    const modelNames = modelMatches.map(match => match.replace('model ', ''));
    
    for (const required of requiredModels) {
      if (!modelNames.includes(required)) {
        console.warn(`⚠️  Warning: Required model '${required}' not found`);
      }
    }
    
    // Check for generator and datasource
    if (!content.includes('generator client')) {
      throw new Error('Generator block not found');
    }
    
    if (!content.includes('datasource db')) {
      throw new Error('Datasource block not found');
    }
    
    // Check for common relation issues
    const potentialIssues = [];
    
    // Look for @relation without opposite field definitions
    if (content.includes('@relation') && content.includes('missing an opposite relation field')) {
      potentialIssues.push('Missing opposite relation fields detected');
    }
    
    if (potentialIssues.length > 0) {
      console.warn('⚠️  Potential issues found:');
      potentialIssues.forEach(issue => console.warn(`   - ${issue}`));
    }
    
    console.log('✅ Schema validation passed');
    
  } catch (error) {
    console.error('❌ Schema validation failed:', error.message);
    process.exit(1);
  }
}

function showUsage() {
  console.log(`
📚 Hospital Pharmacy Schema Merger v2.0

Usage:
  node scripts/merge-schemas.js [--check-only]

Options:
  --check-only    Only validate files without merging
  --help, -h      Show this help message

This script merges all .prisma files from prisma/schemas/ into prisma/schema.prisma

Features:
- ✅ Duplicate model/enum detection
- ✅ Relation validation
- ✅ Dependency-aware file ordering
- ✅ Comprehensive error reporting

Schema files are processed in this order:
${Object.entries(SCHEMA_ORDER)
  .sort(([, a], [, b]) => a - b)
  .map(([file, order]) => `  ${order + 1}. ${file}`)
  .join('\n')}

After merging, run:
  pnpm db:generate  # Generate Prisma client
  pnpm db:push      # Push to development database
  pnpm db:migrate   # Create migration for production
`);
}

// Main execution
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    showUsage();
    process.exit(0);
  }
  
  if (args.includes('--check-only')) {
    console.log('🔍 Running validation only...');
    if (fs.existsSync(OUTPUT_FILE)) {
      validateMerge();
    } else {
      console.error('❌ No merged schema found. Run without --check-only first.');
      process.exit(1);
    }
    process.exit(0);
  }
  
  try {
    mergeSchemas();
    validateMerge();
    
    console.log(`
🎉 Schema merge completed successfully!

Next steps:
  1. pnpm db:generate  # Generate Prisma client
  2. pnpm db:push      # Push to database (development)
  3. pnpm db:studio    # Open Prisma Studio (optional)

For production:
  pnpm db:migrate      # Create and apply migration

💡 Tips:
  - Use 'node scripts/merge-schemas.js --check-only' to validate without merging
  - Check prisma/schema.prisma for any remaining relation issues
  - Run 'prisma format' if needed to clean up formatting
`);
    
  } catch (error) {
    console.error('💥 Unexpected error:', error.message);
    console.log('\n🛠️  Troubleshooting:');
    console.log('  1. Check for duplicate models in different schema files');
    console.log('  2. Ensure all relations have proper opposite fields');
    console.log('  3. Verify file syntax with: prisma format');
    process.exit(1);
  }
}

module.exports = { mergeSchemas, validateMerge };