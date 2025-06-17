<template>
  <div class="goal-query">
    <!-- 页面标题 -->
    <div class="page-header">
      <div class="header-content">
        <div class="title-area">
          <h2>目标导航查询</h2>
          <p>多维度查询和回顾不同周期的目标与汇报内容</p>
        </div>
        <div class="actions">
          <a-button @click="exportQuery" :disabled="!currentData.length">
            <ExportOutlined />
            导出查询结果
          </a-button>
        </div>
      </div>
    </div>

    <!-- 查询导航器 -->
    <a-card title="查询导航器" style="margin-bottom: 16px">
      <a-row :gutter="16">
        <a-col :span="6">
          <a-form-item label="组织/人员范围">
            <a-tree-select
              v-model:value="queryForm.organizationScope"
              :tree-data="organizationTree"
              placeholder="选择组织或人员"
              tree-checkable
              show-checked-strategy="SHOW_PARENT"
              style="width: 100%"
              @change="handleQueryChange"
            />
          </a-form-item>
        </a-col>
        <a-col :span="6">
          <a-form-item label="时间维度">
            <a-select
              v-model:value="queryForm.timeDimension"
              placeholder="选择时间维度"
              style="width: 100%"
              @change="handleTimeDimensionChange"
            >
              <a-select-option value="year">按年</a-select-option>
              <a-select-option value="quarter">按季度</a-select-option>
              <a-select-option value="month">按月</a-select-option>
              <a-select-option value="week">按周</a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :span="6">
          <a-form-item label="具体时间">
            <a-select
              v-model:value="queryForm.specificTime"
              placeholder="选择具体时间"
              style="width: 100%"
              @change="handleQueryChange"
            >
              <a-select-option 
                v-for="option in timeOptions" 
                :key="option.value" 
                :value="option.value"
              >
                {{ option.label }}
              </a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :span="6">
          <a-form-item label="内容类型">
            <a-select
              v-model:value="queryForm.contentType"
              placeholder="选择内容类型"
              style="width: 100%"
              @change="handleQueryChange"
            >
              <a-select-option value="">全部内容</a-select-option>
              <a-select-option value="strategic">战略目标</a-select-option>
              <a-select-option value="tactical">战术规划</a-select-option>
              <a-select-option value="weekly">周报</a-select-option>
              <a-select-option value="daily">日报</a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
      </a-row>
      
      <a-row :gutter="16" style="margin-top: 16px">
        <a-col :span="12">
          <a-input-search
            v-model:value="queryForm.keyword"
            placeholder="搜索目标内容、关键词..."
            @search="handleQueryChange"
            enter-button="搜索"
          />
        </a-col>
        <a-col :span="12">
          <a-space>
            <a-button @click="resetQuery">重置查询</a-button>
            <a-button type="primary" @click="handleQueryChange">立即查询</a-button>
          </a-space>
        </a-col>
      </a-row>
    </a-card>

    <!-- 查询结果展示 -->
    <a-card 
      :title="`查询结果 (${currentData.length}条)`" 
      :loading="loading"
    >
      <!-- 结果统计 -->
      <div class="result-stats" v-if="currentData.length > 0">
        <a-row :gutter="16" style="margin-bottom: 16px">
          <a-col :span="6">
            <a-statistic title="目标总数" :value="stats.totalGoals" />
          </a-col>
          <a-col :span="6">
            <a-statistic title="已完成" :value="stats.completedGoals" />
          </a-col>
          <a-col :span="6">
            <a-statistic title="进行中" :value="stats.inProgressGoals" />
          </a-col>
          <a-col :span="6">
            <a-statistic 
              title="完成率" 
              :value="stats.completionRate" 
              suffix="%" 
              :precision="1"
            />
          </a-col>
        </a-row>
      </div>

      <!-- 动态内容展示 -->
      <div class="dynamic-content">
        <!-- 年度视图 -->
        <div v-if="queryForm.timeDimension === 'year'" class="year-view">
          <a-timeline>
            <a-timeline-item v-for="item in currentData" :key="item.id" :color="getTimelineColor(item.status)">
              <template #dot>
                <AimOutlined v-if="item.type === 'strategic'" />
                <BulbOutlined v-else-if="item.type === 'tactical'" />
                <FileTextOutlined v-else />
              </template>
              <div class="timeline-content">
                <div class="content-header">
                  <h4>{{ item.title }}</h4>
                  <a-space>
                    <a-tag :color="getTypeColor(item.type)">{{ getTypeText(item.type) }}</a-tag>
                    <a-tag :color="getStatusColor(item.status)">{{ getStatusText(item.status) }}</a-tag>
                  </a-space>
                </div>
                <p>{{ item.description }}</p>
                <div class="content-meta">
                  <span>负责人: {{ item.responsible }}</span>
                  <span>时间: {{ item.timeRange }}</span>
                  <span>权重: {{ item.weight }}%</span>
                </div>
              </div>
            </a-timeline-item>
          </a-timeline>
        </div>

        <!-- 季度视图 -->
        <div v-else-if="queryForm.timeDimension === 'quarter'" class="quarter-view">
          <a-row :gutter="16">
            <a-col :span="12" v-for="item in currentData" :key="item.id">
              <a-card size="small" class="quarter-card">
                <template #title>
                  <a-space>
                    <span>{{ item.title }}</span>
                    <a-tag :color="getStatusColor(item.status)">{{ getStatusText(item.status) }}</a-tag>
                  </a-space>
                </template>
                <p>{{ item.description }}</p>
                <div class="progress-info">
                  <a-progress :percent="item.progress || 0" size="small" />
                  <span class="meta-info">{{ item.responsible }} | {{ item.timeRange }}</span>
                </div>
              </a-card>
            </a-col>
          </a-row>
        </div>

        <!-- 月度视图 */
        <div v-else-if="queryForm.timeDimension === 'month'" class="month-view">
          <a-table
            :dataSource="currentData"
            :columns="monthColumns"
            :pagination="pagination"
            size="middle"
            @change="handleTableChange"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'title'">
                <div>
                  <h4 style="margin: 0;">{{ record.title }}</h4>
                  <p style="margin: 4px 0 0 0; color: #666; font-size: 12px;">{{ record.description }}</p>
                </div>
              </template>
              <template v-else-if="column.key === 'type'">
                <a-tag :color="getTypeColor(record.type)">{{ getTypeText(record.type) }}</a-tag>
              </template>
              <template v-else-if="column.key === 'status'">
                <a-tag :color="getStatusColor(record.status)">{{ getStatusText(record.status) }}</a-tag>
              </template>
              <template v-else-if="column.key === 'progress'">
                <a-progress :percent="record.progress || 0" size="small" />
              </template>
              <template v-else-if="column.key === 'actions'">
                <a-space>
                  <a-button type="link" size="small" @click="viewDetail(record)">查看详情</a-button>
                  <a-button type="link" size="small" @click="exportSingle(record)">导出</a-button>
                </a-space>
              </template>
            </template>
          </a-table>
        </div>

        <!-- 周视图 -->
        <div v-else-if="queryForm.timeDimension === 'week'" class="week-view">
          <a-list
            :dataSource="currentData"
            :pagination="listPagination"
            item-layout="vertical"
            size="large"
          >
            <template #renderItem="{ item }">
              <a-list-item>
                <template #actions>
                  <span><CalendarOutlined /> {{ item.timeRange }}</span>
                  <span><UserOutlined /> {{ item.responsible }}</span>
                  <span><TagOutlined /> {{ getTypeText(item.type) }}</span>
                </template>
                <a-list-item-meta>
                  <template #title>
                    <a-space>
                      {{ item.title }}
                      <a-tag :color="getStatusColor(item.status)">{{ getStatusText(item.status) }}</a-tag>
                    </a-space>
                  </template>
                  <template #description>
                    {{ item.description }}
                  </template>
                </a-list-item-meta>
                <div v-if="item.summary">
                  <h5>主要内容:</h5>
                  <p>{{ item.summary }}</p>
                </div>
              </a-list-item>
            </template>
          </a-list>
        </div>

        <!-- 空状态 -->
        <a-empty v-if="currentData.length === 0 && !loading" description="暂无查询结果" />
      </div>

      <!-- 筛选结果明细 -->
      <a-card title="明细列表" style="margin-top: 16px">
        <template #extra>
          <a-space>
            <a-button @click="exportDetails" type="primary">
              <ExportOutlined />
              导出明细
            </a-button>
            <a-button @click="refreshDetails">
              <ReloadOutlined />
              刷新
            </a-button>
          </a-space>
        </template>

        <a-tabs>
          <a-tab-pane key="plans" tab="计划明细">
            <a-table
              :dataSource="planDetails"
              :columns="planDetailColumns"
              :pagination="{ pageSize: 10, showSizeChanger: true }"
              :scroll="{ x: 1200 }"
              size="small"
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'status'">
                  <a-tag :color="getStatusColor(record.status)">
                    {{ getStatusText(record.status) }}
                  </a-tag>
                </template>
                <template v-else-if="column.key === 'actions'">
                  <a-space>
                    <a-button size="small" @click="viewDetail(record)">查看</a-button>
                    <a-button size="small" type="primary" @click="auditPlan(record)">审核</a-button>
                  </a-space>
                </template>
              </template>
            </a-table>
          </a-tab-pane>

          <a-tab-pane key="summaries" tab="总结明细">
            <a-table
              :dataSource="summaryDetails"
              :columns="summaryDetailColumns"
              :pagination="{ pageSize: 10, showSizeChanger: true }"
              :scroll="{ x: 1400 }"
              size="small"
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'status'">
                  <a-tag :color="getStatusColor(record.status)">
                    {{ getStatusText(record.status) }}
                  </a-tag>
                </template>
                <template v-else-if="column.key === 'score'">
                  <a-rate v-model:value="record.score" :count="5" :disabled="true" />
                  <span style="margin-left: 8px">{{ record.score }}/5</span>
                </template>
                <template v-else-if="column.key === 'actions'">
                  <a-space>
                    <a-button size="small" @click="viewDetail(record)">查看</a-button>
                    <a-button size="small" type="primary" @click="auditSummary(record)">审核</a-button>
                  </a-space>
                </template>
              </template>
            </a-table>
          </a-tab-pane>
        </a-tabs>
      </a-card>
    </a-card>

    <!-- 详情弹窗 -->
    <a-modal
      v-model:open="showDetailModal"
      :title="currentDetail?.title"
      width="800px"
      :footer="null"
    >
      <div v-if="currentDetail" class="detail-content">
        <a-descriptions :column="2" bordered>
          <a-descriptions-item label="类型">
            <a-tag :color="getTypeColor(currentDetail.type)">{{ getTypeText(currentDetail.type) }}</a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="状态">
            <a-tag :color="getStatusColor(currentDetail.status)">{{ getStatusText(currentDetail.status) }}</a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="负责人">{{ currentDetail.responsible }}</a-descriptions-item>
          <a-descriptions-item label="时间范围">{{ currentDetail.timeRange }}</a-descriptions-item>
          <a-descriptions-item label="权重">{{ currentDetail.weight }}%</a-descriptions-item>
          <a-descriptions-item label="进度">{{ currentDetail.progress || 0 }}%</a-descriptions-item>
          <a-descriptions-item label="描述" :span="2">{{ currentDetail.description }}</a-descriptions-item>
        </a-descriptions>
        
        <div v-if="currentDetail.keyResults && currentDetail.keyResults.length > 0" style="margin-top: 16px">
          <h4>关键结果:</h4>
          <a-list :dataSource="currentDetail.keyResults" size="small">
            <template #renderItem="{ item }">
              <a-list-item>{{ item.title }}</a-list-item>
            </template>
          </a-list>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import {
  ExportOutlined,
  AimOutlined,
  BulbOutlined,
  FileTextOutlined,
  CalendarOutlined,
  UserOutlined,
  TagOutlined,
  ReloadOutlined
} from '@ant-design/icons-vue'

