<template>
  <div class="dashboard">
    <!-- 英雄区域 -->
    <div class="hero-section">
      <div class="hero-content">
        <div class="hero-left">
          <h1 class="hero-title">
            <span class="hero-icon">🎯</span>
            目标与工作管理系统
          </h1>
          <p class="hero-subtitle">
            智能化目标管理，助力团队高效协作
          </p>
        </div>
        <div class="hero-right">
          <div class="hero-image">
            <div class="floating-card card-1">
              <CheckCircleOutlined />
              <span>目标达成</span>
            </div>
            <div class="floating-card card-2">
              <TeamOutlined />
              <span>团队协作</span>
            </div>
            <div class="floating-card card-3">
              <TrophyOutlined />
              <span>绩效提升</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 快速统计 -->
    <div class="stats-section">
      <a-row :gutter="24">
        <a-col :span="6">
          <div class="stats-card clickable" style="border-left: 4px solid #1890ff;" @click="navigateToStats('monthly-plans')">
            <div class="stats-icon" style="color: #1890ff;">
              <AimOutlined />
            </div>
            <div class="stats-content">
              <div class="stats-title">本月计划</div>
              <div class="stats-number">{{ stats.monthlyPlans }}</div>
              <div class="stats-desc">较上月 +12%</div>
            </div>
            <div class="stats-arrow">
              <ArrowRightOutlined />
            </div>
          </div>
        </a-col>
        <a-col :span="6">
          <div class="stats-card clickable" style="border-left: 4px solid #52c41a;" @click="navigateToStats('monthly-summaries')">
            <div class="stats-icon" style="color: #52c41a;">
              <CheckCircleOutlined />
            </div>
            <div class="stats-content">
              <div class="stats-title">完成率</div>
              <div class="stats-number">{{ stats.completionRate }}%</div>
              <div class="stats-desc">较上月 +5%</div>
            </div>
            <div class="stats-arrow">
              <ArrowRightOutlined />
            </div>
          </div>
        </a-col>
        <a-col :span="6">
          <div class="stats-card clickable" style="border-left: 4px solid #fa8c16;" @click="navigateToStats('monthly-monitoring')">
            <div class="stats-icon" style="color: #fa8c16;">
              <TeamOutlined />
            </div>
            <div class="stats-content">
              <div class="stats-title">团队成员</div>
              <div class="stats-number">{{ stats.teamMembers }}</div>
              <div class="stats-desc">活跃用户</div>
            </div>
            <div class="stats-arrow">
              <ArrowRightOutlined />
            </div>
          </div>
        </a-col>
        <a-col :span="6">
          <div class="stats-card clickable" style="border-left: 4px solid #eb2f96;" @click="navigateToStats('monthly-audit')">
            <div class="stats-icon" style="color: #eb2f96;">
              <ClockCircleOutlined />
            </div>
            <div class="stats-content">
              <div class="stats-title">待审核</div>
              <div class="stats-number">{{ stats.pendingReview }}</div>
              <div class="stats-desc">需要处理</div>
            </div>
            <div class="stats-arrow">
              <ArrowRightOutlined />
            </div>
          </div>
        </a-col>
      </a-row>
    </div>

    <!-- 月度数据概览 -->
    <div class="monthly-overview-section">
      <h2 class="section-title">月度数据概览</h2>
      <a-row :gutter="24">
        <a-col :span="12">
          <a-card title="月度计划执行情况" class="overview-card clickable" @click="navigateToStats('monthly-plans')">
            <div class="overview-content">
              <div class="overview-stats">
                <div class="overview-item">
                  <div class="overview-label">总计划数</div>
                  <div class="overview-value">{{ stats.totalPlans }}</div>
                </div>
                <div class="overview-item">
                  <div class="overview-label">已完成</div>
                  <div class="overview-value completed">{{ stats.completedPlans }}</div>
                </div>
                <div class="overview-item">
                  <div class="overview-label">进行中</div>
                  <div class="overview-value progress">{{ stats.inProgressPlans }}</div>
                </div>
                <div class="overview-item">
                  <div class="overview-label">待开始</div>
                  <div class="overview-value pending">{{ stats.pendingPlans }}</div>
                </div>
              </div>
              <div class="overview-progress">
                <a-progress 
                  :percent="Math.round((stats.completedPlans / stats.totalPlans) * 100)" 
                  status="active"
                  stroke-color="#52c41a"
                />
              </div>
            </div>
            <div class="card-action">
              <span>查看详情</span>
              <ArrowRightOutlined />
            </div>
          </a-card>
        </a-col>
        <a-col :span="12">
          <a-card title="月度目标完成度" class="overview-card clickable" @click="navigateToStats('monthly-summaries')">
            <div class="overview-content">
              <div class="overview-stats">
                <div class="overview-item">
                  <div class="overview-label">总目标数</div>
                  <div class="overview-value">{{ stats.totalGoals }}</div>
                </div>
                <div class="overview-item">
                  <div class="overview-label">已达成</div>
                  <div class="overview-value completed">{{ stats.completedGoals }}</div>
                </div>
                <div class="overview-item">
                  <div class="overview-label">进行中</div>
                  <div class="overview-value progress">{{ stats.inProgressGoals }}</div>
                </div>
                <div class="overview-item">
                  <div class="overview-label">延期</div>
                  <div class="overview-value delayed">{{ stats.delayedGoals }}</div>
                </div>
              </div>
              <div class="overview-progress">
                <a-progress 
                  :percent="Math.round((stats.completedGoals / stats.totalGoals) * 100)" 
                  status="active"
                  stroke-color="#1890ff"
                />
              </div>
            </div>
            <div class="card-action">
              <span>查看详情</span>
              <ArrowRightOutlined />
            </div>
          </a-card>
        </a-col>
      </a-row>
    </div>

    <!-- 功能导航 -->
    <div class="features-section">
      <h2 class="section-title">功能导航</h2>
      <a-row :gutter="24">
        <a-col :span="8" v-for="feature in features" :key="feature.key">
          <div class="feature-card" @click="navigateTo(feature.path)">
            <div class="feature-header">
              <div class="feature-icon" :style="{ 
                color: feature.color,
                backgroundColor: feature.color + '15'
              }">
                <component :is="feature.icon" />
              </div>
              <div class="feature-badge" v-if="feature.badge">{{ feature.badge }}</div>
            </div>
            <div class="feature-content">
              <h3 class="feature-title">{{ feature.title }}</h3>
              <p class="feature-desc">{{ feature.description }}</p>
              <div class="feature-action">
                <span>立即使用</span>
                <ArrowRightOutlined />
              </div>
            </div>
          </div>
        </a-col>
      </a-row>
    </div>

    <!-- 最近活动 -->
    <div class="activity-section">
      <h2 class="section-title">最近活动</h2>
      <a-card class="activity-card">
        <a-timeline>
          <a-timeline-item v-for="activity in recentActivities" :key="activity.id" :color="activity.color">
            <div class="activity-item">
              <div class="activity-content">
                <div class="activity-title">{{ activity.title }}</div>
                <div class="activity-desc">{{ activity.description }}</div>
              </div>
              <div class="activity-time">{{ activity.time }}</div>
            </div>
          </a-timeline-item>
        </a-timeline>
      </a-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import {
  AimOutlined,
  FileTextOutlined,
  BookOutlined,
  BarChartOutlined,
  CheckCircleOutlined,
  TeamOutlined,
  TrophyOutlined,
  ClockCircleOutlined,
  ArrowRightOutlined,
  LineChartOutlined,
  SettingOutlined,
  FlagOutlined,
  ExclamationCircleOutlined,
  SyncOutlined
} from '@ant-design/icons-vue'

