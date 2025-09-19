// Socket.IO Management Utility

import { io } from 'socket.io-client'
import { logger } from './logger'
import { useAuthStore } from '@/stores/auth'
import { config } from '@/config'

class SocketIOManager {
    constructor() {
        this.socket = null
        this.isConnecting = false
        this.isManualClose = false
        this.listeners = new Map()
        this.messageQueue = []
        this.reconnectAttempts = 0
        this.maxReconnectAttempts = 5

        // Socket.IO configuration
        this.config = {
            url: config.SOCKETIO_URL || 'http://localhost:4000',
            options: {
                transports: ['websocket', 'polling'],
                timeout: 10000,
                reconnection: true,
                reconnectionAttempts: this.maxReconnectAttempts,
                reconnectionDelay: 1000,
                reconnectionDelayMax: 5000,
                maxReconnectionAttempts: this.maxReconnectAttempts,
                forceNew: true,
                autoConnect: false
            }
        }
    }

    /**
     * Connect to Socket.IO server
     * @param {string} token - JWT token for authentication
     * @returns {Promise<boolean>} Connection success
     */
    async connect(token = null) {
        if (this.socket && this.socket.connected) {
            logger.info('Socket.IO already connected')
            return true
        }

        if (this.isConnecting) {
            logger.warn('Socket.IO connection already in progress')
            return false
        }

        try {
            this.isConnecting = true
            this.isManualClose = false

            // Get token from auth store if not provided
            if (!token) {
                const authStore = useAuthStore()
                token = authStore.token
            }

            if (!token) {
                logger.warn('No authentication token available for Socket.IO connection')
                return false
            }

            // Disconnect existing socket if any
            if (this.socket) {
                this.socket.disconnect()
                this.socket = null
            }

            // Build Socket.IO URL with token
            const socketUrl = `${this.config.url}?token=${encodeURIComponent(token)}`

            logger.info('Connecting to Socket.IO:', socketUrl)

            // Create Socket.IO instance
            this.socket = io(socketUrl, {
                ...this.config.options,
                auth: {
                    token: token
                }
            })

            return new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                    reject(new Error('Socket.IO connection timeout'))
                }, this.config.options.timeout)

                this.socket.on('connect', () => {
                    clearTimeout(timeout)
                    this.isConnecting = false
                    this.reconnectAttempts = 0

                    logger.info('Socket.IO connected successfully')
                    this.setupEventListeners()
                    this.processMessageQueue()

                    // Emit connection event
                    this.emit('connected', { id: this.socket.id })
                    resolve(true)
                })

                this.socket.on('connect_error', (error) => {
                    clearTimeout(timeout)
                    this.isConnecting = false

                    logger.error('Socket.IO connection error:', error)
                    this.emit('error', error)
                    reject(error)
                })

                this.socket.on('disconnect', (reason) => {
                    clearTimeout(timeout)
                    this.isConnecting = false

                    logger.info('Socket.IO disconnected:', reason)
                    this.emit('disconnected', { reason })

                    // Auto-reconnect is handled by Socket.IO automatically
                    if (reason === 'io server disconnect') {
                        // Server initiated disconnect, don't reconnect
                        this.isManualClose = true
                    }
                })

                this.socket.on('reconnect', (attemptNumber) => {
                    logger.info(`Socket.IO reconnected after ${attemptNumber} attempts`)
                    this.reconnectAttempts = attemptNumber
                    this.emit('reconnected', { attemptNumber })
                })

                this.socket.on('reconnect_attempt', (attemptNumber) => {
                    logger.info(`Socket.IO reconnection attempt ${attemptNumber}`)
                    this.reconnectAttempts = attemptNumber
                    this.emit('reconnect_attempt', { attemptNumber })
                })

                this.socket.on('reconnect_error', (error) => {
                    logger.error('Socket.IO reconnection error:', error)
                    this.emit('reconnect_error', error)
                })

                this.socket.on('reconnect_failed', () => {
                    logger.error('Socket.IO reconnection failed')
                    this.emit('reconnect_failed')
                })

