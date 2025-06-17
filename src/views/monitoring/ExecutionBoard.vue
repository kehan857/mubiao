<template>
  <div class="execution-board">
    <!-- 页面标题 -->
    <div class="page-header">
      <div class="header-content">
        <div class="title-area">
          <h2>执行看板</h2>
          <p>实时监控目标执行情况和团队工作状态</p>
        </div>
        <div class="actions">
          <a-button @click="refreshData" :loading="loading">
            <ReloadOutlined />
            刷新数据
          </a-button>
          <a-button type="primary" @click="exportReport">
            <DownloadOutlined />
            导出报告
          </a-button>
        </div>
      </div>
    </div>

    <!-- 统计卡片 -->
    <a-row :gutter="16" style="margin-bottom: 24px">
      <a-col :span="6">
        <a-card>
          <a-statistic
            title="总体目标完成率"
            :value="statistics.totalCompletion"
            suffix="%"
            :value-style="{ color: '#3f8600' }"
          >
            <template #prefix>
              <CheckCircleOutlined />
            </template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <a-statistic
            title="按时完成率"
            :value="statistics.onTimeCompletion"
            suffix="%"
            :value-style="{ color: '#1890ff' }"
          >
            <template #prefix>
              <ClockCircleOutlined />
            </template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <a-statistic
            title="关联部门"
            :value="statistics.departmentCount"
            :value-style="{ color: '#722ed1' }"
          >
            <template #prefix>
              <ApartmentOutlined />
            </template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <a-statistic
            title="参与人员"
            :value="statistics.activeMembers"
            :value-style="{ color: '#fa8c16' }"
          >
            <template #prefix>
              <TeamOutlined />
            </template>
          </a-statistic>
        </a-card>
      </a-col>
    </a-row>

    <!-- 筛选区域 -->
    <a-card style="margin-bottom: 16px">
      <a-row :gutter="16">
        <a-col :span="6">
          <a-select v-model:value="filters.period" placeholder="选择时期" style="width: 100%" @change="handleFilterChange">
            <a-select-option value="">全部时期</a-select-option>
            <a-select-option value="2024">2024年</a-select-option>
            <a-select-option value="2024-Q4">2024年Q4</a-select-option>
            <a-select-option value="2024-12">2024年12月</a-select-option>
          </a-select>
        </a-col>
        <a-col :span="6">
          <a-select v-model:value="filters.department" placeholder="选择部门" style="width: 100%" @change="handleFilterChange">
            <a-select-option value="">全部部门</a-select-option>
            <a-select-option value="技术部">技术部</a-select-option>
            <a-select-option value="产品部">产品部</a-select-option>
            <a-select-option value="市场部">市场部</a-select-option>
            <a-select-option value="人事部">人事部</a-select-option>
            <a-select-option value="运营部">运营部</a-select-option>
            <a-select-option value="财务部">财务部</a-select-option>
          </a-select>
        </a-col>
        <a-col :span="6">
          <a-select v-model:value="filters.status" placeholder="执行状态" style="width: 100%" @change="handleFilterChange">
            <a-select-option value="">全部状态</a-select-option>
            <a-select-option value="completed">已完成</a-select-option>
            <a-select-option value="in-progress">进行中</a-select-option>
            <a-select-option value="delayed">延期</a-select-option>
            <a-select-option value="pending">未开始</a-select-option>
          </a-select>
        </a-col>
        <a-col :span="6">
          <a-input-search
            v-model:value="filters.keyword"
            placeholder="搜索部门"
            @search="handleFilterChange"
          />
        </a-col>
      </a-row>
    </a-card>

    <!-- 图表区域 -->
    <a-row :gutter="16" style="margin-top: 24px">
      <a-col :span="12">
        <a-card title="各部门完成率对比" style="height: 400px">
          <div ref="departmentChartRef" style="height: 320px"></div>
        </a-card>
      </a-col>
      <a-col :span="12">
        <a-card title="月度目标达成趋势" style="height: 400px">
          <div ref="trendChartRef" style="height: 320px"></div>
        </a-card>
      </a-col>
    </a-row>

    <!-- 执行情况列表 -->
    <a-card title="目标执行详情">
      <template #extra>
        <a-space>
          <a-button @click="batchUpdate" :disabled="selectedRows.length === 0">
            批量更新状态
          </a-button>
          <a-button @click="batchRemind" :disabled="selectedRows.length === 0">
            批量提醒
          </a-button>
        </a-space>
      </template>

      <a-table
        :dataSource="filteredExecutionData"
        :columns="executionColumns"
        :loading="loading"
        :pagination="pagination"
        :row-selection="{ selectedRowKeys: selectedRows, onChange: handleSelectionChange }"
        @change="handleTableChange"
        row-key="id"
        :scroll="{ x: 1500 }"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'departmentHead'">
            <a-space>
              <a-avatar size="small">{{ record.departmentHead.charAt(0) }}</a-avatar>
              <span>{{ record.departmentHead }}</span>
            </a-space>
          </template>

          <template v-else-if="column.key === 'progress'">
            <a-progress 
              :percent="record.progress" 
              size="small" 
              :status="getProgressStatus(record.progress)"
              style="width: 120px"
            />
          </template>

          <template v-else-if="column.key === 'status'">
            <a-tag :color="getStatusColor(record.status)">
              {{ getStatusText(record.status) }}
            </a-tag>
          </template>

          <template v-else-if="column.key === 'priority'">
            <a-tag :color="getPriorityColor(record.priority)">
              {{ getPriorityText(record.priority) }}
            </a-tag>
          </template>

          <template v-else-if="column.key === 'actions'">
            <a-space>
              <a-button type="primary" size="small" @click="viewDetail(record)">
                查看详情
              </a-button>
              <a-button size="small" @click="updateStatus(record)">
                更新状态
              </a-button>
              <a-button size="small" @click="sendReminder(record)">
                发送提醒
              </a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 详情弹窗 -->
    <a-modal
      v-model:open="showDetailModal"
      :title="`${currentItem?.departmentHead} - 执行详情`"
      width="800px"
      @cancel="showDetailModal = false"
      :footer="null"
    >
      <div class="detail-content">
        <a-descriptions title="部门信息" :column="2" size="small">
          <a-descriptions-item label="部门名称">{{ currentItem?.department }}</a-descriptions-item>
          <a-descriptions-item label="部门负责人">{{ currentItem?.departmentHead }}</a-descriptions-item>
          <a-descriptions-item label="目标总数">{{ currentItem?.totalGoals }}</a-descriptions-item>
          <a-descriptions-item label="已完成">{{ currentItem?.completedGoals }}</a-descriptions-item>
          <a-descriptions-item label="进行中">{{ currentItem?.inProgressGoals }}</a-descriptions-item>
          <a-descriptions-item label="延期">{{ currentItem?.delayedGoals }}</a-descriptions-item>
          <a-descriptions-item label="完成率">{{ currentItem?.progress }}%</a-descriptions-item>
          <a-descriptions-item label="状态">{{ getStatusText(currentItem?.status) }}</a-descriptions-item>
          <a-descriptions-item label="优先级">{{ getPriorityText(currentItem?.priority) }}</a-descriptions-item>
          <a-descriptions-item label="开始时间">{{ currentItem?.startDate }}</a-descriptions-item>
          <a-descriptions-item label="计划结束时间">{{ currentItem?.endDate }}</a-descriptions-item>
        </a-descriptions>

        <a-divider />
        <h4>执行历史</h4>
        <a-timeline>
          <a-timeline-item v-for="(history, index) in currentItem?.history" :key="index">
            <span>{{ history.date }}</span> - {{ history.action }}
          </a-timeline-item>
        </a-timeline>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { message } from 'ant-design-vue'
