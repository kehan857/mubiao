<template>
  <div class="strategic-goals">
    <!-- 页面标题 -->
    <div class="page-header">
      <div class="header-content">
        <div class="title-area">
          <h2>📊 战略目标管理</h2>
          <p>制定和管理公司年度战略目标，确保目标对齐和有效执行</p>
        </div>
        <div class="actions">
          <a-button @click="exportGoals">
            <DownloadOutlined />
            导出目标
          </a-button>
          <a-button type="primary" @click="createGoal">
            <PlusOutlined />
            新建目标
          </a-button>
        </div>
      </div>
    </div>

    <!-- 筛选区域 -->
    <a-card style="margin-bottom: 16px">
      <a-row :gutter="16">
        <a-col :span="6">
          <a-select
            v-model:value="filters.period"
            placeholder="选择周期"
            style="width: 100%"
            allowClear
          >
            <a-select-option value="">全部周期</a-select-option>
            <a-select-option value="2024">2024年</a-select-option>
            <a-select-option value="2024-Q1">2024年Q1</a-select-option>
            <a-select-option value="2024-Q2">2024年Q2</a-select-option>
            <a-select-option value="2024-Q3">2024年Q3</a-select-option>
            <a-select-option value="2024-Q4">2024年Q4</a-select-option>
          </a-select>
        </a-col>
        <a-col :span="6">
          <a-select
            v-model:value="filters.department"
            placeholder="选择部门"
            style="width: 100%"
            allowClear
          >
            <a-select-option value="">全部部门</a-select-option>
            <a-select-option value="技术部">技术部</a-select-option>
            <a-select-option value="产品部">产品部</a-select-option>
            <a-select-option value="市场部">市场部</a-select-option>
            <a-select-option value="销售部">销售部</a-select-option>
            <a-select-option value="人事部">人事部</a-select-option>
          </a-select>
        </a-col>
        <a-col :span="6">
          <a-select
            v-model:value="filters.status"
            placeholder="选择状态"
            style="width: 100%"
            allowClear
          >
            <a-select-option value="">全部状态</a-select-option>
            <a-select-option value="draft">草稿</a-select-option>
            <a-select-option value="published">已发布</a-select-option>
            <a-select-option value="in-progress">进行中</a-select-option>
            <a-select-option value="completed">已完成</a-select-option>
            <a-select-option value="paused">已暂停</a-select-option>
          </a-select>
        </a-col>
        <a-col :span="6">
          <a-input-search
            v-model:value="filters.keyword"
            placeholder="搜索目标内容"
            @search="handleFilterChange"
          />
        </a-col>
      </a-row>
    </a-card>

    <!-- 目标列表 -->
    <a-card title="目标列表">
      <template #extra>
        <a-space>
          <a-button @click="refreshData" :loading="loading">
            <ReloadOutlined />
            刷新
          </a-button>
          <a-button @click="batchOperations" :disabled="selectedRows.length === 0">
            批量操作
          </a-button>
        </a-space>
      </template>

      <a-table
        :dataSource="filteredGoals"
        :columns="columns"
        :loading="loading"
        :pagination="pagination"
        :row-selection="{ selectedRowKeys: selectedRows, onChange: handleSelectionChange }"
        @change="handleTableChange"
        row-key="id"
        size="middle"
        :scroll="{ x: 1200 }"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'title'">
            <div class="goal-title-cell">
              <strong>{{ record.title }}</strong>
              <div class="goal-description">{{ record.description }}</div>
            </div>
          </template>

          <template v-else-if="column.key === 'keyResults'">
            <div class="key-results">
              <div 
                v-for="(kr, index) in record.keyResults" 
                :key="kr.id"
                class="kr-item"
              >
                <a-tag size="small" color="blue">KR{{ index + 1 }}</a-tag>
                {{ kr.title }}
              </div>
            </div>
          </template>

          <template v-else-if="column.key === 'status'">
            <a-tag :color="getStatusColor(record.status)">
              {{ getStatusText(record.status) }}
            </a-tag>
          </template>

          <template v-else-if="column.key === 'progress'">
            <a-progress 
              :percent="record.progress" 
              size="small" 
              :status="getProgressStatus(record.progress)"
              style="width: 100px"
            />
          </template>

          <template v-else-if="column.key === 'weight'">
            <a-tag color="orange">{{ record.weight }}%</a-tag>
          </template>

          <template v-else-if="column.key === 'actions'">
            <a-space>
              <a-button type="primary" size="small" @click="editGoal(record)">
                编辑
              </a-button>
              <a-button size="small" @click="viewGoal(record)">
                查看
              </a-button>
              <a-dropdown>
                <template #overlay>
                  <a-menu>
                    <a-menu-item @click="duplicateGoal(record)">
                      <CopyOutlined />
                      复制目标
                    </a-menu-item>
                    <a-menu-item @click="archiveGoal(record)">
                      <InboxOutlined />
                      归档
                    </a-menu-item>
                    <a-menu-divider />
                    <a-menu-item @click="deleteGoal(record)" danger>
                      <DeleteOutlined />
                      删除
                    </a-menu-item>
                  </a-menu>
                </template>
                <a-button size="small">
                  更多
                  <DownOutlined />
                </a-button>
              </a-dropdown>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 创建/编辑目标弹窗 -->
    <a-modal
      v-model:open="showGoalModal"
      :title="isEditing ? '编辑目标' : '新建目标'"
      width="800px"
      @ok="saveGoal"
      @cancel="cancelGoal"
    >
      <a-form :model="form" layout="vertical">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="目标标题" required>
              <a-input v-model:value="form.title" placeholder="请输入目标标题" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="所属部门" required>
              <a-select v-model:value="form.department" placeholder="选择部门">
                <a-select-option value="技术部">技术部</a-select-option>
                <a-select-option value="产品部">产品部</a-select-option>
                <a-select-option value="市场部">市场部</a-select-option>
                <a-select-option value="销售部">销售部</a-select-option>
                <a-select-option value="人事部">人事部</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>

        <a-form-item label="目标描述">
          <a-textarea 
            v-model:value="form.description" 
            :rows="3" 
            placeholder="请输入目标描述"
          />
        </a-form-item>

        <a-row :gutter="16">
          <a-col :span="8">
            <a-form-item label="目标周期" required>
              <a-select v-model:value="form.period" placeholder="选择周期">
                <a-select-option value="2024">2024年</a-select-option>
                <a-select-option value="2024-Q1">2024年Q1</a-select-option>
                <a-select-option value="2024-Q2">2024年Q2</a-select-option>
                <a-select-option value="2024-Q3">2024年Q3</a-select-option>
                <a-select-option value="2024-Q4">2024年Q4</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="权重" required>
              <a-input-number 
                v-model:value="form.weight" 
                :min="1" 
                :max="100" 
                style="width: 100%" 
                addon-after="%"
              />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="状态">
              <a-select v-model:value="form.status" placeholder="选择状态">
                <a-select-option value="draft">草稿</a-select-option>
                <a-select-option value="published">已发布</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>

        <a-form-item label="关键结果 (Key Results)">
          <div v-for="(kr, index) in form.keyResults" :key="index" class="kr-input">
            <a-input 
              v-model:value="kr.title" 
              :placeholder="`关键结果 ${index + 1}`"
              style="margin-bottom: 8px"
            >
              <template #addonAfter>
                <a-button 
                  type="text" 
                  size="small" 
                  @click="removeKeyResult(index)"
                  :disabled="form.keyResults.length <= 1"
                >
                  <DeleteOutlined />
                </a-button>
              </template>
            </a-input>
          </div>
          <a-button type="dashed" @click="addKeyResult" block>
            <PlusOutlined />
            添加关键结果
          </a-button>
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
  DownloadOutlined,
  EditOutlined,
  DeleteOutlined,
  CopyOutlined,
  InboxOutlined,
  DownOutlined,
  ReloadOutlined
} from '@ant-design/icons-vue'

