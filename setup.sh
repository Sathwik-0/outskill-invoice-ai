#!/bin/bash
# Setup script for outskill-invoice
set -e

echo "📦 Installing dependencies..."
npm install

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Copy .env.local.example to .env.local"
echo "2. Fill in your Supabase and Groq API keys"
echo "3. Run: npm run dev"
