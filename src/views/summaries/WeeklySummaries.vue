<template>
  <div class="weekly-summaries">
    <!-- 页面标题 -->
    <div class="page-header">
      <div class="header-content">
        <div class="title-area">
          <h2>周度总结</h2>
          <p>填写周度工作总结和自评</p>
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
            <a-date-picker
              v-model:value="currentWeek"
              picker="week"
              format="YYYY-第ww周"
              placeholder="选择周次"
              @change="handleWeekChange"
            />
            <a-button type="primary" @click="submitSummary" :loading="submitting">
              <CheckOutlined />
              提交总结
            </a-button>
          </a-space>
        </div>
      </div>
    </div>

    <!-- 总结表格 -->
    <a-card title="周度总结">
      <template #extra>
        <a-space>
          <a-button 
            type="primary" 
            @click="addNewSummary"
            :disabled="reviewStatus !== 'draft'"
          >
            <PlusOutlined />
            增加总结
          </a-button>
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
              placeholder="工作项目"
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
              placeholder="本周目标"
              @blur="() => handleDataChange(record)"
            />
          </template>

          <template v-else-if="column.key === 'standard'">
            <a-textarea
              v-model:value="record.standard"
              :rows="2"
              placeholder="完成标准"
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
              placeholder="执行措施"
              @blur="() => handleDataChange(record)"
            />
          </template>

          <template v-else-if="column.key === 'isCompleted'">
            <a-select
              v-model:value="record.isCompleted"
              style="width: 120px"
              @change="() => handleDataChange(record)"
            >
              <a-select-option value="true">已完成</a-select-option>
              <a-select-option value="false">未完成</a-select-option>
            </a-select>
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
            placeholder="请填写本周工作的总体总结和下周工作计划..."
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
const currentWeek = ref(dayjs())
const overallScore = ref(0)
const summaryDescription = ref('')
const reviewStatus = ref<'draft' | 'reviewing' | 'approved' | 'rejected'>('draft')

// 状态配置
const statusConfig = {
  draft: { text: '草稿', color: '#595959', bgColor: '#f0f0f0' },
  reviewing: { text: '审核中', color: '#d46b08', bgColor: '#fff7e6' },
  approved: { text: '已通过', color: '#389e0d', bgColor: '#f6ffed' },
  rejected: { text: '退回修改', color: '#cf1322', bgColor: '#fff1f0' }
}

// 总结数据
const summaryData = ref([
  {
    id: 1,
    serialNumber: 1,
    weight: 40,
    project: '产品需求分析',
    content: '收集用户反馈，分析产品改进需求',
    target: '完成用户调研报告，提出3个改进建议',
    standard: '调研样本不少于100个，建议具有可行性',
    responsible: '张三',
    timeRange: [dayjs().startOf('week'), dayjs().endOf('week')],
    measures: '发放调研问卷，组织用户访谈，数据分析',
    isCompleted: true,
    result: '完成120个用户调研，整理出详细报告，提出5个改进建议',
    unfinishedReason: ''
  },
  {
    id: 2,
    serialNumber: 2,
    weight: 35,
    project: '代码开发',
    content: '完成新功能模块的开发工作',
    target: '完成用户管理模块的前后端开发',
    standard: '功能完整，通过单元测试，代码审查合格',
    responsible: '李四',
    timeRange: [dayjs().startOf('week'), dayjs().endOf('week')],
    measures: '编写代码，单元测试，代码review',
    isCompleted: true,
    result: '用户管理模块开发完成，单元测试通过率100%，代码review合格',
    unfinishedReason: ''
  },
  {
    id: 3,
    serialNumber: 3,
    weight: 25,
    project: '文档撰写',
    content: '完善项目技术文档和用户手册',
    target: '更新API文档，编写用户操作指南',
    standard: '文档内容准确，结构清晰，易于理解',
    responsible: '王五',
    timeRange: [dayjs().startOf('week'), dayjs().endOf('week')],
    measures: '梳理功能点，编写文档，内部review',
    isCompleted: false,
    result: 'API文档更新完成，用户操作指南编写完成并通过内部审核',
    unfinishedReason: '部分功能文档需要进一步完善'
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
  } catch (error) {
    message.error('提交失败')
  } finally {
    submitting.value = false
  }
}

// 周次变化处理
const handleWeekChange = async () => {
  const selectedWeek = currentWeek.value?.format('YYYY-第ww周')
  console.log('周次变化:', selectedWeek)
  
  // 自动加载对应周次的计划数据
  loading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    message.success(`已加载${selectedWeek}计划数据`)
    // 这里可以根据selectedWeek加载对应的计划数据
    // 实际项目中应该调用API获取数据
  } catch (error) {
    message.error('加载计划数据失败')
  } finally {
    loading.value = false
  }
}

// 删除记录
const deleteRecord = (record: any) => {
  const index = summaryData.value.findIndex(item => item.id === record.id)
  if (index > -1) {
    summaryData.value.splice(index, 1)
    message.success('删除成功')
  }
}

// 添加新总结
const addNewSummary = () => {
  if (reviewStatus.value !== 'draft') {
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
    responsible: '本人',
    timeRange: [currentWeek.value.startOf('week'), currentWeek.value.endOf('week')],
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
  console.log('周度总结页面初始化')
})
</script>

<style scoped>
.weekly-summaries {
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