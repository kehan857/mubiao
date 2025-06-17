<template>
  <div class="template-selector">
    <a-row :gutter="[16, 16]">
      <a-col :span="8" v-for="template in templates" :key="template.id">
        <a-card
          :title="template.name"
          size="small"
          hoverable
          @click="selectTemplate(template)"
          :class="{ 'selected': selectedTemplate?.id === template.id }"
        >
          <template #extra>
            <a-tag :color="getCategoryColor(template.category)">
              {{ getCategoryText(template.category) }}
            </a-tag>
          </template>
          
          <p>{{ template.description }}</p>
          
          <div class="template-meta">
            <span class="meta-item">
              <UserOutlined />
              {{ template.author }}
            </span>
            <span class="meta-item">
              <CalendarOutlined />
              {{ template.updateTime }}
            </span>
          </div>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { UserOutlined, CalendarOutlined } from '@ant-design/icons-vue'

interface Props {
  type: string
}

const props = defineProps<Props>()
const emit = defineEmits(['select'])

const selectedTemplate = ref<any>(null)

// 模拟模板数据
const templates = ref([
  {
    id: 1,
    name: '标准月度计划模板',
    description: '包含序号、权重、项目、内容等标准字段的月度计划模板',
    category: 'monthly-plan',
    author: 'HR部门',
    updateTime: '2024-01-15',
    content: {
      project: '',
      content: '',
      weight: 20,
      priority: 'medium',
      target: '',
      measures: ''
    }
  },
  {
    id: 2,
    name: '技术部专用模板',
    description: '针对技术部门工作特点设计的专用模板',
    category: 'monthly-plan',
    author: '技术部',
    updateTime: '2024-01-10',
    content: {
      project: '',
      content: '',
      weight: 25,
      priority: 'high',
      target: '',
      measures: ''
    }
  },
  {
    id: 3,
    name: '销售目标模板',
    description: '适用于销售相关工作的目标规划模板',
    category: 'monthly-plan',
    author: '销售部',
    updateTime: '2024-01-08',
    content: {
      project: '',
      content: '',
      weight: 30,
      priority: 'high',
      target: '',
      measures: ''
    }
  }
])

// 选择模板
const selectTemplate = (template: any) => {
  selectedTemplate.value = template
  emit('select', template)
}

// 获取分类颜色
const getCategoryColor = (category: string) => {
  const colorMap: Record<string, string> = {
    'monthly-plan': '#1890ff',
    'daily-report': '#52c41a',
    'weekly-report': '#faad14',
    'goal-template': '#722ed1'
  }
  return colorMap[category] || '#d9d9d9'
}

// 获取分类文本
const getCategoryText = (category: string) => {
  const textMap: Record<string, string> = {
    'monthly-plan': '月度计划',
    'daily-report': '日报模板',
    'weekly-report': '周报模板',
    'goal-template': '目标模板'
  }
  return textMap[category] || '其他'
}
</script>

<style scoped>
.template-selector {
  min-height: 300px;
}

.template-meta {
  display: flex;
  justify-content: space-between;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
  font-size: 12px;
  color: #666;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.selected {
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}
</style> 