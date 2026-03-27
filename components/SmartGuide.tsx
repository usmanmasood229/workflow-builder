// components/SmartGuide.tsx
'use client'

import { Editor, TLShapeId } from 'tldraw'
import { useEffect, useState } from 'react'

interface SmartGuideProps {
  editor: Editor
  movingShapeId: TLShapeId | null
}

export function SmartGuide({ editor, movingShapeId }: SmartGuideProps) {
  const [guides, setGuides] = useState<Array<{ x: number; y: number; orientation: 'horizontal' | 'vertical' }>>([])

  useEffect(() => {
    if (!movingShapeId) {
      setGuides([])
      return
    }

    const updateGuides = () => {
      const movingShape = editor.getShape(movingShapeId)
      if (!movingShape) return

      const movingBounds = editor.getShapePageBounds(movingShapeId)
      if (!movingBounds) return

      const allShapes = editor.getCurrentPageShapes()
      const otherShapes = allShapes.filter(s => s.id !== movingShapeId && s.type === 'slide')
      
      const newGuides: Array<{ x: number; y: number; orientation: 'horizontal' | 'vertical' }> = []

      otherShapes.forEach(shape => {
        const bounds = editor.getShapePageBounds(shape.id)
        if (!bounds) return

        // Check for edge alignment
        const threshold = 5 // pixels

        // Left edge alignment
        if (Math.abs(movingBounds.x - bounds.x) < threshold) {
          newGuides.push({ x: bounds.x, y: 0, orientation: 'vertical' })
        }
        
        // Right edge alignment
        if (Math.abs(movingBounds.x + movingBounds.w - (bounds.x + bounds.w)) < threshold) {
          newGuides.push({ x: bounds.x + bounds.w, y: 0, orientation: 'vertical' })
        }
        
        // Top edge alignment
        if (Math.abs(movingBounds.y - bounds.y) < threshold) {
          newGuides.push({ x: 0, y: bounds.y, orientation: 'horizontal' })
        }
        
        // Bottom edge alignment
        if (Math.abs(movingBounds.y + movingBounds.h - (bounds.y + bounds.h)) < threshold) {
          newGuides.push({ x: 0, y: bounds.y + bounds.h, orientation: 'horizontal' })
        }
        
        // Center alignment
        const movingCenterX = movingBounds.x + movingBounds.w / 2
        const movingCenterY = movingBounds.y + movingBounds.h / 2
        const shapeCenterX = bounds.x + bounds.w / 2
        const shapeCenterY = bounds.y + bounds.h / 2
        
        if (Math.abs(movingCenterX - shapeCenterX) < threshold) {
          newGuides.push({ x: shapeCenterX, y: 0, orientation: 'vertical' })
        }
        
        if (Math.abs(movingCenterY - shapeCenterY) < threshold) {
          newGuides.push({ x: 0, y: shapeCenterY, orientation: 'horizontal' })
        }
      })

      setGuides(newGuides)
    }

    const unsubscribe = editor.store.listen(updateGuides)
    updateGuides()

    return () => unsubscribe()
  }, [editor, movingShapeId])

  if (!movingShapeId || guides.length === 0) return null

  return (
    <>
      {guides.map((guide, i) => (
        guide.orientation === 'vertical' ? (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: guide.x,
              top: 0,
              bottom: 0,
              width: 1,
              background: '#6366F1',
              pointerEvents: 'none',
              zIndex: 10000,
              boxShadow: '0 0 0 1px rgba(99, 102, 241, 0.3)',
            }}
          />
        ) : (
          <div
            key={i}
            style={{
              position: 'absolute',
              top: guide.y,
              left: 0,
              right: 0,
              height: 1,
              background: '#6366F1',
              pointerEvents: 'none',
              zIndex: 10000,
              boxShadow: '0 0 0 1px rgba(99, 102, 241, 0.3)',
            }}
          />
        )
      ))}
    </>
  )
}