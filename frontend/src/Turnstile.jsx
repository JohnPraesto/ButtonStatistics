import { useEffect, useRef } from 'react'

/**
 * Cloudflare Turnstile component for bot verification.
 * Renders the Turnstile widget and handles token verification.
 * Uses refs for callbacks to prevent re-rendering on parent updates.
 */
export default function Turnstile({ siteKey, onVerify, onError, onExpire }) {
  const containerRef = useRef(null)
  const widgetIdRef = useRef(null)
  
  // Store callbacks in refs to avoid re-creating widget when parent re-renders
  const onVerifyRef = useRef(onVerify)
  const onErrorRef = useRef(onError)
  const onExpireRef = useRef(onExpire)
  
  // Keep refs up to date
  useEffect(() => {
    onVerifyRef.current = onVerify
    onErrorRef.current = onError
    onExpireRef.current = onExpire
  }, [onVerify, onError, onExpire])

  useEffect(() => {
    if (!siteKey || !containerRef.current) return

    // Wait for Turnstile to be loaded
    const renderWidget = () => {
      if (typeof window.turnstile === 'undefined') {
        // Turnstile not loaded yet, retry
        setTimeout(renderWidget, 100)
        return
      }

      // Don't re-render if widget already exists
      if (widgetIdRef.current !== null) {
        return
      }

      // Render new widget
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        callback: (token) => onVerifyRef.current?.(token),
        'error-callback': () => onErrorRef.current?.(),
        'expired-callback': () => onExpireRef.current?.(),
        theme: 'dark',
        size: 'normal'
      })
    }

    renderWidget()

    return () => {
      if (widgetIdRef.current !== null) {
        try {
          window.turnstile.remove(widgetIdRef.current)
        } catch {
          // Widget may already be removed
        }
        widgetIdRef.current = null
      }
    }
  }, [siteKey]) // Only re-run when siteKey changes

  return (
    <div className="turnstile-container">
      <div ref={containerRef} />
    </div>
  )
}
