<template>
  <a-modal
    :open="visible"
    @update:open="handleVisibleChange"
    :title="modalTitle"
    width="1200px"
    :footer="null"
    @cancel="handleCancel"
    class="detailed-audit-modal"
  >
    <div v-if="reportData" class="modal-content">
      <!-- 基本信息卡片 -->
      <a-card title="基本信息" style="margin-bottom: 16px">
        <a-row :gutter="16">
          <a-col :span="8">
            <div class="info-item">
              <div class="label">员工姓名</div>
              <div class="value">{{ reportData.name }}</div>
            </div>
          </a-col>
          <a-col :span="8">
            <div class="info-item">
              <div class="label">所属部门</div>
              <div class="value">{{ reportData.department }}</div>
            </div>
          </a-col>
          <a-col :span="8">
            <div class="info-item">
              <div class="label">职位</div>
              <div class="value">{{ reportData.position }}</div>
            </div>
          </a-col>
          <a-col :span="8">
            <div class="info-item">
              <div class="label">{{ reportType }}期间</div>
              <div class="value">{{ getPeriodText() }}</div>
            </div>
          </a-col>
          <a-col :span="8">
            <div class="info-item">
              <div class="label">提交时间</div>
              <div class="value">{{ reportData.submitTime }}</div>
            </div>
          </a-col>
          <a-col :span="8">
            <div class="info-item">
              <div class="label">当前状态</div>
              <div class="value">
                <a-tag :color="getStatusColor(reportData.status)">
                  {{ getStatusText(reportData.status) }}
                </a-tag>
              </div>
            </div>
          </a-col>
        </a-row>
      </a-card>

      <!-- 报告内容 -->
      <a-card :title="getContentTitle()" style="margin-bottom: 16px">
        <div class="report-content">
          <!-- 工作概述 -->
          <div class="content-section" style="margin-bottom: 16px">
            <h4>{{ contentType === 'plan' ? '工作目标概述' : '工作完成概述' }}</h4>
            <div class="content-text">
              {{ reportData.content || `暂无${contentType === 'plan' ? '计划' : '总结'}内容` }}
            </div>
          </div>

          <!-- 详细内容表格 -->
          <div class="content-section">
            <h4>{{ contentType === 'plan' ? '具体计划明细' : '完成情况明细' }}</h4>
            <a-table
              :dataSource="getTableData()"
              :columns="getTableColumns()"
              :pagination="false"
              size="small"
              :scroll="{ x: 1600 }"
              style="margin-bottom: 16px"
            >
              <template #bodyCell="{ column, record, index }">
                <template v-if="column.key === 'serialNumber'">
                  {{ index + 1 }}
                </template>
                <template v-else-if="column.key === 'weight'">
                  {{ record.weight }}%
                </template>
                <template v-else-if="column.key === 'isCompleted'">
                  <a-tag :color="record.isCompleted ? 'green' : 'orange'">
                    {{ record.isCompleted ? '已完成' : '未完成' }}
                  </a-tag>
                </template>
                <template v-else-if="column.key === 'progress'">
                  <a-progress :percent="record.progress || 0" size="small" />
                </template>
                <template v-else-if="column.key === 'auditFeedback'">
                  <a-textarea
                    v-model:value="record.auditFeedback"
                    :rows="2"
                    placeholder="请输入审核意见"
                    size="small"
                  />
                </template>

              </template>
            </a-table>
          </div>

          <!-- 自评部分（仅总结类型） -->
          <div v-if="contentType === 'summary'" class="content-section">
            <h4>自我评价</h4>
            <div class="self-evaluation">
              <div class="self-score">
                <span class="label">自评分：</span>
                <a-tag color="blue" v-if="reportData.selfScore">{{ reportData.selfScore }}分</a-tag>
                <span v-else style="color: #999;">未进行自评</span>
              </div>
              <div v-if="reportData.selfEvaluation" class="self-comments">
                <span class="label">自评说明：</span>
                <div class="comments-text">{{ reportData.selfEvaluation }}</div>
              </div>
            </div>
          </div>

          <!-- 附加信息 -->
          <div v-if="reportData.additionalInfo" class="content-section">
            <h4>{{ contentType === 'plan' ? '补充说明' : '其他说明' }}</h4>
            <div class="content-text">{{ reportData.additionalInfo }}</div>
          </div>
        </div>
      </a-card>

      <!-- 审核记录 -->
      <a-card title="审核记录" style="margin-bottom: 16px" v-if="reportData.auditHistory && reportData.auditHistory.length > 0">
        <a-timeline>
          <a-timeline-item 
            v-for="(audit, index) in reportData.auditHistory" 
            :key="index"
            :color="getAuditStatusColor(audit.result)"
          >
            <div class="audit-record">
              <div class="audit-header">
                <span class="auditor">{{ audit.auditor }}</span>
                <span class="audit-time">{{ audit.auditTime }}</span>
                <a-tag :color="getAuditStatusColor(audit.result)">{{ getAuditResultText(audit.result) }}</a-tag>
              </div>
              <div v-if="audit.score" class="audit-score">评分：{{ audit.score }}分</div>
              <div v-if="audit.comments" class="audit-comments">{{ audit.comments }}</div>
            </div>
          </a-timeline-item>
        </a-timeline>
      </a-card>

      <!-- 审核操作 -->
      <a-card title="审核操作" v-if="showAuditForm" style="margin-bottom: 80px;">
        <a-form :model="auditForm" layout="vertical">
          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item label="审核结果" required>
                <a-radio-group v-model:value="auditForm.result">
                  <a-radio value="approved">通过</a-radio>
                  <a-radio value="rejected">驳回</a-radio>
                  <a-radio value="modified">修改后通过</a-radio>
                </a-radio-group>
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="评分" required>
                <a-input-number 
                  v-model:value="auditForm.score" 
                  :min="0" 
                  :max="100" 
                  style="width: 150px"
                  placeholder="请输入分数"
                />
                <span style="margin-left: 8px">分（满分100分）</span>
              </a-form-item>
            </a-col>
          </a-row>
          
          <a-form-item label="审核意见">
            <a-textarea 
              v-model:value="auditForm.comments" 
              placeholder="请填写审核意见..." 
              :rows="3"
            />
          </a-form-item>
          
          <a-form-item label="改进建议">
            <a-textarea 
              v-model:value="auditForm.suggestions" 
              placeholder="请填写改进建议..." 
              :rows="3"
            />
          </a-form-item>
        </a-form>
      </a-card>

      <!-- 底部悬浮操作按钮 -->
      <div class="floating-footer" :class="{ 'audit-mode': showAuditForm }">
        <a-space>
          <!-- 审核模式下的按钮 -->
          <template v-if="showAuditForm">
            <a-button @click="cancelAudit">取消审核</a-button>
            <a-button type="primary" @click="submitAudit" :loading="submitting" size="large">
              <CheckOutlined />
              提交审核
            </a-button>
          </template>
          <!-- 非审核模式下的按钮 -->
          <template v-else>
            <a-button @click="handleCancel" v-if="!canAudit">关闭</a-button>
            <a-button v-if="canAudit" type="primary" @click="enableAudit" size="large" class="start-audit-btn">
              <AuditOutlined />
              开始审核
            </a-button>
          </template>
        </a-space>
      </div>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, computed, reactive, watch } from 'vue'
