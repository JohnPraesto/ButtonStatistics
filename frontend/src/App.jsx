import { useState, useEffect, useMemo, memo} from 'react'
import './App.css'
import * as signalR from '@microsoft/signalr'
import { Line, Bar } from 'react-chartjs-2'
import Turnstile from './Turnstile'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement, 
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler, ChartDataLabels)
ChartJS.defaults.plugins.datalabels = {
  ...(ChartJS.defaults.plugins.datalabels ?? {}),
  display: false
}

const LineChart = memo(function LineChart({ data, options }) {
  return (
    <div className="chart">
      <Line data={data} options={options} />
    </div>
  )
})

const BarChart = memo(function BarChart({ data, options }) {
  return (
    <div className="chart">
      <Bar data={data} options={options} />
    </div>
  )
})

const InfoBox = memo(function InfoBox({ open, onClose, children}) {
  if (!open) return null

  return (
    <div className="info-box" role="note">
      <p className="info-box__p">
        {children}
        <button type="button" className="info-box__close" onClick={onClose} aria-label="Close">
        ×
        </button>
      </p>
    </div>
  )
})

const ClickProgress = memo(function ClickProgress({ total, max, markerValue, markerText}) {
  const percentage = max > 0 ? (total / max) * 100 : 0
  const formatted = useMemo(() => new Intl.NumberFormat('sv-SE'), []) // this makes 1000000 into 1 000 000 (more readable)


  const markerPercentPosition = useMemo(() => {
    if (!max || !markerValue) return null
    const percent = (markerValue / max) * 100  // Räknar ut hur många procent in i progress baren stjärnan ska placeras
    return Math.max(0, Math.min(100, percent))
  }, [markerValue, max])

  return (
    <div className="top-progress">
      <div className="top-progress__track" role="progressbar" aria-valuemin={0} aria-valuemax={max} aria-valuenow={total} aria-valuetext={`${formatted.format(total)} of ${formatted.format(max)}`}>

        <div className="top-progress__clip" aria-hidden="true">
          <div className="top-progress__fill" style={{ width: `${percentage}%` }}></div>
        </div>

        {markerPercentPosition != null && markerText ? (
          <button type="button" className="top-progress__marker" style={{ left: `${markerPercentPosition}%` }}>
            <img className="top-progress__marker-icon" src="/StarIcon.png" alt="" aria-hidden="true" draggable="false" />
            <span className="top-progress__tooltip" role="tooltip">
              {markerText}
            </span>
          </button>
        ) : null}

        <span className="top-progress__value">Total clicks: {formatted.format(total)}</span>
        <span className="top-progress__label top-progress__label--min">{formatted.format(0)}</span>
        <span className="top-progress__label top-progress__label--max">{formatted.format(max)}</span>
      
      </div>
    </div>
  )
})

const MilestoneModal = memo(function MilestoneModal({ open, milestone, total, variant, onClose }) {
  const formatted = useMemo(() => new Intl.NumberFormat('sv-SE'), [])
  const [confirmClose, setConfirmClose] = useState(false)

  useEffect(() => {
    if (open) setConfirmClose(false)
  }, [open])

  if (!open) return null

  const handleCloseClick = () => {
    if (variant === 'self' && !confirmClose) {
      setConfirmClose(true)
      return
    }
    onClose()
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="milestone-title"
        onMouseDown={(e) => e.stopPropagation()}
      >

        {variant === 'self' ? (
          <>
            <h1 id="milestone-title">Congratulations!</h1>
            <h2>
              You made the <strong>{formatted.format(milestone)}</strong>th click!
            </h2>
            {/* Future: make a form when filled send with Mailjet */}
            <p>
              Email a screenshot of this window to john_praesto@hotmail.com and wish for a charity or a non-profit association to get a {total / 1000} SEK donation from me
            </p>
          </>
        ) : (
          <>
            <h1 id="milestone-title">Milestone reached</h1>
            <h2>
              Someone just made the <strong>{formatted.format(milestone)}</strong>th click!
            </h2>
          </>
        )}
        {/* the two diffirent modals will need diffirent close buttons */}
        <div className="modal-actions"> 
          <button className="modal-close" onClick={handleCloseClick}>
            {confirmClose
              ? 'Did you take a print screen? You will not see this window again.'
              : 'Close'}
          </button>
        </div>
      </div>
    </div>
  )
})

