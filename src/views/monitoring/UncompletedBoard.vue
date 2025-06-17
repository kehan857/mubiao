<template>
  <div class="uncompleted-board">
    <!-- 页面标题 -->
    <div class="page-header">
      <div class="header-content">
        <div class="title-area">
          <h2>未完成指标看板</h2>
          <p>监控和分析未完成的目标指标，支持深度分析和跟进</p>
        </div>
        <div class="actions">
          <a-button @click="refreshData" :loading="loading">
            <ReloadOutlined />
            刷新数据
          </a-button>
          <a-button type="primary" @click="exportReport">
            <DownloadOutlined />
            导出报告
          </a-button>
        </div>
      </div>
    </div>

    <!-- 统计卡片 -->
    <a-row :gutter="16" style="margin-bottom: 24px">
      <a-col :span="6">
        <a-card>
          <a-statistic
            title="未完成目标总数"
            :value="statistics.totalUncompleted"
            :value-style="{ color: '#cf1322' }"
          >
            <template #prefix>
              <ExclamationCircleOutlined />
            </template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <a-statistic
            title="风险目标数量"
            :value="statistics.riskCount"
            :value-style="{ color: '#fa8c16' }"
          >
            <template #prefix>
              <WarningOutlined />
            </template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <a-statistic
            title="平均完成率"
            :value="statistics.averageCompletion"
            suffix="%"
            :value-style="{ color: '#389e0d' }"
          >
            <template #prefix>
              <RiseOutlined />
            </template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <a-statistic
            title="需要支持项目"
            :value="statistics.needSupportCount"
            :value-style="{ color: '#1890ff' }"
          >
            <template #prefix>
              <TeamOutlined />
            </template>
          </a-statistic>
        </a-card>
      </a-col>
    </a-row>

    <!-- 筛选区域 -->
    <a-card style="margin-bottom: 16px">
      <a-row :gutter="16">
        <a-col :span="6">
          <a-select
            v-model:value="filters.period"
            placeholder="选择时期"
            style="width: 100%"
            @change="handleFilterChange"
          >
            <a-select-option value="">全部时期</a-select-option>
            <a-select-option value="2024-Q1">2024年Q1</a-select-option>
            <a-select-option value="2024-Q2">2024年Q2</a-select-option>
            <a-select-option value="2024-01">2024年1月</a-select-option>
            <a-select-option value="2024-02">2024年2月</a-select-option>
          </a-select>
        </a-col>
        <a-col :span="6">
          <a-select
            v-model:value="filters.department"
            placeholder="选择部门"
            style="width: 100%"
            @change="handleFilterChange"
          >
            <a-select-option value="">全部部门</a-select-option>
            <a-select-option value="技术部">技术部</a-select-option>
            <a-select-option value="产品部">产品部</a-select-option>
            <a-select-option value="市场部">市场部</a-select-option>
            <a-select-option value="人事部">人事部</a-select-option>
          </a-select>
        </a-col>
        <a-col :span="6">
          <a-select
            v-model:value="filters.status"
            placeholder="风险等级"
            style="width: 100%"
            @change="handleFilterChange"
          >
            <a-select-option value="">全部等级</a-select-option>
            <a-select-option value="high-risk">高风险</a-select-option>
            <a-select-option value="medium-risk">中风险</a-select-option>
            <a-select-option value="low-risk">低风险</a-select-option>
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

    <!-- 统计图表 -->
    <a-row :gutter="16" style="margin-bottom: 24px">
      <a-col :span="12">
        <a-card title="未完成原因分析" style="height: 450px">
          <div ref="reasonChartRef" style="height: 370px"></div>
        </a-card>
      </a-col>
      <a-col :span="12">
        <a-card title="各部门未完成指标分布" style="height: 450px">
          <div ref="departmentDistChartRef" style="height: 370px"></div>
        </a-card>
      </a-col>
    </a-row>

    <!-- 完成率趋势和风险等级分布 -->
    <a-row :gutter="16" style="margin-bottom: 24px">
      <a-col :span="12">
        <a-card title="月度完成率趋势" style="height: 400px">
          <div ref="trendChartRef" style="height: 320px"></div>
        </a-card>
      </a-col>
      <a-col :span="12">
        <a-card title="风险等级分布" style="height: 400px">
          <div ref="riskChartRef" style="height: 320px"></div>
        </a-card>
      </a-col>
    </a-row>

    <!-- 未完成指标列表 -->
    <a-card title="未完成指标详情">
      <template #extra>
        <a-space>
          <a-button @click="batchMarkSupport" :disabled="selectedRows.length === 0">
            批量标记需要支持
          </a-button>
          <a-button @click="batchAssignFollowUp" :disabled="selectedRows.length === 0">
            批量分配跟进
          </a-button>
        </a-space>
      </template>

      <a-table
        :dataSource="filteredUncompletedItems"
        :columns="uncompletedColumns"
        :loading="loading"
        :pagination="pagination"
        :row-selection="{ selectedRowKeys: selectedRows, onChange: handleSelectionChange }"
        @change="handleTableChange"
        row-key="id"
        :scroll="{ x: 1500 }"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'assignee'">
            <a-space>
              <a-avatar size="small">{{ record.assigneeName.charAt(0) }}</a-avatar>
              <span>{{ record.assigneeName }}</span>
            </a-space>
          </template>

          <template v-else-if="column.key === 'progress'">
            <a-progress 
              :percent="record.currentProgress" 
              size="small" 
              :status="getProgressStatus(record.currentProgress)"
              style="width: 120px"
            />
          </template>

          <template v-else-if="column.key === 'riskLevel'">
            <a-tag :color="getRiskColor(record.riskLevel)">
              {{ getRiskText(record.riskLevel) }}
            </a-tag>
          </template>

          <template v-else-if="column.key === 'delayDays'">
            <span :style="{ color: record.delayDays > 7 ? '#cf1322' : '#fa8c16' }">
              {{ record.delayDays }}天
            </span>
          </template>

          <template v-else-if="column.key === 'needSupport'">
            <a-tag v-if="record.needSupport" color="orange">需要支持</a-tag>
            <span v-else>-</span>
          </template>

          <template v-else-if="column.key === 'actions'">
            <a-space>
              <a-button 
                type="primary" 
                size="small" 
                @click="viewDetail(record)"
              >
                查看详情
              </a-button>
              <a-button 
                size="small" 
                @click="assignFollowUp(record)"
                v-if="!record.followUpPerson"
              >
                分配跟进
              </a-button>
              <a-button 
                size="small" 
                @click="markAsSupport(record)"
                v-if="!record.needSupport"
              >
                标记支持
              </a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 详情弹窗 -->
    <a-modal
      v-model:open="showDetailModal"
      :title="`${currentItem?.goalTitle} - 详情分析`"
      width="1000px"
      @cancel="showDetailModal = false"
      :footer="null"
    >
      <div class="detail-content">
        <!-- 基本信息 -->
        <a-descriptions title="基本信息" :column="2" size="small">
          <a-descriptions-item label="目标内容">{{ currentItem?.goalTitle }}</a-descriptions-item>
          <a-descriptions-item label="负责人">{{ currentItem?.assigneeName }}</a-descriptions-item>
          <a-descriptions-item label="所属部门">{{ currentItem?.department }}</a-descriptions-item>
          <a-descriptions-item label="计划完成时间">{{ currentItem?.plannedEndDate }}</a-descriptions-item>
          <a-descriptions-item label="当前进度">{{ currentItem?.currentProgress }}%</a-descriptions-item>
          <a-descriptions-item label="延期天数">{{ currentItem?.delayDays }}天</a-descriptions-item>
        </a-descriptions>

        <!-- 问题分析 -->
        <a-divider />
        <h4>问题分析</h4>
        <a-alert
          :message="currentItem?.problemDescription"
          type="warning"
          show-icon
          style="margin-bottom: 16px"
        />
        
        <!-- 建议措施 -->
        <h4>建议措施</h4>
        <ul style="padding-left: 20px;">
          <li v-for="(suggestion, index) in currentItem?.suggestions" :key="index">
            {{ suggestion }}
          </li>
        </ul>
      </div>
    </a-modal>

    <!-- 分配跟进弹窗 -->
    <a-modal
      v-model:open="showAssignModal"
      title="分配跟进人员"
      @ok="handleAssignSubmit"
      @cancel="showAssignModal = false"
    >
      <a-form layout="vertical">
        <a-form-item label="跟进人员">
          <a-select
            v-model:value="assignForm.person"
            placeholder="选择跟进人员"
            style="width: 100%"
          >
            <a-select-option v-for="person in followUpPersons" :key="person.id" :value="person.id">
              {{ person.name }} - {{ person.department }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="跟进要求">
          <a-textarea
            v-model:value="assignForm.requirements"
            :rows="3"
            placeholder="请输入具体的跟进要求和期望"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, nextTick, onUnmounted } from 'vue'