import { message } from 'ant-design-vue'
import { AuditOutlined, CheckOutlined } from '@ant-design/icons-vue'

// 组件属性
interface Props {
  visible: boolean
  reportData: any
  reportType: 'annual' | 'quarterly' | 'monthly' | 'weekly'
  contentType: 'plan' | 'summary'
  canAudit?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  canAudit: true
})

// 组件事件
const emit = defineEmits<{
  'update:visible': [value: boolean]
  'audit-submitted': [auditData: any]
}>()

// 响应式状态
const showAuditForm = ref(false)
const submitting = ref(false)

// 审核表单
const auditForm = reactive({
  result: 'approved',
  score: 85,
  comments: '',
  suggestions: ''
})

// 计算属性
const modalTitle = computed(() => {
  const typeMap = {
    annual: '年度',
    quarterly: '季度', 
    monthly: '月度',
    weekly: '周度'
  }
  const contentMap = {
    plan: '计划',
    summary: '总结'
  }
  return `${typeMap[props.reportType]}${contentMap[props.contentType]}详情`
})

// 获取内容标题
const getContentTitle = () => {
  const typeMap = {
    annual: '年度',
    quarterly: '季度',
    monthly: '月度', 
    weekly: '周度'
  }
  const contentMap = {
    plan: '计划内容',
    summary: '总结内容'
  }
  return `${typeMap[props.reportType]}${contentMap[props.contentType]}`
}

