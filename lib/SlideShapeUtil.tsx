// lib/SlideShapeUtil.tsx
'use client'

import {
  BaseBoxShapeUtil,
  HTMLContainer,
  RecordProps,
  T,
  TLBaseShape,
  useEditor,
  useIsEditing,
} from 'tldraw'
import { useState, useCallback } from 'react'

export type SlideShape = TLBaseShape<
  'slide',
  {
    w: number
    h: number
    html: string
    title: string
    isEditing?: boolean
    connectedTo?: string[]
    connectionTop?: string
    connectionBottom?: string
    connectionLeft?: string
    connectionRight?: string
  }
>

export class SlideShapeUtil extends BaseBoxShapeUtil<SlideShape> {
  static override type = 'slide' as const

  static override props: RecordProps<SlideShape> = {
    w: T.number,
    h: T.number,
    html: T.string,
    title: T.string,
    isEditing: T.optional(T.boolean),
    connectedTo: T.optional(T.arrayOf(T.string)),
    connectionTop: T.optional(T.string),
    connectionBottom: T.optional(T.string),
    connectionLeft: T.optional(T.string),
    connectionRight: T.optional(T.string),
  }

  override getDefaultProps(): SlideShape['props'] {
    return {
      w: 1427,  // Changed from 640 to 1427 (standard desktop width)
      h: 932,   // Changed from 400 to 932 (standard desktop height)
      html: '',
      title: 'Untitled Slide',
      isEditing: false,
      connectedTo: [],
      connectionTop: undefined,
      connectionBottom: undefined,
      connectionLeft: undefined,
      connectionRight: undefined,
    }
  }

  override canEdit() { return true }
  override canResize() { return true }

