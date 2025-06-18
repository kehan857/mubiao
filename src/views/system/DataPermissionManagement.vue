<template>
  <div class="data-permission-management">
    <!-- 页面标题 -->
    <div class="page-header">
      <div class="header-content">
        <div class="title-area">
          <h2>数据权限管理</h2>
          <p>配置不同角色的计划总结填写权限，实现灵活的数据权限控制</p>
        </div>
        <div class="actions">
          <a-space>
            <a-button type="primary" @click="showAddConfigModal = true">
              <PlusOutlined />
              新增权限配置
            </a-button>
            <a-button @click="refreshData">
              <ReloadOutlined />
              刷新
            </a-button>
          </a-space>
        </div>
      </div>
    </div>

    <!-- 筛选区域 -->
    <a-card style="margin-bottom: 16px">
      <a-row :gutter="16">
        <a-col :span="6">
          <a-select
            v-model:value="filters.role"
            placeholder="选择角色"
            style="width: 100%"
            allow-clear
            @change="handleFilterChange"
          >
            <a-select-option v-for="role in roles" :key="role.value" :value="role.value">
              {{ role.label }}
            </a-select-option>
          </a-select>
        </a-col>
        <a-col :span="6">
          <a-select
            v-model:value="filters.department"
            placeholder="选择部门"
            style="width: 100%"
            allow-clear
            @change="handleFilterChange"
          >
            <a-select-option v-for="dept in departments" :key="dept.value" :value="dept.value">
              {{ dept.label }}
            </a-select-option>
          </a-select>
        </a-col>
        <a-col :span="6">
          <a-select
            v-model:value="filters.status"
            placeholder="选择状态"
            style="width: 100%"
            allow-clear
            @change="handleFilterChange"
          >
            <a-select-option value="active">启用</a-select-option>
            <a-select-option value="inactive">禁用</a-select-option>
          </a-select>
        </a-col>
        <a-col :span="6">
          <a-input
            v-model:value="filters.keyword"
            placeholder="搜索关键词"
            @change="handleFilterChange"
          >
            <template #prefix>
              <SearchOutlined />
            </template>
          </a-input>
        </a-col>
      </a-row>
    </a-card>

    <!-- 数据权限配置表格 -->
    <a-card title="数据权限配置">
      <a-table
        :dataSource="filteredConfigs"
        :columns="configColumns"
        :pagination="{ pageSize: 10 }"
        row-key="id"
        :loading="loading"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'role'">
            <a-tag :color="getRoleColor(record.role)">
              {{ getRoleText(record.role) }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'department'">
            <a-tag color="blue">{{ getDepartmentText(record.department) }}</a-tag>
          </template>
          <template v-else-if="column.key === 'permissions'">
            <a-space wrap>
              <a-tag 
                v-for="permission in record.permissions" 
                :key="permission"
                :color="getPermissionColor(permission)"
                size="small"
              >
                {{ getPermissionText(permission) }}
              </a-tag>
            </a-space>
          </template>
          <template v-else-if="column.key === 'status'">
            <a-switch 
              v-model:checked="record.status" 
              @change="toggleConfigStatus(record)"
              checked-children="启用"
              un-checked-children="禁用"
            />
          </template>
          <template v-else-if="column.key === 'actions'">
            <a-space>
              <a-button size="small" @click="editConfig(record)">
                <EditOutlined />
                编辑
              </a-button>
              <a-button size="small" @click="copyConfig(record)">
                <CopyOutlined />
                复制
              </a-button>
              <a-button size="small" @click="viewConfigDetail(record)">
                <EyeOutlined />
                详情
              </a-button>
              <a-button size="small" danger @click="deleteConfig(record)">
                <DeleteOutlined />
                删除
              </a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 新增/编辑权限配置弹窗 -->
    <a-modal
      v-model:open="showAddConfigModal"
      :title="editingConfig ? '编辑数据权限配置' : '新增数据权限配置'"
      width="800px"
      @ok="handleConfigSubmit"
      @cancel="resetConfigForm"
    >
      <a-form :model="configForm" layout="vertical">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="角色" required>
              <a-select v-model:value="configForm.role" placeholder="请选择角色">
                <a-select-option v-for="role in roles" :key="role.value" :value="role.value">
                  {{ role.label }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="部门" required>
              <a-select v-model:value="configForm.department" placeholder="请选择部门">
                <a-select-option v-for="dept in departments" :key="dept.value" :value="dept.value">
                  {{ dept.label }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>

        <a-form-item label="配置名称" required>
          <a-input v-model:value="configForm.name" placeholder="请输入配置名称" />
        </a-form-item>

        <a-form-item label="配置描述">
          <a-textarea v-model:value="configForm.description" placeholder="请输入配置描述" :rows="3" />
        </a-form-item>

        <a-form-item label="数据权限配置" required>
          <a-tabs>
            <a-tab-pane key="plans" tab="计划权限">
              <a-checkbox-group v-model:value="configForm.permissions.plans">
                <a-row :gutter="[16, 16]">
                  <a-col :span="12" v-for="plan in planPermissions" :key="plan.value">
                    <a-checkbox :value="plan.value">
                      <span>{{ plan.label }}</span>
                      <a-tooltip :title="plan.description">
                        <InfoCircleOutlined style="margin-left: 4px; color: #999;" />
                      </a-tooltip>
                    </a-checkbox>
                  </a-col>
                </a-row>
              </a-checkbox-group>
            </a-tab-pane>

            <a-tab-pane key="summaries" tab="总结权限">
              <a-checkbox-group v-model:value="configForm.permissions.summaries">
                <a-row :gutter="[16, 16]">
                  <a-col :span="12" v-for="summary in summaryPermissions" :key="summary.value">
                    <a-checkbox :value="summary.value">
                      <span>{{ summary.label }}</span>
                      <a-tooltip :title="summary.description">
                        <InfoCircleOutlined style="margin-left: 4px; color: #999;" />
                      </a-tooltip>
                    </a-checkbox>
                  </a-col>
                </a-row>
              </a-checkbox-group>
            </a-tab-pane>

            <a-tab-pane key="operations" tab="操作权限">
              <a-checkbox-group v-model:value="configForm.permissions.operations">
                <a-row :gutter="[16, 16]">
                  <a-col :span="12" v-for="operation in operationPermissions" :key="operation.value">
                    <a-checkbox :value="operation.value">
                      <span>{{ operation.label }}</span>
                      <a-tooltip :title="operation.description">
                        <InfoCircleOutlined style="margin-left: 4px; color: #999;" />
                      </a-tooltip>
                    </a-checkbox>
                  </a-col>
                </a-row>
              </a-checkbox-group>
            </a-tab-pane>
          </a-tabs>
        </a-form-item>

        <a-form-item label="生效时间">
          <a-range-picker
            v-model:value="configForm.effectiveTime"
            show-time
            format="YYYY-MM-DD HH:mm:ss"
            placeholder="['开始时间', '结束时间']"
            style="width: 100%"
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 配置详情弹窗 -->
    <a-modal
      v-model:open="showDetailModal"
      title="数据权限配置详情"
      width="700px"
      :footer="null"
    >
      <div v-if="selectedConfig" class="config-detail">
        <a-descriptions :column="2" bordered>
          <a-descriptions-item label="配置名称">
            {{ selectedConfig.name }}
          </a-descriptions-item>
          <a-descriptions-item label="角色">
            <a-tag :color="getRoleColor(selectedConfig.role)">
              {{ getRoleText(selectedConfig.role) }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="部门">
            <a-tag color="blue">{{ getDepartmentText(selectedConfig.department) }}</a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="状态">
            <a-tag :color="selectedConfig.status ? 'green' : 'red'">
              {{ selectedConfig.status ? '启用' : '禁用' }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="创建时间">
            {{ selectedConfig.createdAt }}
          </a-descriptions-item>
          <a-descriptions-item label="更新时间">
            {{ selectedConfig.updatedAt }}
          </a-descriptions-item>
          <a-descriptions-item label="配置描述" :span="2">
            {{ selectedConfig.description || '暂无描述' }}
          </a-descriptions-item>
        </a-descriptions>

        <a-divider>权限详情</a-divider>

        <a-tabs>
          <a-tab-pane key="plans" tab="计划权限">
            <a-space wrap>
              <a-tag 
                v-for="permission in selectedConfig.permissions.plans" 
                :key="permission"
                color="green"
              >
                {{ getPlanPermissionText(permission) }}
              </a-tag>
            </a-space>
          </a-tab-pane>
          <a-tab-pane key="summaries" tab="总结权限">
            <a-space wrap>
              <a-tag 
                v-for="permission in selectedConfig.permissions.summaries" 
                :key="permission"
                color="blue"
              >
                {{ getSummaryPermissionText(permission) }}
              </a-tag>
            </a-space>
          </a-tab-pane>
          <a-tab-pane key="operations" tab="操作权限">
            <a-space wrap>
              <a-tag 
                v-for="permission in selectedConfig.permissions.operations" 
                :key="permission"
                color="orange"
              >
                {{ getOperationPermissionText(permission) }}
              </a-tag>
            </a-space>
          </a-tab-pane>
        </a-tabs>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { message } from 'ant-design-vue'
import {
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  CopyOutlined,
  EyeOutlined,
  InfoCircleOutlined
} from '@ant-design/icons-vue'

// 页面状态
const loading = ref(false)
const showAddConfigModal = ref(false)
const showDetailModal = ref(false)
const editingConfig = ref<any>(null)
const selectedConfig = ref<any>(null)

// 筛选条件
const filters = reactive({
  role: '',
  department: '',
  status: '',
  keyword: ''
})

// 表单数据
const configForm = reactive({
  name: '',
  role: '',
  department: '',
  description: '',
  permissions: {
    plans: [],
    summaries: [],
    operations: []
  },
  effectiveTime: null
})

// 角色选项
const roles = [
  { label: '普通员工', value: 'employee' },
  { label: '小组领导', value: 'team_leader' },
  { label: '部门经理', value: 'department_manager' },
  { label: '事业部负责人', value: 'division_manager' },
  { label: '高级管理层', value: 'senior_manager' },
  { label: '系统管理员', value: 'admin' }
]

// 部门选项
const departments = [
  { label: '技术部', value: 'tech' },
  { label: '产品部', value: 'product' },
  { label: '市场部', value: 'marketing' },
  { label: '销售部', value: 'sales' },
  { label: '人事部', value: 'hr' },
  { label: '财务部', value: 'finance' }
]

// 计划权限选项
const planPermissions = [
  { label: '周计划', value: 'weekly_plan', description: '可以填写和查看周计划' },
  { label: '月计划', value: 'monthly_plan', description: '可以填写和查看月计划' },
  { label: '季度计划', value: 'quarterly_plan', description: '可以填写和查看季度计划' },
  { label: '年度计划', value: 'annual_plan', description: '可以填写和查看年度计划' }
]

// 总结权限选项
const summaryPermissions = [
  { label: '周总结', value: 'weekly_summary', description: '可以填写和查看周总结' },
  { label: '月总结', value: 'monthly_summary', description: '可以填写和查看月总结' },
  { label: '季度总结', value: 'quarterly_summary', description: '可以填写和查看季度总结' },
  { label: '年度总结', value: 'annual_summary', description: '可以填写和查看年度总结' }
]

// 操作权限选项
const operationPermissions = [
  { label: '查看权限', value: 'view', description: '可以查看相关数据' },
  { label: '编辑权限', value: 'edit', description: '可以编辑相关数据' },
  { label: '删除权限', value: 'delete', description: '可以删除相关数据' },
  { label: '审核权限', value: 'audit', description: '可以审核相关数据' },
  { label: '导出权限', value: 'export', description: '可以导出相关数据' }
]

// 数据权限配置数据
const configs = ref([
  {
    id: 1,
    name: '普通员工基础权限',
    role: 'employee',
    department: 'tech',
    permissions: {
      plans: ['weekly_plan', 'monthly_plan'],
      summaries: ['weekly_summary', 'monthly_summary'],
      operations: ['view', 'edit']
    },
    status: true,
    description: '普通员工只需要填写周报和月报',
    createdAt: '2024-01-15 10:30:00',
    updatedAt: '2024-01-20 14:20:00'
  },
  {
    id: 2,
    name: '小组领导权限',
    role: 'team_leader',
    department: 'tech',
    permissions: {
      plans: ['weekly_plan', 'monthly_plan', 'quarterly_plan'],
      summaries: ['weekly_summary', 'monthly_summary', 'quarterly_summary'],
      operations: ['view', 'edit', 'audit']
    },
    status: true,
    description: '小组领导需要填写周报、月报、季报',
    createdAt: '2024-01-15 10:35:00',
    updatedAt: '2024-01-20 14:25:00'
  },
  {
    id: 3,
    name: '事业部负责人全权限',
    role: 'division_manager',
    department: 'tech',
    permissions: {
      plans: ['weekly_plan', 'monthly_plan', 'quarterly_plan', 'annual_plan'],
      summaries: ['weekly_summary', 'monthly_summary', 'quarterly_summary', 'annual_summary'],
      operations: ['view', 'edit', 'delete', 'audit', 'export']
    },
    status: true,
    description: '事业部负责人需要填写所有类型的计划和总结',
    createdAt: '2024-01-15 10:40:00',
    updatedAt: '2024-01-20 14:30:00'
  }
])

// 表格列定义
const configColumns = [
  {
    title: '配置名称',
    dataIndex: 'name',
    key: 'name',
    width: 200
  },
  {
    title: '角色',
    key: 'role',
    width: 120
  },
  {
    title: '部门',
    key: 'department',
    width: 100
  },
  {
    title: '权限范围',
    key: 'permissions',
    width: 300
  },
  {
    title: '状态',
    key: 'status',
    width: 80
  },
  {
    title: '更新时间',
    dataIndex: 'updatedAt',
    key: 'updatedAt',
    width: 150
  },
  {
    title: '操作',
    key: 'actions',
    width: 200,
    fixed: 'right'
  }
]

// 过滤后的配置数据
const filteredConfigs = computed(() => {
  let result = configs.value

  if (filters.role) {
    result = result.filter(config => config.role === filters.role)
  }

  if (filters.department) {
    result = result.filter(config => config.department === filters.department)
  }

  if (filters.status) {
    const isActive = filters.status === 'active'
    result = result.filter(config => config.status === isActive)
  }

  if (filters.keyword) {
    result = result.filter(config => 
      config.name.includes(filters.keyword) ||
      config.description.includes(filters.keyword)
    )
  }

  return result
})

// 获取角色颜色
const getRoleColor = (role: string) => {
  const colorMap: Record<string, string> = {
    employee: 'green',
    team_leader: 'blue',
    department_manager: 'orange',
    division_manager: 'red',
    senior_manager: 'purple',
    admin: 'magenta'
  }
  return colorMap[role] || 'default'
}

// 获取角色文本
const getRoleText = (role: string) => {
  const roleMap = roles.find(r => r.value === role)
  return roleMap ? roleMap.label : role
}

// 获取部门文本
const getDepartmentText = (department: string) => {
  const deptMap = departments.find(d => d.value === department)
  return deptMap ? deptMap.label : department
}

// 获取权限颜色
const getPermissionColor = (permission: string) => {
  if (permission.includes('weekly')) return 'green'
  if (permission.includes('monthly')) return 'blue'
  if (permission.includes('quarterly')) return 'orange'
  if (permission.includes('annual')) return 'red'
  return 'default'
}

// 获取权限文本
const getPermissionText = (permission: string) => {
  const allPermissions = [...planPermissions, ...summaryPermissions, ...operationPermissions]
  const permissionMap = allPermissions.find(p => p.value === permission)
  return permissionMap ? permissionMap.label : permission
}

// 获取计划权限文本
const getPlanPermissionText = (permission: string) => {
  const permissionMap = planPermissions.find(p => p.value === permission)
  return permissionMap ? permissionMap.label : permission
}

// 获取总结权限文本
const getSummaryPermissionText = (permission: string) => {
  const permissionMap = summaryPermissions.find(p => p.value === permission)
  return permissionMap ? permissionMap.label : permission
}

// 获取操作权限文本
const getOperationPermissionText = (permission: string) => {
  const permissionMap = operationPermissions.find(p => p.value === permission)
  return permissionMap ? permissionMap.label : permission
}

// 筛选变化处理
const handleFilterChange = () => {
  console.log('筛选条件变化:', filters)
}

// 切换配置状态
const toggleConfigStatus = (record: any) => {
  message.success(`配置 ${record.name} 已${record.status ? '启用' : '禁用'}`)
}

// 编辑配置
const editConfig = (record: any) => {
  editingConfig.value = record
  Object.assign(configForm, {
    name: record.name,
    role: record.role,
    department: record.department,
    description: record.description,
    permissions: { ...record.permissions },
    effectiveTime: null
  })
  showAddConfigModal.value = true
}

// 复制配置
const copyConfig = (record: any) => {
  Object.assign(configForm, {
    name: record.name + ' - 副本',
    role: record.role,
    department: record.department,
    description: record.description,
    permissions: { ...record.permissions },
    effectiveTime: null
  })
  editingConfig.value = null
  showAddConfigModal.value = true
}

// 查看配置详情
const viewConfigDetail = (record: any) => {
  selectedConfig.value = record
  showDetailModal.value = true
}

// 删除配置
const deleteConfig = (record: any) => {
  message.success(`配置 ${record.name} 删除成功`)
}

// 提交配置表单
const handleConfigSubmit = () => {
  message.success('数据权限配置保存成功')
  resetConfigForm()
  showAddConfigModal.value = false
}

// 重置配置表单
const resetConfigForm = () => {
  Object.assign(configForm, {
    name: '',
    role: '',
    department: '',
    description: '',
    permissions: {
      plans: [],
      summaries: [],
      operations: []
    },
    effectiveTime: null
  })
  editingConfig.value = null
}

// 刷新数据
const refreshData = () => {
  message.success('数据刷新成功')
}
</script>

<style scoped>
.data-permission-management {
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
  color: #262626;
  font-size: 20px;
  font-weight: 600;
}

.title-area p {
  margin: 0;
  color: #8c8c8c;
  font-size: 14px;
}

.config-detail {
  max-height: 500px;
  overflow-y: auto;
}

.config-detail .ant-descriptions {
  margin-bottom: 16px;
}
</style> 