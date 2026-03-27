// store/slideStore.ts
import { create } from 'zustand'

export interface SlideData {
  id: string
  html: string
  title: string
}

interface SlideStore {
  slides: Record<string, SlideData>
  addSlide: (id: string, data: SlideData) => void
  updateSlide: (id: string, patch: Partial<SlideData>) => void
  removeSlide: (id: string) => void
}

export const useSlideStore = create<SlideStore>((set) => ({
  slides: {},
  addSlide: (id, data) =>
    set((s) => ({ slides: { ...s.slides, [id]: data } })),
  updateSlide: (id, patch) =>
    set((s) => ({
      slides: { ...s.slides, [id]: { ...s.slides[id], ...patch } },
    })),
  removeSlide: (id) =>
    set((s) => {
      const next = { ...s.slides }
      delete next[id]
      return { slides: next }
    }),
}))

export const SAMPLE_HTML = `<div style="width:100%;height:100%;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px;font-family:'Segoe UI',sans-serif;color:white;">
  <h1 style="font-size:2.5rem;font-weight:800;margin:0 0 16px;text-align:center;letter-spacing:-1px;">Welcome to Slide Canvas</h1>
  <p style="font-size:1.1rem;opacity:0.85;text-align:center;max-width:420px;line-height:1.6;">Paste any HTML into the editor. It renders live on the infinite canvas.</p>
  <div style="margin-top:32px;padding:12px 28px;background:rgba(255,255,255,0.2);border-radius:100px;font-size:0.9rem;font-weight:600;letter-spacing:0.5px;">Click to edit →</div>
</div>`