import {
  ReloadOutlined,
  DownloadOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ApartmentOutlined,
  TeamOutlined,
  BarChartOutlined,
  LineChartOutlined
} from '@ant-design/icons-vue'

// 页面状态
const loading = ref(false)
const showDetailModal = ref(false)
const selectedRows = ref<number[]>([])
const currentItem = ref<any>(null)

// 图表引用
const departmentChartRef = ref<HTMLElement>()
const trendChartRef = ref<HTMLElement>()

// 筛选条件
const filters = reactive({
  period: '',
  department: '',
  status: '',
  keyword: ''
})

// 统计数据
const statistics = ref({
  totalCompletion: 87,
  onTimeCompletion: 83,
  departmentCount: 6,
  activeMembers: 45
})

// 执行数据 - 改为部门维度
const executionData = ref([
  {
    id: 1,
    department: '技术部',
    departmentHead: '张三',
    totalGoals: 15,
    completedGoals: 12,
    inProgressGoals: 2,
    delayedGoals: 1,
    progress: 85,
    status: 'in-progress',
    priority: 'high',
    startDate: '2024-12-01',
    endDate: '2024-12-31',
    history: [
      { date: '2024-12-01', action: '部门目标制定' },
      { date: '2024-12-15', action: '月度目标检查' },
      { date: '2024-12-20', action: '目标执行调整' }
    ]
  },
  {
    id: 2,
    department: '市场部',
    departmentHead: '李四',
    totalGoals: 12,
    completedGoals: 10,
    inProgressGoals: 1,
    delayedGoals: 1,
    progress: 92,
    status: 'completed',
    priority: 'medium',
    startDate: '2024-11-15',
    endDate: '2024-12-15',
    history: [
      { date: '2024-11-15', action: '市场目标制定' },
      { date: '2024-11-30', action: '推广目标达成' },
      { date: '2024-12-15', action: '季度目标完成' }
    ]
  },
  {
    id: 3,
    department: '人事部',
    departmentHead: '王五',
    totalGoals: 8,
    completedGoals: 5,
    inProgressGoals: 2,
    delayedGoals: 1,
    progress: 70,
    status: 'in-progress',
    priority: 'low',
    startDate: '2024-12-01',
    endDate: '2024-12-30',
    history: [
      { date: '2024-12-01', action: '人事目标制定' },
      { date: '2024-12-10', action: '培训目标启动' }
    ]
  },
  {
    id: 4,
    department: '产品部',
    departmentHead: '赵六',
    totalGoals: 10,
    completedGoals: 9,
    inProgressGoals: 1,
    delayedGoals: 0,
    progress: 95,
    status: 'completed',
    priority: 'high',
    startDate: '2024-11-01',
    endDate: '2024-11-30',
    history: [
      { date: '2024-11-01', action: '产品目标评估' },
      { date: '2024-11-15', action: '产品迭代目标' },
      { date: '2024-11-30', action: '产品目标达成' }
    ]
  },
  {
    id: 5,
    department: '运营部',
    departmentHead: '孙七',
    totalGoals: 14,
    completedGoals: 8,
    inProgressGoals: 4,
    delayedGoals: 2,
    progress: 65,
    status: 'in-progress',
    priority: 'medium',
    startDate: '2024-12-10',
    endDate: '2024-12-25',
    history: [
      { date: '2024-12-10', action: '运营目标制定' },
      { date: '2024-12-15', action: '用户增长目标调整' }
    ]
  },
  {
    id: 6,
    department: '财务部',
    departmentHead: '钱八',
    totalGoals: 6,
    completedGoals: 5,
    inProgressGoals: 1,
    delayedGoals: 0,
    progress: 88,
    status: 'in-progress',
    priority: 'high',
    startDate: '2024-12-01',
    endDate: '2024-12-31',
    history: [
      { date: '2024-12-01', action: '财务目标制定' },
      { date: '2024-12-20', action: '预算执行检查' }
    ]
  }
])

