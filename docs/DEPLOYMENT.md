# 🚀 Azure DevOps Deployment Guide

This guide covers the complete setup and deployment of the Smart Waste Management System to Microsoft Azure using modern DevOps practices.

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   GitHub Repo   │────│  GitHub Actions │────│   Azure Cloud   │
│                 │    │                 │    │                 │
│ • Source Code   │    │ • CI Pipeline   │    │ • AKS Cluster   │
│ • Dockerfile    │    │ • CD Pipeline   │    │ • ACR Registry  │
│ • K8s Manifests │    │ • Testing       │    │ • Key Vault     │
│ • Terraform     │    │ • Security Scan │    │ • Monitor/Logs  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📋 Prerequisites

### Local Development Tools
- **Node.js** 18.x or later
- **Docker** and Docker Compose
- **kubectl** v1.28.0+
- **Terraform** v1.0+
- **Azure CLI** v2.0+
- **Git**

### Azure Requirements
- **Azure Subscription** with appropriate permissions
- **Azure AD** tenant access
- **Service Principal** for GitHub Actions

## 🔧 Initial Setup

### 1. Clone and Setup Local Environment

```powershell
# Clone the repository
git clone https://github.com/your-username/smart-waste-management.git
cd smart-waste-management

# Copy environment files
cp terraform/terraform.tfvars.example terraform/terraform.tfvars
cp .env.example .env

# Install dependencies
cd frontend && npm install
cd ../backend && npm install
```

### 2. Create Azure Service Principal

```powershell
# Login to Azure
az login

# Create service principal
az ad sp create-for-rbac --name "smart-waste-github-actions" \
  --role contributor \
  --scopes /subscriptions/{subscription-id} \
  --sdk-auth

# Save the output JSON - you'll need it for GitHub secrets
```

### 3. Configure GitHub Secrets

Add the following secrets to your GitHub repository (`Settings` → `Secrets and variables` → `Actions`):

#### Required Secrets
```
AZURE_CREDENTIALS              # Service principal JSON from step 2
AZURE_SUBSCRIPTION_ID          # Your Azure subscription ID
AZURE_TENANT_ID               # Your Azure AD tenant ID
ACR_LOGIN_SERVER              # Will be set after first terraform run
ACR_USERNAME                  # Will be set after first terraform run  
ACR_PASSWORD                  # Will be set after first terraform run
MONGODB_USERNAME              # Database username (base64 encoded)
MONGODB_PASSWORD              # Database password (base64 encoded)
JWT_SECRET                    # JWT signing secret (base64 encoded)
STRIPE_SECRET_KEY             # Stripe secret key (base64 encoded)
STRIPE_PUBLISHABLE_KEY        # Stripe publishable key (base64 encoded)
```

#### How to encode secrets to base64:
```powershell
# PowerShell
$text = "your-secret-here"
[Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($text))
```

### 4. Configure Terraform Variables

Edit `terraform/terraform.tfvars`:

```hcl
environment = "dev"
location    = "East US"

# AKS Configuration
kubernetes_version = "1.28.0"
node_count        = 2
node_vm_size      = "Standard_D2s_v3"
user_node_count   = 2
user_node_vm_size = "Standard_D2s_v3"

# Feature flags
enable_application_gateway = false
enable_monitoring         = true

# Domain configuration (update with your domain)
domain_name = "dev.smart-waste.yourdomain.com"

# Additional tags
tags = {
  CostCenter = "Engineering"
  Owner      = "DevOps-Team"
}
```

## 🚀 Deployment Process

### Option 1: Automated Deployment (Recommended)

1. **Push code to main branch** - This triggers the CI/CD pipeline automatically
2. **Monitor GitHub Actions** - Check the workflow progress in GitHub
3. **Access your application** - URLs will be displayed in the deployment logs

### Option 2: Manual Deployment

#### Step 1: Deploy Infrastructure
```powershell
cd terraform

# Initialize Terraform
terraform init

# Plan the deployment
terraform plan -var="environment=dev"

# Apply the infrastructure
terraform apply -var="environment=dev"

# Note the outputs - you'll need them for the next steps
```

#### Step 2: Build and Push Docker Image
```powershell
# Build the Docker image
docker build -t smart-waste:latest .

# Tag for ACR (replace with your ACR name from terraform output)
docker tag smart-waste:latest {acr-name}.azurecr.io/smart-waste:latest

# Login to ACR
az acr login --name {acr-name}

# Push the image
docker push {acr-name}.azurecr.io/smart-waste:latest
```

