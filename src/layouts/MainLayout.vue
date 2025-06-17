<template>
  <a-layout class="main-layout">
    <!-- 侧边栏 -->
    <a-layout-sider 
      v-model:collapsed="collapsed" 
      :trigger="null" 
      collapsible 
      width="256"
      :style="{ 
        overflow: 'auto', 
        height: '100vh', 
        position: 'fixed', 
        left: 0, 
        top: 0, 
        bottom: 0,
        zIndex: 100
      }"
    >
      <!-- Logo区域 -->
      <div class="logo">
        <img v-if="!collapsed" src="/logo.svg" alt="目标管理系统" />
        <img v-else src="/logo-mini.svg" alt="目标管理" />
      </div>

      <!-- 菜单 -->
      <a-menu
        theme="dark"
        mode="inline"
        v-model:selectedKeys="selectedKeys"
        v-model:openKeys="openKeys"
        :items="menuItems"
        @click="handleMenuClick"
        class="side-menu"
      />
    </a-layout-sider>

    <!-- 主体布局 -->
    <a-layout :style="{ marginLeft: collapsed ? '80px' : '256px' }">
      <!-- 顶部导航 -->
      <a-layout-header class="header">
        <div class="header-left">
          <a-button
            type="text"
            :icon="collapsed ? h(MenuUnfoldOutlined) : h(MenuFoldOutlined)"
            @click="() => (collapsed = !collapsed)"
            class="trigger"
          />
          <a-breadcrumb>
            <a-breadcrumb-item v-for="item in breadcrumbs" :key="item.path">
              {{ item.name }}
            </a-breadcrumb-item>
          </a-breadcrumb>
        </div>

        <div class="header-right">
          <!-- 通知 -->
          <a-badge :count="5" class="notification">
            <a-button type="text" :icon="h(BellOutlined)" />
          </a-badge>

          <!-- 用户菜单 -->
          <a-dropdown>
            <a-space class="user-info">
              <a-avatar size="small">
                {{ userInfo.name?.charAt(0) || 'U' }}
              </a-avatar>
              <span>{{ userInfo.name || '用户' }}</span>
              <DownOutlined />
            </a-space>
            <template #overlay>
              <a-menu @click="handleUserMenuClick">
                <a-menu-item key="profile">
                  <UserOutlined />
                  个人设置
                </a-menu-item>
                <a-menu-item key="logout">
                  <LogoutOutlined />
                  退出登录
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </div>
      </a-layout-header>

      <!-- 内容区域 -->
      <a-layout-content class="content">
        <router-view />
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<script setup lang="ts">
import { ref, h, watch, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  DashboardOutlined,
  AimOutlined,
  FileTextOutlined,
  BookOutlined,
  BarChartOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  DownOutlined,
  AuditOutlined,
  BellOutlined
} from '@ant-design/icons-vue'

const router = useRouter()
const route = useRoute()

// 侧边栏状态
const collapsed = ref(false)
const selectedKeys = ref<string[]>([route.path])
const openKeys = ref<string[]>([])

// 用户信息
const userInfo = ref({
  name: '管理员',
  role: 'admin'
})

// 切换侧边栏
const toggleCollapsed = () => {
  collapsed.value = !collapsed.value
}

// 初始化菜单状态
const initMenuState = () => {
  const path = route.path
  selectedKeys.value = [path]
  
  // 设置默认展开的菜单
  if (path.startsWith('/plans')) {
    openKeys.value = ['plans']
  } else if (path.startsWith('/summaries')) {
    openKeys.value = ['summaries']
  } else if (path.startsWith('/templates')) {
    openKeys.value = ['templates']
  } else if (path.startsWith('/audit')) {
    openKeys.value = ['audit']
  } else if (path.startsWith('/monitoring')) {
    openKeys.value = ['monitoring']
  } else if (path.startsWith('/system')) {
    openKeys.value = ['system']
  } else {
    openKeys.value = []
  }
}

// 监听路由变化
watch(
  () => route.path,
  () => {
    initMenuState()
  },
  { immediate: true }
)

// 菜单点击事件
const handleMenuClick = ({ key }: { key: string }) => {
  if (key !== route.path) {
    router.push(key).catch(() => {
      // 忽略路由重复错误
    })
  }
}

