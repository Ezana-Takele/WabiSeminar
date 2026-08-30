import { useEffect, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { apiRequest } from '../services/api'
import '../App.css'

function Dashboard() {
  const navigate = useNavigate()

  const [meetings, setMeetings] = useState([])
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)

  /* ========================================
     CHECK IF MEETING IS COMPLETED
  ======================================== */

  const isCompleted = (meeting) => {
    return (
      meeting?.completed === true ||
      meeting?.completed === 1 ||
      meeting?.completed === '1'
    )
  }

  /* ========================================
     LOAD CURRENT USER + MEETINGS
  ======================================== */

  useEffect(() => {
    const userStr = localStorage.getItem('wabiCurrentUser')

    if (!userStr) {
      navigate('/login')
      return
    }

    try {
      setCurrentUser(JSON.parse(userStr))
    } catch {
      navigate('/login')
      return
    }

    const loadMeetings = async () => {
      try {
        /* ========================================
           LOAD FROM BACKEND
        ======================================== */

        const data = await apiRequest('/meetings')

        const apiMeetings = Array.isArray(data)
          ? data
          : (data.meetings || [])

        /* ========================================
           LOAD FRONTEND LOCAL DATA

           MeetingRoomPage stores:
           - completed
           - joined
           - completedAt
           - messages
           - meetingNote
        ======================================== */

        let savedMeetings = []

        try {
          savedMeetings =
            JSON.parse(
              localStorage.getItem('wabiMeetings')
            ) || []
        } catch (error) {
          console.warn(
            'Could not read saved meetings:',
            error
          )

          savedMeetings = []
        }

        /* ========================================
           MERGE BACKEND + LOCAL DATA
        ======================================== */

        const mergedMeetings = apiMeetings.map((meeting) => {
          const localMeeting = savedMeetings.find(
            (saved) =>
              String(saved.id) === String(meeting.id)
          )

          /* ----------------------------------------
             No local information
          ---------------------------------------- */

          if (!localMeeting) {
            return {
              ...meeting,

              completed:
                isCompleted(meeting),
            }
          }

          /* ----------------------------------------
             Local information exists
          ---------------------------------------- */

          return {
            ...meeting,

            /*
              Preserve local completion.

              Once MeetingRoomPage marks a meeting
              completed, it remains completed even
              if the backend still says false.
            */
            completed:
              isCompleted(localMeeting)
                ? true
                : isCompleted(meeting),

            joined:
              localMeeting.joined === true
                ? true
                : meeting.joined,

            completedAt:
              localMeeting.completedAt ||
              meeting.completedAt ||
              null,

            messages:
              localMeeting.messages ||
              meeting.messages ||
              [],

            meetingNote:
              localMeeting.meetingNote ||
              meeting.meetingNote ||
              '',
          }
        })

        console.log(
          'Dashboard merged meetings:',
          mergedMeetings
        )

        setMeetings(mergedMeetings)

        /*
          Save the merged data so every page
          can use the same information.
        */

        localStorage.setItem(
          'wabiMeetings',
          JSON.stringify(mergedMeetings)
        )

      } catch (error) {
        console.error(
          'Failed to load dashboard meetings:',
          error
        )

        /* ========================================
           BACKEND UNAVAILABLE

           Fall back to local meetings.
        ======================================== */

        try {
          const savedMeetings =
            JSON.parse(
              localStorage.getItem(
                'wabiMeetings'
              )
            ) || []

          const normalizedMeetings =
            savedMeetings.map((meeting) => ({
              ...meeting,

              completed:
                isCompleted(meeting),
            }))

          setMeetings(normalizedMeetings)

        } catch (localError) {
          console.error(
            'Failed to load local meetings:',
            localError
          )

          setMeetings([])
        }

      } finally {
        setLoading(false)
      }
    }

    loadMeetings()
  }, [navigate])

  /* ========================================
     UPCOMING MEETINGS

     IMPORTANT:
     We DO NOT check the current time here.

     A meeting remains upcoming until the user
     actually completes/leaves it.
  ======================================== */

  const upcomingMeetings = meetings
    .filter((meeting) => !isCompleted(meeting))
    .sort((a, b) => {
      if (!a.date) return 1
      if (!b.date) return -1

      const dateA = new Date(
        `${a.date}T${a.time || '00:00'}`
      )

      const dateB = new Date(
        `${b.date}T${b.time || '00:00'}`
      )

      return dateA - dateB
    })
    .slice(0, 3)

  /* ========================================
     RECENT / COMPLETED MEETINGS
  ======================================== */

  const recentMeetings = meetings
    .filter((meeting) => isCompleted(meeting))
    .sort((a, b) => {
      const dateA = a.completedAt
        ? new Date(a.completedAt)
        : new Date(
            `${a.date || '1970-01-01'}T${a.time || '00:00'}`
          )

      const dateB = b.completedAt
        ? new Date(b.completedAt)
        : new Date(
            `${b.date || '1970-01-01'}T${b.time || '00:00'}`
          )

      return dateB - dateA
    })
    .slice(0, 3)

  /* ========================================
     DATE FORMAT
  ======================================== */

  const formatMeetingDate = (date) => {
    if (!date) {
      return {
        day: '--',
        month: '---',
        full: 'Date not set',
      }
    }

    const dateParts = String(date).split('-')

    /*
      Handle YYYY-MM-DD manually so timezone
      conversion doesn't move the date backward.
    */

    if (dateParts.length === 3) {
      const year = Number(dateParts[0])
      const month = Number(dateParts[1])
      const day = Number(dateParts[2])

      const localDate = new Date(
        year,
        month - 1,
        day
      )

      return {
        day,

        month:
          localDate
            .toLocaleString(
              'en-US',
              {
                month: 'short',
              }
            )
            .toUpperCase(),

        full:
          localDate.toLocaleDateString(
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

    const meetingDate = new Date(date)

    if (isNaN(meetingDate.getTime())) {
      return {
        day: '--',
        month: '---',
        full: 'Invalid date',
      }
    }

    return {
      day: meetingDate.getDate(),

      month:
        meetingDate
          .toLocaleString(
            'en-US',
            {
              month: 'short',
            }
          )
          .toUpperCase(),

      full:
        meetingDate.toLocaleDateString(
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
     USER INFORMATION
  ======================================== */

  const userName =
    currentUser?.name || 'User'

  const userInitial =
    userName.charAt(0).toUpperCase()

  /* ========================================
     UI
  ======================================== */

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
            <span>＋</span>

            New Meeting
          </NavLink>

        </div>

      </aside>

      {/* ========================================
          MAIN CONTENT
      ======================================== */}

      <main className="main-content">

        {/* ========================================
            HEADER
        ======================================== */}

        <header className="topbar">

          <div>

            <h1>
              Good day, {userName} 👋
            </h1>

            <p>
              Ready for your next meeting?
            </p>

          </div>

          <div className="user-profile">

            <div className="avatar">
              {userInitial}
            </div>

            <div className="user-info">

              <strong>
                {userName}
              </strong>

              <span>
                {currentUser?.email || 'Active'}
              </span>

            </div>

          </div>

        </header>

        {/* ========================================
            QUICK ACTIONS
        ======================================== */}

        <section className="quick-actions">

          <NavLink
            to="/new-meeting"
            className="action-card primary-action"
          >

            <div className="action-icon">
              ＋
            </div>

            <div>
              <strong>
                New Meeting
              </strong>

              <span>
                Create a new meeting
              </span>
            </div>

          </NavLink>

          <NavLink
            to="/join-meeting"
            className="action-card"
          >

            <div className="action-icon">
              ↗
            </div>

            <div>
              <strong>
                Join Meeting
              </strong>

              <span>
                Enter a meeting code
              </span>
            </div>

          </NavLink>

          <NavLink
            to="/new-meeting"
            className="action-card"
          >

            <div className="action-icon">
              📅
            </div>

            <div>
              <strong>
                Schedule
              </strong>

              <span>
                Plan a future meeting
              </span>
            </div>

          </NavLink>

        </section>

        {/* ========================================
            UPCOMING MEETINGS
        ======================================== */}

        <section className="dashboard-section">

          <div className="section-header">

            <div>

              <h2>
                Upcoming Meetings
              </h2>

              <p>
                Your next scheduled meetings
              </p>

            </div>

            <NavLink
              to="/meetings"
              className="view-all"
            >
              View all
            </NavLink>

          </div>

          {loading ? (

            <div className="empty-state">

              <p>
                Loading meetings...
              </p>

            </div>

          ) : upcomingMeetings.length === 0 ? (

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

              {upcomingMeetings.map((meeting) => {

                const date =
                  formatMeetingDate(
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
                          60}
                        {' minutes'}
                      </p>

                      {meeting.description && (
                        <p>
                          {meeting.description}
                        </p>
                      )}

                    </div>

                    <span className="meeting-status">
                      Upcoming
                    </span>

                    <NavLink
                      to={`/meeting-room/${meeting.id}`}
                      className="join-button"
                    >
                      Join
                    </NavLink>

                  </div>

                )
              })}

            </div>

          )}

        </section>

        {/* ========================================
            RECENT MEETINGS
        ======================================== */}

        <section className="dashboard-section recent-section">

          <div className="section-header">

            <div>

              <h2>
                Recent Meetings
              </h2>

              <p>
                Your recently completed meetings
              </p>

            </div>

            <NavLink
              to="/meetings"
              className="view-all"
            >
              View history
            </NavLink>

          </div>

          {recentMeetings.length === 0 ? (

            <div className="empty-state">

              <div className="empty-icon">
                🕘
              </div>

              <h3>
                No recent meetings
              </h3>

              <p>
                Your completed meetings
                will appear here.
              </p>

            </div>

          ) : (

            <div>

              {recentMeetings.map((meeting) => {

                const date =
                  formatMeetingDate(
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
                          60}
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
                      style={{
                        background:
                          '#f1f5f9',

                        color:
                          '#64748b',
                      }}
                    >
                      Completed
                    </span>

                    <NavLink
                      to={`/meeting-room/${meeting.id}`}
                      className="join-button"
                      style={{
                        background:
                          '#f1f5f9',

                        color:
                          '#64748b',
                      }}
                    >
                      View
                    </NavLink>

                  </div>

                )
              })}

            </div>

          )}

        </section>

      </main>

    </div>
  )
}

export default Dashboard