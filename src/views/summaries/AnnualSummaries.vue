<template>
  <div class="annual-summaries">
    <!-- 页面标题 -->
    <div class="page-header">
      <div class="header-content">
        <div class="title-area">
          <h2>年度总结</h2>
          <p>填写年度工作总结和自评</p>
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
            >
              {{ statusConfig[reviewStatus].text }}
            </a-tag>
          </div>
        </div>
        <div class="actions">
          <a-space>
            <a-select v-model:value="currentYear" style="width: 120px" @change="handleYearChange">
              <a-select-option value="2024">2024年</a-select-option>
              <a-select-option value="2025">2025年</a-select-option>
            </a-select>
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

    <!-- 年度总结表格 -->
    <a-card title="年度总结">
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
        :dataSource="summaries"
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

          <template v-else-if="column.key === 'reason'">
            <a-textarea
              v-model:value="record.reason"
              :rows="2"
              :disabled="isSubmitted"
              placeholder="未完成原因（如有）"
              @blur="() => handleDataChange(record)"
            />
          </template>

          <template v-else-if="column.key === 'actions'">
            <a-space>
              <a-popconfirm
                title="确定要删除这条总结吗？"
                @confirm="deleteRecord(record)"
              >
                <a-button 
                  type="text" 
                  size="small" 
                  danger
                  :disabled="reviewStatus === 'approved'"
                >
                  <DeleteOutlined />
                  删除
                </a-button>
              </a-popconfirm>
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
            placeholder="请填写本年度工作的总体总结和下年度工作计划..."
          />
        </a-form-item>
      </a-form>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { ReloadOutlined, CheckOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons-vue'

// 页面状态
const loading = ref(false)
const submitting = ref(false)
const currentYear = ref('2024')
const reviewStatus = ref<'draft' | 'submitted' | 'reviewing' | 'approved' | 'rejected'>('draft')
const overallScore = ref<number>(0)
const summaryDescription = ref('')

// 状态配置
const statusConfig = {
  draft: { text: '草稿', color: '#595959', bgColor: '#f0f0f0' },
  reviewing: { text: '审核中', color: '#d46b08', bgColor: '#fff7e6' },
  approved: { text: '已通过', color: '#389e0d', bgColor: '#f6ffed' },
  rejected: { text: '退回修改', color: '#cf1322', bgColor: '#fff1f0' }
}

// 计算属性
const isSubmitted = computed(() => reviewStatus.value !== 'draft')

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

// 总结数据 - 修改责任人字段为数组格式
const summaries = ref([
  {
    id: 1,
    year: '2024',
    serialNumber: 1,
    weight: 30,
    project: '数字化转型项目',
    content: '推进公司全面数字化转型，提升运营效率',
    target: '完成核心系统数字化改造，效率提升30%',
    standard: '系统上线运行稳定，关键指标达到预期',
    responsible: ['张三'], // 修改为数组格式
    isCompleted: true, // 添加是否完成字段
    result: '已完成核心系统上线，效率提升32%，超额完成目标',
    reason: ''
  },
  {
    id: 2,
    year: '2024',
    serialNumber: 2,
    weight: 25,
    project: '市场拓展项目',
    content: '全年新市场开拓和客户获取',
    target: '新增客户400家，营收增长20%',
    standard: '客户数量和营收目标达成率90%以上',
    responsible: ['李四'], // 修改为数组格式
    isCompleted: false, // 添加是否完成字段
    result: '新增客户350家，营收增长18%',
    reason: '受市场环境影响，客户获取难度增加'
  }
])

// 表格列定义
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
    key: 'reason',
    width: 200
  },
  {
    title: '操作',
    key: 'actions',
    width: 150,
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
    message.success('年度总结提交成功')
    reviewStatus.value = 'submitted'
  } catch (error) {
    message.error('提交失败')
  } finally {
    submitting.value = false
  }
}

// 年份变化处理
const handleYearChange = async () => {
  const selectedYear = currentYear.value
  console.log('年份变化:', selectedYear)
  
  // 自动加载对应年份的计划数据
  loading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    message.success(`已加载${selectedYear}年计划数据`)
    // 这里可以根据selectedYear加载对应的计划数据
    // 实际项目中应该调用API获取数据
  } catch (error) {
    message.error('加载计划数据失败')
  } finally {
    loading.value = false
  }
}

// 删除记录
const deleteRecord = (record: any) => {
  if (reviewStatus.value === 'approved') {
    message.error('审核通过的总结不允许删除')
    return
  }
  
  const index = summaries.value.findIndex(item => item.id === record.id)
  if (index > -1) {
    summaries.value.splice(index, 1)
    message.success('删除成功')
  }
}

// 增加新总结
const addNewSummary = () => {
  if (isSubmitted.value) {
    message.warning('总结已提交，无法添加新记录')
    return
  }
  
  const newId = Math.max(...summaries.value.map(item => item.id)) + 1
  const newSummary = {
    id: newId,
    year: currentYear.value,
    serialNumber: summaries.value.length + 1,
    weight: 0,
    project: '',
    content: '',
    target: '',
    standard: '',
    responsible: ['本人'],
    isCompleted: false,
    result: '',
    reason: ''
  }
  
  summaries.value.push(newSummary)
  message.success('已添加新的总结记录')
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

// 获取状态颜色
const getStatusColor = (status: string) => {
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
      return 'default'
  }
}

// 页面初始化
onMounted(() => {
  console.log('年度总结页面初始化')
})
</script>

<style scoped>
.annual-summaries {
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

.status-display {
  margin-top: 8px;
}

.status-label {
  margin-right: 8px;
}

.status-tag {
  margin-left: 8px;
}

:deep(.ant-table-tbody > tr > td) {
  padding: 8px !important;
}
</style> 