const router = useRouter()

// 响应式数据
const loading = ref(false)

// 统计数据
const stats = reactive({
  monthlyPlans: 24,
  completionRate: 85,
  teamMembers: 156,
  pendingReview: 8,
  totalGoals: 45,
  completedGoals: 28,
  inProgressGoals: 15,
  delayedGoals: 2,
  totalPlans: 186,
  completedPlans: 124,
  inProgressPlans: 45,
  pendingPlans: 17,
  totalTemplates: 12,
  activeTemplates: 11,
  totalUsers: 156,
  activeUsers: 142
})

// 待办事项
const todoItems = ref([
  {
    id: 1,
    title: '审核Q1技术部OKR目标',
    type: 'audit',
    priority: 'high',
    deadline: '2024-01-20',
    department: '技术部',
    status: 'pending'
  },
  {
    id: 2,
    title: '完成月度计划模板优化',
    type: 'template',
    priority: 'medium',
    deadline: '2024-01-25',
    department: '人事部',
    status: 'pending'
  },
  {
    id: 3,
    title: '提交产品优化方案',
    type: 'plan',
    priority: 'high',
    deadline: '2024-01-18',
    department: '产品部',
    status: 'pending'
  },
  {
    id: 4,
    title: '客户满意度调研分析',
    type: 'report',
    priority: 'medium',
    deadline: '2024-01-22',
    department: '市场部',
    status: 'pending'
  },
  {
    id: 5,
    title: '年度绩效考核准备',
    type: 'audit',
    priority: 'high',
    deadline: '2024-01-30',
    department: '人事部',
    status: 'pending'
  },
  {
    id: 6,
    title: '系统安全评估报告',
    type: 'report',
    priority: 'high',
    deadline: '2024-01-19',
    department: '技术部',
    status: 'pending'
  },
  {
    id: 7,
    title: '新员工培训计划制定',
    type: 'plan',
    priority: 'medium',
    deadline: '2024-01-26',
    department: '人事部',
    status: 'pending'
  },
  {
    id: 8,
    title: '市场推广效果评估',
    type: 'audit',
    priority: 'medium',
    deadline: '2024-01-28',
    department: '市场部',
    status: 'pending'
  }
])

