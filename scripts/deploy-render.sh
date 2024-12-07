#!/bin/bash

# Deployment script for Render

# Environment check
if [ "$NODE_ENV" != "production" ]; then
  echo "Error: NODE_ENV must be set to production"
  exit 1
fi

# Build server
echo "Building server..."
cd server
npm install
npm run build

# Database migrations
echo "Running database migrations..."
npm run migrate

# Environment variables check
required_vars=("MONGODB_URI" "REDIS_URL" "JWT_SECRET")
for var in "${required_vars[@]}"; do
  if [ -z "${!var}" ]; then
    echo "Error: $var is not set"
    exit 1
  fi
done

# Start server
echo "Starting server..."
npm start 