// components/WorkflowApp.tsx
'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  Tldraw,
  Editor,
  TLEventInfo,
  useEditor,
} from 'tldraw'
import 'tldraw/tldraw.css'

import { WorkflowShapeUtil } from '@/lib/WorkflowShapeUtil'
import { Sidebar } from '@/components/Sidebar'
import { ConfigPanel } from '@/components/ConfigPanel'
import { useWorkflowStore } from '../store/workflowStore'
import { WorkflowNodeData } from '../store/workflowStore'

// Custom shape utils registered with tldraw
const customShapeUtils = [WorkflowShapeUtil]

// ── Inner component — has access to useEditor hook ─────────────
function Inner() {
  const editor = useEditor()
  const { selectedShapeId, selectedData, setSelected, clearSelected } = useWorkflowStore()
  const [nodeCount, setNodeCount] = useState(0)
  const [arrowCount, setArrowCount] = useState(0)

  // Listen to tldraw selection changes
  useEffect(() => {
    const unsub = editor.store.listen(() => {
      // Update counts
      const allShapes = editor.getCurrentPageShapes()
      setNodeCount(allShapes.filter((s) => s.type === 'workflow-node').length)
      setArrowCount(allShapes.filter((s) => s.type === 'arrow').length)

      // Sync selected node to config panel
      const selectedIds = editor.getSelectedShapeIds()
      if (selectedIds.length === 1) {
        const shape = editor.getShape(selectedIds[0])
        if (shape && shape.type === 'workflow-node') {
          const props = (shape as any).props
          setSelected(shape.id, props.nodeData as WorkflowNodeData)
          return
        }
      }
      clearSelected()
    })
    return unsub
  }, [editor])

  return (
    <div style={{ display: 'flex', width: '100%', height: '100%' }}>
      <Sidebar
        editor={editor}
        nodeCount={nodeCount}
        arrowCount={arrowCount}
      />

      {/* tldraw fills the middle */}
      <div style={{ flex: 1, position: 'relative' }}>
        {/* tldraw renders into this via the parent Tldraw component */}
      </div>

      <ConfigPanel
        editor={editor}
        shapeId={selectedShapeId}
        data={selectedData}
      />
    </div>
  )
}

// ── Outer component — provides tldraw context ──────────────────
export default function WorkflowApp() {
  const [editor, setEditor] = useState<Editor | null>(null)
  const { selectedShapeId, selectedData, setSelected, clearSelected } = useWorkflowStore()
  const [nodeCount, setNodeCount] = useState(0)
  const [arrowCount, setArrowCount] = useState(0)

  const handleMount = useCallback((ed: Editor) => {
    setEditor(ed)

    // Hide tldraw's default UI panels we don't need
    ed.updateInstanceState({ isDebugMode: false })

    // Listen for shape/selection changes
    const unsub = ed.store.listen(() => {
      const allShapes = ed.getCurrentPageShapes()
      setNodeCount(allShapes.filter((s) => s.type === 'workflow-node').length)
      setArrowCount(allShapes.filter((s) => s.type === 'arrow').length)

      const selectedIds = ed.getSelectedShapeIds()
      if (selectedIds.length === 1) {
        const shape = ed.getShape(selectedIds[0])
        if (shape && shape.type === 'workflow-node') {
          const props = (shape as any).props
          setSelected(shape.id, props.nodeData as WorkflowNodeData)
          return
        }
      }
      clearSelected()
    })

    return () => unsub()
  }, [])

  return (
    <div
      style={{
        display: 'flex',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        background: '#F8FAFC',
      }}
    >
      {/* Left sidebar sits outside tldraw */}
      <Sidebar editor={editor} nodeCount={nodeCount} arrowCount={arrowCount} />

      {/* tldraw canvas fills middle */}
      <div style={{ flex: 1, position: 'relative' }}>
        <Tldraw
          shapeUtils={customShapeUtils}
          onMount={handleMount}
          hideUi={false}
        />
      </div>

      {/* Right config panel sits outside tldraw */}
      <ConfigPanel
        editor={editor}
        shapeId={selectedShapeId}
        data={selectedData}
      />
    </div>
  )
}