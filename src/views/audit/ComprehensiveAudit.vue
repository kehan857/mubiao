<template>
  <div class="comprehensive-audit">
    <!-- 页面标题 -->
    <div class="page-header">
      <div class="header-content">
        <div class="title-area">
          <h2>审核中心</h2>
          <p>统一审核员工计划和总结，查看完整工作内容</p>
        </div>
      </div>
    </div>

    <!-- 筛选和统计卡片 -->
    <a-row :gutter="16" style="margin-bottom: 16px">
      <a-col :span="6">
        <a-card>
          <a-statistic title="待审核" :value="statistics.pending" prefix="📋" />
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <a-statistic title="已通过" :value="statistics.approved" prefix="✅" />
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <a-statistic title="已驳回" :value="statistics.rejected" prefix="❌" />
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <a-statistic title="今日审核" :value="statistics.todayAudit" prefix="📅" />
        </a-card>
      </a-col>
    </a-row>

    <!-- 筛选条件 -->
    <a-card style="margin-bottom: 16px">
      <a-form layout="inline" :model="filters">
        <a-form-item label="审核类型">
          <a-select v-model:value="filters.type" placeholder="选择类型" style="width: 120px" @change="handleTypeChange">
            <a-select-option value="">全部</a-select-option>
            <a-select-option value="annual">年度</a-select-option>
            <a-select-option value="quarterly">季度</a-select-option>
            <a-select-option value="monthly">月度</a-select-option>
            <a-select-option value="weekly">周度</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="内容类型">
          <a-select v-model:value="filters.contentType" placeholder="选择内容" style="width: 120px">
            <a-select-option value="">全部</a-select-option>
            <a-select-option value="plan">计划</a-select-option>
            <a-select-option value="summary">总结</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="部门">
          <a-select v-model:value="filters.department" placeholder="选择部门" style="width: 120px" allowClear>
            <a-select-option value="技术部">技术部</a-select-option>
            <a-select-option value="产品部">产品部</a-select-option>
            <a-select-option value="市场部">市场部</a-select-option>
            <a-select-option value="人事部">人事部</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="状态">
          <a-select v-model:value="filters.status" placeholder="选择状态" style="width: 120px" allowClear>
            <a-select-option value="reviewing">待审核</a-select-option>
            <a-select-option value="approved">已通过</a-select-option>
            <a-select-option value="rejected">已驳回</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-button type="primary" @click="handleSearch">搜索</a-button>
          <a-button style="margin-left: 8px" @click="resetFilters">重置</a-button>
        </a-form-item>
      </a-form>
    </a-card>

    <!-- 员工工作内容展示 -->
    <div class="audit-content-list">
      <a-row :gutter="16">
        <a-col :span="8" v-for="item in filteredAuditData" :key="item.id">
          <a-card 
            :class="['audit-card', item.status]"
            :hoverable="true"
            style="margin-bottom: 16px"
          >
            <!-- 卡片头部 -->
            <template #title>
              <div class="card-header">
                <div class="user-info">
                  <a-avatar :size="32">{{ item.name.charAt(0) }}</a-avatar>
                  <div class="user-details">
                    <div class="user-name">{{ item.name }}</div>
                    <div class="user-meta">{{ item.department }} · {{ item.position }}</div>
                  </div>
                </div>
                <a-tag :color="getStatusColor(item.status)">
                  {{ getStatusText(item.status) }}
                </a-tag>
              </div>
            </template>

            <template #extra>
              <a-dropdown>
                <template #overlay>
                  <a-menu>
                    <a-menu-item key="1" @click="expandContent(item)">
                      <EyeOutlined />
                      查看完整内容
                    </a-menu-item>
                    <a-menu-item key="2" @click="quickAudit(item)" v-if="item.status === 'reviewing'">
                      <AuditOutlined />
                      快速审核
                    </a-menu-item>
                    <a-menu-item key="3" @click="viewHistory(item)">
                      <HistoryOutlined />
                      审核历史
                    </a-menu-item>
                  </a-menu>
                </template>
                <MoreOutlined style="cursor: pointer" />
              </a-dropdown>
            </template>

            <!-- 工作类型和时间 -->
            <div class="work-meta">
              <a-tag color="blue">{{ getTypeText(item.type) }}</a-tag>
              <a-tag color="green">{{ item.contentType === 'plan' ? '计划' : '总结' }}</a-tag>
              <span class="submit-time">{{ item.submitTime }}</span>
            </div>

            <!-- 工作内容预览 -->
            <div class="content-preview">
              <h4>{{ item.contentType === 'plan' ? '工作计划' : '工作总结' }}</h4>
              <div class="content-text">
                {{ item.title || `${item.type}${item.contentType === 'plan' ? '计划' : '总结'}` }}
              </div>
              <div class="content-description">
                {{ truncateContent(item.content, 100) }}
              </div>
            </div>

            <!-- 目标和完成情况 -->
            <div v-if="item.objectives && item.objectives.length" class="objectives-section">
              <h5>主要目标</h5>
              <div class="objectives-list">
                <div 
                  v-for="(obj, index) in item.objectives.slice(0, 3)" 
                  :key="index"
                  class="objective-item"
                >
                  <div class="objective-title">{{ obj.title }}</div>
                  <div class="objective-progress">
                    <a-progress 
                      :percent="obj.progress || 0" 
                      :size="'small'" 
                      :status="obj.progress >= 100 ? 'success' : 'normal'"
                    />
                  </div>
                </div>
                <div v-if="item.objectives.length > 3" class="more-objectives">
                  还有 {{ item.objectives.length - 3 }} 个目标...
                </div>
              </div>
            </div>

            <!-- 评分信息 -->
            <div class="score-section" v-if="item.contentType === 'summary'">
              <div class="score-item" v-if="item.selfScore">
                <span class="score-label">自评：</span>
                <a-tag color="blue">{{ item.selfScore }}分</a-tag>
              </div>
              <div class="score-item" v-if="item.supervisorScore">
                <span class="score-label">审核：</span>
                <a-tag color="orange">{{ item.supervisorScore }}分</a-tag>
              </div>
            </div>

            <!-- 审核操作区域 -->
            <div class="audit-actions" v-if="item.status === 'reviewing'">
              <a-space>
                <a-button type="primary" size="small" @click="approveItem(item)">
                  <CheckOutlined />
                  通过
                </a-button>
                <a-button danger size="small" @click="rejectItem(item)">
                  <CloseOutlined />
                  驳回
                </a-button>
                <a-button size="small" @click="openDetailAudit(item)">
                  详细审核
                </a-button>
              </a-space>
            </div>

            <!-- 已审核的意见 -->
            <div class="audit-result" v-if="item.status !== 'reviewing' && item.auditComments">
              <a-divider style="margin: 12px 0" />
              <div class="audit-comments">
                <div class="comments-label">审核意见：</div>
                <div class="comments-content">{{ item.auditComments }}</div>
              </div>
            </div>
          </a-card>
        </a-col>
      </a-row>

      <!-- 空状态 -->
      <a-empty v-if="filteredAuditData.length === 0" description="暂无审核数据" />
    </div>

    <!-- 详细内容查看弹窗 -->
    <a-modal
      v-model:open="showDetailModal"
      :title="`${currentDetailItem?.name} - ${getTypeText(currentDetailItem?.type)}${currentDetailItem?.contentType === 'plan' ? '计划' : '总结'}详情`"
      width="1200px"
      :footer="null"
    >
      <div v-if="currentDetailItem" class="detail-content">
        <!-- 基本信息 -->
        <a-descriptions :column="3" bordered>
          <a-descriptions-item label="提交人">{{ currentDetailItem.name }}</a-descriptions-item>
          <a-descriptions-item label="部门职位">{{ currentDetailItem.department }} · {{ currentDetailItem.position }}</a-descriptions-item>
          <a-descriptions-item label="提交时间">{{ currentDetailItem.submitTime }}</a-descriptions-item>
          <a-descriptions-item label="工作类型">{{ getTypeText(currentDetailItem.type) }}</a-descriptions-item>
          <a-descriptions-item label="内容类型">{{ currentDetailItem.contentType === 'plan' ? '计划' : '总结' }}</a-descriptions-item>
          <a-descriptions-item label="状态">
            <a-tag :color="getStatusColor(currentDetailItem.status)">
              {{ getStatusText(currentDetailItem.status) }}
            </a-tag>
          </a-descriptions-item>
        </a-descriptions>

        <!-- 详细内容 -->
        <a-divider>详细内容</a-divider>
        <div class="full-content">
          <h3>{{ currentDetailItem.title || `${getTypeText(currentDetailItem.type)}${currentDetailItem.contentType === 'plan' ? '计划' : '总结'}` }}</h3>
          <div class="content-body">
            {{ currentDetailItem.content }}
          </div>
        </div>

        <!-- 具体目标列表 -->
        <div v-if="currentDetailItem.objectives && currentDetailItem.objectives.length">
          <a-divider>具体目标</a-divider>
          <a-list :data-source="currentDetailItem.objectives" item-layout="horizontal">
            <template #renderItem="{ item, index }">
              <a-list-item>
                <a-list-item-meta>
                  <template #title>
                    {{ item.title }}
                  </template>
                  <template #description>
                    <div>
                      <div>{{ item.description }}</div>
                      <div style="margin-top: 8px;">
                        <span>完成进度：</span>
                        <a-progress :percent="item.progress || 0" :size="'small'" />
                      </div>
                    </div>
                  </template>
                </a-list-item-meta>
              </a-list-item>
            </template>
          </a-list>
        </div>

        <!-- 评分和审核意见 -->
        <div v-if="currentDetailItem.contentType === 'summary'">
          <a-divider>评分情况</a-divider>
          <a-row :gutter="16">
            <a-col :span="12" v-if="currentDetailItem.selfScore">
              <a-card title="自我评分" size="small">
                <div class="score-display">
                  <span class="score-number">{{ currentDetailItem.selfScore }}</span>
                  <span class="score-unit">分</span>
                </div>
                <div v-if="currentDetailItem.selfComments" class="score-comments">
                  {{ currentDetailItem.selfComments }}
                </div>
              </a-card>
            </a-col>
            <a-col :span="12" v-if="currentDetailItem.supervisorScore">
              <a-card title="上级评分" size="small">
                <div class="score-display">
                  <span class="score-number">{{ currentDetailItem.supervisorScore }}</span>
                  <span class="score-unit">分</span>
                </div>
                <div v-if="currentDetailItem.auditComments" class="score-comments">
                  {{ currentDetailItem.auditComments }}
                </div>
              </a-card>
            </a-col>
          </a-row>
        </div>
      </div>
    </a-modal>

    <!-- 详细审核弹窗 -->
    <a-modal
      v-model:open="showAuditModal"
      :title="`审核 - ${currentAuditItem?.name}`"
      @ok="handleDetailAudit"
      @cancel="resetAuditForm"
      width="800px"
    >
      <div v-if="currentAuditItem">
        <a-form :model="auditForm" layout="vertical">
          <a-form-item label="审核结果" required>
            <a-radio-group v-model:value="auditForm.result">
              <a-radio value="approved">通过</a-radio>
              <a-radio value="rejected">驳回</a-radio>
              <a-radio value="modified">修改后通过</a-radio>
            </a-radio-group>
          </a-form-item>
          
          <a-form-item v-if="currentAuditItem.contentType === 'summary'" label="员工自评分">
            <a-tag color="blue" v-if="currentAuditItem.selfScore">{{ currentAuditItem.selfScore }}分</a-tag>
            <span v-else style="color: #999;">员工未进行自评</span>
          </a-form-item>
          
          <a-form-item label="评分" required v-if="currentAuditItem.contentType === 'summary'">
            <a-input-number 
              v-model:value="auditForm.score" 
              :min="0" 
              :max="100" 
              style="width: 150px"
              placeholder="请输入分数"
            />
            <span style="margin-left: 12px">分（满分100分）</span>
          </a-form-item>
          
          <a-form-item label="审核意见">
            <a-textarea 
              v-model:value="auditForm.comments" 
              placeholder="请填写审核意见..." 
              :rows="4"
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
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import {
  EyeOutlined,
  AuditOutlined,
  CheckOutlined,
  CloseOutlined,
  HistoryOutlined,
  MoreOutlined
} from '@ant-design/icons-vue'

