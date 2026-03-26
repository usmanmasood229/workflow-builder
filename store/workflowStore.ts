// store/workflowStore.ts
import { create } from 'zustand'
import { WorkflowNodeType } from '@/lib/nodeTypes'

// Data stored inside each tldraw shape's meta field
export interface WorkflowNodeData {
  nodeType: WorkflowNodeType
  label: string
  // Trigger
  event?: string
  // Action
  actionType?: string
  to?: string
  subject?: string
  body?: string
  cc?: string[]
  bcc?: string[]
  attachments?: string[]
  // SMS
  phone?: string
  message?: string
  // Notification
  title?: string
  notificationBody?: string
  priority?: 'low' | 'normal' | 'high'
  // Webhook
  url?: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  headers?: Record<string, string>
  payload?: any
  // Database
  operation?: 'create' | 'update' | 'delete' | 'query' | 'aggregate'
  table?: string
  query?: any
  // Transform
  transformOp?: string
  sourceField?: string
  targetField?: string
  // Loop
  loopType?: 'foreach' | 'repeat' | 'while'
  collectionField?: string
  iterations?: number
  conditionField?: string
  // Approval
  approvalType?: 'single' | 'any' | 'all' | 'majority'
  approvers?: string[]
  approvalTimeout?: number
  // Schedule
  schedulePattern?: 'once' | 'cron' | 'daily' | 'weekly' | 'monthly' | 'hourly' | 'interval'
  cronExpression?: string
  timeOfDay?: string
  dayOfWeek?: number[]
  dayOfMonth?: number
  intervalValue?: number
  intervalUnit?: 'minutes' | 'hours'
  // Condition
  field?: string
  operator?: string
  condValue?: string
  // Delay
  duration?: string
  unit?: string
  // Parallel
  parallelBranches?: number
  // Common
  description?: string
  errorHandling?: 'stop' | 'continue' | 'retry'
  retryCount?: number
  timeout?: number
}

export const DEFAULT_DATA: Record<WorkflowNodeType, WorkflowNodeData> = {
  trigger: {
    nodeType: 'trigger',
    label: 'Form Submitted',
    event: 'form.submit',
    description: 'Starts when a form is submitted',
  },
  action: {
    nodeType: 'action',
    label: 'Send Email',
    actionType: 'email',
    to: '',
    subject: '',
    body: '',
    errorHandling: 'stop',
  },
  condition: {
    nodeType: 'condition',
    label: 'Check Condition',
    field: 'days_absent',
    operator: '>',
    condValue: '3',
    description: 'Branch based on condition',
  },
  delay: {
    nodeType: 'delay',
    label: 'Wait',
    duration: '1',
    unit: 'hours',
    description: 'Pause execution',
  },
  loop: {
    nodeType: 'loop',
    label: 'For Each Item',
    loopType: 'foreach',
    collectionField: '',
    description: 'Iterate over items',
  },
  transform: {
    nodeType: 'transform',
    label: 'Transform Data',
    transformOp: 'map',
    sourceField: '',
    targetField: '',
    description: 'Modify data structure',
  },
  approval: {
    nodeType: 'approval',
    label: 'Request Approval',
    approvalType: 'single',
    approvers: [],
    approvalTimeout: 24,
    description: 'Requires manual approval',
  },
  notification: {
    nodeType: 'notification',
    label: 'Send Notification',
    actionType: 'push',
    title: '',
    notificationBody: '',
    priority: 'normal',
    description: 'Send push notification',
  },
  webhook: {
    nodeType: 'webhook',
    label: 'Call Webhook',
    url: '',
    method: 'POST',
    headers: {},
    payload: {},
    description: 'Call external API',
  },
  database: {
    nodeType: 'database',
    label: 'Database Operation',
    operation: 'create',
    table: '',
    query: {},
    description: 'Query or update database',
  },
  schedule: {
    nodeType: 'schedule',
    label: 'Schedule',
    schedulePattern: 'daily',
    timeOfDay: '09:00',
    description: 'Schedule recurring execution',
  },
  parallel: {
    nodeType: 'parallel',
    label: 'Parallel Branch',
    parallelBranches: 2,
    description: 'Run multiple branches simultaneously',
  },
}

interface WorkflowStore {
  // The ID of the tldraw shape currently selected for config
  selectedShapeId: string | null
  selectedData: WorkflowNodeData | null
  // Workflow metadata
  workflowId: string | null
  workflowName: string
  workflowDescription: string
  isPublished: boolean
  // Undo/Redo stack
  history: any[]
  historyIndex: number

  // Selection actions
  setSelected: (id: string | null, data: WorkflowNodeData | null) => void
  clearSelected: () => void
  updateSelectedData: (updates: Partial<WorkflowNodeData>) => void
  
