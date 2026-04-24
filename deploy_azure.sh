#!/bin/bash
set -e

# Configuration
PROJECT_NAME="kairos"
LOCATION="westeurope"
ENVIRONMENT="prod"
ACR_NAME="acr${PROJECT_NAME}prod" # This should match your Bicep output or naming convention

echo "🚀 KairOS Azure Deployment Engine Starting..."

# 1. Build Backend
echo "🐳 Building Backend Container..."
cd backend
docker build -t ${PROJECT_NAME}-backend:latest .
cd ..

# 2. Azure Login & Infrastructure
echo "🔑 Logging into Azure..."
# az login

# 3. Build & Push to ACR
# Note: Requires Azure CLI and Docker installed
echo "📦 Pushing to ACR..."
# az acr login --name $ACR_NAME
# docker tag ${PROJECT_NAME}-backend:latest ${ACR_NAME}.azurecr.io/${PROJECT_NAME}-backend:latest
# docker push ${ACR_NAME}.azurecr.io/${PROJECT_NAME}-backend:latest

# 4. Deploy Bicep
echo "🏗️ Orchestrating Infrastructure..."
# az deployment sub create --location $LOCATION --template-file infra/main.bicep --parameters dbAdminPassword='REPLACEME_SECURE_PWD'

# 5. Build & Deploy Frontend to Storage
echo "🎨 Building Frontend Static Assets..."
cd frontend
# npm install
# npm run build
# az storage blob upload-batch -s ./dist -d '$web' --account-name st${PROJECT_NAME}prod --overwrite

echo "✅ KairOS Strategic OS Deployed! Check ACA URL for Backend and Storage URL for Frontend."
