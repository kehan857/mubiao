<template>
  <div class="quarterly-audit">
    <!-- 页面标题 -->
    <div class="page-header">
      <div class="header-content">
        <div class="title-area">
          <h2>季度审核</h2>
          <p>审核各部门的季度计划和总结</p>
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
        <a-form-item label="年份">
          <a-select v-model:value="filters.year" placeholder="选择年份" style="width: 120px" allowClear>
            <a-select-option value="2024">2024年</a-select-option>
            <a-select-option value="2025">2025年</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="季度">
          <a-select v-model:value="filters.quarter" placeholder="选择季度" style="width: 120px" allowClear>
            <a-select-option value="Q1">Q1季度</a-select-option>
            <a-select-option value="Q2">Q2季度</a-select-option>
            <a-select-option value="Q3">Q3季度</a-select-option>
            <a-select-option value="Q4">Q4季度</a-select-option>
          </a-select>
        </a-form-item>
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
        <a-form-item>
          <a-button type="primary" @click="handleSearch">搜索</a-button>
          <a-button style="margin-left: 8px" @click="resetFilters">重置</a-button>
        </a-form-item>
      </a-form>
    </a-card>

    <!-- 审核列表 -->
    <a-card :title="auditType === 'plan' ? '季度计划审核列表' : '季度总结审核列表'">
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
          <template v-if="column.key === 'deptAndManager'">
            <div>
              <div style="font-weight: 500;">{{ record.department }}</div>
              <div style="color: #666; font-size: 12px;">负责人：{{ record.manager }}</div>
            </div>
          </template>
          <template v-else-if="column.key === 'quarter'">
            <a-tag color="cyan">{{ record.quarter }}</a-tag>
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
      :title="`审核季度${auditType === 'plan' ? '计划' : '总结'}`"
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
        
        <a-form-item v-if="auditType === 'summary'" label="部门自评分">
          <a-tag color="blue" v-if="currentRecord?.selfScore">{{ currentRecord.selfScore }}分</a-tag>
          <span v-else style="color: #999;">部门未进行自评</span>
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

    <!-- 详细审核模态框 -->
    <DetailedAuditModal
      v-model:visible="showDetailModal"
      :report-data="currentRecord"
      :report-type="'quarterly'"
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
  year: '2024',
  quarter: 'Q1',
  department: '',
  status: ''
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

// 季度计划审核数据
const planAuditData = ref([
  {
    id: 1,
    department: '技术部',
    manager: '王总监',
    year: '2024',
    quarter: 'Q1',
    submitTime: '2024-01-05',
    status: 'reviewing',
    content: '2024年Q1技术部计划：完成产品架构升级，引入新技术栈...',
    score: null,
    comments: ''
  },
  {
    id: 2,
    department: '产品部',
    manager: '李总监',
    year: '2024',
    quarter: 'Q1',
    submitTime: '2024-01-08',
    status: 'approved',
    content: '2024年Q1产品部计划：市场调研、需求分析、产品规划...',
    score: 90,
    comments: '计划详细，执行性强'
  }
])

// 季度总结审核数据
const summaryAuditData = ref([
  {
    id: 1,
    department: '技术部',
    manager: '王总监',
    year: '2024',
    quarter: 'Q1',
    submitTime: '2024-03-30',
    status: 'reviewing',
    content: '2024年Q1技术部总结：成功完成产品架构升级，新技术栈导入顺利...',
    selfScore: 88,
    score: null,
    comments: ''
  },
  {
    id: 2,
    department: '产品部',
    manager: '李总监',
    year: '2024',
    quarter: 'Q1',
    submitTime: '2024-04-02',
    status: 'approved',
    content: '2024年Q1产品部总结：市场调研完成，需求分析深入，产品规划清晰...',
    selfScore: 92,
    score: 91,
    comments: '季度目标完成出色'
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
      title: '部门/负责人',
      key: 'deptAndManager',
      width: 180
    },
    {
      title: '季度',
      key: 'quarter',
      width: 80
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
    year: '2024',
    quarter: 'Q1',
    department: '',
    status: ''
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

// 页面初始化
onMounted(() => {
  pagination.total = currentAuditData.value.length
})

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
  showDetailModal.value = false
}
</script>

<style scoped>
.quarterly-audit {
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