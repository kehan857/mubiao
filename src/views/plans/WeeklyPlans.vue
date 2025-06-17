<template>
  <div class="weekly-plans">
    <!-- 页面标题 -->
    <div class="page-header">
      <div class="header-content">
        <div class="title-area">
          <h2>📅 周度计划管理</h2>
          <p>制定和管理周度工作计划</p>
          <!-- 状态显示 -->
          <div class="status-display">
            <span class="status-label">当前状态：</span>
            <a-tag 
              :style="{ 
                color: weekStatusInfo.color, 
                backgroundColor: weekStatusInfo.bgColor,
                border: `1px solid ${weekStatusInfo.color}`,
                fontWeight: '500'
              }"
            >
              {{ weekStatusInfo.text }}
            </a-tag>
          </div>
        </div>
        <div class="actions">
          <a-space>
            <a-button @click="showExampleModal = true">
              <EyeOutlined />
              查看填写样例
            </a-button>
            <a-date-picker
              v-model:value="currentWeek"
              picker="week"
              format="YYYY-第ww周"
              placeholder="选择周次"
              @change="handleWeekChange"
            />
          </a-space>
        </div>
      </div>
    </div>

    <!-- 周度计划表格 -->
    <a-card title="2024年第47周计划">
      <template #extra>
        <a-space>
          <a-button @click="addPlan" type="primary" :disabled="!canEdit">
            <PlusOutlined />
            新增计划
          </a-button>
          <a-button 
            @click="submitPlans" 
            :loading="submitting" 
            type="primary" 
            :disabled="!canSubmit"
            v-if="weekStatus === 'draft'"
          >
            <CheckOutlined />
            提交计划
          </a-button>
          <a-button 
            @click="withdrawPlans" 
            :loading="withdrawing" 
            :disabled="weekStatus !== 'reviewing'"
            v-if="weekStatus === 'reviewing'"
          >
            <RollbackOutlined />
            撤回计划
          </a-button>
          <a-button @click="batchDelete" :disabled="selectedRowKeys.length === 0 || !canEdit">
            <DeleteOutlined />
            批量删除
          </a-button>
        </a-space>
      </template>
      <a-table
        :dataSource="plans"
        :columns="planColumns"
        :loading="loading"
        :pagination="false"
        :row-selection="{ selectedRowKeys, onChange: handleSelectionChange }"
        row-key="id"
        :scroll="{ x: 1400 }"
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
              @change="() => handleDataChange(record)"
            />
          </template>

          <template v-else-if="column.key === 'project'">
            <a-input
              v-model:value="record.project"
              placeholder="输入工作项目"
              @blur="() => handleDataChange(record)"
            />
          </template>

          <template v-else-if="column.key === 'content'">
            <a-textarea
              v-model:value="record.content"
              :rows="2"
              placeholder="详细工作内容"
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
              placeholder="选择负责人"
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

          <template v-else-if="column.key === 'actions'">
            <a-popconfirm
              title="确定删除这条计划吗？"
              @confirm="deletePlan(record.id)"
            >
              <a-button size="small" danger>删除</a-button>
            </a-popconfirm>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 填写样例查看弹窗 -->
    <a-modal
      v-model:open="showExampleModal"
      title="📅 周度计划填写样例"
      width="1400px"
      :footer="null"
      :bodyStyle="{ maxHeight: '70vh', overflow: 'auto' }"
    >
      <a-tabs v-model:activeKey="currentExampleType">
        <a-tab-pane key="work" tab="💼 日常工作样例">
          <div class="example-content">
            <div class="example-header">
              <h4>日常工作周度计划样例</h4>
              <p class="example-description">适用于常规业务工作的周度计划安排</p>
            </div>
            
            <a-table
              :dataSource="workExamples"
              :columns="exampleColumns"
              :pagination="false"
              :scroll="{ x: 1400 }"
              size="small"
              class="example-table"
            />
          </div>
        </a-tab-pane>
        
        <a-tab-pane key="project" tab="🎯 项目推进样例">
          <div class="example-content">
            <div class="example-header">
              <h4>项目推进周度计划样例</h4>
              <p class="example-description">适用于项目管理和重点任务推进的周度计划</p>
            </div>
            
            <a-table
              :dataSource="projectExamples"
              :columns="exampleColumns"
              :pagination="false"
              :scroll="{ x: 1400 }"
              size="small"
              class="example-table"
            />
          </div>
        </a-tab-pane>
      </a-tabs>
      
      <div class="example-tips">
        <a-alert
          message="💡 周度计划制定提示"
          description="1. 合理安排时间，避免任务过载；2. 设定明确的完成标准；3. 预留时间处理突发事务；4. 及时调整和优化计划"
          type="info"
          show-icon
        />
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { message } from 'ant-design-vue'
import { PlusOutlined, SaveOutlined, CheckOutlined, DeleteOutlined, CalendarOutlined, FileTextOutlined, RollbackOutlined, EyeOutlined } from '@ant-design/icons-vue'
import dayjs from 'dayjs'

