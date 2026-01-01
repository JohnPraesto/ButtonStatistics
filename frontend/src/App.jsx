import { useState, useEffect, useMemo, memo } from 'react'
import './App.css'
import * as signalR from '@microsoft/signalr'
import { Line, Bar } from 'react-chartjs-2'
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

const ClickProgress = memo(function ClickProgress({ total, max }) {
  const percentage = max > 0 ? (total / max) * 100 : 0
  const formatted = useMemo(() => new Intl.NumberFormat('sv-SE'), []) // this makes 1000000 into 1 000 000 (more readable)

  return (
    <div className="top-progress">
      <div className="top-progress__track" role="progressbar" aria-valuemin={0} aria-valuemax={max} aria-valuenow={total} aria-valuetext={`${formatted.format(total)} of ${formatted.format(max)}`} title={`${formatted.format(total)} / ${formatted.format(max)}`}>

        <div className="top-progress__fill" style={{ width: `${percentage}%` }}></div>
        <span className="top-progress__value">Total clicks: {formatted.format(total)}</span>

        <span className="top-progress__label top-progress__label--min">{formatted.format(0)}</span>
        <span className="top-progress__label top-progress__label--max">{formatted.format(max)}</span>
      
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

  const [seconds, setSeconds] = useState([])
  const [minutes, setMinutes] = useState([])
  const [hours, setHours] = useState([])
  const [days, setDays] = useState([])
  const [months, setMonths] = useState([])
  const [years, setYears] = useState([])
  const [localHours, setLocalHours] = useState([])
  const [localWeekdays, setLocalWeekdays] = useState([])
  const [localMonths, setLocalMonths] = useState([])
  const [total, setTotal] = useState(0)

  const [myClicks, setMyClicks] = useState(() => {
    const saved = localStorage.getItem('myClicks')
    return saved ? parseInt(saved, 10) || 0 : 0
  })

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
    fetchTotal()
  }, [])

  useEffect(() => {

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`${apiUrl}/hubs/clicks`, {withCredentials: false})
      .withAutomaticReconnect()
      .build()

    connection.on('statsUpdated', (u) => {
      if (u.second) {
        setSeconds(prev => {
          const i = prev.findIndex(s => s.index === u.second.index)
          if (i < 0) return prev
          const next = [...prev]
          next[i] = { ...next[i], count: u.second.count }
          return next
        })
      }

      if (typeof u.total === 'number') setTotal(u.total)

      if (u.localHour) {
        setLocalHours(prev => {
          const i = prev.findIndex(h => h.index === u.localHour.index)
          if (i >= 0) {
            const next = [...prev]
            if (next[i].count === u.localHour.count) return prev
            next[i] = { ...next[i], count: u.localHour.count }
            return next
          }
          return [...prev, u.localHour].sort((a, b) => a.index - b.index)
        })
      }

      if (u.localWeekday) {
        setLocalWeekdays(prev => {
          const i = prev.findIndex(w => w.index === u.localWeekday.index)
          if (i >= 0) {
            const next = [...prev]
            if (next[i].count === u.localWeekday.count) return prev
            next[i] = { ...next[i], count: u.localWeekday.count }
            return next
          }
          return [...prev, u.localWeekday].sort((a, b) => a.index - b.index)
        })
      }

      if (u.localMonth) {
        setLocalMonths(prev => {
          const i = prev.findIndex(m => m.index === u.localMonth.index)
          if (i >= 0) {
            const next = [...prev]
            if (next[i].count === u.localMonth.count) return prev
            next[i] = { ...next[i], count: u.localMonth.count }
            return next
          }
          return [...prev, u.localMonth].sort((a, b) => a.index - b.index)
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
    
  connection.start().catch(err => console.error('SignalR start failed:', err))
    return () => { connection.stop().catch(() => {}) }
  }, [apiUrl])

  const handleClick = async () => {
    try {
      const res = await fetch(`${apiUrl}/clicks/increment-now`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ localHour: new Date().getHours(), localWeekday: new Date().getDay(), localMonth: new Date().getMonth() }) 
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setMyClicks(c => c + 1)
    } catch (err) {
      console.error('Failed to increment:', err)
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
  const weekdayLabels = useMemo(() => ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'], [])
  const weekdayIndices = useMemo(() => [0,1,2,3,4,5,6], [])
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

      <ClickProgress total={total} max={1000000}/>
        
      <div className="sticky-header">
        <button onClick={handleClick} className="click-text">
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
      </div>

    </>
  )
}

export default App