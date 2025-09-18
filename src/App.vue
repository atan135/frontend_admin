<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { logger } from '@/utils/logger'

const authStore = useAuthStore()

onMounted(() => {
  logger.info('Application initialized')
  // Check if user is already logged in
  authStore.checkAuth()
})
</script>

<style>
#app {
  height: 100vh;
}
</style>
