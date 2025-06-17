<template>
  <div class="weekly-audit">
    <!-- 页面标题 -->
    <div class="page-header">
      <div class="header-content">
        <div class="title-area">
          <h2>周报审核</h2>
          <p>审核团队成员的周报内容</p>
        </div>
      </div>
    </div>

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
            <a-select-option value="pending">待确认</a-select-option>
            <a-select-option value="confirmed">已确认</a-select-option>
            <a-select-option value="revision">需修订</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="周次">
          <a-week-picker v-model:value="filters.week" placeholder="选择周次" />
        </a-form-item>
        <a-form-item>
          <a-button type="primary" @click="handleSearch">搜索</a-button>
          <a-button style="margin-left: 8px" @click="resetFilters">重置</a-button>
        </a-form-item>
      </a-form>
    </a-card>

    <!-- 审核列表 -->
    <a-card title="周报审核列表">
      <template #extra>
        <a-space>
          <a-button @click="batchConfirm" :disabled="selectedRowKeys.length === 0" type="primary">
            <CheckOutlined />
            批量确认
          </a-button>
          <a-button @click="batchRevision" :disabled="selectedRowKeys.length === 0" danger>
            <EditOutlined />
            批量标记需修订
          </a-button>
          <a-button @click="refreshData">
            <ReloadOutlined />
            刷新
          </a-button>
        </a-space>
      </template>
      <a-table
        :dataSource="auditData"
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
      title="审核周报"
      @ok="handleAuditSubmit"
      @cancel="resetAuditForm"
      width="800px"
    >
      <a-form :model="auditForm" layout="vertical">
        <a-form-item label="确认状态" required>
          <a-radio-group v-model:value="auditForm.status">
            <a-radio value="confirmed">确认无误</a-radio>
            <a-radio value="revision">需要修订</a-radio>
          </a-radio-group>
        </a-form-item>
        
        <a-form-item label="建议意见">
          <a-textarea 
            v-model:value="auditForm.suggestions" 
            placeholder="请填写建议意见（可选）..." 
            :rows="4"
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 详情查看弹窗 -->
    <a-modal
      v-model:open="showDetailModal"
      title="周报详情"
      footer="null"
      width="1000px"
    >
      <div v-if="currentRecord">
        <a-descriptions :column="2" bordered>
          <a-descriptions-item label="提交人">{{ getDisplayName(currentRecord) }}</a-descriptions-item>
          <a-descriptions-item label="部门">{{ currentRecord.department }}</a-descriptions-item>
          <a-descriptions-item label="职位">{{ currentRecord.position }}</a-descriptions-item>
          <a-descriptions-item label="周次">{{ currentRecord.week }}</a-descriptions-item>
          <a-descriptions-item label="提交时间">{{ currentRecord.submitTime }}</a-descriptions-item>
          <a-descriptions-item label="状态">
            <a-tag :color="getStatusColor(currentRecord.status)">
              {{ getStatusText(currentRecord.status) }}
            </a-tag>
          </a-descriptions-item>
        </a-descriptions>
        
        <a-divider>周报内容</a-divider>
        <div style="background: #f5f5f5; padding: 16px; border-radius: 6px;">
          {{ currentRecord.content || '暂无周报内容' }}
        </div>
        
        <a-divider>已有建议</a-divider>
        <div v-if="currentRecord.suggestions" style="margin-top: 8px;">
          <strong>上级建议：</strong>{{ currentRecord.suggestions }}
        </div>
        <div v-else style="color: #999;">暂无建议意见</div>
      </div>
    </a-modal>

    <!-- 详细审核模态框 -->
    <DetailedAuditModal
      v-model:visible="showDetailModal"
      :report-data="currentRecord"
      :report-type="'weekly'"
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
  EditOutlined
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
  week: null
})

// 审核表单
const auditForm = reactive({
  status: 'confirmed',
  suggestions: ''
})

// 表格行选择配置
const rowSelection = {
  selectedRowKeys: selectedRowKeys,
  onChange: (keys: number[]) => {
    selectedRowKeys.value = keys
  }
}

// 审核数据
const auditData = ref([
  {
    id: 1,
    name: '张三',
    department: '技术部',
    position: '高级工程师',
    isManager: false,
    week: '2024年第50周',
    submitTime: '2024-12-13',
    status: 'pending',
    content: '本周完成了用户界面优化，修复了3个关键bug，参与了需求评审会议',
    suggestions: ''
  },
  {
    id: 2,
    name: '李四',
    department: '产品部',
    position: '产品总监',
    isManager: true,
    week: '2024年第50周',
    submitTime: '2024-12-14',
    status: 'confirmed',
    content: '产品部本周完成了用户调研报告，制定了下阶段产品规划，协调了跨部门合作',
    suggestions: '继续保持与技术团队的紧密沟通'
  },
  {
    id: 3,
    name: '王五',
    department: '市场部',
    position: '市场专员',
    isManager: false,
    week: '2024年第50周',
    submitTime: '2024-12-12',
    status: 'revision',
    content: '本周进行了客户拜访，整理了竞品分析',
    suggestions: '建议补充具体的数据分析和行动计划'
  }
])

// 表格列定义
const auditColumns = [
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
    title: '周次',
    dataIndex: 'week',
    key: 'week'
  },
  {
    title: '提交时间',
    dataIndex: 'submitTime',
    key: 'submitTime'
  },
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
]

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

// 获取状态颜色
const getStatusColor = (status: string) => {
  const colorMap: Record<string, string> = {
    pending: 'processing',
    confirmed: 'success',
    revision: 'warning'
  }
  return colorMap[status] || 'default'
}

// 获取状态文本
const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    pending: '待确认',
    confirmed: '已确认',
    revision: '需修订'
  }
  return textMap[status] || status
}

// 批量确认
const batchConfirm = () => {
  message.success(`批量确认 ${selectedRowKeys.value.length} 条记录`)
  selectedRowKeys.value = []
}

// 批量标记需修订
const batchRevision = () => {
  message.success(`批量标记 ${selectedRowKeys.value.length} 条记录需修订`)
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
  message.success('审核完成')
  resetAuditForm()
  showAuditModal.value = false
}

// 重置审核表单
const resetAuditForm = () => {
  Object.assign(auditForm, {
    status: 'confirmed',
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
    week: null
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
  pagination.total = auditData.value.length
})

// 处理审核提交
const handleAuditSubmitted = (auditResult: any) => {
  // 更新对应记录的状态
  const recordIndex = auditData.value.findIndex((item: any) => item.id === auditResult.reportId)
  
  if (recordIndex !== -1) {
    const record = auditData.value[recordIndex] as any
    record.status = auditResult.result === 'approved' ? 'confirmed' : (auditResult.result === 'rejected' ? 'revision' : 'confirmed')
    record.score = auditResult.score
    record.comments = auditResult.comments
    
    // 添加到审核历史
    if (!record.auditHistory) {
      record.auditHistory = []
    }
    record.auditHistory.unshift({
      auditor: auditResult.auditor,
      auditTime: auditResult.auditTime,
      result: auditResult.result,
      score: auditResult.score,
      comments: auditResult.comments
    })
  }
  
  message.success('审核结果已保存')
  showDetailModal.value = false
}
</script>

<style scoped>
.weekly-audit {
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