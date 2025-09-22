# 🚀 Kubernetes Learning Guide: Smart Waste Management System

## 📚 Table of Contents
1. [Prerequisites & Setup](#prerequisites--setup)
2. [Kubernetes Concepts](#kubernetes-concepts)
3. [Local Kubernetes Setup](#local-kubernetes-setup)
4. [Building Container Images](#building-container-images)
5. [Deploying to Local Kubernetes](#deploying-to-local-kubernetes)
6. [Understanding Your Deployment](#understanding-your-deployment)
7. [Common Kubernetes Commands](#common-kubernetes-commands)
8. [Troubleshooting](#troubleshooting)
9. [Preparing for Azure Deployment](#preparing-for-azure-deployment)

---

## 🛠️ Prerequisites & Setup

### 1. Install Docker Desktop
- Download from [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- Enable Kubernetes in Docker Desktop settings
- Allocate at least 4GB RAM to Docker

### 2. Install kubectl (Kubernetes CLI)
```powershell
# Install using Chocolatey (recommended)
choco install kubernetes-cli

# Or download directly
curl.exe -LO "https://dl.k8s.io/release/v1.28.0/bin/windows/amd64/kubectl.exe"
```

### 3. Verify Installation
```powershell
# Check Docker
docker --version

# Check Kubernetes
kubectl version --client

# Check if Kubernetes is running
kubectl cluster-info
```

---

## 🎓 Kubernetes Concepts

### Key Components You'll Learn:

1. **Pod** - Smallest deployable unit (contains your app containers)
2. **Deployment** - Manages pods and ensures desired state
3. **Service** - Network access to pods
4. **ConfigMap** - Configuration data
5. **Secret** - Sensitive data (passwords, keys)
6. **Namespace** - Virtual cluster for organization
7. **Ingress** - External access routing
8. **Persistent Volume** - Storage for data

### Architecture Overview:
```
┌─────────────────────────────────────────────────────────────┐
│                    Kubernetes Cluster                       │
├─────────────────────────────────────────────────────────────┤
│  Namespace: smart-waste                                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   Frontend  │  │   Backend   │  │  Database   │         │
│  │    Pod      │  │    Pod      │  │    Pod      │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│         │                │                │                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │  Service    │  │  Service    │  │  Service    │         │
│  │ (ClusterIP) │  │ (ClusterIP) │  │ (ClusterIP) │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│         │                                                  │
│  ┌─────────────┐                                           │
│  │   Ingress   │ ← External Access                        │
│  │ Controller  │                                           │
│  └─────────────┘                                           │
└─────────────────────────────────────────────────────────────┘
```

---

## 🏠 Local Kubernetes Setup

### Step 1: Enable Kubernetes in Docker Desktop
1. Open Docker Desktop
2. Go to Settings → Kubernetes
3. Check "Enable Kubernetes"
4. Click "Apply & Restart"
5. Wait for Kubernetes to start (green indicator)

### Step 2: Verify Cluster
```powershell
# Check cluster status
kubectl cluster-info

# View nodes
kubectl get nodes

# Should show something like:
# NAME             STATUS   ROLES           AGE   VERSION
# docker-desktop   Ready    control-plane   1d    v1.28.2
```

---

## 🐳 Building Container Images

Since we're running locally, we need to build images that Kubernetes can access.

### Step 1: Build Backend Image
```powershell
# Navigate to project root
cd C:\Users\dilan\Projact\smart-waste-management

# Build backend image
docker build -t smart-waste-backend:local ./backend

# Verify image
docker images | findstr smart-waste-backend
```

### Step 2: Build Frontend Image
```powershell
# Build frontend image
docker build -t smart-waste-frontend:local ./frontend

# Verify image
docker images | findstr smart-waste-frontend
```

### Step 3: Load Images into Kubernetes (for Docker Desktop)
```powershell
# For Docker Desktop, images are automatically available
# For other local Kubernetes (like minikube), you'd need:
# minikube image load smart-waste-backend:local
# minikube image load smart-waste-frontend:local
```

---

## 🚀 Deploying to Local Kubernetes

### Step 1: Create Namespace and Configuration
```powershell
# Apply namespace and config
kubectl apply -f k8s/namespace-config.yaml

# Verify namespace creation
kubectl get namespaces
kubectl get configmaps -n smart-waste
kubectl get secrets -n smart-waste
```

### Step 2: Deploy Database Layer
```powershell
# Deploy MongoDB and Redis
kubectl apply -f k8s/database.yaml

# Check deployments
kubectl get deployments -n smart-waste
kubectl get pods -n smart-waste

# Wait for pods to be ready
kubectl wait --for=condition=ready pod -l app=mongodb -n smart-waste --timeout=300s
kubectl wait --for=condition=ready pod -l app=redis -n smart-waste --timeout=300s
```

### Step 3: Deploy Application Services
```powershell
# Deploy backend and frontend
kubectl apply -f k8s/deployment.yaml

# Check status
kubectl get deployments -n smart-waste
kubectl get pods -n smart-waste
```

### Step 4: Create Services
```powershell
# Apply services
kubectl apply -f k8s/service.yaml

# Check services
kubectl get services -n smart-waste
```

### Step 5: Setup Ingress (Optional for local)
```powershell
# For local development, you might skip ingress and use port-forwarding instead
# kubectl apply -f k8s/ingress.yaml
```

---

## 🔍 Understanding Your Deployment

### View Everything
```powershell
# See all resources in your namespace
kubectl get all -n smart-waste

# Detailed view
kubectl describe namespace smart-waste
```

### Check Pod Logs
```powershell
# Get pod names
kubectl get pods -n smart-waste

# View logs (replace POD_NAME with actual name)
kubectl logs POD_NAME -n smart-waste

# Follow logs
kubectl logs -f POD_NAME -n smart-waste
```

### Access Your Application
```powershell
# Port forward to access locally
kubectl port-forward service/frontend-service 3000:3000 -n smart-waste

# In another terminal, port forward backend
kubectl port-forward service/backend-service 3001:3001 -n smart-waste

# Now access:
# Frontend: http://localhost:3000
# Backend: http://localhost:3001
```

---

## 📝 Common Kubernetes Commands

### Basic Operations
```powershell
# View resources
kubectl get pods -n smart-waste
kubectl get services -n smart-waste
kubectl get deployments -n smart-waste

# Describe resources (detailed info)
kubectl describe pod POD_NAME -n smart-waste
kubectl describe service SERVICE_NAME -n smart-waste

# Execute commands in pods
kubectl exec -it POD_NAME -n smart-waste -- /bin/bash

# View logs
kubectl logs POD_NAME -n smart-waste
kubectl logs -f POD_NAME -n smart-waste  # follow logs

# Scale deployments
kubectl scale deployment backend --replicas=3 -n smart-waste

# Update deployments
kubectl set image deployment/backend backend=smart-waste-backend:v2 -n smart-waste

# Delete resources
kubectl delete pod POD_NAME -n smart-waste
kubectl delete deployment DEPLOYMENT_NAME -n smart-waste
```

### Resource Monitoring
```powershell
# Watch resources update in real-time
kubectl get pods -n smart-waste -w

# Check resource usage
kubectl top nodes
kubectl top pods -n smart-waste

# View events
kubectl get events -n smart-waste --sort-by=.metadata.creationTimestamp
```

---

## 🔧 Troubleshooting

### Common Issues and Solutions

#### 1. Pods Not Starting
```powershell
# Check pod status
kubectl describe pod POD_NAME -n smart-waste

# Common issues:
# - Image pull errors: Check image names and availability
# - Resource limits: Check if enough CPU/memory
# - Configuration errors: Check ConfigMaps and Secrets
```

#### 2. Services Not Accessible
```powershell
# Check service endpoints
kubectl get endpoints -n smart-waste

# Verify service selector matches pod labels
kubectl get pods -n smart-waste --show-labels
```

#### 3. Database Connection Issues
```powershell
# Check if MongoDB is running
kubectl logs -l app=mongodb -n smart-waste

# Test database connectivity from backend pod
kubectl exec -it BACKEND_POD_NAME -n smart-waste -- npm run test-db
```

### Debugging Commands
```powershell
# Get cluster info
kubectl cluster-info dump

# Check node status
kubectl describe nodes

# View all events
kubectl get events --all-namespaces --sort-by=.metadata.creationTimestamp
```

---

## ☁️ Preparing for Azure Deployment

### Azure Kubernetes Service (AKS) Preparation

#### 1. Install Azure CLI
```powershell
# Install Azure CLI
winget install Microsoft.AzureCLI

# Login to Azure
az login
```

#### 2. Update Kubernetes Manifests for Azure
```yaml
# Update storage class in database.yaml
storageClassName: managed-premium  # Already correct for Azure

# Update ingress for Azure (in ingress.yaml)
metadata:
  annotations:
    kubernetes.io/ingress.class: azure/application-gateway
    # or nginx if using NGINX ingress controller
```

#### 3. Container Registry Setup
```powershell
# Create Azure Container Registry
az acr create --name smartwasteacr --resource-group smart-waste-rg --sku Basic

# Build and push images
az acr build --registry smartwasteacr --image smart-waste-backend:latest ./backend
az acr build --registry smartwasteacr --image smart-waste-frontend:latest ./frontend
```

#### 4. Create AKS Cluster
```powershell
# Create AKS cluster
az aks create \
  --resource-group smart-waste-rg \
  --name smart-waste-aks \
  --node-count 3 \
  --enable-addons monitoring \
  --attach-acr smartwasteacr

# Get credentials
az aks get-credentials --resource-group smart-waste-rg --name smart-waste-aks
```

---

## 🎯 Learning Exercises

### Exercise 1: Scale Your Application
```powershell
# Scale backend to 3 replicas
kubectl scale deployment backend --replicas=3 -n smart-waste

# Watch pods being created
kubectl get pods -n smart-waste -w
```

### Exercise 2: Update Application
```powershell
# Build new image version
docker build -t smart-waste-backend:v2 ./backend

# Update deployment
kubectl set image deployment/backend backend=smart-waste-backend:v2 -n smart-waste

# Watch rollout
kubectl rollout status deployment/backend -n smart-waste
```

### Exercise 3: Explore Configuration
```powershell
# View ConfigMap contents
kubectl get configmap smart-waste-config -n smart-waste -o yaml

# View Secret contents (base64 encoded)
kubectl get secret smart-waste-secrets -n smart-waste -o yaml
```

---

## 📖 Next Steps for Learning

1. **Explore Helm** - Package manager for Kubernetes
2. **Learn about StatefulSets** - For databases that need persistent identity
3. **Study Operators** - Automated management of complex applications
4. **Practice CI/CD** - Automated deployments
5. **Monitor with Prometheus** - Application and cluster monitoring
6. **Implement GitOps** - Git-based deployment workflows

---

## 📚 Additional Resources

- [Kubernetes Official Documentation](https://kubernetes.io/docs/)
- [Azure Kubernetes Service Documentation](https://docs.microsoft.com/en-us/azure/aks/)
- [Kubernetes Learning Path](https://azure.microsoft.com/en-us/resources/kubernetes-learning-path/)
- [kubectl Cheat Sheet](https://kubernetes.io/docs/reference/kubectl/cheatsheet/)

Happy learning! 🎉
