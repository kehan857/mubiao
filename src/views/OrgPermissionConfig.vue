<template>
  <div class="org-permission-config">
    <!-- 页面标题 -->
    <div class="page-header">
      <div class="header-content">
        <div class="title-area">
          <h2>组织权限配置</h2>
          <p>配置不同组织、不同角色的填报模板和审批流程</p>
        </div>
        <div class="actions">
          <a-button type="primary" @click="showConfigModal = true">
            <PlusOutlined />
            新增配置
          </a-button>
        </div>
      </div>
    </div>

    <!-- 筛选区域 -->
    <a-card style="margin-bottom: 16px">
      <a-row :gutter="16">
        <a-col :span="6">
          <a-select
            v-model:value="filters.organization"
            placeholder="选择组织"
            style="width: 100%"
            @change="handleFilterChange"
          >
            <a-select-option value="">全部组织</a-select-option>
            <a-select-option v-for="org in organizations" :key="org.id" :value="org.id">
              {{ org.name }}
            </a-select-option>
          </a-select>
        </a-col>
        <a-col :span="6">
          <a-select
            v-model:value="filters.role"
            placeholder="选择角色"
            style="width: 100%"
            @change="handleFilterChange"
          >
            <a-select-option value="">全部角色</a-select-option>
            <a-select-option v-for="role in roles" :key="role.id" :value="role.id">
              {{ role.name }}
            </a-select-option>
          </a-select>
        </a-col>
        <a-col :span="6">
          <a-select
            v-model:value="filters.templateType"
            placeholder="选择模板类型"
            style="width: 100%"
            @change="handleFilterChange"
          >
            <a-select-option value="">全部类型</a-select-option>
            <a-select-option value="daily-report">日报模板</a-select-option>
            <a-select-option value="weekly-report">周报模板</a-select-option>
            <a-select-option value="monthly-plan">月度计划</a-select-option>
            <a-select-option value="goal-template">目标模板</a-select-option>
          </a-select>
        </a-col>
        <a-col :span="6">
          <a-input-search
            v-model:value="filters.keyword"
            placeholder="搜索配置"
            @search="handleFilterChange"
          />
        </a-col>
      </a-row>
    </a-card>

    <!-- 配置列表 -->
    <a-card title="权限配置列表">
      <a-table
        :dataSource="filteredConfigs"
        :columns="configColumns"
        :loading="loading"
        :pagination="pagination"
        @change="handleTableChange"
        row-key="id"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'organization'">
            <a-tag color="blue">{{ getOrganizationName(record.organizationId) }}</a-tag>
          </template>

          <template v-else-if="column.key === 'role'">
            <a-tag color="green">{{ getRoleName(record.roleId) }}</a-tag>
          </template>

          <template v-else-if="column.key === 'templateType'">
            <a-tag :color="getTemplateTypeColor(record.templateType)">
              {{ getTemplateTypeText(record.templateType) }}
            </a-tag>
          </template>

          <template v-else-if="column.key === 'template'">
            <span>{{ getTemplateName(record.templateId) }}</span>
          </template>

          <template v-else-if="column.key === 'approvalFlow'">
            <a-space>
              <a-tag v-for="step in record.approvalFlow" :key="step.id" color="orange">
                {{ getRoleName(step.roleId) }}
              </a-tag>
            </a-space>
          </template>

          <template v-else-if="column.key === 'status'">
            <a-switch
              v-model:checked="record.enabled"
              @change="handleStatusChange(record)"
              checked-children="启用"
              un-checked-children="禁用"
            />
          </template>

          <template v-else-if="column.key === 'actions'">
            <a-space>
              <a-button type="link" size="small" @click="editConfig(record)">
                编辑
              </a-button>
              <a-button type="link" size="small" @click="copyConfig(record)">
                复制
              </a-button>
              <a-button type="link" size="small" @click="deleteConfig(record)" danger>
                删除
              </a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 新增/编辑配置弹窗 -->
    <a-modal
      v-model:open="showConfigModal"
      :title="isEditMode ? '编辑权限配置' : '新增权限配置'"
      width="800px"
      @ok="handleSaveConfig"
      @cancel="resetConfigForm"
    >
      <a-form
        ref="configFormRef"
        :model="configForm"
        :rules="configRules"
        layout="vertical"
      >
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="组织" name="organizationId">
              <a-select v-model:value="configForm.organizationId" placeholder="选择组织">
                <a-select-option v-for="org in organizations" :key="org.id" :value="org.id">
                  {{ org.name }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="角色" name="roleId">
              <a-select v-model:value="configForm.roleId" placeholder="选择角色">
                <a-select-option v-for="role in roles" :key="role.id" :value="role.id">
                  {{ role.name }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="模板类型" name="templateType">
              <a-select v-model:value="configForm.templateType" placeholder="选择模板类型">
                <a-select-option value="daily-report">日报模板</a-select-option>
                <a-select-option value="weekly-report">周报模板</a-select-option>
                <a-select-option value="monthly-plan">月度计划</a-select-option>
                <a-select-option value="goal-template">目标模板</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="指定模板" name="templateId">
              <a-select v-model:value="configForm.templateId" placeholder="选择模板">
                <a-select-option v-for="template in availableTemplates" :key="template.id" :value="template.id">
                  {{ template.name }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>

        <a-form-item label="审批流程">
          <div class="approval-flow-config">
            <div v-for="(step, index) in configForm.approvalFlow" :key="index" class="approval-step">
              <a-row :gutter="8" align="middle">
                <a-col :span="4">
                  <span>步骤{{ index + 1 }}:</span>
                </a-col>
                <a-col :span="16">
                  <a-select 
                    v-model:value="step.roleId" 
                    placeholder="选择审批角色"
                    style="width: 100%"
                  >
                    <a-select-option v-for="role in roles" :key="role.id" :value="role.id">
                      {{ role.name }}
                    </a-select-option>
                  </a-select>
                </a-col>
                <a-col :span="4">
                  <a-button
                    type="text"
                    danger
                    @click="removeApprovalStep(index)"
                    :disabled="configForm.approvalFlow.length === 1"
                  >
                    <DeleteOutlined />
                  </a-button>
                </a-col>
              </a-row>
            </div>
            <a-button type="dashed" @click="addApprovalStep" style="width: 100%; margin-top: 8px">
              <PlusOutlined /> 添加审批步骤
            </a-button>
          </div>
        </a-form-item>

        <a-form-item label="权限设置">
          <a-checkbox-group v-model:value="configForm.permissions">
            <a-row>
              <a-col :span="8">
                <a-checkbox value="read">查看权限</a-checkbox>
              </a-col>
              <a-col :span="8">
                <a-checkbox value="write">编辑权限</a-checkbox>
              </a-col>
              <a-col :span="8">
                <a-checkbox value="delete">删除权限</a-checkbox>
              </a-col>
              <a-col :span="8">
                <a-checkbox value="approve">审批权限</a-checkbox>
              </a-col>
              <a-col :span="8">
                <a-checkbox value="export">导出权限</a-checkbox>
              </a-col>
              <a-col :span="8">
                <a-checkbox value="admin">管理权限</a-checkbox>
              </a-col>
            </a-row>
          </a-checkbox-group>
        </a-form-item>

        <a-form-item label="配置说明">
          <a-textarea
            v-model:value="configForm.description"
            :rows="3"
            placeholder="请输入配置说明"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import {
  PlusOutlined,
  DeleteOutlined
} from '@ant-design/icons-vue'

// 页面状态
const loading = ref(false)
const showConfigModal = ref(false)
const isEditMode = ref(false)

// 筛选条件
const filters = reactive({
  organization: '',
  role: '',
  templateType: '',
  keyword: ''
})

// 表格列定义
const configColumns = [
  {
    title: '组织',
    key: 'organization',
    width: '15%'
  },
  {
    title: '角色',
    key: 'role',
    width: '12%'
  },
  {
    title: '模板类型',
    key: 'templateType',
    width: '12%'
  },
  {
    title: '指定模板',
    key: 'template',
    width: '15%'
  },
  {
    title: '审批流程',
    key: 'approvalFlow',
    width: '20%'
  },
  {
    title: '状态',
    key: 'status',
    width: '10%'
  },
  {
    title: '操作',
    key: 'actions',
    width: '16%'
  }
]

// 分页配置
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total: number) => `共 ${total} 条记录`
})

