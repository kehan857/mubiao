<template>
  <div class="daily-reports">
    <!-- 页面标题 -->
    <div class="page-header">
      <div class="header-content">
        <div class="title-area">
          <h2>日报管理</h2>
          <p>记录每日工作内容，追踪工作进展</p>
        </div>
        <div class="actions">
          <a-button type="primary" @click="showReportModal = true">
            <PlusOutlined />
            写日报
          </a-button>
        </div>
      </div>
    </div>

    <!-- 快速操作区 -->
    <a-row :gutter="16" style="margin-bottom: 16px">
      <a-col :span="8">
        <a-card>
          <a-statistic
            title="本月日报"
            :value="stats.monthlyReports"
            suffix="篇"
            :value-style="{ color: '#1890ff' }"
          >
            <template #prefix>
              <FileTextOutlined />
            </template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :span="8">
        <a-card>
          <a-statistic
            title="连续记录"
            :value="stats.continuousDays"
            suffix="天"
            :value-style="{ color: '#52c41a' }"
          >
            <template #prefix>
              <CalendarOutlined />
            </template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :span="8">
        <a-card>
          <a-statistic
            title="完成任务"
            :value="stats.completedTasks"
            suffix="项"
            :value-style="{ color: '#722ed1' }"
          >
            <template #prefix>
              <CheckCircleOutlined />
            </template>
          </a-statistic>
        </a-card>
      </a-col>
    </a-row>

    <!-- 筛选区域 -->
    <a-card style="margin-bottom: 16px">
      <a-row :gutter="16">
        <a-col :span="6">
          <a-date-picker
            v-model:value="filters.dateRange"
            type="range"
            placeholder="选择日期范围"
            style="width: 100%"
            @change="handleFilterChange"
          />
        </a-col>
        <a-col :span="6">
          <a-select
            v-model:value="filters.status"
            placeholder="选择状态"
            style="width: 100%"
            @change="handleFilterChange"
          >
            <a-select-option value="">全部状态</a-select-option>
            <a-select-option value="draft">草稿</a-select-option>
            <a-select-option value="submitted">已提交</a-select-option>
            <a-select-option value="reviewed">已查看</a-select-option>
          </a-select>
        </a-col>
        <a-col :span="6">
          <a-input-search
            v-model:value="filters.keyword"
            placeholder="搜索日报内容"
            @search="handleFilterChange"
          />
        </a-col>
        <a-col :span="6">
          <a-button @click="generateWeeklyReport">
            <FileAddOutlined />
            生成周报
          </a-button>
        </a-col>
      </a-row>
    </a-card>

    <!-- 日报列表 -->
    <a-card>
      <a-timeline>
        <a-timeline-item
          v-for="report in filteredReports"
          :key="report.id"
          :color="getTimelineColor(report.date)"
        >
          <template #dot>
            <div class="timeline-dot">
              <CalendarOutlined v-if="isToday(report.date)" />
              <CheckCircleOutlined v-else-if="report.status === 'submitted'" />
              <EditOutlined v-else />
            </div>
          </template>
          
          <div class="report-item">
            <div class="report-header">
              <div class="date-info">
                <h4>{{ formatDate(report.date) }}</h4>
                <a-tag :color="getStatusColor(report.status)">
                  {{ getStatusText(report.status) }}
                </a-tag>
              </div>
              <div class="actions">
                <a-button type="link" size="small" @click="editReport(report)">
                  编辑
                </a-button>
                <a-button type="link" size="small" @click="viewReport(report)">
                  查看
                </a-button>
                <a-dropdown>
                  <template #overlay>
                    <a-menu @click="(e) => handleReportAction(e, report)">
                      <a-menu-item key="copy">复制</a-menu-item>
                      <a-menu-item key="link">关联目标</a-menu-item>
                      <a-menu-divider />
                      <a-menu-item key="delete" style="color: #ff4d4f">删除</a-menu-item>
                    </a-menu>
                  </template>
                  <a-button type="link" size="small">
                    更多 <DownOutlined />
                  </a-button>
                </a-dropdown>
              </div>
            </div>
            
            <div class="report-content">
              <div class="content-section">
                <h5>今日完成：</h5>
                <ul>
                  <li v-for="(item, index) in report.completed" :key="index">
                    {{ item }}
                  </li>
                </ul>
              </div>
              
              <div class="content-section" v-if="report.issues.length > 0">
                <h5>遇到问题：</h5>
                <ul>
                  <li v-for="(item, index) in report.issues" :key="index" class="issue-item">
                    {{ item }}
                  </li>
                </ul>
              </div>
              
              <div class="content-section">
                <h5>明日计划：</h5>
                <ul>
                  <li v-for="(item, index) in report.tomorrow" :key="index">
                    {{ item }}
                  </li>
                </ul>
              </div>
              
              <div class="report-meta">
                <span class="meta-item">
                  <ClockCircleOutlined />
                  工作时长：{{ report.workHours }}小时
                </span>
                <span class="meta-item" v-if="report.linkedGoals.length > 0">
                  <LinkOutlined />
                  关联目标：{{ report.linkedGoals.length }}个
                </span>
                <span class="meta-item">
                  <UserOutlined />
                  提交时间：{{ report.submitTime }}
                </span>
              </div>
            </div>
          </div>
        </a-timeline-item>
      </a-timeline>

      <!-- 加载更多 -->
      <div style="text-align: center; margin-top: 24px" v-if="hasMore">
        <a-button @click="loadMore" :loading="loadingMore">
          加载更多
        </a-button>
      </div>
    </a-card>

    <!-- 写日报弹窗 -->
    <a-modal
      v-model:open="showReportModal"
      title="写日报"
      width="800px"
      @ok="handleSubmitReport"
      @cancel="resetReportForm"
    >
      <a-form
        ref="reportFormRef"
        :model="reportForm"
        :rules="reportRules"
        layout="vertical"
      >
        <a-form-item label="日期" name="date">
          <a-date-picker
            v-model:value="reportForm.date"
            style="width: 100%"
            :disabled="isEditMode"
          />
        </a-form-item>

        <a-form-item label="今日完成" name="completed">
          <div v-for="(item, index) in reportForm.completed" :key="index" class="form-list-item">
            <a-row :gutter="8" align="middle">
              <a-col :span="20">
                <a-input
                  v-model:value="reportForm.completed[index]"
                  :placeholder="`完成事项 ${index + 1}`"
                />
              </a-col>
              <a-col :span="4">
                <a-button
                  type="text"
                  danger
                  @click="removeCompletedItem(index)"
                  :disabled="reportForm.completed.length === 1"
                >
                  <DeleteOutlined />
                </a-button>
              </a-col>
            </a-row>
          </div>
          <a-button type="dashed" @click="addCompletedItem" style="width: 100%; margin-top: 8px">
            <PlusOutlined /> 添加完成事项
          </a-button>
        </a-form-item>

        <a-form-item label="遇到问题">
          <div v-for="(item, index) in reportForm.issues" :key="index" class="form-list-item">
            <a-row :gutter="8" align="middle">
              <a-col :span="20">
                <a-input
                  v-model:value="reportForm.issues[index]"
                  :placeholder="`问题 ${index + 1}`"
                />
              </a-col>
              <a-col :span="4">
                <a-button
                  type="text"
                  danger
                  @click="removeIssueItem(index)"
                >
                  <DeleteOutlined />
                </a-button>
              </a-col>
            </a-row>
          </div>
          <a-button type="dashed" @click="addIssueItem" style="width: 100%; margin-top: 8px">
            <PlusOutlined /> 添加问题
          </a-button>
        </a-form-item>

        <a-form-item label="明日计划" name="tomorrow">
          <div v-for="(item, index) in reportForm.tomorrow" :key="index" class="form-list-item">
            <a-row :gutter="8" align="middle">
              <a-col :span="20">
                <a-input
                  v-model:value="reportForm.tomorrow[index]"
                  :placeholder="`计划事项 ${index + 1}`"
                />
              </a-col>
              <a-col :span="4">
                <a-button
                  type="text"
                  danger
                  @click="removeTomorrowItem(index)"
                  :disabled="reportForm.tomorrow.length === 1"
                >
                  <DeleteOutlined />
                </a-button>
              </a-col>
            </a-row>
          </div>
          <a-button type="dashed" @click="addTomorrowItem" style="width: 100%; margin-top: 8px">
            <PlusOutlined /> 添加计划事项
          </a-button>
        </a-form-item>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="工作时长(小时)" name="workHours">
              <a-input-number
                v-model:value="reportForm.workHours"
                :min="0"
                :max="24"
                :step="0.5"
                style="width: 100%"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="关联目标">
              <a-select
                v-model:value="reportForm.linkedGoals"
                mode="multiple"
                placeholder="选择关联的目标"
                style="width: 100%"
              >
                <a-select-option
                  v-for="goal in availableGoals"
                  :key="goal.id"
                  :value="goal.id"
                >
                  {{ goal.title }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'
import {
  PlusOutlined,
  FileTextOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  FileAddOutlined,
  EditOutlined,
  DownOutlined,
  ClockCircleOutlined,
  LinkOutlined,
  UserOutlined,
  DeleteOutlined
} from '@ant-design/icons-vue'

// 页面状态
const loading = ref(false)
const loadingMore = ref(false)
const showReportModal = ref(false)
const isEditMode = ref(false)
const hasMore = ref(true)

// 统计数据
const stats = reactive({
  monthlyReports: 22,
  continuousDays: 15,
  completedTasks: 87
})

// 筛选条件
const filters = reactive({
  dateRange: null as any,
  status: '',
  keyword: ''
})

// 日报数据
const reports = ref([
  {
    id: 1,
    date: dayjs().format('YYYY-MM-DD'),
    status: 'draft',
    completed: [
      '完成用户反馈页面开发',
      '参与产品需求评审会议',
      '更新API文档'
    ],
    issues: [
      '第三方接口响应较慢，影响页面加载速度'
    ],
    tomorrow: [
      '优化接口调用逻辑',
      '完成单元测试',
      '准备周会汇报材料'
    ],
    workHours: 8.5,
    linkedGoals: [1, 2],
    submitTime: '18:30'
  },
  {
    id: 2,
    date: dayjs().subtract(1, 'day').format('YYYY-MM-DD'),
    status: 'submitted',
    completed: [
      '完成数据统计功能',
      '修复已知bug 3个',
      '代码review'
    ],
    issues: [],
    tomorrow: [
      '开始用户反馈页面开发',
      '参与产品评审会议'
    ],
    workHours: 8,
    linkedGoals: [1],
    submitTime: '17:45'
  }
])

// 可用目标列表
const availableGoals = ref([
  { id: 1, title: '用户体验优化' },
  { id: 2, title: '系统性能提升' },
  { id: 3, title: '代码质量改进' }
])

// 表单数据
const reportForm = reactive({
  date: dayjs(),
  completed: [''],
  issues: [''],
  tomorrow: [''],
  workHours: 8,
  linkedGoals: []
})

// 表单验证规则
const reportRules = {
  date: [{ required: true, message: '请选择日期', trigger: 'change' }],
  completed: [{ required: true, message: '请填写今日完成内容', trigger: 'blur' }],
  tomorrow: [{ required: true, message: '请填写明日计划', trigger: 'blur' }],
  workHours: [{ required: true, message: '请填写工作时长', trigger: 'blur' }]
}

// 过滤后的日报列表
const filteredReports = computed(() => {
  let result = reports.value

  if (filters.dateRange && filters.dateRange.length === 2) {
    const [start, end] = filters.dateRange
    result = result.filter(report => {
      const reportDate = dayjs(report.date)
      return reportDate.isAfter(start.subtract(1, 'day')) && reportDate.isBefore(end.add(1, 'day'))
    })
  }

  if (filters.status) {
    result = result.filter(report => report.status === filters.status)
  }

  if (filters.keyword) {
    result = result.filter(report =>
      report.completed.some(item => item.includes(filters.keyword)) ||
      report.issues.some(item => item.includes(filters.keyword)) ||
      report.tomorrow.some(item => item.includes(filters.keyword))
    )
  }

  return result.sort((a, b) => dayjs(b.date).unix() - dayjs(a.date).unix())
})

// 获取时间线颜色
const getTimelineColor = (date: string) => {
  if (isToday(date)) return '#1890ff'
  if (dayjs(date).isAfter(dayjs().subtract(7, 'day'))) return '#52c41a'
  return '#d9d9d9'
}

// 判断是否为今天
const isToday = (date: string) => {
  return dayjs(date).isSame(dayjs(), 'day')
}

// 格式化日期
const formatDate = (date: string) => {
  const target = dayjs(date)
  const today = dayjs()
  
  if (target.isSame(today, 'day')) {
    return '今天 ' + target.format('MM-DD')
  } else if (target.isSame(today.subtract(1, 'day'), 'day')) {
    return '昨天 ' + target.format('MM-DD')
  } else {
    return target.format('YYYY-MM-DD dddd')
  }
}

// 获取状态颜色
const getStatusColor = (status: string) => {
  const colorMap: Record<string, string> = {
    'draft': '#d9d9d9',
    'submitted': '#52c41a',
    'reviewed': '#1890ff'
  }
  return colorMap[status] || '#d9d9d9'
}

// 获取状态文本
const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    'draft': '草稿',
    'submitted': '已提交',
    'reviewed': '已查看'
  }
  return textMap[status] || '未知'
}

