<template>
  <div class="websocket-status" v-if="showStatus">
    <a-tooltip :title="tooltipText">
      <a-badge 
        :status="status" 
        :text="statusText"
        class="websocket-badge"
      />
    </a-tooltip>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useWebSocketStore } from '@/stores/websocket'
import { logger } from '@/utils/logger'

const wsStore = useWebSocketStore()

const showStatus = ref(false)

const status = computed(() => {
  switch (wsStore.connectionStatus) {
    case 'connected':
      return 'success'
    case 'connecting':
    case 'reconnecting':
      return 'processing'
    case 'disconnected':
      return 'error'
    default:
      return 'default'
  }
})

const statusText = computed(() => {
  switch (wsStore.connectionStatus) {
    case 'connected':
      return 'IO ✓'
    case 'connecting':
      return 'IO ⏳'
    case 'reconnecting':
      return `IO ↻${wsStore.reconnectAttempts}`
    case 'disconnected':
      return 'IO ✗'
    default:
      return 'IO ?'
  }
})

const tooltipText = computed(() => {
  switch (wsStore.connectionStatus) {
    case 'connected':
      return 'Socket.IO connected - Real-time features active'
    case 'connecting':
      return 'Connecting to Socket.IO server...'
    case 'reconnecting':
      return `Reconnecting to Socket.IO server... (Attempt ${wsStore.reconnectAttempts})`
    case 'disconnected':
      return wsStore.lastError ? `Socket.IO disconnected: ${wsStore.lastError}` : 'Socket.IO disconnected'
    default:
      return 'Socket.IO status unknown'
  }
})

onMounted(() => {
  // Show status in development mode
  if (import.meta.env.DEV) {
    showStatus.value = true
  }
})
</script>

<style scoped>
.websocket-status {
  display: inline-block;
  margin-left: 8px;
}

.websocket-badge {
  font-size: 12px;
}

.websocket-badge :deep(.ant-badge-status-dot) {
  width: 6px;
  height: 6px;
}

.websocket-badge :deep(.ant-badge-status-text) {
  font-size: 11px;
  color: #666;
}
</style>
