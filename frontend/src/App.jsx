import { useState, useEffect } from 'react'
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
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler)

function App() {
  const apiUrl = import.meta.env.VITE_API_URL;
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

    if (!apiUrl) return

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

    // connection.on('totalUpdated', ({ count }) => {setTotal(count)})

    // connection.on('clickUpdated', (updated) => {
    //   setSeconds(prev => {
    //     const i = prev.findIndex(r => r.index === updated.index)
    //     if (i >= 0) {
    //       const next = [...prev] // förstår inte riktigt vad som händer här inne
    //       // next[i] = { ...next[i], count: updated.count } // vad är skillnaden på denna och nästa?
    //       next[i] = updated
    //       return next
    //     }
    //     return [...prev, updated].sort((a, b) => a.index - b.index)
    //   })
    // })

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

    // connection.on('localHourUpdated', ({ index, count }) => {
    //   setLocalHours(prev => {
    //     const i = prev.findIndex(h => h.index === index)
    //     if (i >= 0) {
    //       const next = [...prev]
    //       next[i] = { ...next[i], count }
    //       return next
    //     }
    //     return [...prev, { index, count }].sort((a, b) => a.index - b.index)
    //   })
    // })

    // connection.on('localWeekdayUpdated', ({ index, count }) => {
    //   setLocalWeekdays(prev => {
    //     const i = prev.findIndex(w => w.index === index)
    //     if (i >= 0) {
    //       const next = [...prev]
    //       next[i] = { ...next[i], count }
    //       return next
    //     }
    //     return [...prev, { index, count }].sort((a, b) => a.index - b.index)
    //   })
    // })

    // connection.on('localMonthUpdated', ({ index, count }) => {
    //   setLocalMonths(prev => {
    //     const i = prev.findIndex(m => m.index === index)
    //     if (i >= 0) {
    //       const next = [...prev]
    //       next[i] = { ...next[i], count }
    //       return next
    //     }
    //     return [...prev, { index, count }].sort((a, b) => a.index - b.index)
    //   })
    // })

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
    plugins: { legend: { display: false }, title: { display: true, text: 'Clicks during the last minute' } },
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
      fill: true }]
  }
  const minutesOptions = {
    responsive: true,
    animation: false,
    plugins: { legend: { display: false }, title: { display: true, text: 'Last hour' } },
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
    plugins: { legend: { display: false }, title: { display: true, text: 'Last day' } },
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
    plugins: { legend: { display: false }, title: { display: true, text: 'Last month' } },
    scales: {
      x: { title: { display: true, text: 'Day' } },
      y: { beginAtZero: true, title: { display: true, text: 'Count' }, ticks: { precision: 0 } }
    }
  }


  const monthMap = new Map(months.map(m => [m.index, m.count]));
  const monthIndices = Array.from({ length: 12 }, (_, i) => i + 1);
  const rotateMonthsBy = (n) => {
    const k = n % monthIndices.length;
    return [...monthIndices.slice(k), ...monthIndices.slice(0, k)];
  }
  const rotatedMonthIndices = rotateMonthsBy(currentUtcMonth + 1);
    const monthName = (idx) => {
    return new Intl.DateTimeFormat(undefined, { month: 'short' })
      .format(new Date(Date.UTC(2000, idx - 1, 1)));
  };
  const monthLabels = rotatedMonthIndices.map(i => monthName(i));
  const monthCounts = rotatedMonthIndices.map(i => monthMap.get(i) ?? 0);
  const monthsData = {
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
      fill: true }]
  }
  const monthsOptions = {
    responsive: true,
    plugins: { legend: { display: false }, title: { display: true, text: 'Last year' } },
    scales: {
      x: { title: { display: true, text: 'Month' } },
      y: { beginAtZero: true, title: { display: true, text: 'Count' }, ticks: { precision: 0 } }
    }
  }

  const yearMap = new Map(years.map(y => [y.index, y.count])); // map är typ en dictionary över de objecten du fått in från fetchen. Index blir key, och Count blir value.
  const availableYears = [...yearMap.keys()].sort((a, b) => a - b);
  const lastTenYearsCandidate = availableYears.filter(y => y <= currentUtcYear);
  const lastTenYears = (lastTenYearsCandidate.length >= 10 ? lastTenYearsCandidate.slice(-10) : availableYears.slice(-10));
  const yearLabels = lastTenYears.map(y => y.toString());
  const yearCounts = lastTenYears.map(y => yearMap.get(y) ?? 0);
  const yearsData = {
    labels: yearLabels,
    datasets: [{ 
      label: 'Year', 
      data: yearCounts,
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
      fill: true }]
  }
  const yearsOptions = {
    responsive: true,
    plugins: { legend: { display: false }, title: { display: true, text: 'Last 10 years' } },
    scales: {
      x: { title: { display: true, text: 'Year' } },
      y: { beginAtZero: true, title: { display: true, text: 'Count' }, ticks: { precision: 0 } }
    }
  }

  const localHourMap = new Map(localHours.map(h => [h.index, h.count]));
  const localHourLabels = Array.from({ length: 24 }, (_, i) => i.toString());
  const localHourCounts = localHourLabels.map(i => localHourMap.get(Number(i)) ?? 0);
  const localHoursData = {
    labels: localHourLabels,
    datasets: [{
      label: 'Local hour of day',
      data: localHourCounts,
      backgroundColor: 'rgba(14,165,233,0.35)',
      borderColor: '#0ea5e9',
      borderWidth: 1
    }]
  }
  const localHoursOptions = {
    responsive: true,
    plugins: { legend: { display: false }, title: { display: true, text: 'Clicks by local hour (0–23)' } },
    scales: {
      x: { title: { display: true, text: 'Hour' } },
      y: { beginAtZero: true, title: { display: true, text: 'Count' }, ticks: { precision: 0 } }
    }
  }

  const localWeekdayMap = new Map(localWeekdays.map(w => [w.index, w.count]))
  const weekdayLabels = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
  const weekdayIndices = [0,1,2,3,4,5,6]
  const localWeekdayCounts = weekdayIndices.map(i => localWeekdayMap.get(i) ?? 0)
  const localWeekdaysData = {
    labels: weekdayLabels,
    datasets: [{
      label: 'Clicks by weekday (local)',
      data: localWeekdayCounts,
      backgroundColor: 'rgba(99,102,241,0.35)',
      borderColor: '#6366f1',
      borderWidth: 1
    }]
  }
  const localWeekdaysOptions = {
    responsive: true,
    plugins: { legend: { display: false }, title: { display: true, text: 'Clicks by weekday (local)' } },
    scales: {
      x: { title: { display: true, text: 'Weekday' } },
      y: { beginAtZero: true, title: { display: true, text: 'Count' }, ticks: { precision: 0 } }
    }
  }
  
  const localMonthMap = new Map(localMonths.map(m => [m.index, m.count]))
  const localMonthIndices = Array.from({ length: 12 }, (_, i) => i)
  const localMonthLabels = localMonthIndices.map(i => new Intl.DateTimeFormat(undefined, { month: 'short' }).format(new Date(Date.UTC(2000, i, 1))))
  const localMonthCounts = localMonthIndices.map(i => localMonthMap.get(i) ?? 0)
  const localMonthsData = {
    labels: localMonthLabels,
    datasets: [{
      label: 'Clicks by local month',
      data: localMonthCounts,
      backgroundColor: 'rgba(234,88,12,0.35)',
      borderColor: '#ea580c',
      borderWidth: 1
    }]
  }
  const localMonthsOptions = {
    responsive: true,
    plugins: { legend: { display: false }, title: { display: true, text: 'Clicks by local month' } },
    scales: {
      x: { title: { display: true, text: 'Month' } },
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

      <div className='bar-graph'>
        <Line data={monthsData} options={monthsOptions} />
      </div>

      <div className='bar-graph'>
        <Line data={yearsData} options={yearsOptions} />
      </div>

      <div className='bar-graph'>
        <Bar data={localHoursData} options={localHoursOptions} />
      </div>

      <div className='bar-graph'>
        <Bar data={localWeekdaysData} options={localWeekdaysOptions} />
      </div>

      <div className='bar-graph'>
        <Bar data={localMonthsData} options={localMonthsOptions} />
      </div>

    </>
  )
}

export default App