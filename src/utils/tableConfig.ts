// 统一的表格配置

// 标准分页配置
export const createPagination = (total: number = 0) => ({
  current: 1,
  pageSize: 10,
  total,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total: number, range: [number, number]) => 
    `第 ${range[0]}-${range[1]} 条，共 ${total} 条记录`,
  pageSizeOptions: ['10', '20', '50', '100'],
  size: 'default' as const
})

// 简化分页配置（用于数据较少的页面）
export const createSimplePagination = (total: number = 0) => ({
  current: 1,
  pageSize: 20,
  total,
  showSizeChanger: false,
  showQuickJumper: false,
  showTotal: (total: number) => `共 ${total} 条记录`,
  size: 'small' as const
})

// 表格通用配置
export const tableConfig = {
  size: 'middle' as const,
  bordered: false,
  showHeader: true,
  tableLayout: 'fixed' as const,
  scroll: { x: 'max-content' }
}

// 表格列宽度标准
export const columnWidths = {
  serialNumber: 60,      // 序号
  id: 80,               // ID
  name: 120,            // 姓名
  department: 100,      // 部门
  status: 100,          // 状态
  date: 110,            // 日期
  dateTime: 150,        // 日期时间
  progress: 120,        // 进度
  actions: 150,         // 操作
  weight: 80,           // 权重
  score: 80,            // 分数
  title: 200,           // 标题
  description: 250,     // 描述
  content: 200,         // 内容
  responsible: 100,     // 负责人
  creator: 100,         // 创建人
  category: 120,        // 分类
  priority: 100,        // 优先级
  type: 100,            // 类型
  remark: 200          // 备注
}

// 表格行选择配置
export const createRowSelection = (
  selectedRowKeys: string[] | number[],
  onChange: (keys: string[] | number[]) => void
) => ({
  selectedRowKeys,
  onChange,
  preserveSelectedRowKeys: true,
  type: 'checkbox' as const,
  fixed: true,
  columnWidth: 50
})

// 状态颜色映射
export const statusColors = {
  // 通用状态
  active: 'success',
  inactive: 'default',
  draft: 'default',
  published: 'processing',
  pending: 'warning',
  approved: 'success',
  rejected: 'error',
  
  // 进度状态
  'not-started': 'default',
  'in-progress': 'processing',
  'completed': 'success',
  'paused': 'warning',
  'cancelled': 'error',
  'delayed': 'error',
  
  // 审核状态
  'under-review': 'processing',
  'review-passed': 'success',
  'review-failed': 'error',
  'need-revision': 'warning',
  
  // 优先级
  high: 'error',
  medium: 'warning', 
  low: 'default',
  
  // 任务状态
  todo: 'default',
  doing: 'processing',
  done: 'success',
  blocked: 'error'
} as const

// 状态文本映射
export const statusTexts = {
  // 通用状态
  active: '启用',
  inactive: '禁用',
  draft: '草稿',
  published: '已发布',
  pending: '待处理',
  approved: '已批准',
  rejected: '已拒绝',
  
  // 进度状态
  'not-started': '未开始',
  'in-progress': '进行中',
  'completed': '已完成',
  'paused': '已暂停',
  'cancelled': '已取消',
  'delayed': '已延期',
  
  // 审核状态
  'under-review': '审核中',
  'review-passed': '审核通过',
  'review-failed': '审核失败',
  'need-revision': '需要修订',
  
  // 优先级
  high: '高',
  medium: '中',
  low: '低',
  
  // 任务状态
  todo: '待办',
  doing: '进行中',
  done: '已完成',
  blocked: '阻塞'
} as const

// 获取状态标签配置
export const getStatusTag = (status: string) => ({
  color: statusColors[status as keyof typeof statusColors] || 'default',
  text: statusTexts[status as keyof typeof statusTexts] || status
})

// 表格排序配置
export const createSorter = (dataIndex: string) => ({
  sorter: (a: any, b: any) => {
    const aVal = a[dataIndex]
    const bVal = b[dataIndex]
    
    if (typeof aVal === 'string') {
      return aVal.localeCompare(bVal)
    }
    
    if (typeof aVal === 'number') {
      return aVal - bVal
    }
    
    if (aVal instanceof Date) {
      return aVal.getTime() - bVal.getTime()
    }
    
    return 0
  },
  sortDirections: ['ascend', 'descend'] as const
})

// 表格筛选配置
export const createFilter = (options: { text: string; value: string }[]) => ({
  filters: options,
  onFilter: (value: string, record: any) => record.status === value,
  filterMultiple: false
}) 