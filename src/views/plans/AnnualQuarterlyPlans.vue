<template>
  <div class="annual-quarterly-plans">
    <!-- 页面标题 -->
    <div class="page-header">
      <div class="header-content">
        <div class="title-area">
          <h2>年度季度计划</h2>
          <p>制定和管理年度、季度目标计划</p>
        </div>
        <div class="actions">
          <a-space>
            <a-select v-model:value="currentYear" style="width: 120px" @change="handleYearChange">
              <a-select-option value="2024">2024年</a-select-option>
              <a-select-option value="2025">2025年</a-select-option>
            </a-select>
            <a-select v-model:value="currentQuarter" style="width: 120px" @change="handleQuarterChange">
              <a-select-option value="">全年计划</a-select-option>
              <a-select-option value="Q1">Q1季度</a-select-option>
              <a-select-option value="Q2">Q2季度</a-select-option>
              <a-select-option value="Q3">Q3季度</a-select-option>
              <a-select-option value="Q4">Q4季度</a-select-option>
            </a-select>
            <a-button type="primary" @click="addPlan">
              <PlusOutlined />
              新增计划
            </a-button>
          </a-space>
        </div>
      </div>
    </div>

    <!-- 计划列表 -->
    <a-card title="计划列表">
      <a-table
        :dataSource="filteredPlans"
        :columns="planColumns"
        :loading="loading"
        :pagination="pagination"
        row-key="id"
        :scroll="{ x: 1500 }"
      >
        <template #bodyCell="{ column, record, index }">
          <template v-if="column.key === 'serialNumber'">
            {{ index + 1 }}
          </template>
          
          <template v-else-if="column.key === 'weight'">
            <a-input-number
              v-model:value="record.weight"
              :min="0"
              :max="100"
              style="width: 80px"
              @change="() => saveRecord(record)"
            />
          </template>

          <template v-else-if="column.key === 'project'">
            <a-input
              v-model:value="record.project"
              @blur="() => saveRecord(record)"
              @press-enter="() => saveRecord(record)"
            />
          </template>

          <template v-else-if="column.key === 'content'">
            <a-textarea
              v-model:value="record.content"
              :rows="2"
              @blur="() => saveRecord(record)"
            />
          </template>

          <template v-else-if="column.key === 'target'">
            <a-textarea
              v-model:value="record.target"
              :rows="2"
              @blur="() => saveRecord(record)"
            />
          </template>

          <template v-else-if="column.key === 'standard'">
            <a-textarea
              v-model:value="record.standard"
              :rows="2"
              @blur="() => saveRecord(record)"
            />
          </template>

          <template v-else-if="column.key === 'responsible'">
            <a-select
              v-model:value="record.responsible"
              style="width: 120px"
              @change="() => saveRecord(record)"
            >
              <a-select-option value="张三">张三</a-select-option>
              <a-select-option value="李四">李四</a-select-option>
              <a-select-option value="王五">王五</a-select-option>
            </a-select>
          </template>

          <template v-else-if="column.key === 'timeRange'">
            <a-range-picker
              v-model:value="record.timeRange"
              style="width: 200px"
              @change="() => saveRecord(record)"
            />
          </template>

          <template v-else-if="column.key === 'measures'">
            <a-textarea
              v-model:value="record.measures"
              :rows="2"
              @blur="() => saveRecord(record)"
            />
          </template>

          <template v-else-if="column.key === 'actions'">
            <a-space>
              <a-button size="small" @click="editPlan(record)">编辑</a-button>
              <a-popconfirm
                title="确定删除这条计划吗？"
                @confirm="deletePlan(record.id)"
              >
                <a-button size="small" danger>删除</a-button>
              </a-popconfirm>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { PlusOutlined } from '@ant-design/icons-vue'
import dayjs from 'dayjs'

// 页面状态
const loading = ref(false)
const currentYear = ref('2024')
const currentQuarter = ref('')

// 计划数据
const plans = ref([
  {
    id: 1,
    year: '2024',
    quarter: '',
    serialNumber: 1,
    weight: 30,
    project: '数字化转型项目',
    content: '推进公司全面数字化转型，提升运营效率',
    target: '完成核心系统数字化改造，效率提升30%',
    standard: '系统上线运行稳定，关键指标达到预期',
    responsible: '张三',
    timeRange: [dayjs('2024-01-01'), dayjs('2024-12-31')],
    measures: '组建专项团队，分阶段实施，加强培训'
  },
  {
    id: 2,
    year: '2024',
    quarter: 'Q1',
    serialNumber: 2,
    weight: 25,
    project: 'Q1市场拓展',
    content: '第一季度新市场开拓和客户获取',
    target: '新增客户100家，营收增长20%',
    standard: '客户数量和营收目标达成率90%以上',
    responsible: '李四',
    timeRange: [dayjs('2024-01-01'), dayjs('2024-03-31')],
    measures: '制定市场策略，增加销售人员，优化客户服务'
  }
])

// 表格列定义
const planColumns = [
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
    title: '操作',
    key: 'actions',
    width: 120,
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

// 过滤后的计划数据
const filteredPlans = computed(() => {
  return plans.value.filter(plan => {
    const yearMatch = plan.year === currentYear.value
    const quarterMatch = !currentQuarter.value || plan.quarter === currentQuarter.value
    return yearMatch && quarterMatch
  })
})

// 新增计划
const addPlan = () => {
  const newPlan = {
    id: Date.now(),
    year: currentYear.value,
    quarter: currentQuarter.value,
    serialNumber: filteredPlans.value.length + 1,
    weight: 0,
    project: '',
    content: '',
    target: '',
    standard: '',
    responsible: '',
    timeRange: [dayjs().startOf('year'), dayjs().endOf('year')],
    measures: ''
  }
  plans.value.push(newPlan)
  message.success('新增计划成功')
}

// 编辑计划
const editPlan = (record: any) => {
  message.info('编辑功能开发中...')
}

// 删除计划
const deletePlan = (id: number) => {
  const index = plans.value.findIndex(plan => plan.id === id)
  if (index > -1) {
    plans.value.splice(index, 1)
    message.success('删除成功')
  }
}

// 保存记录
const saveRecord = (record: any) => {
  message.success('保存成功')
}

// 年份变化处理
const handleYearChange = () => {
  console.log('年份变化:', currentYear.value)
}

// 季度变化处理
const handleQuarterChange = () => {
  console.log('季度变化:', currentQuarter.value)
}

// 页面初始化
onMounted(() => {
  pagination.total = filteredPlans.value.length
})
</script>

<style scoped>
.annual-quarterly-plans {
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

:deep(.ant-table-tbody > tr > td) {
  padding: 8px !important;
}
</style> 