// 页面状态
const currentWeek = ref(dayjs())
const loading = ref(false)
const saving = ref(false)
const submitting = ref(false)
const withdrawing = ref(false)
const selectedRowKeys = ref<number[]>([])
const showExampleModal = ref(false)
const currentExampleType = ref('work')

// 周度计划整体状态
const weekStatus = ref<'draft' | 'reviewing' | 'approved' | 'rejected'>('draft')

// 状态显示配置
const statusConfig = {
  draft: { text: '草稿', color: '#595959', bgColor: '#f0f0f0' },
  reviewing: { text: '审核中', color: '#d46b08', bgColor: '#fff7e6' },
  approved: { text: '已通过', color: '#389e0d', bgColor: '#f6ffed' },
  rejected: { text: '退回修改', color: '#cf1322', bgColor: '#fff1f0' }
}

// 计划数据
const plans = ref([
  {
    id: 1,
    serialNumber: 1,
    weight: 40,
    project: '项目管理',
    content: '完成项目进度跟踪',
    target: '100%按时完成',
    standard: '零延期',
    responsible: '张三',
    timeRange: [dayjs().startOf('week'), dayjs().endOf('week')],
    measures: '每日跟进，及时调整'
  },
  {
    id: 2,
    serialNumber: 2,
    weight: 35,
    project: '团队协作',
    content: '优化团队沟通',
    target: '提升效率20%',
    standard: '会议时间减少',
    responsible: '李四',
    timeRange: [dayjs().startOf('week'), dayjs().endOf('week')],
    measures: '建立高效沟通机制'
  },
  {
    id: 3,
    serialNumber: 3,
    weight: 25,
    project: '流程优化',
    content: '改进工作流程',
    target: '减少重复工作',
    standard: '流程执行效率提升15%',
    responsible: '王五',
    timeRange: [dayjs().startOf('week'), dayjs().endOf('week')],
    measures: '流程梳理，制定标准化模板'
  }
])

// 计算属性
const weekStatusInfo = computed(() => statusConfig[weekStatus.value])

const totalWeight = computed(() => {
  return plans.value.reduce((sum, plan) => sum + (plan.weight || 0), 0)
})

const uniqueResponsibles = computed(() => {
  const responsibles = plans.value.map(plan => plan.responsible).filter(Boolean)
  return [...new Set(responsibles)]
})

const canEdit = computed(() => {
  return weekStatus.value === 'draft' || weekStatus.value === 'rejected'
})

const canSubmit = computed(() => {
  return weekStatus.value === 'draft' && plans.value.length > 0
})

// 格式化周度标题
const formatWeekTitle = (week: any) => {
  if (!week) return '请选择周次'
  return week.format('YYYY年第ww周') + '度计划'
}

// 计划模板列定义
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
    width: 100,
    fixed: 'right'
  }
]

// 样例表格列定义
const exampleColumns = [
  {
    title: '序号',
    dataIndex: 'serialNumber',
    key: 'serialNumber',
    width: 60,
    fixed: 'left'
  },
  {
    title: '权重(%)',
    dataIndex: 'weight',
    key: 'weight',
    width: 80
  },
  {
    title: '项目',
    dataIndex: 'project',
    key: 'project',
    width: 150
  },
  {
    title: '内容',
    dataIndex: 'content',
    key: 'content',
    width: 200
  },
  {
    title: '目标',
    dataIndex: 'target',
    key: 'target',
    width: 180
  },
  {
    title: '考核标准',
    dataIndex: 'standard',
    key: 'standard',
    width: 180
  },
  {
    title: '责任人',
    dataIndex: 'responsible',
    key: 'responsible',
    width: 100
  },
  {
    title: '实施措施',
    dataIndex: 'measures',
    key: 'measures',
    width: 200
  }
]

// 日常工作样例数据
const workExamples = ref([
  {
    id: 1,
    serialNumber: 1,
    weight: 30,
    project: '客户维护',
    content: '跟进重点客户需求，处理客户反馈问题',
    target: '完成5个重点客户回访，解决3个客户问题',
    standard: '客户满意度≥4.5分，问题解决及时率100%',
    responsible: '张三',
    measures: '1.制定客户回访计划 2.收集客户反馈 3.协调内部资源解决问题 4.跟踪处理结果'
  },
  {
    id: 2,
    serialNumber: 2,
    weight: 25,
    project: '报告编写',
    content: '完成月度业务分析报告和周度工作总结',
    target: '按时提交高质量的分析报告',
    standard: '报告数据准确，分析深入，按时提交',
    responsible: '李四',
    measures: '1.收集整理业务数据 2.进行数据分析和挖掘 3.编写报告内容 4.审核和完善'
  },
  {
    id: 3,
    serialNumber: 3,
    weight: 25,
    project: '团队会议',
    content: '组织部门例会，协调团队工作安排',
    target: '提升团队协作效率，明确工作重点',
    standard: '会议议程完整，行动项明确，执行到位',
    responsible: '王五',
    measures: '1.准备会议议程 2.组织会议讨论 3.记录会议纪要 4.跟踪行动项执行'
  }
])

