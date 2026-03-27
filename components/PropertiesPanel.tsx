// components/PropertiesPanel.tsx
'use client'

import { Editor, TLShapeId } from 'tldraw'
import { X, Copy, Trash2, Layers, Code2, Eye, RefreshCw, ChevronDown, ChevronRight, HelpCircle, Ungroup } from 'lucide-react'
import { useState, useEffect } from 'react'

interface PropertiesPanelProps {
  editor: Editor
  shapeId: TLShapeId
  position: { x: number; y: number }
  onClose: () => void
}

export function PropertiesPanel({ editor, shapeId, position, onClose }: PropertiesPanelProps) {
  const shape = editor.getShape(shapeId)
  if (!shape || shape.type !== 'slide') return null
  
  const props = (shape as any).props
  const [title, setTitle] = useState(props.title || 'Untitled Slide')
  const [width, setWidth] = useState(props.w)
  const [height, setHeight] = useState(props.h)
  const [html, setHtml] = useState(props.html || '')
  const [previewHtml, setPreviewHtml] = useState(props.html || '')
  const [showHtmlEditor, setShowHtmlEditor] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [tooltip, setTooltip] = useState<{ text: string; x: number; y: number } | null>(null)
  
  // Check if this is a grouped slide
  const isGrouped = props?.html?.includes('slides-container') || 
                    props?.html?.includes('slide-item')

  // Auto-preview with debounce
  useEffect(() => {
    const t = setTimeout(() => setPreviewHtml(html), 500)
    return () => clearTimeout(t)
  }, [html])

  const updateTitle = (newTitle: string) => {
    setTitle(newTitle)
    editor.updateShape({
      id: shapeId,
      type: 'slide',
      props: { ...props, title: newTitle }
    })
  }

  const updateSize = (w: number, h: number) => {
    setWidth(w)
    setHeight(h)
    editor.updateShape({
      id: shapeId,
      type: 'slide',
      props: { ...props, w, h }
    })
  }

  const updateHtml = (newHtml: string) => {
    setHtml(newHtml)
    editor.updateShape({
      id: shapeId,
      type: 'slide',
      props: { ...props, html: newHtml }
    })
  }

  const handleDuplicate = () => {
    editor.duplicateShapes([shapeId])
    onClose()
  }

  const handleDelete = () => {
    editor.deleteShapes([shapeId])
    onClose()
  }

  const handleBringToFront = () => {
    editor.bringToFront([shapeId])
  }

  const handleSendToBack = () => {
    editor.sendToBack([shapeId])
  }

  const showTooltip = (text: string, e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setTooltip({
      text,
      x: rect.left + rect.width / 2,
      y: rect.top - 8
    })
    setTimeout(() => setTooltip(null), 2000)
  }

  const htmlTemplates = {
    hero: `<div class="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
  <div class="text-center text-white">
    <h1 class="text-5xl font-bold mb-4">Welcome</h1>
    <p class="text-xl">Create something amazing</p>
  </div>
</div>`,
    card: `<div class="w-full h-full bg-white flex items-center justify-center p-8">
  <div class="max-w-md bg-gray-50 rounded-lg shadow-lg p-6">
    <h2 class="text-2xl font-bold text-gray-800 mb-2">Card Title</h2>
    <p class="text-gray-600">This is a beautiful card component with Tailwind CSS</p>
    <button class="mt-4 px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600">Learn More</button>
  </div>
</div>`,
    form: `<div class="w-full h-full bg-gray-100 flex items-center justify-center p-8">
  <div class="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
    <h2 class="text-2xl font-bold text-gray-800 mb-6">Contact Us</h2>
    <input type="text" placeholder="Name" class="w-full mb-4 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
    <input type="email" placeholder="Email" class="w-full mb-4 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
    <textarea placeholder="Message" rows="4" class="w-full mb-4 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"></textarea>
    <button class="w-full bg-indigo-500 text-white py-2 rounded-lg hover:bg-indigo-600">Send Message</button>
  </div>
</div>`,
    features: `<div class="w-full h-full bg-white flex items-center justify-center p-8">
  <div class="grid grid-cols-2 gap-6 max-w-2xl">
    <div class="text-center p-4">
      <div class="text-4xl mb-2">🚀</div>
      <h3 class="font-bold">Fast</h3>
      <p class="text-sm text-gray-600">Lightning fast performance</p>
    </div>
    <div class="text-center p-4">
      <div class="text-4xl mb-2">🎨</div>
      <h3 class="font-bold">Beautiful</h3>
      <p class="text-sm text-gray-600">Stunning designs</p>
    </div>
    <div class="text-center p-4">
      <div class="text-4xl mb-2">🔒</div>
      <h3 class="font-bold">Secure</h3>
      <p class="text-sm text-gray-600">Enterprise grade security</p>
    </div>
    <div class="text-center p-4">
      <div class="text-4xl mb-2">📱</div>
      <h3 class="font-bold">Responsive</h3>
      <p class="text-sm text-gray-600">Works on all devices</p>
    </div>
  </div>
</div>`
  }

  const applyTemplate = (template: keyof typeof htmlTemplates) => {
    updateHtml(htmlTemplates[template])
  }

  const previewDoc = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { width: 100%; height: 100%; overflow: hidden; font-family: system-ui, sans-serif; }
  </style>
</head>
<body>${previewHtml}</body>
</html>`

  return (
    <>
      {/* Tooltip */}
      {tooltip && (
        <div
          style={{
            position: 'fixed',
            left: tooltip.x,
            top: tooltip.y,
            transform: 'translateX(-50%) translateY(-100%)',
            background: '#1E1E1E',
            color: '#E5E5E5',
            padding: '6px 12px',
            borderRadius: 6,
            fontSize: 12,
            whiteSpace: 'nowrap',
            zIndex: 20000,
            pointerEvents: 'none',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          }}
        >
          {tooltip.text}
          <div
            style={{
              position: 'absolute',
              bottom: -4,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 0,
              height: 0,
              borderLeft: '4px solid transparent',
              borderRight: '4px solid transparent',
              borderTop: '4px solid #1E1E1E',
            }}
          />
        </div>
      )}

      <div
        style={{
          position: 'fixed',
          right: 0,
          top: 0,
          bottom: 0,
          width: 320,
          background: '#2C2C2C',
          borderLeft: '1px solid #3C3C3C',
          zIndex: 10000,
          boxShadow: '-4px 0 12px rgba(0,0,0,0.3)',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: 'system-ui, -apple-system, "Inter", sans-serif',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid #3C3C3C',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Layers size={16} style={{ color: '#8E8E8E' }} />
            <span style={{ fontSize: 13, fontWeight: 500, color: '#E5E5E5' }}>Design</span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: '#8E8E8E',
              padding: 4,
              borderRadius: 4,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#3C3C3C'
              e.currentTarget.style.color = '#E5E5E5'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.color = '#8E8E8E'
            }}
          >
            <X size={14} />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
          {/* Frame Section */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <span style={{ fontSize: 11, fontWeight: 500, color: '#8E8E8E', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Frame
              </span>
              <div
                onMouseEnter={(e) => showTooltip('The name of your slide/frame', e)}
                style={{ cursor: 'help' }}
              >
                <HelpCircle size={12} style={{ color: '#8E8E8E' }} />
              </div>
            </div>
            <input
              value={title}
              onChange={(e) => updateTitle(e.target.value)}
              style={{
                width: '100%',
                background: '#3C3C3C',
                border: '1px solid #4C4C4C',
                borderRadius: 6,
                padding: '8px 12px',
                fontSize: 12,
                color: '#E5E5E5',
                outline: 'none',
              }}
              placeholder="Frame name"
            />
          </div>

          {/* Position & Size Section */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <span style={{ fontSize: 11, fontWeight: 500, color: '#8E8E8E', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Position
              </span>
              <div
                onMouseEnter={(e) => showTooltip('Position and size of the frame on canvas', e)}
                style={{ cursor: 'help' }}
              >
                <HelpCircle size={12} style={{ color: '#8E8E8E' }} />
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 10, color: '#8E8E8E', display: 'block', marginBottom: 4 }}>X</label>
                <input
                  type="number"
                  value={Math.round(shape.x)}
                  onChange={(e) => editor.updateShape({ id: shapeId, type: 'slide', x: parseInt(e.target.value) })}
                  style={{
                    width: '100%',
                    background: '#3C3C3C',
                    border: '1px solid #4C4C4C',
                    borderRadius: 4,
                    padding: '6px 8px',
                    fontSize: 11,
                    color: '#E5E5E5',
                  }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 10, color: '#8E8E8E', display: 'block', marginBottom: 4 }}>Y</label>
                <input
                  type="number"
                  value={Math.round(shape.y)}
                  onChange={(e) => editor.updateShape({ id: shapeId, type: 'slide', y: parseInt(e.target.value) })}
                  style={{
                    width: '100%',
                    background: '#3C3C3C',
                    border: '1px solid #4C4C4C',
                    borderRadius: 4,
                    padding: '6px 8px',
                    fontSize: 11,
                    color: '#E5E5E5',
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 10, color: '#8E8E8E', display: 'block', marginBottom: 4 }}>W</label>
                <input
                  type="number"
                  value={Math.round(width)}
                  onChange={(e) => updateSize(parseInt(e.target.value), height)}
                  style={{
                    width: '100%',
                    background: '#3C3C3C',
                    border: '1px solid #4C4C4C',
                    borderRadius: 4,
                    padding: '6px 8px',
                    fontSize: 11,
                    color: '#E5E5E5',
                  }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 10, color: '#8E8E8E', display: 'block', marginBottom: 4 }}>H</label>
                <input
                  type="number"
                  value={Math.round(height)}
                  onChange={(e) => updateSize(width, parseInt(e.target.value))}
                  style={{
                    width: '100%',
                    background: '#3C3C3C',
                    border: '1px solid #4C4C4C',
                    borderRadius: 4,
                    padding: '6px 8px',
                    fontSize: 11,
                    color: '#E5E5E5',
                  }}
                />
              </div>
            </div>
          </div>

          {/* HTML Content Section */}
          <div style={{ marginBottom: 24 }}>
            <div 
              onClick={() => setShowHtmlEditor(!showHtmlEditor)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                marginBottom: 12,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Code2 size={14} style={{ color: '#6366F1' }} />
                <span style={{ fontSize: 11, fontWeight: 500, color: '#8E8E8E', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  HTML Content
                </span>
                <div
                  onMouseEnter={(e) => showTooltip('Edit the HTML content of your slide', e)}
                  style={{ cursor: 'help' }}
                >
                  <HelpCircle size={12} style={{ color: '#8E8E8E' }} />
                </div>
              </div>
              {showHtmlEditor ? <ChevronDown size={14} style={{ color: '#8E8E8E' }} /> : <ChevronRight size={14} style={{ color: '#8E8E8E' }} />}
            </div>
            
            {showHtmlEditor && (
              <>
                {/* Grouped Slide Warning */}
                {isGrouped && (
                  <div
                    style={{
                      background: 'rgba(99, 102, 241, 0.1)',
                      border: '1px solid #6366F1',
                      borderRadius: 6,
                      padding: '12px',
                      marginBottom: 12,
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 10,
                    }}
                  >
                    <Ungroup size={14} style={{ color: '#6366F1', flexShrink: 0, marginTop: 2 }} />
                    <div style={{ fontSize: 11, color: '#B9B9E6' }}>
                      <strong>Grouped Slide</strong> — This contains {html.match(/slide-item/g)?.length || 0} slides.
                      <br />
                      <span style={{ fontSize: 10, color: '#8E8E8E' }}>
                        Use the "Ungroup" button in the toolbar to separate into individual slides.
                      </span>
                    </div>
                  </div>
                )}
                
                {/* Templates */}
                <div style={{ marginBottom: 12 }}>
                  <label style={{ fontSize: 10, color: '#8E8E8E', display: 'block', marginBottom: 6 }}>Quick Templates</label>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button
                      onClick={() => applyTemplate('hero')}
                      style={{
                        background: '#3C3C3C',
                        border: '1px solid #4C4C4C',
                        borderRadius: 4,
                        padding: '4px 8px',
                        fontSize: 10,
                        color: '#E5E5E5',
                        cursor: 'pointer',
                      }}
                      onMouseEnter={(e) => showTooltip('Hero section with gradient background', e)}
                    >
                      Hero Section
                    </button>
                    <button
                      onClick={() => applyTemplate('card')}
                      style={{
                        background: '#3C3C3C',
                        border: '1px solid #4C4C4C',
                        borderRadius: 4,
                        padding: '4px 8px',
                        fontSize: 10,
                        color: '#E5E5E5',
                        cursor: 'pointer',
                      }}
                      onMouseEnter={(e) => showTooltip('Beautiful card component', e)}
                    >
                      Card
                    </button>
                    <button
                      onClick={() => applyTemplate('form')}
                      style={{
                        background: '#3C3C3C',
                        border: '1px solid #4C4C4C',
                        borderRadius: 4,
                        padding: '4px 8px',
                        fontSize: 10,
                        color: '#E5E5E5',
                        cursor: 'pointer',
                      }}
                      onMouseEnter={(e) => showTooltip('Contact form template', e)}
                    >
                      Contact Form
                    </button>
                    <button
                      onClick={() => applyTemplate('features')}
                      style={{
                        background: '#3C3C3C',
                        border: '1px solid #4C4C4C',
                        borderRadius: 4,
                        padding: '4px 8px',
                        fontSize: 10,
                        color: '#E5E5E5',
                        cursor: 'pointer',
                      }}
                      onMouseEnter={(e) => showTooltip('Features grid layout', e)}
                    >
                      Features Grid
                    </button>
                  </div>
                </div>

                {/* Live Preview */}
                <div style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                    <Eye size={10} style={{ color: '#8E8E8E' }} />
                    <label style={{ fontSize: 10, color: '#8E8E8E' }}>Live Preview</label>
                  </div>
                  <div
                    style={{
                      background: '#1E1E1E',
                      borderRadius: 6,
                      height: 120,
                      overflow: 'hidden',
                      border: '1px solid #4C4C4C',
                    }}
                  >
                    <iframe
                      srcDoc={previewDoc}
                      style={{
                        width: '100%',
                        height: '100%',
                        border: 'none',
                        background: '#ffffff',
                      }}
                      title="preview"
                    />
                  </div>
                </div>

                {/* HTML Editor */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <label style={{ fontSize: 10, color: '#8E8E8E' }}>HTML Code</label>
                    <button
                      onClick={() => updateHtml(props.html || '')}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#8E8E8E',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        fontSize: 10,
                      }}
                      onMouseEnter={(e) => showTooltip('Reset to original HTML', e)}
                    >
                      <RefreshCw size={10} />
                      Reset
                    </button>
                  </div>
                  <textarea
                    value={html}
                    onChange={(e) => updateHtml(e.target.value)}
                    style={{
                      width: '100%',
                      height: 150,
                      background: '#1E1E1E',
                      border: '1px solid #4C4C4C',
                      borderRadius: 6,
                      padding: '8px',
                      fontSize: 11,
                      fontFamily: 'monospace',
                      color: '#E5E5E5',
                      resize: 'vertical',
                      outline: 'none',
                    }}
                    placeholder="<div>Your HTML content here...</div>"
                  />
                  <div style={{ fontSize: 9, color: '#8E8E8E', marginTop: 4 }}>
                    💡 Tip: Use Tailwind CSS classes for styling
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Appearance Section */}
          <div style={{ marginBottom: 24 }}>
            <div 
              onClick={() => setShowAdvanced(!showAdvanced)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                marginBottom: 12,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 500, color: '#8E8E8E', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Appearance
                </span>
                <div
                  onMouseEnter={(e) => showTooltip('Visual appearance settings', e)}
                  style={{ cursor: 'help' }}
                >
                  <HelpCircle size={12} style={{ color: '#8E8E8E' }} />
                </div>
              </div>
              {showAdvanced ? <ChevronDown size={14} style={{ color: '#8E8E8E' }} /> : <ChevronRight size={14} style={{ color: '#8E8E8E' }} />}
            </div>
            
            {showAdvanced && (
              <>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ fontSize: 10, color: '#8E8E8E', display: 'block', marginBottom: 4 }}>Opacity</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={1}
                      disabled
                      style={{ flex: 1 }}
                    />
                    <span style={{ fontSize: 11, color: '#E5E5E5', minWidth: 40 }}>100%</span>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: 10, color: '#8E8E8E', display: 'block', marginBottom: 4 }}>Corner radius</label>
                  <input
                    type="number"
                    value={0}
                    disabled
                    style={{
                      width: '100%',
                      background: '#3C3C3C',
                      border: '1px solid #4C4C4C',
                      borderRadius: 4,
                      padding: '6px 8px',
                      fontSize: 11,
                      color: '#8E8E8E',
                    }}
                    placeholder="0"
                  />
                </div>
              </>
            )}
          </div>

          {/* Actions Section */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <span style={{ fontSize: 11, fontWeight: 500, color: '#8E8E8E', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Actions
              </span>
              <div
                onMouseEnter={(e) => showTooltip('Actions for this frame', e)}
                style={{ cursor: 'help' }}
              >
                <HelpCircle size={12} style={{ color: '#8E8E8E' }} />
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <button
                onClick={handleDuplicate}
                style={{
                  flex: 1,
                  background: '#3C3C3C',
                  border: '1px solid #4C4C4C',
                  borderRadius: 6,
                  padding: '8px',
                  color: '#E5E5E5',
                  fontSize: 12,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#4C4C4C' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#3C3C3C' }}
              >
                <Copy size={12} />
                Duplicate
              </button>
              <button
                onClick={handleDelete}
                style={{
                  flex: 1,
                  background: '#3C3C3C',
                  border: '1px solid #4C4C4C',
                  borderRadius: 6,
                  padding: '8px',
                  color: '#FF6B6B',
                  fontSize: 12,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#4C4C4C' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#3C3C3C' }}
              >
                <Trash2 size={12} />
                Delete
              </button>
            </div>
            
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={handleBringToFront}
                style={{
                  flex: 1,
                  background: '#3C3C3C',
                  border: '1px solid #4C4C4C',
                  borderRadius: 6,
                  padding: '8px',
                  color: '#E5E5E5',
                  fontSize: 11,
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#4C4C4C' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#3C3C3C' }}
              >
                Bring to front
              </button>
              <button
                onClick={handleSendToBack}
                style={{
                  flex: 1,
                  background: '#3C3C3C',
                  border: '1px solid #4C4C4C',
                  borderRadius: 6,
                  padding: '8px',
                  color: '#E5E5E5',
                  fontSize: 11,
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#4C4C4C' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#3C3C3C' }}
              >
                Send to back
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}