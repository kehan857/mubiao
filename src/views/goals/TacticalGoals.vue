<template>
  <div class="tactical-goals">
    <!-- 页面标题和操作 -->
    <div class="page-header">
      <div class="header-content">
        <div class="title-area">
          <h2>🎯 战术规划管理</h2>
          <p>制定和管理月度工作计划，承接上级战略目标</p>
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
            <a-button @click="showTemplateModal = true">
              <BookOutlined />
              模板库
            </a-button>
            <a-button type="primary" @click="addNewRow" :disabled="!canEdit">
              <PlusOutlined />
              新增计划
            </a-button>
            <a-button @click="saveAllChanges" :loading="saving">
              <SaveOutlined />
              保存全部
            </a-button>
          </a-space>
        </div>
      </div>
    </div>

    <!-- 月份规划状态卡片 -->
    <a-card class="month-status-card" :style="{ marginBottom: '16px' }">
      <div class="month-info">
        <div class="month-header">
          <div class="month-title">
            <CalendarOutlined />
            <span>{{ formatMonthTitle(currentMonth) }}</span>
          </div>
          <div class="month-status">
            <a-tag :color="monthStatusInfo.color" class="status-tag">
              {{ monthStatusInfo.text }}
            </a-tag>
          </div>
        </div>
        <div class="month-stats">
          <div class="stat-item">
            <span class="stat-label">目标总数</span>
            <span class="stat-value">{{ tacticalGoals.length }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">总权重</span>
            <span class="stat-value">{{ totalWeight }}%</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">完成度</span>
            <span class="stat-value">{{ averageProgress }}%</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">负责人数</span>
            <span class="stat-value">{{ uniqueResponsibles.length }}</span>
          </div>
        </div>
      </div>
    </a-card>

    <!-- 筛选区域 -->
    <a-card style="margin-bottom: 16px">
      <a-row :gutter="16">
        <a-col :span="6">
          <a-select
            v-model:value="viewMode"
            placeholder="查看模式"
            style="width: 100%"
            @change="handleViewModeChange"
          >
            <a-select-option value="plan">计划制定</a-select-option>
            <a-select-option value="summary">月末总结</a-select-option>
            <a-select-option value="compare">计划对比</a-select-option>
          </a-select>
        </a-col>
        <a-col :span="6">
          <a-select
            v-model:value="filters.responsible"
            placeholder="选择负责人"
            style="width: 100%"
            @change="handleFilterChange"
          >
            <a-select-option value="">全部负责人</a-select-option>
            <a-select-option v-for="person in uniqueResponsibles" :key="person" :value="person">
              {{ person }}
            </a-select-option>
          </a-select>
        </a-col>
        <a-col :span="6">
          <a-select
            v-model:value="filters.priority"
            placeholder="选择权重等级"
            style="width: 100%"
            @change="handleFilterChange"
          >
            <a-select-option value="">全部权重</a-select-option>
            <a-select-option value="high">高权重(≥30%)</a-select-option>
            <a-select-option value="medium">中权重(15-29%)</a-select-option>
            <a-select-option value="low">低权重(<15%)</a-select-option>
          </a-select>
        </a-col>
        <a-col :span="6">
          <a-input-search
            v-model:value="filters.keyword"
            placeholder="搜索目标内容"
            @search="handleFilterChange"
          />
        </a-col>
      </a-row>
    </a-card>

    <!-- 月末总结模式 -->
    <div v-if="viewMode === 'summary'">
      <!-- 总结提示 -->
      <a-alert
        message="月末总结填写"
        description="请根据月初制定的计划，填写实际完成情况、未完成原因等总结信息。原计划内容将保持不变。"
        type="info"
        show-icon
        style="margin-bottom: 16px"
      />

      <!-- 总结表格 -->
      <a-card title="月度工作总结">
        <template #extra>
          <a-space>
            <a-button @click="saveAllSummaries" :loading="saving">
              <SaveOutlined />
              保存全部总结
            </a-button>
            <a-button type="primary" @click="submitSummary">
              提交总结
            </a-button>
          </a-space>
        </template>

        <a-table
          :dataSource="tacticalGoals"
          :columns="summaryColumns"
          :loading="loading"
          :pagination="false"
          size="middle"
          :scroll="{ x: 1500 }"
        >
          <template #bodyCell="{ column, record, index }">
            <!-- 只读的计划字段 -->
            <template v-if="column.key === 'project'">
              <span class="readonly-field">{{ record.project }}</span>
            </template>
            <template v-else-if="column.key === 'content'">
              <span class="readonly-field">{{ record.content }}</span>
            </template>
            <template v-else-if="column.key === 'target'">
              <span class="readonly-field">{{ record.target }}</span>
            </template>
            <template v-else-if="column.key === 'measures'">
              <span class="readonly-field">{{ record.measures }}</span>
            </template>

            <!-- 可编辑的总结字段 -->
            <template v-else-if="column.key === 'result'">
              <a-textarea
                v-model:value="record.result"
                :rows="3"
                placeholder="请填写实际完成结果"
                @change="markRowChanged(record.id)"
              />
            </template>
            <template v-else-if="column.key === 'reason'">
              <a-textarea
                v-model:value="record.reason"
                :rows="2"
                placeholder="未完成请填写原因"
                @change="markRowChanged(record.id)"
              />
            </template>

            <template v-else-if="column.key === 'actions'">
              <a-space>
                <a-button
                  type="text"
                  size="small"
                  @click="saveSingleSummary(record)"
                  :loading="record.saving"
                  v-if="changedRows.has(record.id)"
                >
                  <SaveOutlined />
                </a-button>
                <a-button
                  type="text"
                  size="small"
                  @click="viewPlanDetail(record)"
                >
                  查看计划
                </a-button>
              </a-space>
            </template>
          </template>
        </a-table>
      </a-card>
    </div>

    <!-- 计划对比模式 -->
    <div v-else-if="viewMode === 'compare'">
      <a-card title="计划与总结对比">
        <a-table
          :dataSource="tacticalGoals"
          :columns="compareColumns"
          :loading="loading"
          :pagination="false"
          size="middle"
          :scroll="{ x: 2000 }"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'project'">
              <span class="compare-field">{{ record.project }}</span>
            </template>
            <template v-else-if="column.key === 'planTarget'">
              <div class="plan-content">
                <div><strong>目标:</strong> {{ record.target }}</div>
                <div><strong>措施:</strong> {{ record.measures }}</div>
              </div>
            </template>
            <template v-else-if="column.key === 'actualResult'">
              <div class="result-content">
                <div><strong>完成结果:</strong> {{ record.result || '未填写' }}</div>
                <div v-if="record.reason"><strong>未完成原因:</strong> {{ record.reason }}</div>
              </div>
            </template>
            <template v-else-if="column.key === 'scoreComparison'">
              <div class="score-comparison">
                <div>自评: {{ record.selfScore || '--' }}分</div>
                <div>上级评分: {{ record.score || '--' }}分</div>
              </div>
            </template>
          </template>
        </a-table>
      </a-card>
    </div>

    <!-- 原有的计划制定模式 -->
    <div v-else>
      <!-- 原有的表格内容 -->
      <a-card title="月度工作计划">
        <template #extra>
          <a-space>
            <a-button @click="addNewRow" type="dashed">
              <PlusOutlined />
              新增
            </a-button>
            <a-button @click="saveAllChanges" :loading="saving">
              <SaveOutlined />
              保存全部
            </a-button>
            <a-button type="primary" @click="submitPlan">
              提交计划
            </a-button>
          </a-space>
        </template>

        <!-- 原有表格代码保持不变 -->
        <a-table
          :dataSource="tacticalGoals"
          :columns="editableColumns"
          :loading="loading"
          :pagination="false"
          size="middle"
          :scroll="{ x: 1800 }"
        >
          <template #bodyCell="{ column, record, index }">
            <!-- 序号列 -->
            <template v-if="column.key === 'index'">
              {{ index + 1 }}
            </template>

            <!-- 可编辑的项目列 -->
            <template v-else-if="column.key === 'project'">
              <a-input
                v-model:value="record.project"
                placeholder="请输入项目名称"
                @change="markAsChanged(record.id)"
                size="small"
              />
            </template>

            <!-- 可编辑的内容列 -->
            <template v-else-if="column.key === 'content'">
              <a-textarea
                v-model:value="record.content"
                placeholder="请输入内容描述"
                :rows="2"
                @change="markAsChanged(record.id)"
                size="small"
              />
            </template>

            <!-- 可编辑的权重列 -->
            <template v-else-if="column.key === 'weight'">
              <a-input-number
                v-model:value="record.weight"
                :min="1"
                :max="100"
                @change="markAsChanged(record.id)"
                size="small"
                style="width: 100%"
              />
            </template>

            <!-- 可编辑的优先级列 -->
            <template v-else-if="column.key === 'priority'">
              <a-select
                v-model:value="record.priority"
                @change="markAsChanged(record.id)"
                size="small"
                style="width: 100%"
              >
                <a-select-option value="high">高</a-select-option>
                <a-select-option value="medium">中</a-select-option>
                <a-select-option value="low">低</a-select-option>
              </a-select>
            </template>

            <!-- 可编辑的目标列 -->
            <template v-else-if="column.key === 'target'">
              <a-input
                v-model:value="record.target"
                placeholder="请输入目标"
                @change="markAsChanged(record.id)"
                size="small"
              />
            </template>

            <!-- 可编辑的考核标准列 -->
            <template v-else-if="column.key === 'criteria'">
              <a-input
                v-model:value="record.criteria"
                placeholder="请输入考核标准"
                @change="markAsChanged(record.id)"
                size="small"
              />
            </template>

            <!-- 可编辑的实施措施列 -->
            <template v-else-if="column.key === 'measures'">
              <a-textarea
                v-model:value="record.measures"
                placeholder="请输入实施措施"
                :rows="2"
                @change="markAsChanged(record.id)"
                size="small"
              />
            </template>

            <!-- 可编辑的时间范围列 -->
            <template v-else-if="column.key === 'timeRange'">
              <a-range-picker
                v-model:value="record.timeRangeDate"
                @change="(dates) => handleTimeRangeChange(record, dates)"
                size="small"
                style="width: 100%"
              />
            </template>

            <!-- 关联目标列 -->
            <template v-else-if="column.key === 'relatedGoal'">
              <a-select
                v-model:value="record.relatedGoalId"
                @change="markAsChanged(record.id)"
                size="small"
                style="width: 100%"
                placeholder="选择关联目标"
              >
                <a-select-option
                  v-for="goal in parentGoals"
                  :key="goal.id"
                  :value="goal.id"
                >
                  {{ goal.title }}
                </a-select-option>
              </a-select>
            </template>

            <!-- 完成结果列 -->
            <template v-else-if="column.key === 'result'">
              <a-input
                v-model:value="record.result"
                placeholder="请输入完成结果"
                @change="markAsChanged(record.id)"
                size="small"
              />
            </template>

            <!-- 未完成原因列 -->
            <template v-else-if="column.key === 'reason'">
              <a-input
                v-model:value="record.reason"
                placeholder="请输入未完成原因"
                @change="markAsChanged(record.id)"
                size="small"
              />
            </template>

            <!-- 上级评分列 -->
            <template v-else-if="column.key === 'score'">
              <a-input-number
                v-model:value="record.score"
                :min="0"
                :max="100"
                @change="markAsChanged(record.id)"
                size="small"
                style="width: 100%"
              />
            </template>

            <!-- 状态列 -->
            <template v-else-if="column.key === 'status'">
              <a-tag :color="getStatusColor(record.status)">
                {{ getStatusText(record.status) }}
              </a-tag>
            </template>

            <!-- 进度列 -->
            <template v-else-if="column.key === 'progress'">
              <a-progress :percent="record.progress || 0" size="small" style="width: 100px" />
            </template>

            <!-- 操作列 -->
            <template v-else-if="column.key === 'actions'">
              <a-space>
                <a-button 
                  type="text" 
                  size="small" 
                  @click="saveRow(record)"
                  :loading="record.saving"
                  v-if="changedRows.has(record.id)"
                >
                  <SaveOutlined />
                </a-button>
                <a-button type="text" size="small" @click="deleteRow(record)" danger>
                  <DeleteOutlined />
                </a-button>
                <a-dropdown>
                  <template #overlay>
                    <a-menu @click="(e) => handleRowAction(e, record)">
                      <a-menu-item key="submit" v-if="record.status === 'draft'">
                        提交审批
                      </a-menu-item>
                      <a-menu-item key="complete" v-if="record.status === 'in-progress'">
                        标记完成
                      </a-menu-item>
                      <a-menu-item key="copy">复制</a-menu-item>
                    </a-menu>
                  </template>
                  <a-button type="text" size="small">
                    更多 <DownOutlined />
                  </a-button>
                </a-dropdown>
              </a-space>
            </template>
          </template>
        </a-table>
      </a-card>
    </div>

    <!-- 模板选择弹窗 -->
    <a-modal
      v-model:open="showTemplateModal"
      title="选择模板"
      width="800px"
      @ok="handleSelectTemplate"
      @cancel="showTemplateModal = false"
    >
      <TemplateSelector
        ref="templateSelectorRef"
        type="monthly-plan"
        @select="handleTemplateSelect"
      />
    </a-modal>

    <!-- 整体自评分弹窗 -->
    <a-modal
      v-model:open="showOverallScoreModal"
      title="月度工作总结提交"
      width="600px"
      @ok="saveOverallScore"
      @cancel="showOverallScoreModal = false"
    >
      <a-form layout="vertical">
        <a-form-item label="整体自评分" :rules="[{ required: true, message: '请输入自评分' }]">
          <a-input-number
            v-model:value="overallSelfScore"
            :min="0"
            :max="100"
            placeholder="请输入0-100分"
            style="width: 100%"
          />
          <div style="margin-top: 8px; color: #666; font-size: 12px">
            请根据本月整体工作完成情况进行客观评分
          </div>
        </a-form-item>
        
        <a-form-item label="总结说明（可选）">
          <a-textarea
            v-model:value="overallSummary"
            :rows="4"
            placeholder="请简要总结本月工作亮点、不足及改进建议"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'
import {
  PlusOutlined,
  BookOutlined,
  DownOutlined,
  SaveOutlined,
  DeleteOutlined,
  CalendarOutlined
} from '@ant-design/icons-vue'
import TemplateSelector from '@/components/TemplateSelector.vue'

// 页面状态
const loading = ref(false)
const saving = ref(false)
const showTemplateModal = ref(false)
const viewMode = ref('plan')  // 新增：视图模式
const changedRows = ref(new Set())  // 新增：跟踪修改的行
const currentMonth = ref(dayjs('2024-12'))  // 当前选择的月份

// 月度战术规划整体状态
const monthStatus = ref<'draft' | 'reviewing' | 'approved' | 'rejected'>('draft')

// 筛选条件
const filters = reactive({
  period: '',
  status: '',
  keyword: '',
  responsible: '',
  priority: ''
})

// 状态映射
const statusMap = {
  draft: { text: '草稿', color: 'default' },
  reviewing: { text: '审核中', color: 'processing' },
  approved: { text: '已通过', color: 'success' },
  rejected: { text: '已驳回', color: 'error' }
}

// 计算属性
const monthStatusInfo = computed(() => statusMap[monthStatus.value])

const totalWeight = computed(() => {
  return tacticalGoals.value.reduce((sum, goal) => sum + (goal.weight || 0), 0)
})

const averageProgress = computed(() => {
  if (tacticalGoals.value.length === 0) return 0
  const totalProgress = tacticalGoals.value.reduce((sum, goal) => sum + (goal.progress || 0), 0)
  return Math.round(totalProgress / tacticalGoals.value.length)
})

const uniqueResponsibles = computed(() => {
  const responsibles = tacticalGoals.value.map(goal => goal.responsible).filter(Boolean)
  return [...new Set(responsibles)]
})

const canEdit = computed(() => {
  return monthStatus.value === 'draft' || monthStatus.value === 'rejected'
})

// 格式化月份标题
const formatMonthTitle = (month: any) => {
  if (!month) return '请选择月份'
  return month.format('YYYY年MM月') + '度战术目标'
}

// 处理月份变化
const handleMonthChange = (month: any) => {
  currentMonth.value = month
  if (month) {
    console.log('月份变化:', month.format('YYYY-MM'))
    // 这里可以根据月份加载对应的战术目标数据
  }
}

// 可编辑表格列定义
const editableColumns = [
  {
    title: '序号',
    key: 'index',
    width: 60,
    fixed: 'left'
  },
  {
    title: '项目',
    key: 'project',
    width: 150,
    fixed: 'left'
  },
  {
    title: '内容',
    key: 'content',
    width: 200
  },
  {
    title: '权重(%)',
    key: 'weight',
    width: 100
  },
  {
    title: '优先级',
    key: 'priority',
    width: 100
  },
  {
    title: '目标',
    key: 'target',
    width: 150
  },
  {
    title: '考核标准',
    key: 'criteria',
    width: 150
  },
  {
    title: '实施措施',
    key: 'measures',
    width: 200
  },
  {
    title: '计划时间',
    key: 'timeRange',
    width: 200
  },
  {
    title: '关联目标',
    key: 'relatedGoal',
    width: 150
  },
  {
    title: '完成结果',
    key: 'result',
    width: 200
  },
  {
    title: '未完成原因',
    key: 'reason',
    width: 150
  },
  {
    title: '上级评分',
    key: 'score',
    width: 100
  },
  {
    title: '状态',
    key: 'status',
    width: 100
  },
  {
    title: '进度',
    key: 'progress',
    width: 100
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

// 上级目标数据
const parentGoals = ref([
  {
    id: 1,
    title: '提升产品市场竞争力',
    description: '通过产品创新和用户体验优化，提升在市场中的竞争优势',
    period: '2024年',
    progress: 65
  },
  {
    id: 2,
    title: '技术架构升级',
    description: '完成核心系统的技术架构升级，提升系统性能和稳定性',
    period: '2024年Q1',
    progress: 80
  }
])

// 月度计划数据
const plans = ref([
  {
    id: 1,
    project: '用户体验优化',
    content: '完成主要功能页面的用户体验优化，提升用户满意度',
    weight: 30,
    priority: 'high',
    status: 'in-progress',
    progress: 70,
    target: '用户满意度提升10%',
    criteria: '用户满意度调研达到90%以上',
    measures: '进行用户调研，优化界面设计，改进交互流程',
    timeRangeDate: [dayjs('2024-01-01'), dayjs('2024-01-31')],
    timeRange: '2024-01-01 ~ 2024-01-31',
    relatedGoalId: 1,
    result: '已完成主要页面优化，用户反馈良好',
    reason: '',
    selfScore: 85,
    responsible: '张三'
  },
  {
    id: 2,
    project: '系统性能优化',
    content: '优化核心模块性能，提升系统响应速度',
    weight: 25,
    priority: 'medium',
    status: 'approved',
    progress: 0,
    target: '响应时间减少30%',
    criteria: '系统平均响应时间小于2秒',
    measures: '代码优化，数据库查询优化，缓存策略调整',
    timeRangeDate: [dayjs('2024-02-01'), dayjs('2024-02-28')],
    timeRange: '2024-02-01 ~ 2024-02-28',
    relatedGoalId: 2,
    result: '',
    reason: '',
    selfScore: null,
    responsible: '李四'
  },
  {
    id: 3,
    project: '新功能开发',
    content: '开发客户管理模块和报表统计功能',
    weight: 35,
    priority: 'high',
    status: 'in-progress',
    progress: 45,
    target: '完成2个核心功能模块',
    criteria: '功能测试通过率100%，性能满足要求',
    measures: '需求分析、系统设计、编码开发、测试验收',
    timeRangeDate: [dayjs('2024-01-15'), dayjs('2024-02-15')],
    timeRange: '2024-01-15 ~ 2024-02-15',
    relatedGoalId: 1,
    result: '客户管理模块已完成60%，报表功能开发中',
    reason: '第三方接口对接比预期复杂',
    selfScore: 75,
    responsible: '王五'
  },
  {
    id: 4,
    project: '团队培训',
    content: '组织技术团队学习新技术栈，提升团队技术能力',
    weight: 10,
    priority: 'low',
    status: 'completed',
    progress: 100,
    target: '完成3次技术分享，团队成员技能提升',
    criteria: '培训参与率95%以上，技能评估提升20%',
    measures: '制定培训计划，邀请专家讲座，内部技术分享',
    timeRangeDate: [dayjs('2024-01-01'), dayjs('2024-01-30')],
    timeRange: '2024-01-01 ~ 2024-01-30',
    relatedGoalId: 2,
    result: '已完成Vue3、TypeScript、微服务架构3次培训',
    reason: '',
    selfScore: 95,
    responsible: '赵六'
  }
])

// 计算属性：根据当前数据使用plans
const tacticalGoals = computed(() => {
  return filteredPlans.value
})

// 过滤后的计划列表
const filteredPlans = computed(() => {
  let result = plans.value

  if (filters.period) {
    result = result.filter(plan => plan.timeRange.includes(filters.period))
  }
  
  if (filters.status) {
    result = result.filter(plan => plan.status === filters.status)
  }
  
  if (filters.keyword) {
    result = result.filter(plan => 
      plan.project.includes(filters.keyword) || 
      plan.content.includes(filters.keyword)
    )
  }

  return result
})

// 获取状态颜色
const getStatusColor = (status: string) => {
  const colorMap: Record<string, string> = {
    'draft': '#d9d9d9',
    'pending': '#1890ff',
    'approved': '#52c41a',
    'in-progress': '#faad14',
    'completed': '#722ed1'
  }
  return colorMap[status] || '#d9d9d9'
}

// 获取状态文本
const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    'draft': '草稿',
    'pending': '待审批',
    'approved': '已审批',
    'in-progress': '执行中',
    'completed': '已完成'
  }
  return textMap[status] || '未知'
}

// 标记行已修改
const markAsChanged = (id: number) => {
  changedRows.value.add(id)
}

// 处理时间范围变化
const handleTimeRangeChange = (record: any, dates: any) => {
  if (dates && dates.length === 2) {
    record.timeRange = `${dates[0].format('YYYY-MM-DD')} ~ ${dates[1].format('YYYY-MM-DD')}`
    markAsChanged(record.id)
  }
}

// 新增行
const addNewRow = () => {
  const newId = Math.max(...plans.value.map(p => p.id)) + 1
  const newRow = {
    id: newId,
    project: '',
    content: '',
    weight: 20,
    priority: 'medium',
    status: 'draft',
    progress: 0,
    target: '',
    criteria: '',
    measures: '',
    timeRangeDate: null,
    timeRange: '',
    relatedGoalId: null,
    result: '',
    reason: '',
    selfScore: null
  }
  plans.value.unshift(newRow)
  changedRows.value.add(newId)
}

// 保存单行
const saveRow = async (record: any) => {
  record.saving = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    changedRows.value.delete(record.id)
    message.success('保存成功')
  } catch (error) {
    message.error('保存失败')
  } finally {
    record.saving = false
  }
}

