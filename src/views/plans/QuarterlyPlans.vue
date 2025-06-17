<template>
  <div class="quarterly-plans">
    <!-- 页面标题 -->
    <div class="page-header">
      <div class="header-content">
        <div class="title-area">
          <h2>📋 季度计划管理</h2>
          <p>制定和管理季度计划目标</p>
          <!-- 状态显示 -->
          <div class="status-display">
            <span class="status-label">当前状态：</span>
            <a-tag 
              :style="{ 
                color: quarterStatusInfo.color, 
                backgroundColor: quarterStatusInfo.bgColor,
                border: `1px solid ${quarterStatusInfo.color}`,
                fontWeight: '500'
              }"
            >
              {{ quarterStatusInfo.text }}
            </a-tag>
          </div>
        </div>
        <div class="actions">
          <a-space>
            <a-button @click="showExampleModal = true">
              <EyeOutlined />
              查看填写样例
            </a-button>
            <a-select v-model:value="currentQuarter" style="width: 120px" @change="handleQuarterChange">
              <a-select-option value="Q1">2024 Q1</a-select-option>
              <a-select-option value="Q2">2024 Q2</a-select-option>
              <a-select-option value="Q3">2024 Q3</a-select-option>
              <a-select-option value="Q4">2024 Q4</a-select-option>
            </a-select>
          </a-space>
        </div>
      </div>
    </div>

    <!-- 季度计划表格 -->
    <a-card title="2024年Q4季度计划">
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
            v-if="quarterStatus === 'draft'"
          >
            提交审核
          </a-button>
          <a-button 
            @click="withdrawPlans" 
            :loading="withdrawing" 
            :disabled="quarterStatus !== 'reviewing'"
            v-if="quarterStatus === 'reviewing'"
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
              <a-select-option v-for="option in responsibleOptions" :key="option" :value="option">
                {{ option }}
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
            <a-space>
              <a-popconfirm
                title="确定删除这条计划吗？"
                @confirm="deletePlan(record.id)"
                :disabled="!canEdit"
              >
                <a-button size="small" danger :disabled="!canEdit">删除</a-button>
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
import { PlusOutlined, RollbackOutlined, FileTextOutlined, CalendarOutlined, CheckOutlined, EyeOutlined } from '@ant-design/icons-vue'
import dayjs from 'dayjs'

// 页面状态
const currentYear = ref('2024')
const currentQuarter = ref('Q4')
const loading = ref(false)
const saving = ref(false)
const submitting = ref(false)
const withdrawing = ref(false)
const selectedRowKeys = ref<number[]>([])
const showExampleModal = ref(false)
const quarterStatus = ref<'draft' | 'reviewing' | 'approved' | 'rejected'>('draft')

// 状态显示配置
const statusConfig = {
  draft: { text: '草稿', color: '#595959', bgColor: '#f0f0f0' },
  reviewing: { text: '审核中', color: '#d46b08', bgColor: '#fff7e6' },
  approved: { text: '已通过', color: '#389e0d', bgColor: '#f6ffed' },
  rejected: { text: '退回修改', color: '#cf1322', bgColor: '#fff1f0' }
}

// 计算属性
const quarterStatusInfo = computed(() => statusConfig[quarterStatus.value])

const canEdit = computed(() => {
  return quarterStatus.value === 'draft' || quarterStatus.value === 'rejected'
})

const canSubmit = computed(() => {
  return quarterStatus.value === 'draft' && filteredPlans.value.length > 0
})

const totalWeight = computed(() => {
  return filteredPlans.value.reduce((total, plan) => total + plan.weight, 0)
})