// 页面状态
const loading = ref(false)
const showDetailModal = ref(false)
const currentDetail = ref<any>(null)

// 查询表单
const queryForm = reactive({
  organizationScope: [],
  timeDimension: 'month',
  specificTime: '',
  contentType: '',
  keyword: ''
})

// 组织架构树
const organizationTree = ref([
  {
    title: '全公司',
    value: 'all',
    key: 'all',
    children: [
      {
        title: '技术部',
        value: 'tech',
        key: 'tech',
        children: [
          { title: '张三', value: 'zhangsan', key: 'zhangsan' },
          { title: '李四', value: 'lisi', key: 'lisi' }
        ]
      },
      {
        title: '产品部',
        value: 'product',
        key: 'product',
        children: [
          { title: '王五', value: 'wangwu', key: 'wangwu' },
          { title: '赵六', value: 'zhaoliu', key: 'zhaoliu' }
        ]
      },
      {
        title: '市场部',
        value: 'marketing',
        key: 'marketing',
        children: [
          { title: '钱七', value: 'qianqi', key: 'qianqi' }
        ]
      }
    ]
  }
])

// 时间选项
const timeOptions = computed(() => {
  const dimension = queryForm.timeDimension
  switch (dimension) {
    case 'year':
      return [
        { label: '2024年', value: '2024' },
        { label: '2023年', value: '2023' },
        { label: '2022年', value: '2022' }
      ]
    case 'quarter':
      return [
        { label: '2024年Q1', value: '2024-Q1' },
        { label: '2024年Q2', value: '2024-Q2' },
        { label: '2024年Q3', value: '2024-Q3' },
        { label: '2024年Q4', value: '2024-Q4' },
        { label: '2023年Q4', value: '2023-Q4' }
      ]
    case 'month':
      return [
        { label: '2024年1月', value: '2024-01' },
        { label: '2024年2月', value: '2024-02' },
        { label: '2024年3月', value: '2024-03' },
        { label: '2024年4月', value: '2024-04' },
        { label: '2024年5月', value: '2024-05' },
        { label: '2024年6月', value: '2024-06' }
      ]
    case 'week':
      return [
        { label: '2024年第1周', value: '2024-W01' },
        { label: '2024年第2周', value: '2024-W02' },
        { label: '2024年第3周', value: '2024-W03' },
        { label: '2024年第4周', value: '2024-W04' }
      ]
    default:
      return []
  }
})

