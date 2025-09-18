# Configuration Guide

## Environment Variables

Create a `.env` file in the project root with the following variables:

```env
# Application Configuration
VITE_APP_TITLE=Vue3 Admin Management
VITE_APP_VERSION=1.0.0

# API Configuration
# For development with proxy (default)
VITE_API_BASE_URL=/api

# For production or direct API access
# VITE_API_BASE_URL=http://localhost:4000/api

# For different environments
# VITE_API_BASE_URL=https://api.yourdomain.com/api
```

## Proxy Configuration

The Vite development server is configured to proxy all `/api` requests to `http://localhost:4000`.

### How it works:
- Frontend runs on `http://localhost:3000`
- All requests to `/api/*` are automatically proxied to `http://localhost:4000/api/*`
- This allows seamless development without CORS issues

### Proxy Features:
- **Change Origin**: Changes the origin header to match the target
- **Secure**: Disabled for HTTP development
- **Logging**: Console logs for proxy requests and responses
- **Error Handling**: Logs proxy errors for debugging

## Backend Server Setup

Your backend server should run on port 4000 and handle the following endpoints:

### Authentication Endpoints:
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/user` - Get current user info
- `POST /api/auth/refresh` - Refresh token

### User Management Endpoints:
- `GET /api/users` - Get user list (with pagination, search, filters)
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `DELETE /api/users/batch` - Batch delete users

## Development Workflow

1. **Start Backend Server** (port 4000):
   ```bash
   # Your backend server should run on port 4000
   npm start  # or your backend start command
   ```

2. **Start Frontend Development Server** (port 3000):
   ```bash
   npm run dev
   ```

3. **Access Application**:
   - Frontend: `http://localhost:3000`
   - API calls automatically proxied to backend

## Production Configuration

For production, update the `VITE_API_BASE_URL` to point to your production API:

```env
VITE_API_BASE_URL=https://api.yourdomain.com/api
```

## Troubleshooting

### Proxy Not Working:
- Ensure backend server is running on port 4000
- Check console for proxy error messages
- Verify API endpoints match the expected format

### CORS Issues:
- The proxy should handle CORS automatically
- If issues persist, check backend CORS configuration

### Port Conflicts:
- Backend must run on port 4000
- Frontend will use port 3000 (or next available)
- Check terminal output for actual ports used
