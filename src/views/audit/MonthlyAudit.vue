<template>
  <div class="monthly-audit">
    <!-- 页面标题 -->
    <div class="page-header">
      <div class="header-content">
        <div class="title-area">
          <h2>月度审核</h2>
          <p>审核团队成员的月度计划和总结</p>
        </div>
      </div>
    </div>

    <!-- 审核类型切换 -->
    <a-card style="margin-bottom: 16px">
      <a-radio-group v-model:value="auditType" button-style="solid" @change="handleAuditTypeChange">
        <a-radio-button value="plan">计划审核</a-radio-button>
        <a-radio-button value="summary">总结审核</a-radio-button>
      </a-radio-group>
    </a-card>

    <!-- 筛选条件 -->
    <a-card style="margin-bottom: 16px">
      <a-form layout="inline" :model="filters">
        <a-form-item label="部门">
          <a-select v-model:value="filters.department" placeholder="选择部门" style="width: 120px" allowClear>
            <a-select-option value="技术部">技术部</a-select-option>
            <a-select-option value="产品部">产品部</a-select-option>
            <a-select-option value="市场部">市场部</a-select-option>
            <a-select-option value="人事部">人事部</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="状态">
          <a-select v-model:value="filters.status" placeholder="选择状态" style="width: 120px" allowClear>
            <a-select-option value="reviewing">待审核</a-select-option>
            <a-select-option value="approved">已通过</a-select-option>
            <a-select-option value="rejected">已驳回</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="时间">
          <a-month-picker v-model:value="filters.month" placeholder="选择月份" />
        </a-form-item>
        <a-form-item>
          <a-button type="primary" @click="handleSearch">搜索</a-button>
          <a-button style="margin-left: 8px" @click="resetFilters">重置</a-button>
        </a-form-item>
      </a-form>
    </a-card>

    <!-- 审核列表 -->
    <a-card :title="auditType === 'plan' ? '计划审核列表' : '总结审核列表'">
      <template #extra>
        <a-space>
          <a-button @click="batchApprove" :disabled="selectedRowKeys.length === 0" type="primary">
            <CheckOutlined />
            批量通过
          </a-button>
          <a-button @click="batchReject" :disabled="selectedRowKeys.length === 0" danger>
            <CloseOutlined />
            批量驳回
          </a-button>
          <a-button @click="refreshData">
            <ReloadOutlined />
            刷新
          </a-button>
        </a-space>
      </template>
      <a-table
        :dataSource="currentAuditData"
        :columns="auditColumns"
        :pagination="pagination"
        :row-selection="rowSelection"
        row-key="id"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'nameAndDept'">
            <div>
              <div style="font-weight: 500;">{{ getDisplayName(record) }}</div>
              <div style="color: #666; font-size: 12px;">{{ getDisplayDepartment(record) }}</div>
            </div>
          </template>
          <template v-else-if="column.key === 'selfScore'">
            <a-tag color="blue" v-if="record.selfScore">{{ record.selfScore }}分</a-tag>
            <span v-else style="color: #999;">未评分</span>
          </template>
          <template v-else-if="column.key === 'status'">
            <a-tag :color="getStatusColor(record.status)">
              {{ getStatusText(record.status) }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'actions'">
            <a-space>
              <a-button size="small" @click="viewDetail(record)">
                <EyeOutlined />
                查看详情
              </a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 审核弹窗 -->
    <a-modal
      v-model:open="showAuditModal"
      :title="`审核月度${auditType === 'plan' ? '计划' : '总结'}`"
      @ok="handleAuditSubmit"
      @cancel="resetAuditForm"
      width="800px"
    >
      <a-form :model="auditForm" layout="vertical">
        <a-form-item label="审核结果" required>
          <a-radio-group v-model:value="auditForm.result">
            <a-radio value="approved">通过</a-radio>
            <a-radio value="rejected">驳回</a-radio>
            <a-radio value="modified">修改后通过</a-radio>
          </a-radio-group>
        </a-form-item>
        
        <a-form-item v-if="auditType === 'summary'" label="员工自评分">
          <a-tag color="blue" v-if="currentRecord?.selfScore">{{ currentRecord.selfScore }}分</a-tag>
          <span v-else style="color: #999;">员工未进行自评</span>
        </a-form-item>
        
        <a-form-item label="评分" required>
          <a-input-number 
            v-model:value="auditForm.score" 
            :min="0" 
            :max="100" 
            style="width: 150px"
            placeholder="请输入分数"
          />
          <span style="margin-left: 12px">分（满分100分）</span>
        </a-form-item>
        
        <a-form-item label="审核意见">
          <a-textarea 
            v-model:value="auditForm.comments" 
            placeholder="请填写审核意见..." 
            :rows="4"
          />
        </a-form-item>
        
        <a-form-item label="改进建议">
          <a-textarea 
            v-model:value="auditForm.suggestions" 
            placeholder="请填写改进建议..." 
            :rows="3"
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 详情查看弹窗 -->
    <a-modal
      v-model:open="showDetailModal"
      :title="`月度${auditType === 'plan' ? '计划' : '总结'}详情`"
      footer="null"
      width="1000px"
    >
      <div v-if="currentRecord">
        <a-descriptions :column="2" bordered>
          <a-descriptions-item label="提交人">{{ getDisplayName(currentRecord) }}</a-descriptions-item>
          <a-descriptions-item label="部门">{{ currentRecord.department }}</a-descriptions-item>
          <a-descriptions-item label="职位">{{ currentRecord.position }}</a-descriptions-item>
          <a-descriptions-item label="提交时间">{{ currentRecord.submitTime }}</a-descriptions-item>
          <a-descriptions-item v-if="auditType === 'summary'" label="自评分">
            <a-tag color="blue" v-if="currentRecord.selfScore">{{ currentRecord.selfScore }}分</a-tag>
            <span v-else style="color: #999;">未评分</span>
          </a-descriptions-item>
          <a-descriptions-item label="状态">
            <a-tag :color="getStatusColor(currentRecord.status)">
              {{ getStatusText(currentRecord.status) }}
            </a-tag>
          </a-descriptions-item>
        </a-descriptions>
        
        <a-divider>{{ auditType === 'plan' ? '计划内容' : '总结内容' }}</a-divider>
        <div style="background: #f5f5f5; padding: 16px; border-radius: 6px;">
          {{ currentRecord.content || `暂无${auditType === 'plan' ? '计划' : '总结'}内容` }}
        </div>
        
        <a-divider>已有评价</a-divider>
        <div v-if="currentRecord.score">
          <span>评分：{{ currentRecord.score }}分</span>
        </div>
        <div v-if="currentRecord.comments" style="margin-top: 8px;">
          <strong>审核意见：</strong>{{ currentRecord.comments }}
        </div>
      </div>
    </a-modal>

    <!-- 详细审核模态框 -->
    <DetailedAuditModal
      v-model:visible="showDetailModal"
      :report-data="currentRecord"
      :report-type="'monthly'"
      :content-type="auditType"
      @audit-submitted="handleAuditSubmitted"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import {
  ReloadOutlined,
  EyeOutlined,
  AuditOutlined,
  CheckOutlined,
  CloseOutlined
} from '@ant-design/icons-vue'
import DetailedAuditModal from '@/components/DetailedAuditModal.vue'

// 页面状态
const loading = ref(false)
const selectedRowKeys = ref<number[]>([])
const showAuditModal = ref(false)
const showDetailModal = ref(false)
const currentRecord = ref<any>(null)
const auditType = ref<'plan' | 'summary'>('summary')

// 筛选条件
const filters = reactive({
  department: '',
  status: '',
  month: null
})

// 审核表单
const auditForm = reactive({
  result: 'approved',
  score: 85,
  comments: '',
  suggestions: ''
})

// 表格行选择配置
const rowSelection = {
  selectedRowKeys: selectedRowKeys,
  onChange: (keys: number[]) => {
    selectedRowKeys.value = keys
  }
}

// 计划审核数据
const planAuditData = ref([
  {
    id: 1,
    name: '张三',
    department: '技术部',
    position: '高级工程师',
    isManager: false,
    year: '2024',
    month: '12',
    submitTime: '2024-12-01 09:30:00',
    status: 'reviewing',
    content: '本月计划完成产品优化项目第二阶段，预计提升系统性能30%，优化核心算法，进行压力测试。',
    goals: [
      {
        title: '产品优化项目',
        description: '完成系统核心模块的性能优化，提升处理效率',
        metrics: '响应时间减少30%，吞吐量提升50%'
      },
      {
        title: '算法优化',
        description: '优化核心算法逻辑，减少计算复杂度',
        metrics: '算法执行时间减少40%'
      }
    ],
    additionalInfo: '需要与产品部协调测试计划，确保优化效果。',
    auditHistory: [],
    score: null,
    comments: ''
  },
  {
    id: 2,
    name: '李四',
    department: '产品部',
    position: '产品总监',
    isManager: true,
    year: '2024',
    month: '12',
    submitTime: '2024-12-02 14:15:00',
    status: 'approved',
    content: '产品部12月计划：完成需求分析和产品原型设计，开展用户调研，制定下一版本产品规划。',
    goals: [
      {
        title: '需求分析',
        description: '完成新功能需求的详细分析和设计',
        metrics: '需求文档完成率100%，评审通过率95%'
      },
      {
        title: '用户调研',
        description: '开展用户满意度调研，收集产品改进建议',
        metrics: '调研样本量达到1000人，有效问卷回收率80%'
      }
    ],
    additionalInfo: '调研结果将作为下月产品迭代的重要依据。',
    auditHistory: [
      {
        auditor: '总经理',
        auditTime: '2024-12-05 10:00:00',
        result: 'approved',
        score: 88,
        comments: '计划制定详细，目标明确'
      }
    ],
    score: 88,
    comments: '计划制定详细，目标明确'
  }
])

// 总结审核数据
const summaryAuditData = ref([
  {
    id: 1,
    name: '张三',
    department: '技术部',
    position: '高级工程师',
    isManager: false,
    year: '2024',
    month: '11',
    submitTime: '2024-12-01 16:30:00',
    status: 'reviewing',
    content: '本月完成了产品优化项目第一阶段，成功提升了系统性能28%，完成了核心算法重构，通过了所有测试用例。',
    goals: [
      {
        title: '产品优化项目',
        description: '完成系统核心模块的性能优化，提升处理效率',
        progress: 95,
        metrics: '响应时间减少28%，吞吐量提升45%，基本达到预期目标'
      },
      {
        title: '算法重构',
        description: '重构核心算法，提升代码质量和性能',
        progress: 100,
        metrics: '算法执行时间减少42%，代码复杂度降低35%'
      }
    ],
    selfScore: 85,
    selfEvaluation: '本月工作进展顺利，基本完成了预定目标，在性能优化方面取得了显著成果。',
    additionalInfo: '下月将继续推进项目第二阶段，进一步优化系统性能。',
    auditHistory: [],
    score: null,
    comments: ''
  },
  {
    id: 2,
    name: '李四',
    department: '产品部',
    position: '产品总监',
    isManager: true,
    year: '2024',
    month: '11',
    submitTime: '2024-12-02 11:45:00',
    status: 'approved',
    content: '产品部11月工作总结：完成了需求分析和产品设计，用户反馈良好，新功能上线后使用率达到预期。',
    goals: [
      {
        title: '需求分析',
        description: '完成新功能需求的详细分析和设计',
        progress: 100,
        metrics: '需求文档完成率100%，评审通过率98%'
      },
      {
        title: '产品设计',
        description: '完成产品原型设计和交互设计',
        progress: 95,
        metrics: '设计稿完成率95%，用户测试满意度90%'
      }
    ],
    selfScore: 90,
    selfEvaluation: '本月工作表现良好，产品设计获得了用户和团队的认可，为后续开发奠定了基础。',
    additionalInfo: '与技术团队协作顺畅，产品开发进度符合预期。',
    auditHistory: [
      {
        auditor: '总经理',
        auditTime: '2024-12-03 14:30:00',
        result: 'approved',
        score: 88,
        comments: '工作表现优秀，产品质量高'
      }
    ],
    score: 88,
    comments: '工作表现优秀，产品质量高'
  }
])

// 当前审核数据
const currentAuditData = computed(() => {
  return auditType.value === 'plan' ? planAuditData.value : summaryAuditData.value
})

// 表格列定义
const auditColumns = computed(() => {
  const baseColumns = [
    {
      title: '提交人/部门',
      key: 'nameAndDept',
      width: 180
    },
    {
      title: '职位',
      dataIndex: 'position',
      key: 'position'
    },
    {
      title: '提交时间',
      dataIndex: 'submitTime',
      key: 'submitTime'
    }
  ]

  if (auditType.value === 'summary') {
    baseColumns.splice(2, 0, {
      title: '自评分',
      key: 'selfScore',
      width: 100
    })
  }

  baseColumns.push(
    {
      title: '状态',
      key: 'status',
      width: 100
    },
    {
      title: '操作',
      key: 'actions',
      width: 200
    }
  )

  return baseColumns
})

// 获取显示名称
const getDisplayName = (record: any) => {
  if (record.isManager) {
    return `${record.department} - ${record.name}`
  } else {
    return record.name
  }
}

// 获取显示部门
const getDisplayDepartment = (record: any) => {
  if (record.isManager) {
    return `部门负责人`
  } else {
    return record.department
  }
}

// 分页配置
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total: number) => `共 ${total} 条记录`
})