// 表格列定义 - 删除项目名称，以部门维度展示
const executionColumns = [
  {
    title: '部门名称',
    dataIndex: 'department',
    key: 'department',
    width: 120,
    fixed: 'left'
  },
  {
    title: '部门负责人',
    key: 'departmentHead',
    width: 120
  },
  {
    title: '目标总数',
    dataIndex: 'totalGoals',
    key: 'totalGoals',
    width: 100
  },
  {
    title: '已完成',
    dataIndex: 'completedGoals',
    key: 'completedGoals',
    width: 100
  },
  {
    title: '进行中',
    dataIndex: 'inProgressGoals',
    key: 'inProgressGoals',
    width: 100
  },
  {
    title: '延期',
    dataIndex: 'delayedGoals',
    key: 'delayedGoals',
    width: 80
  },
  {
    title: '完成率',
    key: 'progress',
    width: 150
  },
  {
    title: '状态',
    key: 'status',
    width: 100
  },
  {
    title: '优先级',
    key: 'priority',
    width: 100
  },
  {
    title: '开始时间',
    dataIndex: 'startDate',
    key: 'startDate',
    width: 120
  },
  {
    title: '计划结束时间',
    dataIndex: 'endDate',
    key: 'endDate',
    width: 120
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

// 过滤后的数据
const filteredExecutionData = computed(() => {
  let result = executionData.value

  if (filters.department) {
    result = result.filter(item => item.department === filters.department)
  }
  
  if (filters.status) {
    result = result.filter(item => item.status === filters.status)
  }
  
  if (filters.keyword) {
    result = result.filter(item => 
      item.department.includes(filters.keyword) ||
      item.departmentHead.includes(filters.keyword)
    )
  }

  return result
})

// 获取进度状态
const getProgressStatus = (progress: number) => {
  if (progress < 30) return 'exception'
  if (progress < 70) return 'active'
  return 'success'
}

// 获取状态颜色
const getStatusColor = (status: string) => {
  const colorMap: Record<string, string> = {
    'completed': '#52c41a',
    'in-progress': '#1890ff',
    'delayed': '#f5222d',
    'pending': '#faad14'
  }
  return colorMap[status] || '#d9d9d9'
}

// 获取状态文本
const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    'completed': '已完成',
    'in-progress': '进行中',
    'delayed': '延期',
    'pending': '未开始'
  }
  return textMap[status] || '未知'
}