// 删除行
const deleteRow = (record: any) => {
  const index = plans.value.findIndex(p => p.id === record.id)
  if (index > -1) {
    plans.value.splice(index, 1)
    changedRows.value.delete(record.id)
    message.success('删除成功')
  }
}

// 保存全部修改
const saveAllChanges = async () => {
  if (changedRows.value.size === 0) {
    message.info('没有修改的内容')
    return
  }

  saving.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 2000))
    changedRows.value.clear()
    message.success(`已保存 ${changedRows.value.size} 项修改`)
  } catch (error) {
    message.error('保存失败')
  } finally {
    saving.value = false
  }
}

// 行操作处理
const handleRowAction = (e: any, record: any) => {
  const { key } = e
  console.log('Row action:', key, record)
  
  switch (key) {
    case 'submit':
      record.status = 'pending'
      markAsChanged(record.id)
      message.info('已提交审批')
      break
    case 'complete':
      record.status = 'completed'
      record.progress = 100
      markAsChanged(record.id)
      message.info('已标记为完成')
      break
    case 'copy':
      const newRow = { ...record, id: Math.max(...plans.value.map(p => p.id)) + 1 }
      plans.value.push(newRow)
      message.success('复制成功')
      break
  }
}

// 筛选变化处理
const handleFilterChange = () => {
  console.log('Filter changed:', filters)
}

