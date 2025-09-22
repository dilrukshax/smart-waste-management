# 🚀 Smart Waste Management - Kubernetes Local Deployment Script
# This script will guide you through deploying your application to local Kubernetes

param(
    [switch]$BuildImages,
    [switch]$Deploy,
    [switch]$Clean,
    [switch]$Status,
    [switch]$Help
)

function Show-Help {
    Write-Host "🚀 Smart Waste Management - Kubernetes Deployment Helper" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Usage:" -ForegroundColor Yellow
    Write-Host "  .\deploy-k8s.ps1 -BuildImages    # Build Docker images"
    Write-Host "  .\deploy-k8s.ps1 -Deploy        # Deploy to Kubernetes"
    Write-Host "  .\deploy-k8s.ps1 -Status        # Check deployment status"
    Write-Host "  .\deploy-k8s.ps1 -Clean         # Clean up resources"
    Write-Host "  .\deploy-k8s.ps1 -Help          # Show this help"
    Write-Host ""
    Write-Host "Examples:" -ForegroundColor Yellow
    Write-Host "  # Full deployment from scratch:"
    Write-Host "  .\deploy-k8s.ps1 -BuildImages"
    Write-Host "  .\deploy-k8s.ps1 -Deploy"
    Write-Host ""
    Write-Host "Prerequisites:" -ForegroundColor Green
    Write-Host "  ✓ Docker Desktop with Kubernetes enabled"
    Write-Host "  ✓ kubectl installed and configured"
    Write-Host "  ✓ PowerShell 5.1 or later"
}

function Test-Prerequisites {
    Write-Host "🔍 Checking prerequisites..." -ForegroundColor Yellow
    
    # Check Docker
    try {
        $dockerVersion = docker --version
        Write-Host "✓ Docker: $dockerVersion" -ForegroundColor Green
    } catch {
        Write-Host "✗ Docker not found. Please install Docker Desktop." -ForegroundColor Red
        return $false
    }
    
    # Check kubectl
    try {
        $kubectlVersion = kubectl version --client --short 2>$null
        Write-Host "✓ kubectl: $kubectlVersion" -ForegroundColor Green
    } catch {
        Write-Host "✗ kubectl not found. Please install kubectl." -ForegroundColor Red
        return $false
    }
    
    # Check Kubernetes cluster
    try {
        $clusterInfo = kubectl cluster-info 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✓ Kubernetes cluster is accessible" -ForegroundColor Green
        } else {
            throw "Cluster not accessible"
        }
    } catch {
        Write-Host "✗ Kubernetes cluster not accessible. Please enable Kubernetes in Docker Desktop." -ForegroundColor Red
        return $false
    }
    
    return $true
}

function Build-Images {
    Write-Host "🏗️  Building Docker images..." -ForegroundColor Yellow
    
    # Build backend image
    Write-Host "Building backend image..." -ForegroundColor Cyan
    docker build -t smart-waste-backend:local ./backend
    if ($LASTEXITCODE -ne 0) {
        Write-Host "✗ Failed to build backend image" -ForegroundColor Red
        return $false
    }
    Write-Host "✓ Backend image built successfully" -ForegroundColor Green
    
    # Build frontend image
    Write-Host "Building frontend image..." -ForegroundColor Cyan
    docker build -t smart-waste-frontend:local ./frontend
    if ($LASTEXITCODE -ne 0) {
        Write-Host "✗ Failed to build frontend image" -ForegroundColor Red
        return $false
    }
    Write-Host "✓ Frontend image built successfully" -ForegroundColor Green
    
    # Verify images
    Write-Host "📦 Built images:" -ForegroundColor Cyan
    docker images | Select-String "smart-waste"
    
    return $true
}

