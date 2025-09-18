<template>
  <div class="user-management">
    <a-card title="User Management" class="management-card">
      <template #extra>
        <a-space>
          <a-button type="primary" @click="showCreateModal">
              <template #icon>
                <PlusOutlined />
              </template>
              Add User
            </a-button>
            <a-button @click="refreshData">
              <template #icon>
                <ReloadOutlined />
              </template>
              Refresh
            </a-button>
        </a-space>
      </template>
      
      <!-- Search and Filters -->
      <div class="search-section">
        <a-row :gutter="16">
          <a-col :span="8">
            <a-input
              v-model:value="searchText"
              placeholder="Search users..."
              @change="handleSearch"
            >
              <template #prefix>
                <SearchOutlined />
              </template>
            </a-input>
          </a-col>
          <a-col :span="6">
            <a-select
              v-model:value="statusFilter"
              placeholder="Status"
              allow-clear
              @change="handleFilter"
              style="width: 100%"
            >
              <a-select-option value="active">Active</a-select-option>
              <a-select-option value="inactive">Inactive</a-select-option>
            </a-select>
          </a-col>
          <a-col :span="6">
            <a-select
              v-model:value="roleFilter"
              placeholder="Role"
              allow-clear
              @change="handleFilter"
              style="width: 100%"
            >
              <a-select-option value="admin">Admin</a-select-option>
              <a-select-option value="user">User</a-select-option>
            </a-select>
          </a-col>
        </a-row>
      </div>
      
      <!-- User Table -->
      <a-table
        :columns="columns"
        :data-source="userStore.userList"
        :loading="userStore.loading"
        :pagination="pagination"
        :row-selection="rowSelection"
        row-key="id"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'status'">
            <a-tag :color="record.status === 'active' ? 'green' : 'red'">
              {{ record.status }}
            </a-tag>
          </template>
          
          <template v-if="column.key === 'role'">
            <a-tag :color="record.role === 'admin' ? 'blue' : 'default'">
              {{ record.role }}
            </a-tag>
          </template>
          
          <template v-if="column.key === 'createdAt'">
            {{ formatDate(record.createdAt) }}
          </template>
          
          <template v-if="column.key === 'actions'">
            <a-space>
              <a-button type="link" size="small" @click="showEditModal(record)">
                <EditOutlined />
                Edit
              </a-button>
              <a-button type="link" size="small" danger @click="handleDelete(record)">
                <DeleteOutlined />
                Delete
              </a-button>
            </a-space>
          </template>
        </template>
      </a-table>
      
      <!-- Batch Actions -->
      <div v-if="selectedRowKeys.length > 0" class="batch-actions">
        <a-space>
          <span>Selected {{ selectedRowKeys.length }} users</span>
          <a-button danger @click="handleBatchDelete">
            <DeleteOutlined />
            Delete Selected
          </a-button>
        </a-space>
      </div>
    </a-card>
    
    <!-- Create/Edit User Modal -->
    <a-modal
      v-model:open="modalVisible"
      :title="isEdit ? 'Edit User' : 'Create User'"
      @ok="handleModalOk"
      @cancel="handleModalCancel"
    >
      <a-form
        :model="formData"
        :rules="formRules"
        ref="formRef"
        layout="vertical"
      >
        <a-form-item label="Username" name="username">
          <a-input v-model:value="formData.username" />
        </a-form-item>
        
        <a-form-item label="Email" name="email">
          <a-input v-model:value="formData.email" />
        </a-form-item>
        
        <a-form-item label="Full Name" name="fullName">
          <a-input v-model:value="formData.fullName" />
        </a-form-item>
        
        <a-form-item label="Role" name="role">
          <a-select v-model:value="formData.role">
            <a-select-option value="admin">Admin</a-select-option>
            <a-select-option value="user">User</a-select-option>
          </a-select>
        </a-form-item>
        
        <a-form-item label="Status" name="status">
          <a-select v-model:value="formData.status">
            <a-select-option value="active">Active</a-select-option>
            <a-select-option value="inactive">Inactive</a-select-option>
          </a-select>
        </a-form-item>
        
        <a-form-item v-if="!isEdit" label="Password" name="password">
          <a-input-password v-model:value="formData.password" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { message, Modal } from 'ant-design-vue'
import { useUserStore } from '@/stores/user'
import { logger } from '@/utils/logger'
import {
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined
} from '@ant-design/icons-vue'

const userStore = useUserStore()

// Table configuration
const columns = [
  {
    title: 'ID',
    dataIndex: 'id',
    key: 'id',
    width: 80
  },
  {
    title: 'Username',
    dataIndex: 'username',
    key: 'username'
  },
  {
    title: 'Email',
    dataIndex: 'email',
    key: 'email'
  },
  {
    title: 'Full Name',
    dataIndex: 'fullName',
    key: 'fullName'
  },
  {
    title: 'Role',
    dataIndex: 'role',
    key: 'role'
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status'
  },
  {
    title: 'Created At',
    dataIndex: 'createdAt',
    key: 'createdAt'
  },
  {
    title: 'Actions',
    key: 'actions',
    width: 150
  }
]

