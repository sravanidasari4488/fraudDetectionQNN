#!/bin/bash

# Exit on error
set -e

# Configuration
PROJECT_ID="codeverse-backend-1759686507"
SERVICE_NAME="onlyclick-backend"
REGION="asia-south1"  # Change to your preferred region (Mumbai)
IMAGE_NAME="gcr.io/${PROJECT_ID}/${SERVICE_NAME}"

echo "================================"
echo "OnlyClick Backend Deployment"
echo "================================"
echo "Project: ${PROJECT_ID}"
echo "Service: ${SERVICE_NAME}"
echo "Region: ${REGION}"
echo "================================"

# Check if .env.production.local exists
if [ ! -f .env.production.local ]; then
    echo "⚠️  WARNING: .env.production.local not found!"
    echo "Please create .env.production.local with the following variables:"
    echo "  - PORT=8080"
    echo "  - SUPABASE_URL=your_supabase_url"
    echo "  - SUPABASE_SERVICE_ROLE_KEY=your_service_role_key"
    echo "  - CLOUDINARY_CLOUD_NAME=your_cloudinary_name"
    echo "  - CLOUDINARY_API_KEY=your_cloudinary_key"
    echo "  - CLOUDINARY_API_SECRET=your_cloudinary_secret"
    echo "  - RAZORPAY_KEY_ID=your_razorpay_key_id"
    echo "  - RAZORPAY_KEY_SECRET=your_razorpay_key_secret"
    echo ""
    read -p "Do you want to continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Set the active project
echo "🔧 Setting active project..."
gcloud config set project ${PROJECT_ID}

# Enable required APIs
echo "🔧 Enabling required APIs..."
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com

# Build the Docker image
echo "🐳 Building Docker image..."
docker build --platform linux/amd64 -t ${IMAGE_NAME}:latest .

# Push the image to Google Container Registry
echo "📤 Pushing image to GCR..."
docker push ${IMAGE_NAME}:latest

# Prepare environment variables from .env.production.local
ENV_VARS=""
if [ -f .env.production.local ]; then
    echo "📝 Loading environment variables from .env.production.local..."
    
    # Read and format environment variables
    while IFS='=' read -r key value; do
        # Skip empty lines, comments, and PORT (reserved by Cloud Run)
        [[ -z "$key" || "$key" =~ ^#.*$ || "$key" == "PORT" ]] && continue
        
        # Remove quotes from value if present
        value=$(echo "$value" | sed -e 's/^"//' -e 's/"$//' -e "s/^'//" -e "s/'$//")
        
        # Add to ENV_VARS
        if [ -z "$ENV_VARS" ]; then
            ENV_VARS="${key}=${value}"
        else
            ENV_VARS="${ENV_VARS},${key}=${value}"
        fi
    done < .env.production.local
fi

# Deploy to Cloud Run
echo "🚀 Deploying to Cloud Run..."
if [ -z "$ENV_VARS" ]; then
    # Deploy without custom environment variables
    gcloud run deploy ${SERVICE_NAME} \
        --image ${IMAGE_NAME}:latest \
        --platform managed \
        --region ${REGION} \
        --allow-unauthenticated \
        --port 8080 \
        --memory 512Mi \
        --cpu 1 \
        --timeout 300 \
        --max-instances 10 \
        --min-instances 0 \
        --set-env-vars "NODE_ENV=production"
else
    # Deploy with custom environment variables
    gcloud run deploy ${SERVICE_NAME} \
        --image ${IMAGE_NAME}:latest \
        --platform managed \
        --region ${REGION} \
        --allow-unauthenticated \
        --port 8080 \
        --memory 512Mi \
        --cpu 1 \
        --timeout 300 \
        --max-instances 10 \
        --min-instances 0 \
        --set-env-vars "NODE_ENV=production,${ENV_VARS}"
fi

# Get the service URL
echo "✅ Deployment complete!"
SERVICE_URL=$(gcloud run services describe ${SERVICE_NAME} --platform managed --region ${REGION} --format 'value(status.url)')
echo "🌐 Service URL: ${SERVICE_URL}"
echo ""
echo "Test your API:"
echo "curl ${SERVICE_URL}/api/v1/health"
