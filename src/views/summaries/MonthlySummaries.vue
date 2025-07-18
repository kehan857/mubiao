<template>
  <div class="monthly-summaries">
    <!-- 页面标题 -->
    <div class="page-header">
      <div class="header-content">
        <div class="title-area">
          <h2>月度总结</h2>
          <p>填写月度工作总结和自评</p>
          <!-- 状态显示 -->
          <div class="status-display">
            <span class="status-label">当前状态：</span>
            <a-tag 
              :style="{ 
                color: statusConfig[reviewStatus].color, 
                backgroundColor: statusConfig[reviewStatus].bgColor,
                border: `1px solid ${statusConfig[reviewStatus].color}`,
                fontWeight: '500'
              }"
              class="status-tag"
            >
              {{ statusConfig[reviewStatus].text }}
            </a-tag>
          </div>
        </div>
        <div class="actions">
          <a-space>
            <a-date-picker
              v-model:value="currentMonth"
              picker="month"
              format="YYYY-MM"
              placeholder="选择月份"
              @change="handleMonthChange"
            />
            <a-button 
              type="primary" 
              @click="submitSummary" 
              :loading="submitting"
              :disabled="isSubmitted"
            >
              <CheckOutlined />
              提交审核
            </a-button>
          </a-space>
        </div>
      </div>
    </div>

    <!-- 总结表格 -->
    <a-card title="月度总结">
      <template #extra>
        <a-space>
          <a-button 
            type="primary" 
            @click="addNewSummary"
            :disabled="isSubmitted"
          >
            <PlusOutlined />
            增加总结
          </a-button>
          <span>总体自评分：</span>
          <a-input-number
            v-model:value="overallScore"
            :min="0"
            :max="100"
            :disabled="isSubmitted"
            placeholder="总分"
            style="width: 100px"
          />
          <span>分</span>
        </a-space>
      </template>

      <!-- 状态提示 -->
      <a-alert
        v-if="reviewStatus !== 'draft'"
        :type="getStatusType(reviewStatus)"
        :message="getStatusMessage(reviewStatus)"
        style="margin-bottom: 16px"
        show-icon
      />

      <a-table
        :dataSource="summaryData"
        :columns="summaryColumns"
        :loading="loading"
        :pagination="false"
        row-key="id"
        :scroll="{ x: 1600 }"
      >
        <template #bodyCell="{ column, record, index }">
          <template v-if="column.key === 'serialNumber'">
            {{ index + 1 }}
          </template>
          
          <template v-else-if="column.key === 'weight'">
            <span>{{ record.weight }}%</span>
          </template>

          <template v-else-if="column.key === 'project'">
            <span>{{ record.project }}</span>
          </template>

          <template v-else-if="column.key === 'content'">
            <span>{{ record.content }}</span>
          </template>

          <template v-else-if="column.key === 'target'">
            <span>{{ record.target }}</span>
          </template>

          <template v-else-if="column.key === 'standard'">
            <span>{{ record.standard }}</span>
          </template>

          <template v-else-if="column.key === 'responsible'">
            <span>{{ formatResponsible(record.responsible) }}</span>
          </template>

          <template v-else-if="column.key === 'timeRange'">
            <span>{{ formatTimeRange(record.timeRange) }}</span>
          </template>

          <template v-else-if="column.key === 'measures'">
            <span>{{ record.measures }}</span>
          </template>

          <template v-else-if="column.key === 'isCompleted'">
            <a-select
              v-model:value="record.isCompleted"
              style="width: 120px"
              :disabled="isSubmitted"
              @change="() => handleDataChange(record)"
            >
              <a-select-option :value="true">已完成</a-select-option>
              <a-select-option :value="false">未完成</a-select-option>
            </a-select>
          </template>

          <template v-else-if="column.key === 'result'">
            <a-textarea
              v-model:value="record.result"
              :rows="3"
              :disabled="isSubmitted"
              placeholder="完成结果（总结内容）"
              @blur="() => handleDataChange(record)"
            />
          </template>

          <template v-else-if="column.key === 'unfinishedReason'">
            <a-textarea
              v-model:value="record.unfinishedReason"
              :rows="2"
              :disabled="isSubmitted"
              placeholder="未完成原因"
              @blur="() => handleDataChange(record)"
            />
          </template>

          <template v-else-if="column.key === 'actions'">
            <a-space>
              <a-button 
                type="link" 
                @click="deleteSummary(record)"
                :disabled="reviewStatus === 'approved'"
              >
                <DeleteOutlined />
                删除
              </a-button>
            </a-space>
          </template>
        </template>
      </a-table>

      <!-- 总结说明 -->
      <a-divider />
      <a-form layout="vertical">
        <a-form-item label="总结说明">
          <a-textarea
            v-model:value="summaryDescription"
            :rows="4"
            :disabled="isSubmitted"
            placeholder="请填写本月工作的总体总结和下月工作计划..."
          />
        </a-form-item>
      </a-form>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { ReloadOutlined, CheckOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons-vue'
import dayjs from 'dayjs'

// 页面状态
const loading = ref(false)
const submitting = ref(false)
const currentMonth = ref(dayjs())
const overallScore = ref(0)
const summaryDescription = ref('')
const isSubmitted = ref(false)
const reviewStatus = ref('draft')

// 状态配置
const statusConfig = {
  draft: { text: '草稿', color: '#595959', bgColor: '#f0f0f0' },
  reviewing: { text: '审核中', color: '#d46b08', bgColor: '#fff7e6' },
  approved: { text: '已通过', color: '#389e0d', bgColor: '#f6ffed' },
  rejected: { text: '退回修改', color: '#cf1322', bgColor: '#fff1f0' }
}

// 责任人选项 - 包含本人作为默认选项
const responsibleOptions = ref([
  '本人',
  '张三',
  '李四',
  '王五',
  '赵六',
  '钱七',
  '孙八',
  '周九',
  '吴十',
  '郑十一',
  '王十二'
])

// 格式化责任人显示
const formatResponsible = (responsible: string[]) => {
  if (!responsible || responsible.length === 0) return '-'
  if (responsible.length === 1) return responsible[0]
  return `${responsible[0]} 等${responsible.length}人`
}

// 总结数据
const summaryData = ref([
  {
    id: 1,
    serialNumber: 1,
    weight: 35,
    project: '客户服务优化',
    content: '提升客户服务质量，优化服务流程',
    target: '客户满意度达到95%以上，投诉率降低50%',
    standard: '月度客户满意度调研，投诉处理时效达标',
    responsible: ['张三'],
    timeRange: [currentMonth.value.startOf('month'), currentMonth.value.endOf('month')],
    measures: '培训服务团队，优化服务流程，建立快速响应机制',
    isCompleted: true,
    result: '客户满意度达到96%，投诉率降低55%，超额完成目标',
    unfinishedReason: ''
  },
  {
    id: 2,
    serialNumber: 2,
    weight: 30,
    project: '产品功能开发',
    content: '完成移动端新功能模块开发',
    target: '按期完成3个新功能模块开发和测试',
    standard: '功能完整，测试通过，用户体验良好',
    responsible: ['李四'],
    timeRange: [currentMonth.value.startOf('month'), currentMonth.value.endOf('month')],
    measures: '需求分析，设计开发，测试验收',
    isCompleted: false,
    result: '完成2个功能模块，第3个模块仍在开发中',
    unfinishedReason: '第三方接口调试耗时较长，影响开发进度'
  }
])

// 总结表格列定义
const summaryColumns = [
  {
    title: '序号',
    key: 'serialNumber',
    width: 80,
    fixed: 'left'
  },
  {
    title: '权重(%)',
    key: 'weight',
    width: 100
  },
  {
    title: '项目',
    key: 'project',
    width: 150
  },
  {
    title: '内容',
    key: 'content',
    width: 200
  },
  {
    title: '目标',
    key: 'target',
    width: 200
  },
  {
    title: '考核标准',
    key: 'standard',
    width: 200
  },
  {
    title: '责任人',
    key: 'responsible',
    width: 120
  },
  {
    title: '计划完成时间',
    key: 'timeRange',
    width: 220
  },
  {
    title: '实施措施',
    key: 'measures',
    width: 200
  },
  {
    title: '是否完成',
    key: 'isCompleted',
    width: 120
  },
  {
    title: '完成结果',
    key: 'result',
    width: 250
  },
  {
    title: '未完成原因',
    key: 'unfinishedReason',
    width: 200
  },
  {
    title: '操作',
    key: 'actions',
    width: 120,
    fixed: 'right'
  }
]

// 数据变化处理
const handleDataChange = (record: any) => {
  console.log('数据变化:', record)
}

// 提交总结
const submitSummary = async () => {
  if (overallScore.value === 0) {
    message.error('请填写总体自评分')
    return
  }
  
  submitting.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    message.success('总结提交成功')
    isSubmitted.value = true
    reviewStatus.value = 'submitted'
  } catch (error) {
    message.error('提交失败')
  } finally {
    submitting.value = false
  }
}