// 审核类型切换处理
const handleAuditTypeChange = () => {
  selectedRowKeys.value = []
  pagination.current = 1
  pagination.total = currentAuditData.value.length
}

// 获取状态颜色
const getStatusColor = (status: string) => {
  const colorMap: Record<string, string> = {
    reviewing: 'processing',
    approved: 'success',
    rejected: 'error',
    modified: 'warning'
  }
  return colorMap[status] || 'default'
}

// 获取状态文本
const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    reviewing: '待审核',
    approved: '已通过',
    rejected: '已驳回',
    modified: '修改后通过'
  }
  return textMap[status] || status
}

// 批量审批通过
const batchApprove = () => {
  message.success(`批量通过 ${selectedRowKeys.value.length} 条记录`)
  selectedRowKeys.value = []
}

// 批量驳回
const batchReject = () => {
  message.success(`批量驳回 ${selectedRowKeys.value.length} 条记录`)
  selectedRowKeys.value = []
}

// 审核记录
const auditRecord = (record: any) => {
  currentRecord.value = record
  showAuditModal.value = true
}

// 查看详情
const viewDetail = (record: any) => {
  currentRecord.value = record
  showDetailModal.value = true
}

// 提交审核
const handleAuditSubmit = () => {
  if (!auditForm.score) {
    message.error('请填写评分')
    return
  }
  message.success('审核完成')
  resetAuditForm()
  showAuditModal.value = false
}