// 模拟数据
const allData = ref([
  {
    id: 1,
    title: '提升产品竞争力',
    description: '通过技术创新和用户体验优化，提升产品在市场中的竞争力',
    type: 'strategic',
    status: 'in-progress',
    responsible: '张总监',
    timeRange: '2024年Q1-Q4',
    weight: 90,
    progress: 65,
    timeDimension: 'year',
    specificTime: '2024',
    keyResults: [
      { title: '用户满意度提升至90%' },
      { title: '市场份额增长15%' }
    ]
  },
  {
    id: 2,
    title: '完善用户界面设计',
    description: '重构产品界面，提升用户体验和交互流畅性',
    type: 'tactical',
    status: 'completed',
    responsible: '李设计师',
    timeRange: '2024年1月',
    weight: 80,
    progress: 100,
    timeDimension: 'month',
    specificTime: '2024-01'
  },
  {
    id: 3,
    title: '周度工作汇报',
    description: '完成本周既定任务，解决了技术难题，推进项目进度',
    type: 'weekly',
    status: 'completed',
    responsible: '王工程师',
    timeRange: '2024年第3周',
    weight: 70,
    progress: 100,
    timeDimension: 'week',
    specificTime: '2024-W03',
    summary: '本周主要完成了API接口开发，修复了2个关键bug，参与了需求评审会议'
  },
  {
    id: 4,
    title: '技术架构优化',
    description: '优化系统架构，提升性能和稳定性',
    type: 'tactical',
    status: 'in-progress',
    responsible: '赵架构师',
    timeRange: '2024年Q1',
    weight: 85,
    progress: 45,
    timeDimension: 'quarter',
    specificTime: '2024-Q1'
  }
])

