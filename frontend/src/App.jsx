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
  const [rows, setRows] = useState([])
  const [now, setNow] = useState(Date.now())

  const fetchClicks = async () => {
    try {
      const res = await fetch(`${apiUrl}/clicks`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      data.sort((a, b) => a.index - b.index)
      setRows(data)
    } catch (err) {
      console.error('Failed to load clicks:', err)
    }
  }

  useEffect(() => {fetchClicks()}, [])

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {

    if (!apiUrl) return

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`${apiUrl}/hubs/clicks`, {withCredentials: false})
      .withAutomaticReconnect()
      .build()

    connection.on('clickUpdated', (updated) => {
      setRows(prev => {
        const i = prev.findIndex(r => r.index === updated.index)
        if (i >= 0) {
          const next = [...prev] // förstår inte riktigt vad som händer här inne
          next[i] = updated
          return next
        }
        return [...prev, updated].sort((a, b) => a.index - b.index)
      })
    })

    connection.start().catch(err => console.error('SignalR start failed:', err))
    return () => {
      connection.stop().catch(() => {})
    }
  }, [apiUrl])

  const handleClick = async () => {
    try {
      const res = await fetch(`${apiUrl}/clicks/increment-now`, { method: 'POST' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
    } catch (err) {
      console.error('Failed to increment:', err)
    }
  }

  const labels = rows.map(r => r.index.toString())

  const visibleCounts = rows.map(r => {
    if (!r.lastUpdatedUtc) return 0
    const ageMs = now - Date.parse(r.lastUpdatedUtc)
    return ageMs < 60000 ? r.count : 0
  })

  const data = {
    labels,
    datasets: [
      {
        label: 'Count',
        data: visibleCounts,
        backgroundColor: 'rgba(100,108,255,0.6)',
        borderColor: '#646cff',
        borderWidth: 1
      }
    ]
  }
  const options = {
    indexAxis: 'x',
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Clicks per Second' },
      tooltip: { mode: 'nearest', intersect: false }
    },
    scales: {
      x: {title: { display: true, text: 'Second' }},
      y: {beginAtZero: true, title: { display: true, text: 'Count' }, ticks: { precision: 0 }}
    }
  }

  return (
    <>

      <button onClick={handleClick}>
        click
      </button>

      <div className='bar-graph'>
        <Bar data={data} options={options} />
      </div>

    </>
  )
}

export default App