// 筛选变化处理
const handleFilterChange = () => {
  console.log('Filter changed:', filters)
}

// 编辑日报
const editReport = (report: any) => {
  Object.assign(reportForm, {
    ...report,
    date: dayjs(report.date)
  })
  isEditMode.value = true
  showReportModal.value = true
}

// 查看日报
const viewReport = (report: any) => {
  console.log('View report:', report)
}

// 日报操作处理
const handleReportAction = (e: any, report: any) => {
  const { key } = e
  console.log('Report action:', key, report)
  
  switch (key) {
    case 'copy':
      message.info('复制功能待实现')
      break
    case 'link':
      message.info('关联目标功能待实现')
      break
    case 'delete':
      message.info('删除功能待实现')
      break
  }
}

// 生成周报
const generateWeeklyReport = () => {
  message.info('生成周报功能待实现')
}

// 加载更多
const loadMore = () => {
  loadingMore.value = true
  setTimeout(() => {
    loadingMore.value = false
    hasMore.value = false
  }, 1000)
}

// 添加完成项
const addCompletedItem = () => {
  reportForm.completed.push('')
}

// 移除完成项
const removeCompletedItem = (index: number) => {
  reportForm.completed.splice(index, 1)
}

// 添加问题项
const addIssueItem = () => {
  reportForm.issues.push('')
}