// 月份变化处理
const handleMonthChange = async () => {
  const selectedMonth = currentMonth.value?.format('YYYY-MM')
  console.log('月份变化:', selectedMonth)
  
  // 自动加载对应月份的计划数据
  loading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    message.success(`已加载${selectedMonth}月计划数据`)
    // 这里可以根据selectedMonth加载对应的计划数据
    // 实际项目中应该调用API获取数据
  } catch (error) {
    message.error('加载计划数据失败')
  } finally {
    loading.value = false
  }
}

// 删除总结
const deleteSummary = (record: any) => {
  if (reviewStatus.value === 'approved') {
    message.error('审核通过的总结不允许删除')
    return
  }
  
  const index = summaryData.value.findIndex(item => item.id === record.id)
  if (index > -1) {
    summaryData.value.splice(index, 1)
    message.success('删除成功')
  }
}

// 增加新总结
const addNewSummary = () => {
  if (isSubmitted.value) {
    message.warning('总结已提交，无法添加新记录')
    return
  }
  
  const newId = Math.max(...summaryData.value.map(item => item.id)) + 1
  const newSummary = {
    id: newId,
    serialNumber: summaryData.value.length + 1,
    weight: 0,
    project: '',
    content: '',
    target: '',
    standard: '',
    responsible: ['本人'],
    timeRange: [currentMonth.value.startOf('month'), currentMonth.value.endOf('month')],
    measures: '',
    isCompleted: false,
    result: '',
    unfinishedReason: ''
  }
  
  summaryData.value.push(newSummary)
  message.success('已添加新的总结记录')
}

