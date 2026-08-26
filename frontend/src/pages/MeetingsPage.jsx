import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import '../App.css'

function MeetingsPage() {
  const [meetings, setMeetings] = useState([])

  useEffect(() => {
    const loadMeetings = () => {
      const savedMeetings =
        JSON.parse(
          localStorage.getItem('wabiMeetings')
        ) || []

      setMeetings(savedMeetings)
    }

    loadMeetings()

    window.addEventListener(
      'storage',
      loadMeetings
    )

    return () => {
      window.removeEventListener(
        'storage',
        loadMeetings
      )
    }
  }, [])

  /* ========================================
     UPCOMING
  ======================================== */

  const upcomingMeetings = meetings
    .filter((meeting) => {
      if (meeting.completed === true) {
        return false
      }

      if (!meeting.date) {
        return true
      }

      return new Date(meeting.date) >= new Date()
    })
    .sort((a, b) => {
      if (!a.date) return 1
      if (!b.date) return -1

      return (
        new Date(a.date) -
        new Date(b.date)
      )
    })

  /* ========================================
     HISTORY

     Only meetings that the user actually
     left/completed.
  ======================================== */

  const meetingHistory = meetings
    .filter(
      (meeting) =>
        meeting.completed === true
    )
    .sort((a, b) => {
      const dateA = new Date(
        `${a.date || '1970-01-01'}T${
          a.time || '00:00'
        }`
      )

      const dateB = new Date(
        `${b.date || '1970-01-01'}T${
          b.time || '00:00'
        }`
      )

      return dateB - dateA
    })

  /* ========================================
     DATE
  ======================================== */

  const getMeetingDate = (date) => {
    if (!date) {
      return {
        day: '--',
        month: '---',
        full: 'Date not set',
      }
    }

    const meetingDate = new Date(date)

    return {
      day: meetingDate.getDate(),

      month: meetingDate
        .toLocaleString('en-US', {
          month: 'short',
        })
        .toUpperCase(),

      full: meetingDate.toLocaleDateString(
        'en-US',
        {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }
      ),
    }
  }

  /* ========================================
     RENDER MEETING
  ======================================== */

  const renderMeeting = (
    meeting,
    isHistory = false
  ) => {
    const date = getMeetingDate(
      meeting.date
    )

    return (
      <div
        className="upcoming-meeting"
        key={meeting.id}
      >
        <div className="meeting-date">
          <strong>
            {date.day}
          </strong>

          <span>
            {date.month}
          </span>
        </div>

        <div className="meeting-info">
          <h3>
            {meeting.title ||
              'Untitled Meeting'}
          </h3>

          <p>
            {date.full}
            {' · '}
            {meeting.time ||
              'Time not set'}
            {' · '}
            {meeting.duration ||
              0}
            {' minutes'}
          </p>

          {meeting.description && (
            <p>
              {meeting.description}
            </p>
          )}
        </div>

        <span
          className="meeting-status"
          style={
            isHistory
              ? {
                  background: '#f1f5f9',
                  color: '#64748b',
                }
              : undefined
          }
        >
          {isHistory
            ? 'Completed'
            : 'Upcoming'}
        </span>

        {isHistory ? (
          <NavLink
            to={`/meeting-room/${meeting.id}`}
            className="join-button"
            style={{
              background: '#f1f5f9',
              color: '#64748b',
            }}
          >
            View
          </NavLink>
        ) : (
          <NavLink
            to={`/meeting-room/${meeting.id}`}
            className="join-button"
          >
            Join
          </NavLink>
        )}
      </div>
    )
  }

  return (
    <div className="app">

      {/* ========================================
          SIDEBAR
      ======================================== */}

      <aside className="sidebar">

        <div className="logo">
          <h2>WabiSeminar</h2>
        </div>

        <nav>

          {/* HOME */}
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `nav-item ${
                isActive ? 'active' : ''
              }`
            }
          >
            <span className="nav-icon">
              ⌂
            </span>

            Home
          </NavLink>

          {/* MEETINGS */}
          <NavLink
            to="/meetings"
            className={({ isActive }) =>
              `nav-item ${
                isActive ? 'active' : ''
              }`
            }
          >
            <span className="nav-icon">
              📅
            </span>

            Meetings
          </NavLink>

          {/* CHATS */}
          <NavLink
            to="/chats"
            className={({ isActive }) =>
              `nav-item ${
                isActive ? 'active' : ''
              }`
            }
          >
            <span className="nav-icon">
              ▱
            </span>

            Chats
          </NavLink>

          {/* NOTES */}
          <NavLink
            to="/notes"
            className={({ isActive }) =>
              `nav-item ${
                isActive ? 'active' : ''
              }`
            }
          >
            <span className="nav-icon">
              □
            </span>

            Notes
          </NavLink>

          {/* SETTINGS */}
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `nav-item ${
                isActive ? 'active' : ''
              }`
            }
          >
            <span className="nav-icon">
              ⚙
            </span>

            Settings
          </NavLink>

        </nav>

        <div className="sidebar-bottom">

          <NavLink
            to="/new-meeting"
            className="new-meeting-sidebar"
          >
            <span>
              ＋
            </span>

            New Meeting
          </NavLink>

        </div>

      </aside>

      {/* ========================================
          MAIN
      ======================================== */}

      <main className="main-content">

        <header className="topbar">

          <div>
            <h1>
              Meetings
            </h1>

            <p>
              View your upcoming meetings and
              complete meeting history.
            </p>
          </div>

          <div className="meeting-actions">

            <NavLink
              to="/join-meeting"
              className="meeting-secondary-button"
            >
              Join Meeting
            </NavLink>

            <NavLink
              to="/new-meeting"
              className="meeting-primary-button"
            >
              ＋ New Meeting
            </NavLink>

          </div>

        </header>

        {/* ========================================
            UPCOMING
        ======================================== */}

        <section className="dashboard-section">

          <div className="section-header">

            <div>
              <h2>
                Upcoming Meetings
              </h2>

              <p>
                Meetings that are scheduled
                for you
              </p>
            </div>

            <span
              style={{
                color: '#94a3b8',
                fontSize: '12px',
                fontWeight: '600',
              }}
            >
              {upcomingMeetings.length}{' '}
              {upcomingMeetings.length === 1
                ? 'meeting'
                : 'meetings'}
            </span>

          </div>

          {upcomingMeetings.length === 0 ? (

            <div className="empty-state">

              <div className="empty-icon">
                📅
              </div>

              <h3>
                No upcoming meetings
              </h3>

              <p>
                You don't have any meetings
                scheduled yet.
              </p>

              <NavLink
                to="/new-meeting"
                className="empty-action"
              >
                Schedule Meeting
              </NavLink>

            </div>

          ) : (

            <div>
              {upcomingMeetings.map(
                (meeting) =>
                  renderMeeting(
                    meeting,
                    false
                  )
              )}
            </div>

          )}

        </section>

        {/* ========================================
            HISTORY
        ======================================== */}

        <section className="dashboard-section recent-section">

          <div className="section-header">

            <div>
              <h2>
                Meeting History
              </h2>

              <p>
                All of your completed meetings
              </p>
            </div>

            <span
              style={{
                color: '#94a3b8',
                fontSize: '12px',
                fontWeight: '600',
              }}
            >
              {meetingHistory.length}{' '}
              {meetingHistory.length === 1
                ? 'meeting'
                : 'meetings'}
            </span>

          </div>

          {meetingHistory.length === 0 ? (

            <div className="empty-state">

              <div className="empty-icon">
                🕘
              </div>

              <h3>
                No meeting history
              </h3>

              <p>
                Your completed meetings will
                appear here.
              </p>

            </div>

          ) : (

            <div>
              {meetingHistory.map(
                (meeting) =>
                  renderMeeting(
                    meeting,
                    true
                  )
              )}
            </div>

          )}

        </section>

      </main>

    </div>
  )
}

export default MeetingsPage