// 移除问题项
const removeIssueItem = (index: number) => {
  reportForm.issues.splice(index, 1)
}

// 添加明日计划项
const addTomorrowItem = () => {
  reportForm.tomorrow.push('')
}

// 移除明日计划项
const removeTomorrowItem = (index: number) => {
  reportForm.tomorrow.splice(index, 1)
}

// 提交日报
const handleSubmitReport = () => {
  console.log('Submit report:', reportForm)
  message.success('日报提交成功')
  showReportModal.value = false
  resetReportForm()
}

// 重置表单
const resetReportForm = () => {
  Object.assign(reportForm, {
    date: dayjs(),
    completed: [''],
    issues: [''],
    tomorrow: [''],
    workHours: 8,
    linkedGoals: []
  })
  isEditMode.value = false
}

// 页面初始化
onMounted(() => {
  // 初始化数据
})
</script>

<style scoped>
.daily-reports {
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

.timeline-dot {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #1890ff;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 12px;
}

.report-item {
  margin-left: 16px;
  padding: 16px;
  background: #fafafa;
  border-radius: 8px;
  border: 1px solid #e8e8e8;
}

.report-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.date-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.date-info h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.content-section {
  margin-bottom: 16px;
}

.content-section h5 {
  margin: 0 0 8px 0;
  font-size: 14px;
  font-weight: 600;
  color: #1890ff;
}

.content-section ul {
  margin: 0;
  padding-left: 20px;
}

.content-section li {
  margin-bottom: 4px;
  line-height: 1.5;
}

.issue-item {
  color: #ff4d4f;
}

.report-meta {
  display: flex;
  gap: 16px;
  padding-top: 12px;
  border-top: 1px solid #e8e8e8;
  font-size: 12px;
  color: #666;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.form-list-item {
  margin-bottom: 8px;
}

.form-list-item:last-child {
  margin-bottom: 0;
}
</style> 