                // Connect the socket
                this.socket.connect()
            })
        } catch (error) {
            this.isConnecting = false
            logger.error('Socket.IO connection failed:', error)
            return false
        }
    }

    /**
     * Disconnect from Socket.IO server
     */
    disconnect() {
        this.isManualClose = true

        if (this.socket) {
            this.socket.disconnect()
            this.socket = null
        }

        logger.info('Socket.IO disconnected manually')
    }

    /**
     * Send message to Socket.IO server
     * @param {string} event - Event name
     * @param {Object} data - Data to send
     * @param {Function} callback - Optional callback
     * @returns {boolean} Send success
     */
    emit(event, data, callback = null) {
        if (!this.socket || !this.socket.connected) {
            logger.warn('Socket.IO not connected, queuing message:', { event, data })
            this.messageQueue.push({ event, data, callback })
            return false
        }

        try {
            this.socket.emit(event, data, callback)
            logger.debug('Socket.IO message sent:', { event, data })
            return true
        } catch (error) {
            logger.error('Failed to send Socket.IO message:', error)
            return false
        }
    }

    /**
     * Send message with acknowledgment
     * @param {string} event - Event name
     * @param {Object} data - Data to send
     * @returns {Promise} Promise that resolves with server response
     */
    emitWithAck(event, data) {
        return new Promise((resolve, reject) => {
            if (!this.socket || !this.socket.connected) {
                reject(new Error('Socket.IO not connected'))
                return
            }

            this.socket.emit(event, data, (response) => {
                if (response && response.error) {
                    reject(new Error(response.error))
                } else {
                    resolve(response)
                }
            })
        })
    }

    /**
     * Subscribe to Socket.IO events
     * @param {string} event - Event name
     * @param {Function} callback - Event callback
     */
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, [])
        }
        this.listeners.get(event).push(callback)

        // Also listen to the actual socket event
        if (this.socket) {
            this.socket.on(event, callback)
        }
    }

    /**
     * Unsubscribe from Socket.IO events
     * @param {string} event - Event name
     * @param {Function} callback - Event callback
     */
    off(event, callback) {
        if (!this.listeners.has(event)) return

        const callbacks = this.listeners.get(event)
        const index = callbacks.indexOf(callback)
        if (index > -1) {
            callbacks.splice(index, 1)
        }

        // Also remove from actual socket
        if (this.socket) {
            this.socket.off(event, callback)
        }
    }

    /**
     * Emit event to listeners
     * @param {string} event - Event name
     * @param {*} data - Event data
     */
    emitToListeners(event, data) {
        if (!this.listeners.has(event)) return

        const callbacks = this.listeners.get(event)
        callbacks.forEach(callback => {
            try {
                callback(data)
            } catch (error) {
                logger.error('Socket.IO event callback error:', error)
            }
        })
    }

    /**
     * Setup Socket.IO event listeners
     */
    setupEventListeners() {
        if (!this.socket) return

        // Handle different message types
        this.socket.on('ping', (data) => {
            this.handlePing(data)
        })

        this.socket.on('pong', (data) => {
            this.handlePong(data)
        })

        this.socket.on('notification', (data) => {
            this.handleNotification(data)
        })

        this.socket.on('user_update', (data) => {
            this.handleUserUpdate(data)
        })

        this.socket.on('system_message', (data) => {
            this.handleSystemMessage(data)
        })

        this.socket.on('message', (data) => {
            this.emitToListeners('message', data)
        })

        // Handle custom events
        this.socket.onAny((eventName, ...args) => {
            logger.debug('Socket.IO event received:', eventName, args)
            this.emitToListeners(eventName, args[0])
        })
    }

    /**
     * Handle ping message
     * @param {Object} data - Ping data
     */
    handlePing(data) {
        this.emit('pong', { timestamp: Date.now() })
    }

    /**
     * Handle pong message
     * @param {Object} data - Pong data
     */
    handlePong(data) {
        logger.debug('Socket.IO pong received')
    }

    /**
     * Handle notification message
     * @param {Object} data - Notification data
     */
    handleNotification(data) {
        this.emitToListeners('notification', data)
    }

    /**
     * Handle user update message
     * @param {Object} data - User update data
     */
    handleUserUpdate(data) {
        this.emitToListeners('user_update', data)
    }

    /**
     * Handle system message
     * @param {Object} data - System message data
     */
    handleSystemMessage(data) {
        this.emitToListeners('system_message', data)
    }

    /**
     * Process queued messages
     */
    processMessageQueue() {
        while (this.messageQueue.length > 0) {
            const { event, data, callback } = this.messageQueue.shift()
            this.emit(event, data, callback)
        }
    }

    /**
     * Join a room
     * @param {string} room - Room name
     * @param {Function} callback - Optional callback
     */
    joinRoom(room, callback = null) {
        this.emit('join_room', { room }, callback)
    }

    /**
     * Leave a room
     * @param {string} room - Room name
     * @param {Function} callback - Optional callback
     */
    leaveRoom(room, callback = null) {
        this.emit('leave_room', { room }, callback)
    }

    /**
     * Get connection status
     * @returns {Object} Connection status
     */
    getStatus() {
        return {
            connected: this.socket ? this.socket.connected : false,
            connecting: this.isConnecting,
            reconnectAttempts: this.reconnectAttempts,
            id: this.socket ? this.socket.id : null,
            transport: this.socket ? this.socket.io.engine.transport.name : null
        }
    }

    /**
     * Get connection state string
     * @returns {string} Connection state
     */
    getConnectionState() {
        if (!this.socket) return 'disconnected'

        if (this.socket.connected) return 'connected'
        if (this.isConnecting) return 'connecting'
        if (this.socket.disconnected) return 'disconnected'

        return 'unknown'
    }

    /**
     * Get socket ID
     * @returns {string|null} Socket ID
     */
    getSocketId() {
        return this.socket ? this.socket.id : null
    }

    /**
     * Check if socket is connected
     * @returns {boolean} Connection status
     */
    isConnected() {
        return this.socket ? this.socket.connected : false
    }

    /**
     * Get transport type
     * @returns {string|null} Transport type
     */
    getTransport() {
        return this.socket ? this.socket.io.engine.transport.name : null
    }

    /**
     * Force reconnection
     */
    reconnect() {
        if (this.socket) {
            this.socket.disconnect()
            this.socket.connect()
        }
    }

    /**
     * Update authentication token
     * @param {string} token - New JWT token
     */
    updateAuth(token) {
        if (this.socket) {
            this.socket.auth.token = token
        }
    }
}

// Create singleton instance
export const socketIOManager = new SocketIOManager()

// Export the class for testing
export { SocketIOManager }

// For backward compatibility, export as websocketManager
export const websocketManager = socketIOManager