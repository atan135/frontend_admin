# WebSocket Implementation Guide

This document explains how to use WebSocket functionality in the Vue 3 admin management project.

## 🚀 Overview

The WebSocket implementation provides real-time communication between the frontend and backend, enabling features like:
- Real-time notifications
- Live user updates
- System messages
- Connection status monitoring
- Automatic reconnection

## 📁 File Structure

```
src/
├── utils/
│   └── websocket.js          # WebSocket manager utility
├── stores/
│   └── websocket.js          # WebSocket Pinia store
├── components/
│   ├── WebSocketStatus.vue   # Connection status indicator
│   └── NotificationCenter.vue # Real-time notifications
└── layouts/
    └── AdminLayout.vue       # WebSocket integration
```

## 🔧 Configuration

### Environment Variables

Add these to your `.env` file:

```env
# WebSocket Configuration
VITE_WEBSOCKET_URL=ws://localhost:4000/ws
VITE_WEBSOCKET_RECONNECT_ATTEMPTS=5
VITE_WEBSOCKET_RECONNECT_INTERVAL=5000
VITE_WEBSOCKET_HEARTBEAT_INTERVAL=30000
```

### Config File

The WebSocket configuration is defined in `src/config/index.js`:

```javascript
// WebSocket Configuration
WEBSOCKET_URL: import.meta.env.VITE_WEBSOCKET_URL || 'ws://localhost:4000/ws',
WEBSOCKET_RECONNECT_ATTEMPTS: parseInt(import.meta.env.VITE_WEBSOCKET_RECONNECT_ATTEMPTS) || 5,
WEBSOCKET_RECONNECT_INTERVAL: parseInt(import.meta.env.VITE_WEBSOCKET_RECONNECT_INTERVAL) || 5000,
WEBSOCKET_HEARTBEAT_INTERVAL: parseInt(import.meta.env.VITE_WEBSOCKET_HEARTBEAT_INTERVAL) || 30000
```

## 🎯 Usage Examples

### 1. Basic WebSocket Connection

```javascript
import { useWebSocketStore } from '@/stores/websocket'

const wsStore = useWebSocketStore()

// Connect to WebSocket
await wsStore.connect()

// Check connection status
console.log(wsStore.isConnected) // true/false
console.log(wsStore.connectionStatus) // 'connected', 'connecting', 'disconnected'
```

### 2. Sending Messages

```javascript
// Send a custom message
wsStore.sendMessage({
  type: 'custom_message',
  data: { message: 'Hello from client' }
})

// Send user action
wsStore.sendMessage({
  type: 'user_action',
  action: 'page_view',
  page: '/dashboard',
  timestamp: new Date().toISOString()
})
```

### 3. Listening to Events

```javascript
import { websocketManager } from '@/utils/websocket'

// Listen to custom events
websocketManager.on('custom_event', (data) => {
  console.log('Custom event received:', data)
})

// Listen to notifications
websocketManager.on('notification', (notification) => {
  console.log('New notification:', notification)
})
```

### 4. Managing Notifications

```javascript
// Add a notification programmatically
wsStore.addNotification({
  type: 'info',
  title: 'System Update',
  message: 'The system will be updated in 5 minutes'
})

// Mark notification as read
wsStore.markNotificationAsRead(notificationId)

// Mark all notifications as read
wsStore.markAllNotificationsAsRead()

// Clear all notifications
wsStore.clearNotifications()
```

## 🔄 Message Types

### Client to Server Messages

| Type | Description | Example |
|------|-------------|---------|
| `ping` | Heartbeat ping | `{ type: 'ping', timestamp: 1234567890 }` |
| `user_action` | User action tracking | `{ type: 'user_action', action: 'click', target: 'button' }` |
| `custom_message` | Custom application message | `{ type: 'custom_message', data: {...} }` |

### Server to Client Messages

| Type | Description | Example |
|------|-------------|---------|
| `pong` | Heartbeat response | `{ type: 'pong', timestamp: 1234567890 }` |
| `notification` | Real-time notification | `{ type: 'notification', title: 'Alert', message: 'Something happened' }` |
| `user_update` | User data update | `{ type: 'user_update', userId: 123, data: {...} }` |
| `system_message` | System-wide message | `{ type: 'system_message', message: 'System maintenance scheduled' }` |

## 🎨 UI Components

### WebSocket Status Indicator

The `WebSocketStatus` component shows the current connection status:

```vue
<template>
  <WebSocketStatus />
</template>
```

**Status Indicators:**
- 🟢 `WS ✓` - Connected
- 🟡 `WS ⏳` - Connecting
- 🔄 `WS ↻2` - Reconnecting (attempt 2)
- 🔴 `WS ✗` - Disconnected

### Notification Center

The `NotificationCenter` component provides a dropdown with real-time notifications:

```vue
<template>
  <NotificationCenter />
</template>
```

**Features:**
- Real-time notification display
- Unread notification count badge
- Mark as read functionality
- Clear all notifications
- Notification history (last 50)

## 🔧 Backend Integration

