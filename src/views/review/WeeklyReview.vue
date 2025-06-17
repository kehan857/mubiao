<template>
  <div class="weekly-review">
    <!-- 页面标题 -->
    <div class="page-header">
      <div class="header-content">
        <div class="title-area">
          <h2>周报审核</h2>
          <p>审核下属周报，提供反馈和指导</p>
        </div>
        <div class="actions">
          <a-button @click="batchApprove" :disabled="selectedRows.length === 0">
            批量审批
          </a-button>
          <a-button type="primary" @click="exportResults">
            导出结果
          </a-button>
        </div>
      </div>
    </div>

    <!-- 筛选区域 -->
    <a-card style="margin-bottom: 16px">
      <a-row :gutter="16">
        <a-col :span="6">
          <a-range-picker
            v-model:value="filters.weekRange"
            picker="week"
            placeholder="选择周范围"
            style="width: 100%"
            @change="handleFilterChange"
          />
        </a-col>
        <a-col :span="6">
          <a-select
            v-model:value="filters.status"
            placeholder="审批状态"
            style="width: 100%"
            @change="handleFilterChange"
          >
            <a-select-option value="">全部状态</a-select-option>
            <a-select-option value="pending">待审批</a-select-option>
            <a-select-option value="approved">已审批</a-select-option>
            <a-select-option value="rejected">已驳回</a-select-option>
          </a-select>
        </a-col>
        <a-col :span="6">
          <a-select
            v-model:value="reviewMode"
            placeholder="审核模式"
            style="width: 100%"
            @change="handleReviewModeChange"
          >
            <a-select-option value="plan">计划审核</a-select-option>
            <a-select-option value="summary">总结查看</a-select-option>
            <a-select-option value="compare">计划对比</a-select-option>
          </a-select>
        </a-col>
        <a-col :span="6">
          <a-input-search
            v-model:value="filters.keyword"
            placeholder="搜索内容"
            @search="handleFilterChange"
          />
        </a-col>
      </a-row>
    </a-card>

    <!-- 计划审核模式 -->
    <div v-if="reviewMode === 'plan'">
      <a-card title="计划审核">
        <template #extra>
          <a-space>
            <a-button @click="batchApprovePlans" :disabled="selectedRows.length === 0">
              批量审批计划
            </a-button>
            <a-button type="primary" @click="exportPlanResults">
              导出计划
            </a-button>
          </a-space>
        </template>

        <a-table
          :dataSource="filteredReports"
          :columns="planColumns"
          :loading="loading"
          :pagination="pagination"
          :row-selection="{ selectedRowKeys: selectedRows, onChange: handleSelectionChange }"
          @change="handleTableChange"
          row-key="id"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'employee'">
              <a-space>
                <a-avatar size="small">{{ record.employeeName.charAt(0) }}</a-avatar>
                <span>{{ record.employeeName }}</span>
              </a-space>
            </template>

            <template v-else-if="column.key === 'weekRange'">
              <a-tag color="blue">{{ record.weekRange }}</a-tag>
            </template>

            <template v-else-if="column.key === 'planStatus'">
              <a-tag :color="getPlanStatusColor(record.planStatus)">
                {{ getPlanStatusText(record.planStatus) }}
              </a-tag>
            </template>

            <template v-else-if="column.key === 'planWork'">
              <div class="plan-preview">
                {{ record.plannedWork?.substring(0, 50) }}
                <span v-if="record.plannedWork?.length > 50">...</span>
              </div>
            </template>

            <template v-else-if="column.key === 'actions'">
              <a-space>
                <a-button 
                  type="primary" 
                  size="small" 
                  @click="reviewPlan(record)"
                  v-if="record.planStatus === 'pending'"
                >
                  审核计划
                </a-button>
                <a-button 
                  type="text" 
                  size="small" 
                  @click="viewPlanDetail(record)"
                >
                  查看详情
                </a-button>
              </a-space>
            </template>
          </template>
        </a-table>
      </a-card>
    </div>

    <!-- 总结查看模式 -->
    <div v-else-if="reviewMode === 'summary'">
      <a-card title="总结查看与评论">
        <template #extra>
          <a-space>
            <a-button @click="batchComment" :disabled="selectedRows.length === 0">
              批量评论
            </a-button>
            <a-button type="primary" @click="exportSummaryResults">
              导出总结
            </a-button>
          </a-space>
        </template>

        <a-table
          :dataSource="filteredReports"
          :columns="summaryColumns"
          :loading="loading"
          :pagination="pagination"
          :row-selection="{ selectedRowKeys: selectedRows, onChange: handleSelectionChange }"
          @change="handleTableChange"
          row-key="id"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'employee'">
              <a-space>
                <a-avatar size="small">{{ record.employeeName.charAt(0) }}</a-avatar>
                <span>{{ record.employeeName }}</span>
              </a-space>
            </template>

            <template v-else-if="column.key === 'weekRange'">
              <a-tag color="blue">{{ record.weekRange }}</a-tag>
            </template>

            <template v-else-if="column.key === 'completedWork'">
              <div class="completed-preview">
                {{ record.completedWork?.substring(0, 60) }}
                <span v-if="record.completedWork?.length > 60">...</span>
              </div>
            </template>

            <template v-else-if="column.key === 'comment'">
              <a-textarea
                v-model:value="record.managerComment"
                :rows="2"
                placeholder="请输入评论"
                size="small"
                @change="markAsChanged(record.id)"
              />
            </template>

            <template v-else-if="column.key === 'status'">
              <a-tag :color="getStatusColor(record.approvalStatus)">
                {{ getStatusText(record.approvalStatus) }}
              </a-tag>
            </template>

            <template v-else-if="column.key === 'actions'">
              <a-space>
                <a-button 
                  type="primary" 
                  size="small" 
                  @click="provideFeedback(record)"
                  v-if="record.approvalStatus === 'pending'"
                >
                  详细反馈
                </a-button>
                <a-button 
                  type="text" 
                  size="small" 
                  @click="saveComment(record)"
                  :loading="record.saving"
                  v-if="changedRows.has(record.id)"
                >
                  保存
                </a-button>
                <a-button 
                  type="text" 
                  size="small" 
                  @click="viewSummaryDetail(record)"
                >
                  查看详情
                </a-button>
              </a-space>
            </template>
          </template>
        </a-table>
      </a-card>
    </div>

    <!-- 计划对比模式 -->
    <div v-else>
      <a-card title="计划与实际对比">
        <a-table
          :dataSource="filteredReports"
          :columns="compareColumns"
          :loading="loading"
          :pagination="pagination"
          @change="handleTableChange"
          row-key="id"
          :scroll="{ x: 1500 }"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'employee'">
              <a-space>
                <a-avatar size="small">{{ record.employeeName.charAt(0) }}</a-avatar>
                <span>{{ record.employeeName }}</span>
              </a-space>
            </template>

            <template v-else-if="column.key === 'weekRange'">
              <a-tag color="blue">{{ record.weekRange }}</a-tag>
            </template>

            <template v-else-if="column.key === 'planContent'">
              <div class="plan-content">
                <div><strong>计划工作:</strong></div>
                <div>{{ record.plannedWork }}</div>
                <div style="margin-top: 8px;"><strong>下周计划:</strong></div>
                <div>{{ record.nextWeekPlan }}</div>
              </div>
            </template>

            <template v-else-if="column.key === 'actualContent'">
              <div class="actual-content">
                <div><strong>实际完成:</strong></div>
                <div>{{ record.completedWork }}</div>
                <div style="margin-top: 8px;"><strong>遇到问题:</strong></div>
                <div>{{ record.issues || '无' }}</div>
              </div>
            </template>

            <template v-else-if="column.key === 'comparison'">
              <div class="comparison-analysis">
                <div class="completion-rate">
                  <a-progress :percent="record.completionRate || 0" size="small" />
                </div>
                <div class="hours-info" style="margin-top: 8px; font-size: 12px;">
                  工作时长: {{ record.workHours || 0 }}小时
                </div>
              </div>
            </template>
          </template>
        </a-table>
      </a-card>
    </div>

    <!-- 审核详情弹窗 -->
    <a-modal
      v-model:open="showReviewModal"
      :title="`${currentReport?.employeeName} - ${currentReport?.weekRange}周报审核`"
      width="1000px"
      @ok="handleSubmitReview"
      @cancel="showReviewModal = false"
      :ok-text="reviewForm.action === 'reject' ? '确认驳回' : '确认审批'"
    >
      <div class="review-content">
        <!-- 审核决策 -->
        <a-card title="审核决策" size="small" style="margin-bottom: 16px">
          <a-radio-group v-model:value="reviewForm.action">
            <a-radio value="approve">通过</a-radio>
            <a-radio value="modify">修改后通过</a-radio>
            <a-radio value="reject">驳回</a-radio>
          </a-radio-group>
        </a-card>

        <!-- 周报内容 -->
        <a-row :gutter="16">
          <a-col :span="24">
            <a-card title="周报内容" size="small">
              <a-descriptions :column="1" size="small">
                <a-descriptions-item label="周期范围">{{ currentReport?.weekRange }}</a-descriptions-item>
                <a-descriptions-item label="提交时间">{{ currentReport?.submitTime }}</a-descriptions-item>
              </a-descriptions>
              
              <a-divider />
              
              <div class="report-section">
                <h4>本周概述</h4>
                <p>{{ currentReport?.summary }}</p>
              </div>

              <div class="report-section">
                <h4>主要成果</h4>
                <div v-for="(achievement, index) in currentReport?.achievements" :key="index" class="achievement-item">
                  <a-tag color="green" style="margin-bottom: 8px">成果{{ index + 1 }}</a-tag>
                  <p>{{ achievement.content }}</p>
                  <div class="feedback-section">
                    <a-textarea
                      v-model:value="achievement.managerFeedback"
                      :rows="2"
                      :placeholder="`对成果${index + 1}的反馈`"
                      size="small"
                      style="margin-bottom: 8px"
                    />
                    <a-rate v-model:value="achievement.managerRating" :count="5" />
                  </div>
                </div>
              </div>

              <div class="report-section">
                <h4>遇到的问题</h4>
                <div v-for="(issue, index) in currentReport?.issues" :key="index" class="issue-item">
                  <a-tag color="orange" style="margin-bottom: 8px">问题{{ index + 1 }}</a-tag>
                  <p>{{ issue.content }}</p>
                  <div class="feedback-section">
                    <a-textarea
                      v-model:value="issue.managerGuidance"
                      :rows="2"
                      :placeholder="`对问题${index + 1}的指导建议`"
                      size="small"
                    />
                  </div>
                </div>
              </div>

              <div class="report-section">
                <h4>下周计划</h4>
                <div v-for="(plan, index) in currentReport?.nextWeekPlans" :key="index" class="plan-item">
                  <a-tag color="blue" style="margin-bottom: 8px">计划{{ index + 1 }}</a-tag>
                  <p>{{ plan.content }}</p>
                  <div class="feedback-section">
                    <a-textarea
                      v-model:value="plan.managerSuggestion"
                      :rows="2"
                      :placeholder="`对计划${index + 1}的建议`"
                      size="small"
                    />
                  </div>
                </div>
              </div>
            </a-card>
          </a-col>
        </a-row>

        <!-- 总体评价 -->
        <a-card title="总体评价" size="small" style="margin-top: 16px">
          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item label="总体评分">
                <a-rate v-model:value="reviewForm.overallRating" :count="5" />
                <span style="margin-left: 8px">{{ reviewForm.overallRating }}/5</span>
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="工作饱和度">
                <a-slider 
                  v-model:value="reviewForm.workloadRating" 
                  :min="0" 
                  :max="100" 
                  :marks="{ 0: '很轻松', 50: '适中', 100: '很饱和' }"
                />
              </a-form-item>
            </a-col>
          </a-row>
          
          <a-textarea
            v-model:value="reviewForm.overallFeedback"
            :rows="4"
            placeholder="请输入对本周工作的总体评价、认可和改进建议"
          />
        </a-card>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'

