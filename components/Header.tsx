'use client'

import { Editor } from 'tldraw'
import { Layout, LayoutTemplate, Plus } from 'lucide-react'
import { SAMPLE_HTML } from '../store/slideStore'
import { useState } from 'react'

interface Props {
  editor: Editor | null
}

const NAV_ITEMS = ['Home', 'Slides', 'Canvas', 'Export', 'About']

export function Header({ editor }: Props) {
  const [active, setActive] = useState('Home')

  const addSlide = () => {
    if (!editor) return
    const vp = editor.getViewportPageBounds()
    const x = vp.x + vp.w / 2 - 320 + (Math.random() * 80 - 40)
    const y = vp.y + vp.h / 2 - 200 + (Math.random() * 80 - 40)
    editor.createShape({
      type: 'slide',
      x,
      y,
      props: {
        w: 1427,
        h: 932,
        html: SAMPLE_HTML,
        title: `Slide ${Date.now().toString().slice(-4)}`,
      },
    })
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 16,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 8000,
        fontFamily: "'DM Sans', system-ui, sans-serif",
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 0,
          background: '#0D0D0D',
          borderRadius: 999,
          padding: '6px 8px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.35), 0 1px 0 rgba(255,255,255,0.06) inset',
          border: '1px solid rgba(255,255,255,0.07)',
          whiteSpace: 'nowrap',
        }}
      >
        {/* Logo */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 9,
            paddingLeft: 6,
            paddingRight: 20,
          }}
        >
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Layout size={15} color="white" strokeWidth={2.5} />
          </div>
          <span
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: '#F0F0F0',
              letterSpacing: '-0.4px',
            }}
          >
            SlideCanvas
          </span>
        </div>

        {/* Nav links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {NAV_ITEMS.map((item) => (
            <button
              key={item}
              onClick={() => setActive(item)}
              style={{
                padding: '8px 18px',
                borderRadius: 999,
                border: 'none',
                background: active === item ? '#E8E4FF' : 'transparent',
                color: active === item ? '#3730A3' : '#9A9A9A',
                fontSize: 14,
                fontWeight: active === item ? 600 : 500,
                cursor: 'pointer',
                letterSpacing: '-0.1px',
                transition: 'background 0.15s, color 0.15s',
              }}
              onMouseEnter={(e) => {
                if (active !== item) {
                  e.currentTarget.style.color = '#E5E5E5'
                  e.currentTarget.style.background = 'rgba(255,255,255,0.07)'
                }
              }}
              onMouseLeave={(e) => {
                if (active !== item) {
                  e.currentTarget.style.color = '#9A9A9A'
                  e.currentTarget.style.background = 'transparent'
                }
              }}
            >
              {item}
            </button>
          ))}
        </div>

        {/* Divider */}
        <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.1)', margin: '0 10px' }} />

        {/* Templates icon button */}
        <button
          title="Templates"
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: '#1C1C1C',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#888',
            flexShrink: 0,
            transition: 'background 0.12s, color 0.12s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#2A2A2A'
            e.currentTarget.style.color = '#E5E5E5'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#1C1C1C'
            e.currentTarget.style.color = '#888'
          }}
        >
          <LayoutTemplate size={15} />
        </button>

        {/* Divider */}
        <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.1)', margin: '0 10px' }} />

        {/* Sign in */}
        <button
          style={{
            padding: '8px 20px',
            borderRadius: 999,
            background: '#1C1C1C',
            color: '#C0C0C0',
            border: 'none',
            fontSize: 14,
            fontWeight: 500,
            cursor: 'pointer',
            letterSpacing: '-0.1px',
            transition: 'background 0.12s, color 0.12s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#2A2A2A'
            e.currentTarget.style.color = '#F0F0F0'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#1C1C1C'
            e.currentTarget.style.color = '#C0C0C0'
          }}
        >
          Sign in
        </button>

        {/* Divider */}
        <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.1)', margin: '0 6px' }} />

        {/* New Slide CTA */}
        <button
          onClick={addSlide}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 20px',
            borderRadius: 999,
            background: '#F5F5F5',
            color: '#0D0D0D',
            border: 'none',
            fontSize: 14,
            fontWeight: 700,
            cursor: 'pointer',
            letterSpacing: '-0.2px',
            transition: 'opacity 0.15s',
            flexShrink: 0,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.88')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
        >
          <Plus size={14} strokeWidth={2.8} />
          New Slide
        </button>
      </div>
    </div>
  )
}