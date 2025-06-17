<template>
  <div class="template-library">
    <!-- 页面标题 -->
    <div class="page-header">
      <div class="header-content">
        <div class="title-area">
          <h2>模板库</h2>
          <p>查看和使用标准工作汇报模板</p>
        </div>
      </div>
    </div>

    <!-- 筛选区域 -->
    <a-card style="margin-bottom: 16px">
      <a-row :gutter="16">
        <a-col :span="6">
          <a-select
            v-model:value="filters.category"
            placeholder="选择类型"
            style="width: 100%"
            @change="handleFilterChange"
          >
            <a-select-option value="">全部类型</a-select-option>
            <a-select-option value="daily">日报模板</a-select-option>
            <a-select-option value="weekly">周报模板</a-select-option>
            <a-select-option value="monthly">月报模板</a-select-option>
            <a-select-option value="goal">目标模板</a-select-option>
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
            <a-select-option value="tech">技术部</a-select-option>
            <a-select-option value="product">产品部</a-select-option>
            <a-select-option value="marketing">市场部</a-select-option>
            <a-select-option value="sales">销售部</a-select-option>
          </a-select>
        </a-col>
        <a-col :span="6">
          <a-input-search
            v-model:value="filters.keyword"
            placeholder="搜索模板"
            @search="handleFilterChange"
          />
        </a-col>
        <a-col :span="6">
          <a-button type="primary" @click="requestTemplate">
            <MessageOutlined />
            申请新模板
          </a-button>
        </a-col>
      </a-row>
    </a-card>

    <!-- 模板展示 -->
    <a-row :gutter="[16, 16]">
      <a-col :span="8" v-for="template in filteredTemplates" :key="template.id">
        <a-card
          :title="template.name"
          class="template-card"
          :hoverable="true"
        >
          <template #extra>
            <a-tag :color="getCategoryColor(template.category)">
              {{ getCategoryText(template.category) }}
            </a-tag>
          </template>
          
          <div class="template-content">
            <p class="template-description">{{ template.description }}</p>
            
            <div class="template-meta">
              <div class="meta-item">
                <span class="label">适用部门：</span>
                <span>{{ template.department || '通用' }}</span>
              </div>
              <div class="meta-item">
                <span class="label">更新时间：</span>
                <span>{{ template.updateTime }}</span>
              </div>
              <div class="meta-item">
                <span class="label">使用次数：</span>
                <span>{{ template.usageCount }}次</span>
              </div>
            </div>

            <div class="template-preview">
              <h5>模板预览：</h5>
              <div class="preview-content">
                <div v-for="field in template.fields.slice(0, 3)" :key="field.name" class="field-item">
                  <span class="field-label">{{ field.label }}：</span>
                  <span class="field-placeholder">{{ field.placeholder }}</span>
                </div>
                <div v-if="template.fields.length > 3" class="more-fields">
                  还有{{ template.fields.length - 3 }}个字段...
                </div>
              </div>
            </div>
          </div>

          <template #actions>
            <a key="preview" @click="previewTemplate(template)">
              <EyeOutlined />
              预览
            </a>
            <a key="use" @click="useTemplate(template)">
              <DownloadOutlined />
              使用
            </a>
            <a key="example" @click="viewExample(template)">
              <FileTextOutlined />
              范例
            </a>
          </template>
        </a-card>
      </a-col>
    </a-row>

    <!-- 模板预览弹窗 -->
    <a-modal
      v-model:open="showPreviewModal"
      :title="`模板预览 - ${currentTemplate?.name}`"
      width="800px"
      :footer="null"
    >
      <div v-if="currentTemplate" class="template-preview-modal">
        <div class="template-info">
          <h4>{{ currentTemplate.name }}</h4>
          <p>{{ currentTemplate.description }}</p>
          <a-divider />
        </div>
        
        <div class="template-fields">
          <h5>模板字段：</h5>
          <a-form layout="vertical">
            <a-form-item
              v-for="field in currentTemplate.fields"
              :key="field.name"
              :label="field.label"
            >
              <a-input
                v-if="field.type === 'input'"
                :placeholder="field.placeholder"
                disabled
              />
              <a-textarea
                v-else-if="field.type === 'textarea'"
                :placeholder="field.placeholder"
                :rows="3"
                disabled
              />
              <a-input-number
                v-else-if="field.type === 'number'"
                :placeholder="field.placeholder"
                style="width: 100%"
                disabled
              />
              <a-date-picker
                v-else-if="field.type === 'date'"
                :placeholder="field.placeholder"
                style="width: 100%"
                disabled
              />
              <a-select
                v-else-if="field.type === 'select'"
                :placeholder="field.placeholder"
                style="width: 100%"
                disabled
              >
                <a-select-option v-for="option in field.options" :key="option" :value="option">
                  {{ option }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-form>
        </div>

        <div class="modal-actions">
          <a-button @click="showPreviewModal = false">关闭</a-button>
          <a-button type="primary" @click="useTemplate(currentTemplate)">
            使用此模板
          </a-button>
        </div>
      </div>
    </a-modal>

    <!-- 使用说明弹窗 -->
    <a-modal
      v-model:open="showGuideModal"
      title="使用指南"
      width="600px"
      :footer="null"
    >
      <div class="usage-guide">
        <h4>如何使用模板？</h4>
        <ol>
          <li>在模板库中选择适合的模板</li>
          <li>点击"使用"按钮，系统将自动跳转到对应的创建页面</li>
          <li>模板的字段和格式会自动加载</li>
          <li>填写实际内容并保存即可</li>
        </ol>
        
        <h4>模板说明：</h4>
        <ul>
          <li><strong>日报模板：</strong>用于记录每日工作内容</li>
          <li><strong>周报模板：</strong>用于汇总一周工作情况</li>
          <li><strong>月报模板：</strong>用于月度工作总结和计划</li>
          <li><strong>目标模板：</strong>用于制定各类工作目标</li>
        </ul>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { message } from 'ant-design-vue'
import { useRouter } from 'vue-router'
import {
  MessageOutlined,
  EyeOutlined,
  DownloadOutlined,
  FileTextOutlined
} from '@ant-design/icons-vue'

const router = useRouter()

// 页面状态
const showPreviewModal = ref(false)
const showGuideModal = ref(false)
const currentTemplate = ref<any>(null)

// 筛选条件
const filters = reactive({
  category: '',
  department: '',
  keyword: ''
})

// 模板数据
const templates = ref([
  {
    id: 1,
    name: '标准日报模板',
    category: 'daily',
    department: '',
    description: '适用于日常工作汇报，包含今日完成、遇到问题、明日计划等基础字段',
    updateTime: '2024-01-15',
    usageCount: 156,
    fields: [
      { name: 'date', label: '日期', type: 'date', placeholder: '选择日期', required: true },
      { name: 'completed', label: '今日完成', type: 'textarea', placeholder: '请详细描述今日完成的工作内容', required: true },
      { name: 'issues', label: '遇到问题', type: 'textarea', placeholder: '描述工作中遇到的问题和困难', required: false },
      { name: 'tomorrow', label: '明日计划', type: 'textarea', placeholder: '明日计划完成的工作', required: true },
      { name: 'workHours', label: '工作时长', type: 'number', placeholder: '填写工作小时数', required: true }
    ]
  },
  {
    id: 2,
    name: '技术部日报模板',
    category: 'daily',
    department: '技术部',
    description: '专为技术人员设计，包含代码提交、bug修复、技术方案等专业字段',
    updateTime: '2024-01-10',
    usageCount: 89,
    fields: [
      { name: 'date', label: '日期', type: 'date', placeholder: '选择日期', required: true },
      { name: 'codeCommits', label: '代码提交', type: 'textarea', placeholder: '今日代码提交记录', required: true },
      { name: 'bugFixed', label: 'Bug修复', type: 'textarea', placeholder: '修复的bug详情', required: false },
      { name: 'codeReview', label: '代码审查', type: 'textarea', placeholder: '参与的代码审查情况', required: false },
      { name: 'technicalIssues', label: '技术难点', type: 'textarea', placeholder: '遇到的技术问题', required: false },
      { name: 'tomorrow', label: '明日计划', type: 'textarea', placeholder: '明日技术工作计划', required: true }
    ]
  },
  {
    id: 3,
    name: '标准周报模板',
    category: 'weekly',
    department: '',
    description: '用于周度工作总结，包含本周工作概述、完成情况、下周计划等',
    updateTime: '2024-01-12',
    usageCount: 234,
    fields: [
      { name: 'weekRange', label: '周期范围', type: 'input', placeholder: '如：2024年第3周(1月15日-1月21日)', required: true },
      { name: 'summary', label: '本周概述', type: 'textarea', placeholder: '本周工作整体概述', required: true },
      { name: 'achievements', label: '主要成果', type: 'textarea', placeholder: '本周取得的主要成果', required: true },
      { name: 'issues', label: '问题与困难', type: 'textarea', placeholder: '本周遇到的问题和困难', required: false },
      { name: 'nextWeek', label: '下周计划', type: 'textarea', placeholder: '下周工作计划', required: true },
      { name: 'suggestions', label: '建议与想法', type: 'textarea', placeholder: '工作建议或改进想法', required: false }
    ]
  },
  {
    id: 4,
    name: '月度计划模板',
    category: 'monthly',
    department: '',
    description: '月度工作计划制定模板，包含目标设定、实施措施、考核标准等',
    updateTime: '2024-01-08',
    usageCount: 167,
    fields: [
      { name: 'month', label: '月份', type: 'input', placeholder: '如：2024年1月', required: true },
      { name: 'project', label: '项目名称', type: 'input', placeholder: '项目或工作内容名称', required: true },
      { name: 'content', label: '具体内容', type: 'textarea', placeholder: '详细描述工作内容', required: true },
      { name: 'target', label: '目标', type: 'textarea', placeholder: '预期达成的目标', required: true },
      { name: 'measures', label: '实施措施', type: 'textarea', placeholder: '具体的实施步骤和方法', required: true },
      { name: 'criteria', label: '考核标准', type: 'textarea', placeholder: '如何评判完成情况', required: true },
      { name: 'timeRange', label: '计划时间', type: 'input', placeholder: '开始时间 - 结束时间', required: true },
      { name: 'weight', label: '权重', type: 'number', placeholder: '该项工作的重要程度(1-100)', required: true }
    ]
  }
])

// 过滤后的模板列表
const filteredTemplates = computed(() => {
  let result = templates.value

  if (filters.category) {
    result = result.filter(template => template.category === filters.category)
  }

  if (filters.department) {
    result = result.filter(template => 
      template.department === filters.department || template.department === ''
    )
  }

  if (filters.keyword) {
    result = result.filter(template =>
      template.name.includes(filters.keyword) ||
      template.description.includes(filters.keyword)
    )
  }

  return result
})

// 获取分类颜色
const getCategoryColor = (category: string) => {
  const colorMap: Record<string, string> = {
    'daily': '#1890ff',
    'weekly': '#52c41a',
    'monthly': '#faad14',
    'goal': '#722ed1'
  }
  return colorMap[category] || '#d9d9d9'
}

// 获取分类文本
const getCategoryText = (category: string) => {
  const textMap: Record<string, string> = {
    'daily': '日报',
    'weekly': '周报',
    'monthly': '月报',
    'goal': '目标'
  }
  return textMap[category] || '其他'
}

// 筛选变化处理
const handleFilterChange = () => {
  console.log('Filter changed:', filters)
}

// 预览模板
const previewTemplate = (template: any) => {
  currentTemplate.value = template
  showPreviewModal.value = true
}

// 使用模板
const useTemplate = (template: any) => {
  console.log('Use template:', template)
  
  // 根据模板类型跳转到对应页面
  const routeMap: Record<string, string> = {
    'daily': '/reports/daily',
    'weekly': '/reports/weekly',
    'monthly': '/goals/tactical',
    'goal': '/goals/strategic'
  }
  
  const targetRoute = routeMap[template.category]
  if (targetRoute) {
    // 这里可以将模板数据传递给目标页面
    router.push({
      path: targetRoute,
      query: { templateId: template.id }
    })
    message.success(`已应用模板：${template.name}`)
  } else {
    message.error('未找到对应的页面')
  }
}

// 查看范例
const viewExample = (template: any) => {
  message.info('范例功能待实现')
}

// 申请新模板
const requestTemplate = () => {
  message.info('申请新模板功能待实现')
}
</script>

<style scoped>
.template-library {
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

.template-card {
  height: 100%;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.template-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.template-content {
  min-height: 280px;
}

.template-description {
  color: #666;
  line-height: 1.6;
  margin-bottom: 16px;
}

.template-meta {
  margin-bottom: 16px;
}

.meta-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 12px;
}

.label {
  color: #666;
  font-weight: 500;
}

.template-preview h5 {
  margin: 0 0 8px 0;
  font-size: 14px;
  font-weight: 600;
  color: #1890ff;
}

.preview-content {
  background: #fafafa;
  padding: 12px;
  border-radius: 4px;
  border: 1px solid #e8e8e8;
}

.field-item {
  display: flex;
  margin-bottom: 6px;
  font-size: 12px;
}

.field-label {
  color: #666;
  font-weight: 500;
  margin-right: 8px;
  white-space: nowrap;
}

.field-placeholder {
  color: #999;
  font-style: italic;
}

.more-fields {
  color: #1890ff;
  font-size: 12px;
  text-align: center;
  margin-top: 8px;
}

.template-preview-modal {
  max-height: 600px;
  overflow-y: auto;
}

.template-info h4 {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
}

.template-fields h5 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #1890ff;
}

.modal-actions {
  text-align: right;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #e8e8e8;
}

.modal-actions .ant-btn {
  margin-left: 8px;
}

.usage-guide h4 {
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
  color: #1890ff;
}

.usage-guide ol,
.usage-guide ul {
  padding-left: 20px;
  line-height: 1.8;
}

.usage-guide li {
  margin-bottom: 8px;
}
</style> 