<template>
  <div class="annual-plans">
    <!-- 页面标题 -->
    <div class="page-header">
      <div class="header-content">
        <div class="title-area">
          <h2>📊 年度计划管理</h2>
          <p>制定和管理年度战略计划</p>
          <!-- 状态显示 -->
          <div class="status-display">
            <span class="status-label">当前状态：</span>
            <a-tag 
              :style="{ 
                color: yearStatusInfo.color, 
                backgroundColor: yearStatusInfo.bgColor,
                border: `1px solid ${yearStatusInfo.color}`,
                fontWeight: '500'
              }"
            >
              {{ yearStatusInfo.text }}
            </a-tag>
          </div>
        </div>
        <div class="actions">
          <a-space>
            <a-button @click="showExampleModal = true">
              <EyeOutlined />
              查看填写样例
            </a-button>
            <a-select v-model:value="currentYear" style="width: 120px" @change="handleYearChange">
              <a-select-option value="2024">2024年</a-select-option>
              <a-select-option value="2025">2025年</a-select-option>
            </a-select>
          </a-space>
        </div>
      </div>
    </div>

    <!-- 年度计划表格 -->
    <a-card title="2024年度计划">
      <template #extra>
        <a-space>
          <a-button 
            type="primary" 
            @click="addPlan"
            :disabled="!canEdit"
          >
            <PlusOutlined />
            新增计划
          </a-button>
          <a-button 
            type="primary" 
            @click="submitForReview"
            :loading="submitting"
            :disabled="!canSubmit"
            v-if="yearStatus === 'draft'"
          >
            提交审核
          </a-button>
          <a-button 
            @click="withdrawPlans" 
            :loading="withdrawing" 
            :disabled="yearStatus !== 'reviewing'"
            v-if="yearStatus === 'reviewing'"
          >
            <RollbackOutlined />
            撤回计划
          </a-button>
        </a-space>
      </template>
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
              :disabled="!canEdit"
              @change="() => saveRecord(record)"
            />
          </template>

          <template v-else-if="column.key === 'project'">
            <a-input
              v-model:value="record.project"
              :disabled="!canEdit"
              @blur="() => saveRecord(record)"
              @press-enter="() => saveRecord(record)"
            />
          </template>

          <template v-else-if="column.key === 'content'">
            <a-textarea
              v-model:value="record.content"
              :rows="2"
              :disabled="!canEdit"
              @blur="() => saveRecord(record)"
            />
          </template>

          <template v-else-if="column.key === 'target'">
            <a-textarea
              v-model:value="record.target"
              :rows="2"
              :disabled="!canEdit"
              @blur="() => saveRecord(record)"
            />
          </template>

          <template v-else-if="column.key === 'standard'">
            <a-textarea
              v-model:value="record.standard"
              :rows="2"
              :disabled="!canEdit"
              @blur="() => saveRecord(record)"
            />
          </template>

          <template v-else-if="column.key === 'responsible'">
            <div v-if="!canEdit">
              {{ formatResponsible(record.responsible) }}
            </div>
            <a-select
              v-else
              v-model:value="record.responsible"
              mode="multiple"
              style="width: 150px"
              placeholder="选择责任人"
              :maxTagCount="1"
              :maxTagPlaceholder="(omittedValues) => `+${omittedValues.length}人`"
              @change="() => saveRecord(record)"
            >
              <a-select-option v-for="item in responsibleOptions" :key="item" :value="item">
                {{ item }}
              </a-select-option>
            </a-select>
          </template>

          <template v-else-if="column.key === 'timeRange'">
            <a-range-picker
              v-model:value="record.timeRange"
              style="width: 200px"
              :disabled="!canEdit"
              @change="() => saveRecord(record)"
            />
          </template>

          <template v-else-if="column.key === 'measures'">
            <a-textarea
              v-model:value="record.measures"
              :rows="2"
              :disabled="!canEdit"
              @blur="() => saveRecord(record)"
            />
          </template>

          <template v-else-if="column.key === 'actions'">
            <a-space v-if="canEdit">
              <a-popconfirm
                title="确定删除这条计划吗？"
                @confirm="deletePlan(record.id)"
              >
                <a-button size="small" danger>删除</a-button>
              </a-popconfirm>
            </a-space>
            <span v-else style="color: #999; font-size: 12px;">已锁定</span>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 填写样例查看弹窗 -->
    <a-modal
      v-model:open="showExampleModal"
      title="📈 年度计划填写样例"
      width="1400px"
      :footer="null"
      :bodyStyle="{ maxHeight: '70vh', overflow: 'auto' }"
    >
      <a-tabs v-model:activeKey="currentExampleType">
        <a-tab-pane key="strategic" tab="🎯 战略规划样例">
          <div class="example-content">
            <div class="example-header">
              <h4>公司年度战略规划样例</h4>
              <p class="example-description">适用于公司级年度战略目标制定和重点项目规划</p>
            </div>
            
            <a-table
              :dataSource="strategicExamples"
              :columns="exampleColumns"
              :pagination="false"
              :scroll="{ x: 1400 }"
              size="small"
              class="example-table"
            />
          </div>
        </a-tab-pane>
        
        <a-tab-pane key="department" tab="🏢 部门目标样例">
          <div class="example-content">
            <div class="example-header">
              <h4>部门年度目标样例</h4>
              <p class="example-description">适用于各部门年度工作目标和关键业务指标设定</p>
            </div>
            
            <a-table
              :dataSource="departmentExamples"
              :columns="exampleColumns"
              :pagination="false"
              :scroll="{ x: 1400 }"
              size="small"
              class="example-table"
            />
          </div>
        </a-tab-pane>
        
        <a-tab-pane key="innovation" tab="💡 创新发展样例">
          <div class="example-content">
            <div class="example-header">
              <h4>创新发展年度计划样例</h4>
              <p class="example-description">适用于技术创新、产品研发、市场拓展等创新发展计划</p>
            </div>
            
            <a-table
              :dataSource="innovationExamples"
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
          message="💡 年度计划制定建议"
          description="1. 年度目标要与公司战略保持一致；2. 权重分配要体现工作重点；3. 时间规划要考虑项目依赖关系；4. 考核标准要量化和可操作"
          type="info"
          show-icon
        />
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { PlusOutlined, RollbackOutlined, FileTextOutlined, CalendarOutlined, CheckOutlined, EyeOutlined } from '@ant-design/icons-vue'
import dayjs from 'dayjs'

