<template>
  <a-layout class="admin-layout">
    <a-layout-sider
      v-model:collapsed="collapsed"
      :trigger="null"
      collapsible
      class="sider"
    >
      <div class="logo">
        <h2 v-if="!collapsed">Admin Panel</h2>
        <h2 v-else>A</h2>
      </div>
      <a-menu
        v-model:selectedKeys="selectedKeys"
        theme="dark"
        mode="inline"
        :inline-collapsed="collapsed"
      >
        <a-menu-item key="dashboard" @click="navigateTo('/')">
          <template #icon>
            <DashboardOutlined />
          </template>
          Dashboard
        </a-menu-item>
        <a-menu-item key="users" @click="navigateTo('/users')">
          <template #icon>
            <UserOutlined />
          </template>
          User Management
        </a-menu-item>
        <a-menu-item key="profile" @click="navigateTo('/profile')">
          <template #icon>
            <ProfileOutlined />
          </template>
          Profile
        </a-menu-item>
      </a-menu>
    </a-layout-sider>
    
    <a-layout>
      <a-layout-header class="header">
        <div class="header-left">
          <a-button
            type="text"
            @click="toggleCollapsed"
            class="trigger"
          >
            <MenuUnfoldOutlined v-if="collapsed" />
            <MenuFoldOutlined v-else />
          </a-button>
        </div>
        
        <div class="header-right">
          <a-dropdown>
            <template #overlay>
              <a-menu>
                <a-menu-item key="profile" @click="navigateTo('/profile')">
                  <UserOutlined />
                  Profile
                </a-menu-item>
                <a-menu-divider />
                <a-menu-item key="logout" @click="handleLogout">
                  <LogoutOutlined />
                  Logout
                </a-menu-item>
              </a-menu>
            </template>
            <a-button type="text" class="user-button">
              <UserOutlined />
              {{ authStore.userInfo?.username || 'User' }}
            </a-button>
          </a-dropdown>
        </div>
      </a-layout-header>
      
      <a-layout-content class="content">
        <div class="content-wrapper">
          <router-view />
        </div>
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { logger } from '@/utils/logger'
import {
  DashboardOutlined,
  UserOutlined,
  ProfileOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  LogoutOutlined
} from '@ant-design/icons-vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const collapsed = ref(false)
const selectedKeys = ref([])

// Update selected keys based on current route
watch(
  () => route.path,
  (newPath) => {
    if (newPath === '/') {
      selectedKeys.value = ['dashboard']
    } else if (newPath.startsWith('/users')) {
      selectedKeys.value = ['users']
    } else if (newPath.startsWith('/profile')) {
      selectedKeys.value = ['profile']
    }
  },
  { immediate: true }
)

const toggleCollapsed = () => {
  collapsed.value = !collapsed.value
  logger.info('Sidebar toggled', { collapsed: collapsed.value })
}

const navigateTo = (path) => {
  router.push(path)
}

const handleLogout = async () => {
  try {
    await authStore.logout()
    logger.info('User logged out from header')
  } catch (error) {
    logger.error('Logout error:', error)
  }
}
</script>

<style scoped>
.admin-layout {
  height: 100vh;
}

.sider {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  z-index: 100;
}

.logo {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  margin: 16px;
  border-radius: 6px;
}

.logo h2 {
  color: white;
  margin: 0;
  font-size: 18px;
}

.header {
  background: #fff;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  margin-left: 200px;
  transition: margin-left 0.2s;
}

.header.collapsed {
  margin-left: 80px;
}

.header-left {
  display: flex;
  align-items: center;
}

.trigger {
  font-size: 18px;
  line-height: 64px;
  padding: 0 24px;
  cursor: pointer;
  transition: color 0.3s;
}

.trigger:hover {
  color: #1890ff;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-button {
  display: flex;
  align-items: center;
  gap: 8px;
}

.content {
  margin-left: 200px;
  transition: margin-left 0.2s;
  background: #f0f2f5;
  min-height: calc(100vh - 64px);
}

.content-wrapper {
  padding: 24px;
  min-height: 100%;
}

/* Responsive */
@media (max-width: 768px) {
  .header {
    margin-left: 0;
  }
  
  .content {
    margin-left: 0;
  }
  
  .sider {
    position: fixed;
    z-index: 1000;
  }
}
</style>
