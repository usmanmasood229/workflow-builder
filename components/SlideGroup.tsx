// components/SlideGroup.tsx
'use client'

import { useState } from 'react'
import { Editor, TLShapeId, createShapeId } from 'tldraw'
import { X, Layout, Copy } from 'lucide-react'

interface SlideData {
  id: string
  html: string
  title: string
  w: number
  h: number
}

interface Props {
  slides: SlideData[]
  editor: Editor
  onClose: () => void
}

export function SlideGroup({ slides, editor, onClose }: Props) {
  const [selectedLayout, setSelectedLayout] = useState<'horizontal' | 'vertical' | 'grid'>('horizontal')

  // Merge slides into one HTML document preserving actual content
  const mergeSlides = () => {
    // Calculate total dimensions based on layout
    let totalWidth = 0
    let totalHeight = 0
    const maxWidth = Math.max(...slides.map(s => s.w))
    const maxHeight = Math.max(...slides.map(s => s.h))
    
    if (selectedLayout === 'horizontal') {
      totalWidth = slides.reduce((sum, s) => sum + s.w, 0)
      totalHeight = maxHeight
    } else if (selectedLayout === 'vertical') {
      totalWidth = maxWidth
      totalHeight = slides.reduce((sum, s) => sum + s.h, 0)
    } else if (selectedLayout === 'grid') {
      const cols = Math.ceil(Math.sqrt(slides.length))
      const rows = Math.ceil(slides.length / cols)
      totalWidth = cols * maxWidth
      totalHeight = rows * maxHeight
    }

    // Generate merged HTML with actual slide content
    let mergedHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      width: 100%;
      height: 100%;
      overflow: auto;
      background: #f0f0f0;
    }
    .slides-container {
      display: flex;
      flex-direction: ${selectedLayout === 'horizontal' ? 'row' : selectedLayout === 'vertical' ? 'column' : 'grid'};
      ${selectedLayout === 'grid' ? `display: grid; grid-template-columns: repeat(${Math.ceil(Math.sqrt(slides.length))}, 1fr);` : ''}
      width: 100%;
      min-height: 100%;
      gap: 0;
    }
    .slide-wrapper {
      ${selectedLayout === 'horizontal' ? `width: ${slides[0]?.w}px;` : ''}
      ${selectedLayout === 'vertical' ? `height: ${slides[0]?.h}px;` : ''}
      ${selectedLayout === 'grid' ? 'width: 100%;' : ''}
      position: relative;
      background: white;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      overflow: hidden;
    }
    .slide-content {
      width: 100%;
      height: 100%;
    }
    .slide-label {
      position: absolute;
      top: 8px;
      left: 12px;
      background: rgba(0,0,0,0.7);
      color: white;
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 500;
      z-index: 10;
      pointer-events: none;
      backdrop-filter: blur(4px);
      font-family: system-ui, sans-serif;
    }
  </style>
</head>
<body>
  <div class="slides-container">
`

    // Add each slide's ACTUAL HTML content
    slides.forEach((slide, index) => {
      // Get the actual HTML content from the slide
      let slideHtml = slide.html
      
      // If the slide has its own HTML structure, use it directly
      // Otherwise, wrap it in a container
      if (!slideHtml || slideHtml.trim() === '') {
        slideHtml = `<div class="w-full h-full bg-gray-100 flex items-center justify-center">
          <div class="text-center">
            <p class="text-gray-400">Empty slide</p>
            <p class="text-xs text-gray-300 mt-2">${slide.title}</p>
          </div>
        </div>`
      }
      
      mergedHtml += `
    <div class="slide-wrapper" style="width: ${slide.w}px; height: ${slide.h}px;">
      <div class="slide-label">${slide.title || `Slide ${index + 1}`}</div>
      <div class="slide-content">
        ${slideHtml}
      </div>
    </div>
`
    })

    mergedHtml += `
  </div>
</body>
</html>`

    // Get position for the new merged slide
    const firstSlideId = slides[0].id as TLShapeId
    const firstSlide = editor.getShape(firstSlideId)
    
    let centerX = 0
    let centerY = 0
    
    if (firstSlide) {
      centerX = firstSlide.x
      centerY = firstSlide.y
    }

    // Create new merged slide
    const newShapeId = createShapeId()

    editor.createShape({
      id: newShapeId,
      type: 'slide',
      x: centerX,
      y: centerY,
      props: {
        w: totalWidth,
        h: totalHeight,
        html: mergedHtml,
        title: `Grouped Slides (${slides.length})`,
        isEditing: false,
      },
    })

    // Delete original slides
    const shapeIdsToDelete = slides.map(s => s.id as TLShapeId)
    editor.deleteShapes(shapeIdsToDelete)

    // Select the new grouped slide
    editor.select(newShapeId)
    editor.zoomToSelection()

    onClose()
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.8)',
        backdropFilter: 'blur(8px)',
        zIndex: 20000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'system-ui, sans-serif',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        style={{
          width: 560,
          background: '#1E1E1E',
          borderRadius: 16,
          border: '1px solid #2A2A2A',
          boxShadow: '0 24px 48px rgba(0,0,0,0.4)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid #2A2A2A',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: '#6366F1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Layout size={20} color="white" />
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ color: '#E5E5E5', fontSize: 16, fontWeight: 600, margin: 0 }}>
              Group Slides
            </h3>
            <p style={{ color: '#8E8E8E', fontSize: 12, margin: '4px 0 0 0' }}>
              {slides.length} slides selected
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#2A2A2A',
              border: 'none',
              borderRadius: 8,
              color: '#8E8E8E',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#3A3A3A'
              e.currentTarget.style.color = '#E5E5E5'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#2A2A2A'
              e.currentTarget.style.color = '#8E8E8E'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '24px' }}>
          {/* Layout Options */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 12, fontWeight: 500, color: '#8E8E8E', marginBottom: 12, display: 'block' }}>
              Layout
            </label>
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => setSelectedLayout('horizontal')}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: selectedLayout === 'horizontal' ? '#6366F1' : '#2A2A2A',
                  border: '1px solid',
                  borderColor: selectedLayout === 'horizontal' ? '#6366F1' : '#3A3A3A',
                  borderRadius: 10,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 8 }}>
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      style={{
                        width: 40,
                        height: 30,
                        background: selectedLayout === 'horizontal' ? '#818CF8' : '#5A5A5A',
                        borderRadius: 4,
                      }}
                    />
                  ))}
                </div>
                <span style={{ fontSize: 12, color: selectedLayout === 'horizontal' ? 'white' : '#8E8E8E' }}>
                  Horizontal
                </span>
              </button>
              
              <button
                onClick={() => setSelectedLayout('vertical')}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: selectedLayout === 'vertical' ? '#6366F1' : '#2A2A2A',
                  border: '1px solid',
                  borderColor: selectedLayout === 'vertical' ? '#6366F1' : '#3A3A3A',
                  borderRadius: 10,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'center', marginBottom: 8 }}>
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      style={{
                        width: 50,
                        height: 15,
                        background: selectedLayout === 'vertical' ? '#818CF8' : '#5A5A5A',
                        borderRadius: 4,
                      }}
                    />
                  ))}
                </div>
                <span style={{ fontSize: 12, color: selectedLayout === 'vertical' ? 'white' : '#8E8E8E' }}>
                  Vertical
                </span>
              </button>
              
              <button
                onClick={() => setSelectedLayout('grid')}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: selectedLayout === 'grid' ? '#6366F1' : '#2A2A2A',
                  border: '1px solid',
                  borderColor: selectedLayout === 'grid' ? '#6366F1' : '#3A3A3A',
                  borderRadius: 10,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6, marginBottom: 8, justifyContent: 'center' }}>
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      style={{
                        width: 30,
                        height: 25,
                        background: selectedLayout === 'grid' ? '#818CF8' : '#5A5A5A',
                        borderRadius: 4,
                      }}
                    />
                  ))}
                </div>
                <span style={{ fontSize: 12, color: selectedLayout === 'grid' ? 'white' : '#8E8E8E' }}>
                  Grid
                </span>
              </button>
            </div>
          </div>

          {/* Preview of actual slide content */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 12, fontWeight: 500, color: '#8E8E8E', marginBottom: 12, display: 'block' }}>
              Preview
            </label>
            <div
              style={{
                background: '#0A0A0A',
                borderRadius: 12,
                padding: 20,
                minHeight: 200,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'auto',
              }}
            >
              <div
                style={{
                  display: selectedLayout === 'horizontal' ? 'flex' : selectedLayout === 'vertical' ? 'flex' : 'grid',
                  flexDirection: selectedLayout === 'vertical' ? 'column' : 'row',
                  gridTemplateColumns: selectedLayout === 'grid' ? `repeat(${Math.ceil(Math.sqrt(slides.length))}, 1fr)` : undefined,
                  gap: 12,
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#1A1A1A',
                  padding: 20,
                  borderRadius: 12,
                }}
              >
                {slides.map((slide, i) => (
                  <div
                    key={i}
                    style={{
                      width: selectedLayout === 'horizontal' ? 100 : selectedLayout === 'vertical' ? 160 : 90,
                      height: selectedLayout === 'vertical' ? 80 : 90,
                      background: '#2A2A2A',
                      borderRadius: 8,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 8,
                    }}
                  >
                    <div
                      style={{
                        width: '100%',
                        height: 40,
                        background: '#3A3A3A',
                        borderRadius: 4,
                        marginBottom: 8,
                      }}
                    />
                    <span style={{ fontSize: 9, color: '#8E8E8E', textAlign: 'center' }}>
                      {slide.title?.slice(0, 20) || `Slide ${i + 1}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Info */}
          <div
            style={{
              background: '#0A0A0A',
              borderRadius: 10,
              padding: 14,
              marginBottom: 24,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 11, color: '#8E8E8E' }}>Total Width:</span>
              <span style={{ fontSize: 11, color: '#E5E5E5', fontFamily: 'monospace' }}>
                {Math.round(selectedLayout === 'horizontal' 
                  ? slides.reduce((sum, s) => sum + s.w, 0)
                  : selectedLayout === 'vertical'
                  ? Math.max(...slides.map(s => s.w))
                  : Math.ceil(Math.sqrt(slides.length)) * Math.max(...slides.map(s => s.w)))}px
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 11, color: '#8E8E8E' }}>Total Height:</span>
              <span style={{ fontSize: 11, color: '#E5E5E5', fontFamily: 'monospace' }}>
                {Math.round(selectedLayout === 'horizontal' 
                  ? Math.max(...slides.map(s => s.h))
                  : selectedLayout === 'vertical'
                  ? slides.reduce((sum, s) => sum + s.h, 0)
                  : Math.ceil(slides.length / Math.ceil(Math.sqrt(slides.length))) * Math.max(...slides.map(s => s.h)))}px
              </span>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={onClose}
              style={{
                flex: 1,
                padding: '12px',
                background: '#2A2A2A',
                border: '1px solid #3A3A3A',
                borderRadius: 10,
                color: '#8E8E8E',
                fontSize: 13,
                fontWeight: 500,
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#3A3A3A'
                e.currentTarget.style.color = '#E5E5E5'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#2A2A2A'
                e.currentTarget.style.color = '#8E8E8E'
              }}
            >
              Cancel
            </button>
            <button
              onClick={mergeSlides}
              style={{
                flex: 1,
                padding: '12px',
                background: '#6366F1',
                border: 'none',
                borderRadius: 10,
                color: 'white',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#4F46E5'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#6366F1'
              }}
            >
              <Copy size={14} />
              Group Slides
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}