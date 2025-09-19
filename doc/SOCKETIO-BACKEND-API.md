# Socket.IO Backend Implementation Guide

This document provides a complete guide for implementing the Socket.IO backend server to work with the Vue 3 admin management frontend.

## 🚀 Quick Start

### Installation

```bash
npm install socket.io express cors helmet morgan
npm install jsonwebtoken bcryptjs
npm install dotenv
```

### Basic Server Setup

```javascript
const express = require('express')
const http = require('http')
const socketIo = require('socket.io')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const jwt = require('jsonwebtoken')
require('dotenv').config()

const app = express()
const server = http.createServer(app)

// Middleware
app.use(helmet())
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}))
app.use(morgan('combined'))
app.use(express.json())

// Socket.IO setup
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['websocket', 'polling']
})

// JWT verification middleware
const authenticateSocket = (socket, next) => {
  const token = socket.handshake.auth.token || socket.handshake.query.token
  
  if (!token) {
    return next(new Error('Authentication token required'))
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    socket.userId = decoded.userId
    socket.user = decoded
    next()
  } catch (error) {
    next(new Error('Invalid authentication token'))
  }
}

// Apply authentication middleware
io.use(authenticateSocket)

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`User ${socket.userId} connected with socket ${socket.id}`)
  
  // Join user to their personal room
  socket.join(`user_${socket.userId}`)
  
  // Handle different events
  socket.on('ping', (data) => {
    socket.emit('pong', { timestamp: Date.now() })
  })

  socket.on('join_room', (data, callback) => {
    socket.join(data.room)
    console.log(`User ${socket.userId} joined room ${data.room}`)
    if (callback) callback({ success: true, room: data.room })
  })

  socket.on('leave_room', (data, callback) => {
    socket.leave(data.room)
    console.log(`User ${socket.userId} left room ${data.room}`)
    if (callback) callback({ success: true, room: data.room })
  })

  socket.on('user_action', (data) => {
    console.log(`User action from ${socket.userId}:`, data)
    // Log user action to database
    // You can emit to other users if needed
  })

  socket.on('disconnect', (reason) => {
    console.log(`User ${socket.userId} disconnected: ${reason}`)
  })
})

// Start server
const PORT = process.env.PORT || 4000
server.listen(PORT, () => {
  console.log(`Socket.IO server running on port ${PORT}`)
})
```

## 🔧 Advanced Features

### Room Management

```javascript
// Join user to specific rooms based on their role/permissions
io.on('connection', (socket) => {
  const user = socket.user
  
  // Join role-based rooms
  if (user.role === 'admin') {
    socket.join('admins')
    socket.join('all_users')
  } else if (user.role === 'moderator') {
    socket.join('moderators')
    socket.join('all_users')
  } else {
    socket.join('all_users')
  }
  
  // Join department-based rooms
  if (user.department) {
    socket.join(`department_${user.department}`)
  }
})
```

### Broadcasting Messages

```javascript
// Send notification to specific user
function sendNotificationToUser(userId, notification) {
  io.to(`user_${userId}`).emit('notification', {
    type: 'info',
    title: notification.title,
    message: notification.message,
    timestamp: new Date().toISOString()
  })
}

// Send system message to all users
function sendSystemMessage(message) {
  io.to('all_users').emit('system_message', {
    type: 'system',
    message: message,
    timestamp: new Date().toISOString()
  })
}

// Send message to admin users only
function sendAdminMessage(message) {
  io.to('admins').emit('admin_message', {
    type: 'admin',
    message: message,
    timestamp: new Date().toISOString()
  })
}

// Send department-specific message
function sendDepartmentMessage(department, message) {
  io.to(`department_${department}`).emit('department_message', {
    type: 'department',
    department: department,
    message: message,
    timestamp: new Date().toISOString()
  })
}
```

### User Presence Management

```javascript
const connectedUsers = new Map()

io.on('connection', (socket) => {
  const userId = socket.userId
  const userInfo = {
    id: userId,
    socketId: socket.id,
    connectedAt: new Date(),
    lastSeen: new Date()
  }
  
  connectedUsers.set(userId, userInfo)
  
  // Notify other users about user coming online
  socket.broadcast.to('all_users').emit('user_online', {
    userId: userId,
    userInfo: userInfo
  })
  
  // Send current online users to the new connection
  socket.emit('online_users', Array.from(connectedUsers.values()))
  
  socket.on('disconnect', () => {
    connectedUsers.delete(userId)
    
    // Notify other users about user going offline
    socket.broadcast.to('all_users').emit('user_offline', {
      userId: userId
    })
  })
  
  // Update last seen on any activity
  socket.onAny(() => {
    if (connectedUsers.has(userId)) {
      connectedUsers.get(userId).lastSeen = new Date()
    }
  })
})
```

### Message Persistence

```javascript
const Message = require('./models/Message') // Your message model

io.on('connection', (socket) => {
  socket.on('send_message', async (data, callback) => {
    try {
      // Save message to database
      const message = new Message({
        from: socket.userId,
        to: data.to,
        content: data.content,
        type: data.type || 'text',
        timestamp: new Date()
      })
      
      await message.save()
      
      // Emit to recipient
      io.to(`user_${data.to}`).emit('new_message', {
        id: message._id,
        from: socket.userId,
        content: data.content,
        timestamp: message.timestamp
      })
      
      if (callback) callback({ success: true, messageId: message._id })
    } catch (error) {
      if (callback) callback({ success: false, error: error.message })
    }
  })
})
```

### Rate Limiting

