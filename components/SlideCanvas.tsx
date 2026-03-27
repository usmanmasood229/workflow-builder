// components/SlideCanvas.tsx
'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { Tldraw, Editor, TLShape, TLShapeId } from 'tldraw'
import 'tldraw/tldraw.css'

import { SlideShapeUtil } from '../lib/SlideShapeUtil'
import { SlideToolbar } from '../components/SlideToolbar'
import { MultiSelectToolbar } from '../components/MultiSelectToolbar'
import { HtmlEditor } from '../components/HtmlEditor'
import { SlideGroup } from '../components/SlideGroup'
import { Header } from '../components/Header'
import { PropertiesPanel } from '../components/PropertiesPanel'

const customShapeUtils = [SlideShapeUtil]

interface ToolbarState {
  type: 'single' | 'multi'
  shapeIds: string[]
  position: { x: number; y: number }
}

interface EditorState {
  shapeId: string
  html: string
  title: string
}

interface GroupSlide {
  id: string
  html: string
  title: string
  w: number
  h: number
}

interface SnapConnection {
  shapeId: string
  side: 'top' | 'bottom' | 'left' | 'right'
  targetShapeId: string
  targetSide: 'top' | 'bottom' | 'left' | 'right'
  snapX?: number
  snapY?: number
}

interface SnapGuide {
  type: 'horizontal' | 'vertical'
  position: number
  distance: number
}

interface WidthMatchGuide {
  show: boolean
  position: number
  width: number
}

interface HeightMatchGuide {
  show: boolean
  position: number
  height: number
}

// New interface for resize snapping
interface ResizeSnapGuide {
  type: 'top' | 'bottom' | 'left' | 'right'
  position: number
  targetShapeId: string
  targetSide: 'top' | 'bottom' | 'left' | 'right'
  distance: number
}

// ─── Floating bottom toolbar ─────────────────────────────────────────────────
function BottomBar({
  editor,
  zoom,
}: {
  editor: Editor | null
  zoom: number
}) {
  const zoomIn = () => editor?.zoomIn()
  const zoomOut = () => editor?.zoomOut()
  const fitAll = () => editor?.zoomToFit()
  const resetZoom = () => editor?.resetZoom()

  const pct = Math.round(zoom * 100)

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 20,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 7000,
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        background: '#141414',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 12,
        padding: '5px 8px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        fontFamily: "'DM Mono', 'Fira Mono', monospace",
      }}
    >
      <BarBtn onClick={zoomOut} title="Zoom Out">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M3 7h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </BarBtn>

      <button
        onClick={resetZoom}
        title="Reset zoom"
        style={{
          minWidth: 54,
          height: 28,
          padding: '0 8px',
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 7,
          color: '#C0C0C0',
          fontSize: 12,
          fontFamily: 'inherit',
          fontWeight: 600,
          cursor: 'pointer',
          letterSpacing: '0.3px',
          transition: 'background 0.12s, color 0.12s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255,255,255,0.12)'
          e.currentTarget.style.color = '#F0F0F0'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
          e.currentTarget.style.color = '#C0C0C0'
        }}
      >
        {pct}%
      </button>

      <BarBtn onClick={zoomIn} title="Zoom In">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M7 3v8M3 7h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </BarBtn>

      <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.1)', margin: '0 4px' }} />

      <BarBtn onClick={fitAll} title="Fit all slides">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <rect x="1.5" y="1.5" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="1.3" />
          <rect x="8.5" y="1.5" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="1.3" />
          <rect x="1.5" y="8.5" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="1.3" />
          <rect x="8.5" y="8.5" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="1.3" />
        </svg>
      </BarBtn>
    </div>
  )
}

function BarBtn({
  onClick,
  title,
  children,
}: {
  onClick?: () => void
  title: string
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        width: 28,
        height: 28,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'transparent',
        border: 'none',
        borderRadius: 7,
        color: '#888',
        cursor: 'pointer',
        transition: 'color 0.12s, background 0.12s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = '#E5E5E5'
        e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = '#888'
        e.currentTarget.style.background = 'transparent'
      }}
    >
      {children}
    </button>
  )
}

// ─── Cursor position badge ────────────────────────────────────────────────
function CursorBadge({ x, y }: { x: number; y: number }) {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        zIndex: 7000,
        background: '#141414',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 8,
        padding: '5px 10px',
        display: 'flex',
        gap: 10,
        fontFamily: "'DM Mono', 'Fira Mono', monospace",
        fontSize: 11,
        color: '#555',
        boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
      }}
    >
      <span>X <span style={{ color: '#888' }}>{Math.round(x)}</span></span>
      <span>Y <span style={{ color: '#888' }}>{Math.round(y)}</span></span>
    </div>
  )
}