  override component(shape: SlideShape) {
    const editor = useEditor()
    const isEditing = useIsEditing(shape.id)
    const [hovered, setHovered] = useState(false)
    const [showConnectionPoints, setShowConnectionPoints] = useState(false)
    const [showConnectionLines, setShowConnectionLines] = useState(false)

    const handleDoubleClick = useCallback(() => {
      editor.setEditingShape(shape.id)
    }, [editor, shape.id])

    const { w, h, html, title, connectionTop, connectionBottom, connectionLeft, connectionRight } = shape.props

    const doc = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<script src="https://cdn.tailwindcss.com"></script>
<style>
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
  html, body {
    width: 100%;
    height: 100%;
    overflow: hidden;
    background: transparent;
  }
  body {
    font-family: system-ui, -apple-system, 'Inter', sans-serif;
  }
  
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  ::-webkit-scrollbar-track {
    background: rgba(0,0,0,0.05);
    border-radius: 4px;
  }
  ::-webkit-scrollbar-thumb {
    background: rgba(0,0,0,0.2);
    border-radius: 4px;
  }
  ::-webkit-scrollbar-thumb:hover {
    background: rgba(0,0,0,0.3);
  }
</style>
</head>
<body>${html}</body>
</html>`

    const activeConnections = [
      connectionTop, connectionBottom, connectionLeft, connectionRight
    ].filter(c => c).length

    return (
      <HTMLContainer
        id={shape.id}
        style={{
          width: w,
          height: h,
          pointerEvents: isEditing ? 'auto' : 'none',
          overflow: 'hidden',
          borderRadius: 0,
          boxShadow: hovered && !isEditing 
            ? '0 4px 12px rgba(0, 0, 0, 0.15), 0 0 0 2px #6366F1' 
            : '0 1px 3px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0, 0, 0, 0.05)',
          transition: 'box-shadow 0.2s ease',
          cursor: isEditing ? 'default' : 'pointer',
          position: 'relative',
          background: '#ffffff',
        }}
        onMouseEnter={() => {
          setHovered(true)
          setShowConnectionPoints(true)
          setShowConnectionLines(true)
        }}
        onMouseLeave={() => {
          setHovered(false)
          setShowConnectionPoints(false)
          setShowConnectionLines(false)
        }}
        onDoubleClick={handleDoubleClick}
      >
        {/* Connection Points - Figma Style */}
        {showConnectionPoints && !isEditing && (
          <>
            {/* Top connection point */}
            <div
              style={{
                position: 'absolute',
                top: -6,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 12,
                height: 12,
                background: connectionTop ? '#10B981' : '#6366F1',
                borderRadius: '50%',
                cursor: 'pointer',
                zIndex: 20,
                boxShadow: '0 0 0 2px white, 0 0 0 4px rgba(99, 102, 241, 0.3)',
                transition: 'all 0.1s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateX(-50%) scale(1.2)'
                e.currentTarget.style.background = connectionTop ? '#059669' : '#4F46E5'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateX(-50%) scale(1)'
                e.currentTarget.style.background = connectionTop ? '#10B981' : '#6366F1'
              }}
            />
            
            {/* Bottom connection point */}
            <div
              style={{
                position: 'absolute',
                bottom: -6,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 12,
                height: 12,
                background: connectionBottom ? '#10B981' : '#6366F1',
                borderRadius: '50%',
                cursor: 'pointer',
                zIndex: 20,
                boxShadow: '0 0 0 2px white, 0 0 0 4px rgba(99, 102, 241, 0.3)',
                transition: 'all 0.1s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateX(-50%) scale(1.2)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateX(-50%) scale(1)'
              }}
            />
            
            {/* Left connection point */}
            <div
              style={{
                position: 'absolute',
                left: -6,
                top: '50%',
                transform: 'translateY(-50%)',
                width: 12,
                height: 12,
                background: connectionLeft ? '#10B981' : '#6366F1',
                borderRadius: '50%',
                cursor: 'pointer',
                zIndex: 20,
                boxShadow: '0 0 0 2px white, 0 0 0 4px rgba(99, 102, 241, 0.3)',
                transition: 'all 0.1s ease',
              }}
            />
            
            {/* Right connection point */}
            <div
              style={{
                position: 'absolute',
                right: -6,
                top: '50%',
                transform: 'translateY(-50%)',
                width: 12,
                height: 12,
                background: connectionRight ? '#10B981' : '#6366F1',
                borderRadius: '50%',
                cursor: 'pointer',
                zIndex: 20,
                boxShadow: '0 0 0 2px white, 0 0 0 4px rgba(99, 102, 241, 0.3)',
                transition: 'all 0.1s ease',
              }}
            />
          </>
        )}
        
        {/* Connection Lines & Matching Corner Indicators */}
        {showConnectionLines && activeConnections > 0 && !isEditing && (
          <svg
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
              zIndex: 15,
            }}
          >
            {/* Connection lines with arrows */}
            {connectionTop && (
              <>
                <line
                  x1="50%"
                  y1="0"
                  x2="50%"
                  y2="-30"
                  stroke="#10B981"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                />
                <polygon
                  points="-4,-30 0,-38 4,-30"
                  fill="#10B981"
                  transform="translate(50%, -30)"
                  style={{ transformOrigin: 'center' }}
                />
              </>
            )}
            {connectionBottom && (
              <>
                <line
                  x1="50%"
                  y1="100%"
                  x2="50%"
                  y2="calc(100% + 30px)"
                  stroke="#10B981"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                />
                <polygon
                  points="-4,30 0,38 4,30"
                  fill="#10B981"
                  transform="translate(50%, calc(100% + 30px))"
                  style={{ transformOrigin: 'center' }}
                />
              </>
            )}
            {connectionLeft && (
              <>
                <line
                  x1="0"
                  y1="50%"
                  x2="-30"
                  y2="50%"
                  stroke="#10B981"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                />
                <polygon
                  points="-30,-4 -38,0 -30,4"
                  fill="#10B981"
                  transform="translate(-30, 50%)"
                  style={{ transformOrigin: 'center' }}
                />
              </>
            )}
            {connectionRight && (
              <>
                <line
                  x1="100%"
                  y1="50%"
                  x2="calc(100% + 30px)"
                  y2="50%"
                  stroke="#10B981"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                />
                <polygon
                  points="30,-4 38,0 30,4"
                  fill="#10B981"
                  transform="translate(calc(100% + 30px), 50%)"
                  style={{ transformOrigin: 'center' }}
                />
              </>
            )}
          </svg>
        )}

        {/* Matching Corner Indicators */}
        {activeConnections > 0 && !isEditing && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              pointerEvents: 'none',
              zIndex: 14,
            }}
          >
            {/* Corner markers for connected edges */}
            {connectionTop && (
              <div
                style={{
                  position: 'absolute',
                  top: -4,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 16,
                  height: 16,
                  borderTop: '3px solid #10B981',
                  borderLeft: '3px solid #10B981',
                  borderRight: '3px solid #10B981',
                  borderRadius: '2px 2px 0 0',
                }}
              />
            )}
            {connectionBottom && (
              <div
                style={{
                  position: 'absolute',
                  bottom: -4,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 16,
                  height: 16,
                  borderBottom: '3px solid #10B981',
                  borderLeft: '3px solid #10B981',
                  borderRight: '3px solid #10B981',
                  borderRadius: '0 0 2px 2px',
                }}
              />
            )}
            {connectionLeft && (
              <div
                style={{
                  position: 'absolute',
                  left: -4,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 16,
                  height: 16,
                  borderLeft: '3px solid #10B981',
                  borderTop: '3px solid #10B981',
                  borderBottom: '3px solid #10B981',
                  borderRadius: '2px 0 0 2px',
                }}
              />
            )}
            {connectionRight && (
              <div
                style={{
                  position: 'absolute',
                  right: -4,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 16,
                  height: 16,
                  borderRight: '3px solid #10B981',
                  borderTop: '3px solid #10B981',
                  borderBottom: '3px solid #10B981',
                  borderRadius: '0 2px 2px 0',
                }}
              />
            )}
          </div>
        )}
        
        {html ? (
          <iframe
            srcDoc={doc}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              display: 'block',
              background: '#ffffff',
            }}
            sandbox="allow-scripts allow-same-origin allow-popups"
            title={title}
          />
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              background: '#F8F7F4',
              border: hovered ? '1px solid #6366F1' : '1px solid #E5E5E5',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
              color: '#A09890',
              fontFamily: 'system-ui, sans-serif',
              transition: 'all 0.2s ease',
              cursor: 'pointer',
              position: 'relative',
              overflow: 'hidden',
            }}
            onDoubleClick={handleDoubleClick}
          >
            <svg
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                opacity: 0.05,
              }}
            >
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5"/>
              </pattern>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
            
            <div
              style={{
                background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
                borderRadius: 20,
                padding: 12,
                color: 'white',
                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
              }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M9 9h6M9 12h6M9 15h4" />
              </svg>
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: '#6366F1' }}>
                {title}
              </span>
              <br />
              <span style={{ fontSize: 12, opacity: 0.7 }}>
                Double-click to edit HTML
              </span>
            </div>
            
            <div
              style={{
                fontSize: 10,
                color: '#B8B2A8',
                display: 'flex',
                gap: 16,
                marginTop: 8,
              }}
            >
              <span>🎨 Tailwind CSS</span>
              <span>✨ Live Preview</span>
              <span>📱 Responsive</span>
            </div>
            
            {/* Connection info for empty slides */}
            {activeConnections > 0 && (
              <div
                style={{
                  position: 'absolute',
                  bottom: 8,
                  right: 12,
                  background: 'rgba(16, 185, 129, 0.9)',
                  backdropFilter: 'blur(4px)',
                  padding: '2px 8px',
                  borderRadius: 12,
                  fontSize: 9,
                  fontWeight: 500,
                  color: 'white',
                }}
              >
                {activeConnections} connection{activeConnections !== 1 ? 's' : ''}
              </div>
            )}
          </div>
        )}
        
        {/* Edit indicator badge */}
        {isEditing && (
          <div
            style={{
              position: 'absolute',
              bottom: 12,
              right: 12,
              background: 'rgba(99, 102, 241, 0.95)',
              backdropFilter: 'blur(8px)',
              padding: '4px 10px',
              borderRadius: 20,
              fontSize: 10,
              fontWeight: 600,
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              zIndex: 20,
              pointerEvents: 'none',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
            </svg>
            Editing Mode
          </div>
        )}
      </HTMLContainer>
    )
  }

  override indicator(shape: SlideShape) {
    const isEditing = shape.props.isEditing ?? false
    const hasConnections = !!(shape.props.connectionTop || shape.props.connectionBottom || 
                               shape.props.connectionLeft || shape.props.connectionRight)
    
    return (
      <rect
        width={shape.props.w}
        height={shape.props.h}
        rx={0}
        fill="none"
        stroke={isEditing ? "#6366F1" : hasConnections ? "#10B981" : "#94A3B8"}
        strokeWidth={isEditing ? 3 : 2}
        strokeDasharray={isEditing ? "none" : hasConnections ? "none" : "4 4"}
        style={{
          transition: 'all 0.2s ease',
          filter: isEditing ? 'drop-shadow(0 0 8px rgba(99, 102, 241, 0.5))' : 
                  hasConnections ? 'drop-shadow(0 0 4px rgba(16, 185, 129, 0.3))' : 'none',
        }}
      />
    )
  }
}