// components/MultiSelectToolbar.tsx
'use client'

import { Editor } from 'tldraw'
import { Layers, Trash2, Copy } from 'lucide-react'

interface Props {
  editor: Editor
  shapeIds: string[]
  position: { x: number; y: number }
  onGroup: () => void
  onClose: () => void
}

export function MultiSelectToolbar({ editor, shapeIds, position, onGroup, onClose }: Props) {
  const handleDelete = () => {
    editor.deleteShapes(shapeIds as any[])
    onClose()
  }

  const handleDuplicate = () => {
    editor.duplicateShapes(shapeIds as any[])
  }

  const slideCount = shapeIds.length

  return (
    <div
      style={{
        position: 'fixed',
        left: position.x,
        top: position.y - 52,
        transform: 'translateX(-50%)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        background: '#1A1A1A',
        borderRadius: 10,
        padding: '5px 6px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.35)',
        pointerEvents: 'all',
      }}
    >
      <div
        style={{
          position: 'absolute',
          bottom: -6,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 0,
          height: 0,
          borderLeft: '6px solid transparent',
          borderRight: '6px solid transparent',
          borderTop: '6px solid #1A1A1A',
        }}
      />

      {/* Count badge */}
      <div
        style={{
          padding: '4px 10px',
          background: '#6366F1',
          borderRadius: 6,
          color: 'white',
          fontSize: 11,
          fontWeight: 700,
          fontFamily: 'system-ui, sans-serif',
          marginRight: 4,
        }}
      >
        {slideCount} slides
      </div>

      <div style={{ width: 1, height: 20, background: '#333', margin: '0 2px' }} />
      <ToolBtn icon={<Layers size={14} />} label="Group Slides" onClick={onGroup} accent />
      <div style={{ width: 1, height: 20, background: '#333', margin: '0 2px' }} />
      <ToolBtn icon={<Copy size={14} />} label="Duplicate All" onClick={handleDuplicate} />
      <div style={{ width: 1, height: 20, background: '#333', margin: '0 2px' }} />
      <ToolBtn icon={<Trash2 size={14} />} label="Delete All" onClick={handleDelete} danger />
    </div>
  )
}

function ToolBtn({
  icon, label, onClick, danger, accent,
}: {
  icon: React.ReactNode
  label: string
  onClick: () => void
  danger?: boolean
  accent?: boolean
}) {
  const color = danger ? '#FF6B6B' : accent ? '#818CF8' : '#E5E5E5'
  return (
    <button
      onClick={onClick}
      title={label}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 5,
        padding: '5px 9px',
        borderRadius: 6,
        border: 'none',
        background: 'transparent',
        color,
        cursor: 'pointer',
        fontSize: 12,
        fontWeight: 500,
        fontFamily: 'system-ui, sans-serif',
        transition: 'background 0.12s',
        whiteSpace: 'nowrap',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = danger ? '#3A1A1A' : accent ? '#1E1F3A' : '#2A2A2A'
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = 'transparent'
      }}
    >
      {icon}
      <span>{label}</span>
    </button>
  )
}