### WebSocket Server Setup (Node.js + ws)

```javascript
const WebSocket = require('ws')
const jwt = require('jsonwebtoken')

const wss = new WebSocket.Server({ port: 4000, path: '/ws' })

wss.on('connection', (ws, req) => {
  // Extract token from query string
  const url = new URL(req.url, 'http://localhost:4000')
  const token = url.searchParams.get('token')
  
  // Verify JWT token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    ws.userId = decoded.userId
    ws.isAuthenticated = true
    
    console.log(`User ${decoded.userId} connected`)
  } catch (error) {
    ws.close(1008, 'Invalid token')
    return
  }
  
  // Handle incoming messages
  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data)
      handleMessage(ws, message)
    } catch (error) {
      console.error('Invalid message format:', error)
    }
  })
  
  // Handle disconnection
  ws.on('close', () => {
    console.log(`User ${ws.userId} disconnected`)
  })
})

function handleMessage(ws, message) {
  switch (message.type) {
    case 'ping':
      ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }))
      break
      
    case 'user_action':
      console.log('User action:', message)
      // Log user action to database
      break
      
    default:
      console.log('Unknown message type:', message.type)
  }
}

// Send notification to specific user
function sendNotificationToUser(userId, notification) {
  wss.clients.forEach(client => {
    if (client.isAuthenticated && client.userId === userId) {
      client.send(JSON.stringify({
        type: 'notification',
        ...notification
      }))
    }
  })
}

// Send system message to all users
function sendSystemMessage(message) {
  wss.clients.forEach(client => {
    if (client.isAuthenticated) {
      client.send(JSON.stringify({
        type: 'system_message',
        message: message
      }))
    }
  })
}
```

## 🚨 Error Handling

### Connection Errors

The WebSocket implementation includes comprehensive error handling:

```javascript
// Connection failed
websocketManager.on('error', (error) => {
  console.error('WebSocket error:', error)
  // Handle connection error
})

// Connection lost
websocketManager.on('disconnected', (event) => {
  console.log('WebSocket disconnected:', event.code, event.reason)
  // Handle disconnection
})
```

### Automatic Reconnection

- **Max Attempts**: 5 reconnection attempts
- **Backoff Strategy**: Exponential backoff (5s, 10s, 20s, 40s, 80s)
- **Manual Override**: Can be disabled by calling `disconnect()`

## 📊 Monitoring and Debugging

### Connection Status

```javascript
// Get detailed connection status
const status = websocketManager.getStatus()
console.log(status)
// {
//   connected: true,
//   connecting: false,
//   reconnectAttempts: 0,
//   readyState: 1
// }
```

### Logging

All WebSocket events are logged using the project's logger:

```javascript
import { logger } from '@/utils/logger'

// WebSocket events are automatically logged
// Check browser console or LogViewer component
```

## 🔒 Security Considerations

1. **Authentication**: WebSocket connections require valid JWT tokens
2. **Message Validation**: All incoming messages should be validated
3. **Rate Limiting**: Implement rate limiting for message sending
4. **CORS**: Configure CORS properly for WebSocket connections
5. **HTTPS/WSS**: Use secure WebSocket (WSS) in production

## 🎯 Best Practices

1. **Connection Management**: Always clean up listeners on component unmount
2. **Error Handling**: Implement proper error handling for all WebSocket operations
3. **Message Queuing**: Queue messages when disconnected and send when reconnected
4. **Heartbeat**: Use heartbeat to detect connection issues early
5. **Reconnection**: Implement exponential backoff for reconnection attempts

## 🧪 Testing

### Unit Tests

```javascript
import { WebSocketManager } from '@/utils/websocket'

describe('WebSocketManager', () => {
  let wsManager
  
  beforeEach(() => {
    wsManager = new WebSocketManager()
  })
  
  afterEach(() => {
    wsManager.disconnect()
  })
  
  test('should connect successfully', async () => {
    const result = await wsManager.connect('valid-token')
    expect(result).toBe(true)
  })
  
  test('should handle connection errors', async () => {
    const result = await wsManager.connect('invalid-token')
    expect(result).toBe(false)
  })
})
```

### Integration Tests

```javascript
// Test WebSocket store integration
import { useWebSocketStore } from '@/stores/websocket'

test('should manage notifications', () => {
  const wsStore = useWebSocketStore()
  
  wsStore.addNotification({
    type: 'info',
    title: 'Test',
    message: 'Test message'
  })
  
  expect(wsStore.notifications).toHaveLength(1)
  expect(wsStore.unreadNotifications).toBe(1)
})
```

## 📝 Troubleshooting

### Common Issues

1. **Connection Failed**: Check WebSocket URL and server availability
2. **Authentication Error**: Verify JWT token is valid and not expired
3. **Reconnection Loop**: Check network stability and server configuration
4. **Message Not Received**: Verify message format and event listeners

### Debug Mode

Enable debug logging by setting the log level to 'debug' in your environment:

```env
VITE_LOG_LEVEL=debug
```

This will show detailed WebSocket communication logs in the browser console.