  // Workflow metadata actions
  setWorkflowId: (id: string | null) => void
  setWorkflowName: (name: string) => void
  setWorkflowDescription: (description: string) => void
  setIsPublished: (published: boolean) => void
  
  // History actions
  pushToHistory: (state: any) => void
  undo: () => void
  redo: () => void
  canUndo: () => boolean
  canRedo: () => boolean
  
  // Reset
  reset: () => void
}

export const useWorkflowStore = create<WorkflowStore>((set, get) => ({
  selectedShapeId: null,
  selectedData: null,
  workflowId: null,
  workflowName: '',
  workflowDescription: '',
  isPublished: false,
  history: [],
  historyIndex: -1,

  setSelected: (id, data) => set({ selectedShapeId: id, selectedData: data }),
  
  clearSelected: () => set({ selectedShapeId: null, selectedData: null }),
  
  updateSelectedData: (updates) => {
    const { selectedData } = get()
    if (selectedData) {
      set({ selectedData: { ...selectedData, ...updates } })
    }
  },
  
  setWorkflowId: (id) => set({ workflowId: id }),
  
  setWorkflowName: (name) => set({ workflowName: name }),
  
  setWorkflowDescription: (description) => set({ workflowDescription: description }),
  
  setIsPublished: (published) => set({ isPublished: published }),
  
  pushToHistory: (state) => {
    const { history, historyIndex } = get()
    // Remove any future history if we're not at the end
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push(state)
    set({ 
      history: newHistory, 
      historyIndex: newHistory.length - 1 
    })
  },
  
  undo: () => {
    const { history, historyIndex } = get()
    if (historyIndex > 0) {
      const previousState = history[historyIndex - 1]
      set({ 
        ...previousState,
        historyIndex: historyIndex - 1 
      })
    }
  },
  
  redo: () => {
    const { history, historyIndex } = get()
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1]
      set({ 
        ...nextState,
        historyIndex: historyIndex + 1 
      })
    }
  },
  
  canUndo: () => {
    const { historyIndex } = get()
    return historyIndex > 0
  },
  
  canRedo: () => {
    const { history, historyIndex } = get()
    return historyIndex < history.length - 1
  },
  
  reset: () => {
    set({
      selectedShapeId: null,
      selectedData: null,
      workflowId: null,
      workflowName: '',
      workflowDescription: '',
      isPublished: false,
      history: [],
      historyIndex: -1,
    })
  },
}))

// Helper function to validate node data based on type
export const validateNodeData = (data: WorkflowNodeData): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []
  
  switch (data.nodeType) {
    case 'trigger':
      if (!data.event) errors.push('Event is required for trigger')
      break
      
    case 'action':
      if (!data.actionType) errors.push('Action type is required')
      if (data.actionType === 'email') {
        if (!data.to) errors.push('Recipient email is required')
        if (!data.subject) errors.push('Subject is required')
        if (!data.body) errors.push('Body is required')
      } else if (data.actionType === 'sms') {
        if (!data.phone) errors.push('Phone number is required')
        if (!data.message) errors.push('Message is required')
      } else if (data.actionType === 'webhook') {
        if (!data.url) errors.push('Webhook URL is required')
      }
      break
      
    case 'condition':
      if (!data.field) errors.push('Field is required for condition')
      if (!data.operator) errors.push('Operator is required for condition')
      if (data.condValue === undefined) errors.push('Value is required for condition')
      break
      
    case 'delay':
      if (!data.duration || Number(data.duration) <= 0) errors.push('Valid duration is required')
      if (!data.unit) errors.push('Unit is required')
      break
      
    case 'loop':
      if (data.loopType === 'foreach' && !data.collectionField) {
        errors.push('Collection field is required for foreach loop')
      }
      if (data.loopType === 'repeat' && (!data.iterations || data.iterations <= 0)) {
        errors.push('Valid iterations count is required')
      }
      break
      
    case 'transform':
      if (!data.transformOp) errors.push('Transform operation is required')
      break
      
    case 'approval':
      if (data.approvalType && data.approvers && data.approvers.length === 0) {
        errors.push('At least one approver is required')
      }
      break
      
    case 'webhook':
      if (!data.url) errors.push('Webhook URL is required')
      break
      
    case 'database':
      if (!data.operation) errors.push('Database operation is required')
      if (!data.table) errors.push('Table name is required')
      break
      
    case 'schedule':
      if (data.schedulePattern === 'cron' && !data.cronExpression) {
        errors.push('Cron expression is required')
      }
      if (data.schedulePattern === 'interval' && (!data.intervalValue || data.intervalValue <= 0)) {
        errors.push('Valid interval value is required')
      }
      break
  }
  
  return { isValid: errors.length === 0, errors }
}

// Helper to get default data for a node type
export const getDefaultDataForType = (type: WorkflowNodeType): WorkflowNodeData => {
  return { ...DEFAULT_DATA[type] }
}