<template>
  <div class="weekly-reports">
    <!-- 页面标题和操作 -->
    <div class="page-header">
      <div class="header-content">
        <div class="title-area">
          <h2>周报管理</h2>
          <p>查看和管理周报，支持表格内直接编辑</p>
        </div>
        <div class="actions">
          <a-button @click="autoGenerateFromDaily" style="margin-right: 8px">
            <ThunderboltOutlined />
            从日报生成
          </a-button>
          <a-button type="primary" @click="addNewWeeklyReport">
            <PlusOutlined />
            新增周报
          </a-button>
          <a-button @click="saveAllChanges" :loading="saving" style="margin-left: 8px">
            <SaveOutlined />
            保存全部
          </a-button>
        </div>
      </div>
    </div>

    <!-- 筛选区域 -->
    <a-card style="margin-bottom: 16px">
      <a-row :gutter="16">
        <a-col :span="6">
          <a-week-picker
            v-model:value="filters.week"
            placeholder="选择周"
            style="width: 100%"
            @change="handleFilterChange"
          />
        </a-col>
        <a-col :span="6">
          <a-select
            v-model:value="filters.status"
            placeholder="选择状态"
            style="width: 100%"
            @change="handleFilterChange"
          >
            <a-select-option value="">全部状态</a-select-option>
            <a-select-option value="draft">草稿</a-select-option>
            <a-select-option value="submitted">已提交</a-select-option>
            <a-select-option value="approved">已审批</a-select-option>
          </a-select>
        </a-col>
        <a-col :span="6">
          <a-select
            v-model:value="viewMode"
            placeholder="查看模式"
            style="width: 100%"
            @change="handleViewModeChange"
          >
            <a-select-option value="plan">计划制定</a-select-option>
            <a-select-option value="summary">总结填写</a-select-option>
            <a-select-option value="compare">计划对比</a-select-option>
          </a-select>
        </a-col>
        <a-col :span="6">
          <a-input-search
            v-model:value="filters.keyword"
            placeholder="搜索周报内容"
            @search="handleFilterChange"
          />
        </a-col>
      </a-row>
    </a-card>

    <!-- 总结填写模式 -->
    <div v-if="viewMode === 'summary'">
      <!-- 总结提示 -->
      <a-alert
        message="周末总结填写"
        description="请根据本周计划，填写实际完成情况、遇到的问题等总结信息。原计划内容将保持不变。"
        type="info"
        show-icon
        style="margin-bottom: 16px"
      />

      <!-- 总结表格 -->
      <a-card title="周度工作总结">
        <template #extra>
          <a-space>
            <a-button @click="saveAllSummaries" :loading="saving">
              <SaveOutlined />
              保存全部总结
            </a-button>
            <a-button type="primary" @click="submitWeeklySummary">
              提交总结
            </a-button>
          </a-space>
        </template>

        <a-table
          :dataSource="filteredReports"
          :columns="summaryColumns"
          :loading="loading"
          :pagination="false"
          size="middle"
          :scroll="{ x: 1500 }"
        >
          <template #bodyCell="{ column, record }">
            <!-- 只读的计划字段 -->
            <template v-if="column.key === 'weekTheme'">
              <span class="readonly-field">{{ record.weekTheme }}</span>
            </template>
            <template v-else-if="column.key === 'plannedWork'">
              <span class="readonly-field">{{ record.plannedWork }}</span>
            </template>

            <!-- 可编辑的总结字段 -->
            <template v-else-if="column.key === 'completedWork'">
              <a-textarea
                v-model:value="record.completedWork"
                :rows="3"
                placeholder="请填写实际完成的工作"
                @change="markAsChanged(record.id)"
              />
            </template>
            <template v-else-if="column.key === 'issues'">
              <a-textarea
                v-model:value="record.issues"
                :rows="2"
                placeholder="请填写遇到的问题"
                @change="markAsChanged(record.id)"
              />
            </template>
            <template v-else-if="column.key === 'nextWeekPlan'">
              <a-textarea
                v-model:value="record.nextWeekPlan"
                :rows="2"
                placeholder="请填写下周计划"
                @change="markAsChanged(record.id)"
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
          :dataSource="filteredReports"
          :columns="compareColumns"
          :loading="loading"
          :pagination="false"
          size="middle"
          :scroll="{ x: 2000 }"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'weekTheme'">
              <span class="compare-field">{{ record.weekTheme }}</span>
            </template>
            <template v-else-if="column.key === 'planContent'">
              <div class="plan-content">
                <div><strong>计划工作:</strong> {{ record.plannedWork }}</div>
              </div>
            </template>
            <template v-else-if="column.key === 'actualResult'">
              <div class="result-content">
                <div><strong>完成工作:</strong> {{ record.completedWork || '未填写' }}</div>
                <div v-if="record.issues"><strong>遇到问题:</strong> {{ record.issues }}</div>
                <div v-if="record.nextWeekPlan"><strong>下周计划:</strong> {{ record.nextWeekPlan }}</div>
              </div>
            </template>
          </template>
        </a-table>
      </a-card>
    </div>

    <!-- 原有的计划制定模式 -->
    <div v-else>
      <!-- 可编辑周报表格 -->
      <a-card title="周报列表 - 表格编辑模式">
        <a-table
          :dataSource="filteredReports"
          :columns="editableColumns"
          :loading="loading"
          :pagination="pagination"
          @change="handleTableChange"
          row-key="id"
          size="small"
          :scroll="{ x: 1200 }"
        >
          <template #bodyCell="{ column, record, index }">
            <!-- 序号列 -->
            <template v-if="column.key === 'index'">
              {{ index + 1 }}
            </template>

            <!-- 可编辑的周主题列 -->
            <template v-else-if="column.key === 'weekTheme'">
              <a-input
                v-model:value="record.weekTheme"
                placeholder="请输入本周主题"
                @change="markAsChanged(record.id)"
                size="small"
              />
            </template>

            <!-- 可编辑的工作完成情况列 -->
            <template v-else-if="column.key === 'completedWork'">
              <a-textarea
                v-model:value="record.completedWork"
                placeholder="请输入已完成的工作"
                :rows="3"
                @change="markAsChanged(record.id)"
                size="small"
              />
            </template>

            <!-- 可编辑的下周计划列 -->
            <template v-else-if="column.key === 'nextWeekPlan'">
              <a-textarea
                v-model:value="record.nextWeekPlan"
                placeholder="请输入下周工作计划"
                :rows="3"
                @change="markAsChanged(record.id)"
                size="small"
              />
            </template>

            <!-- 可编辑的遇到问题列 -->
            <template v-else-if="column.key === 'issues'">
              <a-textarea
                v-model:value="record.issues"
                placeholder="请输入遇到的问题"
                :rows="2"
                @change="markAsChanged(record.id)"
                size="small"
              />
            </template>

            <!-- 可编辑的需要协助列 -->
            <template v-else-if="column.key === 'needHelp'">
              <a-textarea
                v-model:value="record.needHelp"
                placeholder="请输入需要的协助"
                :rows="2"
                @change="markAsChanged(record.id)"
                size="small"
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

            <!-- 工作时长列 -->
            <template v-else-if="column.key === 'workHours'">
              <a-input-number
                v-model:value="record.workHours"
                :min="0"
                :max="168"
                @change="markAsChanged(record.id)"
                size="small"
                style="width: 100%"
                placeholder="小时"
              />
            </template>

            <!-- 状态列 -->
            <template v-else-if="column.key === 'status'">
              <a-tag :color="getStatusColor(record.status)">
                {{ getStatusText(record.status) }}
              </a-tag>
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
                      <a-menu-item key="copy">复制</a-menu-item>
                      <a-menu-item key="export">导出</a-menu-item>
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

    <!-- 从日报生成弹窗 -->
    <a-modal
      v-model:open="showGenerateModal"
      title="从日报生成周报"
      width="600px"
      @ok="handleGenerateFromDaily"
      @cancel="showGenerateModal = false"
    >
      <a-form layout="vertical">
        <a-form-item label="选择周">
          <a-week-picker
            v-model:value="generateForm.week"
            placeholder="选择要生成周报的周"
            style="width: 100%"
          />
        </a-form-item>
        <a-form-item label="生成说明">
          <a-alert
            message="系统将自动汇总选定周的所有日报内容生成周报，您可以在生成后进行编辑调整。"
            type="info"
            show-icon
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
  SaveOutlined,
  DeleteOutlined,
  DownOutlined,
  ThunderboltOutlined
} from '@ant-design/icons-vue'

