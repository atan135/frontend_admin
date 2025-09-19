<template>
  <a-dropdown :trigger="['click']" placement="bottomRight">
    <template #overlay>
      <div class="notification-dropdown">
        <div class="notification-header">
          <span class="notification-title">Notifications</span>
          <div class="notification-actions">
            <a-button 
              type="text" 
              size="small" 
              @click="markAllAsRead"
              :disabled="unreadCount === 0"
            >
              Mark all read
            </a-button>
            <a-button 
              type="text" 
              size="small" 
              @click="clearAll"
              :disabled="notifications.length === 0"
            >
              Clear all
            </a-button>
          </div>
        </div>
        
        <a-divider style="margin: 8px 0" />
        
        <div class="notification-list">
          <div v-if="notifications.length === 0" class="no-notifications">
            <a-empty description="No notifications" />
          </div>
          
          <div 
            v-for="notification in notifications" 
            :key="notification.id"
            class="notification-item"
            :class="{ 'unread': !notification.read }"
            @click="markAsRead(notification.id)"
          >
            <div class="notification-icon">
              <component :is="getNotificationIcon(notification.type)" />
            </div>
            
            <div class="notification-content">
              <div class="notification-title">{{ notification.title }}</div>
              <div class="notification-message">{{ notification.message }}</div>
              <div class="notification-time">{{ formatTime(notification.timestamp) }}</div>
            </div>
            
            <div class="notification-actions">
              <a-button 
                type="text" 
                size="small" 
                @click.stop="removeNotification(notification.id)"
              >
                <CloseOutlined />
              </a-button>
            </div>
          </div>
        </div>
        
        <a-divider style="margin: 8px 0" />
        
        <div class="notification-footer">
          <a-button type="link" size="small" @click="viewAllNotifications">
            View all notifications
          </a-button>
        </div>
      </div>
    </template>
    
    <a-badge :count="unreadCount" :offset="[10, 0]">
      <a-button type="text" class="notification-button">
        <BellOutlined />
      </a-button>
    </a-badge>
  </a-dropdown>
</template>

<script setup>
import { computed } from 'vue'
import { useWebSocketStore } from '@/stores/websocket'
import { logger } from '@/utils/logger'
import { 
  BellOutlined, 
  InfoCircleOutlined, 
  CheckCircleOutlined, 
  ExclamationCircleOutlined, 
  CloseCircleOutlined,
  CloseOutlined
} from '@ant-design/icons-vue'

const wsStore = useWebSocketStore()

const notifications = computed(() => wsStore.notifications)
const unreadCount = computed(() => wsStore.unreadNotifications)

const getNotificationIcon = (type) => {
  switch (type) {
    case 'success':
      return CheckCircleOutlined
    case 'warning':
      return ExclamationCircleOutlined
    case 'error':
      return CloseCircleOutlined
    default:
      return InfoCircleOutlined
  }
}

const formatTime = (timestamp) => {
  const now = new Date()
  const time = new Date(timestamp)
  const diff = now - time
  
  if (diff < 60000) { // Less than 1 minute
    return 'Just now'
  } else if (diff < 3600000) { // Less than 1 hour
    const minutes = Math.floor(diff / 60000)
    return `${minutes}m ago`
  } else if (diff < 86400000) { // Less than 1 day
    const hours = Math.floor(diff / 3600000)
    return `${hours}h ago`
  } else {
    const days = Math.floor(diff / 86400000)
    return `${days}d ago`
  }
}

const markAsRead = (notificationId) => {
  wsStore.markNotificationAsRead(notificationId)
  logger.debug('Notification marked as read:', notificationId)
}

const markAllAsRead = () => {
  wsStore.markAllNotificationsAsRead()
  logger.info('All notifications marked as read')
}

const clearAll = () => {
  wsStore.clearNotifications()
  logger.info('All notifications cleared')
}

const removeNotification = (notificationId) => {
  const index = notifications.value.findIndex(n => n.id === notificationId)
  if (index > -1) {
    notifications.value.splice(index, 1)
    logger.debug('Notification removed:', notificationId)
  }
}

const viewAllNotifications = () => {
  // TODO: Navigate to notifications page
  logger.info('Navigate to all notifications page')
}
</script>

<style scoped>
.notification-dropdown {
  width: 350px;
  max-height: 400px;
  background: white;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px 0;
}

.notification-title {
  font-weight: 600;
  font-size: 14px;
}

.notification-actions {
  display: flex;
  gap: 4px;
}

.notification-list {
  max-height: 300px;
  overflow-y: auto;
}

.no-notifications {
  padding: 20px;
  text-align: center;
}

.notification-item {
  display: flex;
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background-color 0.2s;
}

.notification-item:hover {
  background-color: #f5f5f5;
}

.notification-item.unread {
  background-color: #e6f7ff;
  border-left: 3px solid #1890ff;
}

.notification-icon {
  margin-right: 12px;
  margin-top: 2px;
  color: #1890ff;
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-title {
  font-weight: 500;
  font-size: 13px;
  margin-bottom: 4px;
  color: #262626;
}

.notification-message {
  font-size: 12px;
  color: #8c8c8c;
  margin-bottom: 4px;
  line-height: 1.4;
}

.notification-time {
  font-size: 11px;
  color: #bfbfbf;
}

.notification-actions {
  margin-left: 8px;
  display: flex;
  align-items: center;
}

.notification-footer {
  padding: 8px 16px 12px;
  text-align: center;
}

.notification-button {
  color: #666;
  font-size: 16px;
}

.notification-button:hover {
  color: #1890ff;
}
</style>
