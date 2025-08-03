#!/bin/bash
# scripts/push-auth-schema.sh
# Direct Database Push Script for Better Auth Integration (No Migration)

echo "🚀 Starting Better Auth Schema Push..."

# Step 1: Merge schemas
echo "📋 Step 1: Merging Prisma schemas..."
node scripts/merge-schemas.js

if [ $? -ne 0 ]; then
    echo "❌ Schema merge failed!"
    exit 1
fi

echo "✅ Schemas merged successfully"

# Step 2: Format schema
echo "📋 Step 2: Formatting schema..."
npx prisma format

# Step 3: Push to database (without migration)
echo "📋 Step 3: Pushing schema to database..."
echo "⚠️  This will directly modify your database schema without creating migration files"
read -p "Are you sure you want to continue? (y/N): " -n 1 -r
echo

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Operation cancelled"
    exit 1
fi

npx prisma db push

if [ $? -ne 0 ]; then
    echo "❌ Database push failed!"
    echo "💡 Tip: Make sure your database is running and accessible"
    exit 1
fi

echo "✅ Database schema pushed successfully"

# Step 4: Generate Prisma client
echo "📋 Step 4: Generating Prisma client..."
npx prisma generate

if [ $? -ne 0 ]; then
    echo "❌ Prisma client generation failed!"
    exit 1
fi

echo "✅ Prisma client generated successfully"

# Step 5: Verify database state
echo "📋 Step 5: Verifying database state..."
npx prisma db pull --print

echo ""
echo "🎉 Better Auth schema push completed successfully!"
echo ""
echo "📝 Next steps:"
echo "1. Install Better Auth dependencies: npm install better-auth"
echo "2. Set up Better Auth configuration in lib/auth.ts"
echo "3. Create API routes in app/api/auth/"
echo "4. Implement authentication components"
echo ""
echo "🔧 Added fields to User model:"
echo "- username (unique)"
echo "- firstName"
echo "- lastName" 
echo "- position"
echo "- isProfileComplete"
echo ""
echo "🆕 Added Better Auth models:"
echo "- Account (for OAuth providers)"
echo "- Session (with enhanced tracking)"
echo ""
echo "⚠️  Important Notes:"
echo "- No migration files were created"
echo "- Schema changes were applied directly to database"
echo "- For production, consider using migrations instead"
echo "- Update your authentication logic to use new fields"