<template>
  <a-form
    :model="localFormData"
    :rules="formRules"
    layout="vertical"
  >
    <a-row :gutter="16">
      <a-col :span="12">
        <a-form-item label="项目名称" name="project">
          <a-input v-model:value="localFormData.project" placeholder="请输入项目名称" />
        </a-form-item>
      </a-col>
      <a-col :span="12">
        <a-form-item label="权重" name="weight">
          <a-input-number
            v-model:value="localFormData.weight"
            :min="1"
            :max="100"
            style="width: 100%"
            placeholder="权重(1-100)"
          />
        </a-form-item>
      </a-col>
    </a-row>

    <a-form-item label="内容描述" name="content">
      <a-textarea
        v-model:value="localFormData.content"
        :rows="3"
        placeholder="请详细描述工作内容"
      />
    </a-form-item>

    <a-row :gutter="16">
      <a-col :span="12">
        <a-form-item label="优先级" name="priority">
          <a-select v-model:value="localFormData.priority" placeholder="选择优先级">
            <a-select-option value="high">高</a-select-option>
            <a-select-option value="medium">中</a-select-option>
            <a-select-option value="low">低</a-select-option>
          </a-select>
        </a-form-item>
      </a-col>
      <a-col :span="12">
        <a-form-item label="关联目标" name="relatedGoalId">
          <a-select v-model:value="localFormData.relatedGoalId" placeholder="选择关联目标">
            <a-select-option
              v-for="goal in parentGoals"
              :key="goal.id"
              :value="goal.id"
            >
              {{ goal.title }}
            </a-select-option>
          </a-select>
        </a-form-item>
      </a-col>
    </a-row>

    <a-form-item label="目标" name="target">
      <a-input v-model:value="localFormData.target" placeholder="请输入具体目标" />
    </a-form-item>

    <a-form-item label="实施措施" name="measures">
      <a-textarea
        v-model:value="localFormData.measures"
        :rows="3"
        placeholder="请描述具体的实施措施"
      />
    </a-form-item>
  </a-form>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface Props {
  formData: any
  parentGoals: any[]
  isEdit: boolean
}

const props = defineProps<Props>()

const localFormData = ref({ ...props.formData })

// 表单验证规则
const formRules = {
  project: [{ required: true, message: '请输入项目名称', trigger: 'blur' }],
  content: [{ required: true, message: '请输入内容描述', trigger: 'blur' }],
  priority: [{ required: true, message: '请选择优先级', trigger: 'change' }],
  target: [{ required: true, message: '请输入目标', trigger: 'blur' }],
  measures: [{ required: true, message: '请输入实施措施', trigger: 'blur' }]
}

// 监听props变化
watch(() => props.formData, (newData) => {
  Object.assign(localFormData.value, newData)
}, { deep: true })

// 暴露表单数据给父组件
defineExpose({
  formData: localFormData
})
</script>

<style scoped>
/* 组件样式 */
</style> 