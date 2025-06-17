// 周总结数据 - 增加至10条示例数据
const summaries = ref([
  {
    id: 1,
    week: '2024年第3周',
    department: '技术部',
    employee: '张三',
    workCompleted: '完成用户管理模块开发，修复了3个严重bug，优化了数据库查询性能',
    workPlanned: '下周计划完成订单模块开发，进行系统集成测试',
    issues: '遇到第三方API接口不稳定的问题，正在与供应商沟通解决',
    assistance: '需要产品部提供详细的需求文档',
    achievements: '成功上线新功能，用户反馈良好',
    metrics: { efficiency: 85, quality: 90, satisfaction: 88 },
    status: 'submitted',
    submitTime: '2024-01-21 18:30',
    reviewStatus: 'approved'
  },
  {
    id: 2,
    week: '2024年第3周',
    department: '产品部',
    employee: '李四',
    workCompleted: '完成产品需求分析，制定了Q1产品路线图，组织了3次用户访谈',
    workPlanned: '下周计划进行竞品分析，准备产品评审会议',
    issues: '用户需求变更频繁，需要更好的需求管理流程',
    assistance: '希望技术部能提供技术可行性评估',
    achievements: '获得了重要客户的产品反馈，为后续优化提供了方向',
    metrics: { efficiency: 88, quality: 92, satisfaction: 90 },
    status: 'submitted',
    submitTime: '2024-01-21 17:45',
    reviewStatus: 'approved'
  },
  {
    id: 3,
    week: '2024年第3周',
    department: '市场部',
    employee: '王五',
    workCompleted: '策划并执行了品牌推广活动，完成了市场调研报告，拜访了5个潜在客户',
    workPlanned: '下周计划准备行业展会参展材料，联系媒体进行产品宣传',
    issues: '推广预算有限，需要更精准的投放策略',
    assistance: '需要设计部支持制作宣传物料',
    achievements: '品牌曝光度提升30%，获得了2个新的合作意向',
    metrics: { efficiency: 82, quality: 87, satisfaction: 85 },
    status: 'submitted',
    submitTime: '2024-01-21 19:15',
    reviewStatus: 'pending'
  },
  {
    id: 4,
    week: '2024年第3周',
    department: '销售部',
    employee: '赵六',
    workCompleted: '拜访了8个客户，成功签约2个新客户，完成了月度销售报告',
    workPlanned: '下周计划跟进3个重点项目，参加行业交流会',
    issues: '客户决策周期较长，需要更多的跟进策略',
    assistance: '需要技术支持提供产品demo演示',
    achievements: '超额完成本周销售目标的120%',
    metrics: { efficiency: 90, quality: 88, satisfaction: 92 },
    status: 'submitted',
    submitTime: '2024-01-21 16:20',
    reviewStatus: 'approved'
  },
  {
    id: 5,
    week: '2024年第3周',
    department: '人事部',
    employee: '孙七',
    workCompleted: '组织了新员工入职培训，完成了绩效考核流程优化，处理了员工关系事务',
    workPlanned: '下周计划开展员工满意度调研，准备季度人才盘点',
    issues: '招聘难度增加，优秀人才竞争激烈',
    assistance: '需要各部门配合提供岗位需求和任职要求',
    achievements: '成功招聘了3名关键岗位人员，员工满意度提升',
    metrics: { efficiency: 86, quality: 89, satisfaction: 87 },
    status: 'submitted',
    submitTime: '2024-01-21 18:00',
    reviewStatus: 'approved'
  },
  {
    id: 6,
    week: '2024年第3周',
    department: '财务部',
    employee: '周八',
    workCompleted: '完成了月度财务报表，进行了成本分析，处理了应收应付账款',
    workPlanned: '下周计划进行年度预算调整，准备税务申报',
    issues: '部分费用报销单据不规范，需要加强培训',
    assistance: '需要各部门及时提交费用报销单据',
    achievements: '成功降低了运营成本5%，现金流管理良好',
    metrics: { efficiency: 88, quality: 94, satisfaction: 89 },
    status: 'submitted',
    submitTime: '2024-01-21 17:30',
    reviewStatus: 'approved'
  },
  {
    id: 7,
    week: '2024年第3周',
    department: '运营部',
    employee: '吴九',
    workCompleted: '优化了业务流程，组织了跨部门协调会议，处理了客户投诉',
    workPlanned: '下周计划进行流程标准化工作，准备运营数据分析',
    issues: '部门间协调效率有待提升，信息传递存在延迟',
    assistance: '需要IT部门支持流程系统化建设',
    achievements: '客户满意度提升到95%，运营效率提升15%',
    metrics: { efficiency: 87, quality: 90, satisfaction: 93 },
    status: 'submitted',
    submitTime: '2024-01-21 18:45',
    reviewStatus: 'pending'
  },
  {
    id: 8,
    week: '2024年第3周',
    department: '质量部',
    employee: '郑十',
    workCompleted: '进行了产品质量检测，完成了质量管理体系审核，处理了质量问题',
    workPlanned: '下周计划开展质量培训，制定质量改进计划',
    issues: '部分环节质量控制不到位，需要加强监督',
    assistance: '需要生产部门配合执行质量标准',
    achievements: '产品合格率达到99.8%，客户投诉率降低50%',
    metrics: { efficiency: 89, quality: 96, satisfaction: 91 },
    status: 'submitted',
    submitTime: '2024-01-21 17:00',
    reviewStatus: 'approved'
  },
  {
    id: 9,
    week: '2024年第3周',
    department: '技术部',
    employee: '刘十一',
    workCompleted: '完成了系统架构设计，进行了代码审查，解决了性能瓶颈问题',
    workPlanned: '下周计划进行安全测试，准备系统上线部署',
    issues: '新技术学习需要时间，团队技能需要提升',
    assistance: '需要培训预算支持团队技术提升',
    achievements: '系统性能提升40%，代码质量显著改善',
    metrics: { efficiency: 91, quality: 93, satisfaction: 89 },
    status: 'submitted',
    submitTime: '2024-01-21 19:00',
    reviewStatus: 'pending'
  },
  {
    id: 10,
    week: '2024年第3周',
    department: '客服部',
    employee: '陈十二',
    workCompleted: '处理了156个客户咨询，解决了23个客户投诉，更新了FAQ文档',
    workPlanned: '下周计划进行客服培训，优化服务流程',
    issues: '客户咨询量增加较快，人手有些紧张',
    assistance: '需要增加客服人员或者优化工具提升效率',
    achievements: '客户满意度达到96%，响应时间缩短30%',
    metrics: { efficiency: 88, quality: 91, satisfaction: 96 },
    status: 'submitted',
    submitTime: '2024-01-21 18:15',
    reviewStatus: 'approved'
  }
])

// 表格列定义
const columns = [
  {
    title: '周次',
    dataIndex: 'week',
    key: 'week',
    width: 120,
    fixed: 'left'
  },
  {
    title: '部门',
    dataIndex: 'department',
    key: 'department',
    width: 100
  },
  {
    title: '员工',
    dataIndex: 'employee',
    key: 'employee',
    width: 100
  },
  {
    title: '完成工作',
    key: 'workCompleted',
    width: 250
  },
  {
    title: '计划工作',
    key: 'workPlanned',
    width: 200
  },
  {
    title: '工作指标',
    key: 'metrics',
    width: 120
  },
  {
    title: '状态',
    key: 'status',
    width: 100
  },
  {
    title: '提交时间',
    dataIndex: 'submitTime',
    key: 'submitTime',
    width: 150
  },
  {
    title: '操作',
    key: 'actions',
    width: 150,
    fixed: 'right'
  }
] 