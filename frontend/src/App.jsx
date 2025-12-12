import { useState, useEffect } from 'react'
import './App.css'
import * as signalR from '@microsoft/signalr'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

function App() {
  const apiUrl = import.meta.env.VITE_API_URL;
  const [seconds, setSeconds] = useState([])
  const [minutes, setMinutes] = useState([])
  const [hours, setHours] = useState([])
  const [days, setDays] = useState([])
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
    fetchTotal()
  }, [])

  useEffect(() => {

    if (!apiUrl) return

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`${apiUrl}/hubs/clicks`, {withCredentials: false})
      .withAutomaticReconnect()
      .build()

    connection.on('totalUpdated', ({ count }) => {setTotal(count)})

    connection.on('clickUpdated', (updated) => {
      setSeconds(prev => {
        const i = prev.findIndex(r => r.index === updated.index)
        if (i >= 0) {
          const next = [...prev] // förstår inte riktigt vad som händer här inne
          // next[i] = { ...next[i], count: updated.count } // vad är skillnaden på denna och nästa?
          next[i] = updated
          return next
        }
        return [...prev, updated].sort((a, b) => a.index - b.index)
      })
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

  connection.start().catch(err => console.error('SignalR start failed:', err))
    return () => { connection.stop().catch(() => {}) }
  }, [apiUrl])

  const handleClick = async () => {
    try {
      const res = await fetch(`${apiUrl}/clicks/increment-now`, { method: 'POST' })
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

  const secMap = new Map(seconds.map(s => [s.index, s.count]));
  const rotatedSecondIndices = Array.from({ length: 60 }, (_, k) => (currentUtcSecond + 1 + k) % 60);
  const secLabels = rotatedSecondIndices.map(i => i.toString());
  const secCounts = rotatedSecondIndices.map(i => secMap.get(i) ?? 0);
  const secondsData = {
    labels: secLabels,
    datasets: [{ 
      label: 'Seconds', 
      data: secCounts,
      backgroundColor: (ctx) => {
        const chart = ctx.chart
        const { ctx: c, chartArea } = chart
        if (!chartArea) return 'rgba(100,108,255,0.2)' // fallback during initial render
        const gradient = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom)
        gradient.addColorStop(0, 'rgba(100,108,255,0.25)')
        gradient.addColorStop(1, 'rgba(100,108,255,0)')
        return gradient
      },
      borderColor: '#646cff', 
      borderWidth: 1,
      pointRadius: 3, 
      fill: true }]
  }
  const secondsOptions = {
    responsive: true,
    animation: false,
    plugins: { legend: { display: false }, title: { display: true, text: 'Clicks during the last 60 seconds' } },
    scales: {
      x: { title: { display: true, text: 'Second' }, ticks: {display: false}},
      y: { beginAtZero: true, title: { display: true, text: 'Count' }, ticks: { precision: 0 } }
    }
  }

  const minuteMap = new Map(minutes.map(m => [m.index, m.count]));
  const rotatedMinuteIndices = Array.from({ length: 60 }, (_, k) => (currentUtcMinute + 1 + k) % 60);
  const minuteLabels = rotatedMinuteIndices.map(i => i.toString());
  const minuteCounts = rotatedMinuteIndices.map(i => minuteMap.get(i) ?? 0);
  const minutesData = {
    labels: minuteLabels, // vad är labels? pröva kommentera ut
    datasets: [{ 
      label: 'Minutes', 
      data: minuteCounts,  
      backgroundColor: (ctx) => {
        const chart = ctx.chart
        const { ctx: c, chartArea } = chart
        if (!chartArea) return 'rgba(34,197,94,0.2)' // fallback during initial render
        const gradient = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom)
        gradient.addColorStop(0, 'rgba(34,197,94,0.25)')
        gradient.addColorStop(1, 'rgba(34,197,94,0)')
        return gradient
      },
      borderColor: '#22c55e', 
      borderWidth: 1,
      pointRadius: 3, 
      fill: true }]
  }
  const minutesOptions = {
    responsive: true,
    animation: false,
    plugins: { legend: { display: false }, title: { display: true, text: 'Last 60 minutes' } },
    scales: {
      x: { title: { display: true, text: 'Minute' } },
      y: { beginAtZero: true, title: { display: true, text: 'Count' }, ticks: { precision: 0 } }
    }
  }

  const hourMap = new Map(hours.map(h => [h.index, h.count]));
  const rotatedHourIndices = Array.from({ length: 24 }, (_, k) => (currentUtcHour + 1 + k) % 24);
  const hourLabels = rotatedHourIndices.map(i => i.toString());
  const hourCounts = rotatedHourIndices.map(i => hourMap.get(i) ?? 0);
  const hoursData = {
    labels: hourLabels,
    datasets: [{ 
      label: 'Hours', 
      data: hourCounts,
      backgroundColor: (ctx) => {
        const chart = ctx.chart
        const { ctx: c, chartArea } = chart
        if (!chartArea) return 'rgba(207, 17, 198, 0.2)' // fallback during initial render
        const gradient = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom)
        gradient.addColorStop(0, 'rgba(207, 17, 198, 0.25)')
        gradient.addColorStop(1, 'rgba(207, 17, 198, 0)')
        return gradient
      },
      borderColor: '#f137c9ff', 
      borderWidth: 1, 
      pointRadius: 3, 
      fill: true }]
  }
  const hoursOptions = {
    responsive: true,
    plugins: { legend: { display: false }, title: { display: true, text: 'Last 24 hours' } },
    scales: {
      x: { title: { display: true, text: 'Hour' } },
      y: { beginAtZero: true, title: { display: true, text: 'Count' }, ticks: { precision: 0 } }
    }
  }


  const dayMap = new Map(days.map(d => [d.index, d.count]));
  const dayIndices = Array.from({ length: 30 }, (_, i) => i + 1);
  const rotatedDayIndices = [...dayIndices.slice(currentUtcDay), ...dayIndices.slice(0, currentUtcDay)];
  const dayLabels = rotatedDayIndices.map(i => i.toString());
  const dayCounts = rotatedDayIndices.map(i => dayMap.get(i) ?? 0);
  const daysData = {
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
      fill: true }]
  }
  const daysOptions = {
    responsive: true,
    plugins: { legend: { display: false }, title: { display: true, text: 'Last 30 days' } },
    scales: {
      x: { title: { display: true, text: 'Day' } },
      y: { beginAtZero: true, title: { display: true, text: 'Count' }, ticks: { precision: 0 } }
    }
  }

  return (
    <>

      <h2>Total clicks: {total}</h2>
      <p>You have clicked the button {myClicks} times.</p>

      <button onClick={handleClick}>
        click
      </button>

      <div className='bar-graph'>
        <Line data={secondsData} options={secondsOptions} />
      </div>

      <div className='bar-graph'>
        <Line data={minutesData} options={minutesOptions} />
      </div>

      <div className='bar-graph'>
        <Line data={hoursData} options={hoursOptions} />
      </div>

      <div className='bar-graph'>
        <Line data={daysData} options={daysOptions} />
      </div>

    </>
  )
}

export default App