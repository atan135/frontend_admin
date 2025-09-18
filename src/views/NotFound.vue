<template>
  <div class="not-found">
    <a-result
      status="404"
      title="404"
      sub-title="Sorry, the page you visited does not exist."
    >
      <template #extra>
        <a-button type="primary" @click="goHome">
          Back Home
        </a-button>
      </template>
    </a-result>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { logger } from '@/utils/logger'

const router = useRouter()

const goHome = () => {
  logger.info('Redirecting to home from 404 page')
  router.push('/')
}
</script>

<style scoped>
.not-found {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: #f0f2f5;
}
</style>