// ─── Main component ──────────────────────────────────────────────────────────
export default function SlideCanvas() {
  const [editor, setEditor] = useState<Editor | null>(null)
  const [toolbar, setToolbar] = useState<ToolbarState | null>(null)
  const [editorState, setEditorState] = useState<EditorState | null>(null)
  const [groupSlides, setGroupSlides] = useState<GroupSlide[] | null>(null)
  const [showProperties, setShowProperties] = useState<{ shapeId: string; position: { x: number; y: number } } | null>(null)
  const [activeSnap, setActiveSnap] = useState<SnapConnection | null>(null)
  const [snapBounds, setSnapBounds] = useState<{ x: number; y: number; width: number; height: number } | null>(null)
  const [snapGuides, setSnapGuides] = useState<SnapGuide[]>([])
  const [widthMatchGuide, setWidthMatchGuide] = useState<WidthMatchGuide | null>(null)
  const [heightMatchGuide, setHeightMatchGuide] = useState<HeightMatchGuide | null>(null)
  const [zoom, setZoom] = useState(1)
  const [cursor, setCursor] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  
  // New state for resize snapping
  const [resizeSnapGuides, setResizeSnapGuides] = useState<ResizeSnapGuide[]>([])
  const [isResizing, setIsResizing] = useState(false)
  const [resizingEdge, setResizingEdge] = useState<'top' | 'bottom' | 'left' | 'right' | null>(null)
  
  const editorRef = useRef<Editor | null>(null)
  const isDraggingRef = useRef(false)
  const movingShapeIdRef = useRef<TLShapeId | null>(null)
  const originalBoundsRef = useRef<any>(null)
  const resizeStartBoundsRef = useRef<any>(null)

  const computePosition = useCallback((ed: Editor, ids: string[]) => {
    if (!ids.length) return null
    try {
      const bounds = ed.getSelectionPageBounds()
      if (!bounds) return null
      const vp = ed.getViewportScreenBounds()
      const cam = ed.getCamera()
      const z = cam.z
      const screenX = (bounds.x + bounds.w / 2) * z + vp.x + cam.x * z
      const screenY = bounds.y * z + vp.y + cam.y * z
      return { x: screenX, y: screenY }
    } catch {
      return null
    }
  }, [])

  // Check for width/height matching between connected slides
  const checkDimensionMatch = useCallback((movingShapeId: TLShapeId, currentBounds: any) => {
    const ed = editorRef.current
    if (!ed) return

    const allShapes = ed.getCurrentPageShapes()
    const otherShapes = allShapes.filter(s => s.id !== movingShapeId && s.type === 'slide')
    
    let foundWidthMatch = false
    let foundHeightMatch = false
    
    for (const shape of otherShapes) {
      const bounds = ed.getShapePageBounds(shape.id)
      if (!bounds) continue
      
      // Check if shapes are vertically aligned (top/bottom connection)
      const isVerticallyAligned = Math.abs(currentBounds.x - bounds.x) < 10
      const isHorizontallyAligned = Math.abs(currentBounds.y - bounds.y) < 10
      
      // Check width match for vertically aligned slides
      if (isVerticallyAligned && Math.abs(currentBounds.w - bounds.w) < 5 && !foundWidthMatch) {
        setWidthMatchGuide({ show: true, position: bounds.x + bounds.w / 2, width: bounds.w })
        foundWidthMatch = true
      }
      
      // Check height match for horizontally aligned slides
      if (isHorizontallyAligned && Math.abs(currentBounds.h - bounds.h) < 5 && !foundHeightMatch) {
        setHeightMatchGuide({ show: true, position: bounds.y + bounds.h / 2, height: bounds.h })
        foundHeightMatch = true
      }
    }
    
    if (!foundWidthMatch) setWidthMatchGuide(null)
    if (!foundHeightMatch) setHeightMatchGuide(null)
  }, [])

  // New function to detect resize snaps
  const detectResizeSnaps = useCallback((shapeId: TLShapeId, currentBounds: any, edge: 'top' | 'bottom' | 'left' | 'right') => {
    const ed = editorRef.current
    if (!ed) return []

    const allShapes = ed.getCurrentPageShapes()
    const otherShapes = allShapes.filter(s => s.id !== shapeId && s.type === 'slide')
    
    const snapThreshold = 15
    const guides: ResizeSnapGuide[] = []

    for (const shape of otherShapes) {
      const bounds = ed.getShapePageBounds(shape.id)
      if (!bounds) continue

      // Check for edge snapping based on which edge is being resized
      if (edge === 'top') {
        // Snap to other slide's bottom
        const distToBottom = Math.abs(currentBounds.y - (bounds.y + bounds.h))
        if (distToBottom < snapThreshold) {
          guides.push({
            type: 'top',
            position: bounds.y + bounds.h,
            targetShapeId: shape.id as string,
            targetSide: 'bottom',
            distance: distToBottom
          })
        }
        // Snap to other slide's top
        const distToTop = Math.abs(currentBounds.y - bounds.y)
        if (distToTop < snapThreshold) {
          guides.push({
            type: 'top',
            position: bounds.y,
            targetShapeId: shape.id as string,
            targetSide: 'top',
            distance: distToTop
          })
        }
      } else if (edge === 'bottom') {
        // Snap to other slide's top
        const distToTop = Math.abs((currentBounds.y + currentBounds.h) - bounds.y)
        if (distToTop < snapThreshold) {
          guides.push({
            type: 'bottom',
            position: bounds.y,
            targetShapeId: shape.id as string,
            targetSide: 'top',
            distance: distToTop
          })
        }
        // Snap to other slide's bottom
        const distToBottom = Math.abs((currentBounds.y + currentBounds.h) - (bounds.y + bounds.h))
        if (distToBottom < snapThreshold) {
          guides.push({
            type: 'bottom',
            position: bounds.y + bounds.h,
            targetShapeId: shape.id as string,
            targetSide: 'bottom',
            distance: distToBottom
          })
        }
      } else if (edge === 'left') {
        // Snap to other slide's right
        const distToRight = Math.abs(currentBounds.x - (bounds.x + bounds.w))
        if (distToRight < snapThreshold) {
          guides.push({
            type: 'left',
            position: bounds.x + bounds.w,
            targetShapeId: shape.id as string,
            targetSide: 'right',
            distance: distToRight
          })
        }
        // Snap to other slide's left
        const distToLeft = Math.abs(currentBounds.x - bounds.x)
        if (distToLeft < snapThreshold) {
          guides.push({
            type: 'left',
            position: bounds.x,
            targetShapeId: shape.id as string,
            targetSide: 'left',
            distance: distToLeft
          })
        }
      } else if (edge === 'right') {
        // Snap to other slide's left
        const distToLeft = Math.abs((currentBounds.x + currentBounds.w) - bounds.x)
        if (distToLeft < snapThreshold) {
          guides.push({
            type: 'right',
            position: bounds.x,
            targetShapeId: shape.id as string,
            targetSide: 'left',
            distance: distToLeft
          })
        }
        // Snap to other slide's right
        const distToRight = Math.abs((currentBounds.x + currentBounds.w) - (bounds.x + bounds.w))
        if (distToRight < snapThreshold) {
          guides.push({
            type: 'right',
            position: bounds.x + bounds.w,
            targetShapeId: shape.id as string,
            targetSide: 'right',
            distance: distToRight
          })
        }
      }
    }

    // Find the closest guide
    const bestGuide = guides.reduce((best, current) => {
      if (!best) return current
      return current.distance < best.distance ? current : best
    }, null as ResizeSnapGuide | null)

    return bestGuide ? [bestGuide] : []
  }, [])

  // Enhanced snap detection with alignment guides
  const detectSnaps = useCallback((movingShapeId: TLShapeId, currentBounds: any) => {
    const ed = editorRef.current
    if (!ed) return { connection: null, guides: [] }

    const allShapes = ed.getCurrentPageShapes()
    const otherShapes = allShapes.filter(s => s.id !== movingShapeId && s.type === 'slide')
    
    const snapThreshold = 15
    const guides: SnapGuide[] = []
    let bestConnection: SnapConnection | null = null
    let minDistance = snapThreshold

    for (const shape of otherShapes) {
      const bounds = ed.getShapePageBounds(shape.id)
      if (!bounds) continue
      
      const edges = {
        top: { myEdge: currentBounds.y, theirEdge: bounds.y },
        bottom: { myEdge: currentBounds.y + currentBounds.h, theirEdge: bounds.y + bounds.h },
        left: { myEdge: currentBounds.x, theirEdge: bounds.x },
        right: { myEdge: currentBounds.x + currentBounds.w, theirEdge: bounds.x + bounds.w },
        centerX: { myEdge: currentBounds.x + currentBounds.w / 2, theirEdge: bounds.x + bounds.w / 2 },
        centerY: { myEdge: currentBounds.y + currentBounds.h / 2, theirEdge: bounds.y + bounds.h / 2 }
      }

      // Top to bottom connection
      const topToBottomDist = Math.abs(currentBounds.y - (bounds.y + bounds.h))
      if (topToBottomDist < minDistance) {
        minDistance = topToBottomDist
        bestConnection = {
          shapeId: movingShapeId as string,
          side: 'top',
          targetShapeId: shape.id as string,
          targetSide: 'bottom',
          snapX: currentBounds.x,
          snapY: bounds.y + bounds.h
        }
        guides.push({ type: 'horizontal', position: bounds.y + bounds.h, distance: topToBottomDist })
      }
      
      // Bottom to top connection
      const bottomToTopDist = Math.abs((currentBounds.y + currentBounds.h) - bounds.y)
      if (bottomToTopDist < minDistance) {
        minDistance = bottomToTopDist
        bestConnection = {
          shapeId: movingShapeId as string,
          side: 'bottom',
          targetShapeId: shape.id as string,
          targetSide: 'top',
          snapX: currentBounds.x,
          snapY: bounds.y - currentBounds.h
        }
        guides.push({ type: 'horizontal', position: bounds.y, distance: bottomToTopDist })
      }
      
      // Left to right connection
      const leftToRightDist = Math.abs(currentBounds.x - (bounds.x + bounds.w))
      if (leftToRightDist < minDistance) {
        minDistance = leftToRightDist
        bestConnection = {
          shapeId: movingShapeId as string,
          side: 'left',
          targetShapeId: shape.id as string,
          targetSide: 'right',
          snapX: bounds.x + bounds.w,
          snapY: currentBounds.y
        }
        guides.push({ type: 'vertical', position: bounds.x + bounds.w, distance: leftToRightDist })
      }
      
      // Right to left connection
      const rightToLeftDist = Math.abs((currentBounds.x + currentBounds.w) - bounds.x)
      if (rightToLeftDist < minDistance) {
        minDistance = rightToLeftDist
        bestConnection = {
          shapeId: movingShapeId as string,
          side: 'right',
          targetShapeId: shape.id as string,
          targetSide: 'left',
          snapX: bounds.x - currentBounds.w,
          snapY: currentBounds.y
        }
        guides.push({ type: 'vertical', position: bounds.x, distance: rightToLeftDist })
      }

      // Add alignment guides
      if (Math.abs(edges.top.myEdge - edges.top.theirEdge) < snapThreshold) {
        guides.push({ type: 'horizontal', position: bounds.y, distance: Math.abs(edges.top.myEdge - edges.top.theirEdge) })
      }
      if (Math.abs(edges.bottom.myEdge - edges.bottom.theirEdge) < snapThreshold) {
        guides.push({ type: 'horizontal', position: bounds.y + bounds.h, distance: Math.abs(edges.bottom.myEdge - edges.bottom.theirEdge) })
      }
      if (Math.abs(edges.left.myEdge - edges.left.theirEdge) < snapThreshold) {
        guides.push({ type: 'vertical', position: bounds.x, distance: Math.abs(edges.left.myEdge - edges.left.theirEdge) })
      }
      if (Math.abs(edges.right.myEdge - edges.right.theirEdge) < snapThreshold) {
        guides.push({ type: 'vertical', position: bounds.x + bounds.w, distance: Math.abs(edges.right.myEdge - edges.right.theirEdge) })
      }
      if (Math.abs(edges.centerX.myEdge - edges.centerX.theirEdge) < snapThreshold) {
        guides.push({ type: 'vertical', position: bounds.x + bounds.w / 2, distance: Math.abs(edges.centerX.myEdge - edges.centerX.theirEdge) })
      }
      if (Math.abs(edges.centerY.myEdge - edges.centerY.theirEdge) < snapThreshold) {
        guides.push({ type: 'horizontal', position: bounds.y + bounds.h / 2, distance: Math.abs(edges.centerY.myEdge - edges.centerY.theirEdge) })
      }
    }
    
    const uniqueGuides = guides.filter((guide, index, self) => 
      index === self.findIndex(g => g.type === guide.type && Math.abs(g.position - guide.position) < 2)
    )
    
    return { connection: bestConnection, guides: uniqueGuides }
  }, [])

  const updateSelection = useCallback((ed: Editor) => {
    const ids = ed.getSelectedShapeIds()
    const slideIds = ids.filter((id) => {
      const s = ed.getShape(id)
      return s?.type === 'slide'
    }) as string[]
    
    if (slideIds.length === 1) {
      const pos = computePosition(ed, slideIds)
      if (pos) {
        setShowProperties({ shapeId: slideIds[0], position: pos })
        setToolbar({ type: 'single', shapeIds: slideIds, position: pos })
      }
    } else if (slideIds.length > 1) {
      const pos = computePosition(ed, slideIds)
      if (pos) {
        setToolbar({ type: 'multi', shapeIds: slideIds, position: pos })
      }
      setShowProperties(null)
    } else {
      setToolbar(null)
      setShowProperties(null)
    }
  }, [computePosition])

  // Function to handle pointer move for resize detection
  const handlePointerMove = useCallback((event: any) => {
    const ed = editorRef.current
    if (!ed) return
    
    // Check if we're in resize mode by looking at the current tool state
    const currentTool = ed.getCurrentToolId()
    
    // Detect if we're resizing (when using select tool and a shape is selected)
    if (currentTool === 'select' && !isResizing) {
      // Check if any shape is being resized by looking at the selection bounds
      const selectedShapes = ed.getSelectedShapes()
      if (selectedShapes.length === 1) {
        // This is a workaround - we need to detect if the user is dragging a resize handle
        // Since tldraw doesn't provide direct resize events, we'll check if the shape's bounds have changed significantly
        const shape = selectedShapes[0]
        const currentBounds = ed.getShapePageBounds(shape.id)
        
        if (currentBounds && resizeStartBoundsRef.current) {
          const boundsChanged = 
            Math.abs(currentBounds.w - resizeStartBoundsRef.current.w) > 1 ||
            Math.abs(currentBounds.h - resizeStartBoundsRef.current.h) > 1
            
          if (boundsChanged && !isResizing) {
            // Detect which edge is being resized
            const widthDiff = currentBounds.w - resizeStartBoundsRef.current.w
            const heightDiff = currentBounds.h - resizeStartBoundsRef.current.h
            
            let edge: 'top' | 'bottom' | 'left' | 'right' | null = null
            
            if (Math.abs(widthDiff) > Math.abs(heightDiff)) {
              if (Math.abs(currentBounds.x - resizeStartBoundsRef.current.x) > 0.1) {
                edge = 'left'
              } else if (Math.abs(currentBounds.x + currentBounds.w - (resizeStartBoundsRef.current.x + resizeStartBoundsRef.current.w)) > 0.1) {
                edge = 'right'
              }
            } else {
              if (Math.abs(currentBounds.y - resizeStartBoundsRef.current.y) > 0.1) {
                edge = 'top'
              } else if (Math.abs(currentBounds.y + currentBounds.h - (resizeStartBoundsRef.current.y + resizeStartBoundsRef.current.h)) > 0.1) {
                edge = 'bottom'
              }
            }
            
            if (edge) {
              setIsResizing(true)
              setResizingEdge(edge)
              movingShapeIdRef.current = shape.id
              
              // Detect resize snaps
              const guides = detectResizeSnaps(shape.id, currentBounds, edge)
              setResizeSnapGuides(guides)
              
              // Apply magnetic snap if needed
              if (guides.length > 0) {
                const bestGuide = guides[0]
                let newBounds = { ...currentBounds }
                
                switch (edge) {
                  case 'top':
                    const newY = bestGuide.position
                    const newHeight = resizeStartBoundsRef.current.y + resizeStartBoundsRef.current.h - newY
                    if (Math.abs(newHeight - currentBounds.h) < 15) {
                      newBounds.y = newY
                      newBounds.h = newHeight
                    }
                    break
                  case 'bottom':
                    const newBottom = bestGuide.position
                    const newBottomHeight = newBottom - currentBounds.y
                    if (Math.abs(newBottomHeight - currentBounds.h) < 15) {
                      newBounds.h = newBottomHeight
                    }
                    break
                  case 'left':
                    const newX = bestGuide.position
                    const newWidth = resizeStartBoundsRef.current.x + resizeStartBoundsRef.current.w - newX
                    if (Math.abs(newWidth - currentBounds.w) < 15) {
                      newBounds.x = newX
                      newBounds.w = newWidth
                    }
                    break
                  case 'right':
                    const newRight = bestGuide.position
                    const newRightWidth = newRight - currentBounds.x
                    if (Math.abs(newRightWidth - currentBounds.w) < 15) {
                      newBounds.w = newRightWidth
                    }
                    break
                }
                
                if (newBounds !== currentBounds) {
                  ed.updateShape({
                    id: shape.id,
                    type: 'slide',
                    x: newBounds.x,
                    y: newBounds.y,
                    props: {
                      ...(shape as any).props,
                      w: newBounds.w,
                      h: newBounds.h
                    }
                  })
                }
              }
            }
          }
        }
      }
    }
  }, [isResizing, detectResizeSnaps])

  const handleMount = useCallback((ed: Editor) => {
    setEditor(ed)
    editorRef.current = ed
    ed.updateInstanceState({ isDebugMode: false })

    const syncZoom = () => setZoom(ed.getCamera().z)
    ed.store.listen(syncZoom)

    ed.on('event', (event: any) => {
      if (event.point) {
        const pagePoint = ed.screenToPage(event.point)
        setCursor({ x: pagePoint.x, y: pagePoint.y })
      }
    })

    let originalBounds: any = null
    let originalPositionRef: { x: number; y: number } | null = null
    
    ed.on('event', (event: any) => {
      if (event.name === 'pointer_down') {
        const selectedShapes = ed.getSelectedShapes()
        if (selectedShapes.length === 1) {
          isDraggingRef.current = true
          movingShapeIdRef.current = selectedShapes[0].id
          const bounds = ed.getShapePageBounds(selectedShapes[0].id)
          if (bounds) {
            originalBounds = { ...bounds }
            originalPositionRef = { x: bounds.x, y: bounds.y }
            // Store initial bounds for resize detection
            resizeStartBoundsRef.current = { ...bounds }
          }
        }
      }
      
      if (event.name === 'pointer_move' && isDraggingRef.current && movingShapeIdRef.current) {
        const currentBounds = ed.getShapePageBounds(movingShapeIdRef.current)
        
        if (currentBounds && originalBounds) {
          // Check if this is a resize operation (bounds changed significantly but position might not have)
          const isResizeOperation = 
            Math.abs(currentBounds.w - originalBounds.w) > 1 || 
            Math.abs(currentBounds.h - originalBounds.h) > 1
            
          if (isResizeOperation && !isResizing) {
            // Detect which edge is being resized
            const widthDiff = currentBounds.w - originalBounds.w
            const heightDiff = currentBounds.h - originalBounds.h
            
            let edge: 'top' | 'bottom' | 'left' | 'right' | null = null
            
            if (Math.abs(widthDiff) > Math.abs(heightDiff)) {
              if (Math.abs(currentBounds.x - originalBounds.x) > 0.1) {
                edge = 'left'
              } else if (Math.abs(currentBounds.x + currentBounds.w - (originalBounds.x + originalBounds.w)) > 0.1) {
                edge = 'right'
              }
            } else {
              if (Math.abs(currentBounds.y - originalBounds.y) > 0.1) {
                edge = 'top'
              } else if (Math.abs(currentBounds.y + currentBounds.h - (originalBounds.y + originalBounds.h)) > 0.1) {
                edge = 'bottom'
              }
            }
            
            if (edge) {
              setIsResizing(true)
              setResizingEdge(edge)
              
              // Detect resize snaps
              const guides = detectResizeSnaps(movingShapeIdRef.current, currentBounds, edge)
              setResizeSnapGuides(guides)
              
              // Apply magnetic snap
              if (guides.length > 0) {
                const bestGuide = guides[0]
                let newBounds = { ...currentBounds }
                
                switch (edge) {
                  case 'top':
                    const newY = bestGuide.position
                    const newHeight = originalBounds.y + originalBounds.h - newY
                    if (Math.abs(newHeight - currentBounds.h) < 15) {
                      newBounds.y = newY
                      newBounds.h = newHeight
                    }
                    break
                  case 'bottom':
                    const newBottom = bestGuide.position
                    const newBottomHeight = newBottom - currentBounds.y
                    if (Math.abs(newBottomHeight - currentBounds.h) < 15) {
                      newBounds.h = newBottomHeight
                    }
                    break
                  case 'left':
                    const newX = bestGuide.position
                    const newWidth = originalBounds.x + originalBounds.w - newX
                    if (Math.abs(newWidth - currentBounds.w) < 15) {
                      newBounds.x = newX
                      newBounds.w = newWidth
                    }
                    break
                  case 'right':
                    const newRight = bestGuide.position
                    const newRightWidth = newRight - currentBounds.x
                    if (Math.abs(newRightWidth - currentBounds.w) < 15) {
                      newBounds.w = newRightWidth
                    }
                    break
                }
                
                ed.updateShape({
                  id: movingShapeIdRef.current,
                  type: 'slide',
                  x: newBounds.x,
                  y: newBounds.y,
                  props: {
                    ...(ed.getShape(movingShapeIdRef.current) as any).props,
                    w: newBounds.w,
                    h: newBounds.h
                  }
                })
              }
            }
          } else if (!isResizeOperation) {
            // Regular drag operation
            const { connection, guides } = detectSnaps(movingShapeIdRef.current, currentBounds)
            setSnapGuides(guides)
            
            // Check for width/height matching
            checkDimensionMatch(movingShapeIdRef.current, currentBounds)
            
            if (connection && (connection.snapX !== undefined || connection.snapY !== undefined)) {
              setActiveSnap(connection)
              
              setSnapBounds({
                x: connection.snapX ?? currentBounds.x,
                y: connection.snapY ?? currentBounds.y,
                width: currentBounds.w,
                height: currentBounds.h,
              })
              
              let newX = currentBounds.x
              let newY = currentBounds.y
              
              if (connection.snapX !== undefined) {
                const diff = Math.abs(currentBounds.x - connection.snapX)
                if (diff < 15) {
                  newX = connection.snapX
                } else {
                  newX = currentBounds.x + (connection.snapX - currentBounds.x) * 0.3
                }
              }
              if (connection.snapY !== undefined) {
                const diff = Math.abs(currentBounds.y - connection.snapY)
                if (diff < 15) {
                  newY = connection.snapY
                } else {
                  newY = currentBounds.y + (connection.snapY - currentBounds.y) * 0.3
                }
              }
              
              ed.updateShape({ 
                id: movingShapeIdRef.current, 
                type: 'slide', 
                x: newX, 
                y: newY 
              })
            } else {
              setActiveSnap(null)
              setSnapBounds(null)
            }
          }
        }
      }
      
      if (event.name === 'pointer_up') {
        // Handle connection saving for drag operations
        if (activeSnap && movingShapeIdRef.current && originalPositionRef && !isResizing) {
          const movingShape = ed.getShape(movingShapeIdRef.current)
          if (movingShape) {
            const currentProps = (movingShape as any).props
            const connectionProp = `connection${activeSnap.side.charAt(0).toUpperCase() + activeSnap.side.slice(1)}`
            
            ed.updateShape({ 
              id: movingShapeIdRef.current, 
              type: 'slide', 
              props: { 
                ...currentProps, 
                [connectionProp]: activeSnap.targetShapeId, 
                connectedTo: [...(currentProps.connectedTo || []), activeSnap.targetShapeId] 
              } 
            })
            
            const targetShape = ed.getShape(activeSnap.targetShapeId as TLShapeId)
            if (targetShape) {
              const targetProps = (targetShape as any).props
              const targetConnectionProp = `connection${activeSnap.targetSide.charAt(0).toUpperCase() + activeSnap.targetSide.slice(1)}`
              
              ed.updateShape({ 
                id: activeSnap.targetShapeId as TLShapeId, 
                type: 'slide', 
                props: { 
                  ...targetProps, 
                  [targetConnectionProp]: movingShapeIdRef.current, 
                  connectedTo: [...(targetProps.connectedTo || []), movingShapeIdRef.current] 
                } 
              })
            }
          }
        }
        
        // Reset all states
        isDraggingRef.current = false
        setIsResizing(false)
        setResizingEdge(null)
        setActiveSnap(null)
        setSnapBounds(null)
        setSnapGuides([])
        setResizeSnapGuides([])
        setWidthMatchGuide(null)
        setHeightMatchGuide(null)
        movingShapeIdRef.current = null
        originalBounds = null
        originalPositionRef = null
        resizeStartBoundsRef.current = null
      }
    })

    // Add pointer move listener for continuous resize detection
    ed.on('event', (event: any) => {
      if (event.name === 'pointer_move') {
        handlePointerMove(event)
      }
    })

    ed.store.listen(() => updateSelection(ed))
  }, [updateSelection, detectSnaps, checkDimensionMatch, activeSnap, detectResizeSnaps, isResizing, handlePointerMove])

  const openEditor = useCallback((shapeId: string) => {
    const ed = editorRef.current
    if (!ed) return
    const shape = ed.getShape(shapeId as TLShapeId)
    if (!shape || shape.type !== 'slide') return
    const props = (shape as any).props
    setEditorState({ shapeId, html: props.html, title: props.title })
  }, [])

  const openGroup = useCallback(() => {
    const ed = editorRef.current
    if (!ed || !toolbar) return
    const slides: GroupSlide[] = toolbar.shapeIds.flatMap((id) => {
      const s = ed.getShape(id as TLShapeId)
      if (!s || s.type !== 'slide') return []
      const p = (s as any).props
      return [{ id, html: p.html, title: p.title, w: p.w, h: p.h }]
    })
    setGroupSlides(slides)
  }, [toolbar])

  const components = {
    Toolbar: null, StylePanel: null, NavigationPanel: null,
    HelpMenu: null, MenuPanel: null, ContextMenu: null,
    DebugPanel: null, DebugMenu: null, SharePanel: null,
    CursorChatBubble: null,
  } as any

  return (
    <>
      <style>{`
        .tl-background {
          background-color: #161616 !important;
          background-image: radial-gradient(circle, #2e2e2e 1px, transparent 1px) !important;
          background-size: 24px 24px !important;
        }
        .tl-watermark_SEE-LICENSE { display: none !important; }
        .tl-selection-foreground {
          stroke: #6366F1 !important;
          stroke-width: 1.5px !important;
        }
        .tl-selection-background {
          fill: rgba(99,102,241,0.06) !important;
        }
        .tl-snap-line { stroke: #6366F1 !important; }
      `}</style>

      <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', background: '#161616' }}>
        <Header editor={editor} />

        <div style={{ position: 'absolute', inset: 0 }}>
          <Tldraw
            shapeUtils={customShapeUtils}
            onMount={handleMount}
            components={components}
            persistenceKey="slide-canvas-v1"
            hideUi
          />
        </div>

        {/* Resize Snapping Guides - Dotted lines */}
        {resizeSnapGuides.map((guide, i) => (
          <div
            key={`resize-${i}`}
            style={{
              position: 'fixed',
              ...(guide.type === 'top' || guide.type === 'bottom'
                ? {
                    top: guide.position,
                    left: 0,
                    right: 0,
                    height: 2,
                    background: 'repeating-linear-gradient(90deg, #6366F1, #6366F1 8px, transparent 8px, transparent 16px)',
                  }
                : {
                    left: guide.position,
                    top: 0,
                    bottom: 0,
                    width: 2,
                    background: 'repeating-linear-gradient(180deg, #6366F1, #6366F1 8px, transparent 8px, transparent 16px)',
                  }
              ),
              pointerEvents: 'none',
              zIndex: 9999,
              boxShadow: '0 0 0 1px rgba(99, 102, 241, 0.2)',
              animation: 'fadeIn 0.2s ease-out',
            }}
          >
            {/* Direction indicator */}
            {(guide.type === 'top' || guide.type === 'bottom') && (
              <div
                style={{
                  position: 'absolute',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  top: guide.type === 'top' ? -12 : 4,
                  background: '#6366F1',
                  color: 'white',
                  padding: '2px 8px',
                  borderRadius: 4,
                  fontSize: 11,
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                }}
              >
                {guide.type === 'top' ? '⬆️ Align Top Edge' : '⬇️ Align Bottom Edge'}
              </div>
            )}
            {(guide.type === 'left' || guide.type === 'right') && (
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  left: guide.type === 'left' ? -70 : 6,
                  background: '#6366F1',
                  color: 'white',
                  padding: '2px 8px',
                  borderRadius: 4,
                  fontSize: 11,
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                }}
              >
                {guide.type === 'left' ? '⬅️ Align Left Edge' : '➡️ Align Right Edge'}
              </div>
            )}
          </div>
        ))}

        {/* Smart Guides for movement */}
        {snapGuides.map((guide, i) => (
          <div
            key={i}
            style={{
              position: 'fixed',
              ...(guide.type === 'vertical' 
                ? {
                    left: guide.position,
                    top: 0,
                    bottom: 0,
                    width: 1,
                  }
                : {
                    top: guide.position,
                    left: 0,
                    right: 0,
                    height: 1,
                  }
              ),
              background: '#6366F1',
              pointerEvents: 'none',
              zIndex: 9998,
              boxShadow: '0 0 0 1px rgba(99, 102, 241, 0.3)',
            }}
          />
        ))}

        {/* Width Matching Guide */}
        {widthMatchGuide && (
          <div
            style={{
              position: 'fixed',
              left: widthMatchGuide.position - widthMatchGuide.width / 2,
              top: 0,
              width: widthMatchGuide.width,
              height: '100%',
              borderLeft: '2px dashed #10B981',
              borderRight: '2px dashed #10B981',
              pointerEvents: 'none',
              zIndex: 9997,
              opacity: 0.6,
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                background: '#10B981',
                color: 'white',
                padding: '2px 8px',
                borderRadius: 4,
                fontSize: 10,
                fontWeight: 600,
                whiteSpace: 'nowrap',
              }}
            >
              Width: {Math.round(widthMatchGuide.width)}px
            </div>
          </div>
        )}

        {/* Height Matching Guide */}
        {heightMatchGuide && (
          <div
            style={{
              position: 'fixed',
              top: heightMatchGuide.position - heightMatchGuide.height / 2,
              left: 0,
              height: heightMatchGuide.height,
              width: '100%',
              borderTop: '2px dashed #10B981',
              borderBottom: '2px dashed #10B981',
              pointerEvents: 'none',
              zIndex: 9997,
              opacity: 0.6,
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                background: '#10B981',
                color: 'white',
                padding: '2px 8px',
                borderRadius: 4,
                fontSize: 10,
                fontWeight: 600,
                whiteSpace: 'nowrap',
              }}
            >
              Height: {Math.round(heightMatchGuide.height)}px
            </div>
          </div>
        )}

        {/* Snap preview ghost */}
        {snapBounds && (
          <div
            style={{
              position: 'fixed',
              left: snapBounds.x,
              top: snapBounds.y,
              width: snapBounds.width,
              height: snapBounds.height,
              background: 'rgba(99,102,241,0.08)',
              border: '1.5px dashed #6366F1',
              pointerEvents: 'none',
              zIndex: 9997,
            }}
          />
        )}

        {/* Properties panel */}
        {showProperties && editor && (
          <PropertiesPanel
            editor={editor}
            shapeId={showProperties.shapeId as TLShapeId}
            position={showProperties.position}
            onClose={() => setShowProperties(null)}
          />
        )}

        {/* Single slide toolbar */}
        {toolbar?.type === 'single' && !editorState && !groupSlides && (
          <SlideToolbar
            editor={editor!}
            shapeId={toolbar.shapeIds[0]}
            position={toolbar.position}
            onEdit={() => openEditor(toolbar.shapeIds[0])}
            onClose={() => setToolbar(null)}
          />
        )}

        {/* Multi-select toolbar */}
        {toolbar?.type === 'multi' && !editorState && !groupSlides && (
          <MultiSelectToolbar
            editor={editor!}
            shapeIds={toolbar.shapeIds}
            position={toolbar.position}
            onGroup={openGroup}
            onClose={() => setToolbar(null)}
          />
        )}

        {/* HTML editor panel */}
        {editorState && editor && (
          <HtmlEditor
            editor={editor}
            shapeId={editorState.shapeId}
            initialHtml={editorState.html}
            title={editorState.title}
            onClose={() => setEditorState(null)}
          />
        )}

        {/* Slide group modal */}
        {groupSlides && editor && (
          <SlideGroup 
            slides={groupSlides} 
            editor={editor}
            onClose={() => setGroupSlides(null)} 
          />
        )}

        <BottomBar editor={editor} zoom={zoom} />
        <CursorBadge x={cursor.x} y={cursor.y} />
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </>
  )
}