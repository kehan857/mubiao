<template>
  <div class="monthly-plans">
    <!-- 页面标题 -->
    <div class="page-header">
      <div class="header-content">
        <div class="title-area">
          <h2>📅 月度计划管理</h2>
          <p>制定和管理月度目标计划</p>
          <!-- 状态显示 -->
          <div class="status-display">
            <span class="status-label">当前状态：</span>
            <a-tag 
              :style="{ 
                color: monthStatusInfo.color, 
                backgroundColor: monthStatusInfo.bgColor,
                border: `1px solid ${monthStatusInfo.color}`,
                fontWeight: '500'
              }"
            >
              {{ monthStatusInfo.text }}
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
              v-model:value="currentMonth"
              picker="month"
              format="YYYY-MM"
              placeholder="选择月份"
              @change="handleMonthChange"
            />
          </a-space>
        </div>
      </div>
    </div>

    <!-- 计划表格 -->
    <a-card title="2024年11月度计划">
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
            v-if="monthStatus === 'draft'"
          >
            <CheckOutlined />
            提交计划
          </a-button>
          <a-button 
            @click="withdrawPlans" 
            :loading="withdrawing" 
            :disabled="monthStatus !== 'reviewing'"
            v-if="monthStatus === 'reviewing'"
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
            <a-input-number
              v-model:value="record.serialNumber"
              :min="1"
              :max="100"
              :disabled="!canEdit"
              style="width: 80px"
              @change="() => handleDataChange(record)"
            />
          </template>
          
          <template v-else-if="column.key === 'weight'">
            <a-input-number
              v-model:value="record.weight"
              :min="0"
              :max="100"
              :disabled="!canEdit"
              style="width: 80px"
              @change="() => handleDataChange(record)"
            />
          </template>

          <template v-else-if="column.key === 'project'">
            <a-input
              v-model:value="record.project"
              :disabled="!canEdit"
              @change="() => handleDataChange(record)"
            />
          </template>

          <template v-else-if="column.key === 'content'">
            <a-input
              v-model:value="record.content"
              :disabled="!canEdit"
              @change="() => handleDataChange(record)"
            />
          </template>

          <template v-else-if="column.key === 'target'">
            <a-input
              v-model:value="record.target"
              :disabled="!canEdit"
              @change="() => handleDataChange(record)"
            />
          </template>

          <template v-else-if="column.key === 'standard'">
            <a-input
              v-model:value="record.standard"
              :disabled="!canEdit"
              @change="() => handleDataChange(record)"
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
              style="width: 100%"
              placeholder="选择责任人"
              :maxTagCount="1"
              :maxTagPlaceholder="(omittedValues) => `+${omittedValues.length}人`"
              @change="() => handleDataChange(record)"
            >
              <a-select-option v-for="option in responsibleOptions" :key="option" :value="option">
                {{ option }}
              </a-select-option>
            </a-select>
          </template>

          <template v-else-if="column.key === 'timeRange'">
            <a-range-picker
              v-model:value="record.timeRange"
              :disabled="!canEdit"
              style="width: 100%"
              @change="() => handleDataChange(record)"
            />
          </template>

          <template v-else-if="column.key === 'measures'">
            <a-input
              v-model:value="record.measures"
              :disabled="!canEdit"
              @change="() => handleDataChange(record)"
            />
          </template>

          <template v-else-if="column.key === 'actions'">
            <a-space>
              <a-button 
                size="small" 
                danger 
                @click="deletePlan(record)"
                :disabled="!canEdit"
              >
                <DeleteOutlined />
                删除
              </a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 填写样例查看弹窗 -->
    <a-modal
      v-model:open="showExampleModal"
      title="📝 月度计划填写样例"
      width="1400px"
      :footer="null"
      :bodyStyle="{ maxHeight: '70vh', overflow: 'auto' }"
    >
      <a-tabs v-model:activeKey="currentExampleType">
        <a-tab-pane key="tech" tab="💻 技术部样例">
          <div class="example-content">
            <div class="example-header">
              <h4>技术部月度计划填写样例</h4>
              <p class="example-description">适用于技术开发、系统优化、技术管理等工作的月度计划制定</p>
            </div>
            
            <a-table
              :dataSource="techExamples"
              :columns="exampleColumns"
              :pagination="false"
              :scroll="{ x: 1400 }"
              size="small"
              class="example-table"
            />
          </div>
        </a-tab-pane>
        
        <a-tab-pane key="sales" tab="📈 销售部样例">
          <div class="example-content">
            <div class="example-header">
              <h4>销售部月度计划填写样例</h4>
              <p class="example-description">适用于销售目标、客户开发、市场推广等工作的月度计划制定</p>
            </div>
            
            <a-table
              :dataSource="salesExamples"
              :columns="exampleColumns"
              :pagination="false"
              :scroll="{ x: 1400 }"
              size="small"
              class="example-table"
            />
          </div>
        </a-tab-pane>
        
        <a-tab-pane key="general" tab="🌟 通用样例">
          <div class="example-content">
            <div class="example-header">
              <h4>通用月度计划填写样例</h4>
              <p class="example-description">适用于各部门通用的月度计划制定参考</p>
            </div>
            
            <a-table
              :dataSource="generalExamples"
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
          message="💡 填写提示"
          description="1. 权重总和建议控制在100%以内；2. 目标应明确具体，可量化；3. 实施措施要详细可执行；4. 考核标准要客观可衡量"
          type="info"
          show-icon
        />
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { message } from 'ant-design-vue'
import { 
  PlusOutlined, 
  SaveOutlined, 
  CheckOutlined, 
  DeleteOutlined,
  CalendarOutlined,
  FileTextOutlined,
  RollbackOutlined,
  EyeOutlined
} from '@ant-design/icons-vue'
import dayjs from 'dayjs'