// 响应式数据
const loading = ref(false)
const showGoalModal = ref(false)
const isEditing = ref(false)
const selectedRows = ref<number[]>([])

// 筛选条件
const filters = reactive({
  period: '',
  department: '',
  status: '',
  keyword: ''
})

// 表格列定义
const columns = [
  {
    title: '目标',
    key: 'title',
    dataIndex: 'title',
    width: 300,
    fixed: 'left'
  },
  {
    title: '关键结果',
    key: 'keyResults',
    width: 280
  },
  {
    title: '部门',
    dataIndex: 'department',
    key: 'department',
    width: 100
  },
  {
    title: '周期',
    dataIndex: 'period',
    key: 'period',
    width: 100
  },
  {
    title: '状态',
    key: 'status',
    width: 100
  },
  {
    title: '进度',
    key: 'progress',
    width: 120
  },
  {
    title: '权重',
    key: 'weight',
    width: 80
  },
  {
    title: '操作',
    key: 'actions',
    width: 200,
    fixed: 'right'
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

// 目标数据
const goals = ref([
  {
    id: 1,
    title: '提升产品市场竞争力',
    description: '通过产品创新和用户体验优化，提升在市场中的竞争优势',
    period: '2024',
    department: '产品部',
    status: 'in-progress',
    progress: 65,
    weight: 90,
    keyResults: [
      { id: 1, title: '用户满意度提升至90%' },
      { id: 2, title: '市场份额增长15%' },
      { id: 3, title: '产品功能迭代10个版本' }
    ],
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15'
  },
  {
    id: 2,
    title: '技术架构升级',
    description: '完成核心系统的技术架构升级，提升系统性能和稳定性',
    period: '2024-Q1',
    department: '技术部',
    status: 'published',
    progress: 80,
    weight: 85,
    keyResults: [
      { id: 4, title: '系统响应时间优化50%' },
      { id: 5, title: '系统可用性达到99.9%' },
      { id: 6, title: '完成3个核心模块重构' }
    ],
    createdAt: '2024-01-05',
    updatedAt: '2024-01-20'
  },
  {
    id: 3,
    title: '品牌影响力提升',
    description: '通过营销推广和品牌建设，提升公司在行业中的知名度和影响力',
    period: '2024',
    department: '市场部',
    status: 'in-progress',
    progress: 45,
    weight: 75,
    keyResults: [
      { id: 7, title: '品牌知名度提升30%' },
      { id: 8, title: '媒体曝光增加50%' },
      { id: 9, title: '行业活动参与度提升' }
    ],
    createdAt: '2024-02-01',
    updatedAt: '2024-02-10'
  },
  {
    id: 4,
    title: '销售业绩增长',
    description: '通过销售策略优化和团队能力提升，实现销售业绩大幅增长',
    period: '2024-Q2',
    department: '销售部',
    status: 'published',
    progress: 55,
    weight: 95,
    keyResults: [
      { id: 10, title: '销售额增长40%' },
      { id: 11, title: '新客户获取量增长60%' },
      { id: 12, title: '客户留存率达到85%' }
    ],
    createdAt: '2024-03-01',
    updatedAt: '2024-03-15'
  },
  {
    id: 5,
    title: '人才队伍建设',
    description: '通过招聘优化和培训体系建设，打造高素质的人才队伍',
    period: '2024',
    department: '人事部',
    status: 'in-progress',
    progress: 70,
    weight: 80,
    keyResults: [
      { id: 13, title: '关键岗位招聘完成率90%' },
      { id: 14, title: '员工满意度提升至88%' },
      { id: 15, title: '培训覆盖率达到95%' }
    ],
    createdAt: '2024-01-15',
    updatedAt: '2024-02-20'
  },
  {
    id: 6,
    title: '成本控制与效率提升',
    description: '通过流程优化和成本管控，提升运营效率，降低运营成本',
    period: '2024-Q3',
    department: '技术部',
    status: 'draft',
    progress: 25,
    weight: 70,
    keyResults: [
      { id: 16, title: '运营成本降低15%' },
      { id: 17, title: '工作效率提升25%' },
      { id: 18, title: '自动化程度提升40%' }
    ],
    createdAt: '2024-04-01',
    updatedAt: '2024-04-10'
  },
  {
    id: 7,
    title: '客户服务体验优化',
    description: '通过服务流程改进和系统升级，全面提升客户服务体验',
    period: '2024-Q2',
    department: '产品部',
    status: 'in-progress',
    progress: 60,
    weight: 85,
    keyResults: [
      { id: 19, title: '客户投诉率降低50%' },
      { id: 20, title: '服务响应时间缩短30%' },
      { id: 21, title: '客户推荐度提升至80%' }
    ],
    createdAt: '2024-03-10',
    updatedAt: '2024-04-05'
  },
  {
    id: 8,
    title: '数字化转型推进',
    description: '加速公司数字化转型，提升业务数字化水平和数据驱动能力',
    period: '2024',
    department: '技术部',
    status: 'published',
    progress: 40,
    weight: 90,
    keyResults: [
      { id: 22, title: '核心业务系统数字化覆盖率90%' },
      { id: 23, title: '数据分析平台上线运行' },
      { id: 24, title: '员工数字化技能培训完成率95%' }
    ],
    createdAt: '2024-02-15',
    updatedAt: '2024-03-20'
  },
  {
    id: 9,
    title: '供应链优化升级',
    description: '通过供应链管理优化，提升供应链效率和风险管控能力',
    period: '2024-Q4',
    department: '市场部',
    status: 'draft',
    progress: 20,
    weight: 75,
    keyResults: [
      { id: 25, title: '供应商评价体系建立' },
      { id: 26, title: '采购成本降低12%' },
      { id: 27, title: '供应链响应速度提升35%' }
    ],
    createdAt: '2024-05-01',
    updatedAt: '2024-05-15'
  },
  {
    id: 10,
    title: '创新能力建设',
    description: '建设创新体系，提升公司整体创新能力和研发效率',
    period: '2024',
    department: '技术部',
    status: 'in-progress',
    progress: 50,
    weight: 88,
    keyResults: [
      { id: 28, title: '研发投入占比提升至8%' },
      { id: 29, title: '专利申请量增长100%' },
      { id: 30, title: '创新项目成功率达到70%' }
    ],
    createdAt: '2024-01-20',
    updatedAt: '2024-04-25'
  }
])

// 表单数据
const form = reactive({
  title: '',
  description: '',
  period: '',
  department: '',
  weight: 50,
  status: 'draft',
  keyResults: [{ title: '' }]
})

// 过滤后的目标数据
const filteredGoals = computed(() => {
  let result = goals.value

  if (filters.period) {
    result = result.filter(goal => goal.period === filters.period)
  }
  
  if (filters.department) {
    result = result.filter(goal => goal.department === filters.department)
  }
  
  if (filters.status) {
    result = result.filter(goal => goal.status === filters.status)
  }
  
  if (filters.keyword) {
    result = result.filter(goal => 
      goal.title.includes(filters.keyword) ||
      goal.description.includes(filters.keyword)
    )
  }

  return result
})

// 获取状态颜色
const getStatusColor = (status: string) => {
  const colorMap: Record<string, string> = {
    draft: 'default',
    published: 'processing',
    'in-progress': 'success',
    completed: 'success',
    paused: 'warning'
  }
  return colorMap[status] || 'default'
}

// 获取状态文本
const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    draft: '草稿',
    published: '已发布',
    'in-progress': '进行中',
    completed: '已完成',
    paused: '已暂停'
  }
  return textMap[status] || status
}

