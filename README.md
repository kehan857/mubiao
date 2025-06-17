# 目标管理系统

基于Vue 3 + TypeScript + Ant Design Vue的现代化目标与工作管理系统。

## 在线预览

🚀 [在线预览地址](https://kehan857.github.io/mubiao/)

## 功能特性

- 📊 **仪表板** - 数据概览与可视化展示
- 🎯 **目标管理** - 年度、季度、月度、周度目标制定
- 📝 **计划制定** - 多维度计划管理
- 📋 **总结汇报** - 定期工作总结
- 🔍 **执行监控** - 目标执行情况跟踪
- ✅ **审核流程** - 完整的审批工作流
- 📈 **数据分析** - 多维度数据报表
- 🏢 **部门管理** - 以部门为维度的目标管理

## 技术栈

- **前端框架**: Vue 3 + TypeScript
- **UI组件库**: Ant Design Vue
- **构建工具**: Vite
- **状态管理**: Pinia
- **路由管理**: Vue Router
- **图表库**: ECharts
- **HTTP客户端**: Axios
- **日期处理**: Day.js

## 本地开发

### 环境要求

- Node.js >= 16
- npm >= 8

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 预览构建结果

```bash
npm run preview
```

## 项目结构

```
src/
├── components/     # 公共组件
├── layouts/       # 布局组件
├── router/        # 路由配置
├── stores/        # 状态管理
├── views/         # 页面组件
│   ├── audit/     # 审核模块
│   ├── goals/     # 目标模块
│   ├── monitoring/ # 监控模块
│   ├── plans/     # 计划模块
│   ├── reports/   # 报表模块
│   ├── review/    # 复盘模块
│   ├── summaries/ # 总结模块
│   └── templates/ # 模板模块
├── styles/        # 样式文件
└── utils/         # 工具函数
```

## 主要功能模块

### 1. 仪表板
- 关键数据统计展示
- 月度数据概览
- 可点击跳转到具体功能页面

### 2. 目标管理
- 战略目标制定
- 战术目标分解
- 目标查询与管理

### 3. 计划制定
- 年度计划
- 季度计划
- 月度计划
- 周度计划

### 4. 执行监控
- 执行看板
- 未完成事项看板
- 部门维度执行情况

### 5. 审核流程
- 年度审核
- 季度审核
- 月度审核
- 周度审核

## 部署说明

项目使用GitHub Actions自动部署到GitHub Pages，每次推送到main分支时会自动触发构建和部署。

## 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 许可证

[MIT License](LICENSE)

## 联系方式

如有问题或建议，请通过Issue或Pull Request与我们联系。 