// Search and filters
const searchText = ref('')
const statusFilter = ref(undefined)
const roleFilter = ref(undefined)

// Table pagination
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`
})

// Row selection
const selectedRowKeys = ref([])
const selectedRows = ref([])

const rowSelection = {
  selectedRowKeys: selectedRowKeys,
  onChange: (keys, rows) => {
    selectedRowKeys.value = keys
    selectedRows.value = rows
  }
}

// Modal
const modalVisible = ref(false)
const isEdit = ref(false)
const formRef = ref()

const formData = reactive({
  id: null,
  username: '',
  email: '',
  fullName: '',
  role: 'user',
  status: 'active',
  password: ''
})

const formRules = {
  username: [
    { required: true, message: 'Please input username!' }
  ],
  email: [
    { required: true, message: 'Please input email!' },
    { type: 'email', message: 'Please input valid email!' }
  ],
  fullName: [
    { required: true, message: 'Please input full name!' }
  ],
  role: [
    { required: true, message: 'Please select role!' }
  ],
  status: [
    { required: true, message: 'Please select status!' }
  ],
  password: [
    { required: true, message: 'Please input password!' },
    { min: 6, message: 'Password must be at least 6 characters!' }
  ]
}

// Methods
const loadUsers = async () => {
  try {
    const params = {
      page: pagination.current,
      pageSize: pagination.pageSize,
      search: searchText.value,
      status: statusFilter.value,
      role: roleFilter.value
    }
    
    const result = await userStore.getUserList(params)
    
    if (result.success) {
      pagination.total = result.data.total
      logger.info('Users loaded successfully', { count: result.data.list.length })
    } else {
      message.error(result.message)
    }
  } catch (error) {
    message.error('Failed to load users')
    logger.error('Load users error:', error)
  }
}

const refreshData = () => {
  pagination.current = 1
  loadUsers()
}

const handleSearch = () => {
  pagination.current = 1
  loadUsers()
}

const handleFilter = () => {
  pagination.current = 1
  loadUsers()
}

const handleTableChange = (pag) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
  loadUsers()
}

const showCreateModal = () => {
  isEdit.value = false
  modalVisible.value = true
  resetForm()
}

const showEditModal = (record) => {
  isEdit.value = true
  modalVisible.value = true
  Object.assign(formData, record)
  formData.password = '' // Don't show password in edit mode
}

const handleModalOk = async () => {
  try {
    await formRef.value.validate()
    
    if (isEdit.value) {
      const result = await userStore.updateUser(formData.id, formData)
      if (result.success) {
        message.success('User updated successfully')
        modalVisible.value = false
        loadUsers()
      } else {
        message.error(result.message)
      }
    } else {
      const result = await userStore.createUser(formData)
      if (result.success) {
        message.success('User created successfully')
        modalVisible.value = false
        loadUsers()
      } else {
        message.error(result.message)
      }
    }
  } catch (error) {
    logger.error('Modal submit error:', error)
  }
}

const handleModalCancel = () => {
  modalVisible.value = false
  resetForm()
}

const resetForm = () => {
  Object.assign(formData, {
    id: null,
    username: '',
    email: '',
    fullName: '',
    role: 'user',
    status: 'active',
    password: ''
  })
  formRef.value?.resetFields()
}

const handleDelete = (record) => {
  Modal.confirm({
    title: 'Are you sure you want to delete this user?',
    content: `User: ${record.username}`,
    okText: 'Yes',
    okType: 'danger',
    cancelText: 'No',
    onOk: async () => {
      const result = await userStore.deleteUser(record.id)
      if (result.success) {
        message.success('User deleted successfully')
        loadUsers()
      } else {
        message.error(result.message)
      }
    }
  })
}

const handleBatchDelete = () => {
  Modal.confirm({
    title: 'Are you sure you want to delete selected users?',
    content: `Selected ${selectedRowKeys.value.length} users`,
    okText: 'Yes',
    okType: 'danger',
    cancelText: 'No',
    onOk: async () => {
      const result = await userStore.batchDeleteUsers(selectedRowKeys.value)
      if (result.success) {
        message.success('Users deleted successfully')
        selectedRowKeys.value = []
        selectedRows.value = []
        loadUsers()
      } else {
        message.error(result.message)
      }
    }
  })
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString()
}

onMounted(() => {
  loadUsers()
})
</script>

<style scoped>
.user-management {
  padding: 0;
}

.management-card {
  margin-bottom: 24px;
}

.search-section {
  margin-bottom: 16px;
  padding: 16px;
  background: #fafafa;
  border-radius: 6px;
}

.batch-actions {
  margin-top: 16px;
  padding: 12px;
  background: #fff2e8;
  border: 1px solid #ffd591;
  border-radius: 6px;
}
</style>
