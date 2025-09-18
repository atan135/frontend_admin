<template>
  <div class="dashboard">
    <a-row :gutter="24">
      <a-col :span="24">
        <a-card title="Dashboard" class="dashboard-card">
          <template #extra>
            <a-button type="primary" @click="refreshData">
              <template #icon>
                <ReloadOutlined />
              </template>
              Refresh
            </a-button>
          </template>
          
          <a-row :gutter="16" class="stats-row">
            <a-col :span="6">
              <a-card class="stat-card">
                <a-statistic
                  title="Total Users"
                  :value="stats.totalUsers"
                  :loading="loading"
                >
                  <template #prefix>
                    <UserOutlined style="color: #1890ff" />
                  </template>
                </a-statistic>
              </a-card>
            </a-col>
            
            <a-col :span="6">
              <a-card class="stat-card">
                <a-statistic
                  title="Active Users"
                  :value="stats.activeUsers"
                  :loading="loading"
                >
                  <template #prefix>
                    <CheckCircleOutlined style="color: #52c41a" />
                  </template>
                </a-statistic>
              </a-card>
            </a-col>
            
            <a-col :span="6">
              <a-card class="stat-card">
                <a-statistic
                  title="New Users Today"
                  :value="stats.newUsersToday"
                  :loading="loading"
                >
                  <template #prefix>
                    <UserAddOutlined style="color: #fa8c16" />
                  </template>
                </a-statistic>
              </a-card>
            </a-col>
            
            <a-col :span="6">
              <a-card class="stat-card">
                <a-statistic
                  title="System Status"
                  :value="stats.systemStatus"
                  :loading="loading"
                >
                  <template #prefix>
                    <CheckCircleOutlined style="color: #52c41a" />
                  </template>
                </a-statistic>
              </a-card>
            </a-col>
          </a-row>
          
          <a-divider />
          
          <a-row :gutter="24">
            <a-col :span="12">
              <a-card title="Recent Activities" size="small">
                <a-timeline>
                  <a-timeline-item
                    v-for="activity in recentActivities"
                    :key="activity.id"
                    :color="activity.color"
                  >
                    <template #dot>
                      <component :is="activity.icon" />
                    </template>
                    <div>
                      <div class="activity-title">{{ activity.title }}</div>
                      <div class="activity-time">{{ activity.time }}</div>
                    </div>
                  </a-timeline-item>
                </a-timeline>
              </a-card>
            </a-col>
            
            <a-col :span="12">
              <a-card title="Quick Actions" size="small">
                <a-space direction="vertical" style="width: 100%">
                  <a-button
                    type="primary"
                    block
                    @click="navigateTo('/users')"
                  >
                    <UserOutlined />
                    Manage Users
                  </a-button>
                  
                  <a-button block @click="navigateTo('/profile')">
                    <ProfileOutlined />
                    View Profile
                  </a-button>
                  
                  <a-button block @click="refreshData">
                    <ReloadOutlined />
                    Refresh Data
                  </a-button>
                </a-space>
              </a-card>
            </a-col>
          </a-row>
        </a-card>
      </a-col>
    </a-row>
    
    <!-- Log Viewer -->
    <a-row :gutter="24" style="margin-top: 24px;">
      <a-col :span="24">
        <LogViewer />
      </a-col>
    </a-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { logger } from '@/utils/logger'
import LogViewer from '@/components/LogViewer.vue'
import {
  UserOutlined,
  CheckCircleOutlined,
  UserAddOutlined,
  ReloadOutlined,
  ProfileOutlined,
  LoginOutlined,
  LogoutOutlined,
  UserDeleteOutlined
} from '@ant-design/icons-vue'

const router = useRouter()
const authStore = useAuthStore()

const loading = ref(false)
const stats = ref({
  totalUsers: 0,
  activeUsers: 0,
  newUsersToday: 0,
  systemStatus: 'Online'
})

const recentActivities = ref([
  {
    id: 1,
    title: 'User John Doe logged in',
    time: '2 minutes ago',
    color: 'green',
    icon: LoginOutlined
  },
  {
    id: 2,
    title: 'New user registered',
    time: '5 minutes ago',
    color: 'blue',
    icon: UserAddOutlined
  },
  {
    id: 3,
    title: 'User Jane Smith logged out',
    time: '10 minutes ago',
    color: 'orange',
    icon: LogoutOutlined
  },
  {
    id: 4,
    title: 'User account deleted',
    time: '15 minutes ago',
    color: 'red',
    icon: UserDeleteOutlined
  }
])

const loadDashboardData = async () => {
  try {
    loading.value = true
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Mock data - replace with actual API calls
    stats.value = {
      totalUsers: 1250,
      activeUsers: 890,
      newUsersToday: 23,
      systemStatus: 'Online'
    }
    
    logger.info('Dashboard data loaded')
  } catch (error) {
    logger.error('Failed to load dashboard data:', error)
  } finally {
    loading.value = false
  }
}

const refreshData = () => {
  loadDashboardData()
}

const navigateTo = (path) => {
  router.push(path)
}

onMounted(() => {
  loadDashboardData()
})
</script>

<style scoped>
.dashboard {
  padding: 0;
}

.dashboard-card {
  margin-bottom: 24px;
}

.stats-row {
  margin-bottom: 24px;
}

.stat-card {
  text-align: center;
  border: 1px solid #f0f0f0;
  border-radius: 6px;
}

.stat-card .ant-card-body {
  padding: 16px;
}

.activity-title {
  font-weight: 500;
  margin-bottom: 4px;
}

.activity-time {
  color: #666;
  font-size: 12px;
}
</style>
