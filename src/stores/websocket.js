// WebSocket Store for Real-time Communication

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { socketIOManager } from '@/utils/websocket'
import { logger } from '@/utils/logger'
import { message } from 'ant-design-vue'

export const useWebSocketStore = defineStore('websocket', () => {
    // State
    const isConnected = ref(false)
    const isConnecting = ref(false)
    const reconnectAttempts = ref(0)
    const lastError = ref(null)
    const notifications = ref([])
    const systemMessages = ref([])
    const userUpdates = ref([])
    const connectionState = ref('disconnected')

    // Computed
    const hasNotifications = computed(() => notifications.value.length > 0)
    const unreadNotifications = computed(() =>
        notifications.value.filter(n => !n.read).length
    )
    const connectionStatus = computed(() => {
        if (isConnecting.value) return 'connecting'
        if (isConnected.value) return 'connected'
        if (reconnectAttempts.value > 0) return 'reconnecting'
        return 'disconnected'
    })

    // Actions
    const connect = async () => {
        try {
            isConnecting.value = true
            lastError.value = null

            logger.info('Connecting to Socket.IO...')
            const success = await socketIOManager.connect()

            if (success) {
                isConnected.value = true
                reconnectAttempts.value = 0
                logger.info('Socket.IO connected successfully')
            } else {
                throw new Error('Failed to connect to Socket.IO')
            }
        } catch (error) {
            lastError.value = error.message
            logger.error('Socket.IO connection failed:', error)
            message.error('Failed to connect to real-time service')
        } finally {
            isConnecting.value = false
        }
    }

    const disconnect = () => {
        socketIOManager.disconnect()
        isConnected.value = false
        isConnecting.value = false
        reconnectAttempts.value = 0
        lastError.value = null
        logger.info('Socket.IO disconnected')
    }

    const sendMessage = (event, data) => {
        if (!isConnected.value) {
            logger.warn('Cannot send message: Socket.IO not connected')
            return false
        }

        return socketIOManager.emit(event, data)
    }

    const sendMessageWithAck = async (event, data) => {
        if (!isConnected.value) {
            logger.warn('Cannot send message: Socket.IO not connected')
            throw new Error('Socket.IO not connected')
        }

        return await socketIOManager.emitWithAck(event, data)
    }

    const addNotification = (notification) => {
        const newNotification = {
            id: Date.now() + Math.random(),
            ...notification,
            timestamp: new Date().toISOString(),
            read: false
        }

        notifications.value.unshift(newNotification)

        // Keep only last 50 notifications
        if (notifications.value.length > 50) {
            notifications.value = notifications.value.slice(0, 50)
        }

        logger.info('New notification received:', newNotification)
    }

    const markNotificationAsRead = (notificationId) => {
        const notification = notifications.value.find(n => n.id === notificationId)
        if (notification) {
            notification.read = true
            logger.debug('Notification marked as read:', notificationId)
        }
    }

    const markAllNotificationsAsRead = () => {
        notifications.value.forEach(notification => {
            notification.read = true
        })
        logger.info('All notifications marked as read')
    }

    const clearNotifications = () => {
        notifications.value = []
        logger.info('All notifications cleared')
    }

    const addSystemMessage = (systemMessage) => {
        const newMessage = {
            id: Date.now() + Math.random(),
            ...systemMessage,
            timestamp: new Date().toISOString()
        }

        systemMessages.value.unshift(newMessage)

        // Keep only last 20 system messages
        if (systemMessages.value.length > 20) {
            systemMessages.value = systemMessages.value.slice(0, 20)
        }

        logger.info('New system message received:', newMessage)
    }

    const addUserUpdate = (userUpdate) => {
        const newUpdate = {
            id: Date.now() + Math.random(),
            ...userUpdate,
            timestamp: new Date().toISOString()
        }

        userUpdates.value.unshift(newUpdate)

        // Keep only last 20 user updates
        if (userUpdates.value.length > 20) {
            userUpdates.value = userUpdates.value.slice(0, 20)
        }

        logger.info('New user update received:', newUpdate)
    }

    const updateConnectionState = (state) => {
        connectionState.value = state
        isConnected.value = state === 'connected'
        isConnecting.value = state === 'connecting'
    }

    const updateReconnectAttempts = (attempts) => {
        reconnectAttempts.value = attempts
    }

    const setError = (error) => {
        lastError.value = error
        logger.error('WebSocket error:', error)
    }

    // Initialize Socket.IO event listeners
    const initializeListeners = () => {
        socketIOManager.on('connected', () => {
            updateConnectionState('connected')
            message.success('Real-time connection established')
        })

        socketIOManager.on('disconnected', () => {
            updateConnectionState('disconnected')
            message.warning('Real-time connection lost')
        })

        socketIOManager.on('reconnected', (data) => {
            updateConnectionState('connected')
            updateReconnectAttempts(data.attemptNumber)
            message.success(`Real-time connection restored after ${data.attemptNumber} attempts`)
        })

        socketIOManager.on('reconnect_attempt', (data) => {
            updateReconnectAttempts(data.attemptNumber)
            updateConnectionState('reconnecting')
        })

        socketIOManager.on('reconnect_error', (error) => {
            setError(error.message || 'Socket.IO reconnection error')
        })

        socketIOManager.on('reconnect_failed', () => {
            setError('Socket.IO reconnection failed')
            updateConnectionState('disconnected')
        })

        socketIOManager.on('error', (error) => {
            setError(error.message || 'Socket.IO error')
            updateConnectionState('disconnected')
        })

        socketIOManager.on('notification', (data) => {
            addNotification(data)

            // Show notification message
            if (data.title) {
                message.info({
                    content: data.title,
                    description: data.message,
                    duration: 5
                })
            }
        })

        socketIOManager.on('system_message', (data) => {
            addSystemMessage(data)

            // Show system message
            if (data.message) {
                message.warning({
                    content: 'System Message',
                    description: data.message,
                    duration: 8
                })
            }
        })

        socketIOManager.on('user_update', (data) => {
            addUserUpdate(data)

            // Show user update message
            if (data.message) {
                message.info({
                    content: 'User Update',
                    description: data.message,
                    duration: 5
                })
            }
        })

        logger.info('Socket.IO event listeners initialized')
    }

    // Cleanup listeners
    const cleanupListeners = () => {
        socketIOManager.off('connected')
        socketIOManager.off('disconnected')
        socketIOManager.off('reconnected')
        socketIOManager.off('reconnect_attempt')
        socketIOManager.off('reconnect_error')
        socketIOManager.off('reconnect_failed')
        socketIOManager.off('error')
        socketIOManager.off('notification')
        socketIOManager.off('system_message')
        socketIOManager.off('user_update')

        logger.info('Socket.IO event listeners cleaned up')
    }

    return {
        // State
        isConnected,
        isConnecting,
        reconnectAttempts,
        lastError,
        notifications,
        systemMessages,
        userUpdates,
        connectionState,

        // Computed
        hasNotifications,
        unreadNotifications,
        connectionStatus,

        // Actions
        connect,
        disconnect,
        sendMessage,
        sendMessageWithAck,
        addNotification,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        clearNotifications,
        addSystemMessage,
        addUserUpdate,
        updateConnectionState,
        updateReconnectAttempts,
        setError,
        initializeListeners,
        cleanupListeners
    }
})
