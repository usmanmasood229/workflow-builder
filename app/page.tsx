// app/page.tsx
import dynamic from 'next/dynamic'

// tldraw uses browser APIs — must be client-only, no SSR
const WorkflowApp = dynamic(() => import('@/components/WorkflowApp'), { ssr: false })

export default function Home() {
  return <WorkflowApp />
}