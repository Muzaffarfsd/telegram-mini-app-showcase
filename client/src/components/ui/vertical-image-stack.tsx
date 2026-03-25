import { useState, useCallback, useRef } from "react"

export type VerticalImageItem = {
  id: number
  src: string
  alt: string
}

interface VerticalImageStackProps {
  images: VerticalImageItem[]
  height?: number
  cardWidth?: number
  cardHeight?: number
}

export function VerticalImageStack({ 
  images, 
  height = 500,
  cardWidth = 280,
  cardHeight = 420 
}: VerticalImageStackProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const lastNavigationTime = useRef(0)
  const navigationCooldown = 400

  const touchStart = useRef<{ y: number; t: number } | null>(null)

  const navigate = useCallback((newDirection: number) => {
    const now = Date.now()
    if (now - lastNavigationTime.current < navigationCooldown) return
    lastNavigationTime.current = now

    setCurrentIndex((prev) => {
      if (newDirection > 0) {
        return prev === images.length - 1 ? 0 : prev + 1
      }
      return prev === 0 ? images.length - 1 : prev - 1
    })
  }, [images.length])

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStart.current = { y: e.touches[0].clientY, t: Date.now() }
  }, [])

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStart.current) return
    const dy = e.changedTouches[0].clientY - touchStart.current.y
    const dt = Date.now() - touchStart.current.t
    touchStart.current = null

    if (dt < 300 && Math.abs(dy) > 40) {
      e.preventDefault()
      navigate(dy < 0 ? 1 : -1)
    }
  }, [navigate])

  const getCardStyle = (index: number) => {
    const total = images.length
    let diff = index - currentIndex
    if (diff > total / 2) diff -= total
    if (diff < -total / 2) diff += total

    if (diff === 0) {
      return { y: 0, scale: 1, opacity: 1, zIndex: 5, rotateX: 0 }
    } else if (diff === -1) {
      return { y: -160, scale: 0.82, opacity: 0.6, zIndex: 4, rotateX: 8 }
    } else if (diff === -2) {
      return { y: -280, scale: 0.7, opacity: 0.3, zIndex: 3, rotateX: 15 }
    } else if (diff === 1) {
      return { y: 160, scale: 0.82, opacity: 0.6, zIndex: 4, rotateX: -8 }
    } else if (diff === 2) {
      return { y: 280, scale: 0.7, opacity: 0.3, zIndex: 3, rotateX: -15 }
    } else {
      return { y: diff > 0 ? 400 : -400, scale: 0.6, opacity: 0, zIndex: 0, rotateX: diff > 0 ? -20 : 20 }
    }
  }

  const isVisible = (index: number) => {
    const total = images.length
    let diff = index - currentIndex
    if (diff > total / 2) diff -= total
    if (diff < -total / 2) diff += total
    return Math.abs(diff) <= 2
  }

  return (
    <div
      className="relative flex w-full items-center justify-center overflow-hidden"
      style={{ height, touchAction: 'pan-y' }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div 
        className="relative flex items-center justify-center" 
        style={{ height: height, width: cardWidth, perspective: "1200px" }}
      >
        {images.map((image, index) => {
          if (!isVisible(index)) return null
          const s = getCardStyle(index)
          const isCurrent = index === currentIndex

          return (
            <div
              key={image.id}
              className="absolute"
              style={{
                transform: `translateY(${s.y}px) scale(${s.scale}) rotateX(${s.rotateX}deg)`,
                opacity: s.opacity,
                zIndex: s.zIndex,
                transformStyle: "preserve-3d",
                transition: 'transform 0.4s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.4s ease',
              }}
            >
              <div
                className="relative overflow-hidden rounded-3xl"
                style={{
                  width: cardWidth,
                  height: cardHeight,
                  boxShadow: isCurrent
                    ? "0 25px 50px -12px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05)"
                    : "0 10px 30px -10px rgba(0,0,0,0.3)",
                }}
              >
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-white/10 via-transparent to-transparent" />

                <img
                  src={image.src}
                  alt={image.alt}
                  className="absolute inset-0 w-full h-full object-cover"
                  draggable={false}
                  loading={isCurrent ? "eager" : "lazy"}
                />

                <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/60 to-transparent" />
              </div>
            </div>
          )
        })}
      </div>

      <div className="absolute right-4 top-1/2 flex -translate-y-1/2 flex-col gap-2 z-10">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              if (index !== currentIndex) setCurrentIndex(index)
            }}
            className="transition-all duration-300 rounded-full"
            style={{
              width: 8,
              height: index === currentIndex ? 24 : 8,
              background: index === currentIndex ? 'var(--text-primary, #fff)' : 'rgba(255,255,255,0.3)',
            }}
            aria-label={`Go to image ${index + 1}`}
          />
        ))}
      </div>

      <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
        <div className="flex flex-col items-center">
          <span className="text-3xl font-light tabular-nums" style={{ color: 'var(--text-primary, #fff)' }}>
            {String(currentIndex + 1).padStart(2, "0")}
          </span>
          <div className="my-2 h-px w-8" style={{ background: 'rgba(255,255,255,0.2)' }} />
          <span className="text-sm tabular-nums" style={{ color: 'var(--text-tertiary, #999)' }}>
            {String(images.length).padStart(2, "0")}
          </span>
        </div>
      </div>
    </div>
  )
}
