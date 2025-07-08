<template>
  <div class="template-management">
    <!-- 页面标题 -->
    <div class="page-header">
      <div class="header-content">
        <div class="title-area">
          <h2>模板管理</h2>
          <p>管理目标计划和工作总结模板，支持Excel导入和组织关联</p>
        </div>
        <div class="actions">
          <a-button type="primary" @click="showAddModal = true">
            <PlusOutlined />
            新增模板
          </a-button>
          <a-button @click="refreshData" :loading="loading">
            <ReloadOutlined />
            刷新
          </a-button>
        </div>
      </div>
    </div>

    <!-- 功能切换标签 -->
    <a-card style="margin-bottom: 16px">
      <a-tabs v-model:activeKey="mainTabKey" @change="handleMainTabChange">
        <a-tab-pane key="templates" tab="📄 模板管理">
          <!-- 模板筛选区域 -->
          <a-card style="margin-bottom: 16px" :bordered="false">
            <a-row :gutter="16">
              <a-col :span="6">
                <a-select v-model:value="filters.type" placeholder="模板类型" style="width: 100%" @change="handleFilterChange">
                  <a-select-option value="">全部类型</a-select-option>
                  <a-select-option value="annual">年度模板</a-select-option>
                  <a-select-option value="quarterly">季度模板</a-select-option>
                  <a-select-option value="monthly">月度模板</a-select-option>
                  <a-select-option value="weekly">周度模板</a-select-option>
                  <a-select-option value="daily">日度模板</a-select-option>
                  <a-select-option value="other">其他类型</a-select-option>
                </a-select>
              </a-col>
              <a-col :span="6">
                <a-select v-model:value="filters.scope" placeholder="适用范围" style="width: 100%" @change="handleFilterChange">
                  <a-select-option value="">全部范围</a-select-option>
                  <a-select-option value="company">公司级</a-select-option>
                  <a-select-option value="department">部门级</a-select-option>
                  <a-select-option value="personal">个人级</a-select-option>
                </a-select>
              </a-col>
              <a-col :span="6">
                <a-select v-model:value="filters.status" placeholder="状态" style="width: 100%" @change="handleFilterChange">
                  <a-select-option value="">全部状态</a-select-option>
                  <a-select-option value="active">启用</a-select-option>
                  <a-select-option value="inactive">停用</a-select-option>
                </a-select>
              </a-col>
              <a-col :span="6">
                <a-input-search
                  v-model:value="filters.keyword"
                  placeholder="搜索模板名称"
                  @search="handleFilterChange"
                />
              </a-col>
            </a-row>
          </a-card>

          <!-- 模板示例区域 -->
          <a-card title="标准模板示例" style="margin-bottom: 16px">
            <a-tabs v-model:activeKey="exampleTabKey">
              <a-tab-pane key="annual" tab="年度模板">
                <div class="template-example">
                  <p>标准年度模板字段：</p>
                  <a-tag>序号</a-tag>
                  <a-tag>权重</a-tag>
                  <a-tag>项目</a-tag>
                  <a-tag>内容</a-tag>
                  <a-tag>目标</a-tag>
                  <a-tag>考核标准</a-tag>
                  <a-tag>责任人</a-tag>
                  <a-tag>计划完成时间（开始--结束时间段）</a-tag>
                  <a-tag>实施措施</a-tag>
                  <a-tag>完成结果</a-tag>
                  <a-tag>未完成原因</a-tag>
                </div>
              </a-tab-pane>
              <a-tab-pane key="quarterly" tab="季度模板">
                <div class="template-example">
                  <p>标准季度模板字段：</p>
                  <a-tag>序号</a-tag>
                  <a-tag>权重</a-tag>
                  <a-tag>项目</a-tag>
                  <a-tag>内容</a-tag>
                  <a-tag>目标</a-tag>
                  <a-tag>考核标准</a-tag>
                  <a-tag>责任人</a-tag>
                  <a-tag>计划完成时间（开始--结束时间段）</a-tag>
                  <a-tag>实施措施</a-tag>
                  <a-tag>完成结果</a-tag>
                  <a-tag>未完成原因</a-tag>
                </div>
              </a-tab-pane>
              <a-tab-pane key="monthly" tab="月度模板">
                <div class="template-example">
                  <p>标准月度模板字段：</p>
                  <a-tag>序号</a-tag>
                  <a-tag>权重</a-tag>
                  <a-tag>项目</a-tag>
                  <a-tag>内容</a-tag>
                  <a-tag>目标</a-tag>
                  <a-tag>考核标准</a-tag>
                  <a-tag>责任人</a-tag>
                  <a-tag>计划完成时间（开始--结束时间段）</a-tag>
                  <a-tag>实施措施</a-tag>
                  <a-tag>完成结果</a-tag>
                  <a-tag>未完成原因</a-tag>
                </div>
              </a-tab-pane>
              <a-tab-pane key="weekly" tab="周度模板">
                <div class="template-example">
                  <p>标准周度模板字段：</p>
                  <a-tag>序号</a-tag>
                  <a-tag>权重</a-tag>
                  <a-tag>项目</a-tag>
                  <a-tag>内容</a-tag>
                  <a-tag>目标</a-tag>
                  <a-tag>考核标准</a-tag>
                  <a-tag>责任人</a-tag>
                  <a-tag>计划完成时间（开始--结束时间段）</a-tag>
                  <a-tag>实施措施</a-tag>
                  <a-tag>完成结果</a-tag>
                  <a-tag>未完成原因</a-tag>
                </div>
              </a-tab-pane>
              <a-tab-pane key="daily" tab="日度模板">
                <div class="template-example">
                  <p>标准日度模板字段：</p>
                  <a-tag>序号</a-tag>
                  <a-tag>任务名称</a-tag>
                  <a-tag>任务内容</a-tag>
                  <a-tag>预计时间</a-tag>
                  <a-tag>实际时间</a-tag>
                  <a-tag>完成状态</a-tag>
                  <a-tag>备注</a-tag>
                </div>
              </a-tab-pane>
            </a-tabs>
          </a-card>

          <!-- 模板列表 -->
          <a-card title="模板列表">
            <template #extra>
              <a-space>
                <a-button @click="batchDelete" :disabled="selectedRows.length === 0">
                  批量删除
                </a-button>
                <a-button @click="exportTemplates" :disabled="selectedRows.length === 0">
                  导出选中
                </a-button>
              </a-space>
            </template>

            <a-table
              :dataSource="filteredTemplates"
              :columns="templateColumns"
              :loading="loading"
              :pagination="pagination"
              :row-selection="{ selectedRowKeys: selectedRows, onChange: handleSelectionChange }"
              @change="handleTableChange"
              row-key="id"
              :scroll="{ x: 1200 }"
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'type'">
                  <a-tag :color="getTypeColor(record.type)">
                    {{ getTypeText(record.type) }}
                  </a-tag>
                </template>

                <template v-else-if="column.key === 'scope'">
                  <a-tag :color="getScopeColor(record.scope)">
                    {{ getScopeText(record.scope) }}
                  </a-tag>
                </template>

                <template v-else-if="column.key === 'status'">
                  <a-tag :color="record.status === 'active' ? 'green' : 'red'">
                    {{ record.status === 'active' ? '启用' : '停用' }}
                  </a-tag>
                </template>

                <template v-else-if="column.key === 'associatedOrgs'">
                  <div v-if="record.associatedOrgs && record.associatedOrgs.length > 0">
                    <a-tag v-for="org in record.associatedOrgs.slice(0, 2)" :key="org" size="small">
                      {{ org }}
                    </a-tag>
                    <span v-if="record.associatedOrgs.length > 2">
                      +{{ record.associatedOrgs.length - 2 }}个
                    </span>
                  </div>
                  <span v-else>-</span>
                </template>

                <template v-else-if="column.key === 'actions'">
                  <a-space>
                    <a-button type="primary" size="small" @click="viewTemplate(record)">
                      查看
                    </a-button>
                    <a-button size="small" @click="editTemplate(record)">
                      编辑
                    </a-button>
                    <a-button size="small" @click="copyTemplate(record)">
                      复制
                    </a-button>
                    <a-popconfirm title="确定删除这个模板吗？" @confirm="deleteTemplate(record.id)">
                      <a-button danger size="small">
                        删除
                      </a-button>
                    </a-popconfirm>
                  </a-space>
                </template>
              </template>
            </a-table>
          </a-card>
        </a-tab-pane>

        <a-tab-pane key="examples" tab="📝 填写样例管理">
          <!-- 样例筛选区域 -->
          <a-card style="margin-bottom: 16px" :bordered="false">
            <a-row :gutter="16">
              <a-col :span="6">
                <a-select v-model:value="exampleFilters.planType" placeholder="计划类型" style="width: 100%" @change="handleExampleFilterChange">
                  <a-select-option value="">全部类型</a-select-option>
                  <a-select-option value="annual">年度计划</a-select-option>
                  <a-select-option value="quarterly">季度计划</a-select-option>
                  <a-select-option value="monthly">月度计划</a-select-option>
                  <a-select-option value="weekly">周度计划</a-select-option>
                </a-select>
              </a-col>
              <a-col :span="6">
                <a-select v-model:value="exampleFilters.department" placeholder="适用部门" style="width: 100%" @change="handleExampleFilterChange">
                  <a-select-option value="">全部部门</a-select-option>
                  <a-select-option value="all">通用样例</a-select-option>
                  <a-select-option value="tech">技术部</a-select-option>
                  <a-select-option value="sales">销售部</a-select-option>
                  <a-select-option value="hr">人事部</a-select-option>
                  <a-select-option value="finance">财务部</a-select-option>
                  <a-select-option value="operations">运营部</a-select-option>
                </a-select>
              </a-col>
              <a-col :span="6">
                <a-select v-model:value="exampleFilters.status" placeholder="状态" style="width: 100%" @change="handleExampleFilterChange">
                  <a-select-option value="">全部状态</a-select-option>
                  <a-select-option value="active">启用</a-select-option>
                  <a-select-option value="inactive">停用</a-select-option>
                </a-select>
              </a-col>
              <a-col :span="6">
                <a-input-search
                  v-model:value="exampleFilters.keyword"
                  placeholder="搜索样例名称"
                  @search="handleExampleFilterChange"
                />
              </a-col>
            </a-row>
          </a-card>

          <!-- 样例列表 -->
          <a-card title="填写样例列表">
            <template #extra>
              <a-space>
                <a-button type="primary" @click="showAddExampleModal = true">
                  <PlusOutlined />
                  新增样例
                </a-button>
                <a-button @click="batchDeleteExamples" :disabled="selectedExampleRows.length === 0">
                  批量删除
                </a-button>
              </a-space>
            </template>

            <a-table
              :dataSource="filteredExamples"
              :columns="exampleColumns"
              :loading="exampleLoading"
              :pagination="examplePagination"
              :row-selection="{ selectedRowKeys: selectedExampleRows, onChange: handleExampleSelectionChange }"
              @change="handleExampleTableChange"
              row-key="id"
              :scroll="{ x: 1400 }"
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'planType'">
                  <a-tag :color="getTypeColor(record.planType)">
                    {{ getTypeText(record.planType) }}
                  </a-tag>
                </template>

                <template v-else-if="column.key === 'department'">
                  <a-tag :color="getDepartmentColor(record.department)">
                    {{ getDepartmentText(record.department) }}
                  </a-tag>
                </template>

                <template v-else-if="column.key === 'status'">
                  <a-tag :color="record.status === 'active' ? 'green' : 'red'">
                    {{ record.status === 'active' ? '启用' : '停用' }}
                  </a-tag>
                </template>

                <template v-else-if="column.key === 'exampleCount'">
                  <span>{{ record.examples ? record.examples.length : 0 }}条</span>
                </template>

                <template v-else-if="column.key === 'actions'">
                  <a-space>
                    <a-button type="primary" size="small" @click="viewExample(record)">
                      查看样例
                    </a-button>
                    <a-button size="small" @click="editExample(record)">
                      编辑
                    </a-button>
                    <a-button size="small" @click="copyExample(record)">
                      复制
                    </a-button>
                    <a-popconfirm title="确定删除这个样例吗？" @confirm="deleteExample(record.id)">
                      <a-button danger size="small">
                        删除
                      </a-button>
                    </a-popconfirm>
                  </a-space>
                </template>
              </template>
            </a-table>
          </a-card>
        </a-tab-pane>
      </a-tabs>
    </a-card>

    <!-- 新增/编辑模板弹窗 -->
    <a-modal
      v-model:open="showAddModal"
      :title="editingTemplate ? '编辑模板' : '新增模板'"
      width="800px"
      @ok="handleSubmit"
      @cancel="handleCancel"
    >
      <a-form ref="templateFormRef" :model="templateForm" :rules="templateRules" layout="vertical">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="模板名称" name="name">
              <a-input v-model:value="templateForm.name" placeholder="请输入模板名称" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="模板类型" name="type">
              <a-select v-model:value="templateForm.type" placeholder="选择模板类型">
                <a-select-option value="annual">年度模板</a-select-option>
                <a-select-option value="quarterly">季度模板</a-select-option>
                <a-select-option value="monthly">月度模板</a-select-option>
                <a-select-option value="weekly">周度模板</a-select-option>
                <a-select-option value="daily">日度模板</a-select-option>
                <a-select-option value="other">其他类型</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="适用范围" name="scope">
              <a-select v-model:value="templateForm.scope" placeholder="选择适用范围">
                <a-select-option value="company">公司级</a-select-option>
                <a-select-option value="department">部门级</a-select-option>
                <a-select-option value="personal">个人级</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="状态" name="status">
              <a-select v-model:value="templateForm.status" placeholder="选择状态">
                <a-select-option value="active">启用</a-select-option>
                <a-select-option value="inactive">停用</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>

        <a-form-item label="关联组织">
          <a-tree-select
            v-model:value="templateForm.associatedOrgIds"
            :tree-data="orgTreeSelectData"
            placeholder="选择关联组织"
            multiple
            style="width: 100%"
            allow-clear
          />
        </a-form-item>

        <a-form-item label="关联人员">
          <a-select
            v-model:value="templateForm.associatedUserIds"
            placeholder="选择关联人员"
            mode="multiple"
            style="width: 100%"
            show-search
          >
            <a-select-option v-for="user in allUsers" :key="user.id" :value="user.id">
              {{ user.name }} - {{ user.position }}
            </a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="模板描述">
          <a-textarea v-model:value="templateForm.description" :rows="3" placeholder="请输入模板描述" />
        </a-form-item>

        <a-form-item label="Excel模板">
          <a-upload-dragger
            v-model:fileList="templateForm.fileList"
            name="file"
            :multiple="false"
            accept=".xlsx,.xls"
            :before-upload="beforeUpload"
            @remove="handleFileRemove"
          >
            <p class="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p class="ant-upload-text">点击或拖拽Excel文件到此区域上传</p>
            <p class="ant-upload-hint">支持 .xlsx .xls 格式</p>
          </a-upload-dragger>
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 模板详情弹窗 -->
    <a-modal
      v-model:open="showDetailModal"
      :title="`${currentTemplate?.name} - 详情`"
      width="900px"
      :footer="null"
    >
      <div class="template-detail">
        <a-descriptions title="基本信息" :column="2" size="small">
          <a-descriptions-item label="模板名称">{{ currentTemplate?.name }}</a-descriptions-item>
          <a-descriptions-item label="模板类型">{{ getTypeText(currentTemplate?.type) }}</a-descriptions-item>
          <a-descriptions-item label="适用范围">{{ getScopeText(currentTemplate?.scope) }}</a-descriptions-item>
          <a-descriptions-item label="状态">{{ currentTemplate?.status === 'active' ? '启用' : '停用' }}</a-descriptions-item>
          <a-descriptions-item label="创建人">{{ currentTemplate?.creator }}</a-descriptions-item>
          <a-descriptions-item label="创建时间">{{ currentTemplate?.createTime }}</a-descriptions-item>
          <a-descriptions-item label="更新时间">{{ currentTemplate?.updateTime }}</a-descriptions-item>

        </a-descriptions>

        <a-divider />
        <h4>关联组织</h4>
        <div v-if="currentTemplate?.associatedOrgs && currentTemplate.associatedOrgs.length > 0">
          <a-tag v-for="org in currentTemplate.associatedOrgs" :key="org" style="margin-bottom: 8px;">
            {{ org }}
          </a-tag>
        </div>
        <span v-else style="color: #999;">无关联组织</span>

        <a-divider />
        <h4>关联人员</h4>
        <div v-if="currentTemplate?.associatedUsers && currentTemplate.associatedUsers.length > 0">
          <a-tag v-for="user in currentTemplate.associatedUsers" :key="user" style="margin-bottom: 8px;">
            {{ user }}
          </a-tag>
        </div>
        <span v-else style="color: #999;">无关联人员</span>

        <a-divider />
        <h4>模板描述</h4>
        <p>{{ currentTemplate?.description || '暂无描述' }}</p>
      </div>
    </a-modal>

    <!-- 新增/编辑样例弹窗 -->
    <a-modal
      v-model:open="showAddExampleModal"
      :title="editingExample ? '编辑填写样例' : '新增填写样例'"
      width="1200px"
      @ok="handleExampleSubmit"
      @cancel="handleExampleCancel"
    >
      <a-form ref="exampleFormRef" :model="exampleForm" :rules="exampleRules" layout="vertical">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="样例名称" name="name">
              <a-input v-model:value="exampleForm.name" placeholder="请输入样例名称" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="计划类型" name="planType">
              <a-select v-model:value="exampleForm.planType" placeholder="选择计划类型">
                <a-select-option value="annual">年度计划</a-select-option>
                <a-select-option value="quarterly">季度计划</a-select-option>
                <a-select-option value="monthly">月度计划</a-select-option>
                <a-select-option value="weekly">周度计划</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="适用部门" name="department">
              <a-select v-model:value="exampleForm.department" placeholder="选择适用部门">
                <a-select-option value="all">通用样例</a-select-option>
                <a-select-option value="tech">技术部</a-select-option>
                <a-select-option value="sales">销售部</a-select-option>
                <a-select-option value="hr">人事部</a-select-option>
                <a-select-option value="finance">财务部</a-select-option>
                <a-select-option value="operations">运营部</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="状态" name="status">
              <a-select v-model:value="exampleForm.status" placeholder="选择状态">
                <a-select-option value="active">启用</a-select-option>
                <a-select-option value="inactive">停用</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>

        <a-form-item label="样例描述">
          <a-textarea v-model:value="exampleForm.description" :rows="3" placeholder="请输入样例描述" />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 样例详情弹窗 -->
    <a-modal
      v-model:open="showExampleDetailModal"
      :title="`${currentExample?.name} - 样例详情`"
      width="1400px"
      :footer="null"
    >
      <div class="example-detail">
        <a-descriptions title="基本信息" :column="2" size="small">
          <a-descriptions-item label="样例名称">{{ currentExample?.name }}</a-descriptions-item>
          <a-descriptions-item label="计划类型">{{ getTypeText(currentExample?.planType) }}</a-descriptions-item>
          <a-descriptions-item label="适用部门">{{ getDepartmentText(currentExample?.department) }}</a-descriptions-item>
          <a-descriptions-item label="状态">{{ currentExample?.status === 'active' ? '启用' : '停用' }}</a-descriptions-item>
          <a-descriptions-item label="创建人">{{ currentExample?.creator }}</a-descriptions-item>
          <a-descriptions-item label="创建时间">{{ currentExample?.createTime }}</a-descriptions-item>
          <a-descriptions-item label="更新时间">{{ currentExample?.updateTime }}</a-descriptions-item>
          <a-descriptions-item label="样例数量">{{ currentExample?.examples ? currentExample.examples.length : 0 }}条</a-descriptions-item>
        </a-descriptions>

        <a-divider />
        <h4>样例描述</h4>
        <p>{{ currentExample?.description || '暂无描述' }}</p>

        <a-divider />
        <h4>填写样例内容</h4>
        <a-table
          v-if="currentExample?.examples && currentExample.examples.length > 0"
          :dataSource="currentExample.examples"
          :columns="[
            { title: '序号', dataIndex: 'serialNumber', width: 80 },
            { title: '权重(%)', dataIndex: 'weight', width: 100 },
            { title: '项目', dataIndex: 'project', width: 150 },
            { title: '内容', dataIndex: 'content', width: 200, ellipsis: true },
            { title: '目标', dataIndex: 'target', width: 180, ellipsis: true },
            { title: '考核标准', dataIndex: 'standard', width: 180, ellipsis: true },
            { title: '责任人', dataIndex: 'responsible', width: 100 },
            { title: '实施措施', dataIndex: 'measures', width: 200, ellipsis: true }
          ]"
          :pagination="false"
          :scroll="{ x: 1200 }"
          size="small"
        />
        <a-empty v-else description="暂无样例内容" />
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import {
  PlusOutlined,
  ReloadOutlined,
  InboxOutlined
} from '@ant-design/icons-vue'