// 页面状态
const loading = ref(false)
const saving = ref(false)
const showGenerateModal = ref(false)
const changedRows = ref(new Set<number>())
const viewMode = ref('plan')  // 新增：视图模式

// 筛选条件
const filters = reactive({
  week: null,
  status: '',
  priority: '',
  keyword: ''
})

// 生成表单
const generateForm = reactive({
  week: null as any
})

// 可编辑表格列定义
const editableColumns = [
  {
    title: '序号',
    key: 'index',
    width: 60,
    fixed: 'left'
  },
  {
    title: '周时间',
    key: 'weekRange',
    dataIndex: 'weekRange',
    width: 120,
    fixed: 'left'
  },
  {
    title: '本周主题',
    key: 'weekTheme',
    width: 150
  },
  {
    title: '已完成工作',
    key: 'completedWork',
    width: 250
  },
  {
    title: '下周计划',
    key: 'nextWeekPlan',
    width: 250
  },
  {
    title: '遇到问题',
    key: 'issues',
    width: 200
  },
  {
    title: '需要协助',
    key: 'needHelp',
    width: 200
  },
  {
    title: '优先级',
    key: 'priority',
    width: 100
  },
  {
    title: '工作时长(h)',
    key: 'workHours',
    width: 100
  },
  {
    title: '状态',
    key: 'status',
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

// 周报数据
const weeklyReports = ref([
  {
    id: 1,
    weekRange: '2024-01-01~2024-01-07',
    weekTheme: '项目启动准备',
    plannedWork: '1. 完成项目需求分析\n2. 搭建开发环境\n3. 制定开发计划',
    completedWork: '1. 已完成项目需求分析\n2. 开发环境搭建完成\n3. 开发计划制定完毕',
    nextWeekPlan: '1. 开始核心功能开发\n2. 完成用户界面设计\n3. 搭建测试环境',
    issues: '开发环境配置存在兼容性问题',
    needHelp: '需要运维同事协助解决服务器配置问题',
    priority: 'high',
    workHours: 40,
    status: 'submitted',
    saving: false
  },
  {
    id: 2,
    weekRange: '2024-01-08~2024-01-14',
    weekTheme: '核心功能开发',
    plannedWork: '1. 完成用户登录功能\n2. 搭建基础框架\n3. 完成数据库设计',
    completedWork: '1. 用户登录功能已完成\n2. 基础框架搭建中\n3. 数据库设计完成',
    nextWeekPlan: '1. 完成业务逻辑开发\n2. 进行单元测试\n3. 编写技术文档',
    issues: '数据库查询性能需要优化',
    needHelp: '需要DBA协助优化数据库查询',
    priority: 'medium',
    workHours: 42,
    status: 'draft',
    saving: false
  },
  {
    id: 3,
    weekRange: '2024-01-15~2024-01-21',
    weekTheme: '业务功能完善',
    plannedWork: '1. 完成权限管理模块\n2. 实现数据导出功能\n3. 优化系统性能',
    completedWork: '',
    nextWeekPlan: '',
    issues: '',
    needHelp: '',
    priority: 'high',
    workHours: 0,
    status: 'draft',
    saving: false
  }
])

// 过滤后的周报列表
const filteredReports = computed(() => {
  let result = weeklyReports.value

  if (filters.status) {
    result = result.filter(report => report.status === filters.status)
  }
  
  if (filters.priority) {
    result = result.filter(report => report.priority === filters.priority)
  }
  
  if (filters.keyword) {
    result = result.filter(report => 
      report.weekTheme.includes(filters.keyword) || 
      report.completedWork.includes(filters.keyword) ||
      report.nextWeekPlan.includes(filters.keyword)
    )
  }

  return result
})

// 获取状态颜色
const getStatusColor = (status: string) => {
  const colorMap: Record<string, string> = {
    'draft': '#d9d9d9',
    'submitted': '#1890ff',
    'approved': '#52c41a'
  }
  return colorMap[status] || '#d9d9d9'
}

// 获取状态文本
const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    'draft': '草稿',
    'submitted': '已提交',
    'approved': '已审批'
  }
  return textMap[status] || '未知'
}

