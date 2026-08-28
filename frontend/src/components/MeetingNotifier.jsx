import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiRequest } from '../services/api'
import './MeetingNotifier.css'

function parseMeetingDateTime(dateStr, timeStr) {
  if (!dateStr || !timeStr) return null
  const cleanDate = dateStr.trim()
  const timeMatch = timeStr.match(/^(\d{1,2}):(\d{2})(?:\s*([APap][Mm]))?/)
  if (!timeMatch) {
    const d = new Date(`${cleanDate} ${timeStr}`)
    return isNaN(d.getTime()) ? null : d
  }
  let hours = parseInt(timeMatch[1], 10)
  const minutes = parseInt(timeMatch[2], 10)
  const ampm = timeMatch[3] ? timeMatch[3].toUpperCase() : null
  if (ampm === 'PM' && hours < 12) hours += 12
  if (ampm === 'AM' && hours === 12) hours = 0

  const dateParts = cleanDate.split('-')
  if (dateParts.length === 3) {
    return new Date(
      parseInt(dateParts[0], 10),
      parseInt(dateParts[1], 10) - 1,
      parseInt(dateParts[2], 10),
      hours,
      minutes,
      0
    )
  }
  const fallback = new Date(`${cleanDate} ${timeStr}`)
  return isNaN(fallback.getTime()) ? null : fallback
}

export default function MeetingNotifier() {
  const navigate = useNavigate()
  const [activeNotification, setActiveNotification] = useState(null)
  const dismissedRef = useRef(new Set())

  // Request browser notification permission once on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission().catch(() => {})
      }
    }
  }, [])

  useEffect(() => {
    const checkScheduledMeetings = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) return

        const result = await apiRequest('/meetings')
        const meetings = Array.isArray(result) ? result : result.meetings || []
        const now = new Date()

        for (const m of meetings) {
          if (m.completed) continue

          const meetingTime = parseMeetingDateTime(m.date, m.time)
          if (!meetingTime) continue

          const diffMs = meetingTime.getTime() - now.getTime()
          const diffMinutes = Math.round(diffMs / (1000 * 60))

          // Key for tracking dismissed state per notification tier
          const nowKey = `${m.id}_started`
          const upcomingKey = `${m.id}_10min`

          // 1. Meeting Starting Right Now (or started within last 20 min)
          if (diffMinutes <= 0 && diffMinutes >= -20 && !dismissedRef.current.has(nowKey)) {
            setActiveNotification({
              id: m.id,
              type: 'starting_now',
              title: m.title,
              time: m.time,
              date: m.date,
              message: `Your scheduled seminar "${m.title}" is starting now!`,
              key: nowKey,
            })

            // Trigger system browser notification
            if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
              new Notification('🔔 WabiSeminar: Meeting Starting Now!', {
                body: `"${m.title}" is ready. Click to join the seminar session.`,
                icon: '/favicon.svg',
              })
            }
            break
          }

          // 2. Upcoming Reminder (within 10 minutes)
          if (diffMinutes > 0 && diffMinutes <= 10 && !dismissedRef.current.has(upcomingKey)) {
            setActiveNotification({
              id: m.id,
              type: 'upcoming_soon',
              title: m.title,
              time: m.time,
              date: m.date,
              minutesLeft: diffMinutes,
              message: `Upcoming seminar in ${diffMinutes} min: "${m.title}"`,
              key: upcomingKey,
            })

            if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
              new Notification('⏰ WabiSeminar: Upcoming Reminder', {
                body: `"${m.title}" starts in ${diffMinutes} minutes at ${m.time}.`,
                icon: '/favicon.svg',
              })
            }
            break
          }
        }
      } catch (err) {
        // Silently skip if network/auth not ready
      }
    }

    checkScheduledMeetings()
    const interval = setInterval(checkScheduledMeetings, 10000)
    return () => clearInterval(interval)
  }, [])

  const handleDismiss = () => {
    if (activeNotification) {
      dismissedRef.current.add(activeNotification.key)
      setActiveNotification(null)
    }
  }

  const handleJoin = () => {
    if (activeNotification) {
      dismissedRef.current.add(activeNotification.key)
      const mId = activeNotification.id
      setActiveNotification(null)
      navigate(`/meeting-room/${mId}`)
    }
  }

  if (!activeNotification) return null

  const isStarting = activeNotification.type === 'starting_now'

  return (
    <div className={`wabi-notification-toast ${isStarting ? 'toast-pulse' : ''}`} role="alert">
      <div className="toast-glass-glow" />
      <div className="toast-icon-wrap">
        <span className="toast-bell-icon">{isStarting ? '🔥' : '⏰'}</span>
      </div>

      <div className="toast-body">
        <div className="toast-header-row">
          <strong className="toast-headline">
            {isStarting ? 'Seminar Starting Now' : `Starting in ${activeNotification.minutesLeft}m`}
          </strong>
          <span className="toast-badge">{activeNotification.time}</span>
        </div>
        <p className="toast-message">{activeNotification.title}</p>

        <div className="toast-actions">
          <button type="button" className="toast-join-btn" onClick={handleJoin}>
            🚀 Join Meeting
          </button>
          <button type="button" className="toast-dismiss-btn" onClick={handleDismiss}>
            Dismiss
          </button>
        </div>
      </div>

      <button type="button" className="toast-close-x" onClick={handleDismiss} aria-label="Close notification">
        ×
      </button>
    </div>
  )
}