// 页面状态
const loading = ref(false)
const showAddModal = ref(false)
const showDetailModal = ref(false)
const editingTemplate = ref<any>(null)
const currentTemplate = ref<any>(null)
const selectedRows = ref<number[]>([])
const exampleTabKey = ref('annual')
const mainTabKey = ref('templates')

// 样例管理相关状态
const exampleLoading = ref(false)
const showAddExampleModal = ref(false)
const showExampleDetailModal = ref(false)
const editingExample = ref<any>(null)
const currentExample = ref<any>(null)
const selectedExampleRows = ref<number[]>([])

// 表单引用
const templateFormRef = ref()
const exampleFormRef = ref()

// 筛选条件
const filters = reactive({
  type: '',
  scope: '',
  status: '',
  keyword: ''
})

// 样例筛选条件
const exampleFilters = reactive({
  planType: '',
  department: '',
  status: '',
  keyword: ''
})

// 模板表单数据
const templateForm = reactive({
  name: '',
  type: '',
  scope: '',
  status: 'active',
  associatedOrgIds: [],
  associatedUserIds: [],
  description: '',
  fileList: []
})

// 样例表单数据
const exampleForm = reactive({
  name: '',
  planType: '',
  department: '',
  status: 'active',
  description: '',
  examples: []
})