// 页面状态
const loading = ref(false)
const showDetailModal = ref(false)
const showAuditModal = ref(false)
const currentDetailItem = ref<any>(null)
const currentAuditItem = ref<any>(null)

// 筛选条件
const filters = reactive({
  type: '',
  contentType: '',
  department: '',
  status: ''
})

// 统计数据
const statistics = reactive({
  pending: 12,
  approved: 45,
  rejected: 3,
  todayAudit: 8
})

// 审核表单
const auditForm = reactive({
  result: 'approved',
  score: 85,
  comments: '',
  suggestions: ''
})

// 模拟审核数据
const auditData = ref([
  {
    id: 1,
    name: '张三',
    department: '技术部',
    position: '高级工程师',
    type: 'monthly',
    contentType: 'summary',
    submitTime: '2024-12-01 10:30',
    status: 'reviewing',
    title: '11月技术开发工作总结',
    content: '本月完成了用户管理系统的重构工作，优化了数据库查询性能，提升了系统响应速度30%。同时完成了新功能模块的开发，包括权限管理、日志系统等。在团队协作方面，积极参与代码评审，帮助新同事快速上手项目。遇到的主要挑战是在性能优化过程中需要兼顾系统稳定性，通过分步实施和充分测试最终达成目标。',
    objectives: [
      { title: '系统重构', description: '完成用户管理系统重构', progress: 100 },
      { title: '性能优化', description: '提升系统响应速度30%', progress: 100 },
      { title: '新功能开发', description: '开发权限管理和日志系统', progress: 90 },
      { title: '团队协作', description: '参与代码评审和新人指导', progress: 95 }
    ],
    selfScore: 88,
    selfComments: '本月工作目标基本达成，技术能力有所提升',
    supervisorScore: null,
    auditComments: ''
  },
  {
    id: 2,
    name: '李四',
    department: '产品部',
    position: '产品经理',
    type: 'weekly',
    contentType: 'plan',
    submitTime: '2024-12-02 09:15',
    status: 'approved',
    title: '第49周产品规划工作计划',
    content: '本周计划完成新版本产品需求分析，包括用户调研报告整理、竞品分析、功能优先级排序等。同时需要与设计团队沟通界面设计方案，与技术团队确认开发可行性。预计本周完成需求文档初稿，为下周的需求评审会议做准备。',
    objectives: [
      { title: '需求分析', description: '完成新版本需求分析', progress: 0 },
      { title: '用户调研', description: '整理用户调研报告', progress: 0 },
      { title: '竞品分析', description: '完成主要竞品功能对比', progress: 0 }
    ],
    auditComments: '计划制定详细，目标明确，可执行性强'
  },
  {
    id: 3,
    name: '王五',
    department: '市场部',
    position: '市场专员',
    type: 'quarterly',
    contentType: 'summary',
    submitTime: '2024-12-01 14:20',
    status: 'rejected',
    title: 'Q4市场推广活动总结',
    content: '第四季度市场部开展了多项推广活动，包括线上广告投放、线下展会参与、合作伙伴拓展等。线上广告累计触达用户50万+，转化率达到3.2%。线下展会共参与3场，获得意向客户120家。合作伙伴新增8家，带来直接销售额200万。但在客户维护方面还需要加强，部分老客户流失率偏高。',
    objectives: [
      { title: '线上推广', description: '线上广告投放和用户触达', progress: 110 },
      { title: '展会参与', description: '参与行业展会获取客户', progress: 100 },
      { title: '合作拓展', description: '发展新的合作伙伴', progress: 80 },
      { title: '客户维护', description: '维护老客户关系', progress: 60 }
    ],
    selfScore: 82,
    selfComments: '大部分目标达成，但客户维护需要改进',
    supervisorScore: 75,
    auditComments: '推广效果良好，但客户维护确实需要加强，建议制定专门的客户关系维护计划'
  },
  {
    id: 4,
    name: '赵六',
    department: '人事部',
    position: '人事主管',
    type: 'annual',
    contentType: 'plan',
    submitTime: '2024-12-01 16:45',
    status: 'reviewing',
    title: '2025年人力资源发展规划',
    content: '2025年人事部将重点关注人才梯队建设、企业文化建设、员工培训体系完善等方面。计划新增招聘岗位50个，重点引进技术和市场类人才。建立完善的培训体系，包括新员工培训、在职培训、管理培训等。加强企业文化建设，提升员工归属感和满意度。建立绩效管理体系，完善薪酬福利结构。',
    objectives: [
      { title: '人才招聘', description: '新增招聘50人，重点技术和市场人才', progress: 0 },
      { title: '培训体系', description: '建立完善的员工培训体系', progress: 0 },
      { title: '文化建设', description: '加强企业文化建设和员工关怀', progress: 0 },
      { title: '绩效管理', description: '建立科学的绩效评估体系', progress: 0 }
    ]
  }
])

