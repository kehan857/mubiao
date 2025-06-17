<template>
  <div class="annual-quarterly-summaries">
    <!-- 页面标题 -->
    <div class="page-header">
      <div class="header-content">
        <div class="title-area">
          <h2>年度季度总结</h2>
          <p>填写年度、季度工作总结和自评</p>
        </div>
        <div class="actions">
          <a-space>
            <a-select v-model:value="currentYear" style="width: 120px" @change="handleYearChange">
              <a-select-option value="2024">2024年</a-select-option>
              <a-select-option value="2025">2025年</a-select-option>
            </a-select>
            <a-select v-model:value="currentQuarter" style="width: 120px" @change="handleQuarterChange">
              <a-select-option value="">全年总结</a-select-option>
              <a-select-option value="Q1">Q1季度</a-select-option>
              <a-select-option value="Q2">Q2季度</a-select-option>
              <a-select-option value="Q3">Q3季度</a-select-option>
              <a-select-option value="Q4">Q4季度</a-select-option>
            </a-select>
            <a-button @click="loadPlanData">
              <ReloadOutlined />
              加载计划数据
            </a-button>
            <a-button type="primary" @click="submitSummary" :loading="submitting">
              <CheckOutlined />
              提交总结
            </a-button>
          </a-space>
        </div>
      </div>
    </div>

    <!-- 总结表格 -->
    <a-card title="年度季度总结">
      <template #extra>
        <a-space>
          <span>总体自评分：</span>
          <a-input-number
            v-model:value="overallScore"
            :min="0"
            :max="100"
            placeholder="总分"
            style="width: 100px"
          />
          <span>分</span>
        </a-space>
      </template>

      <a-table
        :dataSource="summaryData"
        :columns="summaryColumns"
        :loading="loading"
        :pagination="false"
        row-key="id"
        :scroll="{ x: 1800 }"
      >
        <template #bodyCell="{ column, record, index }">
          <template v-if="column.key === 'serialNumber'">
            {{ index + 1 }}
          </template>
          
          <template v-else-if="column.key === 'weight'">
            <span>{{ record.weight }}%</span>
          </template>

          <template v-else-if="column.key === 'project'">
            <a-input
              v-model:value="record.project"
              placeholder="项目名称"
              @blur="() => handleDataChange(record)"
            />
          </template>

          <template v-else-if="column.key === 'content'">
            <a-textarea
              v-model:value="record.content"
              :rows="2"
              placeholder="工作内容"
              @blur="() => handleDataChange(record)"
            />
          </template>

          <template v-else-if="column.key === 'target'">
            <a-textarea
              v-model:value="record.target"
              :rows="2"
              placeholder="目标"
              @blur="() => handleDataChange(record)"
            />
          </template>

          <template v-else-if="column.key === 'standard'">
            <a-textarea
              v-model:value="record.standard"
              :rows="2"
              placeholder="考核标准"
              @blur="() => handleDataChange(record)"
            />
          </template>

          <template v-else-if="column.key === 'responsible'">
            <a-select
              v-model:value="record.responsible"
              style="width: 120px"
              @change="() => handleDataChange(record)"
            >
              <a-select-option value="张三">张三</a-select-option>
              <a-select-option value="李四">李四</a-select-option>
              <a-select-option value="王五">王五</a-select-option>
              <a-select-option value="赵六">赵六</a-select-option>
            </a-select>
          </template>

          <template v-else-if="column.key === 'timeRange'">
            <a-range-picker
              v-model:value="record.timeRange"
              style="width: 200px"
              @change="() => handleDataChange(record)"
            />
          </template>

          <template v-else-if="column.key === 'measures'">
            <a-textarea
              v-model:value="record.measures"
              :rows="2"
              placeholder="实施措施"
              @blur="() => handleDataChange(record)"
            />
          </template>

          <template v-else-if="column.key === 'result'">
            <a-textarea
              v-model:value="record.result"
              :rows="3"
              placeholder="完成结果（总结内容）"
              @blur="() => handleDataChange(record)"
            />
          </template>

          <template v-else-if="column.key === 'unfinishedReason'">
            <a-textarea
              v-model:value="record.unfinishedReason"
              :rows="2"
              placeholder="未完成原因"
              @blur="() => handleDataChange(record)"
            />
          </template>

          <template v-else-if="column.key === 'selfScore'">
            <a-input-number
              v-model:value="record.selfScore"
              :min="0"
              :max="100"
              style="width: 80px"
              @change="() => handleDataChange(record)"
            />
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
            placeholder="请填写本期工作的总体总结和下期工作计划..."
          />
        </a-form-item>
      </a-form>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { ReloadOutlined, CheckOutlined } from '@ant-design/icons-vue'
import dayjs from 'dayjs'

// 页面状态
const loading = ref(false)
const submitting = ref(false)
const currentYear = ref('2024')
const currentQuarter = ref('')
const overallScore = ref(0)
const summaryDescription = ref('')

// 总结数据
const summaryData = ref([
  {
    id: 1,
    serialNumber: 1,
    weight: 30,
    project: '数字化转型项目',
    content: '推进公司全面数字化转型，提升运营效率',
    target: '完成核心系统数字化改造，效率提升30%',
    standard: '系统上线运行稳定，关键指标达到预期',
    responsible: '张三',
    timeRange: [dayjs('2024-01-01'), dayjs('2024-12-31')],
    measures: '组建专项团队，分阶段实施，加强培训',
    result: '已完成核心系统改造，效率提升达到35%，超出预期目标',
    unfinishedReason: '',
    selfScore: 95
  },
  {
    id: 2,
    serialNumber: 2,
    weight: 25,
    project: 'Q1市场拓展',
    content: '第一季度新市场开拓和客户获取',
    target: '新增客户100家，营收增长20%',
    standard: '客户数量和营收目标达成率90%以上',
    responsible: '李四',
    timeRange: [dayjs('2024-01-01'), dayjs('2024-03-31')],
    measures: '制定市场策略，增加销售人员，优化客户服务',
    result: '新增客户120家，营收增长25%，超额完成目标',
    unfinishedReason: '',
    selfScore: 98
  }
])

// 总结表格列定义（包含计划字段和总结字段）
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
    title: '自评分',
    key: 'selfScore',
    width: 100,
    fixed: 'right'
  }
]

// 加载计划数据
const loadPlanData = async () => {
  loading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    message.success('计划数据加载成功')
  } catch (error) {
    message.error('加载失败')
  } finally {
    loading.value = false
  }
}

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
  } catch (error) {
    message.error('提交失败')
  } finally {
    submitting.value = false
  }
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
  console.log('年度季度总结页面初始化')
})
</script>

<style scoped>
.annual-quarterly-summaries {
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