// 当前显示数据
const currentData = computed(() => {
  let filtered = allData.value

  // 时间维度筛选
  if (queryForm.timeDimension && queryForm.specificTime) {
    filtered = filtered.filter(item => 
      item.timeDimension === queryForm.timeDimension && 
      item.specificTime === queryForm.specificTime
    )
  }

  // 内容类型筛选
  if (queryForm.contentType) {
    filtered = filtered.filter(item => item.type === queryForm.contentType)
  }

  // 关键词筛选
  if (queryForm.keyword) {
    filtered = filtered.filter(item => 
      item.title.includes(queryForm.keyword) ||
      item.description.includes(queryForm.keyword)
    )
  }

  return filtered
})

// 统计数据
const stats = computed(() => {
  const data = currentData.value
  const totalGoals = data.length
  const completedGoals = data.filter(item => item.status === 'completed').length
  const inProgressGoals = data.filter(item => item.status === 'in-progress').length
  const completionRate = totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0

  return {
    totalGoals,
    completedGoals,
    inProgressGoals,
    completionRate
  }
})

// 月度表格列定义
const monthColumns = [
  {
    title: '目标/任务',
    key: 'title',
    width: '30%'
  },
  {
    title: '类型',
    key: 'type',
    width: '12%'
  },
  {
    title: '负责人',
    dataIndex: 'responsible',
    width: '12%'
  },
  {
    title: '状态',
    key: 'status',
    width: '12%'
  },
  {
    title: '进度',
    key: 'progress',
    width: '15%'
  },
  {
    title: '操作',
    key: 'actions',
    width: '19%'
  }
]

