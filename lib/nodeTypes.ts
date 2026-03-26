// lib/nodeTypes.ts

export type WorkflowNodeType = 
  | 'trigger'
  | 'action'
  | 'condition'
  | 'delay'
  | 'loop'
  | 'transform'
  | 'approval'
  | 'notification'
  | 'webhook'
  | 'database'
  | 'schedule'
  | 'parallel'

export interface NodeMeta {
  type: WorkflowNodeType
  label: string
  description: string
  color: string
  bgColor: string
  borderColor: string
  badgeColor: string
  icon?: string
  category?: 'core' | 'data' | 'communication' | 'logic' | 'integration'
}

export const NODE_META: Record<WorkflowNodeType, NodeMeta> = {
  trigger: {
    type: 'trigger',
    label: 'Trigger',
    description: 'Starts the workflow',
    color: '#6366F1',
    bgColor: '#EEF2FF',
    borderColor: '#A5B4FC',
    badgeColor: '#4F46E5',
    icon: 'Zap',
    category: 'core',
  },
  action: {
    type: 'action',
    label: 'Action',
    description: 'Execute an action',
    color: '#0EA5E9',
    bgColor: '#F0F9FF',
    borderColor: '#7DD3FC',
    badgeColor: '#0284C7',
    icon: 'Play',
    category: 'core',
  },
  condition: {
    type: 'condition',
    label: 'Condition',
    description: 'Branch based on conditions',
    color: '#F59E0B',
    bgColor: '#FFFBEB',
    borderColor: '#FCD34D',
    badgeColor: '#D97706',
    icon: 'GitBranch',
    category: 'logic',
  },
  delay: {
    type: 'delay',
    label: 'Delay',
    description: 'Wait before next step',
    color: '#6B7280',
    bgColor: '#F9FAFB',
    borderColor: '#D1D5DB',
    badgeColor: '#4B5563',
    icon: 'Clock',
    category: 'logic',
  },
  loop: {
    type: 'loop',
    label: 'Loop',
    description: 'Iterate over items or repeat',
    color: '#8B5CF6',
    bgColor: '#F5F3FF',
    borderColor: '#C4B5FD',
    badgeColor: '#7C3AED',
    icon: 'Repeat',
    category: 'logic',
  },
  transform: {
    type: 'transform',
    label: 'Transform',
    description: 'Modify or map data',
    color: '#EC489A',
    bgColor: '#FDF2F8',
    borderColor: '#F9A8D4',
    badgeColor: '#DB2777',
    icon: 'ArrowLeftRight',
    category: 'data',
  },
  approval: {
    type: 'approval',
    label: 'Approval',
    description: 'Require manual approval',
    color: '#14B8A6',
    bgColor: '#F0FDFA',
    borderColor: '#99F6E4',
    badgeColor: '#0D9488',
    icon: 'CheckCircle',
    category: 'communication',
  },
  notification: {
    type: 'notification',
    label: 'Notification',
    description: 'Send push notification',
    color: '#F97316',
    bgColor: '#FFF7ED',
    borderColor: '#FDBA74',
    badgeColor: '#EA580C',
    icon: 'Bell',
    category: 'communication',
  },
  webhook: {
    type: 'webhook',
    label: 'Webhook',
    description: 'Call external API',
    color: '#3B82F6',
    bgColor: '#EFF6FF',
    borderColor: '#93C5FD',
    badgeColor: '#2563EB',
    icon: 'Webhook',
    category: 'integration',
  },
  database: {
    type: 'database',
    label: 'Database',
    description: 'Query or update database',
    color: '#10B981',
    bgColor: '#F0FDF4',
    borderColor: '#86EFAC',
    badgeColor: '#059669',
    icon: 'Database',
    category: 'data',
  },
  schedule: {
    type: 'schedule',
    label: 'Schedule',
    description: 'Schedule recurring execution',
    color: '#A855F7',
    bgColor: '#FAF5FF',
    borderColor: '#D8B4FE',
    badgeColor: '#9333EA',
    icon: 'Calendar',
    category: 'core',
  },
  parallel: {
    type: 'parallel',
    label: 'Parallel',
    description: 'Run multiple branches simultaneously',
    color: '#EAB308',
    bgColor: '#FEFCE8',
    borderColor: '#FDE047',
    badgeColor: '#CA8A04',
    icon: 'Split',
    category: 'logic',
  },
}

export const PALETTE_ITEMS: NodeMeta[] = [
  NODE_META.trigger,
  NODE_META.action,
  NODE_META.condition,
  NODE_META.delay,
  NODE_META.loop,
  NODE_META.transform,
  NODE_META.approval,
  NODE_META.notification,
  NODE_META.webhook,
  NODE_META.database,
  NODE_META.schedule,
  NODE_META.parallel,
]

