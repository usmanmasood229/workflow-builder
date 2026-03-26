// components/ConfigPanel.tsx
'use client'

import { Editor } from 'tldraw'
import { WorkflowNodeData } from '../store/workflowStore'
import { WorkflowNodeType, NODE_META, TRIGGER_EVENTS, ACTION_TYPES, OPERATORS, DELAY_UNITS } from '@/lib/nodeTypes'

interface Props {
  editor: Editor | null
  shapeId: string | null
  data: WorkflowNodeData | null
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '7px 9px',
  fontSize: 12,
  border: '1.5px solid #E2E8F0',
  borderRadius: 7,
  background: '#F8FAFC',
  color: '#0F172A',
  outline: 'none',
  fontFamily: 'inherit',
  boxSizing: 'border-box',
}

const selectStyle: React.CSSProperties = { ...inputStyle, cursor: 'pointer' }

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label
        style={{
          display: 'block',
          fontSize: 10,
          fontWeight: 700,
          color: '#64748B',
          letterSpacing: 0.5,
          marginBottom: 4,
        }}
      >
        {label}
      </label>
      {children}
    </div>
  )
}

export function ConfigPanel({ editor, shapeId, data }: Props) {
  // Update shape props in tldraw when a field changes
  const update = (patch: Partial<WorkflowNodeData>) => {
    if (!editor || !shapeId) return
    editor.updateShape({
      id: shapeId as any,
      type: 'workflow-node',
      props: {
        nodeData: { ...data, ...patch },
      },
    })
  }

  const deleteNode = () => {
    if (!editor || !shapeId) return
    editor.deleteShapes([shapeId as any])
  }

  // Empty state
  if (!shapeId || !data) {
    return (
      <aside
        style={{
          width: 240,
          minWidth: 240,
          background: '#FFFFFF',
          borderLeft: '1px solid #E2E8F0',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
          zIndex: 100,
        }}
      >
        <div
          style={{
            width: 46,
            height: 46,
            borderRadius: 23,
            background: '#F1F5F9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 12,
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#94A3B8', textAlign: 'center' }}>
          Click a node to configure it
        </div>
        <div style={{ fontSize: 11, color: '#CBD5E1', textAlign: 'center', marginTop: 6 }}>
          Select any node on the canvas
        </div>
      </aside>
    )
  }

  const type = data.nodeType as WorkflowNodeType
  const meta = NODE_META[type]

  return (
    <aside
      style={{
        width: 240,
        minWidth: 240,
        background: '#FFFFFF',
        borderLeft: '1px solid #E2E8F0',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        zIndex: 100,
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '14px 16px 12px',
          borderBottom: '1px solid #F1F5F9',
          background: meta.bgColor,
          borderLeft: `4px solid ${meta.color}`,
        }}
      >
        <span
          style={{
            display: 'inline-block',
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: 0.8,
            color: meta.badgeColor,
            background: `${meta.color}22`,
            padding: '2px 8px',
            borderRadius: 100,
            marginBottom: 6,
          }}
        >
          {meta.label.toUpperCase()}
        </span>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>{data.label}</div>
        <div style={{ fontSize: 10, color: '#94A3B8', marginTop: 2 }}>ID: {shapeId}</div>
      </div>

      {/* Fields */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px' }}>
        <Field label="LABEL">
          <input
            style={inputStyle}
            value={data.label}
            onChange={(e) => update({ label: e.target.value })}
          />
        </Field>

        {/* Trigger fields */}
        {type === 'trigger' && (
          <Field label="EVENT">
            <select
              style={selectStyle}
              value={data.event || ''}
              onChange={(e) => update({ event: e.target.value })}
            >
              {TRIGGER_EVENTS.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </Field>
        )}

        {/* Action fields */}
        {type === 'action' && (
          <>
            <Field label="ACTION TYPE">
              <select
                style={selectStyle}
                value={data.actionType || ''}
                onChange={(e) => update({ actionType: e.target.value })}
              >
                {ACTION_TYPES.map((a) => (
                  <option key={a.value} value={a.value}>{a.label}</option>
                ))}
              </select>
            </Field>
            {data.actionType === 'email' && (
              <>
                <Field label="TO">
                  <input
                    style={inputStyle}
                    value={data.to || ''}
                    placeholder="{{employee.email}}"
                    onChange={(e) => update({ to: e.target.value })}
                  />
                </Field>
                <Field label="SUBJECT">
                  <input
                    style={inputStyle}
                    value={data.subject || ''}
                    placeholder="Email subject"
                    onChange={(e) => update({ subject: e.target.value })}
                  />
                </Field>
                <Field label="BODY">
                  <textarea
                    style={{ ...inputStyle, minHeight: 72, resize: 'vertical' }}
                    value={data.body || ''}
                    placeholder="Email body..."
                    onChange={(e) => update({ body: e.target.value })}
                  />
                </Field>
              </>
            )}
          </>
        )}

        {/* Condition fields */}
        {type === 'condition' && (
          <>
            <div
              style={{
                background: '#FFFBEB',
                border: '1px solid #FDE68A',
                borderRadius: 9,
                padding: '10px 10px 4px',
                marginBottom: 12,
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: '#92400E',
                  marginBottom: 10,
                  letterSpacing: 0.5,
                }}
              >
                IF CONDITION
              </div>
              <Field label="FIELD">
                <input
                  style={inputStyle}
                  value={data.field || ''}
                  placeholder="e.g. days_absent"
                  onChange={(e) => update({ field: e.target.value })}
                />
              </Field>
              <Field label="OPERATOR">
                <select
                  style={selectStyle}
                  value={data.operator || '>'}
                  onChange={(e) => update({ operator: e.target.value })}
                >
                  {OPERATORS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </Field>
              <Field label="VALUE">
                <input
                  style={inputStyle}
                  value={data.condValue || ''}
                  placeholder="e.g. 3"
                  onChange={(e) => update({ condValue: e.target.value })}
                />
              </Field>
            </div>
            <div
              style={{
                fontSize: 11,
                color: '#64748B',
                background: '#F8FAFC',
                borderRadius: 8,
                padding: '8px 10px',
              }}
            >
              Draw arrows from{' '}
              <span style={{ color: '#16A34A', fontWeight: 700 }}>TRUE</span> and{' '}
              <span style={{ color: '#DC2626', fontWeight: 700 }}>FALSE</span> sides.
            </div>
          </>
        )}

        {/* Delay fields */}
        {type === 'delay' && (
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ flex: 1 }}>
              <Field label="DURATION">
                <input
                  style={inputStyle}
                  type="number"
                  min="1"
                  value={data.duration || '1'}
                  onChange={(e) => update({ duration: e.target.value })}
                />
              </Field>
            </div>
            <div style={{ flex: 1 }}>
              <Field label="UNIT">
                <select
                  style={selectStyle}
                  value={data.unit || 'hours'}
                  onChange={(e) => update({ unit: e.target.value })}
                >
                  {DELAY_UNITS.map((u) => (
                    <option key={u.value} value={u.value}>{u.label}</option>
                  ))}
                </select>
              </Field>
            </div>
          </div>
        )}
      </div>

      {/* Delete */}
      <div style={{ padding: '10px 16px', borderTop: '1px solid #F1F5F9' }}>
        <button
          onClick={deleteNode}
          style={{
            width: '100%',
            padding: '9px 12px',
            fontSize: 12,
            fontWeight: 700,
            background: '#FEF2F2',
            color: '#DC2626',
            border: '1px solid #FECACA',
            borderRadius: 8,
            cursor: 'pointer',
          }}
        >
          Delete Node
        </button>
      </div>
    </aside>
  )
}