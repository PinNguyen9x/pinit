import { useTheme } from '@mui/material'
import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

export interface BackgroundFxProps {
  variant?: 'aurora'
  breathe?: boolean
  parallax?: boolean
  showStars?: boolean
  starCount?: number
}

export function BackgroundFx({
  variant = 'aurora',
  breathe = true,
  parallax = true,
  showStars = true,
  starCount = 18,
}: BackgroundFxProps) {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const parallaxRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  // Scroll handler: drives parallax AND toggles body.is-scrolling so CSS can
  // pause every background animation while the user is actively moving. This
  // is the cheapest possible scroll path — one rAF-coalesced read of scrollY
  // plus a class toggle. The 120ms timeout below restores animations almost
  // imperceptibly after scrolling stops.
  useEffect(() => {
    let raf = 0
    let idleTimeout: ReturnType<typeof setTimeout> | null = null

    const onScroll = () => {
      document.body.classList.add('is-scrolling')
      if (idleTimeout) clearTimeout(idleTimeout)
      idleTimeout = setTimeout(() => {
        document.body.classList.remove('is-scrolling')
      }, 120)

      if (!parallax || raf) return
      raf = requestAnimationFrame(() => {
        raf = 0
        if (!parallaxRef.current) return
        parallaxRef.current.style.setProperty(
          '--parallax',
          `-${window.scrollY * 0.1}px`
        )
      })
    }

    if (!parallax) {
      parallaxRef.current?.style.setProperty('--parallax', '0px')
    } else {
      onScroll()
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (raf) cancelAnimationFrame(raf)
      if (idleTimeout) clearTimeout(idleTimeout)
      document.body.classList.remove('is-scrolling')
    }
  }, [parallax])

  const stars = useMemo(
    () =>
      Array.from({ length: starCount }).map(() => ({
        left: Math.random() * 100,
        top: Math.random() * 100,
        delay: Math.random() * 6,
        size: Math.random() * 1.5 + 1,
      })),
    [starCount]
  )

  if (!mounted) return null

  return createPortal(
    <div data-theme={isDark ? 'dark' : 'light'} aria-hidden="true">
      <div className="bg-fx-layer bg-fx-base" />
      <div ref={parallaxRef} className="bg-fx-layer bg-fx-parallax">
        <div className={`bg-fx-motion ${breathe ? 'motion-breathe' : ''}`}>
          {variant === 'aurora' && <div className="bg-fx-mesh" />}
        </div>
      </div>
      {showStars && isDark && (
        <div className="bg-fx-stars">
          {stars.map((s, i) => (
            <span
              key={i}
              style={{
                left: `${s.left}%`,
                top: `${s.top}%`,
                width: `${s.size}px`,
                height: `${s.size}px`,
                animationDelay: `${-s.delay}s`,
              }}
            />
          ))}
        </div>
      )}
      <div className="bg-fx-vignette" />
    </div>,
    document.body
  )
}