// 组织数据
const organizations = ref([
  { id: 1, name: '技术部' },
  { id: 2, name: '产品部' },
  { id: 3, name: '市场部' },
  { id: 4, name: '销售部' },
  { id: 5, name: '人事部' }
])

// 角色数据
const roles = ref([
  { id: 1, name: '员工' },
  { id: 2, name: '主管' },
  { id: 3, name: '经理' },
  { id: 4, name: '总监' },
  { id: 5, name: 'HRBP' },
  { id: 6, name: '高管' }
])

// 可用模板数据
const availableTemplates = ref([
  { id: 1, name: '标准日报模板', type: 'daily-report' },
  { id: 2, name: '技术部日报模板', type: 'daily-report' },
  { id: 3, name: '标准周报模板', type: 'weekly-report' },
  { id: 4, name: '销售周报模板', type: 'weekly-report' },
  { id: 5, name: '标准月度计划模板', type: 'monthly-plan' },
  { id: 6, name: '技术部月度计划模板', type: 'monthly-plan' },
  { id: 7, name: '标准目标模板', type: 'goal-template' },
  { id: 8, name: 'OKR目标模板', type: 'goal-template' }
])

// 权限配置数据
const configs = ref([
  {
    id: 1,
    organizationId: 1,
    roleId: 1,
    templateType: 'daily-report',
    templateId: 2,
    approvalFlow: [
      { id: 1, roleId: 2, order: 1 },
      { id: 2, roleId: 3, order: 2 }
    ],
    permissions: ['read', 'write'],
    description: '技术部员工使用技术部专用日报模板，需要主管和经理两级审批',
    enabled: true,
    createdAt: '2024-01-15'
  },
  {
    id: 2,
    organizationId: 1,
    roleId: 1,
    templateType: 'monthly-plan',
    templateId: 6,
    approvalFlow: [
      { id: 3, roleId: 3, order: 1 },
      { id: 4, roleId: 4, order: 2 }
    ],
    permissions: ['read', 'write', 'delete'],
    description: '技术部员工月度计划，需要经理和总监审批',
    enabled: true,
    createdAt: '2024-01-15'
  },
  {
    id: 3,
    organizationId: 4,
    roleId: 1,
    templateType: 'weekly-report',
    templateId: 4,
    approvalFlow: [
      { id: 5, roleId: 2, order: 1 }
    ],
    permissions: ['read', 'write'],
    description: '销售部员工使用销售专用周报模板，只需主管审批',
    enabled: true,
    createdAt: '2024-01-16'
  }
])