import { message } from 'ant-design-vue'
import * as echarts from 'echarts'
import {
  ReloadOutlined,
  DownloadOutlined,
  ExclamationCircleOutlined,
  WarningOutlined,
  RiseOutlined,
  TeamOutlined
} from '@ant-design/icons-vue'

// 页面状态
const loading = ref(false)
const showDetailModal = ref(false)
const showAssignModal = ref(false)
const selectedRows = ref<number[]>([])
const currentItem = ref<any>(null)

// 筛选条件
const filters = reactive({
  period: '',
  department: '',
  status: '',
  keyword: ''
})

// 分配表单
const assignForm = reactive({
  person: null,
  requirements: ''
})

// 统计数据
const statistics = ref({
  totalUncompleted: 23,
  riskCount: 8,
  averageCompletion: 67,
  needSupportCount: 5
})

// 跟进人员列表
const followUpPersons = ref([
  { id: 1, name: '张主管', department: '技术部' },
  { id: 2, name: '李经理', department: '产品部' },
  { id: 3, name: '王总监', department: '市场部' }
])

// 图表实例
const reasonChart = ref<echarts.ECharts>()
const departmentDistChart = ref<echarts.ECharts>()
const trendChart = ref<echarts.ECharts>()
const riskChart = ref<echarts.ECharts>()