// 表单验证规则
const templateRules = {
  name: [{ required: true, message: '请输入模板名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择模板类型', trigger: 'change' }],
  scope: [{ required: true, message: '请选择适用范围', trigger: 'change' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
}

// 样例表单验证规则
const exampleRules = {
  name: [{ required: true, message: '请输入样例名称', trigger: 'blur' }],
  planType: [{ required: true, message: '请选择计划类型', trigger: 'change' }],
  department: [{ required: true, message: '请选择适用部门', trigger: 'change' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
}

// 样例数据
const planExamples = ref([
  {
    id: 1,
    name: '技术部月度计划样例',
    planType: 'monthly',
    department: 'tech',
    status: 'active',
    description: '技术部门月度工作计划的标准样例，包含开发任务、技术优化、团队建设等',
    creator: '张三',
    createTime: '2024-01-15',
    updateTime: '2024-03-20',
    examples: [
      {
        serialNumber: 1,
        weight: 40,
        project: '核心系统优化',
        content: '对现有核心业务系统进行性能优化和架构重构',
        target: '系统响应时间提升30%，并发处理能力提升50%',
        standard: '平均响应时间<500ms，支持并发用户数>10000',
        responsible: '张三',
        timeRange: ['2024-04-01', '2024-04-30'],
        measures: '1.性能分析和瓶颈识别 2.数据库优化 3.缓存策略升级 4.负载均衡配置'
      },
      {
        serialNumber: 2,
        weight: 30,
        project: '新功能开发',
        content: '开发用户权限管理2.0模块，支持更细粒度的权限控制',
        target: '完成权限管理模块开发并上线',
        standard: '功能测试通过率100%，用户验收通过',
        responsible: '李四',
        timeRange: ['2024-04-05', '2024-04-25'],
        measures: '1.需求分析和设计 2.前后端开发 3.单元测试和集成测试 4.部署上线'
      }
    ]
  },
  {
    id: 2,
    name: '销售部月度计划样例',
    planType: 'monthly',
    department: 'sales',
    status: 'active',
    description: '销售部门月度工作计划样例，包含销售目标、客户开发、市场活动等',
    creator: '赵六',
    createTime: '2024-02-01',
    updateTime: '2024-03-15',
    examples: [
      {
        serialNumber: 1,
        weight: 50,
        project: '新客户开发',
        content: '开发20家新的企业客户，建立合作关系',
        target: '新增有效客户20家，签约客户不少于8家',
        standard: '客户质量评分≥B级，合同金额≥10万',
        responsible: '赵六',
        timeRange: ['2024-04-01', '2024-04-30'],
        measures: '1.目标客户调研 2.商务拜访 3.方案演示 4.合同谈判'
      }
    ]
  },
  {
    id: 3,
    name: '通用年度计划样例',
    planType: 'annual',
    department: 'all',
    status: 'active',
    description: '适用于所有部门的年度计划样例模板',
    creator: '周八',
    createTime: '2024-01-01',
    updateTime: '2024-01-01',
    examples: [
      {
        serialNumber: 1,
        weight: 40,
        project: '战略目标实现',
        content: '落实公司年度战略目标，确保部门指标达成',
        target: '部门核心指标完成率≥95%',
        standard: '月度考核达标，年度绩效评估优秀',
        responsible: '部门负责人',
        timeRange: ['2024-01-01', '2024-12-31'],
        measures: '1.目标分解 2.月度跟踪 3.季度复盘 4.及时调整'
      }
    ]
  }
])

// 组织树数据（用于选择关联组织）
const orgTreeSelectData = ref([
  {
    value: '1',
    title: '天云聚合科技有限公司',
    children: [
      {
        value: '2',
        title: '技术事业部',
        children: [
          { value: '3', title: '前端开发部' },
          { value: '4', title: '后端开发部' },
          { value: '5', title: '测试部' }
        ]
      },
      {
        value: '6',
        title: '产品事业部',
        children: [
          { value: '7', title: '产品设计部' },
          { value: '8', title: 'UI设计部' }
        ]
      },
      { value: '9', title: '市场运营部' },
      { value: '10', title: '人力资源部' },
      { value: '11', title: '财务部' }
    ]
  }
])

// 所有用户数据
const allUsers = ref([
  { id: 1, name: '张三', position: '高级工程师' },
  { id: 2, name: '李四', position: '产品经理' },
  { id: 3, name: '王五', position: '市场总监' },
  { id: 4, name: '赵六', position: 'HR主管' },
  { id: 5, name: '孙七', position: '财务经理' }
])

// 模板数据
const templates = ref([
  {
    id: 1,
    name: '标准月度计划模板',
    type: 'monthly',
    scope: 'company',
    status: 'active',
    description: '公司通用的月度工作计划模板，包含完整的目标设定和执行跟踪字段',
    creator: '张三',
    updateTime: '2024-01-15',
    associatedOrgs: ['技术部', '产品部', '市场部'],
    fields: [
      { name: '序号', type: 'number', required: true },
      { name: '权重', type: 'number', required: true },
      { name: '项目', type: 'text', required: true },
      { name: '内容', type: 'textarea', required: true },
      { name: '目标', type: 'textarea', required: true }
    ]
  },
  {
    id: 2,
    name: '技术部月度计划模板',
    type: 'monthly',
    scope: 'department',
    status: 'active',
    description: '专为技术部定制的月度计划模板，增加技术评估和风险控制字段',
    creator: '李四',
    updateTime: '2024-02-10',
    associatedOrgs: ['技术部'],
    fields: [
      { name: '序号', type: 'number', required: true },
      { name: '技术模块', type: 'text', required: true },
      { name: '开发目标', type: 'textarea', required: true },
      { name: '技术难度', type: 'select', required: true },
      { name: '风险评估', type: 'textarea', required: false }
    ]
  },
  {
    id: 3,
    name: '标准周报模板',
    type: 'weekly',
    scope: 'company',
    status: 'active',
    description: '全公司通用的周报模板，简洁明了的工作汇报格式',
    creator: '王五',
    updateTime: '2024-01-20',
    associatedOrgs: ['技术部', '产品部', '市场部', '销售部', '人事部'],
    fields: [
      { name: '本周工作', type: 'textarea', required: true },
      { name: '下周计划', type: 'textarea', required: true },
      { name: '遇到问题', type: 'textarea', required: false },
      { name: '需要协助', type: 'textarea', required: false }
    ]
  },
  {
    id: 4,
    name: '销售部周报模板',
    type: 'weekly',
    scope: 'department',
    status: 'active',
    description: '销售部专用周报模板，包含客户拜访和业绩统计',
    creator: '赵六',
    updateTime: '2024-02-05',
    associatedOrgs: ['销售部'],
    fields: [
      { name: '客户拜访', type: 'textarea', required: true },
      { name: '销售业绩', type: 'number', required: true },
      { name: '客户反馈', type: 'textarea', required: false },
      { name: '竞争对手', type: 'textarea', required: false }
    ]
  },
  {
    id: 5,
    name: 'OKR目标设定模板',
    type: 'quarterly',
    scope: 'company',
    status: 'active',
    description: '基于OKR方法论的目标设定模板，适用于季度目标制定',
    creator: '孙七',
    updateTime: '2024-03-01',
    associatedOrgs: ['技术部', '产品部', '市场部'],
    fields: [
      { name: '目标(O)', type: 'textarea', required: true },
      { name: '关键结果1', type: 'textarea', required: true },
      { name: '关键结果2', type: 'textarea', required: false },
      { name: '关键结果3', type: 'textarea', required: false },
      { name: '信心指数', type: 'number', required: true }
    ]
  },
  {
    id: 6,
    name: '年度战略规划模板',
    type: 'annual',
    scope: 'company',
    status: 'active',
    description: '公司年度战略规划专用模板，包含详细的战略分析框架',
    creator: '周八',
    updateTime: '2024-01-05',
    associatedOrgs: ['公司领导层'],
    fields: [
      { name: '战略目标', type: 'textarea', required: true },
      { name: 'SWOT分析', type: 'textarea', required: true },
      { name: '关键举措', type: 'textarea', required: true },
      { name: '资源需求', type: 'textarea', required: true },
      { name: '风险预案', type: 'textarea', required: false }
    ]
  },
  {
    id: 7,
    name: '项目管理模板',
    type: 'other',
    scope: 'project',
    status: 'active',
    description: '项目管理专用模板，涵盖项目各阶段的关键要素',
    creator: '吴九',
    updateTime: '2024-02-20',
    associatedOrgs: ['技术部', '产品部'],
    fields: [
      { name: '项目名称', type: 'text', required: true },
      { name: '项目目标', type: 'textarea', required: true },
      { name: '里程碑', type: 'textarea', required: true },
      { name: '资源配置', type: 'textarea', required: true },
      { name: '风险控制', type: 'textarea', required: false }
    ]
  },
  {
    id: 8,
    name: '培训计划模板',
    type: 'monthly',
    scope: 'department',
    status: 'active',
    description: '人事部培训计划专用模板，包含培训需求分析和效果评估',
    creator: '郑十',
    updateTime: '2024-03-10',
    associatedOrgs: ['人事部'],
    fields: [
      { name: '培训主题', type: 'text', required: true },
      { name: '培训对象', type: 'text', required: true },
      { name: '培训目标', type: 'textarea', required: true },
      { name: '培训内容', type: 'textarea', required: true },
      { name: '效果评估', type: 'textarea', required: false }
    ]
  },
  {
    id: 9,
    name: '市场活动策划模板',
    type: 'other',
    scope: 'department',
    status: 'active',
    description: '市场部活动策划专用模板，包含活动全流程管理要素',
    creator: '刘十一',
    updateTime: '2024-02-25',
    associatedOrgs: ['市场部'],
    fields: [
      { name: '活动名称', type: 'text', required: true },
      { name: '活动目标', type: 'textarea', required: true },
      { name: '目标受众', type: 'text', required: true },
      { name: '预算规划', type: 'number', required: true },
      { name: '效果预期', type: 'textarea', required: false }
    ]
  },
  {
    id: 10,
    name: '产品需求文档模板',
    type: 'other',
    scope: 'department',
    status: 'active',
    description: '产品部需求文档标准模板，规范产品需求描述格式',
    creator: '陈十二',
    updateTime: '2024-03-05',
    associatedOrgs: ['产品部', '技术部'],
    fields: [
      { name: '需求背景', type: 'textarea', required: true },
      { name: '功能描述', type: 'textarea', required: true },
      { name: '验收标准', type: 'textarea', required: true },
      { name: '优先级', type: 'select', required: true },
      { name: '技术要求', type: 'textarea', required: false }
    ]
  },
  {
    id: 11,
    name: '简化日报模板',
    type: 'daily',
    scope: 'company',
    status: 'active',
    description: '简化版日报模板，快速记录每日工作进展',
    creator: '张三',
    updateTime: '2024-01-25',
    associatedOrgs: ['技术部', '产品部', '市场部'],
    fields: [
      { name: '今日完成', type: 'textarea', required: true },
      { name: '明日计划', type: 'textarea', required: true },
      { name: '遇到问题', type: 'textarea', required: false }
    ]
  },
  {
    id: 12,
    name: '客户服务反馈模板',
    type: 'other',
    scope: 'department',
    status: 'draft',
    description: '客户服务部反馈收集模板，用于客户满意度调研',
    creator: '李四',
    updateTime: '2024-03-15',
    associatedOrgs: ['客户服务部'],
    fields: [
      { name: '客户信息', type: 'text', required: true },
      { name: '服务类型', type: 'select', required: true },
      { name: '满意度评分', type: 'number', required: true },
      { name: '改进建议', type: 'textarea', required: false }
    ]
  }
])

// 表格列定义
const templateColumns = [
  {
    title: '模板名称',
    dataIndex: 'name',
    key: 'name',
    width: 200,
    fixed: 'left'
  },
  {
    title: '类型',
    key: 'type',
    width: 100
  },
  {
    title: '适用范围',
    key: 'scope',
    width: 100
  },
  {
    title: '状态',
    key: 'status',
    width: 80
  },
  {
    title: '关联组织',
    key: 'associatedOrgs',
    width: 150
  },
  {
    title: '创建人',
    dataIndex: 'creator',
    key: 'creator',
    width: 100
  },

  {
    title: '更新时间',
    dataIndex: 'updateTime',
    key: 'updateTime',
    width: 120
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

// 样例分页配置
const examplePagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total: number) => `共 ${total} 条记录`
})

// 样例表格列定义
const exampleColumns = [
  {
    title: '样例名称',
    dataIndex: 'name',
    key: 'name',
    width: 200,
    fixed: 'left'
  },
  {
    title: '计划类型',
    dataIndex: 'planType',
    key: 'planType',
    width: 120
  },
  {
    title: '适用部门',
    dataIndex: 'department',
    key: 'department',
    width: 120
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 80
  },
  {
    title: '样例数量',
    key: 'exampleCount',
    width: 100
  },
  {
    title: '描述',
    dataIndex: 'description',
    key: 'description',
    width: 250,
    ellipsis: true
  },
  {
    title: '创建人',
    dataIndex: 'creator',
    key: 'creator',
    width: 100
  },
  {
    title: '更新时间',
    dataIndex: 'updateTime',
    key: 'updateTime',
    width: 120
  },
  {
    title: '操作',
    key: 'actions',
    width: 200,
    fixed: 'right'
  }
]

// 过滤后的模板数据
const filteredTemplates = computed(() => {
  let result = templates.value

  if (filters.type) {
    result = result.filter(t => t.type === filters.type)
  }
  
  if (filters.scope) {
    result = result.filter(t => t.scope === filters.scope)
  }
  
  if (filters.status) {
    result = result.filter(t => t.status === filters.status)
  }
  
  if (filters.keyword) {
    result = result.filter(t => 
      t.name.includes(filters.keyword) ||
      t.description.includes(filters.keyword)
    )
  }

  return result
})

// 过滤后的样例数据
const filteredExamples = computed(() => {
  let result = planExamples.value

  if (exampleFilters.planType) {
    result = result.filter(e => e.planType === exampleFilters.planType)
  }
  
  if (exampleFilters.department) {
    result = result.filter(e => e.department === exampleFilters.department)
  }
  
  if (exampleFilters.status) {
    result = result.filter(e => e.status === exampleFilters.status)
  }
  
  if (exampleFilters.keyword) {
    result = result.filter(e => 
      e.name.includes(exampleFilters.keyword) ||
      e.description.includes(exampleFilters.keyword)
    )
  }

  return result
})

// 获取类型颜色
const getTypeColor = (type: string) => {
  const colorMap: Record<string, string> = {
    'annual': '#722ed1',
    'quarterly': '#1890ff',
    'monthly': '#52c41a',
    'weekly': '#fa8c16',
    'daily': '#13c2c2',
    'other': '#666'
  }
  return colorMap[type] || '#666'
}

// 获取类型文本
const getTypeText = (type: string) => {
  const textMap: Record<string, string> = {
    'annual': '年度模板',
    'quarterly': '季度模板',
    'monthly': '月度模板',
    'weekly': '周度模板',
    'daily': '日度模板',
    'other': '其他类型'
  }
  return textMap[type] || '未知'
}

// 获取范围颜色
const getScopeColor = (scope: string) => {
  const colorMap: Record<string, string> = {
    'company': '#722ed1',
    'department': '#1890ff',
    'personal': '#52c41a'
  }
  return colorMap[scope] || '#666'
}

// 获取范围文本
const getScopeText = (scope: string) => {
  const textMap: Record<string, string> = {
    'company': '公司级',
    'department': '部门级',
    'personal': '个人级'
  }
  return textMap[scope] || '未知'
}

// 获取部门颜色
const getDepartmentColor = (department: string) => {
  const colorMap: Record<string, string> = {
    'all': '#722ed1',
    'tech': '#1890ff',
    'sales': '#52c41a',
    'hr': '#fa8c16',
    'finance': '#13c2c2',
    'operations': '#eb2f96'
  }
  return colorMap[department] || '#666'
}

// 获取部门文本
const getDepartmentText = (department: string) => {
  const textMap: Record<string, string> = {
    'all': '通用样例',
    'tech': '技术部',
    'sales': '销售部',
    'hr': '人事部',
    'finance': '财务部',
    'operations': '运营部'
  }
  return textMap[department] || '未知'
}

// 刷新数据
const refreshData = async () => {
  loading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    message.success('数据刷新成功')
  } catch (error) {
    message.error('刷新失败')
  } finally {
    loading.value = false
  }
}

// 文件上传前处理
const beforeUpload = (file: any) => {
  const isExcel = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
                  file.type === 'application/vnd.ms-excel'
  if (!isExcel) {
    message.error('只能上传 Excel 文件!')
    return false
  }
  
  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isLt2M) {
    message.error('文件大小不能超过 2MB!')
    return false
  }
  
  return false // 阻止自动上传
}

// 文件移除处理
const handleFileRemove = () => {
  templateForm.fileList = []
}

// 提交表单
const handleSubmit = async () => {
  try {
    await templateFormRef.value.validate()
    
    const formData = {
      ...templateForm,
      id: editingTemplate.value?.id || Date.now()
    }
    
    console.log('提交模板数据:', formData)
    
    message.success(editingTemplate.value ? '模板更新成功' : '模板创建成功')
    showAddModal.value = false
    resetForm()
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}

// 取消表单
const handleCancel = () => {
  showAddModal.value = false
  resetForm()
}

// 重置表单
const resetForm = () => {
  Object.assign(templateForm, {
    name: '',
    type: '',
    scope: '',
    status: 'active',
    associatedOrgIds: [],
    associatedUserIds: [],
    description: '',
    fileList: []
  })
  editingTemplate.value = null
}

// 查看模板
const viewTemplate = (template: any) => {
  currentTemplate.value = template
  showDetailModal.value = true
}

// 编辑模板
const editTemplate = (template: any) => {
  editingTemplate.value = template
  Object.assign(templateForm, {
    name: template.name,
    type: template.type,
    scope: template.scope,
    status: template.status,
    associatedOrgIds: template.associatedOrgIds || [],
    associatedUserIds: template.associatedUserIds || [],
    description: template.description || '',
    fileList: []
  })
  showAddModal.value = true
}

// 复制模板
const copyTemplate = (template: any) => {
  Object.assign(templateForm, {
    name: `${template.name} - 副本`,
    type: template.type,
    scope: template.scope,
    status: 'inactive',
    associatedOrgIds: template.associatedOrgIds || [],
    associatedUserIds: template.associatedUserIds || [],
    description: template.description || '',
    fileList: []
  })
  editingTemplate.value = null
  showAddModal.value = true
}

// 删除模板
const deleteTemplate = (id: number) => {
  console.log('删除模板:', id)
  message.success('模板删除成功')
}

// 批量删除
const batchDelete = () => {
  console.log('批量删除:', selectedRows.value)
  message.success(`成功删除 ${selectedRows.value.length} 个模板`)
  selectedRows.value = []
}

// 导出模板
const exportTemplates = () => {
  console.log('导出模板:', selectedRows.value)
  message.success(`成功导出 ${selectedRows.value.length} 个模板`)
}

// 选择变化处理
const handleSelectionChange = (selectedRowKeys: number[]) => {
  selectedRows.value = selectedRowKeys
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

// 主标签切换处理
const handleMainTabChange = (key: string) => {
  mainTabKey.value = key
  if (key === 'examples') {
    examplePagination.total = planExamples.value.length
  }
}

// 样例筛选变化处理
const handleExampleFilterChange = () => {
  console.log('Example filter changed:', exampleFilters)
}

// 样例表格变化处理
const handleExampleTableChange = (pag: any) => {
  examplePagination.current = pag.current
  examplePagination.pageSize = pag.pageSize
}

// 样例选择变化处理
const handleExampleSelectionChange = (selectedRowKeys: number[]) => {
  selectedExampleRows.value = selectedRowKeys
}

// 查看样例
const viewExample = (example: any) => {
  currentExample.value = example
  showExampleDetailModal.value = true
}

// 编辑样例
const editExample = (example: any) => {
  editingExample.value = example
  Object.assign(exampleForm, {
    name: example.name,
    planType: example.planType,
    department: example.department,
    status: example.status,
    description: example.description || '',
    examples: example.examples || []
  })
  showAddExampleModal.value = true
}

// 复制样例
const copyExample = (example: any) => {
  Object.assign(exampleForm, {
    name: `${example.name} - 副本`,
    planType: example.planType,
    department: example.department,
    status: 'inactive',
    description: example.description || '',
    examples: example.examples || []
  })
  editingExample.value = null
  showAddExampleModal.value = true
}

// 删除样例
const deleteExample = (id: number) => {
  console.log('删除样例:', id)
  message.success('样例删除成功')
}

// 批量删除样例
const batchDeleteExamples = () => {
  console.log('批量删除样例:', selectedExampleRows.value)
  message.success(`成功删除 ${selectedExampleRows.value.length} 个样例`)
  selectedExampleRows.value = []
}

// 重置样例表单
const resetExampleForm = () => {
  Object.assign(exampleForm, {
    name: '',
    planType: '',
    department: '',
    status: 'active',
    description: '',
    examples: []
  })
  editingExample.value = null
}

// 提交样例表单
const handleExampleSubmit = async () => {
  try {
    await exampleFormRef.value.validate()
    
    const formData = {
      ...exampleForm,
      id: editingExample.value?.id || Date.now(),
      creator: '当前用户',
      createTime: new Date().toISOString().split('T')[0],
      updateTime: new Date().toISOString().split('T')[0]
    }
    
    console.log('提交样例数据:', formData)
    
    message.success(editingExample.value ? '样例更新成功' : '样例创建成功')
    showAddExampleModal.value = false
    resetExampleForm()
  } catch (error) {
    console.error('样例表单验证失败:', error)
  }
}

// 取消样例表单
const handleExampleCancel = () => {
  showAddExampleModal.value = false
  resetExampleForm()
}

// 页面初始化
onMounted(() => {
  pagination.total = templates.value.length
})
</script>

<style scoped>
.template-management {
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

.template-example {
  margin-bottom: 16px;
}

.template-example p {
  margin-bottom: 12px;
  font-weight: 500;
}

.template-example .ant-tag {
  margin-bottom: 8px;
}

.template-detail {
  max-height: 600px;
  overflow-y: auto;
}

:deep(.ant-table-tbody > tr > td) {
  padding: 8px !important;
}

:deep(.ant-upload-drag) {
  background: #fafafa;
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
}
</style> 