// ── TRIGGER EVENTS (expanded) ────────────────────────────────
export const TRIGGER_EVENTS = [
  // Form & Submission
  { value: 'form.submit',        label: 'Form Submitted', category: 'form' },
  { value: 'form.update',        label: 'Form Updated', category: 'form' },
  { value: 'form.delete',        label: 'Form Deleted', category: 'form' },
  
  // Attendance
  { value: 'attendance.absent',  label: 'Attendance: Absent', category: 'attendance' },
  { value: 'attendance.present', label: 'Attendance: Present', category: 'attendance' },
  { value: 'attendance.late',    label: 'Attendance: Late', category: 'attendance' },
  { value: 'attendance.holiday', label: 'Attendance: Holiday', category: 'attendance' },
  
  // Employee
  { value: 'employee.created',   label: 'Employee Created', category: 'employee' },
  { value: 'employee.updated',   label: 'Employee Updated', category: 'employee' },
  { value: 'employee.deleted',   label: 'Employee Deleted', category: 'employee' },
  { value: 'employee.terminated', label: 'Employee Terminated', category: 'employee' },
  
  // Leave
  { value: 'leave.requested',    label: 'Leave Requested', category: 'leave' },
  { value: 'leave.approved',     label: 'Leave Approved', category: 'leave' },
  { value: 'leave.rejected',     label: 'Leave Rejected', category: 'leave' },
  { value: 'leave.cancelled',    label: 'Leave Cancelled', category: 'leave' },
  
  // Payment & Finance
  { value: 'payment.received',   label: 'Payment Received', category: 'finance' },
  { value: 'payment.failed',     label: 'Payment Failed', category: 'finance' },
  { value: 'payment.refunded',   label: 'Payment Refunded', category: 'finance' },
  { value: 'invoice.created',    label: 'Invoice Created', category: 'finance' },
  { value: 'invoice.due',        label: 'Invoice Due', category: 'finance' },
  { value: 'invoice.overdue',    label: 'Invoice Overdue', category: 'finance' },
  
  // Room & Booking
  { value: 'booking.created',    label: 'Booking Created', category: 'booking' },
  { value: 'booking.confirmed',  label: 'Booking Confirmed', category: 'booking' },
  { value: 'booking.cancelled',  label: 'Booking Cancelled', category: 'booking' },
  { value: 'booking.checkin',    label: 'Check-in', category: 'booking' },
  { value: 'booking.checkout',   label: 'Check-out', category: 'booking' },
  { value: 'room.maintenance',   label: 'Room Maintenance Required', category: 'room' },
  { value: 'room.vacant',        label: 'Room Vacant', category: 'room' },
  { value: 'room.occupied',      label: 'Room Occupied', category: 'room' },
  
  // Maintenance
  { value: 'maintenance.requested', label: 'Maintenance Requested', category: 'maintenance' },
  { value: 'maintenance.scheduled', label: 'Maintenance Scheduled', category: 'maintenance' },
  { value: 'maintenance.completed', label: 'Maintenance Completed', category: 'maintenance' },
  
  // Inventory
  { value: 'inventory.low',      label: 'Low Stock Alert', category: 'inventory' },
  { value: 'inventory.out',      label: 'Out of Stock', category: 'inventory' },
  { value: 'inventory.restocked', label: 'Restocked', category: 'inventory' },
  
  // System
  { value: 'system.error',       label: 'System Error', category: 'system' },
  { value: 'manual',             label: 'Manual Trigger', category: 'system' },
  { value: 'webhook',            label: 'Webhook Received', category: 'system' },
]

// ── ACTION TYPES (expanded) ──────────────────────────────────
export const ACTION_TYPES = [
  // Communication
  { value: 'email',      label: 'Send Email', category: 'communication' },
  { value: 'sms',        label: 'Send SMS', category: 'communication' },
  { value: 'push',       label: 'Push Notification', category: 'communication' },
  { value: 'slack',      label: 'Send Slack Message', category: 'communication' },
  { value: 'whatsapp',   label: 'Send WhatsApp', category: 'communication' },
  { value: 'notify',     label: 'Notify Admin', category: 'communication' },
  
  // Data Operations
  { value: 'record',     label: 'Create Record', category: 'data' },
  { value: 'update',     label: 'Update Record', category: 'data' },
  { value: 'delete',     label: 'Delete Record', category: 'data' },
  { value: 'query',      label: 'Query Database', category: 'data' },
  { value: 'aggregate',  label: 'Aggregate Data', category: 'data' },
  
  // API & Integration
  { value: 'webhook',    label: 'Call Webhook', category: 'integration' },
  { value: 'api',        label: 'Call API', category: 'integration' },
  { value: 'sync',       label: 'Sync External System', category: 'integration' },
  
  // File Operations
  { value: 'export',     label: 'Export Data', category: 'file' },
  { value: 'pdf',        label: 'Generate PDF', category: 'file' },
  { value: 'report',     label: 'Generate Report', category: 'file' },
  
  // Automation
  { value: 'log',        label: 'Log to Console', category: 'debug' },
  { value: 'schedule',   label: 'Schedule Task', category: 'automation' },
  { value: 'approval',   label: 'Request Approval', category: 'automation' },
  { value: 'assign',     label: 'Assign Task', category: 'automation' },
  
  // Payments
  { value: 'charge',     label: 'Process Payment', category: 'finance' },
  { value: 'refund',     label: 'Process Refund', category: 'finance' },
  { value: 'invoice',    label: 'Generate Invoice', category: 'finance' },
]