// 标记行已修改
const markAsChanged = (id: number) => {
  changedRows.value.add(id)
}

// 新增周报
const addNewWeeklyReport = () => {
  const newId = Math.max(...weeklyReports.value.map(r => r.id)) + 1
  const currentWeek = dayjs()
  const weekStart = currentWeek.startOf('week')
  const weekEnd = currentWeek.endOf('week')
  
  const newReport = {
    id: newId,
    weekRange: `${weekStart.format('YYYY-MM-DD')}~${weekEnd.format('YYYY-MM-DD')}`,
    weekTheme: '',
    plannedWork: '',
    completedWork: '',
    nextWeekPlan: '',
    issues: '',
    needHelp: '',
    priority: 'medium',
    workHours: 0,
    status: 'draft',
    saving: false
  }
  
  weeklyReports.value.unshift(newReport)
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
  const index = weeklyReports.value.findIndex(r => r.id === record.id)
  if (index > -1) {
    weeklyReports.value.splice(index, 1)
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
    message.success('全部保存成功')
  } catch (error) {
    message.error('保存失败')
  } finally {
    saving.value = false
  }
}

// 从日报自动生成
const autoGenerateFromDaily = () => {
  showGenerateModal.value = true
}

// 处理从日报生成
const handleGenerateFromDaily = async () => {
  if (!generateForm.week) {
    message.error('请选择要生成周报的周')
    return
  }

  try {
    // 模拟从日报API获取数据并生成周报
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    const newId = Math.max(...weeklyReports.value.map(r => r.id)) + 1
    const weekStart = generateForm.week.startOf('week')
    const weekEnd = generateForm.week.endOf('week')
    
    const generatedReport = {
      id: newId,
      weekRange: `${weekStart.format('YYYY-MM-DD')}~${weekEnd.format('YYYY-MM-DD')}`,
      weekTheme: '从日报生成的周报',
      plannedWork: '根据日报汇总的计划工作内容',
      completedWork: '从本周日报自动汇总：\n1. 完成了多项开发任务\n2. 解决了若干技术问题\n3. 参与了团队会议',
      nextWeekPlan: '基于本周进展制定下周计划',
      issues: '从日报中识别的问题',
      needHelp: '需要协助的事项',
      priority: 'medium',
      workHours: 40,
      status: 'draft',
      saving: false
    }
    
    weeklyReports.value.unshift(generatedReport)
    showGenerateModal.value = false
    generateForm.week = null
    message.success('周报生成成功，请检查并完善内容')
  } catch (error) {
    message.error('生成周报失败')
  }
}