// 页面状态
const loading = ref(false)
const showReviewModal = ref(false)
const selectedRows = ref<number[]>([])
const currentReport = ref<any>(null)
const reviewMode = ref<string>('plan')

// 筛选条件
const filters = reactive({
  weekRange: null,
  status: '',
  employee: '',
  keyword: ''
})

// 审核表单
const reviewForm = reactive({
  action: 'approve',
  overallRating: 4,
  workloadRating: 50,
  overallFeedback: ''
})

// 员工列表
const employees = ref([
  { id: 1, name: '张三' },
  { id: 2, name: '李四' },
  { id: 3, name: '王五' },
  { id: 4, name: '赵六' }
])

// 待审核数据
const reports = ref([
  {
    id: 1,
    employeeId: 1,
    employeeName: '张三',
    weekRange: '2024年第3周(1/15-1/21)',
    submitTime: '2024-01-21 18:30:00',
    approvalStatus: 'pending',
    planStatus: 'approved',
    plannedWork: '1. 完成用户界面优化\n2. 修复重要bug\n3. 参与需求评审',
    completedWork: '1. 已完成登录页面UI重构\n2. 修复了5个关键问题\n3. 参与了新功能需求评审',
    nextWeekPlan: '1. 优化商品详情页面性能\n2. 参与新版本需求评审',
    issues: '第三方API接口不稳定，影响开发进度',
    workHours: 42,
    completionRate: 90,
    managerComment: '',
    summary: '本周主要完成了用户界面优化工作，修复了5个重要bug，参与了新功能的需求评审。整体工作进展顺利，用户反馈较好。',
    achievements: [
      {
        content: '完成登录页面UI重构，提升用户体验',
        managerFeedback: '',
        managerRating: 4
      },
      {
        content: '修复用户反馈的5个关键问题',
        managerFeedback: '',
        managerRating: 5
      }
    ],
    nextWeekPlans: [
      {
        content: '继续优化商品详情页面性能',
        managerSuggestion: ''
      },
      {
        content: '参与新版本需求评审会议',
        managerSuggestion: ''
      }
    ]
  },
  {
    id: 2,
    employeeId: 2,
    employeeName: '李四',
    weekRange: '2024年第3周(1/15-1/21)',
    submitTime: '2024-01-21 17:45:00',
    approvalStatus: 'approved',
    planStatus: 'approved',
    plannedWork: '1. 后端服务优化\n2. 数据库性能提升\n3. 缓存机制开发',
    completedWork: '1. 数据库查询效率提升40%\n2. 新增Redis缓存机制\n3. 完成API接口优化',
    nextWeekPlan: '1. 完善监控系统\n2. 增加报警机制',
    issues: '',
    workHours: 40,
    completionRate: 95,
    managerComment: '优秀的性能优化工作，继续保持',
    summary: '本周专注于后端服务优化，完成了数据库查询性能提升，新增了缓存机制。',
    achievements: [
      {
        content: '数据库查询效率提升40%',
        managerFeedback: '优秀的性能优化工作',
        managerRating: 5
      }
    ],
    nextWeekPlans: [
      {
        content: '完善监控系统',
        managerSuggestion: '建议重点关注报警机制'
      }
    ]
  },
  {
    id: 3,
    employeeId: 3,
    employeeName: '王五',
    weekRange: '2024年第4周(1/22-1/28)',
    submitTime: '2024-01-28 19:00:00',
    approvalStatus: 'pending',
    planStatus: 'pending',
    plannedWork: '1. 前端组件开发\n2. 单元测试编写\n3. 文档更新',
    completedWork: '1. 完成3个前端组件\n2. 编写了部分单元测试\n3. 文档更新进度50%',
    nextWeekPlan: '1. 继续完善测试覆盖率\n2. 完成文档编写',
    issues: '测试环境不稳定，影响测试进度',
    workHours: 38,
    completionRate: 75,
    managerComment: '',
    summary: '本周主要进行前端组件开发，测试覆盖率有待提升，文档编写需要加快进度。',
    achievements: [
      {
        content: '完成3个前端组件开发',
        managerFeedback: '',
        managerRating: 4
      }
    ],
    nextWeekPlans: [
      {
        content: '提升测试覆盖率到80%',
        managerSuggestion: ''
      }
    ]
  }
])