// 获取优先级颜色
const getPriorityColor = (priority: string) => {
  const colorMap: Record<string, string> = {
    'high': '#f5222d',
    'medium': '#fa8c16',
    'low': '#52c41a'
  }
  return colorMap[priority] || '#d9d9d9'
}

// 获取优先级文本
const getPriorityText = (priority: string) => {
  const textMap: Record<string, string> = {
    'high': '高',
    'medium': '中',
    'low': '低'
  }
  return textMap[priority] || '未知'
}

// 刷新数据
const refreshData = async () => {
  loading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    message.success('数据刷新成功')
  } catch (error) {
    message.error('数据刷新失败')
  } finally {
    loading.value = false
  }
}

// 导出报告
const exportReport = () => {
  message.info('导出报告功能开发中...')
}

// 查看详情
const viewDetail = (record: any) => {
  currentItem.value = record
  showDetailModal.value = true
}

// 更新状态
const updateStatus = (record: any) => {
  message.info(`更新${record.department}状态`)
}

// 发送提醒
const sendReminder = (record: any) => {
  message.success(`已向${record.departmentHead}发送提醒`)
}

// 批量操作
const batchUpdate = () => {
  message.info('批量更新状态功能开发中...')
}

const batchRemind = () => {
  message.info('批量提醒功能开发中...')
}

