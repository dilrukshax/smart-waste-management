# 🚀 Quick Start: Kubernetes Local Deployment

## ⚡ Get Started in 5 Minutes

### Step 1: Prerequisites Check
```powershell
# Run this to check if everything is ready
.\deploy-k8s.ps1 -Help
```

### Step 2: Build Images
```powershell
# Build Docker images for Kubernetes
.\deploy-k8s.ps1 -BuildImages
```

### Step 3: Deploy to Kubernetes
```powershell
# Deploy everything to Kubernetes
.\deploy-k8s.ps1 -Deploy
```

### Step 4: Check Status
```powershell
# See what's running
.\deploy-k8s.ps1 -Status
```

### Step 5: Access Your Application
```powershell
# Option 1: Direct NodePort access
# Open browser to: http://localhost:30000

# Option 2: Port forwarding
kubectl port-forward service/frontend-service 3000:3000 -n smart-waste
kubectl port-forward service/backend-service 3001:3001 -n smart-waste
# Then access: http://localhost:3000
```

---

## 🎓 Learning Commands

### Basic Kubernetes Commands to Try
```powershell
# View all resources
kubectl get all -n smart-waste

# Watch pods in real-time
kubectl get pods -n smart-waste -w

# Check pod logs
kubectl logs -l app=backend -n smart-waste

# Execute commands in a pod
kubectl exec -it deployment/backend -n smart-waste -- /bin/bash

# Scale your application
kubectl scale deployment backend --replicas=3 -n smart-waste

# View resource usage
kubectl top pods -n smart-waste
```

### Debugging Commands
```powershell
# Describe a problematic pod
kubectl describe pod POD_NAME -n smart-waste

# View events
kubectl get events -n smart-waste --sort-by=.metadata.creationTimestamp

# Check service endpoints
kubectl get endpoints -n smart-waste
```

---

## 🔧 Configuration Learning

### View ConfigMaps and Secrets
```powershell
# See configuration
kubectl get configmap smart-waste-config -n smart-waste -o yaml

# See secrets (base64 encoded)
kubectl get secret smart-waste-secrets -n smart-waste -o yaml

# Decode a secret
kubectl get secret smart-waste-secrets -n smart-waste -o jsonpath='{.data.jwt-secret}' | base64 --decode
```

### Modify Configuration
```powershell
# Edit ConfigMap
kubectl edit configmap smart-waste-config -n smart-waste

# Edit Secret
kubectl edit secret smart-waste-secrets -n smart-waste

# Restart deployment to pick up changes
kubectl rollout restart deployment/backend -n smart-waste
```

---

## 🌐 Access Methods Explained

### 1. NodePort (Simplest)
- Direct access via `localhost:30000`
- No additional setup needed
- Good for development

### 2. Port Forwarding (Most Common)
```powershell
kubectl port-forward service/frontend-service 3000:3000 -n smart-waste
```
- Access via `localhost:3000`
- Secure tunnel to your pod
- Good for debugging

### 3. LoadBalancer (Production-like)
```powershell
kubectl get service frontend-loadbalancer -n smart-waste
```
- External IP provided by Docker Desktop
- Most production-like setup

---

## 🧹 Cleanup When Done
```powershell
# Remove everything
.\deploy-k8s.ps1 -Clean

# Or manually:
kubectl delete namespace smart-waste
```

---

## 📚 What You're Learning

### Kubernetes Concepts in Action:
1. **Namespaces** - Organizing resources
2. **Deployments** - Managing application instances
3. **Services** - Network access to pods
4. **ConfigMaps** - Configuration management
5. **Secrets** - Secure data storage
6. **Persistent Volumes** - Data storage
7. **Probes** - Health checking

### Real-world Skills:
- Container orchestration
- Service discovery
- Load balancing
- Rolling updates
- Resource management
- Configuration management

---

## 🎯 Next Steps for Azure

Once comfortable with local Kubernetes:

1. **Create Azure Container Registry**
```powershell
az acr create --name smartwasteacr --resource-group rg --sku Basic
```

2. **Push Images to ACR**
```powershell
az acr build --registry smartwasteacr --image smart-waste-backend:v1 ./backend
az acr build --registry smartwasteacr --image smart-waste-frontend:v1 ./frontend
```

3. **Create AKS Cluster**
```powershell
az aks create --name smart-waste-aks --resource-group rg --attach-acr smartwasteacr
```

4. **Deploy to AKS**
```powershell
az aks get-credentials --name smart-waste-aks --resource-group rg
kubectl apply -f k8s/
```

Happy learning! 🎉