// 过滤后的审核数据
const filteredAuditData = computed(() => {
  return auditData.value.filter(item => {
    if (filters.type && item.type !== filters.type) return false
    if (filters.contentType && item.contentType !== filters.contentType) return false
    if (filters.department && item.department !== filters.department) return false
    if (filters.status && item.status !== filters.status) return false
    return true
  })
})

// 获取类型文本
const getTypeText = (type: string) => {
  const typeMap: Record<string, string> = {
    annual: '年度',
    quarterly: '季度', 
    monthly: '月度',
    weekly: '周度'
  }
  return typeMap[type] || type
}

// 获取状态颜色
const getStatusColor = (status: string) => {
  const colorMap: Record<string, string> = {
    reviewing: 'processing',
    approved: 'success',
    rejected: 'error'
  }
  return colorMap[status] || 'default'
}

// 获取状态文本
const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    reviewing: '待审核',
    approved: '已通过',
    rejected: '已驳回'
  }
  return textMap[status] || status
}

// 截取内容
const truncateContent = (content: string, length: number) => {
  if (content.length <= length) return content
  return content.substring(0, length) + '...'
}

// 搜索处理
const handleSearch = () => {
  message.success('搜索完成')
}

// 重置筛选条件
const resetFilters = () => {
  Object.assign(filters, {
    type: '',
    contentType: '',
    department: '',
    status: ''
  })
}