// 用户菜单点击事件
const handleUserMenuClick = ({ key }: { key: string }) => {
  switch (key) {
    case 'profile':
      console.log('个人中心')
      break
    case 'logout':
      console.log('退出登录')
      break
  }
}

// 面包屑导航 - 简化实现
const breadcrumbs = ref<{ path: string; name: string }[]>([])

// 菜单项
const menuItems = [
  {
    key: '/dashboard',
    icon: h(DashboardOutlined),
    label: '首页'
  },
  {
    key: 'plans',
    icon: h(AimOutlined),
    label: '目标计划',
    children: [
      { key: '/plans/annual', label: '年度计划' },
      { key: '/plans/quarterly', label: '季度计划' },
      { key: '/plans/monthly', label: '月计划' },
      { key: '/plans/weekly', label: '周计划' }
    ]
  },
  {
    key: 'summaries',
    icon: h(FileTextOutlined),
    label: '工作总结',
    children: [
      { key: '/summaries/annual', label: '年度总结' },
      { key: '/summaries/quarterly', label: '季度总结' },
      { key: '/summaries/monthly', label: '月总结' },
      { key: '/summaries/weekly', label: '周总结' }
    ]
  },
  {
    key: 'templates',
    icon: h(BookOutlined),
    label: '模板管理',
    children: [
      { key: '/templates/management', label: '模板管理' }
    ]
  },
  {
    key: 'audit',
    icon: h(AuditOutlined),
    label: '审核管理',
    children: [
      { key: '/audit/comprehensive', label: '综合审核' },
      { key: '/audit/goal-query', label: '目标导航查询' },
      { key: '/audit/annual', label: '年报审核' },
      { key: '/audit/quarterly', label: '季报审核' },
      { key: '/audit/monthly', label: '月报审核' },
      { key: '/audit/weekly', label: '周报审核' }
    ]
  },
  {
    key: 'monitoring',
    icon: h(BarChartOutlined),
    label: '监控看板',
    children: [
      { key: '/monitoring/execution', label: '执行看板' },
      { key: '/monitoring/uncompleted', label: '未完成指标看板' }
    ]
  },
  {
    key: 'system',
    icon: h(SettingOutlined),
    label: '系统设置',
    children: [
      { key: '/system/organization', label: '组织管理' },
      { key: '/system/permissions', label: '权限配置' }
    ]
  }
]
</script>

<style scoped>
.main-layout {
  min-height: 100vh;
}

.logo {
  height: 64px;
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid #f0f0f0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
}

.logo img {
  height: 32px;
  width: auto;
}

.side-menu {
  border-right: 0;
  background: #001529;
}

.side-menu :deep(.ant-menu-item) {
  margin: 0;
  height: 40px;
  line-height: 40px;
  width: calc(100% - 0px);
  overflow: hidden;
}

.side-menu :deep(.ant-menu-submenu) {
  background: #001529;
}

.side-menu :deep(.ant-menu-submenu-title) {
  height: 40px;
  line-height: 40px;
  margin: 0;
  width: calc(100% - 0px);
  overflow: hidden;
}

.side-menu :deep(.ant-menu-item-selected) {
  background-color: #1890ff !important;
}

.side-menu :deep(.ant-menu-submenu-selected .ant-menu-submenu-title) {
  color: #1890ff;
}

.header {
  padding: 0;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  position: fixed;
  top: 0;
  right: 0;
  left: 256px;
  z-index: 99;
  transition: left 0.2s;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.trigger {
  font-size: 18px;
  line-height: 64px;
  padding: 0 24px;
  cursor: pointer;
  transition: color 0.3s;
}

.trigger:hover {
  color: #1890ff;
}

.notification {
  margin-right: 16px;
}

.user-info {
  cursor: pointer;
  padding: 0 12px;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.user-info:hover {
  background-color: #f5f5f5;
  transform: translateY(-1px);
}

.content {
  margin-top: 64px;
  margin-left: 0;
  margin-right: 16px;
  margin-bottom: 16px;
  padding: 24px;
  background: #fff;
  border-radius: 8px;
  min-height: calc(100vh - 96px);
}

/* 响应式布局 */
@media (max-width: 768px) {
  .header {
    left: 80px;
  }
  
  .content {
    margin: 80px 8px 8px 8px;
    padding: 16px;
  }
}
</style> 