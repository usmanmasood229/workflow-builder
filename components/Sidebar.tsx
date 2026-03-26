// components/Sidebar.tsx
'use client'

import { Editor } from 'tldraw'
import { PALETTE_ITEMS, NodeMeta, NODE_CATEGORIES } from '@/lib/nodeTypes'
import { DEFAULT_DATA } from '../store/workflowStore'
import { useState } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Upload,
  Trash2,
  Plus,
  Zap,
  GitBranch,
  Database,
  Bell,
  Webhook,
  Repeat,
  ArrowLeftRight,
  CheckCircle,
  Calendar,
  Split,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface Props {
  editor: Editor | null
  nodeCount: number
  arrowCount: number
}

// Icon mapping for node types
const getNodeIcon = (type: string) => {
  switch (type) {
    case 'trigger': return Zap
    case 'action': return Plus
    case 'condition': return GitBranch
    case 'delay': return Calendar
    case 'loop': return Repeat
    case 'transform': return ArrowLeftRight
    case 'approval': return CheckCircle
    case 'notification': return Bell
    case 'webhook': return Webhook
    case 'database': return Database
    case 'schedule': return Calendar
    case 'parallel': return Split
    default: return Plus
  }
}

// Category colors matching your design system
const CATEGORY_COLORS = {
  core: '#0A0A0A',
  logic: '#D97706',
  data: '#16A34A',
  communication: '#2563EB',
  integration: '#7C3AED',
}

function PaletteCard({ item, editor, onClose }: { item: NodeMeta; editor: Editor | null; onClose?: () => void }) {
  const Icon = getNodeIcon(item.type)
  
  const handleClick = () => {
    if (!editor) return

    const viewport = editor.getViewportPageBounds()
    const x = viewport.x + viewport.w / 2 - 100 + Math.random() * 60 - 30
    const y = viewport.y + viewport.h / 2 - 45 + Math.random() * 60 - 30

    editor.createShape({
      type: 'workflow-node',
      x,
      y,
      props: {
        w: 200,
        h: item.type === 'condition' ? 105 : 90,
        nodeData: { ...DEFAULT_DATA[item.type] },
      },
    })
    
    onClose?.()
  }

  return (
    <Button
      variant="ghost"
      className="w-full justify-start h-auto py-3 px-3 mb-2 hover:bg-gray-50 group"
      style={{
        borderLeft: `3px solid ${item.color}`,
      }}
      onClick={handleClick}
    >
      <div className="flex items-start gap-3 w-full">
        <div 
          className="p-1.5 rounded-lg shrink-0 transition-colors group-hover:bg-gray-100"
          style={{ color: item.color }}
        >
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex-1 text-left">
          <p className="text-sm font-medium text-gray-900">{item.label}</p>
          <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
        </div>
        <Badge 
          variant="outline" 
          className="text-[10px] px-1.5 py-0 h-4 border-gray-200 text-gray-400"
        >
          {item.type}
        </Badge>
      </div>
    </Button>
  )
}

function CategorySection({ title, items, editor, color }: { 
  title: string; 
  items: NodeMeta[]; 
  editor: Editor | null;
  color: string;
}) {
  if (items.length === 0) return null
  
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-0.5 h-3.5 rounded-full" style={{ backgroundColor: color }} />
        <p className="text-[10px] font-semibold text-gray-400 tracking-wider uppercase">
          {title}
        </p>
        <Badge 
          variant="secondary" 
          className="text-[10px] px-1.5 h-4 bg-gray-100 text-gray-500"
        >
          {items.length}
        </Badge>
      </div>
      {items.map((item) => (
        <PaletteCard key={item.type} item={item} editor={editor} />
      ))}
    </div>
  )
}

