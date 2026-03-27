// components/HtmlEditor.tsx
'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Editor } from 'tldraw'
import { X, RefreshCw, Check, Code2, Eye, Sparkles } from 'lucide-react'

interface Props {
  editor: Editor
  shapeId: string
  initialHtml: string
  title: string
  onClose: () => void
}

export function HtmlEditor({ editor, shapeId, initialHtml, title, onClose }: Props) {
  const [html, setHtml] = useState(initialHtml)
  const [draftTitle, setDraftTitle] = useState(title)
  const [preview, setPreview] = useState(initialHtml)
  const [width, setWidth] = useState(520)
  const [isResizing, setIsResizing] = useState(false)
  const [showLineNumbers, setShowLineNumbers] = useState(true)
  const [wordWrap, setWordWrap] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const resizeStartRef = useRef({ x: 0, width: 0 })

  // Auto-preview with debounce
  useEffect(() => {
    const t = setTimeout(() => setPreview(html), 400)
    return () => clearTimeout(t)
  }, [html])

  // Apply changes to the shape
  const applyChanges = useCallback(() => {
    editor.updateShape({
      id: shapeId as any,
      type: 'slide',
      props: { html, title: draftTitle },
    })
  }, [editor, shapeId, html, draftTitle])

  // Handle resize with smooth cursor
  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsResizing(true)
    resizeStartRef.current = { x: e.clientX, width }

    const onMouseMove = (ev: MouseEvent) => {
      const delta = resizeStartRef.current.x - ev.clientX
      const newWidth = Math.max(420, Math.min(880, resizeStartRef.current.width + delta))
      setWidth(newWidth)
    }

    const onMouseUp = () => {
      setIsResizing(false)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
  }, [width])

  // Generate line numbers for the editor
  const lineNumbers = html.split('\n').map((_, i) => i + 1).join('\n')

  const previewDoc = `<!DOCTYPE html>
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
      min-height: 100%;
      background: #0a0a0f;
      font-family: system-ui, -apple-system, sans-serif;
    }
  </style>
</head>
<body>${preview}</body>
</html>`

  return (
    <div
      style={{
        position: 'fixed',
        right: 0,
        top: 0,
        bottom: 0,
        width,
        minWidth: 420,
        maxWidth: 880,
        background: '#1E1E2E',
        borderLeft: '1px solid #2A2A3A',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 10000,
        boxShadow: '-12px 0 32px rgba(0, 0, 0, 0.5)',
        fontFamily: 'system-ui, -apple-system, "Inter", sans-serif',
        transition: isResizing ? 'none' : 'width 0.1s ease-out',
      }}
    >
      {/* Elegant Resize Handle */}
      <div
        style={{
          position: 'absolute',
          left: -3,
          top: 0,
          bottom: 0,
          width: 6,
          cursor: 'ew-resize',
          zIndex: 20,
          background: isResizing ? '#5f6aff40' : 'transparent',
          transition: 'background 0.2s',
        }}
        onMouseDown={handleResizeStart}
        onMouseEnter={(e) => {
          if (!isResizing) e.currentTarget.style.background = '#5f6aff30'
        }}
        onMouseLeave={(e) => {
          if (!isResizing) e.currentTarget.style.background = 'transparent'
        }}
      />

      {/* Header - VS Code Style */}
      <div
        style={{
          background: '#18181F',
          borderBottom: '1px solid #2A2A3A',
          padding: '12px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
        }}
      >
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
          <input
            value={draftTitle}
            onChange={(e) => setDraftTitle(e.target.value)}
            style={{
              background: '#25252F',
              border: '1px solid #3A3A48',
              borderRadius: 8,
              padding: '8px 14px',
              fontSize: 13,
              fontWeight: 500,
              color: '#E9E9F4',
              outline: 'none',
              fontFamily: 'inherit',
              transition: 'border-color 0.15s',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#5f6aff'
              e.currentTarget.style.boxShadow = '0 0 0 2px #5f6aff20'
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = '#3A3A48'
              e.currentTarget.style.boxShadow = 'none'
            }}
            placeholder="Slide title..."
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingLeft: 4 }}>
            <Sparkles size={10} style={{ color: '#5f6aff' }} />
            <span style={{ fontSize: 10, color: '#8B8BA3', fontWeight: 500, letterSpacing: 0.5 }}>
              HTML COMPONENT
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={applyChanges}
            style={{
              background: 'linear-gradient(135deg, #5f6aff 0%, #4a55e0 100%)',
              border: 'none',
              borderRadius: 10,
              padding: '8px 18px',
              fontSize: 12,
              fontWeight: 600,
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              transition: 'transform 0.1s, box-shadow 0.2s',
              boxShadow: '0 2px 8px rgba(95, 106, 255, 0.3)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)'
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(95, 106, 255, 0.4)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(95, 106, 255, 0.3)'
            }}
          >
            <Check size={14} />
            Apply
          </button>
          <button
            onClick={onClose}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 34,
              height: 34,
              borderRadius: 8,
              border: '1px solid #363646',
              background: '#25252F',
              color: '#B9B9D6',
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#323240'
              e.currentTarget.style.borderColor = '#5f6aff'
              e.currentTarget.style.color = '#E2E2F0'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#25252F'
              e.currentTarget.style.borderColor = '#363646'
              e.currentTarget.style.color = '#B9B9D6'
            }}
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Live Preview - Enhanced with glassmorphism */}
      <div
        style={{
          height: 200,
          background: '#15151C',
          borderBottom: '1px solid #2A2A34',
          position: 'relative',
          flexShrink: 0,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 12,
            left: 16,
            background: 'rgba(31, 31, 40, 0.9)',
            backdropFilter: 'blur(8px)',
            padding: '4px 12px',
            borderRadius: 20,
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: 0.8,
            color: '#B5B5E0',
            zIndex: 10,
            border: '0.5px solid #3E3E50',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <Eye size={11} />
          LIVE PREVIEW
        </div>
        <iframe
          srcDoc={previewDoc}
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            background: '#0B0B10',
          }}
          sandbox="allow-scripts allow-same-origin"
          title="preview"
        />
      </div>

      {/* Code Editor - VS Code Perfection */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          background: '#1A1A24',
          overflow: 'hidden',
        }}
      >
        {/* Editor Toolbar */}
        <div
          style={{
            padding: '8px 16px',
            background: '#181820',
            borderBottom: '1px solid #2A2A34',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                background: '#252532',
                padding: '4px 12px',
                borderRadius: 20,
                fontSize: 11,
                fontWeight: 600,
                color: '#BCBCFF',
                fontFamily: 'monospace',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <Code2 size={12} />
              HTML
            </div>
            <button
              onClick={() => setShowLineNumbers(!showLineNumbers)}
              style={{
                background: 'transparent',
                border: '1px solid #3C3C4A',
                borderRadius: 6,
                padding: '4px 10px',
                fontSize: 10,
                fontWeight: 500,
                color: showLineNumbers ? '#BCBCFF' : '#8B8BA3',
                cursor: 'pointer',
                transition: 'all 0.1s',
              }}
            >
              Line {showLineNumbers ? 'On' : 'Off'}
            </button>
            <button
              onClick={() => setWordWrap(!wordWrap)}
              style={{
                background: 'transparent',
                border: '1px solid #3C3C4A',
                borderRadius: 6,
                padding: '4px 10px',
                fontSize: 10,
                fontWeight: 500,
                color: wordWrap ? '#BCBCFF' : '#8B8BA3',
                cursor: 'pointer',
              }}
            >
              Wrap
            </button>
          </div>
          <button
            onClick={() => setHtml(initialHtml)}
            style={{
              background: 'transparent',
              border: '1px solid #3C3C4A',
              borderRadius: 8,
              padding: '6px 14px',
              fontSize: 11,
              fontWeight: 500,
              color: '#AEAECE',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#2C2C38'
              e.currentTarget.style.borderColor = '#5f6aff'
              e.currentTarget.style.color = 'white'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.borderColor = '#3C3C4A'
              e.currentTarget.style.color = '#AEAECE'
            }}
          >
            <RefreshCw size={12} />
            Reset
          </button>
        </div>

        {/* Editor Area with Line Numbers */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {showLineNumbers && (
            <div
              style={{
                background: '#1A1A24',
                padding: '20px 12px 20px 16px',
                fontFamily: '"Fira Code", "Cascadia Code", monospace',
                fontSize: 13,
                lineHeight: 1.6,
                color: '#5A5A72',
                textAlign: 'right',
                userSelect: 'none',
                borderRight: '1px solid #2A2A34',
                overflowY: 'auto',
                whiteSpace: 'pre',
              }}
            >
              {lineNumbers}
            </div>
          )}
          <textarea
            ref={textareaRef}
            value={html}
            onChange={(e) => setHtml(e.target.value)}
            spellCheck={false}
            style={{
              flex: 1,
              background: '#1A1A24',
              color: '#E5E5F0',
              border: 'none',
              outline: 'none',
              padding: '20px 24px',
              fontFamily: '"Fira Code", "Cascadia Code", "Consolas", monospace',
              fontSize: 13,
              lineHeight: 1.6,
              resize: 'none',
              overflowY: 'auto',
              whiteSpace: wordWrap ? 'pre-wrap' : 'pre',
              wordWrap: wordWrap ? 'break-word' : 'normal',
              caretColor: '#5f6aff',
            }}
            placeholder={`<div class="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
  <h1 class="text-white text-4xl font-bold animate-pulse">✨ Hello World!</h1>
</div>`}
          />
        </div>
      </div>

      {/* Footer - Elegant Status Bar */}
      <div
        style={{
          padding: '8px 20px',
          background: '#12121A',
          borderTop: '1px solid #252530',
          fontSize: 10,
          color: '#6F6F8F',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontFamily: 'monospace',
        }}
      >
        <div style={{ display: 'flex', gap: 16 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Sparkles size={10} />
            Tailwind CSS
          </span>
          <span>Auto-preview · 400ms</span>
          <span>VS Code Theme</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <span>Ln {html.split('\n').length}, Col {html.split('\n').pop()?.length || 0}</span>
          <span>{wordWrap ? 'Soft Wrap' : 'No Wrap'}</span>
        </div>
      </div>
    </div>
  )
}