#!/bin/bash

# Deployment script for Netlify

# Environment check
if [ "$NODE_ENV" != "production" ]; then
  echo "Error: NODE_ENV must be set to production"
  exit 1
fi

# Build client
echo "Building client..."
cd client
npm install
npm run build

# Environment variables check
required_vars=("VITE_API_URL" "VITE_WS_URL")
for var in "${required_vars[@]}"; do
  if [ -z "${!var}" ]; then
    echo "Error: $var is not set"
    exit 1
  fi
done

# Deploy to Netlify
echo "Deploying to Netlify..."
netlify deploy --prod --dir=dist 