// 最近更新
const recentUpdates = ref([
  {
    id: 1,
    title: '产品功能迭代计划',
    type: 'plan',
    user: '张三',
    department: '产品部',
    time: '2小时前',
    action: '更新',
    status: 'completed'
  },
  {
    id: 2,
    title: '技术架构升级目标',
    type: 'goal',
    user: '李四',
    department: '技术部',
    time: '3小时前',
    action: '审核通过',
    status: 'approved'
  },
  {
    id: 3,
    title: '市场推广月度总结',
    type: 'summary',
    user: '王五',
    department: '市场部',
    time: '5小时前',
    action: '提交',
    status: 'submitted'
  },
  {
    id: 4,
    title: '客户服务标准模板',
    type: 'template',
    user: '赵六',
    department: '客服部',
    time: '1天前',
    action: '创建',
    status: 'draft'
  },
  {
    id: 5,
    title: '销售业绩分析报告',
    type: 'report',
    user: '孙七',
    department: '销售部',
    time: '1天前',
    action: '完成',
    status: 'completed'
  },
  {
    id: 6,
    title: '人员招聘计划',
    type: 'plan',
    user: '周八',
    department: '人事部',
    time: '2天前',
    action: '修订',
    status: 'revised'
  },
  {
    id: 7,
    title: '财务预算审核',
    type: 'audit',
    user: '吴九',
    department: '财务部',
    time: '2天前',
    action: '驳回',
    status: 'rejected'
  },
  {
    id: 8,
    title: '供应商管理优化',
    type: 'goal',
    user: '郑十',
    department: '采购部',
    time: '3天前',
    action: '启动',
    status: 'started'
  }
])

// 工作日程
const schedule = ref([
  {
    id: 1,
    time: '09:00',
    title: '技术部周会',
    type: 'meeting',
    participants: ['张三', '李四', '王五'],
    location: '会议室A',
    status: 'upcoming'
  },
  {
    id: 2,
    time: '10:30',
    title: 'OKR目标评审',
    type: 'review',
    participants: ['产品部全员'],
    location: '会议室B',
    status: 'upcoming'
  },
  {
    id: 3,
    time: '14:00',
    title: '月度计划汇报',
    type: 'report',
    participants: ['各部门负责人'],
    location: '大会议室',
    status: 'upcoming'
  },
  {
    id: 4,
    time: '15:30',
    title: '客户需求讨论',
    type: 'discussion',
    participants: ['产品部', '技术部'],
    location: '会议室C',
    status: 'upcoming'
  },
  {
    id: 5,
    time: '16:30',
    title: '模板优化评审',
    type: 'review',
    participants: ['人事部', 'IT部'],
    location: '小会议室',
    status: 'upcoming'
  }
])

// 功能列表
const features = ref([
  {
    key: 'monthly-plans',
    title: '月度计划',
    description: '制定和管理月度目标计划，跟踪执行进度',
    icon: AimOutlined,
    color: '#1890ff',
    path: '/plans/monthly',
    badge: 'NEW'
  },
  {
    key: 'monthly-summaries',
    title: '月度总结',
    description: '查看和编辑月度工作总结，评估目标达成情况',
    icon: FileTextOutlined,
    color: '#52c41a',
    path: '/summaries/monthly'
  },
  {
    key: 'template-management',
    title: '模板管理',
    description: '管理工作模板和范例，提升工作效率',
    icon: BookOutlined,
    color: '#fa8c16',
    path: '/templates/management'
  },
  {
    key: 'execution-board',
    title: '执行看板',
    description: '实时监控目标执行情况，数据可视化分析',
    icon: BarChartOutlined,
    color: '#eb2f96',
    path: '/monitoring/execution'
  },
  {
    key: 'goal-query',
    title: '目标查询',
    description: '快速查询和检索历史目标数据',
    icon: LineChartOutlined,
    color: '#722ed1',
    path: '/audit/goal-query'
  },
  {
    key: 'system-settings',
    title: '系统设置',
    description: '配置系统参数，管理用户权限',
    icon: SettingOutlined,
    color: '#13c2c2',
    path: '/system/organization'
  }
])

