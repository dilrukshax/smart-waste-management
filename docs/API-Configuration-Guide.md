# API Configuration Guide

This guide explains how to use the centralized API configuration in the Smart Waste Management frontend application.

## 📁 File Structure

```
frontend/
├── src/
│   ├── config/
│   │   └── api.js          # Centralized API configuration
│   └── pages/
│       ├── Login.js        # Updated to use API_CONFIG
│       ├── Register.js     # Updated to use API_CONFIG
│       └── ...
├── .env.local              # Local development environment
├── .env.development        # Development environment
├── .env.production         # Production environment
└── .env.example            # Example environment file
```

## 🔧 Configuration Files

### 1. API Configuration (`src/config/api.js`)

This file centralizes all API endpoints and provides a single point of configuration.

```javascript
import { API_CONFIG } from '../config/api';

// Instead of:
const response = await axios.get('http://localhost:3001/api/auth/profile');

// Use:
const response = await axios.get(API_CONFIG.AUTH.PROFILE);
```

### 2. Environment Variables

The API base URL is controlled by the `REACT_APP_API_URL` environment variable:

- **Local Development**: `http://localhost:3001`
- **Production**: `https://your-production-api.com`
- **Staging**: `https://staging-api.com`

## 📝 Available API Endpoints

### Authentication
- `API_CONFIG.AUTH.LOGIN`
- `API_CONFIG.AUTH.REGISTER`
- `API_CONFIG.AUTH.PROFILE`
- `API_CONFIG.AUTH.GARBAGE_COLLECTORS`

### Requests
- `API_CONFIG.REQUEST.CREATE`
- `API_CONFIG.REQUEST.USER_REQUESTS`
- `API_CONFIG.REQUEST.BY_ID(id)`
- `API_CONFIG.REQUEST.ADMIN_REQUESTS`
- `API_CONFIG.REQUEST.ASSIGN(requestId)`
- `API_CONFIG.REQUEST.COLLECTOR_ASSIGNED`
- `API_CONFIG.REQUEST.COLLECTOR_COMPLETE(requestId)`

### User Management
- `API_CONFIG.USER.INVOICES`

### Admin
- `API_CONFIG.ADMIN.USERS`
- `API_CONFIG.ADMIN.ASSIGN_COLLECTOR`
- `API_CONFIG.ADMIN.GENERATE_INVOICE(userId)`
- `API_CONFIG.ADMIN.REQUESTS_PER_MONTH`
- `API_CONFIG.ADMIN.GARBAGE_STATS`
- `API_CONFIG.ADMIN.GARBAGE_CATEGORY_COUNT`
- `API_CONFIG.ADMIN.COLLECTOR_ASSIGNMENTS`

### Collectors
- `API_CONFIG.COLLECTOR.COLLECT_GARBAGE(userId)`
- `API_CONFIG.COLLECTOR.ASSIGNED_USERS`

### Payments
- `API_CONFIG.STRIPE.CREATE_PAYMENT_INTENT`

### Invoices
- `API_CONFIG.INVOICE.BY_ID(id)`

## 🚀 Deployment Guide

### For Different Environments

1. **Local Development**
   ```bash
   # No configuration needed - uses .env.local or defaults to localhost:3001
   npm start
   ```

2. **Development/Staging Deployment**
   ```bash
   # Set environment variable
   export REACT_APP_API_URL=https://dev-api.yourapp.com
   npm run build
   ```

3. **Production Deployment**
   ```bash
   # Set environment variable
   export REACT_APP_API_URL=https://api.yourapp.com
   npm run build
   ```

### For Azure Deployment

If deploying to Azure App Service, set the environment variable in the Azure portal:

1. Go to your App Service
2. Navigate to **Configuration** > **Application Settings**
3. Add new setting:
   - **Name**: `REACT_APP_API_URL`
   - **Value**: `https://your-backend-app.azurewebsites.net`

### For Docker Deployment

Update your `docker-compose.yaml`:

```yaml
frontend:
  build: ./frontend
  ports:
    - "3000:3000"
  environment:
    - REACT_APP_API_URL=http://backend:3001  # For internal Docker network
    # OR for external access:
    - REACT_APP_API_URL=https://your-production-api.com
```

## 🔄 Migration from Hardcoded URLs

If you have existing files with hardcoded URLs, follow these steps:

1. **Add the import**:
   ```javascript
   import { API_CONFIG } from '../config/api';
   ```

2. **Replace hardcoded URLs**:
   ```javascript
   // Before:
   axios.get('http://localhost:3001/api/auth/profile')
   
   // After:
   axios.get(API_CONFIG.AUTH.PROFILE)
   ```

3. **For dynamic URLs**:
   ```javascript
   // Before:
   axios.get(`http://localhost:3001/api/request/${id}`)
   
   // After:
   axios.get(API_CONFIG.REQUEST.BY_ID(id))
   ```

## 🛠️ Helper Functions

The API configuration also provides helper functions:

```javascript
import { getApiBaseUrl, buildApiUrl } from '../config/api';

// Get the current base URL
const baseUrl = getApiBaseUrl(); // Returns: http://localhost:3001

// Build a custom API URL
const customUrl = buildApiUrl('/api/custom/endpoint');
```

## 📦 Benefits

1. **Environment Management**: Easy switching between development and production
2. **Maintainability**: Single point of configuration for all API endpoints
3. **Type Safety**: Centralized endpoint definitions prevent typos
4. **Scalability**: Easy to add new endpoints or modify existing ones
5. **Deployment Flexibility**: Works with any hosting platform

## 🔍 Troubleshooting

### Common Issues

1. **API calls failing after deployment**
   - Check that `REACT_APP_API_URL` is set correctly
   - Verify the environment variable is accessible in your deployment platform

2. **CORS errors**
   - Ensure your backend allows requests from your frontend domain
   - Update CORS configuration in your backend server

3. **Environment variables not loading**
   - Restart your development server after changing `.env` files
   - Verify environment variable names start with `REACT_APP_`

### Verification

To verify your configuration is working:

```javascript
// Add this to any component to check the current API URL
console.log('API Base URL:', getApiBaseUrl());
```

## 🎯 Best Practices

1. **Never commit** `.env.local` or `.env.production` with sensitive data
2. **Use `.env.example`** to document required environment variables
3. **Test deployments** with different API URLs before going live
4. **Monitor API calls** in browser DevTools to verify correct URLs are being used
5. **Use TypeScript** for better type safety with API configurations