// 分页配置
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showTotal: (total: number) => `共 ${total} 条记录`
})

const listPagination = reactive({
  current: 1,
  pageSize: 5,
  total: 0
})

// 获取时间轴颜色
const getTimelineColor = (status: string) => {
  const colorMap: Record<string, string> = {
    'completed': 'green',
    'in-progress': 'blue',
    'pending': 'orange',
    'overdue': 'red'
  }
  return colorMap[status] || 'gray'
}

// 获取类型颜色
const getTypeColor = (type: string) => {
  const colorMap: Record<string, string> = {
    'strategic': '#722ed1',
    'tactical': '#1890ff',
    'weekly': '#faad14',
    'daily': '#52c41a'
  }
  return colorMap[type] || '#d9d9d9'
}

// 获取类型文本
const getTypeText = (type: string) => {
  const textMap: Record<string, string> = {
    'strategic': '战略目标',
    'tactical': '战术规划',
    'weekly': '周报',
    'daily': '日报'
  }
  return textMap[type] || '未知类型'
}

// 获取状态颜色
const getStatusColor = (status: string) => {
  const statusMap: Record<string, string> = {
    draft: 'default',
    reviewing: 'processing',
    approved: 'success',
    rejected: 'error',
    modified: 'warning'
  }
  return statusMap[status] || 'default'
}

// 获取状态文本
const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    draft: '草稿',
    reviewing: '审核中',
    approved: '已通过',
    rejected: '已驳回',
    modified: '修改后通过'
  }
  return statusMap[status] || status
}

// 时间维度变化处理
const handleTimeDimensionChange = () => {
  queryForm.specificTime = ''
  handleQueryChange()
}

// 查询处理
const handleQueryChange = () => {
  loading.value = true
  // 模拟API调用延迟
  setTimeout(() => {
    loading.value = false
    pagination.total = currentData.value.length
    listPagination.total = currentData.value.length
  }, 500)
}

// 重置查询
const resetQuery = () => {
  Object.assign(queryForm, {
    organizationScope: [],
    timeDimension: 'month',
    specificTime: '',
    contentType: '',
    keyword: ''
  })
  handleQueryChange()
}

// 查看详情
const viewDetail = (record: any) => {
  console.log('查看详情:', record)
  message.info('查看详情功能')
}

// 导出单个
const exportSingle = (record: any) => {
  message.info(`导出 ${record.title} 的详细信息`)
}

// 导出查询结果
const exportQuery = () => {
  message.info('导出查询结果功能开发中...')
}

// 表格变化处理
const handleTableChange = (pag: any) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
}