// 页面状态
const currentYear = ref(2024)
const currentMonth = ref(dayjs('2024-12'))
const loading = ref(false)
const saving = ref(false)
const submitting = ref(false)
const withdrawing = ref(false)
const selectedRowKeys = ref<number[]>([])
const showExampleModal = ref(false)
const currentExampleType = ref('tech')

// 月度计划整体状态
const monthStatus = ref<'draft' | 'reviewing' | 'approved' | 'rejected'>('draft')

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

// 计划数据
const plans = ref([
  {
    id: 1,
    serialNumber: 1,
    weight: 30,
    project: '产品优化',
    content: '完成用户体验优化',
    target: '提升用户满意度至90%',
    standard: 'NPS评分≥90',
    responsible: ['张三'],
    timeRange: [dayjs().startOf('month'), dayjs().endOf('month')],
    measures: '收集用户反馈，优化界面设计'
  },
  {
    id: 2,
    serialNumber: 2,
    weight: 25,
    project: '技术升级',
    content: '升级系统架构',
    target: '完成核心模块重构',
    standard: '性能提升30%',
    responsible: ['李四'],
    timeRange: [dayjs().startOf('month'), dayjs().endOf('month')],
    measures: '分阶段重构，确保系统稳定'
  },
  {
    id: 3,
    serialNumber: 3,
    weight: 20,
    project: '市场推广',
    content: '开展品牌宣传活动',
    target: '提升品牌知名度20%',
    standard: '品牌认知度调研报告',
    responsible: ['王五'],
    timeRange: [dayjs().startOf('month').add(5, 'day'), dayjs().endOf('month').subtract(3, 'day')],
    measures: '制定推广方案，投放广告，举办活动'
  },
  {
    id: 4,
    serialNumber: 4,
    weight: 15,
    project: '客户服务',
    content: '优化客服流程',
    target: '客户满意度达到95%',
    standard: '客服评分≥4.5分',
    responsible: ['赵六'],
    timeRange: [dayjs().startOf('month').add(10, 'day'), dayjs().endOf('month')],
    measures: '培训客服团队，建立服务标准'
  },
  {
    id: 5,
    serialNumber: 5,
    weight: 25,
    project: '数据分析',
    content: '建立数据监控体系',
    target: '实现业务数据实时监控',
    standard: '关键指标自动预警',
    responsible: ['孙七'],
    timeRange: [dayjs().startOf('month'), dayjs().endOf('month').subtract(5, 'day')],
    measures: '搭建数据平台，设置监控指标'
  },
  {
    id: 6,
    serialNumber: 6,
    weight: 20,
    project: '流程优化',
    content: '梳理业务流程',
    target: '提升工作效率15%',
    standard: '流程时间缩短15%',
    responsible: ['周八'],
    timeRange: [dayjs().startOf('month').add(7, 'day'), dayjs().endOf('month').subtract(2, 'day')],
    measures: '流程梳理，制定标准操作手册'
  },
  {
    id: 7,
    serialNumber: 7,
    weight: 30,
    project: '人才培养',
    content: '实施员工技能培训',
    target: '员工技能水平提升20%',
    standard: '培训考核通过率≥90%',
    responsible: ['吴九'],
    timeRange: [dayjs().startOf('month').add(3, 'day'), dayjs().endOf('month').subtract(7, 'day')],
    measures: '制定培训计划，聘请专业讲师'
  },
  {
    id: 8,
    serialNumber: 8,
    weight: 25,
    project: '成本控制',
    content: '优化采购流程',
    target: '降低采购成本10%',
    standard: '月度成本报告',
    responsible: ['郑十'],
    timeRange: [dayjs().startOf('month'), dayjs().endOf('month').subtract(10, 'day')],
    measures: '供应商评估，议价谈判'
  },
  {
    id: 9,
    serialNumber: 9,
    weight: 35,
    project: '创新研发',
    content: '新产品功能开发',
    target: '完成3个核心功能开发',
    standard: '功能测试通过率100%',
    responsible: ['刘十一'],
    timeRange: [dayjs().startOf('month').add(1, 'day'), dayjs().endOf('month').subtract(1, 'day')],
    measures: '需求分析，技术评估，开发实施'
  },
  {
    id: 10,
    serialNumber: 10,
    weight: 20,
    project: '质量管理',
    content: '建立质量管控体系',
    target: '零缺陷生产目标',
    standard: '缺陷率<0.1%',
    responsible: ['陈十二'],
    timeRange: [dayjs().startOf('month').add(5, 'day'), dayjs().endOf('month')],
    measures: '制定质量标准，实施质量检查'
  }
])