// 表格列定义
const reportColumns = [
  {
    title: '员工',
    key: 'employee',
    width: 120
  },
  {
    title: '周期',
    key: 'weekRange',
    width: 150
  },
  {
    title: '概述',
    key: 'summary',
    width: 200
  },
  {
    title: '提交时间',
    dataIndex: 'submitTime',
    width: 150
  },
  {
    title: '状态',
    key: 'status',
    width: 100
  },
  {
    title: '操作',
    key: 'actions',
    width: 150
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
const filteredReports = computed(() => {
  let result = reports.value

  if (filters.status) {
    result = result.filter(report => report.approvalStatus === filters.status)
  }
  
  if (filters.employee) {
    result = result.filter(report => report.employeeId === Number(filters.employee))
  }
  
  if (filters.keyword) {
    result = result.filter(report => 
      report.summary.includes(filters.keyword) ||
      report.achievements.some((ach: any) => ach.content.includes(filters.keyword))
    )
  }

  return result
})

// 获取状态颜色
const getStatusColor = (status: string) => {
  const colorMap: Record<string, string> = {
    'pending': '#faad14',
    'approved': '#52c41a',
    'rejected': '#f5222d'
  }
  return colorMap[status] || '#d9d9d9'
}

// 获取状态文本
const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    'pending': '待审批',
    'approved': '已审批',
    'rejected': '已驳回'
  }
  return textMap[status] || '未知'
}

