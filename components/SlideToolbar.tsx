// components/SlideToolbar.tsx
'use client'

import { Editor, TLShapeId, createShapeId } from 'tldraw'
import { Trash2, Edit3, Copy, Download, Ungroup } from 'lucide-react'
import html2canvas from 'html2canvas'

interface Props {
  editor: Editor
  shapeId: string
  position: { x: number; y: number }
  onEdit: () => void
  onClose: () => void
}

export function SlideToolbar({ editor, shapeId, position, onEdit, onClose }: Props) {
  const shape = editor.getShape(shapeId as TLShapeId)
  
  // Check if this is a grouped slide
  const isGrouped = shape && ((shape as any).props?.html?.includes('slides-container') || 
                    (shape as any).props?.html?.includes('slide-item'))

  const handleDelete = () => {
    editor.deleteShapes([shapeId as any])
    onClose()
  }

  const handleDuplicate = () => {
    editor.duplicateShapes([shapeId as any])
  }

  const handleUngroup = () => {
    const shape = editor.getShape(shapeId as TLShapeId)
    if (!shape || shape.type !== 'slide') return
    
    const props = (shape as any).props
    const html = props.html
    
    // Parse the grouped HTML to extract individual slides
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')
    const slideItems = doc.querySelectorAll('.slide-item')
    
    if (slideItems.length === 0) return
    
    // Get the original position
    const originalX = shape.x
    const originalY = shape.y
    const originalWidth = props.w
    const originalHeight = props.h
    
    // Detect layout
    const layout = detectLayout(html)
    const positions = calculatePositions(slideItems, layout, originalX, originalY, originalWidth, originalHeight)
    
    // Create new slides for each item
    const newShapeIds: TLShapeId[] = []
    
    slideItems.forEach((item, index) => {
      // Extract the HTML content
      const labelElement = item.querySelector('.slide-label')
      let slideTitle = `Slide ${index + 1}`
      let slideHtml = item.innerHTML
      
      if (labelElement) {
        const labelText = labelElement.textContent || ''
        const titleMatch = labelText.match(/Slide \d+:\s*(.+)/)
        if (titleMatch) {
          slideTitle = titleMatch[1]
        }
        labelElement.remove()
        slideHtml = item.innerHTML
      }
      
      const newId = createShapeId()
      newShapeIds.push(newId)
      
      editor.createShape({
        id: newId,
        type: 'slide',
        x: positions[index].x,
        y: positions[index].y,
        props: {
          w: positions[index].width,
          h: positions[index].height,
          html: slideHtml,
          title: slideTitle,
          isEditing: false,
        },
      })
    })
    
    // Delete the grouped shape
    editor.deleteShapes([shapeId as TLShapeId])
    
    // Select the new ungrouped shapes
    if (newShapeIds.length > 0) {
      editor.select(...newShapeIds)
      editor.zoomToSelection()
    }
    
    onClose()
  }

  const detectLayout = (html: string): 'horizontal' | 'vertical' | 'grid' => {
    if (html.includes('flex-direction: row')) return 'horizontal'
    if (html.includes('flex-direction: column')) return 'vertical'
    if (html.includes('display: grid')) return 'grid'
    return 'horizontal'
  }

  const calculatePositions = (
    items: NodeListOf<Element>,
    layout: string,
    startX: number,
    startY: number,
    containerWidth: number,
    containerHeight: number
  ) => {
    const positions: { x: number; y: number; width: number; height: number }[] = []
    
    if (layout === 'horizontal') {
      const itemWidth = containerWidth / items.length
      items.forEach((_, index) => {
        positions.push({
          x: startX + index * itemWidth,
          y: startY,
          width: itemWidth,
          height: containerHeight,
        })
      })
    } else if (layout === 'vertical') {
      const itemHeight = containerHeight / items.length
      items.forEach((_, index) => {
        positions.push({
          x: startX,
          y: startY + index * itemHeight,
          width: containerWidth,
          height: itemHeight,
        })
      })
    } else if (layout === 'grid') {
      const cols = Math.ceil(Math.sqrt(items.length))
      const rows = Math.ceil(items.length / cols)
      const itemWidth = containerWidth / cols
      const itemHeight = containerHeight / rows
      
      items.forEach((_, index) => {
        const col = index % cols
        const row = Math.floor(index / cols)
        positions.push({
          x: startX + col * itemWidth,
          y: startY + row * itemHeight,
          width: itemWidth,
          height: itemHeight,
        })
      })
    }
    
    return positions
  }

  const handleExportPNG = async () => {
    const shape = editor.getShape(shapeId as any)
    if (!shape || shape.type !== 'slide') return
    
    const props = (shape as any).props
    const { w, h, html, title } = props
    
    const container = document.createElement('div')
    container.style.position = 'fixed'
    container.style.left = '-9999px'
    container.style.top = '-9999px'
    container.style.width = `${w}px`
    container.style.height = `${h}px`
    container.style.background = '#ffffff'
    container.style.overflow = 'hidden'
    document.body.appendChild(container)
    
    const iframe = document.createElement('iframe')
    iframe.style.width = '100%'
    iframe.style.height = '100%'
    iframe.style.border = 'none'
    container.appendChild(iframe)
    
    const doc = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { width: 100%; height: 100%; font-family: system-ui, sans-serif; }
  </style>
</head>
<body>${html}</body>
</html>`
    
    iframe.srcdoc = doc
    await new Promise(resolve => { iframe.onload = resolve })
    await new Promise(resolve => setTimeout(resolve, 100))
    
    const canvas = await html2canvas(iframe.contentDocument?.body || iframe, {
      scale: 2,
      backgroundColor: '#ffffff',
      logging: false,
      useCORS: true,
    })
    
    const link = document.createElement('a')
    link.download = `${title || 'slide'}-${Date.now()}.png`
    link.href = canvas.toDataURL()
    link.click()
    document.body.removeChild(container)
  }

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
        boxShadow: '0 4px 24px rgba(0,0,0,0.35), 0 1px 4px rgba(0,0,0,0.2)',
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

      {/* Show Ungroup button for grouped slides, Edit for regular slides */}
      {isGrouped ? (
        <ToolBtn icon={<Ungroup size={14} />} label="Ungroup" onClick={handleUngroup} />
      ) : (
        <ToolBtn icon={<Edit3 size={14} />} label="Edit HTML" onClick={onEdit} />
      )}
      
      <div style={{ width: 1, height: 20, background: '#333', margin: '0 2px' }} />
      <ToolBtn icon={<Copy size={14} />} label="Duplicate" onClick={handleDuplicate} />
      <div style={{ width: 1, height: 20, background: '#333', margin: '0 2px' }} />
      <ToolBtn icon={<Download size={14} />} label="Export PNG" onClick={handleExportPNG} />
      <div style={{ width: 1, height: 20, background: '#333', margin: '0 2px' }} />
      <ToolBtn icon={<Trash2 size={14} />} label="Delete" onClick={handleDelete} danger />
    </div>
  )
}

function ToolBtn({
  icon, label, onClick, danger,
}: {
  icon: React.ReactNode
  label: string
  onClick: () => void
  danger?: boolean
}) {
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
        color: danger ? '#FF6B6B' : '#E5E5E5',
        cursor: 'pointer',
        fontSize: 12,
        fontWeight: 500,
        fontFamily: 'system-ui, sans-serif',
        transition: 'background 0.12s',
        whiteSpace: 'nowrap',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = danger ? '#3A1A1A' : '#2A2A2A'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent'
      }}
    >
      {icon}
      <span>{label}</span>
    </button>
  )
}