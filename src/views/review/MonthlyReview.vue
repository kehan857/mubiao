<template>
  <div class="monthly-review">
    <!-- 页面标题 -->
    <div class="page-header">
      <div class="header-content">
        <div class="title-area">
          <h2>月度复盘与评分</h2>
          <p>审核下属月度计划执行情况，进行评分和反馈</p>
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
          <a-select
            v-model:value="filters.month"
            placeholder="选择月份"
            style="width: 100%"
            @change="handleFilterChange"
          >
            <a-select-option value="">全部月份</a-select-option>
            <a-select-option value="2024-01">2024年1月</a-select-option>
            <a-select-option value="2024-02">2024年2月</a-select-option>
            <a-select-option value="2024-03">2024年3月</a-select-option>
          </a-select>
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
            <a-select-option value="summary">总结评分</a-select-option>
            <a-select-option value="compare">计划对比</a-select-option>
          </a-select>
        </a-col>
        <a-col :span="6">
          <a-input-search
            v-model:value="filters.keyword"
            placeholder="搜索项目内容"
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
          :dataSource="filteredReviews"
          :columns="planReviewColumns"
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

            <template v-else-if="column.key === 'planStatus'">
              <a-tag :color="getPlanStatusColor(record.planStatus)">
                {{ getPlanStatusText(record.planStatus) }}
              </a-tag>
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

    <!-- 总结评分模式 -->
    <div v-else-if="reviewMode === 'summary'">
      <a-card title="总结评分">
        <template #extra>
          <a-space>
            <a-button @click="batchReviewSummaries" :disabled="selectedRows.length === 0">
              批量评分
            </a-button>
            <a-button type="primary" @click="exportSummaryResults">
              导出评分
            </a-button>
          </a-space>
        </template>

        <a-table
          :dataSource="filteredReviews"
          :columns="summaryReviewColumns"
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

            <template v-else-if="column.key === 'selfScore'">
              <a-tag color="blue">{{ record.selfScore || '--' }}分</a-tag>
            </template>

            <template v-else-if="column.key === 'managerScore'">
              <a-input-number
                v-model:value="record.managerScore"
                :min="0"
                :max="100"
                size="small"
                style="width: 80px"
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
                  @click="reviewSummary(record)"
                  v-if="record.approvalStatus === 'pending'"
                >
                  详细评分
                </a-button>
                <a-button 
                  type="text" 
                  size="small" 
                  @click="saveSingleScore(record)"
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
                  查看总结
                </a-button>
              </a-space>
            </template>
          </template>
        </a-table>
      </a-card>
    </div>

    <!-- 计划对比模式 -->
    <div v-else>
      <a-card title="计划与总结对比">
        <a-table
          :dataSource="filteredReviews"
          :columns="compareReviewColumns"
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

            <template v-else-if="column.key === 'planContent'">
              <div class="plan-summary">
                <div><strong>目标数量:</strong> {{ record.planCount }}个</div>
                <div><strong>重点项目:</strong> {{ record.keyProjects }}</div>
              </div>
            </template>

            <template v-else-if="column.key === 'summaryContent'">
              <div class="summary-overview">
                <div><strong>完成情况:</strong> {{ record.completionSummary }}</div>
                <div><strong>自评分:</strong> {{ record.selfScore || '--' }}分</div>
                <div><strong>上级评分:</strong> {{ record.managerScore || '--' }}分</div>
              </div>
            </template>

            <template v-else-if="column.key === 'comparison'">
              <div class="comparison-result">
                <a-progress :percent="record.completionRate" size="small" />
                <div style="margin-top: 4px; font-size: 12px;">
                  目标达成率: {{ record.completionRate }}%
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
      :title="`${currentReview?.employeeName} - ${currentReview?.month}月度总结审核`"
      width="1200px"
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

        <!-- 计划与总结对比 -->
        <a-row :gutter="16">
          <a-col :span="24">
            <a-table
              :dataSource="currentReview?.details || []"
              :columns="detailColumns"
              :pagination="false"
              size="small"
              :scroll="{ x: 1500 }"
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'score'">
                  <a-input-number
                    v-model:value="record.managerScore"
                    :min="0"
                    :max="100"
                    size="small"
                    style="width: 80px"
                  />
                </template>
                <template v-else-if="column.key === 'feedback'">
                  <a-textarea
                    v-model:value="record.managerFeedback"
                    :rows="2"
                    placeholder="请输入评语"
                    size="small"
                  />
                </template>
              </template>
            </a-table>
          </a-col>
        </a-row>

        <!-- 总体评语 -->
        <a-card title="总体评语" size="small" style="margin-top: 16px">
          <a-textarea
            v-model:value="reviewForm.overallFeedback"
            :rows="4"
            placeholder="请输入对该员工本月度工作的总体评价和建议"
          />
        </a-card>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, h } from 'vue'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'