// 获取期间文本
const getPeriodText = () => {
  if (!props.reportData) return ''
  
  switch (props.reportType) {
    case 'annual':
      return `${props.reportData.year || '2024'}年`
    case 'quarterly':
      return `${props.reportData.year || '2024'}年 第${props.reportData.quarter || '4'}季度`
    case 'monthly':
      return `${props.reportData.year || '2024'}年${props.reportData.month || '12'}月`
    case 'weekly':
      return `第${props.reportData.week || '50'}周`
    default:
      return ''
  }
}

// 获取状态颜色
const getStatusColor = (status: string) => {
  const colorMap: Record<string, string> = {
    reviewing: 'processing',
    approved: 'success',
    rejected: 'error',
    modified: 'warning'
  }
  return colorMap[status] || 'default'
}

// 获取状态文本
const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    reviewing: '待审核',
    approved: '已通过',
    rejected: '已驳回',
    modified: '修改后通过'
  }
  return textMap[status] || status
}

// 获取进度颜色
const getProgressColor = (progress: number) => {
  if (progress >= 90) return 'green'
  if (progress >= 70) return 'blue'
  if (progress >= 50) return 'orange'
  return 'red'
}

// 获取审核状态颜色
const getAuditStatusColor = (result: string) => {
  const colorMap: Record<string, string> = {
    approved: 'green',
    rejected: 'red',
    modified: 'orange'
  }
  return colorMap[result] || 'blue'
}

// 获取审核结果文本
const getAuditResultText = (result: string) => {
  const textMap: Record<string, string> = {
    approved: '通过',
    rejected: '驳回', 
    modified: '修改后通过'
  }
  return textMap[result] || result
}

// 获取表格数据
const getTableData = () => {
  // 优先使用详细数据，如果没有则从goals转换
  if (props.reportData?.details && props.reportData.details.length > 0) {
    return props.reportData.details
  }
  
  if (props.reportData?.goals && props.reportData.goals.length > 0) {
    return props.reportData.goals.map((goal: any, index: number) => ({
      id: index + 1,
      weight: goal.weight || 0,
      project: goal.title || '',
      content: goal.description || '',
      target: goal.metrics || '',
      standard: goal.criteria || '',
      responsible: props.reportData?.name || '',
      timeRange: goal.timeRange || '',
      measures: goal.measures || '',
      isCompleted: goal.progress >= 100 || goal.isCompleted || false,
      result: goal.result || '',
      unfinishedReason: goal.unfinishedReason || '',
      progress: goal.progress || 0,
      auditFeedback: goal.auditFeedback || '',
      auditRating: goal.auditRating || 0
    }))
  }
  
  return []
}

// 获取表格列定义
const getTableColumns = () => {
  const baseColumns = [
    {
      title: '序号',
      key: 'serialNumber',
      width: 60,
      fixed: 'left'
    },
    {
      title: '权重',
      key: 'weight',
      width: 80
    },
    {
      title: '项目',
      dataIndex: 'project',
      width: 120
    },
    {
      title: '内容',
      dataIndex: 'content',
      width: 200
    },
    {
      title: '目标',
      dataIndex: 'target',
      width: 150
    },
    {
      title: '考核标准',
      dataIndex: 'standard',
      width: 150
    },
    {
      title: '责任人',
      dataIndex: 'responsible',
      width: 100
    },
    {
      title: '时间',
      dataIndex: 'timeRange',
      width: 150
    },
    {
      title: '措施',
      dataIndex: 'measures',
      width: 150
    }
  ]

  if (props.contentType === 'summary') {
    // 总结模式下的额外列
    baseColumns.push(
      {
        title: '完成状态',
        key: 'isCompleted',
        width: 100
      },
      {
        title: '完成结果',
        dataIndex: 'result',
        width: 200
      },
      {
        title: '未完成原因',
        dataIndex: 'unfinishedReason',
        width: 150
      },
      {
        title: '进度',
        key: 'progress',
        width: 120
      }
    )
  }

  // 如果允许审核，添加审核列
  if (props.canAudit && showAuditForm.value) {
    baseColumns.push(
      {
        title: '审核意见',
        key: 'auditFeedback',
        width: 200,
        fixed: 'right'
      }
    )
  }

  return baseColumns
}

// 开始审核
const enableAudit = () => {
  showAuditForm.value = true
}

// 取消审核
const cancelAudit = () => {
  showAuditForm.value = false
  resetAuditForm()
}

