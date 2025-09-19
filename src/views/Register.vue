<template>
  <div class="register-container">
    <div class="register-form">
      <div class="register-header">
        <h1>Create Account</h1>
        <p>Join the Admin Management System</p>
      </div>
      
      <a-form
        :model="formData"
        :rules="rules"
        @finish="handleRegister"
        class="form"
        ref="formRef"
      >
        <a-form-item name="username">
          <a-input
            v-model:value="formData.username"
            placeholder="Username"
            size="large"
            :prefix="h(UserOutlined)"
          />
        </a-form-item>
        
        <a-form-item name="email">
          <a-input
            v-model:value="formData.email"
            placeholder="Email"
            size="large"
            :prefix="h(MailOutlined)"
          />
        </a-form-item>
        
        <a-form-item name="fullName">
          <a-input
            v-model:value="formData.fullName"
            placeholder="Full Name"
            size="large"
            :prefix="h(IdcardOutlined)"
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
        
        <a-form-item name="confirmPassword">
          <a-input-password
            v-model:value="formData.confirmPassword"
            placeholder="Confirm Password"
            size="large"
            :prefix="h(LockOutlined)"
          />
        </a-form-item>
        
        <a-form-item name="role">
          <a-select
            v-model:value="formData.role"
            placeholder="Select Role"
            size="large"
          >
            <a-select-option value="user">User</a-select-option>
            <a-select-option value="admin">Admin</a-select-option>
          </a-select>
        </a-form-item>
        
        <a-form-item name="agree">
          <a-checkbox v-model:checked="formData.agree">
            I agree to the 
            <a href="#" @click.prevent="showTerms">Terms of Service</a>
            and 
            <a href="#" @click.prevent="showPrivacy">Privacy Policy</a>
          </a-checkbox>
        </a-form-item>
        
        <a-form-item>
          <a-button
            type="primary"
            html-type="submit"
            size="large"
            :loading="loading"
            block
          >
            Create Account
          </a-button>
        </a-form-item>
      </a-form>
      
      <div class="register-footer">
        <a-divider>Or</a-divider>
        <div class="login-link">
          <span>Already have an account?</span>
          <a-button type="link" @click="goToLogin" class="login-btn">
            Login here
          </a-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, h } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { useAuthStore } from '@/stores/auth'
import { logger } from '@/utils/logger'
import { 
  UserOutlined, 
  LockOutlined, 
  MailOutlined, 
  IdcardOutlined 
} from '@ant-design/icons-vue'

const router = useRouter()
const authStore = useAuthStore()

const formRef = ref()
const loading = ref(false)

const formData = ref({
  username: '',
  email: '',
  fullName: '',
  password: '',
  confirmPassword: '',
  role: 'user',
  agree: false
})

const rules = {
  username: [
    { required: true, message: 'Please input your username!' },
    { min: 3, message: 'Username must be at least 3 characters!' },
    { max: 20, message: 'Username must be less than 20 characters!' },
    { pattern: /^[a-zA-Z0-9_]+$/, message: 'Username can only contain letters, numbers, and underscores!' }
  ],
  email: [
    { required: true, message: 'Please input your email!' },
    { type: 'email', message: 'Please input a valid email!' }
  ],
  fullName: [
    { required: true, message: 'Please input your full name!' },
    { min: 2, message: 'Full name must be at least 2 characters!' }
  ],
  password: [
    { required: true, message: 'Please input your password!' },
    { min: 8, message: 'Password must be at least 8 characters!' },
    { 
      pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character!'
    }
  ],
  confirmPassword: [
    { required: true, message: 'Please confirm your password!' },
    {
      validator: (rule, value) => {
        if (value !== formData.value.password) {
          return Promise.reject('Passwords do not match!')
        }
        return Promise.resolve()
      }
    }
  ],
  role: [
    { required: true, message: 'Please select a role!' }
  ],
  agree: [
    {
      validator: (rule, value) => {
        if (!value) {
          return Promise.reject('You must agree to the terms and conditions!')
        }
        return Promise.resolve()
      }
    }
  ]
}

const handleRegister = async () => {
  try {
    const result = await authStore.register(formData.value)
    
    if (result.errcode == 0) {
      message.success(result.errmsg)
      logger.info('User registration successful', { 
        username: formData.value.username,
        email: formData.value.email 
      })
      
      // Redirect to login page
      router.push('/login')
    } else {
      message.error(result.errmsg)
      logger.warn('Registration failed', { 
        username: formData.value.username, 
        error: result.errmsg 
      })
    }
  } catch (error) {
    message.error('Registration failed, please try again')
    logger.error('Registration error:', error)
  }
}

const goToLogin = () => {
  logger.info('Navigate to login page')
  router.push('/login')
}

const showTerms = () => {
  message.info('Terms of Service - Coming soon!')
}

const showPrivacy = () => {
  message.info('Privacy Policy - Coming soon!')
}
</script>

<style scoped>
.register-container {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.register-form {
  width: 450px;
  max-width: 100%;
  padding: 40px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  max-height: 90vh;
  overflow-y: auto;
}

.register-header {
  text-align: center;
  margin-bottom: 32px;
}

.register-header h1 {
  margin: 0 0 8px 0;
  color: #1890ff;
  font-size: 28px;
}

.register-header p {
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

.register-footer {
  margin-top: 24px;
}

.login-link {
  text-align: center;
  color: #666;
}

.login-btn {
  padding: 0;
  height: auto;
  font-size: 14px;
  color: #1890ff;
}

.login-btn:hover {
  color: #40a9ff;
}

/* Responsive design */
@media (max-width: 480px) {
  .register-form {
    width: 100%;
    padding: 20px;
  }
  
  .register-container {
    padding: 10px;
  }
}
</style>
