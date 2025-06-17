<template>
  <div class="organization-management">
    <!-- 页面标题 -->
    <div class="page-header">
      <div class="header-content">
        <div class="title-area">
          <h2>组织管理</h2>
          <p>管理公司组织架构，支持多层级配置和权限分配</p>
        </div>
        <div class="actions">
          <a-button @click="expandAll">
            <DatabaseOutlined />
            展开全部
          </a-button>
          <a-button @click="collapseAll">
            <ShrinkOutlined />
            收起全部
          </a-button>
          <a-button type="primary" @click="addRootOrg">
            <PlusOutlined />
            新增根组织
          </a-button>
        </div>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <a-row :gutter="16">
      <!-- 组织树结构 -->
      <a-col :span="10">
        <a-card title="组织架构" style="height: 700px">
          <template #extra>
            <a-input-search
              v-model:value="searchKeyword"
              placeholder="搜索组织"
              style="width: 200px"
              @search="handleSearch"
            />
          </template>

          <a-tree
            ref="orgTreeRef"
            :tree-data="filteredOrgTree"
            :expanded-keys="expandedKeys"
            :selected-keys="selectedKeys"
            show-line
            show-icon
            draggable
            @expand="onExpand"
            @select="onSelect"
            @drop="onDrop"
            style="height: 600px; overflow-y: auto"
          >
            <template #icon="{ dataRef }">
              <ApartmentOutlined v-if="dataRef.level === 'company'" style="color: #1890ff" />
              <BankOutlined v-else-if="dataRef.level === 'division'" style="color: #722ed1" />
              <TeamOutlined v-else-if="dataRef.level === 'department'" style="color: #52c41a" />
              <UserOutlined v-else-if="dataRef.level === 'group'" style="color: #fa8c16" />
            </template>

            <template #title="{ dataRef }">
              <div class="tree-node-title">
                <span>{{ dataRef.title }}</span>
                <span class="node-actions">
                  <a-tooltip title="添加子组织">
                    <PlusCircleOutlined 
                      @click.stop="addChild(dataRef)" 
                      style="margin-left: 8px; color: #1890ff"
                    />
                  </a-tooltip>
                  <a-tooltip title="编辑">
                    <EditOutlined 
                      @click.stop="editOrg(dataRef)" 
                      style="margin-left: 8px; color: #52c41a"
                    />
                  </a-tooltip>
                  <a-tooltip title="删除">
                    <DeleteOutlined 
                      @click.stop="deleteOrg(dataRef)" 
                      style="margin-left: 8px; color: #ff4d4f"
                    />
                  </a-tooltip>
                </span>
              </div>
            </template>
          </a-tree>
        </a-card>
      </a-col>

      <!-- 组织详情和配置 -->
      <a-col :span="14">
        <a-card v-if="selectedOrg" :title="`${selectedOrg.title} - 详细信息`" style="height: 700px">
          <template #extra>
            <a-space>
              <a-button @click="saveOrgInfo" :loading="saving">
                <SaveOutlined />
                保存配置
              </a-button>
              <a-button type="primary" @click="showPermissionModal = true">
                <SettingOutlined />
                权限配置
              </a-button>
            </a-space>
          </template>

          <div style="height: 600px; overflow-y: auto">
            <!-- 基本信息 -->
            <a-form :model="orgForm" layout="vertical">
              <a-row :gutter="16">
                <a-col :span="12">
                  <a-form-item label="组织名称">
                    <a-input v-model:value="orgForm.name" placeholder="请输入组织名称" />
                  </a-form-item>
                </a-col>
                <a-col :span="12">
                  <a-form-item label="组织代码">
                    <a-input v-model:value="orgForm.code" placeholder="请输入组织代码" />
                  </a-form-item>
                </a-col>
              </a-row>

              <a-row :gutter="16">
                <a-col :span="12">
                  <a-form-item label="上级组织">
                    <a-tree-select
                      v-model:value="orgForm.parentId"
                      :tree-data="orgTreeSelectData"
                      placeholder="选择上级组织"
                      style="width: 100%"
                      allow-clear
                    />
                  </a-form-item>
                </a-col>
                <a-col :span="12">
                  <a-form-item label="组织级别">
                    <a-select v-model:value="orgForm.level" placeholder="选择组织级别">
                      <a-select-option value="company">公司级</a-select-option>
                      <a-select-option value="division">事业部级</a-select-option>
                      <a-select-option value="department">部门级</a-select-option>
                      <a-select-option value="group">小组级</a-select-option>
                    </a-select>
                  </a-form-item>
                </a-col>
              </a-row>

              <a-row :gutter="16">
                <a-col :span="12">
                  <a-form-item label="状态">
                    <a-select v-model:value="orgForm.status" placeholder="选择状态">
                      <a-select-option value="active">启用</a-select-option>
                      <a-select-option value="inactive">停用</a-select-option>
                      <a-select-option value="pending">待审核</a-select-option>
                    </a-select>
                  </a-form-item>
                </a-col>
                <a-col :span="12">
                  <a-form-item label="组织负责人">
                    <a-select
                      v-model:value="orgForm.managerId"
                      show-search
                      placeholder="选择负责人"
                      :filter-option="filterOption"
                    >
                      <a-select-option v-for="user in allUsers" :key="user.id" :value="user.id">
                        {{ user.name }} - {{ user.position }}
                      </a-select-option>
                    </a-select>
                  </a-form-item>
                </a-col>
              </a-row>

              <a-form-item label="组织描述">
                <a-textarea v-model:value="orgForm.description" :rows="3" placeholder="请输入组织描述" />
              </a-form-item>

              <a-form-item label="联系信息">
                <a-input v-model:value="orgForm.contact" placeholder="联系电话或邮箱" />
              </a-form-item>
            </a-form>

            <!-- 组织统计 -->
            <a-divider>组织统计</a-divider>
            <a-row :gutter="16">
              <a-col :span="8">
                <a-statistic
                  title="下级组织数量"
                  :value="selectedOrg.children?.length || 0"
                  :value-style="{ color: '#1890ff' }"
                />
              </a-col>
              <a-col :span="8">
                <a-statistic
                  title="人员数量"
                  :value="selectedOrg.memberCount || 0"
                  :value-style="{ color: '#52c41a' }"
                />
              </a-col>
              <a-col :span="8">
                <a-statistic
                  title="目标数量"
                  :value="selectedOrg.goalCount || 0"
                  :value-style="{ color: '#fa8c16' }"
                />
              </a-col>
            </a-row>

            <!-- 成员管理 -->
            <a-divider>成员管理</a-divider>
            <a-space style="margin-bottom: 16px">
              <a-button type="primary" @click="showAddMemberModal = true">
                <UserAddOutlined />
                添加成员
              </a-button>
              <a-button @click="importMembers">
                <ImportOutlined />
                批量导入
              </a-button>
              <a-button @click="exportMembers">
                <ExportOutlined />
                导出成员
              </a-button>
            </a-space>

            <a-table
              :dataSource="selectedOrg.members || []"
              :columns="memberColumns"
              :pagination="false"
              size="small"
              :scroll="{ y: 200 }"
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'avatar'">
                  <a-avatar size="small">{{ record.name.charAt(0) }}</a-avatar>
                </template>
                <template v-else-if="column.key === 'status'">
                  <a-tag :color="record.status === 'active' ? 'green' : 'red'">
                    {{ record.status === 'active' ? '在职' : '离职' }}
                  </a-tag>
                </template>
                <template v-else-if="column.key === 'actions'">
                  <a-space>
                    <a-button size="small" @click="editMember(record)">编辑</a-button>
                    <a-button size="small" danger @click="removeMember(record)">移除</a-button>
                  </a-space>
                </template>
              </template>
            </a-table>
          </div>
        </a-card>

        <!-- 未选择组织时的提示 -->
        <a-card v-else title="组织信息" style="height: 700px">
          <a-empty description="请在左侧选择一个组织查看详细信息" />
        </a-card>
      </a-col>
    </a-row>

    <!-- 添加组织弹窗 -->
    <a-modal
      v-model:open="showAddOrgModal"
      title="添加组织"
      @ok="handleAddOrg"
      @cancel="showAddOrgModal = false"
      width="600px"
    >
      <a-form ref="orgFormRef" :model="orgForm" :rules="orgRules" layout="vertical">
        <a-form-item label="组织名称" name="name">
          <a-input v-model:value="orgForm.name" placeholder="请输入组织名称" />
        </a-form-item>
        <a-form-item label="组织代码" name="code">
          <a-input v-model:value="orgForm.code" placeholder="请输入组织代码" />
        </a-form-item>
        <a-form-item label="上级组织" name="parentId">
          <a-tree-select
            v-model:value="orgForm.parentId"
            :tree-data="orgTreeSelectData"
            placeholder="选择上级组织"
            style="width: 100%"
            allow-clear
          />
        </a-form-item>
        <a-form-item label="组织级别" name="level">
          <a-select v-model:value="orgForm.level" placeholder="选择组织级别">
            <a-select-option value="company">公司级</a-select-option>
            <a-select-option value="division">事业部级</a-select-option>
            <a-select-option value="department">部门级</a-select-option>
            <a-select-option value="group">小组级</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="负责人" name="managerId">
          <a-select v-model:value="orgForm.managerId" placeholder="选择负责人" show-search>
            <a-select-option v-for="user in allUsers" :key="user.id" :value="user.id">
              {{ user.name }} - {{ user.position }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="组织描述" name="description">
          <a-textarea v-model:value="orgForm.description" :rows="3" placeholder="请输入组织描述" />
        </a-form-item>
        <a-form-item label="联系信息">
          <a-input v-model:value="orgForm.contact" placeholder="联系电话或邮箱" />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 编辑组织弹窗 -->
    <a-modal
      v-model:open="showEditOrgModal"
      title="编辑组织"
      @ok="handleUpdateOrg"
      @cancel="showEditOrgModal = false"
      width="600px"
    >
      <a-form ref="editOrgFormRef" :model="editOrgForm" :rules="orgRules" layout="vertical">
        <a-form-item label="组织名称" name="name">
          <a-input v-model:value="editOrgForm.name" placeholder="请输入组织名称" />
        </a-form-item>
        <a-form-item label="组织代码" name="code">
          <a-input v-model:value="editOrgForm.code" placeholder="请输入组织代码" />
        </a-form-item>
        <a-form-item label="上级组织" name="parentId">
          <a-tree-select
            v-model:value="editOrgForm.parentId"
            :tree-data="orgTreeSelectData"
            placeholder="选择上级组织"
            style="width: 100%"
            allow-clear
          />
        </a-form-item>
        <a-form-item label="组织级别" name="level">
          <a-select v-model:value="editOrgForm.level" placeholder="选择组织级别">
            <a-select-option value="company">公司级</a-select-option>
            <a-select-option value="division">事业部级</a-select-option>
            <a-select-option value="department">部门级</a-select-option>
            <a-select-option value="group">小组级</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="负责人" name="managerId">
          <a-select v-model:value="editOrgForm.managerId" placeholder="选择负责人" show-search>
            <a-select-option v-for="user in allUsers" :key="user.id" :value="user.id">
              {{ user.name }} - {{ user.position }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="组织描述" name="description">
          <a-textarea v-model:value="editOrgForm.description" :rows="3" placeholder="请输入组织描述" />
        </a-form-item>
        <a-form-item label="联系信息">
          <a-input v-model:value="editOrgForm.contact" placeholder="联系电话或邮箱" />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 批量导入弹窗 -->
    <a-modal
      v-model:open="showImportModal"
      title="批量导入成员"
      @ok="handleImport"
      @cancel="showImportModal = false"
      width="600px"
    >
      <a-upload-dragger
        v-model:fileList="importFileList"
        name="file"
        :multiple="false"
        accept=".xlsx,.xls"
        :before-upload="beforeUpload"
        @remove="handleRemove"
      >
        <p class="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p class="ant-upload-text">点击或拖拽文件到此区域上传</p>
        <p class="ant-upload-hint">支持 Excel 格式文件(.xlsx, .xls)</p>
      </a-upload-dragger>
      <div style="margin-top: 16px;">
        <a-button @click="downloadTemplate" type="link">
          <DownloadOutlined />
          下载导入模板
        </a-button>
      </div>
    </a-modal>

    <!-- 添加成员弹窗 -->
    <a-modal
      v-model:open="showAddMemberModal"
      title="添加组织成员"
      @ok="handleAddMember"
      @cancel="showAddMemberModal = false"
    >
      <a-form layout="vertical">
        <a-form-item label="选择成员">
          <a-select
            v-model:value="selectedMemberIds"
            mode="multiple"
            placeholder="选择要添加的成员"
            style="width: 100%"
            :filter-option="filterOption"
            show-search
          >
            <a-select-option v-for="user in availableUsers" :key="user.id" :value="user.id">
              {{ user.name }} - {{ user.department }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="职位">
          <a-input v-model:value="memberPosition" placeholder="请输入职位" />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 权限配置弹窗 -->
    <a-modal
      v-model:open="showPermissionModal"
      title="权限配置"
      width="800px"
      @ok="handlePermissionSubmit"
      @cancel="showPermissionModal = false"
    >
      <a-tabs>
        <a-tab-pane key="view" tab="查看权限">
          <a-checkbox-group v-model:value="permissions.view" style="width: 100%">
            <a-row>
              <a-col :span="8" v-for="perm in viewPermissions" :key="perm.value">
                <a-checkbox :value="perm.value">{{ perm.label }}</a-checkbox>
              </a-col>
            </a-row>
          </a-checkbox-group>
        </a-tab-pane>
        <a-tab-pane key="manage" tab="管理权限">
          <a-checkbox-group v-model:value="permissions.manage" style="width: 100%">
            <a-row>
              <a-col :span="8" v-for="perm in managePermissions" :key="perm.value">
                <a-checkbox :value="perm.value">{{ perm.label }}</a-checkbox>
              </a-col>
            </a-row>
          </a-checkbox-group>
        </a-tab-pane>
      </a-tabs>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import {
  PlusOutlined,
  DatabaseOutlined,
  ShrinkOutlined,
  ApartmentOutlined,
  BankOutlined,
  TeamOutlined,
  UserOutlined,
  PlusCircleOutlined,
  EditOutlined,
  DeleteOutlined,
  SaveOutlined,
  SettingOutlined,
  UserAddOutlined,
  ImportOutlined,
  ExportOutlined,
  InboxOutlined,
  DownloadOutlined
} from '@ant-design/icons-vue'

// 页面状态
const loading = ref(false)
const saving = ref(false)
const treeLoading = ref(false)
const showOrgModal = ref(false)
const showAddOrgModal = ref(false)
const showEditOrgModal = ref(false)
const showMemberModal = ref(false)
const showAddMemberModal = ref(false)
const showImportModal = ref(false)
const showPermissionModal = ref(false)
const permissionModalVisible = ref(false)
const expandedKeys = ref<string[]>(['1'])
const selectedKeys = ref<string[]>(['1'])
const selectedOrgId = ref<string>('1')
const editingOrg = ref<any>(null)
const searchKeyword = ref('')
const selectedMemberIds = ref<number[]>([])
const memberPosition = ref('')

// 表单引用
const orgFormRef = ref()
const editOrgFormRef = ref()

// 组织表单数据
const orgForm = reactive({
  name: '',
  code: '',
  parentId: null,
  level: '',
  managerId: null,
  description: '',
  contact: ''
})

const editOrgForm = reactive({
  id: null,
  name: '',
  code: '',
  parentId: null,
  level: '',
  managerId: null,
  description: '',
  contact: ''
})

// 表单验证规则
const orgRules = {
  name: [{ required: true, message: '请输入组织名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入组织代码', trigger: 'blur' }],
  level: [{ required: true, message: '请选择组织级别', trigger: 'change' }],
  managerId: [{ required: true, message: '请选择负责人', trigger: 'change' }]
}

// 导入文件列表
const importFileList = ref([])

// 成员表单数据
const memberForm = reactive({
  userId: null,
  role: 'member'
})

// 所有用户数据
const allUsers = ref([
  { id: 1, name: '张三', position: '高级工程师', department: '技术部' },
  { id: 2, name: '李四', position: '产品经理', department: '产品部' },
  { id: 3, name: '王五', position: '市场总监', department: '市场部' },
  { id: 4, name: '赵六', position: 'HR主管', department: '人事部' },
  { id: 5, name: '孙七', position: '财务经理', department: '财务部' }
])

// 组织树数据
const orgTreeData = ref([
  {
    key: '1',
    title: '天云聚合科技有限公司',
    code: 'TYJH',
    level: 'company',
    memberCount: 156,
    managerName: '张董事长',
    children: [
      {
        key: '2',
        title: '技术事业部',
        code: 'TECH',
        level: 'division',
        memberCount: 45,
        managerName: '李总监',
        children: [
          {
            key: '3',
            title: '前端开发部',
            code: 'FE',
            level: 'department',
            memberCount: 15,
            managerName: '王经理'
          },
          {
            key: '4',
            title: '后端开发部',
            code: 'BE',
            level: 'department',
            memberCount: 18,
            managerName: '张经理'
          },
          {
            key: '5',
            title: '测试部',
            code: 'QA',
            level: 'department',
            memberCount: 12,
            managerName: '赵经理'
          }
        ]
      },
      {
        key: '6',
        title: '产品事业部',
        code: 'PROD',
        level: 'division',
        memberCount: 32,
        managerName: '陈总监',
        children: [
          {
            key: '7',
            title: '产品设计部',
            code: 'PD',
            level: 'department',
            memberCount: 20,
            managerName: '吴经理'
          },
          {
            key: '8',
            title: 'UI设计部',
            code: 'UI',
            level: 'department',
            memberCount: 12,
            managerName: '刘经理'
          }
        ]
      },
      {
        key: '9',
        title: '市场运营部',
        code: 'MKT',
        level: 'department',
        memberCount: 25,
        managerName: '周经理'
      },
      {
        key: '10',
        title: '人力资源部',
        code: 'HR',
        level: 'department',
        memberCount: 18,
        managerName: '郑经理'
      },
      {
        key: '11',
        title: '财务部',
        code: 'FIN',
        level: 'department',
        memberCount: 12,
        managerName: '高经理'
      }
    ]
  }
])

// 树形选择数据（用于选择上级组织）
const orgTreeSelectData = computed(() => {
  const convertToSelectData = (nodes: any[]): any[] => {
    return nodes.map(node => ({
      value: node.key,
      title: node.title,
      children: node.children ? convertToSelectData(node.children) : undefined
    }))
  }
  return convertToSelectData(orgTreeData.value)
})

// 当前选中的组织信息
const selectedOrgInfo = computed(() => {
  const findNode = (nodes: any[], key: string): any => {
    for (const node of nodes) {
      if (node.key === key) return node
      if (node.children) {
        const found = findNode(node.children, key)
        if (found) return found
      }
    }
    return null
  }
  return findNode(orgTreeData.value, selectedOrgId.value)
})

// 选中的组织（别名）
const selectedOrg = computed(() => {
  const org = selectedOrgInfo.value
  if (org) {
    return {
      ...org,
      members: org.members || currentOrgMembers.value
    }
  }
  return null
})

// 当前组织成员数据
const currentOrgMembers = ref([
  { id: 1, name: '张三', position: '高级工程师', role: '管理员', joinDate: '2024-01-15' },
  { id: 2, name: '李四', position: '工程师', role: '成员', joinDate: '2024-02-01' },
  { id: 3, name: '王五', position: '初级工程师', role: '成员', joinDate: '2024-03-01' }
])

// 权限配置
const permissions = reactive({
  view: [],
  manage: []
})

const viewPermissions = [
  { label: '查看组织架构', value: 'view_org' },
  { label: '查看成员信息', value: 'view_member' },
  { label: '查看目标计划', value: 'view_plan' }
]

const managePermissions = [
  { label: '管理组织', value: 'manage_org' },
  { label: '管理成员', value: 'manage_member' },
  { label: '管理权限', value: 'manage_permission' }
]

// 可用用户列表
const availableUsers = computed(() => {
  return allUsers.value.filter(user => 
    !currentOrgMembers.value.some(member => member.id === user.id)
  )
})

// 成员表格列定义
const memberColumns = [
  {
    title: '头像',
    key: 'avatar',
    width: 60
  },
  {
    title: '姓名',
    dataIndex: 'name',
    key: 'name'
  },
  {
    title: '职位',
    dataIndex: 'position',
    key: 'position'
  },
  {
    title: '角色',
    dataIndex: 'role',
    key: 'role'
  },
  {
    title: '加入时间',
    dataIndex: 'joinDate',
    key: 'joinDate'
  },
  {
    title: '状态',
    key: 'status'
  },
  {
    title: '操作',
    key: 'actions',
    width: 150
  }
]

// 添加组织
const handleAddOrg = async () => {
  try {
    await orgFormRef.value.validate()
    
    const newOrg = {
      key: Date.now().toString(),
      title: orgForm.name,
      code: orgForm.code,
      level: orgForm.level,
      parentId: orgForm.parentId,
      managerId: orgForm.managerId,
      managerName: allUsers.value.find(u => u.id === orgForm.managerId)?.name || '',
      description: orgForm.description,
      contact: orgForm.contact,
      memberCount: 0,
      children: []
    }

    // 这里应该调用API添加组织
    console.log('添加组织:', newOrg)
    
    message.success('组织添加成功')
    showAddOrgModal.value = false
    resetOrgForm()
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}

// 编辑组织
const editOrg = (org: any) => {
  editOrgForm.id = org.key
  editOrgForm.name = org.title
  editOrgForm.code = org.code
  editOrgForm.level = org.level
  editOrgForm.parentId = org.parentId
  editOrgForm.managerId = org.managerId
  editOrgForm.description = org.description || ''
  editOrgForm.contact = org.contact || ''
  
  showEditOrgModal.value = true
}

// 更新组织
const handleUpdateOrg = async () => {
  try {
    await editOrgFormRef.value.validate()
    
    // 这里应该调用API更新组织
    console.log('更新组织:', editOrgForm)
    
    message.success('组织更新成功')
    showEditOrgModal.value = false
    resetEditOrgForm()
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}

// 删除组织
const deleteOrg = (org: any) => {
  console.log('删除组织:', org)
  message.success('组织删除成功')
}

// 重置表单
const resetOrgForm = () => {
  Object.assign(orgForm, {
    name: '',
    code: '',
    parentId: null,
    level: '',
    managerId: null,
    description: '',
    contact: ''
  })
}

const resetEditOrgForm = () => {
  Object.assign(editOrgForm, {
    id: null,
    name: '',
    code: '',
    parentId: null,
    level: '',
    managerId: null,
    description: '',
    contact: ''
  })
}

// 导入处理
const beforeUpload = (file: any) => {
  const isExcel = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
                  file.type === 'application/vnd.ms-excel'
  if (!isExcel) {
    message.error('只能上传 Excel 文件!')
    return false
  }
  return false // 阻止自动上传
}

const handleRemove = () => {
  importFileList.value = []
}

const handleImport = () => {
  if (importFileList.value.length === 0) {
    message.error('请选择要导入的文件')
    return
  }
  
  // 这里处理文件导入逻辑
  console.log('导入文件:', importFileList.value[0])
  message.success('导入成功')
  showImportModal.value = false
  importFileList.value = []
}

const downloadTemplate = () => {
  // 下载模板文件
  message.info('正在下载模板文件...')
}

// 过滤后的组织树
const filteredOrgTree = computed(() => {
  if (!searchKeyword.value) {
    return orgTreeData.value
  }
  
  const filterTree = (nodes: any[]): any[] => {
    return nodes.filter(node => {
      const matchesKeyword = node.title.toLowerCase().includes(searchKeyword.value.toLowerCase())
      const hasMatchingChildren = node.children && filterTree(node.children).length > 0
      
      if (hasMatchingChildren) {
        node.children = filterTree(node.children)
      }
      
      return matchesKeyword || hasMatchingChildren
    })
  }
  
  return filterTree(orgTreeData.value)
})

// 展开全部
const expandAll = () => {
  const getAllKeys = (nodes: any[]): string[] => {
    let keys: string[] = []
    nodes.forEach(node => {
      keys.push(node.key)
      if (node.children) {
        keys = keys.concat(getAllKeys(node.children))
      }
    })
    return keys
  }
  
  expandedKeys.value = getAllKeys(orgTreeData.value)
}

// 收起全部
const collapseAll = () => {
  expandedKeys.value = []
}

// 添加根组织
const addRootOrg = () => {
  editingOrg.value = null
  orgForm.name = ''
  orgForm.code = ''
  orgForm.level = 'company'
  orgForm.managerId = null
  orgForm.description = ''
  showOrgModal.value = true
}

// 添加子组织
const addChild = (parent: any) => {
  editingOrg.value = parent
  orgForm.name = ''
  orgForm.code = ''
  orgForm.level = getChildLevel(parent.level)
  orgForm.managerId = null
  orgForm.description = ''
  showOrgModal.value = true
}

// 获取子级别
const getChildLevel = (parentLevel: string) => {
  const levelMap: Record<string, string> = {
    'company': 'division',
    'division': 'department',
    'department': 'group'
  }
  return levelMap[parentLevel] || 'group'
}

// 树节点展开
const onExpand = (keys: string[]) => {
  expandedKeys.value = keys
}

// 树节点选择
const onSelect = (keys: string[], { node }: any) => {
  selectedOrgId.value = node.key
  if (keys.length > 0) {
    // selectedOrgInfo是computed属性，会自动更新
    Object.assign(orgForm, node.dataRef)
  }
}

// 树节点拖拽
const onDrop = (info: any) => {
  message.info('组织架构调整功能开发中...')
}

// 搜索处理
const handleSearch = () => {
  // 搜索逻辑已在computed中实现
}

// 过滤选项
const filterOption = (input: string, option: any) => {
  return option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
}

// 保存组织信息
const saveOrgInfo = async () => {
  loading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    message.success('组织信息保存成功')
  } catch (error) {
    message.error('保存失败')
  } finally {
    loading.value = false
  }
}

// 提交组织表单
const handleOrgSubmit = () => {
  if (!orgForm.name || !orgForm.code) {
    message.error('请填写必要信息')
    return
  }
  
  message.success(editingOrg.value ? '组织编辑成功' : '组织创建成功')
  showOrgModal.value = false
}

// 添加成员
const handleAddMember = () => {
  if (selectedMemberIds.value.length === 0) {
    message.error('请选择要添加的成员')
    return
  }
  
  message.success(`成功添加 ${selectedMemberIds.value.length} 名成员`)
  showMemberModal.value = false
  selectedMemberIds.value = []
  memberPosition.value = ''
}

// 编辑成员
const editMember = (member: any) => {
  message.info(`编辑成员：${member.name}`)
}

// 移除成员
const removeMember = (member: any) => {
  message.success(`移除成员：${member.name}`)
}

// 导入成员
const importMembers = () => {
  message.info('批量导入功能开发中...')
}

// 导出成员
const exportMembers = () => {
  message.info('导出成员功能开发中...')
}

// 提交权限配置
const handlePermissionSubmit = () => {
  message.success('权限配置保存成功')
  showPermissionModal.value = false
}

// 页面初始化
onMounted(() => {
  // 默认展开第一级
  expandedKeys.value = ['1']
})
</script>

<style scoped>
.organization-management {
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

.tree-node-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.node-actions {
  opacity: 0;
  transition: opacity 0.2s;
}

.tree-node-title:hover .node-actions {
  opacity: 1;
}

:deep(.ant-tree-treenode) {
  padding: 4px 0;
}

:deep(.ant-tree-node-content-wrapper) {
  width: 100%;
}

:deep(.ant-statistic-title) {
  font-size: 14px;
  margin-bottom: 8px;
}

:deep(.ant-statistic-content) {
  font-size: 20px;
  font-weight: 600;
}

:deep(.ant-table-tbody > tr > td) {
  padding: 8px !important;
}
</style> 