// 页面状态
const currentYear = ref('2025') // 默认显示2025年
const loading = ref(false)
const saving = ref(false)
const submitting = ref(false)
const withdrawing = ref(false)
const selectedRowKeys = ref<number[]>([])
const showExampleModal = ref(false)
const currentExampleType = ref('strategic')

// 年度计划整体状态 - 根据年份设置不同状态
const getInitialYearStatus = (year: string) => {
  if (year === '2024') return 'approved' // 2024年已通过
  if (year === '2025') return 'draft' // 2025年草稿状态
  return 'draft'
}

const yearStatus = ref<'draft' | 'reviewing' | 'approved' | 'rejected'>(getInitialYearStatus(currentYear.value))

// 监听年份变化，更新状态
const handleYearChange = (year: string) => {
  currentYear.value = year
  yearStatus.value = getInitialYearStatus(year)
}

// 状态显示配置
const statusConfig = {
  draft: { text: '草稿', color: '#595959', bgColor: '#f0f0f0' },
  reviewing: { text: '审核中', color: '#d46b08', bgColor: '#fff7e6' },
  approved: { text: '已通过', color: '#389e0d', bgColor: '#f6ffed' },
  rejected: { text: '退回修改', color: '#cf1322', bgColor: '#fff1f0' }
}

// 计算属性
const yearStatusInfo = computed(() => statusConfig[yearStatus.value])

const canEdit = computed(() => {
  // 只有2025年草稿状态或退回状态才能编辑
  return currentYear.value === '2025' && (yearStatus.value === 'draft' || yearStatus.value === 'rejected')
})

const canSubmit = computed(() => {
  return yearStatus.value === 'draft' && filteredPlans.value.length > 0
})

const totalWeight = computed(() => {
  return filteredPlans.value.reduce((total, plan) => total + plan.weight, 0)
})

const uniqueResponsibles = computed(() => {
  const responsibles = new Set<string>()
  filteredPlans.value.forEach(plan => responsibles.add(plan.responsible.join(',')))
  return Array.from(responsibles)
})

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