// 页面初始化
onMounted(() => {
  console.log('月度总结页面初始化')
})

// 获取状态颜色
const getStatusColor = (status: string) => {
  switch (status) {
    case 'draft':
      return '#d9d9d9'
    case 'submitted':
    case 'reviewing':
      return '#faad14'
    case 'approved':
      return '#52c41a'
    case 'rejected':
      return '#ff4d4f'
    default:
      return '#d9d9d9'
  }
}

// 获取状态文本
const getStatusText = (status: string) => {
  switch (status) {
    case 'draft':
      return '草稿'
    case 'submitted':
      return '已提交'
    case 'reviewing':
      return '审核中'
    case 'approved':
      return '已通过'
    case 'rejected':
      return '退回修改'
    default:
      return '草稿'
  }
}

// 获取状态类型
const getStatusType = (status: string) => {
  switch (status) {
    case 'submitted':
      return 'success'
    case 'reviewing':
      return 'warning'
    case 'approved':
      return 'success'
    case 'rejected':
      return 'error'
    default:
      return 'info'
  }
}

// 获取状态消息
const getStatusMessage = (status: string) => {
  switch (status) {
    case 'submitted':
      return '已提交审核'
    case 'reviewing':
      return '审核中'
    case 'approved':
      return '审核通过'
    case 'rejected':
      return '审核未通过'
    default:
      return '草稿状态'
  }
}

// 格式化时间范围
const formatTimeRange = (timeRange: any) => {
  if (!timeRange || !Array.isArray(timeRange) || timeRange.length !== 2) {
    return '-'
  }
  return `${timeRange[0].format('YYYY-MM-DD')} 至 ${timeRange[1].format('YYYY-MM-DD')}`
}
</script>

<style scoped>
.monthly-summaries {
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
  margin: 0 0 8px 0;
  color: #666;
  font-size: 14px;
}

.status-display {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
}

.status-label {
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

.status-tag {
  font-size: 14px;
  padding: 4px 12px;
  font-weight: 500;
}

:deep(.ant-table-tbody > tr > td) {
  padding: 8px !important;
}
</style> 