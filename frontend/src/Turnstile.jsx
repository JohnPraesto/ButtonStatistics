import { useEffect, useRef, useCallback } from 'react'

/**
 * Cloudflare Turnstile component for bot verification.
 * Renders the Turnstile widget and handles token verification.
 */
export default function Turnstile({ siteKey, onVerify, onError, onExpire }) {
  const containerRef = useRef(null)
  const widgetIdRef = useRef(null)

  const handleVerify = useCallback((token) => {
    onVerify?.(token)
  }, [onVerify])

  const handleError = useCallback(() => {
    onError?.()
  }, [onError])

  const handleExpire = useCallback(() => {
    onExpire?.()
  }, [onExpire])

  useEffect(() => {
    if (!siteKey || !containerRef.current) return

    // Wait for Turnstile to be loaded
    const renderWidget = () => {
      if (typeof window.turnstile === 'undefined') {
        // Turnstile not loaded yet, retry
        setTimeout(renderWidget, 100)
        return
      }

      // Clear any existing widget
      if (widgetIdRef.current !== null) {
        try {
          window.turnstile.remove(widgetIdRef.current)
        } catch {
          // Widget may already be removed
        }
        widgetIdRef.current = null
      }

      // Render new widget
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        callback: handleVerify,
        'error-callback': handleError,
        'expired-callback': handleExpire,
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
  }, [siteKey, handleVerify, handleError, handleExpire])

  // Method to reset the widget (can be called via ref)
  const reset = useCallback(() => {
    if (widgetIdRef.current !== null && typeof window.turnstile !== 'undefined') {
      window.turnstile.reset(widgetIdRef.current)
    }
  }, [])

  return (
    <div className="turnstile-container">
      <div ref={containerRef} />
    </div>
  )
}
