import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Layout',
    component: () => import('@/layouts/MainLayout.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard.vue'),
        meta: { title: '首页', icon: 'DashboardOutlined' }
      },
      // 目标计划
      {
        path: 'plans/annual',
        name: 'AnnualPlans',
        component: () => import('@/views/plans/AnnualPlans.vue'),
        meta: { title: '年度计划', breadcrumb: ['目标计划', '年度计划'] }
      },
      {
        path: 'plans/quarterly',
        name: 'QuarterlyPlans',
        component: () => import('@/views/plans/QuarterlyPlans.vue'),
        meta: { title: '季度计划', breadcrumb: ['目标计划', '季度计划'] }
      },
      {
        path: 'plans/monthly',
        name: 'MonthlyPlans',
        component: () => import('@/views/plans/MonthlyPlans.vue'),
        meta: { title: '月计划', breadcrumb: ['目标计划', '月计划'] }
      },
      {
        path: 'plans/weekly',
        name: 'WeeklyPlans',
        component: () => import('@/views/plans/WeeklyPlans.vue'),
        meta: { title: '周计划', breadcrumb: ['目标计划', '周计划'] }
      },
      // 工作总结
      {
        path: 'summaries/annual',
        name: 'AnnualSummaries',
        component: () => import('@/views/summaries/AnnualSummaries.vue'),
        meta: { title: '年度总结', breadcrumb: ['工作总结', '年度总结'] }
      },
      {
        path: 'summaries/quarterly',
        name: 'QuarterlySummaries',
        component: () => import('@/views/summaries/QuarterlySummaries.vue'),
        meta: { title: '季度总结', breadcrumb: ['工作总结', '季度总结'] }
      },
      {
        path: 'summaries/monthly',
        name: 'MonthlySummaries',
        component: () => import('@/views/summaries/MonthlySummaries.vue'),
        meta: { title: '月总结', breadcrumb: ['工作总结', '月总结'] }
      },
      {
        path: 'summaries/weekly',
        name: 'WeeklySummaries',
        component: () => import('@/views/summaries/WeeklySummaries.vue'),
        meta: { title: '周总结', breadcrumb: ['工作总结', '周总结'] }
      },
      // 模板管理
      {
        path: 'templates/management',
        name: 'TemplateManagement',
        component: () => import('@/views/templates/TemplateManagement.vue'),
        meta: { title: '模板管理', breadcrumb: ['模板管理', '模板管理'] }
      },
      // 审核管理
      {
        path: 'audit/comprehensive',
        name: 'ComprehensiveAudit',
        component: () => import('@/views/audit/ComprehensiveAudit.vue'),
        meta: { title: '综合审核', breadcrumb: ['审核管理', '综合审核'] }
      },
      {
        path: 'audit/goal-query',
        name: 'GoalQuery',
        component: () => import('@/views/review/GoalQuery.vue'),
        meta: { title: '目标导航查询', breadcrumb: ['审核管理', '目标导航查询'] }
      },
      {
        path: 'audit/annual',
        name: 'AnnualAudit',
        component: () => import('@/views/audit/AnnualAudit.vue'),
        meta: { title: '年报审核', breadcrumb: ['审核管理', '年报审核'] }
      },
      {
        path: 'audit/quarterly',
        name: 'QuarterlyAudit',
        component: () => import('@/views/audit/QuarterlyAudit.vue'),
        meta: { title: '季报审核', breadcrumb: ['审核管理', '季报审核'] }
      },
      {
        path: 'audit/monthly',
        name: 'MonthlyAudit',
        component: () => import('@/views/audit/MonthlyAudit.vue'),
        meta: { title: '月报审核', breadcrumb: ['审核管理', '月报审核'] }
      },
      {
        path: 'audit/weekly',
        name: 'WeeklyAudit',
        component: () => import('@/views/audit/WeeklyAudit.vue'),
        meta: { title: '周报审核', breadcrumb: ['审核管理', '周报审核'] }
      },
      // 监控看板
      {
        path: 'monitoring/execution',
        name: 'ExecutionBoard',
        component: () => import('@/views/monitoring/ExecutionBoard.vue'),
        meta: { title: '执行看板', breadcrumb: ['监控看板', '执行看板'] }
      },
      {
        path: 'monitoring/uncompleted',
        name: 'UncompletedBoard',
        component: () => import('@/views/monitoring/UncompletedBoard.vue'),
        meta: { title: '未完成指标看板', breadcrumb: ['监控看板', '未完成指标看板'] }
      },
      // 系统设置
      {
        path: 'system/organization',
        name: 'SystemOrganization',
        component: () => import('@/views/system/OrganizationManagement.vue'),
        meta: { title: '组织管理', breadcrumb: ['系统设置', '组织管理'] }
      },
      {
        path: 'system/permissions',
        name: 'SystemPermissions',
        component: () => import('@/views/system/PermissionManagement.vue'),
        meta: { title: '权限配置', breadcrumb: ['系统设置', '权限配置'] }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.MODE === 'production' ? '/mubiao/' : '/'),
  routes
})

export default router 