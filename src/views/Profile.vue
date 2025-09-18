<template>
  <div class="profile">
    <a-row :gutter="24">
      <a-col :span="8">
        <a-card title="Profile Information" class="profile-card">
          <div class="profile-avatar">
            <a-avatar :size="100" :src="profileData.avatar">
              <template #icon>
                <UserOutlined />
              </template>
            </a-avatar>
            <a-button type="link" @click="showAvatarModal">
              Change Avatar
            </a-button>
          </div>
          
          <a-descriptions :column="1" bordered>
            <a-descriptions-item label="Username">
              {{ profileData.username }}
            </a-descriptions-item>
            <a-descriptions-item label="Email">
              {{ profileData.email }}
            </a-descriptions-item>
            <a-descriptions-item label="Full Name">
              {{ profileData.fullName }}
            </a-descriptions-item>
            <a-descriptions-item label="Role">
              <a-tag :color="profileData.role === 'admin' ? 'blue' : 'default'">
                {{ profileData.role }}
              </a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="Status">
              <a-tag :color="profileData.status === 'active' ? 'green' : 'red'">
                {{ profileData.status }}
              </a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="Last Login">
              {{ formatDate(profileData.lastLogin) }}
            </a-descriptions-item>
            <a-descriptions-item label="Created At">
              {{ formatDate(profileData.createdAt) }}
            </a-descriptions-item>
          </a-descriptions>
        </a-card>
      </a-col>
      
      <a-col :span="16">
        <a-card title="Edit Profile" class="edit-card">
          <a-form
            :model="editForm"
            :rules="editRules"
            ref="editFormRef"
            layout="vertical"
            @finish="handleUpdateProfile"
          >
            <a-row :gutter="16">
              <a-col :span="12">
                <a-form-item label="Username" name="username">
                  <a-input v-model:value="editForm.username" />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="Email" name="email">
                  <a-input v-model:value="editForm.email" />
                </a-form-item>
              </a-col>
            </a-row>
            
            <a-row :gutter="16">
              <a-col :span="12">
                <a-form-item label="Full Name" name="fullName">
                  <a-input v-model:value="editForm.fullName" />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="Phone" name="phone">
                  <a-input v-model:value="editForm.phone" />
                </a-form-item>
              </a-col>
            </a-row>
            
            <a-form-item label="Bio" name="bio">
              <a-textarea
                v-model:value="editForm.bio"
                :rows="4"
                placeholder="Tell us about yourself..."
              />
            </a-form-item>
            
            <a-form-item>
              <a-space>
                <a-button type="primary" html-type="submit" :loading="loading">
                  Update Profile
                </a-button>
                <a-button @click="resetForm">
                  Reset
                </a-button>
              </a-space>
            </a-form-item>
          </a-form>
        </a-card>
        
        <a-card title="Change Password" class="password-card" style="margin-top: 24px;">
          <a-form
            :model="passwordForm"
            :rules="passwordRules"
            ref="passwordFormRef"
            layout="vertical"
            @finish="handleChangePassword"
          >
            <a-form-item label="Current Password" name="currentPassword">
              <a-input-password v-model:value="passwordForm.currentPassword" />
            </a-form-item>
            
            <a-form-item label="New Password" name="newPassword">
              <a-input-password v-model:value="passwordForm.newPassword" />
            </a-form-item>
            
            <a-form-item label="Confirm New Password" name="confirmPassword">
              <a-input-password v-model:value="passwordForm.confirmPassword" />
            </a-form-item>
            
            <a-form-item>
              <a-button type="primary" html-type="submit" :loading="passwordLoading">
                Change Password
              </a-button>
            </a-form-item>
          </a-form>
        </a-card>
      </a-col>
    </a-row>
    
    <!-- Avatar Upload Modal -->
    <a-modal
      v-model:open="avatarModalVisible"
      title="Change Avatar"
      @ok="handleAvatarUpload"
      @cancel="avatarModalVisible = false"
    >
      <a-upload
        v-model:file-list="fileList"
        :before-upload="beforeUpload"
        list-type="picture-card"
        :max-count="1"
      >
        <div v-if="fileList.length < 1">
          <PlusOutlined />
          <div style="margin-top: 8px">Upload</div>
        </div>
      </a-upload>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { useAuthStore } from '@/stores/auth'
import { logger } from '@/utils/logger'
import { UserOutlined, PlusOutlined } from '@ant-design/icons-vue'

const authStore = useAuthStore()