// 计划模板列定义
const planColumns = [
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
    title: '计划完成时间',
    dataIndex: 'timeRange',
    key: 'timeRange',
    width: 200
  },
  {
    title: '实施措施',
    dataIndex: 'measures',
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
    title: '计划完成时间',
    dataIndex: 'timeRange',
    key: 'timeRange',
    width: 200,
    customRender: ({ record }: any) => {
      if (record.timeRange && Array.isArray(record.timeRange)) {
        return `${record.timeRange[0]} 至 ${record.timeRange[1]}`
      }
      return record.timeRange || '-'
    }
  },
  {
    title: '实施措施',
    dataIndex: 'measures',
    key: 'measures',
    width: 200
  }
]

// 技术部样例数据
const techExamples = ref([
  {
    id: 1,
    serialNumber: 1,
    weight: 40,
    project: '核心系统优化',
    content: '对现有核心业务系统进行性能优化和架构重构',
    target: '系统响应时间提升30%，并发处理能力提升50%',
    standard: '平均响应时间<500ms，支持并发用户数>10000',
    responsible: ['张三'],
    timeRange: ['2024-04-01', '2024-04-30'],
    measures: '1.性能分析和瓶颈识别 2.数据库优化 3.缓存策略升级 4.负载均衡配置'
  },
  {
    id: 2,
    serialNumber: 2,
    weight: 30,
    project: '新功能开发',
    content: '开发用户权限管理2.0模块，支持更细粒度的权限控制',
    target: '完成权限管理模块开发并上线',
    standard: '功能测试通过率100%，用户验收通过',
    responsible: ['李四'],
    timeRange: ['2024-04-05', '2024-04-25'],
    measures: '1.需求分析和设计 2.前后端开发 3.单元测试和集成测试 4.部署上线'
  },
  {
    id: 3,
    serialNumber: 3,
    weight: 20,
    project: '技术文档完善',
    content: '更新API文档，编写开发规范和最佳实践指南',
    target: '完善技术文档体系，提升团队开发效率',
    standard: '文档覆盖率达到90%，团队满意度≥4.5分',
    responsible: ['王五'],
    timeRange: ['2024-04-10', '2024-04-28'],
    measures: '1.梳理现有API接口 2.编写详细文档 3.制定开发规范 4.团队培训'
  }
])

// 销售部样例数据
const salesExamples = ref([
  {
    id: 1,
    serialNumber: 1,
    weight: 50,
    project: '新客户开发',
    content: '开发20家新的企业客户，建立合作关系',
    target: '新增有效客户20家，签约客户不少于8家',
    standard: '客户质量评分≥B级，合同金额≥10万',
    responsible: ['赵六'],
    timeRange: ['2024-04-01', '2024-04-30'],
    measures: '1.目标客户调研 2.商务拜访 3.方案演示 4.合同谈判'
  },
  {
    id: 2,
    serialNumber: 2,
    weight: 30,
    project: '老客户维护',
    content: '维护现有重点客户关系，提升客户满意度和续约率',
    target: '重点客户满意度≥90%，续约率≥85%',
    standard: '客户满意度调研，续约合同签署',
    responsible: ['孙七'],
    timeRange: ['2024-04-01', '2024-04-30'],
    measures: '1.定期客户回访 2.需求调研 3.增值服务 4.关系维护'
  },
  {
    id: 3,
    serialNumber: 3,
    weight: 20,
    project: '市场推广活动',
    content: '策划并执行品牌推广活动，提升市场影响力',
    target: '举办3场市场活动，获得100个潜在客户',
    standard: '活动参与度≥80%，潜在客户转化率≥15%',
    responsible: ['周八'],
    timeRange: ['2024-04-08', '2024-04-28'],
    measures: '1.活动策划方案 2.宣传推广 3.现场执行 4.效果评估'
  }
])