// 提交审核
const submitAudit = async () => {
  if (!auditForm.score) {
    message.error('请填写评分')
    return
  }
  
  submitting.value = true
  
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const auditData = {
      ...auditForm,
      reportId: props.reportData.id,
      auditor: '当前用户', // 实际应该从用户状态获取
      auditTime: new Date().toLocaleString()
    }
    
    emit('audit-submitted', auditData)
    message.success('审核提交成功')
    handleCancel()
  } catch (error) {
    message.error('审核提交失败')
  } finally {
    submitting.value = false
  }
}

// 重置审核表单
const resetAuditForm = () => {
  Object.assign(auditForm, {
    result: 'approved',
    score: 85,
    comments: '',
    suggestions: ''
  })
}

// 关闭模态框
const handleCancel = () => {
  emit('update:visible', false)
  showAuditForm.value = false
  resetAuditForm()
}

// 监听visible变化
watch(() => props.visible, (newVal) => {
  if (!newVal) {
    showAuditForm.value = false
    resetAuditForm()
  }
})

// 处理visible变化
const handleVisibleChange = (newVal: boolean) => {
  emit('update:visible', newVal)
  if (!newVal) {
    showAuditForm.value = false
    resetAuditForm()
  }
}
</script>

<style scoped>
.detailed-audit-modal {
  :deep(.ant-modal-content) {
    position: relative;
    overflow: hidden;
  }
  
  .modal-content {
    max-height: 70vh;
    overflow-y: auto;
    padding-bottom: 80px;
  }
  
  .info-item {
    margin-bottom: 12px;
    
    .label {
      font-size: 12px;
      color: #666;
      margin-bottom: 4px;
    }
    
    .value {
      font-size: 14px;
      color: #333;
      font-weight: 500;
    }
  }
  
  .report-content {
    .content-section {
      margin-bottom: 20px;
      
      h4 {
        margin: 0 0 12px 0;
        font-size: 16px;
        color: #1890ff;
        border-left: 3px solid #1890ff;
        padding-left: 8px;
      }
      
      .content-text {
        background: #f8f9fa;
        padding: 12px;
        border-radius: 6px;
        line-height: 1.6;
        color: #333;
      }
    }
    
    .goals-list {
      .goal-item {
        background: #f8f9fa;
        padding: 12px;
        border-radius: 6px;
        margin-bottom: 8px;
        border: 1px solid #e8e9ea;
        
        .goal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
          
          .goal-title {
            font-weight: 500;
            color: #333;
          }
        }
        
        .goal-description {
          color: #666;
          line-height: 1.5;
          margin-bottom: 8px;
        }
        
        .goal-metrics {
          .metrics-label {
            color: #999;
            font-size: 12px;
          }
          
          .metrics-value {
            color: #1890ff;
            font-weight: 500;
          }
        }
      }
    }
    
    .self-evaluation {
      background: #f8f9fa;
      padding: 12px;
      border-radius: 6px;
      
      .self-score {
        margin-bottom: 12px;
        
        .label {
          color: #666;
          margin-right: 8px;
        }
      }
      
      .self-comments {
        .label {
          color: #666;
          display: block;
          margin-bottom: 4px;
        }
        
        .comments-text {
          color: #333;
          line-height: 1.6;
        }
      }
    }
  }
  
  .audit-record {
    .audit-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 8px;
      
      .auditor {
        font-weight: 500;
        color: #333;
      }
      
      .audit-time {
        color: #999;
        font-size: 12px;
      }
    }
    
    .audit-score {
      color: #1890ff;
      font-weight: 500;
      margin-bottom: 4px;
    }
    
    .audit-comments {
      color: #666;
      line-height: 1.5;
    }
  }
  
  .floating-footer {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 16px 24px;
    background-color: #fff;
    border-top: 1px solid #f0f0f0;
    text-align: right;
    z-index: 1000;
    box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
    border-radius: 0 0 8px 8px;
    
    &.audit-mode {
      background: linear-gradient(135deg, #f6f9fc 0%, #ffffff 100%);
      border-top: 2px solid #1890ff;
    }
    
    .start-audit-btn {
      background: linear-gradient(135deg, #1890ff, #40a9ff);
      border: none;
      box-shadow: 0 2px 8px rgba(24, 144, 255, 0.3);
      font-weight: 600;
      height: 40px;
      padding: 0 24px;
      
      &:hover {
        background: linear-gradient(135deg, #40a9ff, #1890ff);
        box-shadow: 0 4px 12px rgba(24, 144, 255, 0.4);
        transform: translateY(-1px);
      }
      
      &:active {
        transform: translateY(0);
      }
    }
  }
}
</style> 