// 行操作处理
const handleRowAction = (e: any, record: any) => {
  const { key } = e
  console.log('Row action:', key, record)
  
  switch (key) {
    case 'submit':
      record.status = 'submitted'
      markAsChanged(record.id)
      message.info('已提交审批')
      break
    case 'copy':
      const newRow = { ...record, id: Math.max(...weeklyReports.value.map(r => r.id)) + 1 }
      weeklyReports.value.push(newRow)
      message.success('复制成功')
      break
    case 'export':
      message.info('导出功能开发中...')
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

// 页面初始化
onMounted(() => {
  pagination.total = weeklyReports.value.length
})

// 新增：总结表格列定义
const summaryColumns = [
  {
    title: '周时间',
    key: 'weekRange',
    dataIndex: 'weekRange',
    width: 120,
    fixed: 'left'
  },
  {
    title: '本周主题',
    key: 'weekTheme',
    width: 120
  },
  {
    title: '计划工作',
    key: 'plannedWork',
    width: 200
  },
  {
    title: '实际完成',
    key: 'completedWork',
    width: 250
  },
  {
    title: '遇到问题',
    key: 'issues',
    width: 200
  },
  {
    title: '下周计划',
    key: 'nextWeekPlan',
    width: 200
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
    title: '周时间',
    key: 'weekRange',
    dataIndex: 'weekRange',
    width: 120,
    fixed: 'left'
  },
  {
    title: '本周主题',
    key: 'weekTheme',
    width: 120
  },
  {
    title: '计划内容',
    key: 'planContent',
    width: 300
  },
  {
    title: '实际结果',
    key: 'actualResult',
    width: 350
  }
]

// 新增方法：视图模式变化
const handleViewModeChange = () => {
  console.log('View mode changed:', viewMode.value)
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

// 新增方法：提交周总结
const submitWeeklySummary = () => {
  message.success('周报总结提交成功，等待上级查阅')
}

// 新增方法：查看计划详情
const viewPlanDetail = (record: any) => {
  message.info(`查看 ${record.weekTheme} 的计划详情`)
}
</script>

<style scoped>
.weekly-reports {
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

:deep(.ant-table-tbody > tr > td) {
  vertical-align: top;
}

:deep(.ant-textarea) {
  min-height: 60px;
}
</style> 