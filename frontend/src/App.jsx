import { useState, useEffect } from 'react'
import './App.css'
import * as signalR from '@microsoft/signalr'
import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

function App() {
  const apiUrl = import.meta.env.VITE_API_URL;
  const [seconds, setSeconds] = useState([])
  const [minutes, setMinutes] = useState([])

  const fetchSeconds = async () => {
    try {
      const res = await fetch(`${apiUrl}/seconds`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      data.sort((a, b) => a.index - b.index)
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
      data.sort((a, b) => a.index - b.index)
      setMinutes(data)
    } catch (err) {
      console.error('Failed to load minutes:', err)
    }
  }

  useEffect(() => {
    fetchSeconds()
    fetchMinutes()
  }, [])

  useEffect(() => {

    if (!apiUrl) return

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`${apiUrl}/hubs/clicks`, {withCredentials: false})
      .withAutomaticReconnect()
      .build()

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

    connection.start().catch(err => console.error('SignalR start failed:', err))
    return () => { connection.stop().catch(() => {}) }
  }, [apiUrl])

  const handleClick = async () => {
    try {
      const res = await fetch(`${apiUrl}/clicks/increment-now`, { method: 'POST' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
    } catch (err) {
      console.error('Failed to increment:', err)
    }
  }

  const secLabels = seconds.map(s => s.index.toString())
  const secCounts = seconds.map(s => s.count)
  const secondsData = {
    labels: secLabels,
    datasets: [{ label: 'Seconds', data: secCounts, backgroundColor: 'rgba(100,108,255,0.6)', borderColor: '#646cff', borderWidth: 1 }]
  }
  const secondsOptions = {
    indexAxis: 'x',
    responsive: true,
    plugins: { legend: { display: false }, title: { display: true, text: 'Clicks per Second (0–59)' } },
    scales: {
      x: { title: { display: true, text: 'Second' } },
      y: { beginAtZero: true, title: { display: true, text: 'Count' }, ticks: { precision: 0 } }
    }
  }

  const minLabels = minutes.map(m => m.index.toString())
  const minCounts = minutes.map(m => m.count)
  const minutesData = {
    labels: minLabels,
    datasets: [{ label: 'Minutes', data: minCounts, backgroundColor: 'rgba(34,197,94,0.6)', borderColor: '#22c55e', borderWidth: 1 }]
  }
  const minutesOptions = {
    indexAxis: 'x',
    responsive: true,
    plugins: { legend: { display: false }, title: { display: true, text: 'Clicks per Minute (0–59)' } },
    scales: {
      x: { title: { display: true, text: 'Minute' } },
      y: { beginAtZero: true, title: { display: true, text: 'Count' }, ticks: { precision: 0 } }
    }
  }

  return (
    <>

      <button onClick={handleClick}>
        click
      </button>

      <div className='bar-graph'>
        <Bar data={secondsData} options={secondsOptions} />
      </div>

      <div className='bar-graph'>
        <Bar data={minutesData} options={minutesOptions} />
      </div>

    </>
  )
}

export default App