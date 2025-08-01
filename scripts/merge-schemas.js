// scripts/merge-schemas.js
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
}

`;

function mergeSchemas() {
  console.log('🔄 Merging Prisma schemas...');
  
  if (!fs.existsSync(SCHEMAS_DIR)) {
    console.error(`❌ Schemas directory not found: ${SCHEMAS_DIR}`);
    process.exit(1);
  }
  
  let mergedContent = baseSchema;
  
  const schemaFiles = fs.readdirSync(SCHEMAS_DIR)
    .filter(file => file.endsWith('.prisma'))
    .sort((a, b) => {
      const order = {
        'auth.prisma': 1,
        'pharmacy-core.prisma': 2,
        'pharmacy-custom.prisma': 3,
        'formulary.prisma': 4,
        'calculations.prisma': 5
      };
      return (order[a] || 999) - (order[b] || 999);
    });
  
  console.log(`📁 Found ${schemaFiles.length} schema files:`, schemaFiles);
  
  schemaFiles.forEach(file => {
    const filePath = path.join(SCHEMAS_DIR, file);
    const content = fs.readFileSync(filePath, 'utf8');
    
    const cleanContent = content
      .replace(/generator\s+\w+\s*{[^}]*}/gs, '')
      .replace(/datasource\s+\w+\s*{[^}]*}/gs, '')
      .trim();
    
    if (cleanContent) {
      const sectionName = file.replace('.prisma', '').toUpperCase().replace(/-/g, ' ');
      mergedContent += `\n// ==========================================\n`;
      mergedContent += `// ${sectionName}\n`;
      mergedContent += `// ==========================================\n\n`;
      mergedContent += cleanContent + '\n';
    }
  });
  
  fs.writeFileSync(OUTPUT_FILE, mergedContent);
  console.log(`✅ Successfully merged ${schemaFiles.length} schema files`);
}

function validateMerge() {
  try {
    const content = fs.readFileSync(OUTPUT_FILE, 'utf8');
    const modelCount = (content.match(/^model\s+\w+/gm) || []).length;
    const enumCount = (content.match(/^enum\s+\w+/gm) || []).length;
    
    console.log(`📊 Found ${modelCount} models and ${enumCount} enums`);
    
    if (modelCount === 0) {
      throw new Error('No models found');
    }
    
    console.log('✅ Schema validation passed');
  } catch (error) {
    console.error('❌ Schema validation failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  mergeSchemas();
  validateMerge();
}

module.exports = { mergeSchemas, validateMerge };