// 表单数据
const configForm = reactive({
  organizationId: null,
  roleId: null,
  templateType: '',
  templateId: null,
  approvalFlow: [{ roleId: null, order: 1 }],
  permissions: ['read', 'write'],
  description: ''
})

// 表单验证规则
const configRules = {
  organizationId: [{ required: true, message: '请选择组织', trigger: 'change' }],
  roleId: [{ required: true, message: '请选择角色', trigger: 'change' }],
  templateType: [{ required: true, message: '请选择模板类型', trigger: 'change' }],
  templateId: [{ required: true, message: '请选择模板', trigger: 'change' }]
}

// 过滤后的配置列表
const filteredConfigs = computed(() => {
  let result = configs.value

  if (filters.organization) {
    result = result.filter(config => config.organizationId === Number(filters.organization))
  }
  
  if (filters.role) {
    result = result.filter(config => config.roleId === Number(filters.role))
  }
  
  if (filters.templateType) {
    result = result.filter(config => config.templateType === filters.templateType)
  }
  
  if (filters.keyword) {
    result = result.filter(config => 
      config.description.includes(filters.keyword) ||
      getOrganizationName(config.organizationId).includes(filters.keyword) ||
      getRoleName(config.roleId).includes(filters.keyword)
    )
  }

  return result
})

