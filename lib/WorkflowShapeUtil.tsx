// lib/WorkflowShapeUtil.tsx
'use client'

import {
  BaseBoxShapeUtil,
  HTMLContainer,
  RecordProps,
  T,
  TLBaseShape,
} from 'tldraw'
import { WorkflowNodeData, DEFAULT_DATA } from '@/store/workflowStore'
import { WorkflowNodeType, NODE_META } from '@/lib/nodeTypes'

// Shape type that tldraw will store
export type WorkflowShape = TLBaseShape<
  'workflow-node',
  {
    w: number
    h: number
    nodeData: WorkflowNodeData
  }
>

export class WorkflowShapeUtil extends BaseBoxShapeUtil<WorkflowShape> {
  static override type = 'workflow-node' as const

  static override props: RecordProps<WorkflowShape> = {
    w: T.number,
    h: T.number,
    nodeData: T.any,
  }

  override getDefaultProps(): WorkflowShape['props'] {
    return {
      w: 200,
      h: 90,
      nodeData: DEFAULT_DATA.trigger,
    }
  }


  override component(shape: WorkflowShape) {
    const { nodeData, w, h } = shape.props
    const meta = NODE_META[nodeData.nodeType as WorkflowNodeType]

    const subtitle = getSubtitle(nodeData)

    return (
      <HTMLContainer
        id={shape.id}
        style={{ width: w, height: h, pointerEvents: 'all' }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            background: meta.bgColor,
            border: `2px solid ${meta.borderColor}`,
            borderRadius: 12,
            padding: '10px 13px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            cursor: 'pointer',
            userSelect: 'none',
            overflow: 'hidden',
          }}
        >
          {/* Badge */}
          <div style={{ marginBottom: 5 }}>
            <span
              style={{
                display: 'inline-block',
                background: meta.badgeColor,
                color: '#fff',
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: 0.7,
                padding: '2px 8px',
                borderRadius: 100,
                textTransform: 'uppercase',
              }}
            >
              {meta.label}
            </span>
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: '#0F172A',
              lineHeight: 1.3,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {nodeData.label}
          </div>

          {/* Subtitle */}
          <div
            style={{
              fontSize: 11,
              color: '#64748B',
              marginTop: 2,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {subtitle}
          </div>

          {/* Condition branch labels */}
          {nodeData.nodeType === 'condition' && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: 6,
                fontSize: 9,
                fontWeight: 700,
              }}
            >
              <span style={{ color: '#16A34A' }}>TRUE ↓</span>
              <span style={{ color: '#DC2626' }}>FALSE ↓</span>
            </div>
          )}
        </div>
      </HTMLContainer>
    )
  }

  override indicator(shape: WorkflowShape) {
    const meta = NODE_META[shape.props.nodeData.nodeType as WorkflowNodeType]
    return (
      <rect
        width={shape.props.w}
        height={shape.props.h}
        rx={12}
        fill="none"
        stroke={meta.color}
        strokeWidth={2}
      />
    )
  }
}

function getSubtitle(data: WorkflowNodeData): string {
  switch (data.nodeType) {
    case 'trigger':
      return data.event || 'No event set'
    case 'action':
      return data.actionType === 'email' && data.to
        ? `To: ${data.to}`
        : data.actionType || 'No action set'
    case 'condition':
      return data.field
        ? `IF ${data.field} ${data.operator} ${data.condValue}`
        : 'No condition set'
    case 'delay':
      return data.duration
        ? `Wait ${data.duration} ${data.unit}`
        : 'No delay set'
    default:
      return ''
  }
}