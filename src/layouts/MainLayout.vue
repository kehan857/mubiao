<template>
  <a-layout style="min-height: 100vh">
    <!-- 侧边栏 -->
    <a-layout-sider
      v-model:collapsed="collapsed"
      :trigger="null"
      collapsible
      width="240"
      theme="light"
      style="box-shadow: 2px 0 6px rgba(0,21,41,.35)"
    >
      <div class="logo">
        <div class="logo-container">
          <div class="logo-icon" v-if="!collapsed">
            🎯
          </div>
          <div class="logo-icon-mini" v-else>
            🎯
          </div>
          <span v-if="!collapsed" class="logo-text">目标管理系统</span>
        </div>
      </div>
      
      <a-menu
        v-model:selectedKeys="selectedKeys"
        v-model:openKeys="openKeys"
        mode="inline"
        theme="light"
        :inline-collapsed="collapsed"
        @click="handleMenuClick"
        style="border-right: none;"
        :forceSubMenuRender="true"
      >
        <!-- 首页 -->
        <a-menu-item key="/dashboard">
          <template #icon>
            <DashboardOutlined />
          </template>
          首页
        </a-menu-item>
        
        <!-- 目标计划 -->
        <a-sub-menu key="plans">
          <template #icon>
            <AimOutlined />
          </template>
          <template #title>目标计划</template>
          <a-menu-item key="/plans/annual">
            年度计划
          </a-menu-item>
          <a-menu-item key="/plans/quarterly">
            季度计划
          </a-menu-item>
          <a-menu-item key="/plans/monthly">
            月计划
          </a-menu-item>
          <a-menu-item key="/plans/weekly">
            周计划
          </a-menu-item>
        </a-sub-menu>
        
        <!-- 工作总结 -->
        <a-sub-menu key="summaries">
          <template #icon>
            <FileTextOutlined />
          </template>
          <template #title>工作总结</template>
          <a-menu-item key="/summaries/annual">
            年度总结
          </a-menu-item>
          <a-menu-item key="/summaries/quarterly">
            季度总结
          </a-menu-item>
          <a-menu-item key="/summaries/monthly">
            月总结
          </a-menu-item>
          <a-menu-item key="/summaries/weekly">
            周总结
          </a-menu-item>
        </a-sub-menu>
        
        <!-- 模板管理 -->
        <a-sub-menu key="templates">
          <template #icon>
            <BookOutlined />
          </template>
          <template #title>模板管理</template>
          <a-menu-item key="/templates/management">
            模板管理
          </a-menu-item>
        </a-sub-menu>
        
        <!-- 审核管理 -->
        <a-sub-menu key="audit">
          <template #icon>
            <AuditOutlined />
          </template>
          <template #title>审核管理</template>
          <a-menu-item key="/audit/comprehensive">
            综合审核
          </a-menu-item>
          <a-menu-item key="/audit/goal-query">
            目标导航查询
          </a-menu-item>
          <a-menu-item key="/audit/annual">
            年报审核
          </a-menu-item>
          <a-menu-item key="/audit/quarterly">
            季报审核
          </a-menu-item>
          <a-menu-item key="/audit/monthly">
            月报审核
          </a-menu-item>
          <a-menu-item key="/audit/weekly">
            周报审核
          </a-menu-item>
        </a-sub-menu>
        
        <!-- 监控看板 -->
        <a-sub-menu key="monitoring">
          <template #icon>
            <BarChartOutlined />
          </template>
          <template #title>监控看板</template>
          <a-menu-item key="/monitoring/execution">
            执行看板
          </a-menu-item>
          <a-menu-item key="/monitoring/uncompleted">
            未完成指标看板
          </a-menu-item>
        </a-sub-menu>
        
        <!-- 系统设置 -->
        <a-sub-menu key="system">
          <template #icon>
            <SettingOutlined />
          </template>
          <template #title>系统设置</template>
          <a-menu-item key="/system/organization">
            组织管理
          </a-menu-item>
          <a-menu-item key="/system/permissions">
            权限配置
          </a-menu-item>
        </a-sub-menu>
      </a-menu>
    </a-layout-sider>
    
    <!-- 主内容区 -->
    <a-layout>
      <!-- 顶部导航 -->
      <a-layout-header style="background: #fff; padding: 0; box-shadow: 0 1px 4px rgba(0,21,41,.08)">
        <div class="header-content">
          <div class="header-left">
            <a-button
              type="text"
              :icon="collapsed ? h(MenuUnfoldOutlined) : h(MenuFoldOutlined)"
              @click="toggleCollapsed"
              style="font-size: 16px; width: 64px; height: 64px"
            />
          </div>
          
          <div class="header-right">
            <a-dropdown>
              <template #overlay>
                <a-menu @click="handleUserMenuClick">
                  <a-menu-item key="profile">
                    <UserOutlined />
                    个人中心
                  </a-menu-item>
                  <a-menu-divider />
                  <a-menu-item key="logout">
                    <LogoutOutlined />
                    退出登录
                  </a-menu-item>
                </a-menu>
              </template>
              <a-button type="text" class="user-info">
                <a-avatar size="small" style="margin-right: 8px">
                  <template #icon><UserOutlined /></template>
                </a-avatar>
                <span>{{ userInfo.name }}</span>
                <DownOutlined style="margin-left: 8px" />
              </a-button>
            </a-dropdown>
          </div>
        </div>
      </a-layout-header>
      
      <!-- 主内容 -->
      <a-layout-content style="margin: 16px; padding: 24px; background: #fff; border-radius: 8px">
        <router-view />
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<script setup lang="ts">
import { ref, h, watch } from 'vue'
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
  AuditOutlined
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
const breadcrumb = ref<string[]>([])
</script>

<style scoped>
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

.logo-container {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  font-size: 28px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.logo-icon-mini {
  font-size: 24px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.logo-text {
  font-weight: 700;
  font-size: 16px;
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  letter-spacing: 0.5px;
}

.header-content {
  height: 64px;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-left {
  display: flex;
  align-items: center;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  height: 64px;
  padding: 0 12px;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.user-info:hover {
  background-color: #f5f5f5;
  transform: translateY(-1px);
}
</style> 