// 类型切换处理
const handleTypeChange = () => {
  // 可以根据类型更新其他选项
}

// 展开完整内容
const expandContent = (item: any) => {
  currentDetailItem.value = item
  showDetailModal.value = true
}

// 快速审核
const quickAudit = (item: any) => {
  currentAuditItem.value = item
  showAuditModal.value = true
}

// 查看历史
const viewHistory = (item: any) => {
  message.info('查看审核历史功能开发中...')
}

// 快速通过
const approveItem = (item: any) => {
  item.status = 'approved'
  item.auditComments = '快速审核通过'
  statistics.pending--
  statistics.approved++
  statistics.todayAudit++
  message.success('审核通过')
}

// 快速驳回
const rejectItem = (item: any) => {
  item.status = 'rejected'
  item.auditComments = '需要进一步完善'
  statistics.pending--
  statistics.rejected++
  statistics.todayAudit++
  message.success('已驳回')
}

// 打开详细审核
const openDetailAudit = (item: any) => {
  currentAuditItem.value = item
  showAuditModal.value = true
}

// 处理详细审核
const handleDetailAudit = () => {
  if (currentAuditItem.value?.contentType === 'summary' && !auditForm.score) {
    message.error('请填写评分')
    return
  }
  
  if (currentAuditItem.value) {
    currentAuditItem.value.status = auditForm.result
    currentAuditItem.value.auditComments = auditForm.comments
    if (auditForm.score) {
      currentAuditItem.value.supervisorScore = auditForm.score
    }
    
    statistics.pending--
    if (auditForm.result === 'approved') {
      statistics.approved++
    } else if (auditForm.result === 'rejected') {
      statistics.rejected++
    }
    statistics.todayAudit++
  }
  
  message.success('审核完成')
  resetAuditForm()
  showAuditModal.value = false
}