```javascript
const rateLimit = require('express-rate-limit')
const socketRateLimit = require('socket.io-rate-limit')

// Express rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
})

app.use('/api', limiter)

// Socket.IO rate limiting
const socketLimiter = socketRateLimit({
  windowMs: 1000, // 1 second
  max: 10, // limit each socket to 10 events per second
  onLimitReached: (socket) => {
    socket.emit('rate_limit_exceeded', {
      message: 'Too many requests, please slow down'
    })
  }
})

io.use(socketLimiter)
```

### Error Handling

```javascript
io.on('connection', (socket) => {
  socket.on('error', (error) => {
    console.error(`Socket error for user ${socket.userId}:`, error)
    socket.emit('error', {
      message: 'An error occurred',
      code: 'SOCKET_ERROR'
    })
  })
  
  // Handle uncaught errors
  socket.onAny((eventName, ...args) => {
    try {
      // Your event handling logic
    } catch (error) {
      console.error(`Error handling event ${eventName}:`, error)
      socket.emit('error', {
        message: 'Event processing failed',
        code: 'EVENT_ERROR'
      })
    }
  })
})
```

## 🔒 Security Features

### Authentication & Authorization

```javascript
const authenticateSocket = (socket, next) => {
  const token = socket.handshake.auth.token || socket.handshake.query.token
  
  if (!token) {
    return next(new Error('Authentication token required'))
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    
    // Check if user is still active
    if (decoded.exp < Date.now() / 1000) {
      return next(new Error('Token expired'))
    }
    
    // Check user permissions
    if (decoded.role === 'banned') {
      return next(new Error('User is banned'))
    }
    
    socket.userId = decoded.userId
    socket.user = decoded
    next()
  } catch (error) {
    next(new Error('Invalid authentication token'))
  }
}
```

### Input Validation

```javascript
const Joi = require('joi')

const messageSchema = Joi.object({
  to: Joi.string().required(),
  content: Joi.string().min(1).max(1000).required(),
  type: Joi.string().valid('text', 'image', 'file').default('text')
})

io.on('connection', (socket) => {
  socket.on('send_message', (data, callback) => {
    const { error, value } = messageSchema.validate(data)
    
    if (error) {
      if (callback) callback({ success: false, error: error.details[0].message })
      return
    }
    
    // Process validated data
    processMessage(socket, value, callback)
  })
})
```

## 📊 Monitoring & Analytics

### Connection Metrics

```javascript
const metrics = {
  totalConnections: 0,
  activeConnections: 0,
  messagesPerSecond: 0,
  errorsPerSecond: 0
}

io.on('connection', (socket) => {
  metrics.totalConnections++
  metrics.activeConnections++
  
  socket.on('disconnect', () => {
    metrics.activeConnections--
  })
})

// Metrics endpoint
app.get('/api/metrics', (req, res) => {
  res.json({
    ...metrics,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    timestamp: new Date().toISOString()
  })
})
```

### Logging

```javascript
const winston = require('winston')

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'socket-errors.log', level: 'error' }),
    new winston.transports.File({ filename: 'socket-combined.log' })
  ]
})

io.on('connection', (socket) => {
  logger.info('User connected', {
    userId: socket.userId,
    socketId: socket.id,
    timestamp: new Date()
  })
  
  socket.on('disconnect', (reason) => {
    logger.info('User disconnected', {
      userId: socket.userId,
      socketId: socket.id,
      reason: reason,
      timestamp: new Date()
    })
  })
})
```

## 🧪 Testing

### Unit Tests

```javascript
const { expect } = require('chai')
const io = require('socket.io-client')
const { createServer } = require('http')

describe('Socket.IO Server', () => {
  let server, clientSocket

  before((done) => {
    server = createServer()
    const io = require('socket.io')(server)
    
    // Setup your server logic here
    
    server.listen(() => {
      const port = server.address().port
      clientSocket = io(`http://localhost:${port}`, {
        auth: { token: 'valid-jwt-token' }
      })
      
      clientSocket.on('connect', done)
    })
  })

  after(() => {
    server.close()
    clientSocket.close()
  })

  it('should connect with valid token', (done) => {
    expect(clientSocket.connected).to.be.true
    done()
  })

  it('should handle ping/pong', (done) => {
    clientSocket.emit('ping', { timestamp: Date.now() })
    
    clientSocket.on('pong', (data) => {
      expect(data).to.have.property('timestamp')
      done()
    })
  })
})
```

## 🚀 Production Deployment

### Environment Variables

```env
NODE_ENV=production
PORT=4000
JWT_SECRET=your-super-secret-jwt-key
FRONTEND_URL=https://your-frontend-domain.com
REDIS_URL=redis://localhost:6379
MONGODB_URI=mongodb://localhost:27017/admin-management
```

### Docker Configuration

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 4000

CMD ["node", "server.js"]
```

### Nginx Configuration

```nginx
upstream socketio {
    server localhost:4000;
}

server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://socketio;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 📝 API Reference

### Client Events (Frontend → Backend)

| Event | Data | Description |
|-------|------|-------------|
| `ping` | `{ timestamp }` | Heartbeat ping |
| `join_room` | `{ room }` | Join a room |
| `leave_room` | `{ room }` | Leave a room |
| `user_action` | `{ action, data }` | User action tracking |
| `send_message` | `{ to, content, type }` | Send a message |

### Server Events (Backend → Frontend)

| Event | Data | Description |
|-------|------|-------------|
| `pong` | `{ timestamp }` | Heartbeat response |
| `notification` | `{ type, title, message }` | Real-time notification |
| `user_update` | `{ userId, data }` | User data update |
| `system_message` | `{ message, type }` | System-wide message |
| `user_online` | `{ userId, userInfo }` | User came online |
| `user_offline` | `{ userId }` | User went offline |

This implementation provides a robust, scalable Socket.IO backend that integrates seamlessly with your Vue 3 frontend!