// 审核详情
const reviewDetail = (record: any) => {
  currentReport.value = { ...record }
  reviewForm.action = 'approve'
  reviewForm.overallRating = 4
  reviewForm.workloadRating = 50
  reviewForm.overallFeedback = ''
  
  showReviewModal.value = true
}

// 查看详情
const viewDetail = (record: any) => {
  currentReport.value = { ...record }
  reviewForm.action = 'view'
  showReviewModal.value = true
}

// 提交审核
const handleSubmitReview = async () => {
  if (!reviewForm.overallFeedback.trim()) {
    message.error('请填写总体评价')
    return
  }

  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 更新审批状态
    const reportIndex = reports.value.findIndex(r => r.id === currentReport.value.id)
    if (reportIndex > -1) {
      reports.value[reportIndex].approvalStatus = reviewForm.action === 'reject' ? 'rejected' : 'approved'
    }
    
    showReviewModal.value = false
    message.success('审核完成')
  } catch (error) {
    message.error('审核失败')
  }
}

// 批量审批
const batchApprove = () => {
  message.info('批量审批功能开发中...')
}

// 导出结果
const exportResults = () => {
  message.info('导出功能开发中...')
}

// 导出单个
const exportSingle = (record: any) => {
  message.info(`导出${record.employeeName}的周报`)
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

// 页面初始化
onMounted(() => {
  pagination.total = reports.value.length
})

// 审核模式变化处理
const handleReviewModeChange = () => {
  console.log('Review mode changed:', reviewMode.value)
}

// 批量审批计划
const batchApprovePlans = () => {
  message.info('批量审批计划功能开发中...')
}

// 导出计划结果
const exportPlanResults = () => {
  message.info('导出计划结果功能开发中...')
}

// 批量评论
const batchComment = () => {
  message.info('批量评论功能开发中...')
}

// 导出总结结果
const exportSummaryResults = () => {
  message.info('导出总结结果功能开发中...')
}

// 审核计划
const reviewPlan = (record: any) => {
  currentReport.value = { ...record }
  reviewForm.action = 'approve'
  reviewForm.overallRating = 4
  reviewForm.workloadRating = 50
  reviewForm.overallFeedback = ''
  
  showReviewModal.value = true
}

// 查看计划详情
const viewPlanDetail = (record: any) => {
  currentReport.value = { ...record }
  reviewForm.action = 'view'
  showReviewModal.value = true
}

// 提供反馈
const provideFeedback = (record: any) => {
  currentReport.value = { ...record }
  reviewForm.action = 'approve'
  reviewForm.overallRating = 4
  reviewForm.workloadRating = 50
  reviewForm.overallFeedback = ''
  
  showReviewModal.value = true
}

// 保存评论
const saveComment = (record: any) => {
  message.info('保存评论功能开发中...')
}

// 查看总结详情
const viewSummaryDetail = (record: any) => {
  currentReport.value = { ...record }
  reviewForm.action = 'view'
  showReviewModal.value = true
}

// 标记为已更改
const markAsChanged = (id: number) => {
  console.log('Marking as changed:', id)
}

// 新增：获取计划状态颜色
const getPlanStatusColor = (status: string) => {
  const colorMap: Record<string, string> = {
    'pending': '#faad14',
    'approved': '#52c41a',
    'rejected': '#ff4d4f'
  }
  return colorMap[status] || '#d9d9d9'
}

// 新增：获取计划状态文本
const getPlanStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    'pending': '待审核',
    'approved': '已通过',
    'rejected': '已驳回'
  }
  return textMap[status] || '未知'
}

// 新增：跟踪修改的行
const changedRows = ref(new Set<number>())
</script>

<style scoped>
.weekly-review {
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

.summary-preview {
  line-height: 1.4;
}

.review-content {
  max-height: 600px;
  overflow-y: auto;
}

.report-section {
  margin-bottom: 24px;
}

.report-section h4 {
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
  color: #1890ff;
}

.achievement-item,
.issue-item,
.plan-item {
  margin-bottom: 16px;
  padding: 12px;
  background: #fafafa;
  border-radius: 6px;
}

.achievement-item p,
.issue-item p,
.plan-item p {
  margin: 8px 0;
  line-height: 1.5;
}

.feedback-section {
  margin-top: 8px;
}

:deep(.ant-table-tbody > tr > td) {
  padding: 8px !important;
}

.plan-preview {
  line-height: 1.4;
}

.completed-preview {
  line-height: 1.4;
}

.plan-content {
  line-height: 1.4;
}

.actual-content {
  line-height: 1.4;
}

.comparison-analysis {
  display: flex;
  align-items: center;
}

.completion-rate {
  margin-right: 16px;
}

.hours-info {
  margin-left: 16px;
}
</style> 