const uniqueResponsibles = computed(() => {
  const responsibles = new Set<string>()
  filteredPlans.value.forEach(plan => {
    if (Array.isArray(plan.responsible)) {
      plan.responsible.forEach(r => responsibles.add(r))
    }
  })
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

// 计划数据
const plans = ref([
  // 2024 Q1 计划
  {
    id: 1,
    year: '2024',
    quarter: 'Q1',
    serialNumber: 1,
    weight: 30,
    project: 'Q1数字化系统建设',
    content: '第一季度重点推进ERP系统升级和OA系统优化，为全年数字化转型奠定基础',
    target: '完成ERP系统升级，OA系统优化完成80%，系统响应速度提升50%',
    standard: 'ERP系统稳定运行，OA系统用户满意度85%以上，系统故障率低于0.1%',
    responsible: ['张三', '王五'],
    timeRange: [dayjs('2024-01-01'), dayjs('2024-03-31')],
    measures: '组建技术攻关小组，制定详细实施计划，加强系统测试和用户培训'
  },
  {
    id: 2,
    year: '2024',
    quarter: 'Q1',
    serialNumber: 2,
    weight: 25,
    project: '市场调研与策略制定',
    content: '开展全面市场调研，制定年度市场拓展策略，为后续市场开拓做准备',
    target: '完成3个目标市场深度调研，制定市场拓展战略，识别50个潜在客户',
    standard: '调研报告质量高，策略可行性强，潜在客户转化率预期达到20%',
    responsible: ['李四'],
    timeRange: [dayjs('2024-01-01'), dayjs('2024-03-31')],
    measures: '成立市场调研专项组，采用多种调研方法，建立客户数据库'
  },
  {
    id: 3,
    year: '2024',
    quarter: 'Q1',
    serialNumber: 3,
    weight: 20,
    project: '产品研发启动',
    content: '启动年度新产品研发项目，完成技术可行性分析和初步设计',
    target: '完成3个新产品的技术方案设计，通过可行性评审，申请预备专利2项',
    standard: '技术方案通过专家评审，可行性分析充分，专利申请符合要求',
    responsible: ['王五'],
    timeRange: [dayjs('2024-01-01'), dayjs('2024-03-31')],
    measures: '组建跨职能研发团队，建立项目管理体系，引入外部技术专家'
  },
  {
    id: 4,
    year: '2024',
    quarter: 'Q1',
    serialNumber: 4,
    weight: 15,
    project: '人才招聘与培训',
    content: '开展年度人才招聘计划，实施员工技能提升培训项目',
    target: '招聘关键岗位人员20名，完成全员培训覆盖，技能考核通过率90%',
    standard: '新员工入职率95%，培训效果评估良好，员工满意度提升',
    responsible: ['赵六'],
    timeRange: [dayjs('2024-01-01'), dayjs('2024-03-31')],
    measures: '优化招聘流程，建立培训体系，实施导师制度，完善考核机制'
  },
  {
    id: 5,
    year: '2024',
    quarter: 'Q1',
    serialNumber: 5,
    weight: 10,
    project: '质量体系完善',
    content: '完善质量管理体系，为全年质量提升工作建立基础',
    target: '质量管理制度更新完善，质量检测流程优化，质量培训覆盖100%',
    standard: '制度文件通过审核，流程运行顺畅，员工质量意识显著提升',
    responsible: ['钱七'],
    timeRange: [dayjs('2024-01-01'), dayjs('2024-03-31')],
    measures: '梳理现有制度，对标行业标准，开展专业培训，建立监督机制'
  },

  // 2024 Q2 计划
  {
    id: 6,
    year: '2024',
    quarter: 'Q2',
    serialNumber: 1,
    weight: 35,
    project: 'Q2市场拓展实施',
    content: '基于Q1调研成果，全面启动市场拓展活动，开拓新客户和新区域',
    target: '新增客户80家，进入2个新市场区域，销售额同比增长25%',
    standard: '客户数量达标，市场覆盖率提升，销售目标完成率95%以上',
    responsible: ['李四'],
    timeRange: [dayjs('2024-04-01'), dayjs('2024-06-30')],
    measures: '执行市场拓展计划，加强销售团队培训，建立客户关系管理体系'
  },
  {
    id: 7,
    year: '2024',
    quarter: 'Q2',
    serialNumber: 2,
    weight: 25,
    project: '产品开发推进',
    content: '推进新产品开发工作，完成样品制作和初步测试',
    target: '完成3个新产品样品开发，通过内部测试，获得客户初步反馈',
    standard: '样品质量达到设计要求，测试数据符合预期，客户反馈积极',
    responsible: ['王五'],
    timeRange: [dayjs('2024-04-01'), dayjs('2024-06-30')],
    measures: '加快开发进度，严格质量控制，组织客户试用，收集改进建议'
  },
  {
    id: 8,
    year: '2024',
    quarter: 'Q2',
    serialNumber: 3,
    weight: 20,
    project: '运营流程优化',
    content: '基于数字化系统，优化业务流程，提升运营效率',
    target: '核心业务流程效率提升30%，处理时间缩短40%，错误率降低50%',
    standard: '流程优化效果明显，系统运行稳定，用户操作便捷',
    responsible: ['张三'],
    timeRange: [dayjs('2024-04-01'), dayjs('2024-06-30')],
    measures: '分析现有流程瓶颈，设计优化方案，系统功能完善，员工操作培训'
  },
  {
    id: 9,
    year: '2024',
    quarter: 'Q2',
    serialNumber: 4,
    weight: 12,
    project: '财务管理提升',
    content: '完善财务管理制度，提升财务分析和预算管理能力',
    target: '财务报表准确率100%，预算执行偏差控制在5%以内，成本分析深度提升',
    standard: '财务数据准确及时，预算控制有效，分析报告质量高',
    responsible: ['孙八'],
    timeRange: [dayjs('2024-04-01'), dayjs('2024-06-30')],
    measures: '建立财务分析模型，完善预算管理流程，加强成本控制，提升分析能力'
  },
  {
    id: 10,
    year: '2024',
    quarter: 'Q2',
    serialNumber: 5,
    weight: 8,
    project: '品牌建设推进',
    content: '加强品牌宣传和推广，提升品牌知名度和影响力',
    target: '品牌知名度提升20%，媒体曝光量增加50%，客户品牌认知度提升',
    standard: '品牌调研数据改善，媒体报道正面，客户满意度调查结果良好',
    responsible: ['周九'],
    timeRange: [dayjs('2024-04-01'), dayjs('2024-06-30')],
    measures: '制定品牌推广策略，加大宣传投入，参与行业展会，开展公关活动'
  },

  // 2024 Q3 计划
  {
    id: 11,
    year: '2024',
    quarter: 'Q3',
    serialNumber: 1,
    weight: 30,
    project: 'Q3产品上市推广',
    content: '新产品正式上市，开展全面市场推广和销售活动',
    target: '3个新产品成功上市，实现销售收入500万，市场反响良好',
    standard: '产品上市顺利，销售目标达成，客户接受度高，市场份额提升',
    responsible: ['王五'],
    timeRange: [dayjs('2024-07-01'), dayjs('2024-09-30')],
    measures: '制定上市策略，组织发布活动，加强渠道推广，提供技术支持'
  },
  {
    id: 12,
    year: '2024',
    quarter: 'Q3',
    serialNumber: 2,
    weight: 25,
    project: '客户服务升级',
    content: '升级客户服务体系，提升客户满意度和忠诚度',
    target: '客户满意度达到92%，客户投诉处理时效提升60%，客户续约率85%',
    standard: '服务响应快速，问题解决彻底，客户反馈积极，续约率提升',
    responsible: ['钱七'],
    timeRange: [dayjs('2024-07-01'), dayjs('2024-09-30')],
    measures: '完善服务流程，培训服务团队，建立快速响应机制，定期客户回访'
  },
  {
    id: 13,
    year: '2024',
    quarter: 'Q3',
    serialNumber: 3,
    weight: 20,
    project: '供应链优化',
    content: '优化供应链管理，提升采购效率和成本控制能力',
    target: '采购成本降低8%，供应商交付及时率98%，库存周转率提升25%',
    standard: '成本控制有效，供应稳定可靠，库存管理精准，资金占用减少',
    responsible: ['吴十'],
    timeRange: [dayjs('2024-07-01'), dayjs('2024-09-30')],
    measures: '优化供应商结构，建立采购评价体系，实施库存管理优化，强化成本控制'
  },
  {
    id: 14,
    year: '2024',
    quarter: 'Q3',
    serialNumber: 4,
    weight: 15,
    project: '技术创新推进',
    content: '推进技术创新项目，提升技术竞争力',
    target: '完成2项技术创新项目，申请专利8项，技术水平行业领先',
    standard: '创新项目验收通过，专利申请成功，技术指标达到预期',
    responsible: ['张三'],
    timeRange: [dayjs('2024-07-01'), dayjs('2024-09-30')],
    measures: '加大研发投入，引进先进技术，加强技术合作，完善创新机制'
  },
  {
    id: 15,
    year: '2024',
    quarter: 'Q3',
    serialNumber: 5,
    weight: 10,
    project: '员工发展计划',
    content: '实施员工职业发展计划，提升员工能力和满意度',
    target: '员工培训覆盖率100%，内部晋升率30%，员工满意度88%',
    standard: '培训效果良好，晋升通道畅通，员工发展积极，团队稳定',
    responsible: ['赵六'],
    timeRange: [dayjs('2024-07-01'), dayjs('2024-09-30')],
    measures: '制定个人发展计划，提供培训机会，建立晋升通道，完善激励机制'
  },

  // 2024 Q4 计划
  {
    id: 16,
    year: '2024',
    quarter: 'Q4',
    serialNumber: 1,
    weight: 25,
    project: 'Q4年度目标冲刺',
    content: '全力冲刺年度目标，确保各项指标全面完成',
    target: '年度销售目标完成率105%，利润目标达成，各项KPI指标全面达标',
    standard: '目标完成情况良好，业绩超预期，为来年发展奠定基础',
    responsible: ['李四'],
    timeRange: [dayjs('2024-10-01'), dayjs('2024-12-31')],
    measures: '制定冲刺计划，强化执行力，加大市场投入，确保目标达成'
  },
  {
    id: 17,
    year: '2024',
    quarter: 'Q4',
    serialNumber: 2,
    weight: 20,
    project: '年度总结与规划',
    content: '全面总结年度工作，制定下年度发展规划',
    target: '完成年度工作总结，制定2025年发展战略，形成详细实施计划',
    standard: '总结全面深入，规划科学合理，计划可操作性强',
    responsible: ['总经理'],
    timeRange: [dayjs('2024-10-01'), dayjs('2024-12-31')],
    measures: '组织总结会议，深入分析得失，科学制定规划，广泛征求意见'
  },
  {
    id: 18,
    year: '2024',
    quarter: 'Q4',
    serialNumber: 3,
    weight: 20,
    project: '质量认证推进',
    content: '推进ISO质量管理体系认证，提升质量管理水平',
    target: '通过ISO9001质量管理体系认证，质量管理水平显著提升',
    standard: '认证顺利通过，体系运行有效，质量指标全面改善',
    responsible: ['钱七'],
    timeRange: [dayjs('2024-10-01'), dayjs('2024-12-31')],
    measures: '完善质量体系文件，加强内部审核，配合外部认证，持续改进'
  },
  {
    id: 19,
    year: '2024',
    quarter: 'Q4',
    serialNumber: 4,
    weight: 15,
    project: '信息安全建设',
    content: '加强信息安全建设，保障数据和系统安全',
    target: '建立完善的信息安全体系，通过安全评估，安全事件零发生',
    standard: '安全体系完善，评估结果良好，系统运行安全稳定',
    responsible: ['张三'],
    timeRange: [dayjs('2024-10-01'), dayjs('2024-12-31')],
    measures: '建立安全管理制度，部署安全防护设备，开展安全培训，定期安全检查'
  },
  {
    id: 20,
    year: '2024',
    quarter: 'Q4',
    serialNumber: 5,
    weight: 10,
    project: '企业文化建设',
    content: '加强企业文化建设，增强团队凝聚力和向心力',
    target: '员工文化认同度90%，团队凝聚力显著增强，企业形象提升',
    standard: '文化活动丰富，员工参与积极，企业氛围和谐，对外形象良好',
    responsible: ['赵六'],
    timeRange: [dayjs('2024-10-01'), dayjs('2024-12-31')],
    measures: '开展文化活动，宣传企业价值观，加强团队建设，树立企业形象'
  },
  {
    id: 21,
    year: '2024',
    quarter: 'Q4',
    serialNumber: 6,
    weight: 10,
    project: '绿色环保推进',
    content: '推进绿色环保工作，提升可持续发展能力',
    target: '环保指标全面达标，绿色产品占比40%，通过环保认证',
    standard: '环保合规性好，绿色发展成效明显，社会责任履行到位',
    responsible: ['孙八'],
    timeRange: [dayjs('2024-10-01'), dayjs('2024-12-31')],
    measures: '制定环保计划，投入环保设备，开发绿色产品，建立环保体系'
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
    width: 200
  },
  {
    title: '实施措施',
    key: 'measures',
    width: 200
  },
  {
    title: '操作',
    key: 'actions',
    width: 150,
    fixed: 'right'
  }
]

// 过滤后的计划
const filteredPlans = computed(() => {
  return plans.value.filter(plan => 
    plan.year === currentYear.value && plan.quarter === currentQuarter.value
  )
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
const handleYearChange = (year: string) => {
  currentYear.value = year
}

const handleQuarterChange = (quarter: string) => {
  currentQuarter.value = quarter
}

const addPlan = () => {
  if (!canEdit.value) {
    message.warning('当前状态不允许新增计划')
    return
  }
  
  const quarterMap = {
    Q1: [dayjs().month(0).date(1), dayjs().month(2).endOf('month')],
    Q2: [dayjs().month(3).date(1), dayjs().month(5).endOf('month')],
    Q3: [dayjs().month(6).date(1), dayjs().month(8).endOf('month')],
    Q4: [dayjs().month(9).date(1), dayjs().month(11).endOf('month')]
  }
  
  const newPlan = {
    id: Date.now(),
    year: currentYear.value,
    quarter: currentQuarter.value,
    serialNumber: plans.value.length + 1,
    weight: 0,
    project: '',
    content: '',
    target: '',
    standard: '',
    responsible: ['本人'],
    timeRange: quarterMap[currentQuarter.value] || [dayjs(), dayjs().add(3, 'month')],
    measures: ''
  }
  plans.value.push(newPlan)
  message.success('新增计划成功')
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
  
  submitting.value = true
  try {
    // 模拟提交审核
    await new Promise(resolve => setTimeout(resolve, 1000))
    quarterStatus.value = 'reviewing'
    message.success('已提交审核，请等待上级审批')
  } catch (error) {
    message.error('提交失败，请重试')
  } finally {
    submitting.value = false
  }
}

const withdrawPlans = async () => {
  withdrawing.value = true
  try {
    // 模拟撤回计划
    await new Promise(resolve => setTimeout(resolve, 1000))
    quarterStatus.value = 'draft'
    message.success('已撤回计划，请重新编辑')
  } catch (error) {
    message.error('撤回失败，请重试')
  } finally {
    withdrawing.value = false
  }
}

const formatQuarterTitle = (year: string, quarter: string) => {
  const quarterMap = {
    Q1: '第一季度',
    Q2: '第二季度',
    Q3: '第三季度',
    Q4: '第四季度'
  }
  return `${year}年 ${quarterMap[quarter]}`
}

const formatResponsible = (responsible: string[]) => {
  if (!responsible || responsible.length === 0) return '-'
  if (responsible.length === 1) return responsible[0]
  return `${responsible[0]} 等${responsible.length}人`
}

onMounted(() => {
  console.log('季度计划页面初始化')
})
</script>

<style scoped>
.quarterly-plans {
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

.actions {
  display: flex;
  align-items: center;
  gap: 16px;
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
</style> 