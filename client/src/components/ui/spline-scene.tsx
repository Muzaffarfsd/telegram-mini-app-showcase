'use client'

import { memo, useState, useRef, useEffect } from 'react'

interface SplineSceneProps {
  scene: string
  className?: string
  onLoad?: () => void
  iframeRefCallback?: (iframe: HTMLIFrameElement | null) => void
}

function SplineLoadingSkeleton() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="relative flex flex-col items-center gap-4">
        <div 
          className="w-32 h-32 rounded-full animate-pulse"
          style={{
            background: 'radial-gradient(circle, rgba(139,92,246,0.2) 0%, rgba(139,92,246,0.05) 60%, transparent 70%)'
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div 
            className="w-20 h-20 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin"
            style={{ animationDuration: '1s' }}
          />
        </div>
        <span className="text-[13px] text-white/40 font-medium mt-4">Loading 3D...</span>
      </div>
    </div>
  )
}

function SplineSceneInner({ scene, className, onLoad, iframeRefCallback }: SplineSceneProps) {
  const [isReady, setIsReady] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const iframeRef = useRef<HTMLIFrameElement | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const iframe = document.createElement('iframe')
    iframe.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;border:none;pointer-events:none;background:transparent;'
    iframe.setAttribute('tabindex', '-1')
    iframe.setAttribute('aria-hidden', 'true')
    iframe.setAttribute('loading', 'lazy')
    iframeRef.current = iframe

    const html = `<!DOCTYPE html>
<html><head>
<style>*{margin:0;padding:0}html,body{width:100%;height:100%;background:transparent;overflow:hidden}canvas{display:block;width:100%;height:100%}</style>
<script type="importmap">{"imports":{"@splinetool/runtime":"https://unpkg.com/@splinetool/runtime@1.9.82/build/runtime.js"}}</script>
</head><body>
<canvas id="c"></canvas>
<script type="module">
import { Application } from '@splinetool/runtime';
const canvas = document.getElementById('c');
const app = new Application(canvas);
app.load('${scene}').then(() => {
  window.parent.postMessage({type:'spline-loaded'},'*');
}).catch(err => console.error('[Spline iframe] Error:', err));
window.addEventListener('message', (e) => {
  if (e.data?.type === 'spline-stop') { try { app.stop(); } catch(ex){} }
  if (e.data?.type === 'spline-play') { try { app.play(); } catch(ex){} }
});
<\/script>
</body></html>`

    iframe.srcdoc = html
    containerRef.current.appendChild(iframe)
    iframeRefCallback?.(iframe)

    const handleMessage = (e: MessageEvent) => {
      if (e.source !== iframeRef.current?.contentWindow) return
      if (e.data?.type === 'spline-loaded') {
        setIsReady(true)
        onLoad?.()
      }
    }
    window.addEventListener('message', handleMessage)

    return () => {
      window.removeEventListener('message', handleMessage)
      iframeRefCallback?.(null)
      if (iframeRef.current?.contentWindow) {
        try { iframeRef.current.contentWindow.postMessage({ type: 'spline-stop' }, '*') } catch(e) {}
      }
      if (iframeRef.current?.parentNode) {
        try { iframeRef.current.parentNode.removeChild(iframeRef.current) } catch(e) {}
      }
      iframeRef.current = null
    }
  }, [scene, onLoad, iframeRefCallback])

  return (
    <div ref={containerRef} className={`relative ${className || ''}`} style={{ width: '100%', height: '100%' }}>
      {!isReady && (
        <div className="absolute inset-0 z-10">
          <SplineLoadingSkeleton />
        </div>
      )}
    </div>
  )
}

export const SplineScene = memo(SplineSceneInner)

export default SplineScene