// 未完成指标数据
const uncompletedItems = ref([
  {
    id: 1,
    goalTitle: '用户增长目标达成率提升',
    assigneeName: '张三',
    department: '技术部',
    currentProgress: 45,
    targetProgress: 100,
    plannedEndDate: '2024-02-28',
    delayDays: 15,
    riskLevel: 'high-risk',
    needSupport: true,
    followUpPerson: null,
    problemDescription: '用户获取成本上升，转化率下降，需要优化推广策略',
    suggestions: [
      '优化用户获取渠道，降低获取成本',
      '改进产品功能，提升用户转化率',
      '加强数据分析，精准投放'
    ],
    uncompletedReason: '资源不足'
  },
  {
    id: 2,
    goalTitle: '系统性能优化完成度',
    assigneeName: '李四',
    department: '技术部',
    currentProgress: 70,
    targetProgress: 100,
    plannedEndDate: '2024-03-15',
    delayDays: 5,
    riskLevel: 'medium-risk',
    needSupport: false,
    followUpPerson: 1,
    problemDescription: '核心模块重构复杂度超预期，需要更多技术资源',
    suggestions: [
      '增加技术人员投入',
      '简化重构方案，分阶段实施',
      '加强技术评审，控制风险'
    ],
    uncompletedReason: '技术难度'
  },
  {
    id: 3,
    goalTitle: '新产品功能上线率',
    assigneeName: '王五',
    department: '产品部',
    currentProgress: 80,
    targetProgress: 100,
    plannedEndDate: '2024-02-20',
    delayDays: 25,
    riskLevel: 'high-risk',
    needSupport: true,
    followUpPerson: null,
    problemDescription: '测试阶段发现重大Bug，需要回退重新开发',
    suggestions: [
      '加强测试流程，提前发现问题',
      '优化开发流程，减少返工',
      '增加技术评审环节'
    ],
    uncompletedReason: '时间紧张'
  },
  {
    id: 4,
    goalTitle: '市场拓展目标达成',
    assigneeName: '赵六',
    department: '市场部',
    currentProgress: 55,
    targetProgress: 100,
    plannedEndDate: '2024-03-10',
    delayDays: 12,
    riskLevel: 'medium-risk',
    needSupport: false,
    followUpPerson: null,
    problemDescription: '市场竞争激烈，客户获取成本过高',
    suggestions: [
      '调整市场策略',
      '优化产品定位',
      '加强品牌推广'
    ],
    uncompletedReason: '资源不足'
  },
  {
    id: 5,
    goalTitle: '员工培训覆盖率',
    assigneeName: '孙七',
    department: '人事部',
    currentProgress: 60,
    targetProgress: 100,
    plannedEndDate: '2024-02-25',
    delayDays: 8,
    riskLevel: 'low-risk',
    needSupport: false,
    followUpPerson: null,
    problemDescription: '培训资源有限，员工参与度不高',
    suggestions: [
      '增加培训投入',
      '优化培训内容',
      '提高员工积极性'
    ],
    uncompletedReason: '其他因素'
  }
])