// 最近活动
const recentActivities = ref([
  {
    id: 1,
    title: '张三提交了月度计划',
    description: '2024年12月产品优化计划已提交，等待审核',
    time: '2分钟前',
    color: 'blue'
  },
  {
    id: 2,
    title: '李四完成了周度总结',
    description: '第50周工作总结已完成，完成率95%',
    time: '15分钟前',
    color: 'green'
  },
  {
    id: 3,
    title: '系统自动提醒',
    description: '本月计划截止时间还有3天',
    time: '1小时前',
    color: 'orange'
  },
  {
    id: 4,
    title: '王五创建了新模板',
    description: '技术开发计划模板已创建并发布',
    time: '2小时前',
    color: 'purple'
  }
])

// 导航到指定页面
const navigateTo = (path: string) => {
  router.push(path)
  message.success('正在跳转...')
}

// 导航到统计相关页面
const navigateToStats = (statType: string) => {
  let targetPath = ''
  let message_text = ''
  
  switch (statType) {
    case 'monthly-plans':
      targetPath = '/plans/monthly'
      message_text = '正在跳转到月度计划页面...'
      break
    case 'monthly-summaries':
      targetPath = '/summaries/monthly'
      message_text = '正在跳转到月度总结页面...'
      break
    case 'monthly-monitoring':
      targetPath = '/monitoring/execution'
      message_text = '正在跳转到执行监控页面...'
      break
    case 'monthly-audit':
      targetPath = '/audit/monthly'
      message_text = '正在跳转到月度审核页面...'
      break
    default:
      targetPath = '/plans/monthly'
      message_text = '正在跳转到月度计划页面...'
  }
  
  router.push(targetPath)
  message.success(message_text)
}

onMounted(() => {
  // 可以在这里加载真实数据
  console.log('Dashboard 加载完成')
})
</script>

<style scoped>
.dashboard {
  padding: 0;
  background: #f5f7fa;
  min-height: 100vh;
}

/* 英雄区域 */
.hero-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px 24px 30px;
  color: white;
  position: relative;
  overflow: hidden;
}

.hero-content {
  display: flex;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
}

.hero-left {
  flex: 1;
}

.hero-title {
  font-size: 36px;
  font-weight: 700;
  margin: 0 0 12px 0;
  color: white;
  display: flex;
  align-items: center;
  gap: 12px;
}

.hero-icon {
  font-size: 40px;
}

.hero-subtitle {
  font-size: 16px;
  opacity: 0.9;
  margin-bottom: 20px;
  font-weight: 300;
}

