# CSRF Protection Backend API Documentation

This document outlines the backend API endpoints and implementation required for CSRF protection in the Vue 3 admin management system.

## 🔒 CSRF Token Endpoint

### **GET /api/auth/csrf-token**

**Purpose**: Get a new CSRF token for the current session

**Request**:
```http
GET /api/auth/csrf-token
Authorization: Bearer <jwt_token>
```

**Response**:
```json
{
  "errcode": 0,
  "errmsg": "CSRF token generated successfully",
  "csrfToken": "csrf_abc123def456ghi789jkl012mno345pqr678stu901vwx234yz",
  "expiresAt": "2023-07-01T12:30:00.000Z"
}
```

**Error Response**:
```json
{
  "errcode": 1,
  "errmsg": "Unauthorized - JWT token required"
}
```

## 🛡️ CSRF Middleware Implementation

### **Middleware Function**

```javascript
// Express.js middleware example
const csrfProtection = (req, res, next) => {
  // Skip CSRF check for GET, HEAD, OPTIONS requests
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next()
  }

  // Skip CSRF check for login and register (they don't need CSRF)
  if (req.path === '/api/auth/login' || req.path === '/api/auth/register') {
    return next()
  }

  const csrfToken = req.headers['x-csrf-token']
  const sessionCsrfToken = req.session.csrfToken

  if (!csrfToken) {
    return res.status(403).json({
      errcode: 1,
      errmsg: 'CSRF token required',
      code: 'CSRF_TOKEN_MISSING'
    })
  }

  if (!sessionCsrfToken) {
    return res.status(403).json({
      errcode: 1,
      errmsg: 'No CSRF token in session',
      code: 'CSRF_SESSION_MISSING'
    })
  }

  if (csrfToken !== sessionCsrfToken) {
    return res.status(403).json({
      errcode: 1,
      errmsg: 'Invalid CSRF token',
      code: 'CSRF_TOKEN_INVALID'
    })
  }

  next()
}
```

## 🔄 Session Management

### **Session Storage**

```javascript
// Store CSRF token in session
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}))

// Generate CSRF token
const generateCsrfToken = () => {
  return 'csrf_' + crypto.randomBytes(32).toString('hex')
}

// Set CSRF token in session
app.get('/api/auth/csrf-token', authenticateJWT, (req, res) => {
  const csrfToken = generateCsrfToken()
  req.session.csrfToken = csrfToken
  
  res.json({
    errcode: 0,
    errmsg: 'CSRF token generated successfully',
    csrfToken: csrfToken,
    expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 minutes
  })
})
```

## 🔐 JWT Authentication Middleware

```javascript
const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({
      errcode: 1,
      errmsg: 'Access token required'
    })
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        errcode: 1,
        errmsg: 'Invalid or expired token'
      })
    }

    req.user = user
    next()
  })
}
```

## 📋 Complete Express.js Setup

```javascript
const express = require('express')
const session = require('express-session')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')

const app = express()

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000
  }
}))

// CSRF protection middleware
const csrfProtection = (req, res, next) => {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next()
  }

  if (req.path === '/api/auth/login' || req.path === '/api/auth/register') {
    return next()
  }

  const csrfToken = req.headers['x-csrf-token']
  const sessionCsrfToken = req.session.csrfToken

  if (!csrfToken || !sessionCsrfToken || csrfToken !== sessionCsrfToken) {
    return res.status(403).json({
      errcode: 1,
      errmsg: 'Invalid CSRF token',
      code: 'CSRF_TOKEN_INVALID'
    })
  }

  next()
}

// Apply CSRF protection to all API routes except auth
app.use('/api', (req, res, next) => {
  if (req.path.startsWith('/auth/')) {
    return next()
  }
  csrfProtection(req, res, next)
})

// CSRF token endpoint
app.get('/api/auth/csrf-token', authenticateJWT, (req, res) => {
  const csrfToken = 'csrf_' + crypto.randomBytes(32).toString('hex')
  req.session.csrfToken = csrfToken
  
  res.json({
    errcode: 0,
    errmsg: 'CSRF token generated successfully',
    csrfToken: csrfToken,
    expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString()
  })
})

// Other API routes...
app.post('/api/users', authenticateJWT, csrfProtection, (req, res) => {
  // Protected route that requires both JWT and CSRF
  res.json({ errcode: 0, errmsg: 'User created successfully' })
})
```

## 🚨 Error Handling

### **CSRF Error Codes**

| Code | Message | Description |
|------|---------|-------------|
| `CSRF_TOKEN_MISSING` | CSRF token required | No X-CSRF-Token header provided |
| `CSRF_SESSION_MISSING` | No CSRF token in session | Session doesn't contain CSRF token |
| `CSRF_TOKEN_INVALID` | Invalid CSRF token | Token doesn't match session token |

### **Error Response Format**

```json
{
  "errcode": 1,
  "errmsg": "Invalid CSRF token",
  "code": "CSRF_TOKEN_INVALID",
  "timestamp": "2023-07-01T12:00:00.000Z"
}
```

## 🔧 Testing CSRF Protection

### **Test Valid Request**

```bash
# 1. Login to get JWT token
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password123"}'

# 2. Get CSRF token
curl -X GET http://localhost:4000/api/auth/csrf-token \
  -H "Authorization: Bearer <jwt_token>"

# 3. Make protected request with both tokens
curl -X POST http://localhost:4000/api/users \
  -H "Authorization: Bearer <jwt_token>" \
  -H "X-CSRF-Token: <csrf_token>" \
  -H "Content-Type: application/json" \
  -d '{"username":"newuser","email":"user@example.com"}'
```

### **Test Invalid CSRF Token**

```bash
# This should fail with 403 error
curl -X POST http://localhost:4000/api/users \
  -H "Authorization: Bearer <jwt_token>" \
  -H "X-CSRF-Token: invalid_token" \
  -H "Content-Type: application/json" \
  -d '{"username":"newuser","email":"user@example.com"}'
```

## 📝 Security Considerations

1. **Token Rotation**: Consider rotating CSRF tokens periodically
2. **Session Security**: Use secure session configuration
3. **HTTPS Only**: Use HTTPS in production
4. **Token Expiration**: Implement token expiration
5. **Rate Limiting**: Add rate limiting to CSRF token endpoint
6. **Logging**: Log CSRF token violations for security monitoring

## 🎯 Integration Checklist

- [ ] Implement CSRF token generation endpoint
- [ ] Add CSRF middleware to protected routes
- [ ] Configure session management
- [ ] Add error handling for CSRF violations
- [ ] Test CSRF protection with valid/invalid tokens
- [ ] Add logging for security monitoring
- [ ] Configure HTTPS in production
- [ ] Add rate limiting to CSRF endpoint