// 表格列定义
const uncompletedColumns = [
  {
    title: '目标内容',
    key: 'goalTitle',
    dataIndex: 'goalTitle',
    width: 200,
    fixed: 'left'
  },
  {
    title: '负责人',
    key: 'assignee',
    width: 120
  },
  {
    title: '部门',
    key: 'department',
    dataIndex: 'department',
    width: 100
  },
  {
    title: '当前进度',
    key: 'progress',
    width: 150
  },
  {
    title: '计划完成时间',
    key: 'plannedEndDate',
    dataIndex: 'plannedEndDate',
    width: 120
  },
  {
    title: '延期天数',
    key: 'delayDays',
    width: 100
  },
  {
    title: '风险等级',
    key: 'riskLevel',
    width: 100
  },
  {
    title: '需要支持',
    key: 'needSupport',
    width: 100
  },
  {
    title: '操作',
    key: 'actions',
    width: 200,
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

// 过滤后的数据
const filteredUncompletedItems = computed(() => {
  let result = uncompletedItems.value

  if (filters.department) {
    result = result.filter(item => item.department === filters.department)
  }
  
  if (filters.status) {
    result = result.filter(item => item.riskLevel === filters.status)
  }
  
  if (filters.keyword) {
    result = result.filter(item => 
      item.goalTitle.includes(filters.keyword) ||
      item.assigneeName.includes(filters.keyword)
    )
  }

  return result
})

// 获取进度状态
const getProgressStatus = (progress: number) => {
  if (progress < 30) return 'exception'
  if (progress < 70) return 'active'
  return 'success'
}

// 获取风险等级颜色
const getRiskColor = (level: string) => {
  const colorMap: Record<string, string> = {
    'high-risk': '#f5222d',
    'medium-risk': '#fa8c16',
    'low-risk': '#fadb14'
  }
  return colorMap[level] || '#d9d9d9'
}

// 获取风险等级文本
const getRiskText = (level: string) => {
  const textMap: Record<string, string> = {
    'high-risk': '高风险',
    'medium-risk': '中风险',
    'low-risk': '低风险'
  }
  return textMap[level] || '未知'
}

// 图表引用
const reasonChartRef = ref<HTMLElement>()
const departmentDistChartRef = ref<HTMLElement>()
const trendChartRef = ref<HTMLElement>()
const riskChartRef = ref<HTMLElement>()

// 初始化未完成原因分析饼图
const initReasonChart = () => {
  if (!reasonChartRef.value) return
  
  reasonChart.value = echarts.init(reasonChartRef.value)
  
  // 统计未完成原因
  const reasonCount = uncompletedItems.value.reduce((acc, item) => {
    acc[item.uncompletedReason] = (acc[item.uncompletedReason] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  const reasonData = Object.entries(reasonCount).map(([name, value]) => ({ name, value }))
  
  const option = {
    title: {
      text: '未完成原因占比',
      subtext: '基于当前未完成项目统计',
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold'
      },
      subtextStyle: {
        fontSize: 12,
        color: '#666'
      }
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      top: 'middle',
      textStyle: {
        fontSize: 12
      }
    },
    series: [
      {
        name: '未完成原因',
        type: 'pie',
        radius: ['30%', '70%'],
        center: ['60%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 20,
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: reasonData,
        color: ['#ff4d4f', '#fa8c16', '#fadb14', '#52c41a', '#1890ff']
      }
    ]
  }
  
  reasonChart.value.setOption(option)
}

// 初始化部门分布柱状图
const initDepartmentDistChart = () => {
  if (!departmentDistChartRef.value) return
  
  departmentDistChart.value = echarts.init(departmentDistChartRef.value)
  
  // 统计各部门未完成指标数量
  const deptCount = uncompletedItems.value.reduce((acc, item) => {
    acc[item.department] = (acc[item.department] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  const departments = Object.keys(deptCount)
  const counts = Object.values(deptCount)
  
  const option = {
    title: {
      text: '各部门未完成指标数量',
      subtext: '单位：个',
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold'
      },
      subtextStyle: {
        fontSize: 12,
        color: '#666'
      }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: '{b}: {c}个未完成指标'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: departments,
      axisTick: {
        alignWithLabel: true
      },
      axisLabel: {
        fontSize: 12
      }
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        fontSize: 12
      }
    },
    series: [
      {
        name: '未完成指标数量',
        type: 'bar',
        barWidth: '60%',
        itemStyle: {
          borderRadius: [4, 4, 0, 0],
          color: function(params: any) {
            const colors = ['#ff4d4f', '#fa8c16', '#fadb14', '#52c41a']
            return colors[params.dataIndex % colors.length]
          }
        },
        label: {
          show: true,
          position: 'top',
          fontSize: 14,
          fontWeight: 'bold',
          formatter: '{c}个'
        },
        data: counts
      }
    ]
  }
  
  departmentDistChart.value.setOption(option)
}

// 初始化完成率趋势图
const initTrendChart = () => {
  if (!trendChartRef.value) return
  
  trendChart.value = echarts.init(trendChartRef.value)
  
  const option = {
    title: {
      text: '近6个月完成率趋势',
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold'
      }
    },
    tooltip: {
      trigger: 'axis',
      formatter: '{b}: {c}%'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: ['2023-08', '2023-09', '2023-10', '2023-11', '2023-12', '2024-01']
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 100,
      axisLabel: {
        formatter: '{value}%'
      }
    },
    series: [
      {
        name: '完成率',
        type: 'line',
        data: [75, 68, 72, 65, 58, 67],
        smooth: true,
        lineStyle: {
          color: '#1890ff',
          width: 3
        },
        itemStyle: {
          color: '#1890ff',
          borderColor: '#fff',
          borderWidth: 2
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [{
              offset: 0, color: 'rgba(24, 144, 255, 0.3)'
            }, {
              offset: 1, color: 'rgba(24, 144, 255, 0.1)'
            }]
          }
        }
      }
    ]
  }
  
  trendChart.value.setOption(option)
}

// 初始化风险等级分布图
const initRiskChart = () => {
  if (!riskChartRef.value) return
  
  riskChart.value = echarts.init(riskChartRef.value)
  
  // 统计风险等级分布
  const riskCount = uncompletedItems.value.reduce((acc, item) => {
    const riskText = getRiskText(item.riskLevel)
    acc[riskText] = (acc[riskText] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  const riskData = Object.entries(riskCount).map(([name, value]) => ({ name, value }))
  
  const option = {
    title: {
      text: '风险等级分布',
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold'
      }
    },
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c}个 ({d}%)'
    },
    legend: {
      orient: 'horizontal',
      bottom: '5%',
      textStyle: {
        fontSize: 12
      }
    },
    series: [
      {
        name: '风险等级',
        type: 'pie',
        radius: '65%',
        center: ['50%', '45%'],
        itemStyle: {
          borderRadius: 8,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          formatter: '{b}\n{c}个',
          fontSize: 12
        },
        data: riskData,
        color: ['#f5222d', '#fa8c16', '#fadb14']
      }
    ]
  }
  
  riskChart.value.setOption(option)
}

// 初始化所有图表
const initCharts = async () => {
  await nextTick()
  initReasonChart()
  initDepartmentDistChart()
  initTrendChart()
  initRiskChart()
}

// 窗口大小改变时重新调整图表
const handleResize = () => {
  reasonChart.value?.resize()
  departmentDistChart.value?.resize()
  trendChart.value?.resize()
  riskChart.value?.resize()
}

// 刷新数据
const refreshData = async () => {
  loading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    initCharts() // 重新初始化图表
    message.success('数据刷新成功')
  } catch (error) {
    message.error('数据刷新失败')
  } finally {
    loading.value = false
  }
}

// 导出报告
const exportReport = () => {
  message.info('导出报告功能开发中...')
}

// 查看详情
const viewDetail = (record: any) => {
  currentItem.value = record
  showDetailModal.value = true
}

// 分配跟进
const assignFollowUp = (record: any) => {
  currentItem.value = record
  assignForm.person = null
  assignForm.requirements = ''
  showAssignModal.value = true
}

// 标记需要支持
const markAsSupport = (record: any) => {
  record.needSupport = true
  message.success('已标记为需要支持')
}

// 处理分配提交
const handleAssignSubmit = () => {
  if (!assignForm.person) {
    message.error('请选择跟进人员')
    return
  }
  
  if (currentItem.value) {
    currentItem.value.followUpPerson = assignForm.person
  }
  
  showAssignModal.value = false
  message.success('跟进人员分配成功')
}

// 批量操作
const batchMarkSupport = () => {
  message.info('批量标记支持功能开发中...')
}

const batchAssignFollowUp = () => {
  message.info('批量分配跟进功能开发中...')
}

// 选择变化处理
const handleSelectionChange = (selectedRowKeys: number[]) => {
  selectedRows.value = selectedRowKeys
}

// 筛选变化处理
const handleFilterChange = () => {
  // 重新初始化图表以反映筛选后的数据
  initCharts()
}

// 表格变化处理
const handleTableChange = (pag: any) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
}

// 页面初始化
onMounted(() => {
  pagination.total = uncompletedItems.value.length
  initCharts()
  window.addEventListener('resize', handleResize)
})

// 页面销毁时清理
onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  reasonChart.value?.dispose()
  departmentDistChart.value?.dispose()
  trendChart.value?.dispose()
  riskChart.value?.dispose()
})
</script>

<style scoped>
.uncompleted-board {
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

.detail-content {
  max-height: 600px;
  overflow-y: auto;
}

:deep(.ant-statistic-title) {
  font-size: 14px;
  margin-bottom: 8px;
}

:deep(.ant-statistic-content) {
  font-size: 20px;
  font-weight: 600;
}

:deep(.ant-table-tbody > tr > td) {
  padding: 8px !important;
}
</style> 