// 明细数据
const planDetails = ref([
  {
    id: 1,
    name: '张三',
    department: '技术部',
    project: '产品优化',
    content: '完成用户体验优化',
    target: '提升用户满意度至90%',
    status: 'approved',
    responsible: '张三',
    createTime: '2024-12-01',
    submitTime: '2024-12-05'
  },
  {
    id: 2,
    name: '李四',
    department: '产品部',
    project: '技术升级',
    content: '升级系统架构',
    target: '完成核心模块重构',
    status: 'reviewing',
    responsible: '李四',
    createTime: '2024-12-01',
    submitTime: '2024-12-03'
  }
])

const summaryDetails = ref([
  {
    id: 1,
    name: '张三',
    department: '技术部',
    project: '产品优化',
    content: '完成用户体验优化',
    target: '提升用户满意度至90%',
    result: '已完成用户体验优化，满意度达到92%',
    score: 4.5,
    status: 'approved',
    responsible: '张三',
    createTime: '2024-11-01',
    submitTime: '2024-11-30'
  }
])

// 计划明细列定义
const planDetailColumns = [
  {
    title: '姓名',
    dataIndex: 'name',
    key: 'name',
    width: 80
  },
  {
    title: '部门',
    dataIndex: 'department',
    key: 'department',
    width: 100
  },
  {
    title: '项目',
    dataIndex: 'project',
    key: 'project',
    width: 120
  },
  {
    title: '内容',
    dataIndex: 'content',
    key: 'content',
    width: 200
  },
  {
    title: '目标',
    dataIndex: 'target',
    key: 'target',
    width: 200
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 100
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    key: 'createTime',
    width: 100
  },
  {
    title: '提交时间',
    dataIndex: 'submitTime',
    key: 'submitTime',
    width: 100
  },
  {
    title: '操作',
    key: 'actions',
    width: 150,
    fixed: 'right'
  }
]

// 总结明细列定义
const summaryDetailColumns = [
  {
    title: '姓名',
    dataIndex: 'name',
    key: 'name',
    width: 80
  },
  {
    title: '部门',
    dataIndex: 'department',
    key: 'department',
    width: 100
  },
  {
    title: '项目',
    dataIndex: 'project',
    key: 'project',
    width: 120
  },
  {
    title: '内容',
    dataIndex: 'content',
    key: 'content',
    width: 150
  },
  {
    title: '目标',
    dataIndex: 'target',
    key: 'target',
    width: 150
  },
  {
    title: '完成结果',
    dataIndex: 'result',
    key: 'result',
    width: 200
  },
  {
    title: '自评分',
    dataIndex: 'score',
    key: 'score',
    width: 120
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 100
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    key: 'createTime',
    width: 100
  },
  {
    title: '操作',
    key: 'actions',
    width: 150,
    fixed: 'right'
  }
]

// 明细操作函数
const auditPlan = (record: any) => {
  console.log('审核计划:', record)
  message.info('审核计划功能')
}

const auditSummary = (record: any) => {
  console.log('审核总结:', record)
  message.info('审核总结功能')
}

const exportDetails = () => {
  message.info('导出明细功能')
}

const refreshDetails = () => {
  message.success('刷新成功')
}

// 页面初始化
onMounted(() => {
  queryForm.specificTime = '2024-01'
  handleQueryChange()
})
</script>

<style scoped>
.goal-query {
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

.result-stats {
  background: #fafafa;
  padding: 16px;
  border-radius: 6px;
  border: 1px solid #f0f0f0;
}

.timeline-content {
  background: #fafafa;
  padding: 16px;
  border-radius: 6px;
  border-left: 3px solid #1890ff;
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.content-header h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.content-meta {
  margin-top: 8px;
  color: #666;
  font-size: 12px;
}

.content-meta span {
  margin-right: 16px;
}

.quarter-card {
  margin-bottom: 16px;
}

.progress-info {
  margin-top: 8px;
}

.meta-info {
  display: block;
  margin-top: 4px;
  color: #666;
  font-size: 12px;
}

.detail-content {
  max-height: 500px;
  overflow-y: auto;
}

:deep(.ant-descriptions-item-label) {
  font-weight: 600;
}
</style> 