// 重置审核表单
const resetAuditForm = () => {
  Object.assign(auditForm, {
    result: 'approved',
    score: 85,
    comments: '',
    suggestions: ''
  })
  currentAuditItem.value = null
}

// 页面加载
onMounted(() => {
  // 初始化数据
})
</script>

<style scoped>
.comprehensive-audit {
  padding: 0;
}

.page-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 24px;
  margin-bottom: 16px;
  border-radius: 8px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title-area h2 {
  color: white;
  margin: 0;
  font-size: 24px;
}

.title-area p {
  color: rgba(255, 255, 255, 0.8);
  margin: 4px 0 0 0;
}

.audit-content-list {
  min-height: 400px;
}

.audit-card {
  border-radius: 12px;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.audit-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.audit-card.reviewing {
  border-color: #1890ff;
}

.audit-card.approved {
  border-color: #52c41a;
}

.audit-card.rejected {
  border-color: #ff4d4f;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-details {
  flex: 1;
}

.user-name {
  font-weight: 600;
  font-size: 16px;
  color: #262626;
}

.user-meta {
  font-size: 12px;
  color: #8c8c8c;
  margin-top: 2px;
}

.work-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.submit-time {
  font-size: 12px;
  color: #8c8c8c;
  margin-left: auto;
}

.content-preview {
  margin-bottom: 16px;
}

.content-preview h4 {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #262626;
  font-weight: 600;
}

.content-text {
  font-size: 16px;
  font-weight: 500;
  color: #262626;
  margin-bottom: 8px;
}

.content-description {
  font-size: 14px;
  color: #595959;
  line-height: 1.5;
}

.objectives-section {
  margin-bottom: 16px;
}

.objectives-section h5 {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #262626;
  font-weight: 600;
}

.objectives-list {
  space-y: 8px;
}

.objective-item {
  margin-bottom: 8px;
}

.objective-title {
  font-size: 12px;
  color: #595959;
  margin-bottom: 4px;
}

.objective-progress {
  width: 100%;
}

.more-objectives {
  font-size: 12px;
  color: #8c8c8c;
  text-align: center;
  padding: 4px;
}

.score-section {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}

.score-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.score-label {
  font-size: 12px;
  color: #8c8c8c;
}

.audit-actions {
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}

.audit-result {
  margin-top: 12px;
}

.audit-comments {
  background: #f6f6f6;
  padding: 8px 12px;
  border-radius: 6px;
}

.comments-label {
  font-size: 12px;
  color: #8c8c8c;
  margin-bottom: 4px;
}

.comments-content {
  font-size: 13px;
  color: #595959;
}

.detail-content {
  max-height: 70vh;
  overflow-y: auto;
}

.full-content {
  background: #fafafa;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 16px;
}

.full-content h3 {
  margin: 0 0 16px 0;
  color: #262626;
}

.content-body {
  color: #595959;
  line-height: 1.6;
  font-size: 14px;
}

.score-display {
  text-align: center;
  margin-bottom: 12px;
}

.score-number {
  font-size: 36px;
  font-weight: bold;
  color: #1890ff;
}

.score-unit {
  font-size: 14px;
  color: #8c8c8c;
  margin-left: 4px;
}

.score-comments {
  font-size: 12px;
  color: #595959;
  text-align: center;
  background: #f0f0f0;
  padding: 8px;
  border-radius: 4px;
}
</style> 