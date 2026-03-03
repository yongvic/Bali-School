#!/bin/bash

echo "================================================"
echo "Testing Next.js Build - Bali's School"
echo "================================================"
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "[1/4] Installing dependencies..."
    pnpm install
    if [ $? -ne 0 ]; then
        echo "❌ Dependency installation failed"
        exit 1
    fi
    echo "✓ Dependencies installed"
else
    echo "[1/4] Dependencies already installed"
fi

echo ""
echo "[2/4] Running TypeScript type check..."
pnpm tsc --noEmit
if [ $? -ne 0 ]; then
    echo "❌ TypeScript check failed"
    exit 1
fi
echo "✓ TypeScript checks passed"

echo ""
echo "[3/4] Building Next.js application..."
pnpm build
if [ $? -ne 0 ]; then
    echo "❌ Next.js build failed"
    exit 1
fi
echo "✓ Next.js build successful"

echo ""
echo "[4/4] Verifying build output..."
if [ -d ".next" ]; then
    echo "✓ Build output directory created"
    echo "✓ Build artifacts present"
else
    echo "❌ Build output directory not found"
    exit 1
fi

echo ""
echo "================================================"
echo "✓ ALL TESTS PASSED - BUILD SUCCESSFUL"
echo "================================================"
echo ""
echo "Project is ready for deployment!"
