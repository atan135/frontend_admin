<template>
  <div class="csrf-status" v-if="showStatus">
    <a-tooltip :title="tooltipText">
      <a-badge 
        :status="status" 
        :text="statusText"
        class="csrf-badge"
      />
    </a-tooltip>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { csrfManager } from '@/utils/csrf'
import { logger } from '@/utils/logger'

const showStatus = ref(false)
const status = ref('default')
const statusText = ref('CSRF')

const tooltipText = computed(() => {
  switch (status.value) {
    case 'success':
      return 'CSRF token is valid and active'
    case 'warning':
      return 'CSRF token is expiring soon'
    case 'error':
      return 'CSRF token is invalid or expired'
    default:
      return 'CSRF token status unknown'
  }
})

const updateStatus = () => {
  if (csrfManager.hasValidToken()) {
    status.value = 'success'
    statusText.value = 'CSRF ✓'
  } else if (csrfManager.getCurrentToken()) {
    status.value = 'warning'
    statusText.value = 'CSRF ⚠'
  } else {
    status.value = 'error'
    statusText.value = 'CSRF ✗'
  }
}

const checkStatus = async () => {
  try {
    await csrfManager.getToken()
    updateStatus()
  } catch (error) {
    logger.warn('CSRF status check failed:', error)
    status.value = 'error'
    statusText.value = 'CSRF ✗'
  }
}

let statusInterval = null

onMounted(() => {
  // Check status immediately
  checkStatus()
  
  // Check status every 30 seconds
  statusInterval = setInterval(checkStatus, 30000)
  
  // Show status in development mode
  if (import.meta.env.DEV) {
    showStatus.value = true
  }
})

onUnmounted(() => {
  if (statusInterval) {
    clearInterval(statusInterval)
  }
})
</script>

<style scoped>
.csrf-status {
  display: inline-block;
  margin-left: 8px;
}

.csrf-badge {
  font-size: 12px;
}

.csrf-badge :deep(.ant-badge-status-dot) {
  width: 6px;
  height: 6px;
}

.csrf-badge :deep(.ant-badge-status-text) {
  font-size: 11px;
  color: #666;
}
</style>
