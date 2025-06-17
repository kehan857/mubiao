<template>
  <div class="strategic-review">
    <!-- 页面标题 -->
    <div class="page-header">
      <div class="header-content">
        <div class="title-area">
          <h2>战略审核</h2>
          <p>年度和季度目标审核管理</p>
        </div>
        <div class="actions">
          <a-button type="primary">
            批量审核
          </a-button>
        </div>
      </div>
    </div>

    <a-card>
      <a-empty description="战略审核功能开发中..." />
    </a-card>
  </div>
</template>

<script setup lang="ts">

</script>

<style scoped>
.strategic-review {
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
</style> 