'use client'

import { Suspense, lazy, useState, useEffect, useCallback, memo, startTransition } from 'react'

// Preload Spline module immediately on import
const splinePromise = import('@splinetool/react-spline')
const Spline = lazy(() => splinePromise)

interface SplineSceneProps {
  scene: string
  className?: string
  onLoad?: () => void
}

// Lightweight loading skeleton - CSS only, no JS animations
const SplineLoadingSkeleton = memo(() => (
  <div 
    className="w-full h-full flex items-center justify-center"
    style={{ contain: 'strict' }}
  >
    <div className="relative flex flex-col items-center gap-4">
      <div 
        className="w-32 h-32 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(139,92,246,0.2) 0%, rgba(139,92,246,0.05) 60%, transparent 70%)',
          animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
        }}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <div 
          className="w-20 h-20 border-2 border-violet-500/30 border-t-violet-500 rounded-full"
          style={{ animation: 'spin 0.8s linear infinite' }}
        />
      </div>
    </div>
  </div>
))
SplineLoadingSkeleton.displayName = 'SplineLoadingSkeleton'

function SplineSceneInner({ scene, className, onLoad }: SplineSceneProps) {
  const [isReady, setIsReady] = useState(false)
  const [shouldRender, setShouldRender] = useState(false)

  // Start rendering immediately with startTransition for non-blocking update
  useEffect(() => {
    // Use microtask to ensure first paint happens first
    queueMicrotask(() => {
      startTransition(() => {
        setShouldRender(true)
      })
    })
  }, [])

  const handleLoad = useCallback(() => {
    startTransition(() => {
      setIsReady(true)
    })
    onLoad?.()
  }, [onLoad])

  if (!shouldRender) {
    return <SplineLoadingSkeleton />
  }

  return (
    <Suspense fallback={<SplineLoadingSkeleton />}>
      <div 
        className={className}
        style={{ 
          opacity: isReady ? 1 : 0,
          transition: 'opacity 0.3s ease-out',
          contain: 'layout style paint',
          willChange: isReady ? 'auto' : 'opacity',
          transform: 'translate3d(0,0,0)',
        }}
      >
        <Spline
          scene={scene}
          className="w-full h-full"
          onLoad={handleLoad}
        />
      </div>
      {!isReady && (
        <div className="absolute inset-0" style={{ contain: 'strict' }}>
          <SplineLoadingSkeleton />
        </div>
      )}
    </Suspense>
  )
}

export const SplineScene = memo(SplineSceneInner)

export default SplineScene

// Preload helper - call this early to start loading
export function preloadSplineScene(sceneUrl: string) {
  // Prefetch the scene file
  if (typeof window !== 'undefined') {
    const link = document.createElement('link')
    link.rel = 'prefetch'
    link.href = sceneUrl
    link.as = 'fetch'
    link.crossOrigin = 'anonymous'
    document.head.appendChild(link)
  }
}