// 获取组织名称
const getOrganizationName = (id: number) => {
  const org = organizations.value.find(o => o.id === id)
  return org ? org.name : '未知组织'
}

// 获取角色名称
const getRoleName = (id: number) => {
  const role = roles.value.find(r => r.id === id)
  return role ? role.name : '未知角色'
}

// 获取模板名称
const getTemplateName = (id: number) => {
  const template = availableTemplates.value.find(t => t.id === id)
  return template ? template.name : '未知模板'
}

// 获取模板类型颜色
const getTemplateTypeColor = (type: string) => {
  const colorMap: Record<string, string> = {
    'daily-report': '#52c41a',
    'weekly-report': '#faad14',
    'monthly-plan': '#1890ff',
    'goal-template': '#722ed1'
  }
  return colorMap[type] || '#d9d9d9'
}

// 获取模板类型文本
const getTemplateTypeText = (type: string) => {
  const textMap: Record<string, string> = {
    'daily-report': '日报模板',
    'weekly-report': '周报模板',
    'monthly-plan': '月度计划',
    'goal-template': '目标模板'
  }
  return textMap[type] || '未知类型'
}

// 筛选变化处理
const handleFilterChange = () => {
  console.log('Filter changed:', filters)
}

// 表格变化处理
const handleTableChange = (pag: any) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
}

// 状态变化处理
const handleStatusChange = (record: any) => {
  message.success(`已${record.enabled ? '启用' : '禁用'}配置`)
}

// 编辑配置
const editConfig = (record: any) => {
  Object.assign(configForm, record)
  isEditMode.value = true
  showConfigModal.value = true
}

// 复制配置
const copyConfig = (record: any) => {
  const newConfig = { ...record, id: Math.max(...configs.value.map(c => c.id)) + 1 }
  configs.value.push(newConfig)
  message.success('复制成功')
}

// 删除配置
const deleteConfig = (record: any) => {
  const index = configs.value.findIndex(c => c.id === record.id)
  if (index > -1) {
    configs.value.splice(index, 1)
    message.success('删除成功')
  }
}

// 添加审批步骤
const addApprovalStep = () => {
  configForm.approvalFlow.push({ 
    roleId: null, 
    order: configForm.approvalFlow.length + 1 
  })
}

// 移除审批步骤
const removeApprovalStep = (index: number) => {
  configForm.approvalFlow.splice(index, 1)
  // 重新排序
  configForm.approvalFlow.forEach((step, i) => {
    step.order = i + 1
  })
}

// 保存配置
const handleSaveConfig = () => {
  console.log('Save config:', configForm)
  message.success('配置保存成功')
  showConfigModal.value = false
  resetConfigForm()
}

// 重置表单
const resetConfigForm = () => {
  Object.assign(configForm, {
    organizationId: null,
    roleId: null,
    templateType: '',
    templateId: null,
    approvalFlow: [{ roleId: null, order: 1 }],
    permissions: ['read', 'write'],
    description: ''
  })
  isEditMode.value = false
}

// 页面初始化
onMounted(() => {
  pagination.total = configs.value.length
})
</script>

<style scoped>
.org-permission-config {
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

.approval-flow-config {
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  padding: 16px;
  background: #fafafa;
}

.approval-step {
  margin-bottom: 8px;
}

.approval-step:last-child {
  margin-bottom: 0;
}
</style> 