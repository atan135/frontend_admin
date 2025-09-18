<template>
  <div class="login-container">
    <div class="login-form">
      <div class="login-header">
        <h1>Admin Login</h1>
        <p>Welcome to the Admin Management System</p>
      </div>
      
      <a-form
        :model="formData"
        :rules="rules"
        @finish="handleLogin"
        class="form"
      >
        <a-form-item name="username">
          <a-input
            v-model:value="formData.username"
            placeholder="Username"
            size="large"
            :prefix="h(UserOutlined)"
          />
        </a-form-item>
        
        <a-form-item name="password">
          <a-input-password
            v-model:value="formData.password"
            placeholder="Password"
            size="large"
            :prefix="h(LockOutlined)"
          />
        </a-form-item>
        
        <a-form-item name="remember">
          <a-checkbox v-model:checked="formData.remember">
            Remember me
          </a-checkbox>
        </a-form-item>
        
        <a-form-item>
          <a-button
            type="primary"
            html-type="submit"
            size="large"
            :loading="authStore.loading"
            block
          >
            Login
          </a-button>
        </a-form-item>
      </a-form>
    </div>
  </div>
</template>

<script setup>
import { ref, h } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { useAuthStore } from '@/stores/auth'
import { logger } from '@/utils/logger'
import { UserOutlined, LockOutlined } from '@ant-design/icons-vue'

const router = useRouter()
const authStore = useAuthStore()

const formData = ref({
  username: '',
  password: '',
  remember: false
})

const rules = {
  username: [
    { required: true, message: 'Please input your username!' }
  ],
  password: [
    { required: true, message: 'Please input your password!' },
    { min: 6, message: 'Password must be at least 6 characters!' }
  ]
}

const handleLogin = async () => {
  try {
    const result = await authStore.login(formData.value)
    
    if (result.success) {
      message.success(result.message)
      logger.info('User login successful', { username: formData.value.username })
      router.push('/')
    } else {
      message.error(result.message)
      logger.warn('Login failed', { username: formData.value.username, error: result.message })
    }
  } catch (error) {
    message.error('Login failed, please try again')
    logger.error('Login error:', error)
  }
}
</script>

<style scoped>
.login-container {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-form {
  width: 400px;
  padding: 40px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.login-header h1 {
  margin: 0 0 8px 0;
  color: #1890ff;
  font-size: 28px;
}

.login-header p {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.form {
  width: 100%;
}

.form .ant-form-item {
  margin-bottom: 16px;
}

.form .ant-btn {
  height: 40px;
  font-size: 16px;
}
</style>