// 表格变化处理
const handleTableChange = (pag: any) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
}

// 选择模板
const handleSelectTemplate = () => {
  console.log('Select template')
  showTemplateModal.value = false
}

// 模板选择处理
const handleTemplateSelect = (template: any) => {
  console.log('Template selected:', template)
  // 将模板数据填充到新行
  addNewRow()
  const newRow = plans.value[0]
  Object.assign(newRow, template.content)
  showTemplateModal.value = false
}

// 新增：总结表格列定义
const summaryColumns = [
  {
    title: '项目',
    key: 'project',
    width: 120,
    fixed: 'left'
  },
  {
    title: '内容',
    key: 'content',
    width: 150
  },
  {
    title: '目标',
    key: 'target',
    width: 120
  },
  {
    title: '实施措施',
    key: 'measures',
    width: 150
  },
  {
    title: '完成结果',
    key: 'result',
    width: 200
  },
  {
    title: '未完成原因',
    key: 'reason',
    width: 150
  },
  {
    title: '操作',
    key: 'actions',
    width: 120,
    fixed: 'right'
  }
]

// 新增：对比表格列定义
const compareColumns = [
  {
    title: '项目',
    key: 'project',
    width: 120,
    fixed: 'left'
  },
  {
    title: '计划目标',
    key: 'planTarget',
    width: 250
  },
  {
    title: '实际结果',
    key: 'actualResult',
    width: 250
  },
  {
    title: '评分对比',
    key: 'scoreComparison',
    width: 150
  }
]

