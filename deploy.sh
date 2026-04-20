#!/bin/bash
set -e

# Configuration
AWS_REGION="eu-west-1" # Update as needed
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
REPO_NAME="personal-os-backend"
FRONTEND_BUCKET="personal-os-frontend-bucket"
DISTRIBUTION_ID="XXXXXXXXXXXXXX"

echo "🚀 Starting Deployment Process..."

# 1. Build Frontend
echo "📦 Building Frontend..."
cd frontend
npm install
npm run build
cd ..

# 2. Build and Push Backend Docker Image
echo "🐳 Building Docker Image..."
docker build -t $REPO_NAME ./backend

echo "🔑 Logging in to ECR..."
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

echo "🏷️ Tagging and Pushing Image..."
docker tag $REPO_NAME:latest $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$REPO_NAME:latest
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$REPO_NAME:latest

# 3. Upload Frontend to S3
echo "☁️ Uploading Frontend to S3..."
# aws s3 sync frontend/dist s3://$FRONTEND_BUCKET --delete

# 4. Invalidate CloudFront (Optional)
echo "🧹 Invalidating CloudFront Cache..."
# aws cloudfront create-invalidation --distribution-id $DISTRIBUTION_ID --paths "/*"

echo "✅ Deployment Scripts Ready! (Execute AWS CLI commands manually for first-time infrastructure setup)"