// 获取进度状态
const getProgressStatus = (progress: number) => {
  if (progress < 30) return 'exception'
  if (progress < 70) return 'active'
  return 'success'
}

// 事件处理函数
const createGoal = () => {
  isEditing.value = false
  resetForm()
  showGoalModal.value = true
}

const editGoal = (record: any) => {
  isEditing.value = true
  Object.assign(form, record)
  showGoalModal.value = true
}

const viewGoal = (record: any) => {
  message.info(`查看目标: ${record.title}`)
}

const duplicateGoal = (record: any) => {
  message.success(`复制目标: ${record.title}`)
}

const archiveGoal = (record: any) => {
  message.success(`归档目标: ${record.title}`)
}

const deleteGoal = (record: any) => {
  message.success(`删除目标: ${record.title}`)
}

const saveGoal = () => {
  // 表单验证和保存逻辑
  message.success(isEditing.value ? '目标更新成功' : '目标创建成功')
  showGoalModal.value = false
}

const cancelGoal = () => {
  showGoalModal.value = false
  resetForm()
}

const resetForm = () => {
  form.title = ''
  form.description = ''
  form.period = ''
  form.department = ''
  form.weight = 50
  form.status = 'draft'
  form.keyResults = [{ title: '' }]
}

const addKeyResult = () => {
  form.keyResults.push({ title: '' })
}