// 选择变化处理
const handleSelectionChange = (selectedRowKeys: number[]) => {
  selectedRows.value = selectedRowKeys
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

// 初始化图表
const initCharts = async () => {
  await nextTick()
  
  // 部门完成率对比图
  if (departmentChartRef.value) {
    departmentChartRef.value.innerHTML = `
      <div style="padding: 20px">
        <div style="display: flex; align-items: end; justify-content: space-around; height: 250px;">
          <div style="display: flex; flex-direction: column; align-items: center;">
            <div style="background: #52c41a; width: 30px; height: 190px; margin-bottom: 8px; border-radius: 4px;"></div>
            <div style="font-size: 11px;">产品部</div>
            <div style="font-size: 12px; font-weight: bold; color: #52c41a;">95%</div>
          </div>
          <div style="display: flex; flex-direction: column; align-items: center;">
            <div style="background: #1890ff; width: 30px; height: 184px; margin-bottom: 8px; border-radius: 4px;"></div>
            <div style="font-size: 11px;">市场部</div>
            <div style="font-size: 12px; font-weight: bold; color: #1890ff;">92%</div>
          </div>
          <div style="display: flex; flex-direction: column; align-items: center;">
            <div style="background: #722ed1; width: 30px; height: 176px; margin-bottom: 8px; border-radius: 4px;"></div>
            <div style="font-size: 11px;">财务部</div>
            <div style="font-size: 12px; font-weight: bold; color: #722ed1;">88%</div>
          </div>
          <div style="display: flex; flex-direction: column; align-items: center;">
            <div style="background: #fa8c16; width: 30px; height: 170px; margin-bottom: 8px; border-radius: 4px;"></div>
            <div style="font-size: 11px;">技术部</div>
            <div style="font-size: 12px; font-weight: bold; color: #fa8c16;">85%</div>
          </div>
          <div style="display: flex; flex-direction: column; align-items: center;">
            <div style="background: #13c2c2; width: 30px; height: 140px; margin-bottom: 8px; border-radius: 4px;"></div>
            <div style="font-size: 11px;">人事部</div>
            <div style="font-size: 12px; font-weight: bold; color: #13c2c2;">70%</div>
          </div>
          <div style="display: flex; flex-direction: column; align-items: center;">
            <div style="background: #eb2f96; width: 30px; height: 130px; margin-bottom: 8px; border-radius: 4px;"></div>
            <div style="font-size: 11px;">运营部</div>
            <div style="font-size: 12px; font-weight: bold; color: #eb2f96;">65%</div>
          </div>
        </div>
      </div>
    `
  }
  
  // 月度目标达成趋势图
  if (trendChartRef.value) {
    trendChartRef.value.innerHTML = `
      <div style="padding: 20px">
        <svg width="100%" height="250" viewBox="0 0 400 250">
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style="stop-color:#1890ff;stop-opacity:0.3" />
              <stop offset="100%" style="stop-color:#1890ff;stop-opacity:0.05" />
            </linearGradient>
          </defs>
          <g stroke="#f0f0f0" stroke-width="1">
            <line x1="50" y1="200" x2="350" y2="200" />
            <line x1="50" y1="150" x2="350" y2="150" />
            <line x1="50" y1="100" x2="350" y2="100" />
            <line x1="50" y1="50" x2="350" y2="50" />
          </g>
          <polyline fill="url(#gradient)" stroke="#1890ff" stroke-width="3" 
                    points="50,170 150,140 250,110 350,80" />
          <circle cx="50" cy="170" r="4" fill="#1890ff" />
          <circle cx="150" cy="140" r="4" fill="#1890ff" />
          <circle cx="250" cy="110" r="4" fill="#1890ff" />
          <circle cx="350" cy="80" r="4" fill="#1890ff" />
          <text x="50" y="230" text-anchor="middle" font-size="12" fill="#666">10月</text>
          <text x="150" y="230" text-anchor="middle" font-size="12" fill="#666">11月</text>
          <text x="250" y="230" text-anchor="middle" font-size="12" fill="#666">12月</text>
          <text x="350" y="230" text-anchor="middle" font-size="12" fill="#666">1月</text>
          <text x="50" y="160" text-anchor="middle" font-size="11" fill="#1890ff" font-weight="bold">75%</text>
          <text x="150" y="130" text-anchor="middle" font-size="11" fill="#1890ff" font-weight="bold">82%</text>
          <text x="250" y="100" text-anchor="middle" font-size="11" fill="#1890ff" font-weight="bold">87%</text>
          <text x="350" y="70" text-anchor="middle" font-size="11" fill="#1890ff" font-weight="bold">92%</text>
        </svg>
      </div>
    `
  }
}

// 页面初始化
onMounted(() => {
  pagination.total = executionData.value.length
  initCharts()
})
</script>

<style scoped>
.execution-board {
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

.detail-content {
  max-height: 600px;
  overflow-y: auto;
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