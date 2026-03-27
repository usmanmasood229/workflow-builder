// app/page.tsx
'use client'

import dynamic from 'next/dynamic'

const SlideCanvas = dynamic(() => import('@/components/SlideCanvas'), { ssr: false })

export default function Home() {
  return <SlideCanvas />
}