// 计划数据 - 修改责任人字段为数组格式，默认包含"本人"
const plans = ref([
  // 2024年计划（已通过，不可编辑）
  {
    id: 1,
    year: '2024',
    serialNumber: 1,
    weight: 25,
    project: '数字化转型项目',
    content: '推进公司全面数字化转型，包括ERP系统升级、OA系统优化、业务流程数字化改造',
    target: '完成核心系统数字化改造，运营效率提升30%，成本降低15%',
    standard: '系统上线运行稳定率99%以上，关键业务指标达到预期，用户满意度85%以上',
    responsible: ['张三', '李四'], // 修改为数组格式
    timeRange: [dayjs('2024-01-01'), dayjs('2024-12-31')],
    measures: '组建跨部门数字化专项团队，分三阶段实施，强化员工培训，建立持续改进机制'
  },
  {
    id: 2,
    year: '2024',
    serialNumber: 2,
    weight: 20,
    project: '市场拓展与品牌建设',
    content: '开拓新市场区域，加强品牌建设，提升市场占有率和品牌知名度',
    target: '新增市场区域3个，品牌知名度提升40%，市场占有率增长8%',
    standard: '完成3个新区域市场布局，品牌调研指标达标，销售额同比增长25%',
    responsible: ['李四'],
    timeRange: [dayjs('2024-01-01'), dayjs('2024-12-31')],
    measures: '制定市场拓展策略，增加营销投入，建立品牌管理体系，强化渠道建设'
  },
  {
    id: 3,
    year: '2024',
    serialNumber: 3,
    weight: 18,
    project: '产品创新与研发',
    content: '加大产品研发投入，推出创新产品，提升产品竞争力和技术含量',
    target: '推出3款创新产品，研发投入占营收比例达到8%，申请专利15项',
    standard: '新产品市场反响良好，技术指标达到行业先进水平，专利申请成功率80%以上',
    responsible: ['王五', '赵六'],
    timeRange: [dayjs('2024-01-01'), dayjs('2024-12-31')],
    measures: '成立产品创新委员会，引进高端人才，建立产学研合作机制，完善研发流程'
  },
  {
    id: 4,
    year: '2024',
    serialNumber: 4,
    weight: 15,
    project: '人才发展与组织优化',
    content: '完善人才培养体系，优化组织架构，提升员工能力和组织效能',
    target: '培训覆盖率100%，关键岗位人才储备率90%，员工满意度85%以上',
    standard: '培训效果评估达标，人才梯队建设完善，组织运行高效，离职率控制在8%以内',
    responsible: ['赵六'],
    timeRange: [dayjs('2024-01-01'), dayjs('2024-12-31')],
    measures: '建立人才发展中心，实施导师制度，优化薪酬激励体系，加强企业文化建设'
  },
  {
    id: 5,
    year: '2024',
    serialNumber: 5,
    weight: 12,
    project: '质量管理与客户服务',
    content: '建立完善的质量管理体系，提升客户服务水平，增强客户满意度和忠诚度',
    target: '质量合格率99.5%以上，客户投诉处理及时率100%，客户满意度90%以上',
    standard: '通过ISO质量认证，客户服务响应时间控制在2小时内，客户续约率85%以上',
    responsible: ['钱七', '孙八'],
    timeRange: [dayjs('2024-01-01'), dayjs('2024-12-31')],
    measures: '建立质量监控体系，完善客户服务流程，建立客户反馈机制，定期开展质量培训'
  },
  {
    id: 6,
    year: '2024',
    serialNumber: 6,
    weight: 10,
    project: '财务管理与风险控制',
    content: '优化财务管理流程，加强风险控制，提升资金使用效率和风险防范能力',
    target: '资金周转率提升20%，风险控制指标100%达标，成本控制目标完成',
    standard: '财务报表准确及时，风险评估全覆盖，成本费用率同比下降3%',
    responsible: ['孙八'],
    timeRange: [dayjs('2024-01-01'), dayjs('2024-12-31')],
    measures: '建立财务风险预警机制，完善内控制度，加强预算管理，定期风险评估'
  },
  
  // 2025年计划（草稿状态，可编辑）
  {
    id: 11,
    year: '2025',
    serialNumber: 1,
    weight: 30,
    project: '智能化升级项目',
    content: '在数字化基础上推进智能化升级，引入AI技术，建设智能工厂和智能办公系统',
    target: '完成智能化系统部署，生产效率提升35%，智能化覆盖率达到80%',
    standard: '智能系统稳定运行，效率指标达成，智能化应用覆盖核心业务流程',
    responsible: ['本人'], // 2025年计划默认责任人为本人
    timeRange: [dayjs('2025-01-01'), dayjs('2025-12-31')],
    measures: '建立AI技术团队，分阶段智能化改造，加强技术培训，建立智能化标准体系'
  },
  {
    id: 12,
    year: '2025',
    serialNumber: 2,
    weight: 25,
    project: '国际市场开拓',
    content: '拓展国际市场，建立海外业务体系，提升国际竞争力和全球化水平',
    target: '进入5个海外市场，海外业务收入占比达到30%，建立3个海外办事处',
    standard: '海外市场布局完成，业务收入目标达成，海外团队建设到位',
    responsible: ['本人'],
    timeRange: [dayjs('2025-01-01'), dayjs('2025-12-31')],
    measures: '制定国际化战略，建立海外团队，完善国际业务流程，加强文化适应性'
  },
  {
    id: 13,
    year: '2025',
    serialNumber: 3,
    weight: 20,
    project: '绿色发展与可持续经营',
    content: '推进绿色低碳发展，建立可持续经营模式，承担社会责任',
    target: '碳排放减少25%，绿色产品占比达到60%，获得绿色认证',
    standard: '环保指标达标，绿色产品市场认可度高，社会责任报告发布',
    responsible: ['本人'],
    timeRange: [dayjs('2025-01-01'), dayjs('2025-12-31')],
    measures: '制定碳中和路线图，推广绿色技术，建立环保管理体系，发布社会责任报告'
  },
  {
    id: 14,
    year: '2025',
    serialNumber: 4,
    weight: 15,
    project: '创新生态建设',
    content: '构建开放创新生态，加强产学研合作，培育创新文化',
    target: '建立5个创新实验室，孵化10个创新项目，申请专利50项',
    standard: '实验室运行良好，项目产出有价值，专利质量高',
    responsible: ['本人'],
    timeRange: [dayjs('2025-01-01'), dayjs('2025-12-31')],
    measures: '建设创新平台，引进创新人才，完善激励机制，营造创新氛围'
  },
  {
    id: 15,
    year: '2025',
    serialNumber: 5,
    weight: 10,
    project: '数据资产管理',
    content: '建立数据资产管理体系，挖掘数据价值，提升数据治理水平',
    target: '建成数据中台，数据质量达到95%，数据应用场景覆盖80%业务',
    standard: '数据架构完善，数据质量高，应用效果明显',
    responsible: ['本人'],
    timeRange: [dayjs('2025-01-01'), dayjs('2025-12-31')],
    measures: '设计数据架构，建立数据标准，开发数据产品，培养数据人才'
  }
])

