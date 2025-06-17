<template>
  <div class="annual-audit">
    <!-- 页面标题 -->
    <div class="page-header">
      <div class="header-content">
        <div class="title-area">
          <h2>年度审核</h2>
          <p>审核各部门的年度计划和总结</p>
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
    <a-card :title="auditType === 'plan' ? '年度计划审核列表' : '年度总结审核列表'">
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

    <!-- 详细审核模态框 -->
    <DetailedAuditModal
      v-model:visible="showDetailModal"
      :report-data="currentRecord"
      :report-type="'annual'"
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
  CheckOutlined,
  CloseOutlined
} from '@ant-design/icons-vue'
import DetailedAuditModal from '@/components/DetailedAuditModal.vue'

// 页面状态
const loading = ref(false)
const selectedRowKeys = ref<number[]>([])
const showDetailModal = ref(false)
const currentRecord = ref<any>(null)
const auditType = ref<'plan' | 'summary'>('summary')

// 筛选条件
const filters = reactive({
  year: '2024',
  department: '',
  status: ''
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
    manager: '李四',
    position: '技术总监',
    year: '2024',
    submitTime: '2024-01-15 09:30:00',
    status: 'reviewing',
    content: '2024年技术部年度计划：推进数字化转型，完善技术架构，提升开发效率30%，建设微服务架构体系，加强团队技术培训。',
    goals: [
      {
        title: '数字化转型项目',
        description: '完成核心业务系统的数字化改造，提升业务处理效率',
        metrics: '处理效率提升30%，响应时间减少50%'
      },
      {
        title: '微服务架构建设',
        description: '构建完整的微服务架构体系，提升系统可扩展性',
        metrics: '模块化程度达到90%，部署效率提升40%'
      },
      {
        title: '团队能力提升',
        description: '加强技术团队培训，提升技术人员专业技能',
        metrics: '技术认证通过率达到80%，新技术应用率提升60%'
      }
    ],
    additionalInfo: '本年度重点关注新技术应用和团队建设，预计投入预算800万元，涉及人员50人。',
    auditHistory: [],
    score: null,
    comments: ''
  },
  {
    id: 2,
    name: '王五',
    department: '产品部',
    manager: '赵六',
    position: '产品总监',
    year: '2024',
    submitTime: '2024-01-18 14:20:00',
    status: 'approved',
    content: '2024年产品部年度计划：优化产品体验，扩大市场份额，推出3款创新产品，用户满意度提升至95%。',
    goals: [
      {
        title: '产品创新升级',
        description: '基于市场调研推出3款创新产品，满足用户多样化需求',
        metrics: '新产品市场占有率达到15%，用户活跃度提升25%'
      },
      {
        title: '用户体验优化',
        description: '全面优化现有产品用户体验，提升用户满意度',
        metrics: '用户满意度达到95%，投诉率降低40%'
      }
    ],
    additionalInfo: '将与技术部紧密配合，确保产品技术实现的可行性。',
    auditHistory: [
      {
        auditor: '总经理',
        auditTime: '2024-01-25 16:00:00',
        result: 'approved',
        score: 92,
        comments: '计划制定详细，目标明确，具有很好的可执行性'
      }
    ],
    score: 92,
    comments: '计划制定详细，目标明确，具有很好的可执行性'
  }
])

// 总结审核数据
const summaryAuditData = ref([
  {
    id: 1,
    name: '张三',
    department: '技术部',
    manager: '李四',
    position: '技术总监',
    year: '2024',
    submitTime: '2024-12-28 16:45:00',
    status: 'reviewing',
    content: '2024年技术部工作总结：成功完成数字化转型项目，系统性能提升35%，微服务架构基本建成，团队技术能力显著提升。',
    goals: [
      {
        title: '数字化转型项目',
        description: '完成核心业务系统的数字化改造，系统性能显著提升',
        progress: 95,
        metrics: '处理效率提升35%，响应时间减少55%，超额完成目标'
      },
      {
        title: '微服务架构建设',
        description: '成功构建微服务架构体系，系统扩展性大幅提升',
        progress: 88,
        metrics: '模块化程度达到85%，部署效率提升45%'
      },
      {
        title: '团队能力提升',
        description: '团队技术培训效果显著，专业技能水平大幅提升',
        progress: 92,
        metrics: '技术认证通过率达到85%，新技术应用率提升65%'
      }
    ],
    selfScore: 88,
    selfEvaluation: '本年度在数字化转型和技术架构建设方面取得突破性进展，团队协作能力和技术水平都有很大提升，基本完成了年初设定的各项目标。',
    additionalInfo: '在项目执行过程中积累了丰富的经验，为明年的工作奠定了良好基础。',
    auditHistory: [
      {
        auditor: '李经理',
        auditTime: '2024-12-20 10:30:00',
        result: 'modified',
        score: 85,
        comments: '工作完成质量很好，但在某些细节上还需要进一步完善'
      }
    ],
    score: null,
    comments: ''
  },
  {
    id: 2,
    name: '王五',
    department: '产品部',
    manager: '赵六',
    position: '产品总监',
    year: '2024',
    submitTime: '2024-12-30 11:15:00',
    status: 'approved',
    content: '2024年产品部工作总结：成功推出4款创新产品，超额完成年度目标，用户满意度达到96%，市场份额显著提升。',
    goals: [
      {
        title: '产品创新升级',
        description: '成功推出4款创新产品，超额完成原定3款的目标',
        progress: 133,
        metrics: '新产品市场占有率达到18%，用户活跃度提升30%'
      },
      {
        title: '用户体验优化',
        description: '用户体验全面提升，满意度创历史新高',
        progress: 101,
        metrics: '用户满意度达到96%，投诉率降低45%'
      }
    ],
    selfScore: 95,
    selfEvaluation: '本年度产品工作取得了优异成绩，不仅完成了既定目标，还在多个方面实现了突破，为公司业务发展做出了重要贡献。',
    additionalInfo: '与各部门协作顺畅，产品上线节奏控制良好，用户反馈持续正面。',
    auditHistory: [
      {
        auditor: '总经理',
        auditTime: '2024-12-31 09:00:00',
        result: 'approved',
        score: 94,
        comments: '工作表现优秀，超额完成各项指标，值得表彰'
      }
    ],
    score: 94,
    comments: '工作表现优秀，超额完成各项指标，值得表彰'
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
      title: '年份',
      dataIndex: 'year',
      key: 'year',
      width: 80,
      customRender: ({ text }: any) => `${text}年`
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
      width: 120
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

// 查看详情
const viewDetail = (record: any) => {
  currentRecord.value = record
  showDetailModal.value = true
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
  showDetailModal.value = false
}

// 搜索
const handleSearch = () => {
  message.info('搜索功能')
}

// 重置筛选
const resetFilters = () => {
  Object.assign(filters, {
    year: '2024',
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
</script>

<style scoped>
.annual-audit {
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