// Profile data
const profileData = ref({
  id: 1,
  username: 'admin',
  email: 'admin@example.com',
  fullName: 'Administrator',
  role: 'admin',
  status: 'active',
  avatar: null,
  phone: '+1 234 567 8900',
  bio: 'System Administrator',
  lastLogin: new Date().toISOString(),
  createdAt: '2024-01-01T00:00:00Z'
})

// Edit form
const editForm = reactive({
  username: '',
  email: '',
  fullName: '',
  phone: '',
  bio: ''
})

const editFormRef = ref()
const loading = ref(false)

const editRules = {
  username: [
    { required: true, message: 'Please input username!' }
  ],
  email: [
    { required: true, message: 'Please input email!' },
    { type: 'email', message: 'Please input valid email!' }
  ],
  fullName: [
    { required: true, message: 'Please input full name!' }
  ]
}

// Password form
const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const passwordFormRef = ref()
const passwordLoading = ref(false)

const passwordRules = {
  currentPassword: [
    { required: true, message: 'Please input current password!' }
  ],
  newPassword: [
    { required: true, message: 'Please input new password!' },
    { min: 6, message: 'Password must be at least 6 characters!' }
  ],
  confirmPassword: [
    { required: true, message: 'Please confirm new password!' },
    {
      validator: (rule, value) => {
        if (value !== passwordForm.newPassword) {
          return Promise.reject('Passwords do not match!')
        }
        return Promise.resolve()
      }
    }
  ]
}

// Avatar modal
const avatarModalVisible = ref(false)
const fileList = ref([])

// Methods
const loadProfileData = () => {
  if (authStore.userInfo) {
    Object.assign(profileData.value, authStore.userInfo)
  }
  
  // Initialize edit form
  Object.assign(editForm, {
    username: profileData.value.username,
    email: profileData.value.email,
    fullName: profileData.value.fullName,
    phone: profileData.value.phone || '',
    bio: profileData.value.bio || ''
  })
  
  logger.info('Profile data loaded')
}

const handleUpdateProfile = async () => {
  try {
    await editFormRef.value.validate()
    loading.value = true
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Update profile data
    Object.assign(profileData.value, editForm)
    
    // Update auth store
    authStore.userInfo = { ...authStore.userInfo, ...editForm }
    localStorage.setItem('userInfo', JSON.stringify(authStore.userInfo))
    
    message.success('Profile updated successfully')
    logger.info('Profile updated', { username: editForm.username })
  } catch (error) {
    logger.error('Update profile error:', error)
  } finally {
    loading.value = false
  }
}

const handleChangePassword = async () => {
  try {
    await passwordFormRef.value.validate()
    passwordLoading.value = true
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    message.success('Password changed successfully')
    logger.info('Password changed')
    
    // Reset password form
    Object.assign(passwordForm, {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    })
    passwordFormRef.value.resetFields()
  } catch (error) {
    logger.error('Change password error:', error)
  } finally {
    passwordLoading.value = false
  }
}

const resetForm = () => {
  loadProfileData()
  editFormRef.value.resetFields()
}

const showAvatarModal = () => {
  avatarModalVisible.value = true
  fileList.value = []
}

const beforeUpload = (file) => {
  const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png'
  if (!isJpgOrPng) {
    message.error('You can only upload JPG/PNG file!')
  }
  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isLt2M) {
    message.error('Image must smaller than 2MB!')
  }
  return isJpgOrPng && isLt2M
}

const handleAvatarUpload = async () => {
  if (fileList.value.length === 0) {
    message.warning('Please select an image')
    return
  }
  
  try {
    // Simulate upload
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const file = fileList.value[0]
    const reader = new FileReader()
    reader.onload = (e) => {
      profileData.value.avatar = e.target.result
      message.success('Avatar updated successfully')
      logger.info('Avatar updated')
    }
    reader.readAsDataURL(file.originFileObj)
    
    avatarModalVisible.value = false
  } catch (error) {
    logger.error('Avatar upload error:', error)
    message.error('Failed to upload avatar')
  }
}

const formatDate = (date) => {
  return new Date(date).toLocaleString()
}

onMounted(() => {
  loadProfileData()
})
</script>

<style scoped>
.profile {
  padding: 0;
}

.profile-card,
.edit-card,
.password-card {
  margin-bottom: 24px;
}

.profile-avatar {
  text-align: center;
  margin-bottom: 24px;
}

.profile-avatar .ant-avatar {
  margin-bottom: 8px;
}

.ant-descriptions {
  margin-top: 16px;
}
</style>