// 表格列定义 - 移除操作列中的编辑按钮
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
    width: 250
  },
  {
    title: '目标',
    key: 'target',
    width: 250
  },
  {
    title: '考核标准',
    key: 'standard',
    width: 250
  },
  {
    title: '责任人',
    key: 'responsible',
    width: 120
  },
  {
    title: '计划完成时间',
    key: 'timeRange',
    width: 200
  },
  {
    title: '实施措施',
    key: 'measures',
    width: 250
  },
  {
    title: '操作',
    key: 'actions',
    width: 120,
    fixed: 'right'
  }
]

// 过滤后的计划
const filteredPlans = computed(() => {
  return plans.value.filter(plan => plan.year === currentYear.value)
})

// 分页配置
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total: number) => `共 ${total} 条`
})

// 状态相关方法
const getStatusType = (status: string) => {
  const statusMap = {
    reviewing: 'info',
    approved: 'success',
    rejected: 'error'
  }
  return statusMap[status] || 'info'
}

const getStatusMessage = (status: string) => {
  const messageMap = {
    reviewing: '计划已提交审核，正在等待上级审批',
    approved: '计划已通过审核',
    rejected: '计划审核未通过，请修改后重新提交'
  }
  return messageMap[status] || ''
}

// 事件处理方法
const addPlan = () => {
  if (!canEdit.value) {
    message.warning('当前状态不允许新增计划')
    return
  }
  
  const newPlan = {
    id: Date.now(),
    year: currentYear.value,
    serialNumber: filteredPlans.value.length + 1,
    weight: 0,
    project: '',
    content: '',
    target: '',
    standard: '',
    responsible: ['本人'], // 新增计划默认责任人为本人
    timeRange: [dayjs().startOf('year'), dayjs().endOf('year')],
    measures: ''
  }
  plans.value.push(newPlan)
  message.success('新增计划成功')
}

const editPlan = (record: any) => {
  if (!canEdit.value) {
    message.warning('当前状态不允许编辑计划')
    return
  }
  // 编辑逻辑
}

const deletePlan = (id: number) => {
  if (!canEdit.value) {
    message.warning('当前状态不允许删除计划')
    return
  }
  plans.value = plans.value.filter(plan => plan.id !== id)
  message.success('删除成功')
}

const saveRecord = (record: any) => {
  if (!canEdit.value) {
    message.warning('当前状态不允许修改计划')
    return
  }
  // 保存逻辑
  message.success('保存成功')
}