// 项目推进样例数据
const projectExamples = ref([
  {
    id: 1,
    serialNumber: 1,
    weight: 40,
    project: '新产品开发',
    content: '推进新产品开发项目，完成关键里程碑',
    target: '完成产品原型设计，通过技术评审',
    standard: '原型功能完整，技术方案可行，评审通过',
    responsible: '项目经理',
    measures: '1.产品需求分析 2.技术方案设计 3.原型开发 4.内部评审'
  },
  {
    id: 2,
    serialNumber: 2,
    weight: 30,
    project: '系统测试',
    content: '执行系统集成测试，发现和修复问题',
    target: '完成测试用例执行，问题修复率≥95%',
    standard: '测试覆盖率100%，严重问题清零',
    responsible: '测试负责人',
    measures: '1.编写测试用例 2.执行功能测试 3.记录和跟踪问题 4.验证修复结果'
  }
])

// 新增计划
const addPlan = () => {
  const newPlan = {
    id: Date.now(),
    serialNumber: plans.value.length + 1,
    weight: 0,
    project: '',
    content: '',
    target: '',
    standard: '',
    responsible: '',
    timeRange: [currentWeek.value?.startOf('week'), currentWeek.value?.endOf('week')],
    measures: ''
  }
  plans.value.push(newPlan)
  message.success('新增计划成功')
}

// 删除计划
const deletePlan = (id: number) => {
  const index = plans.value.findIndex(plan => plan.id === id)
  if (index > -1) {
    plans.value.splice(index, 1)
    message.success('删除成功')
  }
}

// 批量删除
const batchDelete = () => {
  if (selectedRowKeys.value.length === 0) {
    message.warning('请选择要删除的计划')
    return
  }
  
  plans.value = plans.value.filter(plan => !selectedRowKeys.value.includes(plan.id))
  selectedRowKeys.value = []
  message.success(`已删除选中的计划`)
}

// 选择变化处理
const handleSelectionChange = (keys: number[]) => {
  selectedRowKeys.value = keys
}

// 数据变化处理
const handleDataChange = (record: any) => {
  console.log('数据变化:', record)
}

// 保存计划
const savePlans = async () => {
  saving.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    message.success('计划保存成功')
  } catch (error) {
    message.error('保存失败')
  } finally {
    saving.value = false
  }
}

// 周次变化处理
const handleWeekChange = (week: any) => {
  currentWeek.value = week
  if (week) {
    console.log('周次变化:', week.format('YYYY-第ww周'))
    // 这里可以根据周次加载对应的计划数据
  }
}

// 提交计划函数
const submitPlans = async () => {
  try {
    submitting.value = true
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 整个周度的计划状态改为审核中
    weekStatus.value = 'reviewing'
    
    message.success('计划提交成功，等待审核')
  } catch (error) {
    message.error('提交失败，请重试')
  } finally {
    submitting.value = false
  }
}

// 撤回计划函数
const withdrawPlans = async () => {
  try {
    withdrawing.value = true
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 整个周度的计划状态改为草稿
    weekStatus.value = 'draft'
    
    message.success('计划撤回成功，可以继续编辑')
  } catch (error) {
    message.error('撤回失败，请重试')
  } finally {
    withdrawing.value = false
  }
}

// 页面初始化
onMounted(() => {
  console.log('周度计划页面初始化')
})
</script>

<style scoped>
.weekly-plans {
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

.plan-overview-card {
  margin-bottom: 16px;
  padding: 8px 0;
}

.overview-content {
  display: flex;
  justify-content: space-around;
  align-items: center;
  flex-wrap: wrap;
}

.overview-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.label {
  font-size: 14px;
  color: #666;
}

.value {
  font-size: 14px;
  font-weight: 600;
  color: #1890ff;
}

.highlight {
  color: #52c41a;
}

/* 周度状态卡片样式 */
.week-status-card {
  border-left: 4px solid #1890ff;
}

.week-info {
  padding: 8px 0;
}

.week-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.week-title {
  display: flex;
  align-items: center;
  font-size: 18px;
  font-weight: 600;
  color: #1890ff;
}

.week-title span {
  margin-left: 8px;
}

.week-stats {
  display: flex;
  gap: 32px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-label {
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 16px;
  font-weight: 600;
  color: #1890ff;
}

.table-title {
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: 500;
}

.table-title span {
  margin-left: 8px;
}

:deep(.ant-table-tbody > tr > td) {
  padding: 8px !important;
}
</style> 