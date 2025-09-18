<template>
  <a-card title="Application Logs" class="log-viewer">
    <template #extra>
      <a-space>
        <a-button size="small" @click="refreshLogs">
          <template #icon>
            <ReloadOutlined />
          </template>
          Refresh
        </a-button>
        <a-button size="small" @click="clearLogs">
          <template #icon>
            <DeleteOutlined />
          </template>
          Clear
        </a-button>
        <a-button size="small" @click="exportLogs">
          <template #icon>
            <DownloadOutlined />
          </template>
          Export
        </a-button>
      </a-space>
    </template>
    
    <div class="log-container">
      <div
        v-for="(log, index) in logs"
        :key="index"
        :class="['log-entry', `log-${log.level.toLowerCase()}`]"
      >
        <span class="log-timestamp">{{ formatTime(log.timestamp) }}</span>
        <span class="log-level">{{ log.level }}</span>
        <span class="log-name">{{ log.name }}</span>
        <span class="log-message">{{ log.message }}</span>
        <pre v-if="log.args" class="log-args">{{ JSON.stringify(log.args, null, 2) }}</pre>
      </div>
      
      <div v-if="logs.length === 0" class="no-logs">
        No logs available
      </div>
    </div>
  </a-card>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { logger, errorLogger } from '@/utils/logger'
import { ReloadOutlined, DeleteOutlined, DownloadOutlined } from '@ant-design/icons-vue'

const logs = ref([])

const refreshLogs = () => {
  const appLogs = logger.getLogs()
  const errorLogs = errorLogger.getLogs()
  
  // Combine and sort logs by timestamp
  const allLogs = [...appLogs, ...errorLogs].sort((a, b) => 
    new Date(a.timestamp) - new Date(b.timestamp)
  )
  
  logs.value = allLogs
}

const clearLogs = () => {
  logger.clearLogs()
  errorLogger.clearLogs()
  logs.value = []
}

const exportLogs = () => {
  const logData = logs.value
  const blob = new Blob([JSON.stringify(logData, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `app-logs-${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString()
}

// Auto-refresh logs every 5 seconds
let refreshInterval

onMounted(() => {
  refreshLogs()
  refreshInterval = setInterval(refreshLogs, 5000)
})

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
  }
})
</script>

<style scoped>
.log-viewer {
  margin-top: 24px;
}

.log-container {
  max-height: 400px;
  overflow-y: auto;
  background: #f5f5f5;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  padding: 8px;
}

.log-entry {
  display: block;
  margin-bottom: 4px;
  padding: 4px 8px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  line-height: 1.4;
}

.log-entry.log-trace {
  background: #f0f0f0;
  color: #666;
}

.log-entry.log-debug {
  background: #e6f7ff;
  color: #1890ff;
}

.log-entry.log-info {
  background: #f6ffed;
  color: #52c41a;
}

.log-entry.log-warn {
  background: #fffbe6;
  color: #faad14;
}

.log-entry.log-error {
  background: #fff2f0;
  color: #ff4d4f;
}

.log-entry.log-fatal {
  background: #fff1f0;
  color: #cf1322;
  font-weight: bold;
}

.log-timestamp {
  color: #999;
  margin-right: 8px;
}

.log-level {
  font-weight: bold;
  margin-right: 8px;
  min-width: 50px;
  display: inline-block;
}

.log-name {
  color: #666;
  margin-right: 8px;
  min-width: 60px;
  display: inline-block;
}

.log-message {
  color: #333;
}

.log-args {
  margin: 4px 0 0 20px;
  font-size: 11px;
  color: #666;
  background: rgba(0, 0, 0, 0.05);
  padding: 4px;
  border-radius: 3px;
  white-space: pre-wrap;
  word-break: break-all;
}

.no-logs {
  text-align: center;
  color: #999;
  padding: 20px;
  font-style: italic;
}
</style>