// 页面状态
const loading = ref(false)
const showReviewModal = ref(false)
const selectedRows = ref<number[]>([])
const currentReview = ref<any>(null)
const reviewMode = ref('plan')

// 筛选条件
const filters = reactive({
  month: '',
  status: '',
  employee: '',
  keyword: ''
})

// 审核表单
const reviewForm = reactive({
  action: 'approve',
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
const reviews = ref([
  {
    id: 1,
    employeeId: 1,
    employeeName: '张三',
    month: '2024-01',
    submitTime: '2024-01-31 18:00:00',
    approvalStatus: 'pending',
    planStatus: 'approved',
    completionRate: 85,
    totalItems: 5,
    completedItems: 4,
    selfScore: 85,
    managerScore: null,
    planCount: 5,
    keyProjects: '用户体验优化、性能优化',
    completionSummary: '大部分目标已完成，个别需要继续跟进',
    details: [
      {
        id: 1,
        project: '用户体验优化',
        target: '用户满意度提升10%',
        criteria: '用户满意度调研达到90%以上',
        measures: '进行用户调研，优化界面设计',
        result: '已完成主要页面优化，用户满意度提升12%',
        reason: '',
        selfScore: 90,
        managerScore: null,
        managerFeedback: ''
      },
      {
        id: 2,
        project: '性能优化',
        target: '响应时间减少30%',
        criteria: '平均响应时间小于2秒',
        measures: '代码优化，缓存策略调整',
        result: '响应时间减少25%，部分模块仍需优化',
        reason: '第三方API响应慢影响整体性能',
        selfScore: 75,
        managerScore: null,
        managerFeedback: ''
      }
    ]
  },
  {
    id: 2,
    employeeId: 2,
    employeeName: '李四',
    month: '2024-01',
    submitTime: '2024-01-30 17:30:00',
    approvalStatus: 'approved',
    planStatus: 'approved',
    completionRate: 95,
    totalItems: 4,
    completedItems: 4,
    selfScore: 92,
    managerScore: 88,
    planCount: 4,
    keyProjects: '新功能开发、代码重构',
    completionSummary: '所有目标按时完成，质量达标',
    details: []
  },
  {
    id: 3,
    employeeId: 3,
    employeeName: '王五',
    month: '2024-02',
    submitTime: '2024-02-28 16:45:00',
    approvalStatus: 'pending',
    planStatus: 'pending',
    completionRate: 78,
    totalItems: 6,
    completedItems: 5,
    selfScore: 80,
    managerScore: null,
    planCount: 6,
    keyProjects: '系统升级、文档编写',
    completionSummary: '主要功能完成，文档编写进度略慢',
    details: []
  }
])

// 表格列定义
const reviewColumns = [
  {
    title: '员工',
    key: 'employee',
    width: 120
  },
  {
    title: '月份',
    dataIndex: 'month',
    width: 100
  },
  {
    title: '提交时间',
    dataIndex: 'submitTime',
    width: 150
  },
  {
    title: '完成度',
    key: 'progress',
    width: 150
  },
  {
    title: '审批状态',
    key: 'status',
    width: 100
  },
  {
    title: '操作',
    key: 'actions',
    width: 150
  }
]

// 详情表格列定义
const detailColumns = [
  {
    title: '项目',
    dataIndex: 'project',
    width: 120,
    fixed: 'left'
  },
  {
    title: '目标',
    dataIndex: 'target',
    width: 150
  },
  {
    title: '考核标准',
    dataIndex: 'criteria',
    width: 150
  },
  {
    title: '实施措施',
    dataIndex: 'measures',
    width: 200
  },
  {
    title: '完成结果',
    dataIndex: 'result',
    width: 200
  },
  {
    title: '未完成原因',
    dataIndex: 'reason',
    width: 150
  },
  {
    title: '自评分',
    dataIndex: 'selfScore',
    width: 80
  },
  {
    title: '上级评分',
    key: 'score',
    width: 100
  },
  {
    title: '上级评语',
    key: 'feedback',
    width: 200
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
const filteredReviews = computed(() => {
  let result = reviews.value

  if (filters.month) {
    result = result.filter(review => review.month === filters.month)
  }
  
  if (filters.status) {
    result = result.filter(review => review.approvalStatus === filters.status)
  }
  
  if (filters.employee) {
    result = result.filter(review => review.employeeId === Number(filters.employee))
  }
  
  if (filters.keyword) {
    result = result.filter(review => 
      review.employeeName.includes(filters.keyword) ||
      review.details?.some((detail: any) => 
        detail.project.includes(filters.keyword) ||
        detail.result.includes(filters.keyword)
      )
    )
  }

  return result
})

// 展开行渲染
const expandedRowRender = (record: any) => {
  const columns = [
    { title: '项目', dataIndex: 'project', width: 150 },
    { title: '完成结果', dataIndex: 'result', width: 200 },
    { title: '自评分', dataIndex: 'selfScore', width: 80 },
    { title: '状态', dataIndex: 'status', width: 100 }
  ]
  
  return h('a-table', {
    columns,
    dataSource: record.details || [],
    pagination: false,
    size: 'small'
  })
}

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
  currentReview.value = { ...record }
  reviewForm.action = 'approve'
  reviewForm.overallFeedback = ''
  
  // 初始化评分数据
  currentReview.value.details.forEach((detail: any) => {
    if (!detail.managerScore) detail.managerScore = detail.selfScore
    if (!detail.managerFeedback) detail.managerFeedback = ''
  })
  
  showReviewModal.value = true
}

// 查看详情
const viewDetail = (record: any) => {
  currentReview.value = { ...record }
  reviewForm.action = 'view'
  showReviewModal.value = true
}

// 提交审核
const handleSubmitReview = async () => {
  if (!reviewForm.overallFeedback.trim()) {
    message.error('请填写总体评语')
    return
  }

  // 检查是否所有项目都已评分
  const hasUnscored = currentReview.value.details.some((detail: any) => 
    detail.managerScore === null || detail.managerScore === undefined
  )
  
  if (hasUnscored && reviewForm.action === 'approve') {
    message.error('请为所有项目进行评分')
    return
  }

  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 更新审批状态
    const reviewIndex = reviews.value.findIndex(r => r.id === currentReview.value.id)
    if (reviewIndex > -1) {
      reviews.value[reviewIndex].approvalStatus = reviewForm.action === 'reject' ? 'rejected' : 'approved'
      reviews.value[reviewIndex].details = currentReview.value.details
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
  message.info(`导出${record.employeeName}的月度总结`)
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
  pagination.total = reviews.value.length
})

// 审核模式变化处理
const handleReviewModeChange = () => {
  console.log('Review mode changed:', reviewMode.value)
}

// 审核计划
const reviewPlan = (record: any) => {
  console.log('Review plan:', record)
}

// 查看计划详情
const viewPlanDetail = (record: any) => {
  console.log('View plan detail:', record)
}

// 审核总结
const reviewSummary = (record: any) => {
  console.log('Review summary:', record)
}

// 查看总结详情
const viewSummaryDetail = (record: any) => {
  console.log('View summary detail:', record)
}

// 保存单个评分
const saveSingleScore = (record: any) => {
  console.log('Save single score:', record)
}

// 标记为已更改
const markAsChanged = (id: number) => {
  console.log('Mark as changed:', id)
}

// 计划审核列定义
const planReviewColumns = [
  {
    title: '员工',
    key: 'employee',
    width: 120
  },
  {
    title: '月份',
    dataIndex: 'month',
    width: 100
  },
  {
    title: '计划数量',
    dataIndex: 'planCount',
    width: 100
  },
  {
    title: '重点项目',
    dataIndex: 'keyProjects',
    width: 200
  },
  {
    title: '提交时间',
    dataIndex: 'submitTime',
    width: 150
  },
  {
    title: '计划状态',
    key: 'planStatus',
    width: 100
  },
  {
    title: '操作',
    key: 'actions',
    width: 150
  }
]

// 总结评分列定义
const summaryReviewColumns = [
  {
    title: '员工',
    key: 'employee',
    width: 120
  },
  {
    title: '月份',
    dataIndex: 'month',
    width: 100
  },
  {
    title: '完成度',
    dataIndex: 'completionRate',
    width: 100,
    customRender: ({ text }: any) => `${text}%`
  },
  {
    title: '自评分',
    key: 'selfScore',
    width: 100
  },
  {
    title: '上级评分',
    key: 'managerScore',
    width: 120
  },
  {
    title: '审批状态',
    key: 'status',
    width: 100
  },
  {
    title: '操作',
    key: 'actions',
    width: 200
  }
]

// 对比审核列定义
const compareReviewColumns = [
  {
    title: '员工',
    key: 'employee',
    width: 120,
    fixed: 'left'
  },
  {
    title: '月份',
    dataIndex: 'month',
    width: 100
  },
  {
    title: '计划概况',
    key: 'planContent',
    width: 250
  },
  {
    title: '总结概况',
    key: 'summaryContent',
    width: 300
  },
  {
    title: '对比结果',
    key: 'comparison',
    width: 150
  }
]

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

// 新增：批量审批计划
const batchApprovePlans = () => {
  message.info('批量审批计划功能开发中...')
}

// 新增：导出计划结果
const exportPlanResults = () => {
  message.info('导出计划结果功能开发中...')
}

// 新增：批量评分总结
const batchReviewSummaries = () => {
  message.info('批量评分功能开发中...')
}

// 新增：导出评分结果
const exportSummaryResults = () => {
  message.info('导出评分结果功能开发中...')
}

// 新增：跟踪修改的行
const changedRows = ref(new Set<number>())
</script>

<style scoped>
.monthly-review {
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

.review-content {
  max-height: 600px;
  overflow-y: auto;
}

:deep(.ant-table-tbody > tr > td) {
  padding: 8px !important;
}
</style> 