// 新增方法：标记行已修改
const markRowChanged = (id: number) => {
  changedRows.value.add(id)
}

// 新增方法：保存单个总结
const saveSingleSummary = (record: any) => {
  record.saving = true
  setTimeout(() => {
    record.saving = false
    changedRows.value.delete(record.id)
    message.success('总结保存成功')
  }, 1000)
}

// 新增方法：保存所有总结
const saveAllSummaries = () => {
  saving.value = true
  setTimeout(() => {
    saving.value = false
    changedRows.value.clear()
    message.success('所有总结保存成功')
  }, 1500)
}

// 新增方法：提交总结
const submitSummary = () => {
  // 显示整体自评分输入框
  showOverallScoreModal.value = true
}

// 新增：整体自评分相关状态
const showOverallScoreModal = ref(false)
const overallSelfScore = ref(null)
const overallSummary = ref('')

// 新增方法：保存整体自评分
const saveOverallScore = () => {
  if (!overallSelfScore.value) {
    message.error('请输入整体自评分')
    return
  }
  
  message.success(`总结提交成功，整体自评分：${overallSelfScore.value}分`)
  showOverallScoreModal.value = false
  overallSelfScore.value = null
  overallSummary.value = ''
}

// 新增方法：查看计划详情
const viewPlanDetail = (record: any) => {
  message.info(`查看 ${record.project} 的计划详情`)
}