function Deploy-Application {
    Write-Host "🚀 Deploying to Kubernetes..." -ForegroundColor Yellow
    
    # Apply namespace and configuration
    Write-Host "Creating namespace and configuration..." -ForegroundColor Cyan
    kubectl apply -f k8s/namespace-config.yaml
    if ($LASTEXITCODE -ne 0) {
        Write-Host "✗ Failed to create namespace and configuration" -ForegroundColor Red
        return $false
    }
    
    # Deploy databases
    Write-Host "Deploying databases..." -ForegroundColor Cyan
    kubectl apply -f k8s/local-database.yaml
    if ($LASTEXITCODE -ne 0) {
        Write-Host "✗ Failed to deploy databases" -ForegroundColor Red
        return $false
    }
    
    # Wait for databases to be ready
    Write-Host "Waiting for databases to be ready..." -ForegroundColor Cyan
    kubectl wait --for=condition=ready pod -l app=mongodb -n smart-waste --timeout=300s
    kubectl wait --for=condition=ready pod -l app=redis -n smart-waste --timeout=300s
    
    # Deploy applications
    Write-Host "Deploying applications..." -ForegroundColor Cyan
    kubectl apply -f k8s/local-deployment.yaml
    if ($LASTEXITCODE -ne 0) {
        Write-Host "✗ Failed to deploy applications" -ForegroundColor Red
        return $false
    }
    
    # Create services
    Write-Host "Creating services..." -ForegroundColor Cyan
    kubectl apply -f k8s/local-service.yaml
    if ($LASTEXITCODE -ne 0) {
        Write-Host "✗ Failed to create services" -ForegroundColor Red
        return $false
    }
    
    Write-Host "✓ Deployment completed successfully!" -ForegroundColor Green
    
    # Show access instructions
    Write-Host ""
    Write-Host "🌐 Access Instructions:" -ForegroundColor Cyan
    Write-Host "1. Frontend via NodePort: http://localhost:30000"
    Write-Host "2. Frontend via LoadBalancer: Check 'kubectl get svc -n smart-waste' for external IP"
    Write-Host "3. Port forwarding:"
    Write-Host "   kubectl port-forward service/frontend-service 3000:3000 -n smart-waste"
    Write-Host "   kubectl port-forward service/backend-service 3001:3001 -n smart-waste"
    
    return $true
}

function Show-Status {
    Write-Host "📊 Kubernetes Deployment Status" -ForegroundColor Cyan
    Write-Host ""
    
    # Check namespace
    Write-Host "📁 Namespace:" -ForegroundColor Yellow
    kubectl get namespace smart-waste 2>$null
    Write-Host ""
    
    # Check deployments
    Write-Host "🚀 Deployments:" -ForegroundColor Yellow
    kubectl get deployments -n smart-waste
    Write-Host ""
    
    # Check pods
    Write-Host "📦 Pods:" -ForegroundColor Yellow
    kubectl get pods -n smart-waste -o wide
    Write-Host ""
    
    # Check services
    Write-Host "🌐 Services:" -ForegroundColor Yellow
    kubectl get services -n smart-waste
    Write-Host ""
    
    # Check persistent volumes
    Write-Host "💾 Persistent Volumes:" -ForegroundColor Yellow
    kubectl get pvc -n smart-waste
    Write-Host ""
    
    # Check recent events
    Write-Host "📝 Recent Events:" -ForegroundColor Yellow
    kubectl get events -n smart-waste --sort-by=.metadata.creationTimestamp | Select-Object -Last 10
}

function Clean-Resources {
    Write-Host "🧹 Cleaning up Kubernetes resources..." -ForegroundColor Yellow
    
    $confirm = Read-Host "Are you sure you want to delete all resources in the smart-waste namespace? (y/N)"
    if ($confirm -eq 'y' -or $confirm -eq 'Y') {
        kubectl delete namespace smart-waste
        Write-Host "✓ Resources cleaned up successfully" -ForegroundColor Green
    } else {
        Write-Host "Clean up cancelled" -ForegroundColor Yellow
    }
}

# Main script execution
if ($Help) {
    Show-Help
    exit 0
}

if (-not (Test-Prerequisites)) {
    Write-Host "❌ Prerequisites not met. Please fix the issues above and try again." -ForegroundColor Red
    exit 1
}

if ($BuildImages) {
    if (-not (Build-Images)) {
        Write-Host "❌ Image build failed" -ForegroundColor Red
        exit 1
    }
}

if ($Deploy) {
    if (-not (Deploy-Application)) {
        Write-Host "❌ Deployment failed" -ForegroundColor Red
        exit 1
    }
}

if ($Status) {
    Show-Status
}

if ($Clean) {
    Clean-Resources
}

if (-not $BuildImages -and -not $Deploy -and -not $Status -and -not $Clean) {
    Write-Host "No action specified. Use -Help for usage information." -ForegroundColor Yellow
    Show-Help
}