function App() {
  const apiUrl = import.meta.env.VITE_API_URL ?? '';

  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(max-width: 640px)').matches
  })

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 640px)')
    const onChange = (e) => setIsMobile(e.matches)
    if (mq.addEventListener) mq.addEventListener('change', onChange)
    else mq.addListener(onChange)
    setIsMobile(mq.matches)
    return () => {
      if (mq.removeEventListener) mq.removeEventListener('change', onChange)
      else mq.removeListener(onChange)
    }
  }, [])

  const [infoDismissed, setInfoDismissed] = useState(() => {
    try {
      return localStorage.getItem('infoBoxDismissed') === '1'
    } catch {
      return false
    }
  })

  const [infoDismissed2, setInfoDismissed2] = useState(() => {
    try {
      return localStorage.getItem('infoBoxDismissed2') === '1'
    } catch {
      return false
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem('infoBoxDismissed', infoDismissed ? '1' : '0')
    } catch {
      // ignore
    }
  }, [infoDismissed])

  useEffect(() => {
    try {
      localStorage.setItem('infoBoxDismissed2', infoDismissed2 ? '1' : '0')
    } catch {
      // ignore
    }
  }, [infoDismissed2])

  const scrollToTop = () => {
    if (typeof window === 'undefined') return
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleAboutClick = () => {
    const anyDismissed = infoDismissed || infoDismissed2
    if (anyDismissed) {
      setInfoDismissed(false)
      setInfoDismissed2(false)
      requestAnimationFrame(scrollToTop)
      return
    }
    scrollToTop()
  }

  const countryNameFormatter = useMemo(() => {
    const locale = (typeof navigator !== 'undefined' && navigator.language) ? navigator.language : 'en'
    try {
      return new Intl.DisplayNames([locale], { type: 'region' })
    } catch {
      return null
    }
  }, [])

  const getCountryName = (code) => {
    const upper = (code ?? '').toUpperCase()
    if (upper === 'ZZ') return 'Unknown'
    if (!countryNameFormatter) return upper
    return countryNameFormatter.of(upper) ?? upper
  }

  const [milestoneModal, setMilestoneModal] = useState({ open: false, milestone: null, total: null, variant: 'other' })

  const [seconds, setSeconds] = useState([])
  const [minutes, setMinutes] = useState([])
  const [hours, setHours] = useState([])
  const [days, setDays] = useState([])
  const [months, setMonths] = useState([])
  const [years, setYears] = useState([])
  const [localHours, setLocalHours] = useState([])
  const [localWeekdays, setLocalWeekdays] = useState([])
  const [localMonths, setLocalMonths] = useState([])
  const [countriesByCode, setCountriesByCode] = useState([])
  const [total, setTotal] = useState(0)

  const [myClicks, setMyClicks] = useState(() => {
    const saved = localStorage.getItem('myClicks')
    return saved ? parseInt(saved, 10) || 0 : 0
  })

  // Turnstile state for bot protection
  const [turnstileRequired, setTurnstileRequired] = useState(false)
  const [turnstileSiteKey, setTurnstileSiteKey] = useState(null)
  const [turnstileToken, setTurnstileToken] = useState(null)
  const [rateLimitInfo, setRateLimitInfo] = useState({ minuteCount: 0, hourCount: 0, sustainedActivity: false })

  const sortedCountries = useMemo(() => {
    // Convert { SE: 10, US: 5 } -> [{ countryCode: 'SE', count: 10 }, ...]
    const list = Object.entries(countriesByCode).map(([countryCode, count]) => ({
      countryCode,
      count
    }))

    list.sort((a, b) => (b.count - a.count) || a.countryCode.localeCompare(b.countryCode))
    return list
  }, [countriesByCode])

  useEffect(() => {
    localStorage.setItem('myClicks', String(myClicks))
  }, [myClicks])

  const fetchSeconds = async () => {
    try {
      const res = await fetch(`${apiUrl}/seconds`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setSeconds(data)
    } catch (err) {
      console.error('Failed to load clicks:', err)
    }
  }

  const fetchMinutes = async () => {
    try {
      const res = await fetch(`${apiUrl}/minutes`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setMinutes(data)
    } catch (err) {
      console.error('Failed to load minutes:', err)
    }
  }

  const fetchHours = async () => {
    try {
      const res = await fetch(`${apiUrl}/hours`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setHours(data)
    } catch (err) {
      console.error('Failed to load hours:', err)
    }
  }

  const fetchDays = async () => {
    try {
      const res = await fetch(`${apiUrl}/days`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setDays(data)
    } catch (err) {
      console.error('Failed to load days:', err)
    }
  }

  const fetchMonths = async () => {
    try {
      const res = await fetch(`${apiUrl}/months`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setMonths(data)
    } catch (err) {
      console.error('Failed to load months:', err)
    }
  }

  const fetchYears = async () => {
    try {
      const res = await fetch(`${apiUrl}/years`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setYears(data)
    } catch (err) {
      console.error('Failed to load years:', err)
    }
  }

  const fetchLocalHours = async () => {
    try {
      const res = await fetch(`${apiUrl}/local-hours`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setLocalHours(data)
    } catch (err) {
      console.error('Failed to load local hours:', err)
    }
  }

  const fetchLocalWeekdays = async () => {
    try {
      const res = await fetch(`${apiUrl}/local-weekdays`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setLocalWeekdays(data)
    } catch (err) {
      console.error('Failed to load local weekdays:', err)
    }
  }

  const fetchLocalMonths = async () => {
    try {
      const res = await fetch(`${apiUrl}/local-months`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setLocalMonths(data)
    } catch (err) {
      console.error('Failed to load local months:', err)
    }
  }

  const fetchCountries = async () => {
    try {
      const res = await fetch(`${apiUrl}/country-clicks`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      const next = {}
      for (const row of (Array.isArray(data) ? data : [])) {
        if (!row?.countryCode) continue
        next[row.countryCode] = typeof row.count === 'number' ? row.count : 0
      }
      setCountriesByCode(next)
    } catch (err) {
      console.error('Failed to load country clicks:', err)
    }
  }

  const fetchTotal = async () => {
    try {
      const res = await fetch(`${apiUrl}/total-clicks`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setTotal(data.count ?? 0)
    } catch (err) {
      console.error('Failed to load total:', err)
    }
  }

  useEffect(() => {
    fetchSeconds()
    fetchMinutes()
    fetchHours()
    fetchDays()
    fetchMonths()
    fetchYears()
    fetchLocalHours()
    fetchLocalWeekdays()
    fetchLocalMonths()
    fetchCountries()
    fetchTotal()
  }, [])

  useEffect(() => {

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`${apiUrl}/hubs/clicks`, {withCredentials: false})
      .withAutomaticReconnect()
      .build()

    connection.on('statsUpdated', (payload) => {
      if (payload.second) {
        setSeconds(prev => {
          const i = prev.findIndex(s => s.index === payload.second.index)
          if (i < 0) return prev
          const next = [...prev]
          next[i] = { ...next[i], count: payload.second.count }
          return next
        })
      }

      if (typeof payload.total === 'number') setTotal(payload.total)

      if (payload.localHour) {
        setLocalHours(prev => {
          const i = prev.findIndex(h => h.index === payload.localHour.index)
          if (i >= 0) {
            const next = [...prev]
            if (next[i].count === payload.localHour.count) return prev
            next[i] = { ...next[i], count: payload.localHour.count }
            return next
          }
          return [...prev, payload.localHour].sort((a, b) => a.index - b.index)
        })
      }

      if (payload.localWeekday) {
        setLocalWeekdays(prev => {
          const i = prev.findIndex(w => w.index === payload.localWeekday.index)
          if (i >= 0) {
            const next = [...prev]
            if (next[i].count === payload.localWeekday.count) return prev
            next[i] = { ...next[i], count: payload.localWeekday.count }
            return next
          }
          return [...prev, payload.localWeekday].sort((a, b) => a.index - b.index)
        })
      }

      if (payload.localMonth) {
        setLocalMonths(prev => {
          const i = prev.findIndex(m => m.index === payload.localMonth.index)
          if (i >= 0) {
            const next = [...prev]
            if (next[i].count === payload.localMonth.count) return prev
            next[i] = { ...next[i], count: payload.localMonth.count }
            return next
          }
          return [...prev, payload.localMonth].sort((a, b) => a.index - b.index)
        })
      }

      if (payload.country?.code && typeof payload.country.count === 'number') {
        setCountriesByCode(prev => {
          const code = payload.country.code
          const nextCount = payload.country.count
          if (prev[code] === nextCount) return prev
          return { ...prev, [code]: nextCount }
        })
      }
    })

    connection.on('secondReset', ({ index }) => {
      setSeconds(prev => {
        const i = prev.findIndex(r => r.index === index)
        if (i >= 0) {
          const next = [...prev]
          next[i] = { ...next[i], count: 0 }
          return next
        }
        return prev
      })
    })

    connection.on('minuteUpdated', ({ index, count }) => {
      setMinutes(prev => {
        const i = prev.findIndex(m => m.index === index)
        if (i >= 0) {
          const next = [...prev]
          next[i] = { ...next[i], count }
          return next
        }
        return prev
      })
    })

    connection.on('hourUpdated', ({ index, count }) => {
      setHours(prev => {
        const i = prev.findIndex(h => h.index === index)
        if (i >= 0) {
          const next = [...prev]
          next[i] = { ...next[i], count }
          return next
        }
        return prev
      })
    })

    connection.on('dayUpdated', ({ index, count }) => {
      setDays(prev => {
        const i = prev.findIndex(d => d.index === index)
        if (i >= 0) {
          const next = [...prev]
          next[i] = { ...next[i], count }
          return next
        }
        return prev
      })
    })

    connection.on('monthUpdated', ({ index, count }) => {
      setMonths(prev => {
        const i = prev.findIndex(m => m.index === index)
        if (i >= 0) {
          const next = [...prev]
          next[i] = { ...next[i], count }
          return next
        }
        return prev
      })
    })
    
    connection.on('yearUpdated', ({ index, count }) => {
      setYears(prev => {
        const i = prev.findIndex(y => y.index === index)
        if (i >= 0) {
          const next = [...prev]
          next[i] = { ...next[i], count }
          return next
        }
        return prev
      })
    })

    connection.on('milestoneReached', (payload) => {
      if (!payload?.milestone) return

      // Dedupe (prevents the clicker from getting both HTTP + SignalR modals)
      setMilestoneModal({
        open: true,
        milestone: payload.milestone,
        total: payload.total ?? null,
        variant: 'other'
      })
    })
    
  connection.start().catch(err => console.error('SignalR start failed:', err))
    return () => { connection.stop().catch(() => {}) }
  }, [apiUrl])

  const handleClick = async () => {
    try {
      const requestBody = { 
        localHour: new Date().getHours(), 
        localWeekday: new Date().getDay(), 
        localMonth: new Date().getMonth(),
        turnstileToken: turnstileToken // Include token if available
      }
      
      const res = await fetch(`${apiUrl}/clicks/increment-now`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody) 
      })
      
      const payload = await res.json().catch(() => null)
      
      // Handle Turnstile requirement
      if (res.status === 403 && payload?.error === 'turnstile_required') {
        setTurnstileRequired(true)
        setTurnstileSiteKey(payload.siteKey)
        setRateLimitInfo({ 
          minuteCount: payload.minuteCount, 
          hourCount: payload.hourCount,
          sustainedActivity: payload.sustainedActivity 
        })
        return
      }
      
      if (res.status === 403 && payload?.error === 'turnstile_invalid') {
        // Token was invalid, show widget again
        setTurnstileToken(null)
        setTurnstileSiteKey(payload.siteKey)
        return
      }
      
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      
      // Clear turnstile state on successful click
      if (turnstileToken) {
        setTurnstileToken(null)
        setTurnstileRequired(false)
      }
      
      // Update rate limit info from response
      if (payload?.rateLimit) {
        setRateLimitInfo({ 
          minuteCount: payload.rateLimit.minuteCount, 
          hourCount: payload.rateLimit.hourCount,
          sustainedActivity: payload.rateLimit.sustainedActivity 
        })
        if (payload.rateLimit.requiresTurnstile) {
          setTurnstileRequired(true)
          // Fetch the site key if we don't have it
          if (!turnstileSiteKey) {
            try {
              const statusRes = await fetch(`${apiUrl}/clicks/turnstile-status`)
              const statusData = await statusRes.json()
              if (statusData.siteKey) {
                setTurnstileSiteKey(statusData.siteKey)
              }
            } catch {
              // Ignore fetch error
            }
          }
        }
      }
      
      setMyClicks(c => c + 1)
      if (payload?.milestoneHit) {
        setMilestoneModal({ open: true, milestone: payload.milestone, total: payload.total, variant: 'self' })
      }
    } catch (err) {
      console.error('Failed to increment:', err)
    }
  }

  // Handle Turnstile verification success
  const handleTurnstileVerify = async (token) => {
    setTurnstileToken(token)
    
    // Immediately try to make a click with the token
    try {
      const requestBody = { 
        localHour: new Date().getHours(), 
        localWeekday: new Date().getDay(), 
        localMonth: new Date().getMonth(),
        turnstileToken: token
      }
      
      const res = await fetch(`${apiUrl}/clicks/increment-now`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody) 
      })
      
      const payload = await res.json().catch(() => null)
      
      if (res.ok) {
        // Success! Clear turnstile state
        setTurnstileToken(null)
        setTurnstileRequired(false)
        setMyClicks(c => c + 1)
        
        // Update rate limit info
        if (payload?.rateLimit) {
          setRateLimitInfo({ 
            minuteCount: payload.rateLimit.minuteCount, 
            hourCount: payload.rateLimit.hourCount,
            sustainedActivity: payload.rateLimit.sustainedActivity 
          })
        }
        
        if (payload?.milestoneHit) {
          setMilestoneModal({ open: true, milestone: payload.milestone, total: payload.total, variant: 'self' })
        }
      } else {
        // Verification failed, reset token so they can try again
        setTurnstileToken(null)
      }
    } catch (err) {
      console.error('Failed to verify click:', err)
      setTurnstileToken(null)
    }
  }

  const currentUtcSecond = new Date().getUTCSeconds();
  const currentUtcMinute = new Date().getUTCMinutes();
  const currentUtcHour = new Date().getUTCHours();
  const currentUtcDay = new Date().getUTCDate();
  const currentUtcMonth = new Date().getUTCMonth();
  const currentUtcYear = new Date().getUTCFullYear();

  // Den här ska vara effektivare än den utkommenterade seconds-charten
  // för att useMemo sparar data (i cachen?) så att hela charten
  // inte behöver re-renderas varje gång. (?)
  // Samma lösning can be applied to the other charts but...
  // ... visst om jag märker att det blir nödvändigt i framtiden.
  const secMap = useMemo(() => new Map(seconds.map(s => [s.index, s.count])), [seconds])
  const rotatedSecondIndices = useMemo(() => Array.from({ length: 60 }, (_, k) => (currentUtcSecond + 1 + k) % 60),[currentUtcSecond])
  const secLabels = useMemo(() => rotatedSecondIndices.map(i => i.toString()), [rotatedSecondIndices])
  const secCounts = useMemo(() => rotatedSecondIndices.map(i => secMap.get(i) ?? 0), [rotatedSecondIndices, secMap])
  const secondsData = useMemo(() => ({
    labels: secLabels,
    datasets: [{
      label: 'Seconds',
      data: secCounts,
      backgroundColor: (ctx) => {
        const chart = ctx.chart
        const { ctx: c, chartArea } = chart
        if (!chartArea) return 'rgba(100,108,255,0.2)'
        const gradient = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom)
        gradient.addColorStop(0, 'rgba(100,108,255,0.25)')
        gradient.addColorStop(1, 'rgba(100,108,255,0)')
        return gradient
      },
      borderColor: '#646cff',
      borderWidth: 1,
      pointRadius: 3,
      fill: true
    }]
  }), [secLabels, secCounts])
  const secondsOptions = useMemo(() => ({
    responsive: true,
    animation: false,
    normalized: true,
    plugins: { legend: { display: false }, title: { display: true, text: 'Clicks during the last minute' } },
    scales: {
      x: { title: { display: true, text: 'Second' }, ticks: { display: false } },
      y: { beginAtZero: true, title: { display: !isMobile, text: 'Count' }, ticks: { precision: 0 } }
    }
  }), [isMobile])

  // const secMap = new Map(seconds.map(s => [s.index, s.count]));
  // const rotatedSecondIndices = Array.from({ length: 60 }, (_, k) => (currentUtcSecond + 1 + k) % 60);
  // const secLabels = rotatedSecondIndices.map(i => i.toString());
  // const secCounts = rotatedSecondIndices.map(i => secMap.get(i) ?? 0);
  // const secondsData = {
  //   labels: secLabels,
  //   datasets: [{ 
  //     label: 'Seconds', 
  //     data: secCounts,
  //     backgroundColor: (ctx) => {
  //       const chart = ctx.chart
  //       const { ctx: c, chartArea } = chart
  //       if (!chartArea) return 'rgba(100,108,255,0.2)' // fallback during initial render
  //       const gradient = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom)
  //       gradient.addColorStop(0, 'rgba(100,108,255,0.25)')
  //       gradient.addColorStop(1, 'rgba(100,108,255,0)')
  //       return gradient
  //     },
  //     borderColor: '#646cff', 
  //     borderWidth: 1,
  //     pointRadius: 3, 
  //     fill: true }]
  // }
  // const secondsOptions = {
  //   responsive: true,
  //   animation: false,
  //   plugins: { legend: { display: false }, title: { display: true, text: 'Clicks during the last minute' } },
  //   scales: {
  //     x: { title: { display: true, text: 'Second' }, ticks: {display: false}},
  //     y: { beginAtZero: true, title: { display: true, text: 'Count' }, ticks: { precision: 0 } }
  //   }
  // }

  const minuteMap = useMemo(() => new Map(minutes.map(m => [m.index, m.count])), [minutes])
  const rotatedMinuteIndices = useMemo(() => Array.from({ length: 60 }, (_, k) => (currentUtcMinute + 1 + k) % 60), [currentUtcMinute])
  const minuteLabels = useMemo(() => rotatedMinuteIndices.map(i => i.toString()), [rotatedMinuteIndices])
  const minuteCounts = useMemo(() => rotatedMinuteIndices.map(i => minuteMap.get(i) ?? 0), [rotatedMinuteIndices, minuteMap])
  const minutesData = useMemo(() => ({
    labels: minuteLabels,
    datasets: [{
      label: 'Minutes',
      data: minuteCounts,
      backgroundColor: (ctx) => {
        const chart = ctx.chart
        const { ctx: c, chartArea } = chart
        if (!chartArea) return 'rgba(34,197,94,0.2)'
        const gradient = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom)
        gradient.addColorStop(0, 'rgba(34,197,94,0.25)')
        gradient.addColorStop(1, 'rgba(34,197,94,0)')
        return gradient
      },
      borderColor: '#22c55e',
      borderWidth: 1,
      pointRadius: 3,
      fill: true
    }]
  }), [minuteLabels, minuteCounts])
  const minutesOptions = useMemo(() => ({
    responsive: true,
    animation: false,
    normalized: true,
    plugins: { legend: { display: false }, title: { display: true, text: 'Last hour' } },
    scales: {
      x: { title: { display: true, text: 'Minute' } },
      y: { beginAtZero: true, title: { display: !isMobile, text: 'Count' }, ticks: { precision: 0 } }
    }
  }), [isMobile])

  const hourMap = useMemo(() => new Map(hours.map(h => [h.index, h.count])), [hours])
  const rotatedHourIndices = useMemo(() => Array.from({ length: 24 }, (_, k) => (currentUtcHour + 1 + k) % 24), [currentUtcHour])
  const hourLabels = useMemo(() => rotatedHourIndices.map(i => i.toString()), [rotatedHourIndices])
  const hourCounts = useMemo(() => rotatedHourIndices.map(i => hourMap.get(i) ?? 0), [rotatedHourIndices, hourMap])
  const hoursData = useMemo(() => ({
    labels: hourLabels,
    datasets: [{
      label: 'Hours',
      data: hourCounts,
      backgroundColor: (ctx) => {
        const chart = ctx.chart
        const { ctx: c, chartArea } = chart
        if (!chartArea) return 'rgba(207, 17, 198, 0.2)'
        const gradient = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom)
        gradient.addColorStop(0, 'rgba(207, 17, 198, 0.25)')
        gradient.addColorStop(1, 'rgba(207, 17, 198, 0)')
        return gradient
      },
      borderColor: '#f137c9ff',
      borderWidth: 1,
      pointRadius: 3,
      fill: true
    }]
  }), [hourLabels, hourCounts])
  const hoursOptions = useMemo(() => ({
    responsive: true,
    animation: false,
    normalized: true,
    plugins: { legend: { display: false }, title: { display: true, text: 'Last day' } },
    scales: {
      x: { title: { display: true, text: 'Hour' } },
      y: { beginAtZero: true, title: { display: !isMobile, text: 'Count' }, ticks: { precision: 0 } }
    }
  }), [isMobile])

  const dayMap = useMemo(() => new Map(days.map(d => [d.index, d.count])), [days])
  const dayIndices = useMemo(() => Array.from({ length: 31 }, (_, i) => i + 1), [])
  const rotatedDayIndices = useMemo(() => {
    const rotated = [...dayIndices.slice(currentUtcDay), ...dayIndices.slice(0, currentUtcDay)]
    return rotated.slice(3) // remove first 3 elements => length 28
  }, [dayIndices, currentUtcDay])
  const dayLabels = useMemo(() => rotatedDayIndices.map(i => i.toString()), [rotatedDayIndices])
  const dayCounts = useMemo(() => rotatedDayIndices.map(i => dayMap.get(i) ?? 0), [rotatedDayIndices, dayMap])
  const daysData = useMemo(() => ({
    labels: dayLabels,
    datasets: [{
      label: 'Days',
      data: dayCounts,
      backgroundColor: (ctx) => {
        const chart = ctx.chart
        const { ctx: c, chartArea } = chart
        if (!chartArea) return 'rgba(207, 71, 17, 0.2)'
        const gradient = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom)
        gradient.addColorStop(0, 'rgba(207, 71, 17, 0.25)')
        gradient.addColorStop(1, 'rgba(207, 71, 17, 0)')
        return gradient
      },
      borderColor: '#c49c18c4',
      borderWidth: 1,
      pointRadius: 3,
      fill: true
    }]
  }), [dayLabels, dayCounts])
  const daysOptions = useMemo(() => ({
    responsive: true,
    animation: false,
    normalized: true,
    plugins: { legend: { display: false }, title: { display: true, text: 'Last month' } },
    scales: {
      x: { title: { display: true, text: 'Day' } },
      y: { beginAtZero: true, title: { display: !isMobile, text: 'Count' }, ticks: { precision: 0 } }
    }
  }), [isMobile])


  const monthMap = useMemo(() => new Map(months.map(m => [m.index, m.count])), [months])
  const monthIndices = useMemo(() => Array.from({ length: 12 }, (_, i) => i + 1), [])
  const monthFormatter = useMemo(() => new Intl.DateTimeFormat(undefined, { month: 'short' }), [])
  const rotatedMonthIndices = useMemo(() => {
    const k = (currentUtcMonth + 1) % monthIndices.length
    return [...monthIndices.slice(k), ...monthIndices.slice(0, k)]
  }, [currentUtcMonth, monthIndices])
  const monthLabels = useMemo(
    () => rotatedMonthIndices.map(i => monthFormatter.format(new Date(Date.UTC(2000, i - 1, 1)))),
    [rotatedMonthIndices, monthFormatter]
  )
  const monthCounts = useMemo(() => rotatedMonthIndices.map(i => monthMap.get(i) ?? 0), [rotatedMonthIndices, monthMap])
  const monthsData = useMemo(() => ({
    labels: monthLabels,
    datasets: [{
      label: 'Months',
      data: monthCounts,
      backgroundColor: (ctx) => {
        const chart = ctx.chart
        const { ctx: c, chartArea } = chart
        if (!chartArea) return 'rgba(206, 206, 206, 0.2)'
        const gradient = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom)
        gradient.addColorStop(0, 'rgba(206, 206, 206, 0.25)')
        gradient.addColorStop(1, 'rgba(206, 206, 206, 0)')
        return gradient
      },
      borderColor: '#969696c4',
      borderWidth: 1,
      pointRadius: 3,
      fill: true
    }]
  }), [monthLabels, monthCounts])
  const monthsOptions = useMemo(() => ({
    responsive: true,
    animation: false,
    normalized: true,
    plugins: { legend: { display: false }, title: { display: true, text: 'Last year' } },
    scales: {
      x: { title: { display: true, text: 'Month' } },
      y: { beginAtZero: true, title: { display: !isMobile, text: 'Count' }, ticks: { precision: 0 } }
    }
  }), [isMobile])

  const yearMap = useMemo(() => new Map(years.map(y => [y.index, y.count])), [years])
  const yearLabelsAndCounts = useMemo(() => {
    const availableYears = [...yearMap.keys()].sort((a, b) => a - b)
    const candidate = availableYears.filter(y => y <= currentUtcYear)
    const lastTenYears = (candidate.length >= 10 ? candidate.slice(-10) : availableYears.slice(-10))
    return {
      labels: lastTenYears.map(y => y.toString()),
      counts: lastTenYears.map(y => yearMap.get(y) ?? 0)
    }
  }, [yearMap, currentUtcYear])
  const yearsData = useMemo(() => ({
    labels: yearLabelsAndCounts.labels,
    datasets: [{
      label: 'Year',
      data: yearLabelsAndCounts.counts,
      backgroundColor: (ctx) => {
        const chart = ctx.chart
        const { ctx: c, chartArea } = chart
        if (!chartArea) return 'rgba(167, 84, 17, 0.2)'
        const gradient = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom)
        gradient.addColorStop(0, 'rgba(167, 84, 17, 0.25)')
        gradient.addColorStop(1, 'rgba(167, 84, 17, 0)')
        return gradient
      },
      borderColor: '#8f4e04ff',
      borderWidth: 1,
      pointRadius: 3,
      fill: true
    }]
  }), [yearLabelsAndCounts])
  const yearsOptions = useMemo(() => ({
    responsive: true,
    animation: false,
    normalized: true,
    plugins: { legend: { display: false }, title: { display: true, text: 'Last 10 years' } },
    scales: {
      x: { title: { display: true, text: 'Year' } },
      y: { beginAtZero: true, title: { display: !isMobile, text: 'Count' }, ticks: { precision: 0 } }
    }
  }), [isMobile])

  const localHourMap = useMemo(() => new Map(localHours.map(h => [h.index, h.count])), [localHours])
  const localHourIndices = useMemo(() => Array.from({ length: 24 }, (_, i) => i), [])
  const localHourLabels = useMemo(() => localHourIndices.map(i => i.toString()), [localHourIndices])
  const localHourCounts = useMemo(() => localHourIndices.map(i => localHourMap.get(i) ?? 0), [localHourIndices, localHourMap])
  const localHoursData = useMemo(() => ({
    labels: localHourLabels,
    datasets: [{
      label: 'Local hour of day',
      data: localHourCounts,
      backgroundColor: 'rgba(14,165,233,0.35)',
      borderColor: '#0ea5e9',
      borderWidth: 1
    }]
  }), [localHourLabels, localHourCounts])
  const localHoursOptions = useMemo(() => ({
    responsive: true,
    animation: false,
    normalized: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Clicks by local hour (0–23)' },
      datalabels: {
        display: true,
        color: 'rgba(255, 255, 255, 0.85)',
        anchor: 'end',
        align: 'end',
        offset: 2,
        clamp: true,
        formatter: (v) => (typeof v === 'number' && v > 0 ? v : ''),
        font: { size: isMobile ? 9 : 11, weight: '600' }
      }
    },
    scales: {
      x: { title: { display: true, text: 'Hour' } },
      y: { beginAtZero: true, title: { display: !isMobile, text: 'Count' }, ticks: { precision: 0 } }
    }
  }), [isMobile])

  const localWeekdayMap = useMemo(() => new Map(localWeekdays.map(w => [w.index, w.count])), [localWeekdays])
  const weekdayLabels = useMemo(() => ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], [])
  const weekdayIndices = useMemo(() => [1,2,3,4,5,6,0], [])
  const localWeekdayCounts = useMemo(() => weekdayIndices.map(i => localWeekdayMap.get(i) ?? 0), [weekdayIndices, localWeekdayMap])
  const localWeekdaysData = useMemo(() => ({
    labels: weekdayLabels,
    datasets: [{
      label: 'Clicks by weekday (local)',
      data: localWeekdayCounts,
      backgroundColor: 'rgba(99,102,241,0.35)',
      borderColor: '#6366f1',
      borderWidth: 1
    }]
  }), [weekdayLabels, localWeekdayCounts])
  const localWeekdaysOptions = useMemo(() => ({
    responsive: true,
    animation: false,
    normalized: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Clicks by weekday (local)' },
      datalabels: {
        display: true,
        color: 'rgba(255, 255, 255, 0.85)',
        anchor: 'end',
        align: 'end',
        offset: 2,
        clamp: true,
        formatter: (v) => (typeof v === 'number' && v > 0 ? v : ''),
        font: { size: isMobile ? 9 : 11, weight: '600' }
      }
    },
    scales: {
      x: { title: { display: true, text: 'Weekday' } },
      y: { beginAtZero: true, title: { display: !isMobile, text: 'Count' }, ticks: { precision: 0 } }
    }
  }), [isMobile])
  
  const localMonthMap = useMemo(() => new Map(localMonths.map(m => [m.index, m.count])), [localMonths])
  const localMonthIndices = useMemo(() => Array.from({ length: 12 }, (_, i) => i), [])
  const localMonthFormatter = useMemo(() => new Intl.DateTimeFormat(undefined, { month: 'short' }), [])
  const localMonthLabels = useMemo(
    () => localMonthIndices.map(i => localMonthFormatter.format(new Date(Date.UTC(2000, i, 1)))),
    [localMonthIndices, localMonthFormatter]
  )
  const localMonthCounts = useMemo(() => localMonthIndices.map(i => localMonthMap.get(i) ?? 0), [localMonthIndices, localMonthMap])
  const localMonthsData = useMemo(() => ({
    labels: localMonthLabels,
    datasets: [{
      label: 'Clicks by local month',
      data: localMonthCounts,
      backgroundColor: 'rgba(234,88,12,0.35)',
      borderColor: '#ea580c',
      borderWidth: 1
    }]
  }), [localMonthLabels, localMonthCounts])
  const localMonthsOptions = useMemo(() => ({
    responsive: true,
    animation: false,
    normalized: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Clicks by local month' },
      datalabels: {
        display: true,
        color: 'rgba(255, 255, 255, 0.85)',
        anchor: 'end',
        align: 'end',
        offset: 2,
        clamp: true,
        formatter: (v) => (typeof v === 'number' && v > 0 ? v : ''),
        font: { size: isMobile ? 9 : 11, weight: '600' }
      }
    },
    scales: {
      x: { title: { display: true, text: 'Month' } },
      y: { beginAtZero: true, title: { display: !isMobile, text: 'Count' }, ticks: { precision: 0 } }
    }
  }), [isMobile])

  return (
    <>
      <InfoBox open={!infoDismissed} onClose={() => setInfoDismissed(true)}>
        Generate real time statistics globally by clicking the button. View charts of recent clicks, clicks by local hour, weekday, month, and country.
      </InfoBox>

      <InfoBox open={!infoDismissed2} onClose={() => setInfoDismissed2(true)}>
        WIN A DONATION: Every 100 000th click I will donate 100 SEK. A pop up window will appear asking the lucky clicker for a charity to recieve the donation. At 1 000 000 clicks I will donate 1 000 SEK!
      </InfoBox>

      <MilestoneModal
          open={milestoneModal.open}
          milestone={milestoneModal.milestone}
          total={milestoneModal.total}
          variant={milestoneModal.variant}
          onClose={() => setMilestoneModal({ open: false, milestone: null, total: null, variant: 'other' })}
        />

      {/* Turnstile verification modal for bot protection */}
      {turnstileRequired && turnstileSiteKey && (
        <div className="modal-backdrop" role="presentation">
          <div className="modal turnstile-modal" role="dialog" aria-modal="true" aria-labelledby="turnstile-title">
            <h2 id="turnstile-title">Are you human?</h2>
            <p className="turnstile-info">
              {rateLimitInfo.sustainedActivity ? (
                <>You&apos;ve been clicking for over 10 hours straight! That&apos;s impressive dedication (or suspicious behavior).</>
              ) : (
                <>You&apos;ve been clicking a lot! ({rateLimitInfo.minuteCount} clicks/min, {rateLimitInfo.hourCount} clicks/hr)</>
              )}
              <br />
              Please verify you&apos;re not a bot to continue.
            </p>
            <Turnstile 
              siteKey={turnstileSiteKey} 
              onVerify={handleTurnstileVerify}
              onError={() => console.error('Turnstile error')}
              onExpire={() => setTurnstileToken(null)}
            />
            <p className="turnstile-hint">Complete the challenge above to continue clicking.</p>
          </div>
        </div>
      )}

      <ClickProgress 
        total={total} 
        max={1000000}
        markerValue={100000}
        markerText="The one who makes the 100 000th click will chose a charity to recieve a donation!"
        />
        
      <div className="sticky-header">
        <button onClick={handleClick} className="click-button">
          {myClicks}
        </button>
      </div>

      <div className="page-content">
        <LineChart data={secondsData} options={secondsOptions} />
        <LineChart data={minutesData} options={minutesOptions} />
        <LineChart data={hoursData} options={hoursOptions} />
        <LineChart data={daysData} options={daysOptions} />
        <LineChart data={monthsData} options={monthsOptions} />
        <LineChart data={yearsData} options={yearsOptions} />
        <BarChart data={localHoursData} options={localHoursOptions} />
        <BarChart data={localWeekdaysData} options={localWeekdaysOptions} />
        <BarChart data={localMonthsData} options={localMonthsOptions} />

        <h2>Clicks by country</h2>
        <table className="country-table">
          <thead>
            <tr>
              <th>Country</th>
              <th>Clicks</th>
            </tr>
          </thead>
          <tbody>
            {sortedCountries.map(c => (
              <tr key={c.countryCode}>
                <td className="country-table__code">
                  {getCountryName(c.countryCode)}
                </td>
                <td className="country-table__count">{c.count}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <button type="button" className="about-button" onClick={handleAboutClick}>
          About
        </button>

        <p>Created by John Praesto</p>

      </div>
    </>
  )
}

export default App