// 新增方法：视图模式变化
const handleViewModeChange = () => {
  console.log('View mode changed:', viewMode.value)
}

// 页面初始化
onMounted(() => {
  pagination.total = plans.value.length
})
</script>

<style scoped>
.tactical-goals {
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

/* 月份状态卡片样式 */
.month-status-card {
  border-left: 4px solid #1890ff;
}

.month-info {
  padding: 8px 0;
}

.month-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.month-title {
  display: flex;
  align-items: center;
  font-size: 18px;
  font-weight: 600;
  color: #1890ff;
}

.month-title span {
  margin-left: 8px;
}

.status-tag {
  font-size: 14px;
  padding: 4px 12px;
  font-weight: 500;
}

.month-stats {
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

.parent-goal-card {
  padding: 16px;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  background: #fafafa;
}

.goal-header {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.goal-title {
  margin-left: 8px;
  font-weight: 600;
  color: #1890ff;
}

.goal-desc {
  margin: 0 0 12px 0;
  color: #666;
  font-size: 12px;
  line-height: 1.5;
}

.goal-progress {
  display: flex;
  align-items: center;
  font-size: 12px;
}

:deep(.ant-table-tbody > tr > td) {
  padding: 4px 8px !important;
}

:deep(.ant-input), :deep(.ant-select), :deep(.ant-input-number) {
  border: none;
  box-shadow: none;
}

:deep(.ant-input:focus), :deep(.ant-select:focus), :deep(.ant-input-number:focus) {
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

.inline-edit-cell {
  position: relative;
}

.inline-edit-cell .editable-cell-input-wrapper,
.inline-edit-cell .editable-cell-text-wrapper {
  padding-right: 24px;
}

.inline-edit-cell .editable-cell-text-wrapper {
  padding: 5px 24px 5px 5px;
}

.inline-edit-cell .editable-cell-icon,
.inline-edit-cell .editable-cell-icon-check {
  position: absolute;
  right: 0;
  width: 20px;
  cursor: pointer;
}

.inline-edit-cell .editable-cell-icon {
  margin-top: 4px;
  display: none;
}

.inline-edit-cell .editable-cell-icon-check {
  line-height: 28px;
}

.inline-edit-cell:hover .editable-cell-icon {
  display: inline-block;
}

.inline-edit-cell .editable-cell-icon:hover,
.inline-edit-cell .editable-cell-icon-check:hover {
  color: #108ee9;
}

.editable-cell-text-wrapper {
  border: 1px solid transparent;
  border-radius: 4px;
  min-height: 32px;
  display: flex;
  align-items: center;
}

.editable-cell-text-wrapper:hover {
  border-color: #d9d9d9;
  background-color: #fafafa;
}

.goal-header {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.goal-title {
  margin-left: 8px;
  font-weight: 600;
}

.goal-desc {
  margin: 8px 0;
  color: #666;
  font-size: 14px;
}

.goal-progress {
  display: flex;
  align-items: center;
}

.parent-goal-card {
  padding: 16px;
  border: 1px solid #f0f0f0;
  border-radius: 6px;
  background: #fafafa;
}

/* 新增样式：总结模式 */
.readonly-field {
  color: #666;
  background-color: #f5f5f5;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 13px;
  display: block;
  min-height: 20px;
}

.compare-field {
  font-weight: 600;
  color: #1890ff;
}

.plan-content,
.result-content {
  line-height: 1.6;
}

.plan-content div,
.result-content div {
  margin-bottom: 8px;
}

.plan-content div:last-child,
.result-content div:last-child {
  margin-bottom: 0;
}

.score-comparison {
  text-align: center;
}

.score-comparison div {
  margin-bottom: 4px;
  padding: 2px 8px;
  border-radius: 4px;
}

.score-comparison div:first-child {
  background-color: #e6f7ff;
  color: #1890ff;
}

.score-comparison div:last-child {
  background-color: #f6ffed;
  color: #52c41a;
}

:deep(.ant-table-tbody > tr > td) {
  vertical-align: top;
}

:deep(.ant-textarea) {
  min-height: 60px;
}
</style> 