import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
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

function getDismissedSet() {
  try {
    const raw = sessionStorage.getItem('wabi_dismissed_notifications')
    return raw ? new Set(JSON.parse(raw)) : new Set()
  } catch {
    return new Set()
  }
}

function saveDismissedKey(key) {
  try {
    const set = getDismissedSet()
    set.add(key)
    sessionStorage.setItem('wabi_dismissed_notifications', JSON.stringify([...set]))
  } catch {}
}

export default function MeetingNotifier() {
  const navigate = useNavigate()
  const location = useLocation()
  const [activeNotification, setActiveNotification] = useState(null)

  // Public unauthenticated routes where notification should NEVER show
  const isPublicRoute =
    location.pathname === '/' ||
    location.pathname === '/login' ||
    location.pathname === '/register'

  // Don't notify if already inside a meeting room
  const isInsideMeetingRoom = location.pathname.startsWith('/meeting-room/')

  useEffect(() => {
    // Only request browser permission when logged in
    const token = localStorage.getItem('token')
    if (token && typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission().catch(() => {})
      }
    }
  }, [])

  useEffect(() => {
    // If public route or not logged in, clear and exit
    const token = localStorage.getItem('token')
    if (isPublicRoute || !token) {
      setActiveNotification(null)
      return
    }

    const checkScheduledMeetings = async () => {
      try {
        const currentToken = localStorage.getItem('token')
        if (!currentToken) {
          setActiveNotification(null)
          return
        }

        const result = await apiRequest('/meetings')
        const meetings = Array.isArray(result) ? result : result.meetings || []
        const now = new Date()
        const dismissed = getDismissedSet()

        // Get currently active meeting room ID if user is in one
        const currentMeetingRoomId = isInsideMeetingRoom
          ? location.pathname.split('/meeting-room/')[1]
          : null

        for (const m of meetings) {
          if (m.completed) continue
          // Skip if user is currently inside this meeting room
          if (currentMeetingRoomId && String(m.id) === String(currentMeetingRoomId)) continue

          const meetingTime = parseMeetingDateTime(m.date, m.time)
          if (!meetingTime) continue

          const diffMs = meetingTime.getTime() - now.getTime()
          const diffMinutes = Math.round(diffMs / (1000 * 60))

          const nowKey = `${m.id}_started`
          const upcomingKey = `${m.id}_10min`

          // 1. Meeting Starting Right Now (within last 5 min to next 1 min)
          if (diffMinutes <= 0 && diffMinutes >= -5 && !dismissed.has(nowKey)) {
            setActiveNotification({
              id: m.id,
              type: 'starting_now',
              title: m.title,
              time: m.time,
              date: m.date,
              message: `Your scheduled seminar "${m.title}" is starting now!`,
              key: nowKey,
            })

            if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
              new Notification('🔔 WabiSeminar: Meeting Starting Now!', {
                body: `"${m.title}" is ready. Click to join the seminar session.`,
                icon: '/favicon.svg',
              })
            }
            break
          }

          // 2. Upcoming Reminder (between 1 and 10 minutes before)
          if (diffMinutes > 0 && diffMinutes <= 10 && !dismissed.has(upcomingKey)) {
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
        // Silently skip
      }
    }

    checkScheduledMeetings()
    const interval = setInterval(checkScheduledMeetings, 15000)
    return () => clearInterval(interval)
  }, [location.pathname, isPublicRoute, isInsideMeetingRoom])

  const handleDismiss = () => {
    if (activeNotification) {
      saveDismissedKey(activeNotification.key)
      setActiveNotification(null)
    }
  }

  const handleJoin = () => {
    if (activeNotification) {
      saveDismissedKey(activeNotification.key)
      const mId = activeNotification.id
      setActiveNotification(null)
      navigate(`/meeting-room/${mId}`)
    }
  }

  // Never render on public pages, without active notification, or inside the meeting room
  if (isPublicRoute || !activeNotification || isInsideMeetingRoom) return null

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