const removeKeyResult = (index: number) => {
  form.keyResults.splice(index, 1)
}

const exportGoals = () => {
  message.info('导出目标功能开发中...')
}

const refreshData = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    message.success('数据刷新成功')
  }, 1000)
}

const batchOperations = () => {
  message.info('批量操作功能开发中...')
}

const handleFilterChange = () => {
  pagination.current = 1
}

const handleSelectionChange = (selectedRowKeys: number[]) => {
  selectedRows.value = selectedRowKeys
}

const handleTableChange = (pag: any) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
}

// 页面初始化
onMounted(() => {
  pagination.total = goals.value.length
})
</script>

<style scoped>
.strategic-goals {
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

.goal-title-cell {
  line-height: 1.4;
}

.goal-description {
  font-size: 12px;
  color: #666;
  margin-top: 4px;
  line-height: 1.3;
}

.key-results {
  line-height: 1.4;
}

.kr-item {
  margin-bottom: 4px;
  font-size: 13px;
}

.kr-item:last-child {
  margin-bottom: 0;
}

.kr-input {
  margin-bottom: 8px;
}

:deep(.ant-table-tbody > tr > td) {
  padding: 8px !important;
  vertical-align: top;
}

:deep(.ant-progress-text) {
  font-size: 12px;
}
</style> 