// 通用样例数据
const generalExamples = ref([
  {
    id: 1,
    serialNumber: 1,
    weight: 40,
    project: '部门目标落实',
    content: '落实公司月度战略目标，确保部门指标达成',
    target: '部门核心指标完成率≥95%',
    standard: '月度考核达标，上级评估优秀',
    responsible: ['部门负责人'],
    timeRange: ['2024-04-01', '2024-04-30'],
    measures: '1.目标分解 2.周度跟踪 3.问题解决 4.进度汇报'
  },
  {
    id: 2,
    serialNumber: 2,
    weight: 30,
    project: '团队能力提升',
    content: '开展团队培训，提升员工专业技能和工作效率',
    target: '团队整体能力提升20%，员工满意度≥85%',
    standard: '培训考核通过率≥90%，满意度调研',
    responsible: ['各组组长'],
    timeRange: ['2024-04-05', '2024-04-25'],
    measures: '1.培训需求调研 2.制定培训计划 3.组织实施 4.效果评估'
  },
  {
    id: 3,
    serialNumber: 3,
    weight: 20,
    project: '流程优化改进',
    content: '梳理现有工作流程，识别并改进效率瓶颈',
    target: '工作效率提升15%，流程规范化程度达90%',
    standard: '流程文档完善，操作标准化',
    responsible: ['流程负责人'],
    timeRange: ['2024-04-10', '2024-04-28'],
    measures: '1.流程梳理 2.问题识别 3.改进方案 4.标准制定'
  }
])

// 计划统计数据
const planStatistics = computed(() => {
  return {
    total: plans.value.length,
    completionRate: Math.round(Math.random() * 100), // 模拟完成率
    responsibleCount: new Set(plans.value.map(p => p.responsible)).size
  }
})

// 计算属性
const monthStatusInfo = computed(() => statusConfig[monthStatus.value])

const totalWeight = computed(() => {
  return plans.value.reduce((sum, plan) => sum + (plan.weight || 0), 0)
})

const uniqueResponsibles = computed(() => {
  const responsibles = plans.value.map(plan => plan.responsible).filter(Boolean)
  return [...new Set(responsibles)]
})

const canEdit = computed(() => {
  return monthStatus.value === 'draft' || monthStatus.value === 'rejected'
})

const canSubmit = computed(() => {
  return monthStatus.value === 'draft' && plans.value.length > 0
})

// 格式化月份标题
const formatMonthTitle = (month: any) => {
  if (!month) return '请选择月份'
  return month.format('YYYY年MM月') + '度计划'
}

// 新增计划
const addPlan = () => {
  if (!canEdit.value) {
    message.warning('当前状态不允许新增计划')
    return
  }
  
  const newPlan = {
    id: Date.now(),
    serialNumber: plans.value.length + 1,
    weight: 0,
    project: '',
    content: '',
    target: '',
    standard: '',
    responsible: ['本人'],
    timeRange: [dayjs().startOf('month'), dayjs().endOf('month')],
    measures: ''
  }
  plans.value.push(newPlan)
  message.success('新增计划成功')
}

// 删除计划
const deletePlan = (record: any) => {
  const index = plans.value.findIndex(plan => plan.id === record.id)
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
  message.success(`已删除 ${selectedRowKeys.value.length} 条计划`)
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

// 处理月份变化
const handleMonthChange = (month: any) => {
  currentMonth.value = month
  if (month) {
    console.log('月份变化:', month.format('YYYY-MM'))
    // 这里可以根据月份加载对应的计划数据
    // loadMonthlyPlans(month.format('YYYY-MM'))
  }
}

// 提交计划函数
const submitPlans = async () => {
  try {
    submitting.value = true
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 整个月份的计划状态改为审核中
    monthStatus.value = 'reviewing'
    
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
    
    // 整个月份的计划状态改为草稿
    monthStatus.value = 'draft'
    
    message.success('计划撤回成功，可以继续编辑')
  } catch (error) {
    message.error('撤回失败，请重试')
  } finally {
    withdrawing.value = false
  }
}

// 页面初始化
onMounted(() => {
  console.log('月度计划页面初始化')
})
</script>

<style scoped>
.monthly-plans {
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