const submitForReview = async () => {
  if (filteredPlans.value.length === 0) {
    message.warning('请先添加计划内容')
    return
  }
  
  const totalWeight = filteredPlans.value.reduce((sum, plan) => sum + plan.weight, 0)
  if (totalWeight !== 100) {
    message.warning(`权重总和应为100%，当前为${totalWeight}%`)
    return
  }
  
  submitting.value = true
  try {
    // 模拟提交
    await new Promise(resolve => setTimeout(resolve, 1000))
    yearStatus.value = 'reviewing'
    message.success('计划已提交审核')
  } catch (error) {
    message.error('提交失败，请重试')
  } finally {
    submitting.value = false
  }
}

const withdrawPlans = async () => {
  withdrawing.value = true
  try {
    // 模拟撤回
    await new Promise(resolve => setTimeout(resolve, 1000))
    yearStatus.value = 'draft'
    message.success('计划已撤回')
  } catch (error) {
    message.error('撤回失败，请重试')
  } finally {
    withdrawing.value = false
  }
}

// 示例数据
const strategicExamples = [
  {
    key: '1',
    serialNumber: 1,
    weight: 35,
    project: '战略转型升级',
    content: '推动公司从传统制造向智能制造转型',
    target: '完成智能制造平台建设，生产效率提升40%',
    standard: '平台稳定运行，效率指标达成，质量提升20%',
    responsible: '总经理',
    timeRange: '2024.01-2024.12',
    measures: '成立转型委员会，引进先进技术，培训技术人员'
  }
]

const departmentExamples = [
  {
    key: '1',
    serialNumber: 1,
    weight: 40,
    project: '销售业绩提升',
    content: '扩大市场份额，提高销售业绩',
    target: '销售额增长30%，新客户200家',
    standard: '月度销售目标达成率95%以上',
    responsible: '销售总监',
    timeRange: '2024.01-2024.12',
    measures: '扩大销售团队，优化销售流程，加强客户维护'
  }
]

const innovationExamples = [
  {
    key: '1',
    serialNumber: 1,
    weight: 30,
    project: '新产品研发',
    content: '研发具有市场竞争力的新产品',
    target: '推出3款新产品，申请专利5项',
    standard: '产品技术指标达到行业先进水平',
    responsible: '研发总监',
    timeRange: '2024.01-2024.12',
    measures: '组建研发团队，加大研发投入，建立产学研合作'
  }
]

const exampleColumns = [
  { title: '序号', dataIndex: 'serialNumber', width: 60 },
  { title: '权重(%)', dataIndex: 'weight', width: 80 },
  { title: '项目', dataIndex: 'project', width: 120 },
  { title: '内容', dataIndex: 'content', width: 180 },
  { title: '目标', dataIndex: 'target', width: 180 },
  { title: '考核标准', dataIndex: 'standard', width: 160 },
  { title: '责任人', dataIndex: 'responsible', width: 100 },
  { title: '时间', dataIndex: 'timeRange', width: 120 },
  { title: '实施措施', dataIndex: 'measures', width: 200 }
]

// 格式化责任人显示
const formatResponsible = (responsible: string[]) => {
  if (!responsible || responsible.length === 0) return '-'
  if (responsible.length === 1) return responsible[0]
  return `${responsible[0]} 等${responsible.length}人`
}

onMounted(() => {
  // 组件挂载时的初始化逻辑
})
</script>

<style scoped>
.annual-plans {
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

/* 年度状态卡片样式 */
.year-status-card {
  border-left: 4px solid #1890ff;
}

.year-info {
  padding: 8px 0;
}

.year-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.year-title {
  display: flex;
  align-items: center;
  font-size: 18px;
  font-weight: 600;
  color: #1890ff;
}

.year-title span {
  margin-left: 8px;
}

.status-tag {
  font-size: 14px;
  padding: 4px 12px;
  font-weight: 500;
}

.year-stats {
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

.example-content {
  padding: 16px 0;
}

.example-header {
  margin-bottom: 16px;
  
  h4 {
    color: #1890ff;
    margin-bottom: 8px;
    font-size: 16px;
    font-weight: 600;
  }
  
  .example-description {
    color: #666;
    font-size: 14px;
    margin-bottom: 0;
  }
}

.example-table {
  .ant-table-thead > tr > th {
    background: #fafafa;
    font-weight: 600;
  }
  
  .ant-table-tbody > tr > td {
    padding: 8px 12px;
    font-size: 13px;
    line-height: 1.4;
  }
}

.example-tips {
  margin-top: 16px;
}
</style> 