// 重置审核表单
const resetAuditForm = () => {
  Object.assign(auditForm, {
    result: 'approved',
    score: 85,
    comments: '',
    suggestions: ''
  })
  currentRecord.value = null
}

// 搜索
const handleSearch = () => {
  message.info('搜索功能')
}

// 重置筛选
const resetFilters = () => {
  Object.assign(filters, {
    department: '',
    status: '',
    month: null
  })
}

// 表格变化处理
const handleTableChange = (pag: any) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
}

// 刷新数据
const refreshData = () => {
  message.success('数据刷新成功')
}

// 处理审核提交
const handleAuditSubmitted = (auditData: any) => {
  // 更新对应记录的状态
  const targetData = auditType.value === 'plan' ? planAuditData.value : summaryAuditData.value
  const recordIndex = targetData.findIndex(item => item.id === auditData.reportId)
  
  if (recordIndex !== -1) {
    const record = targetData[recordIndex] as any
    record.status = auditData.result
    record.score = auditData.score
    record.comments = auditData.comments
    
    // 添加到审核历史
    if (!record.auditHistory) {
      record.auditHistory = []
    }
    record.auditHistory.unshift({
      auditor: auditData.auditor,
      auditTime: auditData.auditTime,
      result: auditData.result,
      score: auditData.score,
      comments: auditData.comments
    })
  }
  
  message.success('审核结果已保存')
}

// 页面初始化
onMounted(() => {
  pagination.total = currentAuditData.value.length
})
</script>

<style scoped>
.monthly-audit {
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