export function Sidebar({ editor, nodeCount, arrowCount }: Props) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  
  const handleExport = () => {
    if (!editor) return
    const snapshot = editor.getSnapshot()
    const json = JSON.stringify(snapshot, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `workflow_${new Date().toISOString().slice(0,19)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = () => {
    if (!editor) return
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = (ev) => {
        try {
          const snapshot = JSON.parse(ev.target?.result as string)
          editor.loadSnapshot(snapshot)
        } catch {
          alert('Invalid JSON file')
        }
      }
      reader.readAsText(file)
    }
    input.click()
  }

  const handleClear = () => {
    if (!editor) return
    if (!confirm('Clear the entire canvas? This action cannot be undone.')) return
    editor.selectAll()
    editor.deleteShapes(editor.getSelectedShapeIds())
  }

  // Group nodes by category
  const groupedNodes = NODE_CATEGORIES.map(cat => ({
    ...cat,
    items: PALETTE_ITEMS.filter(item => item.category === cat.id)
  })).filter(group => group.items.length > 0)

  const totalNodes = PALETTE_ITEMS.length

  return (
    <div 
      className={cn(
        "relative h-screen border-r transition-all duration-200",
        isCollapsed ? "w-0" : "w-72"
      )}
      style={{ 
        backgroundColor: '#F8F7F4',
        borderColor: '#ECEAE5'
      }}
    >
      {/* Collapse Toggle */}
      <Button
        variant="outline"
        size="icon"
        className="absolute -right-3 top-6 h-6 w-6 rounded-full border shadow-sm z-10"
        style={{ 
          borderColor: '#ECEAE5',
          backgroundColor: '#FFFFFF'
        }}
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? (
          <ChevronRight className="h-3 w-3" style={{ color: '#5C5C5C' }} />
        ) : (
          <ChevronLeft className="h-3 w-3" style={{ color: '#5C5C5C' }} />
        )}
      </Button>

      {!isCollapsed && (
        <>
          {/* Header */}
          <div className="p-5 border-b" style={{ borderColor: '#ECEAE5' }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-sm font-semibold tracking-tight" style={{ color: '#0A0A0A' }}>
                  Workflow Builder
                </h1>
                <p className="text-[10px] mt-0.5" style={{ color: '#A0A0A0' }}>
                  Visual Automation
                </p>
              </div>
            </div>
          </div>

          <ScrollArea className="h-[calc(100vh-180px)]">
            <div className="p-5">
              {/* Node Palette Header */}
              <div className="flex items-center justify-between mb-4">
                <p className="text-[10px] font-semibold tracking-wider uppercase" style={{ color: '#A0A0A0' }}>
                  NODES — click to add
                </p>
                <Badge 
                  variant="secondary" 
                  className="text-[10px] px-1.5 h-4"
                  style={{ backgroundColor: '#F2F1ED', color: '#5C5C5C' }}
                >
                  {totalNodes} types
                </Badge>
              </div>

              {/* Category Sections */}
              {groupedNodes.map(group => (
                <CategorySection
                  key={group.id}
                  title={group.label}
                  items={group.items}
                  editor={editor}
                  color={CATEGORY_COLORS[group.id as keyof typeof CATEGORY_COLORS] || '#0A0A0A'}
                />
              ))}

              <Separator className="my-4" style={{ backgroundColor: '#ECEAE5' }} />

              {/* Stats Section */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-0.5 h-3.5 rounded-full" style={{ backgroundColor: '#0A0A0A' }} />
                  <p className="text-[10px] font-semibold tracking-wider uppercase" style={{ color: '#A0A0A0' }}>
                    CANVAS
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Card className="border shadow-sm" style={{ borderColor: '#ECEAE5' }}>
                    <CardContent className="p-3 text-center">
                      <p className="text-2xl font-bold tracking-tight" style={{ color: '#0A0A0A' }}>
                        {nodeCount}
                      </p>
                      <p className="text-[10px] mt-1" style={{ color: '#A0A0A0' }}>
                        nodes
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="border shadow-sm" style={{ borderColor: '#ECEAE5' }}>
                    <CardContent className="p-3 text-center">
                      <p className="text-2xl font-bold tracking-tight" style={{ color: '#0A0A0A' }}>
                        {arrowCount}
                      </p>
                      <p className="text-[10px] mt-1" style={{ color: '#A0A0A0' }}>
                        arrows
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Tips Section */}
              <Card className="border shadow-sm" style={{ borderColor: '#ECEAE5', backgroundColor: '#F2F1ED' }}>
                <CardContent className="p-4">
                  <p className="text-[10px] font-semibold tracking-wider uppercase mb-2" style={{ color: '#A0A0A0' }}>
                    TIPS
                  </p>
                  <ul className="space-y-1 text-xs" style={{ color: '#5C5C5C' }}>
                    <li>• Click a node to configure</li>
                    <li>• Draw arrows to connect nodes</li>
                    <li>• Double-click canvas to pan</li>
                    <li>• Delete key removes selected</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </ScrollArea>

          {/* Footer Actions */}
          <div className="absolute bottom-0 left-0 right-0 p-5 border-t" style={{ borderColor: '#ECEAE5', backgroundColor: '#FFFFFF' }}>
            <div className="space-y-2">
              <Button
                className="w-full text-white"
                style={{ backgroundColor: '#0A0A0A' }}
                onClick={handleExport}
              >
                <Download className="h-4 w-4 mr-2" />
                Export JSON
              </Button>
              <Button
                variant="outline"
                className="w-full"
                style={{ borderColor: '#ECEAE5' }}
                onClick={handleImport}
              >
                <Upload className="h-4 w-4 mr-2" />
                Import JSON
              </Button>
              <Button
                variant="destructive"
                className="w-full"
                style={{ backgroundColor: '#FEF2F2', color: '#DC2626', borderColor: '#FECACA' }}
                onClick={handleClear}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear Canvas
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}