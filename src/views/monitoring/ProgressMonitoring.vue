// 进度监控数据 - 增加至12条示例数据
const progressData = ref([
  {
    id: 1,
    goalName: '提升产品市场竞争力',
    department: '产品部',
    responsible: '张三',
    targetProgress: 80,
    actualProgress: 65,
    status: 'warning',
    startDate: '2024-01-01',
    endDate: '2024-03-31',
    lastUpdate: '2024-01-15',
    keyMilestones: [
      { name: '市场调研完成', progress: 100, status: 'completed' },
      { name: '产品功能优化', progress: 60, status: 'in-progress' },
      { name: '用户测试', progress: 30, status: 'pending' }
    ]
  },
  {
    id: 2,
    goalName: '技术架构升级',
    department: '技术部',
    responsible: '李四',
    targetProgress: 75,
    actualProgress: 80,
    status: 'success',
    startDate: '2024-01-05',
    endDate: '2024-02-28',
    lastUpdate: '2024-01-20',
    keyMilestones: [
      { name: '技术方案设计', progress: 100, status: 'completed' },
      { name: '核心模块开发', progress: 85, status: 'in-progress' },
      { name: '系统测试', progress: 70, status: 'in-progress' }
    ]
  },
  {
    id: 3,
    goalName: '品牌影响力提升',
    department: '市场部',
    responsible: '王五',
    targetProgress: 60,
    actualProgress: 45,
    status: 'warning',
    startDate: '2024-02-01',
    endDate: '2024-06-30',
    lastUpdate: '2024-02-10',
    keyMilestones: [
      { name: '品牌策略制定', progress: 100, status: 'completed' },
      { name: '营销活动执行', progress: 40, status: 'in-progress' },
      { name: '效果评估', progress: 0, status: 'pending' }
    ]
  },
  {
    id: 4,
    goalName: '销售业绩增长',
    department: '销售部',
    responsible: '赵六',
    targetProgress: 70,
    actualProgress: 55,
    status: 'warning',
    startDate: '2024-03-01',
    endDate: '2024-05-31',
    lastUpdate: '2024-03-15',
    keyMilestones: [
      { name: '销售策略优化', progress: 100, status: 'completed' },
      { name: '客户开发', progress: 60, status: 'in-progress' },
      { name: '业绩达成', progress: 35, status: 'in-progress' }
    ]
  },
  {
    id: 5,
    goalName: '人才队伍建设',
    department: '人事部',
    responsible: '孙七',
    targetProgress: 65,
    actualProgress: 70,
    status: 'success',
    startDate: '2024-01-15',
    endDate: '2024-12-31',
    lastUpdate: '2024-02-20',
    keyMilestones: [
      { name: '招聘需求分析', progress: 100, status: 'completed' },
      { name: '人才招聘', progress: 75, status: 'in-progress' },
      { name: '培训体系建设', progress: 60, status: 'in-progress' }
    ]
  },
  {
    id: 6,
    goalName: '成本控制优化',
    department: '技术部',
    responsible: '周八',
    targetProgress: 50,
    actualProgress: 25,
    status: 'danger',
    startDate: '2024-04-01',
    endDate: '2024-07-31',
    lastUpdate: '2024-04-10',
    keyMilestones: [
      { name: '成本分析', progress: 80, status: 'in-progress' },
      { name: '优化方案制定', progress: 30, status: 'in-progress' },
      { name: '实施执行', progress: 0, status: 'pending' }
    ]
  },
  {
    id: 7,
    goalName: '客户服务体验优化',
    department: '产品部',
    responsible: '吴九',
    targetProgress: 85,
    actualProgress: 60,
    status: 'warning',
    startDate: '2024-03-10',
    endDate: '2024-06-30',
    lastUpdate: '2024-04-05',
    keyMilestones: [
      { name: '服务流程梳理', progress: 100, status: 'completed' },
      { name: '系统功能优化', progress: 50, status: 'in-progress' },
      { name: '客户满意度提升', progress: 30, status: 'in-progress' }
    ]
  },
  {
    id: 8,
    goalName: '数字化转型推进',
    department: '技术部',
    responsible: '郑十',
    targetProgress: 55,
    actualProgress: 40,
    status: 'warning',
    startDate: '2024-02-15',
    endDate: '2024-08-31',
    lastUpdate: '2024-03-20',
    keyMilestones: [
      { name: '数字化规划', progress: 100, status: 'completed' },
      { name: '系统建设', progress: 30, status: 'in-progress' },
      { name: '员工培训', progress: 20, status: 'pending' }
    ]
  },
  {
    id: 9,
    goalName: '供应链优化升级',
    department: '市场部',
    responsible: '刘十一',
    targetProgress: 30,
    actualProgress: 20,
    status: 'warning',
    startDate: '2024-05-01',
    endDate: '2024-10-31',
    lastUpdate: '2024-05-15',
    keyMilestones: [
      { name: '供应商评估', progress: 60, status: 'in-progress' },
      { name: '流程优化', progress: 10, status: 'pending' },
      { name: '系统升级', progress: 0, status: 'pending' }
    ]
  },
  {
    id: 10,
    goalName: '创新能力建设',
    department: '技术部',
    responsible: '陈十二',
    targetProgress: 60,
    actualProgress: 50,
    status: 'normal',
    startDate: '2024-01-20',
    endDate: '2024-12-31',
    lastUpdate: '2024-04-25',
    keyMilestones: [
      { name: '创新体系设计', progress: 100, status: 'completed' },
      { name: '研发投入增加', progress: 70, status: 'in-progress' },
      { name: '专利申请', progress: 30, status: 'in-progress' }
    ]
  },
  {
    id: 11,
    goalName: '质量管理体系建设',
    department: '质量部',
    responsible: '徐十三',
    targetProgress: 40,
    actualProgress: 45,
    status: 'success',
    startDate: '2024-03-01',
    endDate: '2024-09-30',
    lastUpdate: '2024-04-20',
    keyMilestones: [
      { name: '质量标准制定', progress: 90, status: 'in-progress' },
      { name: '检测体系建设', progress: 35, status: 'in-progress' },
      { name: '培训实施', progress: 20, status: 'pending' }
    ]
  },
  {
    id: 12,
    goalName: '企业文化建设',
    department: '人事部',
    responsible: '马十四',
    targetProgress: 35,
    actualProgress: 42,
    status: 'success',
    startDate: '2024-02-01',
    endDate: '2024-11-30',
    lastUpdate: '2024-04-15',
    keyMilestones: [
      { name: '文化调研', progress: 100, status: 'completed' },
      { name: '文化体系设计', progress: 50, status: 'in-progress' },
      { name: '宣贯实施', progress: 25, status: 'in-progress' }
    ]
  }
])

// 表格列定义
const columns = [
  {
    title: '目标名称',
    dataIndex: 'goalName',
    key: 'goalName',
    width: 200,
    fixed: 'left'
  },
  {
    title: '部门',
    dataIndex: 'department',
    key: 'department',
    width: 100
  },
  {
    title: '负责人',
    dataIndex: 'responsible',
    key: 'responsible',
    width: 100
  },
  {
    title: '目标进度',
    key: 'targetProgress',
    width: 120
  },
  {
    title: '实际进度',
    key: 'actualProgress',
    width: 120
  },
  {
    title: '进度状态',
    key: 'status',
    width: 100
  },
  {
    title: '开始时间',
    dataIndex: 'startDate',
    key: 'startDate',
    width: 110
  },
  {
    title: '结束时间',
    dataIndex: 'endDate',
    key: 'endDate',
    width: 110
  },
  {
    title: '最后更新',
    dataIndex: 'lastUpdate',
    key: 'lastUpdate',
    width: 110
  },
  {
    title: '操作',
    key: 'actions',
    width: 150,
    fixed: 'right'
  }
] 