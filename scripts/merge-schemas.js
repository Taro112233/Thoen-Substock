// scripts/merge-schemas.js
// Merges individual Prisma schema files into a single schema.prisma
// Usage: node scripts/merge-schemas.js

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
  directUrl = env("DIRECT_URL")
}

`;

// Schema file order for proper dependency resolution
const SCHEMA_ORDER = {
  'auth.prisma': 1,
  'hospital-core.prisma': 2,
  'inventory.prisma': 3,
  'requisitions.prisma': 4,
  'suppliers.prisma': 5,
  'analytics.prisma': 6,
  'audit.prisma': 7,
  'notifications.prisma': 8
};

function mergeSchemas() {
  console.log('🔄 Merging Prisma schemas...');
  
  // Check if schemas directory exists
  if (!fs.existsSync(SCHEMAS_DIR)) {
    console.error(`❌ Schemas directory not found: ${SCHEMAS_DIR}`);
    console.log('Please create the schemas directory and add your schema files.');
    process.exit(1);
  }
  
  let mergedContent = baseSchema;
  
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
    
    // Add section header
    const sectionName = file
      .replace('.prisma', '')
      .toUpperCase()
      .replace(/-/g, ' ');
    
    mergedContent += `\n// ==========================================\n`;
    mergedContent += `// ${sectionName}\n`;
    mergedContent += `// ==========================================\n\n`;
    mergedContent += content + '\n';
  });
  
  // Write the merged schema
  try {
    fs.writeFileSync(OUTPUT_FILE, mergedContent);
    console.log(`✅ Successfully merged ${schemaFiles.length} schema files into ${OUTPUT_FILE}`);
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
    
    console.log('✅ Schema validation passed');
    
  } catch (error) {
    console.error('❌ Schema validation failed:', error.message);
    process.exit(1);
  }
}

function showUsage() {
  console.log(`
📚 Hospital Pharmacy Schema Merger

Usage:
  node scripts/merge-schemas.js

This script merges all .prisma files from prisma/schemas/ into prisma/schema.prisma

Schema files are processed in this order:
${Object.entries(SCHEMA_ORDER)
  .sort(([, a], [, b]) => a - b)
  .map(([file, order]) => `  ${order}. ${file}`)
  .join('\n')}

After merging, run:
  npm run db:generate  # Generate Prisma client
  npm run db:push      # Push to development database
  npm run db:migrate   # Create migration for production
`);
}

// Main execution
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    showUsage();
    process.exit(0);
  }
  
  try {
    mergeSchemas();
    validateMerge();
    
    console.log(`
🎉 Schema merge completed successfully!

Next steps:
  1. npm run db:generate  # Generate Prisma client
  2. npm run db:push      # Push to database (development)
  3. npm run db:studio    # Open Prisma Studio (optional)

For production:
  npm run db:migrate      # Create and apply migration
`);
    
  } catch (error) {
    console.error('💥 Unexpected error:', error.message);
    process.exit(1);
  }
}

module.exports = { mergeSchemas, validateMerge };