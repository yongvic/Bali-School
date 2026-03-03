#!/bin/bash

# Prisma database initialization script
# This script runs database migrations and generates Prisma client

echo "📦 Generating Prisma Client..."
npx prisma generate

echo "🗄️ Running database migrations..."
npx prisma migrate deploy

echo "✅ Database setup complete!"