// ── CONDITION OPERATORS (expanded) ───────────────────────────
export const OPERATORS = [
  // Comparison
  { value: '>',   label: 'Greater than', category: 'comparison' },
  { value: '<',   label: 'Less than', category: 'comparison' },
  { value: '>=',  label: 'Greater or equal', category: 'comparison' },
  { value: '<=',  label: 'Less or equal', category: 'comparison' },
  { value: '==',  label: 'Equals', category: 'comparison' },
  { value: '!=',  label: 'Not equals', category: 'comparison' },
  
  // String
  { value: 'contains',    label: 'Contains', category: 'string' },
  { value: 'starts_with', label: 'Starts with', category: 'string' },
  { value: 'ends_with',   label: 'Ends with', category: 'string' },
  { value: 'matches',     label: 'Matches regex', category: 'string' },
  
  // Logical
  { value: 'and',  label: 'AND', category: 'logical' },
  { value: 'or',   label: 'OR', category: 'logical' },
  { value: 'not',  label: 'NOT', category: 'logical' },
  
  // Array
  { value: 'in',       label: 'In array', category: 'array' },
  { value: 'not_in',   label: 'Not in array', category: 'array' },
  { value: 'is_empty', label: 'Is empty', category: 'array' },
  
  // Date/Time
  { value: 'before',   label: 'Before date', category: 'date' },
  { value: 'after',    label: 'After date', category: 'date' },
  { value: 'between',  label: 'Between dates', category: 'date' },
  { value: 'is_weekend', label: 'Is weekend', category: 'date' },
  { value: 'is_weekday',  label: 'Is weekday', category: 'date' },
]

// ── DELAY UNITS (expanded) ───────────────────────────────────
export const DELAY_UNITS = [
  { value: 'seconds', label: 'Seconds' },
  { value: 'minutes', label: 'Minutes' },
  { value: 'hours',   label: 'Hours' },
  { value: 'days',    label: 'Days' },
  { value: 'weeks',   label: 'Weeks' },
  { value: 'months',  label: 'Months' },
]

// ── LOOP TYPES ───────────────────────────────────────────────
export const LOOP_TYPES = [
  { value: 'foreach', label: 'For Each (Iterate over items)' },
  { value: 'repeat',  label: 'Repeat (Fixed number of times)' },
  { value: 'while',   label: 'While (Condition based)' },
]

// ── TRANSFORM OPERATIONS ─────────────────────────────────────
export const TRANSFORM_OPS = [
  { value: 'map',      label: 'Map (Transform each item)' },
  { value: 'filter',   label: 'Filter (Keep matching items)' },
  { value: 'reduce',   label: 'Reduce (Aggregate values)' },
  { value: 'sort',     label: 'Sort (Order items)' },
  { value: 'unique',   label: 'Unique (Remove duplicates)' },
  { value: 'concat',   label: 'Concat (Merge arrays)' },
  { value: 'slice',    label: 'Slice (Take subset)' },
  { value: 'json',     label: 'Parse/stringify JSON' },
  { value: 'format',   label: 'Format string/template' },
  { value: 'math',     label: 'Mathematical operation' },
]

// ── APPROVAL TYPES ───────────────────────────────────────────
export const APPROVAL_TYPES = [
  { value: 'single',   label: 'Single Approver' },
  { value: 'any',      label: 'Any Approver (First to respond)' },
  { value: 'all',      label: 'All Approvers (Must approve)' },
  { value: 'majority', label: 'Majority Approvers' },
]

// ── SCHEDULE PATTERNS ────────────────────────────────────────
export const SCHEDULE_PATTERNS = [
  { value: 'once',      label: 'Once (One time)' },
  { value: 'cron',      label: 'Cron (Custom schedule)' },
  { value: 'daily',     label: 'Daily' },
  { value: 'weekly',    label: 'Weekly' },
  { value: 'monthly',   label: 'Monthly' },
  { value: 'hourly',    label: 'Hourly' },
  { value: 'interval',  label: 'Interval (Every X minutes/hours)' },
]

// ── Helper functions ─────────────────────────────────────────
export const getNodesByCategory = (category: string): NodeMeta[] => {
  return PALETTE_ITEMS.filter(node => node.category === category)
}

export const getTriggerEventsByCategory = (category: string) => {
  return TRIGGER_EVENTS.filter(event => event.category === category)
}

export const getActionTypesByCategory = (category: string) => {
  return ACTION_TYPES.filter(action => action.category === category)
}

export const getOperatorsByCategory = (category: string) => {
  return OPERATORS.filter(op => op.category === category)
}

// Category labels for UI
export const NODE_CATEGORIES = [
  { id: 'core', label: 'Core', icon: 'Star' },
  { id: 'logic', label: 'Logic & Flow', icon: 'GitBranch' },
  { id: 'data', label: 'Data Operations', icon: 'Database' },
  { id: 'communication', label: 'Communication', icon: 'Bell' },
  { id: 'integration', label: 'Integrations', icon: 'Webhook' },
]