#### Step 3: Deploy to Kubernetes
```powershell
# Get AKS credentials
az aks get-credentials --resource-group {resource-group-name} --name {aks-cluster-name}

# Create ACR secret
kubectl create secret docker-registry acr-secret \
  --namespace=smart-waste \
  --docker-server={acr-name}.azurecr.io \
  --docker-username={acr-username} \
  --docker-password={acr-password}

# Update deployment manifest with your ACR name
$acrName = "{your-acr-name}"
$imageTag = "latest"
(Get-Content k8s/deployment.yaml) -replace '\$\{ACR_NAME\}', $acrName -replace '\$\{IMAGE_TAG\}', $imageTag | Set-Content k8s/deployment-updated.yaml

# Deploy to Kubernetes
kubectl apply -f k8s/namespace-config.yaml
kubectl apply -f k8s/database.yaml
kubectl apply -f k8s/deployment-updated.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/ingress.yaml
```

## 🔍 Monitoring and Troubleshooting

### Check Deployment Status
```powershell
# Check all resources
kubectl get all -n smart-waste

# Check specific deployments
kubectl get deployments -n smart-waste
kubectl get services -n smart-waste
kubectl get ingress -n smart-waste

# Check pod logs
kubectl logs -f deployment/smart-waste-app -n smart-waste
kubectl logs -f deployment/mongodb -n smart-waste
```

### Health Checks
```powershell
# Port forward to test locally
kubectl port-forward -n smart-waste service/smart-waste-backend 3001:3001
curl http://localhost:3001/health

kubectl port-forward -n smart-waste service/smart-waste-frontend 3000:3000
curl http://localhost:3000
```

### Access Application
```powershell
# Get LoadBalancer IP
kubectl get service smart-waste-app-loadbalancer -n smart-waste

# Get Ingress IP (if configured)
kubectl get ingress smart-waste-ingress -n smart-waste
```

## 🛡️ Security Considerations

### Secrets Management
- All sensitive data is stored in Kubernetes secrets
- Azure Key Vault integration available
- Never commit secrets to git

### Network Security
- Network Security Groups (NSG) configured
- Private subnets for AKS nodes
- Application Gateway with WAF (optional)

### RBAC and Identity
- Azure AD integration for AKS
- Role-based access control
- Service principals with minimal permissions

## 🏠 Local Development

### Using Docker Compose
```powershell
# Start all services locally
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### URLs for Local Development
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:3001
- **MongoDB**: localhost:27017
- **Redis**: localhost:6379

## 🔄 CI/CD Pipeline Details

### CI Pipeline (`ci.yaml`)
1. **Security Scanning** - Trivy vulnerability scans
2. **Frontend CI** - Lint, test, build React app
3. **Backend CI** - Lint, test Node.js API
4. **Docker Build** - Multi-platform image build
5. **Infrastructure Validation** - Terraform and K8s manifest validation

### CD Pipeline (`cd.yaml`)
1. **Infrastructure Deployment** - Terraform apply
2. **Application Deployment** - Kubernetes deployment
3. **Health Checks** - Smoke tests and readiness checks
4. **Notifications** - Success/failure notifications

## 📊 Monitoring and Observability

### Azure Monitor Integration
- **Application Insights** for application telemetry
- **Log Analytics** for centralized logging
- **Azure Monitor** for infrastructure metrics

### Available Dashboards
- AKS cluster metrics
- Application performance insights
- Custom business metrics

## 🔧 Maintenance

### Updating the Application
1. Push changes to your branch
2. Create PR to main branch
3. Pipeline automatically builds and tests
4. Merge triggers deployment

### Scaling
```powershell
# Scale application pods
kubectl scale deployment smart-waste-app --replicas=5 -n smart-waste

# Scale AKS nodes (manual)
az aks scale --resource-group {rg-name} --name {aks-name} --node-count 5
```

### Backup and Recovery
- MongoDB data is persisted using Azure Disks
- Regular database backups recommended
- Infrastructure as Code allows easy recreation

## 🆘 Troubleshooting

### Common Issues

#### 1. Image Pull Errors
```powershell
# Check ACR secret
kubectl get secret acr-secret -n smart-waste -o yaml

# Recreate ACR secret
kubectl delete secret acr-secret -n smart-waste
# Then recreate with correct credentials
```

#### 2. Database Connection Issues
```powershell
# Check MongoDB pod
kubectl logs deployment/mongodb -n smart-waste

# Check connectivity
kubectl exec -it deployment/smart-waste-app -n smart-waste -- curl mongodb:27017
```

#### 3. Ingress Not Working
```powershell
# Check ingress controller
kubectl get pods -n ingress-nginx

# Check ingress configuration
kubectl describe ingress smart-waste-ingress -n smart-waste
```

### Getting Help
- Check GitHub Actions logs for detailed error messages
- Review Azure Portal for resource status
- Use `kubectl describe` for detailed Kubernetes resource information

## 📚 Additional Resources

- [Azure Kubernetes Service Documentation](https://docs.microsoft.com/en-us/azure/aks/)
- [Terraform Azure Provider](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Kubernetes Documentation](https://kubernetes.io/docs/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test locally using Docker Compose
5. Submit a pull request

The CI pipeline will automatically test your changes before deployment.

---

For additional support, please create an issue in the GitHub repository or contact the DevOps team.
