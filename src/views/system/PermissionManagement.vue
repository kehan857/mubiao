<template>
  <div class="permission-management">
    <!-- 页面标题 -->
    <div class="page-header">
      <div class="header-content">
        <div class="title-area">
          <h2>权限配置</h2>
          <p>管理系统用户权限和角色配置</p>
        </div>
        <div class="actions">
          <a-space>
            <a-button type="primary" @click="showAddRoleModal = true">
              <PlusOutlined />
              新增角色
            </a-button>
            <a-button @click="refreshData">
              <ReloadOutlined />
              刷新
            </a-button>
          </a-space>
        </div>
      </div>
    </div>

    <!-- 角色权限管理 -->
    <a-card title="角色权限管理">
      <a-table
        :dataSource="roles"
        :columns="roleColumns"
        :pagination="{ pageSize: 10 }"
        row-key="id"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'permissions'">
            <a-space wrap>
              <a-tag 
                v-for="permission in record.permissions" 
                :key="permission"
                :color="getPermissionColor(permission)"
              >
                {{ getPermissionText(permission) }}
              </a-tag>
            </a-space>
          </template>
          <template v-else-if="column.key === 'status'">
            <a-switch 
              v-model:checked="record.status" 
              @change="toggleRoleStatus(record)"
            />
          </template>
          <template v-else-if="column.key === 'actions'">
            <a-space>
              <a-button size="small" @click="editRole(record)">
                <EditOutlined />
                编辑
              </a-button>
              <a-button size="small" @click="assignUsers(record)">
                <UserOutlined />
                分配用户
              </a-button>
              <a-button size="small" danger @click="deleteRole(record)">
                <DeleteOutlined />
                删除
              </a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 用户权限分配 -->
    <a-card title="用户权限分配" style="margin-top: 16px">
      <a-table
        :dataSource="users"
        :columns="userColumns"
        :pagination="{ pageSize: 10 }"
        row-key="id"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'role'">
            <a-tag :color="getRoleColor(record.role)">
              {{ getRoleText(record.role) }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'permissions'">
            <a-space wrap>
              <a-tag 
                v-for="permission in getUserPermissions(record.role)" 
                :key="permission"
                :color="getPermissionColor(permission)"
                size="small"
              >
                {{ getPermissionText(permission) }}
              </a-tag>
            </a-space>
          </template>
          <template v-else-if="column.key === 'actions'">
            <a-space>
              <a-button size="small" @click="editUserRole(record)">
                <EditOutlined />
                修改角色
              </a-button>
              <a-button size="small" @click="viewUserDetail(record)">
                <EyeOutlined />
                查看详情
              </a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 新增/编辑角色弹窗 -->
    <a-modal
      v-model:open="showAddRoleModal"
      :title="editingRole ? '编辑角色' : '新增角色'"
      @ok="handleRoleSubmit"
      @cancel="resetRoleForm"
    >
      <a-form :model="roleForm" layout="vertical">
        <a-form-item label="角色名称" required>
          <a-input v-model:value="roleForm.name" placeholder="请输入角色名称" />
        </a-form-item>
        <a-form-item label="角色代码" required>
          <a-input v-model:value="roleForm.code" placeholder="请输入角色代码" />
        </a-form-item>
        <a-form-item label="角色描述">
          <a-textarea v-model:value="roleForm.description" placeholder="请输入角色描述" />
        </a-form-item>
        <a-form-item label="权限配置" required>
          <a-checkbox-group v-model:value="roleForm.permissions">
            <a-row :gutter="[16, 16]">
              <a-col :span="8" v-for="permission in allPermissions" :key="permission.value">
                <a-checkbox :value="permission.value">
                  {{ permission.label }}
                </a-checkbox>
              </a-col>
            </a-row>
          </a-checkbox-group>
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 用户分配弹窗 -->
    <a-modal
      v-model:open="showUserAssignModal"
      title="分配用户"
      @ok="handleUserAssign"
      @cancel="showUserAssignModal = false"
    >
      <a-transfer
        v-model:target-keys="assignedUsers"
        :data-source="allUsers"
        :titles="['可选用户', '已分配用户']"
        :render="item => item.name"
        show-search
      />
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { message } from 'ant-design-vue'
import {
  PlusOutlined,
  ReloadOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  EyeOutlined
} from '@ant-design/icons-vue'

// 页面状态
const showAddRoleModal = ref(false)
const showUserAssignModal = ref(false)
const editingRole = ref<any>(null)
const assignedUsers = ref<string[]>([])

// 表单数据
const roleForm = reactive({
  name: '',
  code: '',
  description: '',
  permissions: []
})

// 角色数据
const roles = ref([
  {
    id: 1,
    name: '系统管理员',
    code: 'admin',
    description: '拥有系统所有权限',
    permissions: ['dashboard', 'plans', 'summaries', 'audit', 'monitoring', 'system'],
    status: true,
    userCount: 2
  },
  {
    id: 2,
    name: '部门经理',
    code: 'manager',
    description: '部门级管理权限',
    permissions: ['dashboard', 'plans', 'summaries', 'audit', 'monitoring'],
    status: true,
    userCount: 8
  },
  {
    id: 3,
    name: '普通员工',
    code: 'employee',
    description: '基础操作权限',
    permissions: ['dashboard', 'plans', 'summaries'],
    status: true,
    userCount: 45
  }
])

// 用户数据
const users = ref([
  {
    id: 1,
    name: '张三',
    username: 'zhangsan',
    email: 'zhangsan@company.com',
    department: '技术部',
    role: 'manager'
  },
  {
    id: 2,
    name: '李四',
    username: 'lisi',
    email: 'lisi@company.com',
    department: '产品部',
    role: 'employee'
  }
])

// 所有权限
const allPermissions = [
  { label: '首页', value: 'dashboard' },
  { label: '目标计划', value: 'plans' },
  { label: '工作总结', value: 'summaries' },
  { label: '模板管理', value: 'templates' },
  { label: '审核管理', value: 'audit' },
  { label: '监控看板', value: 'monitoring' },
  { label: '系统设置', value: 'system' }
]

// 所有用户（用于分配）
const allUsers = ref([
  { key: '1', name: '张三' },
  { key: '2', name: '李四' },
  { key: '3', name: '王五' },
  { key: '4', name: '赵六' }
])

// 角色表格列
const roleColumns = [
  {
    title: '角色名称',
    dataIndex: 'name',
    key: 'name'
  },
  {
    title: '角色代码',
    dataIndex: 'code',
    key: 'code'
  },
  {
    title: '描述',
    dataIndex: 'description',
    key: 'description'
  },
  {
    title: '权限',
    key: 'permissions',
    width: 300
  },
  {
    title: '用户数',
    dataIndex: 'userCount',
    key: 'userCount'
  },
  {
    title: '状态',
    key: 'status',
    width: 80
  },
  {
    title: '操作',
    key: 'actions',
    width: 200
  }
]

// 用户表格列
const userColumns = [
  {
    title: '姓名',
    dataIndex: 'name',
    key: 'name'
  },
  {
    title: '用户名',
    dataIndex: 'username',
    key: 'username'
  },
  {
    title: '邮箱',
    dataIndex: 'email',
    key: 'email'
  },
  {
    title: '部门',
    dataIndex: 'department',
    key: 'department'
  },
  {
    title: '角色',
    key: 'role'
  },
  {
    title: '权限',
    key: 'permissions',
    width: 300
  },
  {
    title: '操作',
    key: 'actions',
    width: 150
  }
]

// 获取权限颜色
const getPermissionColor = (permission: string) => {
  const colorMap: Record<string, string> = {
    dashboard: 'blue',
    plans: 'green',
    summaries: 'orange',
    templates: 'purple',
    audit: 'red',
    monitoring: 'cyan',
    system: 'magenta'
  }
  return colorMap[permission] || 'default'
}

// 获取权限文本
const getPermissionText = (permission: string) => {
  const textMap: Record<string, string> = {
    dashboard: '首页',
    plans: '目标计划',
    summaries: '工作总结',
    templates: '模板管理',
    audit: '审核管理',
    monitoring: '监控看板',
    system: '系统设置'
  }
  return textMap[permission] || permission
}

// 获取角色颜色
const getRoleColor = (role: string) => {
  const colorMap: Record<string, string> = {
    admin: 'red',
    manager: 'blue',
    employee: 'green'
  }
  return colorMap[role] || 'default'
}

// 获取角色文本
const getRoleText = (role: string) => {
  const textMap: Record<string, string> = {
    admin: '系统管理员',
    manager: '部门经理',
    employee: '普通员工'
  }
  return textMap[role] || role
}

// 获取用户权限
const getUserPermissions = (role: string) => {
  const roleData = roles.value.find(r => r.code === role)
  return roleData ? roleData.permissions : []
}

// 切换角色状态
const toggleRoleStatus = (record: any) => {
  message.success(`${record.name} 状态已${record.status ? '启用' : '禁用'}`)
}

// 编辑角色
const editRole = (record: any) => {
  editingRole.value = record
  Object.assign(roleForm, record)
  showAddRoleModal.value = true
}

// 删除角色
const deleteRole = (record: any) => {
  message.success(`角色 ${record.name} 删除成功`)
}

// 分配用户
const assignUsers = (record: any) => {
  editingRole.value = record
  showUserAssignModal.value = true
}

// 修改用户角色
const editUserRole = (record: any) => {
  message.info('修改用户角色功能')
}

// 查看用户详情
const viewUserDetail = (record: any) => {
  message.info('查看用户详情功能')
}

// 提交角色表单
const handleRoleSubmit = () => {
  message.success('角色保存成功')
  resetRoleForm()
  showAddRoleModal.value = false
}

// 重置角色表单
const resetRoleForm = () => {
  Object.assign(roleForm, {
    name: '',
    code: '',
    description: '',
    permissions: []
  })
  editingRole.value = null
}

// 用户分配提交
const handleUserAssign = () => {
  message.success('用户分配成功')
  showUserAssignModal.value = false
}

// 刷新数据
const refreshData = () => {
  message.success('数据刷新成功')
}
</script>

<style scoped>
.permission-management {
  padding: 0;
}

.page-header {
  background: #fff;
  padding: 24px 24px 16px;
  margin-bottom: 16px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.title-area h2 {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
  color: #1890ff;
}

.title-area p {
  margin: 0;
  color: #666;
  font-size: 14px;
}
</style> 