.hero-right {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

.hero-image {
  position: relative;
  width: 220px;
  height: 220px;
}

.floating-card {
  position: absolute;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  padding: 10px 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  font-weight: 500;
  min-width: 100px;
  animation: float 4s ease-in-out infinite;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.card-1 {
  top: 15px;
  left: 5px;
  animation-delay: 0s;
}

.card-2 {
  top: 100px;
  right: 15px;
  animation-delay: 1.5s;
}

.card-3 {
  bottom: 25px;
  left: 25px;
  animation-delay: 3s;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

/* 统计区域 */
.stats-section {
  padding: 50px 24px;
  margin-top: -20px;
  position: relative;
  z-index: 1;
}

.stats-card {
  background: white;
  border-radius: 12px;
  padding: 28px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  gap: 18px;
  transition: all 0.3s ease;
  min-height: 120px;
  position: relative;
}

.stats-card.clickable {
  cursor: pointer;
}

.stats-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.stats-card.clickable:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
  border-left-width: 6px !important;
}

.stats-card.clickable:hover .stats-arrow {
  color: #40a9ff;
  transform: translateX(4px);
}

.stats-icon {
  font-size: 36px;
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(24, 144, 255, 0.1);
  border-radius: 12px;
}

.stats-content {
  flex: 1;
}

.stats-title {
  font-size: 15px;
  color: #666;
  margin-bottom: 6px;
  font-weight: 500;
}

.stats-number {
  font-size: 28px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 6px;
}

.stats-desc {
  font-size: 13px;
  color: #52c41a;
  font-weight: 500;
}

.stats-arrow {
  font-size: 16px;
  color: #bfbfbf;
  margin-left: auto;
  transition: all 0.3s ease;
  opacity: 0.7;
}

/* 月度数据概览 */
.monthly-overview-section {
  padding: 40px 24px;
  background: white;
  margin: 0 24px;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.overview-card {
  border-radius: 12px;
  border: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  cursor: pointer;
}

.overview-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.overview-card :deep(.ant-card-head) {
  border-bottom: 1px solid #f0f0f0;
  padding: 16px 20px;
}

.overview-card :deep(.ant-card-head-title) {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
}

.overview-card :deep(.ant-card-body) {
  padding: 20px;
}

.overview-content {
  margin-bottom: 16px;
}

.overview-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.overview-item {
  text-align: center;
  padding: 12px;
  background: #fafafa;
  border-radius: 8px;
}

.overview-label {
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
}

.overview-value {
  font-size: 20px;
  font-weight: 700;
  color: #1a1a1a;
}

.overview-value.completed {
  color: #52c41a;
}

.overview-value.progress {
  color: #1890ff;
}

.overview-value.pending {
  color: #fa8c16;
}

.overview-value.delayed {
  color: #ff4d4f;
}

.overview-progress {
  padding: 0 8px;
}

.card-action {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #1890ff;
  font-size: 14px;
  font-weight: 500;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}

/* 功能区域 */
.features-section {
  padding: 40px 24px;
}

.section-title {
  font-size: 24px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 24px 0;
  text-align: center;
}

.feature-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 24px;
  border: 2px solid transparent;
}

.feature-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.1);
  border-color: #1890ff;
}

.feature-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.feature-icon {
  font-size: 36px;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
}

.feature-badge {
  background: #ff4d4f;
  color: white;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 8px;
  font-weight: 600;
}

.feature-title {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 8px 0;
}

.feature-desc {
  font-size: 14px;
  color: #666;
  line-height: 1.5;
  margin-bottom: 16px;
}

.feature-action {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #1890ff;
  font-size: 14px;
  font-weight: 500;
}

/* 活动区域 */
.activity-section {
  padding: 40px 24px;
}

.activity-card {
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.activity-item {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.activity-content {
  flex: 1;
}

.activity-title {
  font-size: 16px;
  font-weight: 500;
  color: #1a1a1a;
  margin-bottom: 4px;
}

.activity-desc {
  font-size: 14px;
  color: #666;
}

.activity-time {
  font-size: 12px;
  color: #999;
  white-space: nowrap;
  margin-left: 16px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .hero-section {
    padding: 30px 16px 20px;
  }
  
  .hero-content {
    flex-direction: column;
    text-align: center;
  }
  
  .hero-title {
    font-size: 28px;
  }
  
  .hero-icon {
    font-size: 32px;
  }
  
  .hero-subtitle {
    font-size: 14px;
    margin-bottom: 16px;
  }
  
  .hero-right {
    margin-top: 20px;
  }
  
  .hero-image {
    width: 180px;
    height: 180px;
  }
  
  .floating-card {
    padding: 8px 10px;
    font-size: 11px;
    min-width: 90px;
  }
  
  .card-1 {
    top: 10px;
    left: 0px;
  }
  
  .card-2 {
    top: 80px;
    right: 10px;
  }
  
  .card-3 {
    bottom: 20px;
    left: 20px;
  }
  
  .stats-section {
    padding: 30px 16px;
  }
  
  .stats-card {
    padding: 20px;
    margin-bottom: 16px;
    min-height: 100px;
  }
  
  .stats-number {
    font-size: 24px;
  }
  
  .features-section {
    padding: 30px 16px;
  }
  
  .activity-section {
    padding: 30px 16px;
  }
  
  .monthly-overview-section {
    margin: 0 16px;
    padding: 30px 16px;
  }
  
  .overview-stats {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    margin-bottom: 16px;
  }
  
  .overview-item {
    padding: 10px;
  }
  
  .overview-value {
    font-size: 18px;
  }
  
  .overview-card :deep(.ant-card-head) {
    padding: 12px 16px;
  }
  
  .overview-card :deep(.ant-card-body) {
    padding: 16px;
  }
}
</style> 