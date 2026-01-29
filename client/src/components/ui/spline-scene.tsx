'use client'

import { Suspense, lazy, useState, useEffect, useCallback, memo } from 'react'

const Spline = lazy(() => import('@splinetool/react-spline'))

interface SplineSceneProps {
  scene: string
  className?: string
  onLoad?: () => void
}

// Premium loading skeleton
function SplineLoadingSkeleton() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="relative flex flex-col items-center gap-4">
        {/* Animated robot silhouette */}
        <div 
          className="w-32 h-32 rounded-full animate-pulse"
          style={{
            background: 'radial-gradient(circle, rgba(139,92,246,0.2) 0%, rgba(139,92,246,0.05) 60%, transparent 70%)'
          }}
        />
        {/* Loading ring */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div 
            className="w-20 h-20 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin"
            style={{ animationDuration: '1s' }}
          />
        </div>
        {/* Loading text */}
        <span className="text-[13px] text-white/40 font-medium">Loading 3D...</span>
      </div>
    </div>
  )
}

function SplineSceneInner({ scene, className, onLoad }: SplineSceneProps) {
  const [isReady, setIsReady] = useState(false)
  const [shouldRender, setShouldRender] = useState(false)

  // Defer rendering until after first paint
  useEffect(() => {
    const hasIdleCallback = 'requestIdleCallback' in window
    let timerId: ReturnType<typeof setTimeout> | number
    
    if (hasIdleCallback) {
      timerId = (window as Window).requestIdleCallback(() => setShouldRender(true), { timeout: 100 })
    } else {
      timerId = setTimeout(() => setShouldRender(true), 50)
    }
    
    return () => {
      if (hasIdleCallback) {
        (window as Window).cancelIdleCallback(timerId as number)
      } else {
        clearTimeout(timerId)
      }
    }
  }, [])

  const handleLoad = useCallback(() => {
    setIsReady(true)
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
          transition: 'opacity 0.5s ease-out'
        }}
      >
        <Spline
          scene={scene}
          className="w-full h-full"
          onLoad={handleLoad}
        />
      </div>
      {!isReady && (
        <div className="absolute inset-0">
          <SplineLoadingSkeleton />
        </div>
      )}
    </Suspense>
  )
}

export const SplineScene = memo(SplineSceneInner)

export default SplineScene
