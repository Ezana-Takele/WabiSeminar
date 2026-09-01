import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { apiRequest } from '../services/api'
import DashboardLayout from '../components/DashboardLayout'
import '../App.css'

function MeetingsPage() {
  const [meetings, setMeetings] = useState([])
  const [loading, setLoading] = useState(true)

  /* ========================================
     CHECK IF MEETING IS COMPLETED

     Backend MySQL can return:
     0 / 1
     "0" / "1"
     true / false
  ======================================== */

  const isCompleted = (meeting) => {
    return (
      meeting?.completed === true ||
      meeting?.completed === 1 ||
      meeting?.completed === '1'
    )
  }

  /* ========================================
     LOAD MEETINGS
  ======================================== */

  useEffect(() => {
    const loadMeetings = async () => {
      try {
        /* ========================================
           LOAD FROM BACKEND
        ======================================== */

        const data = await apiRequest('/meetings')

        console.log(
          'Meetings loaded from API:',
          data
        )

        const apiMeetings = Array.isArray(data)
          ? data
          : (data.meetings || [])

        /* ========================================
           LOAD LOCAL INFORMATION
        ======================================== */

        let savedMeetings = []

        try {
          savedMeetings =
            JSON.parse(
              localStorage.getItem(
                'wabiMeetings'
              )
            ) || []
        } catch (error) {
          console.warn(
            'Could not read saved meetings:',
            error
          )

          savedMeetings = []
        }

        /* ========================================
           MERGE API + LOCAL DATA
        ======================================== */

        const mergedMeetings =
          apiMeetings.map((meeting) => {

            const localMeeting =
              savedMeetings.find(
                (saved) =>
                  String(saved.id) ===
                  String(meeting.id)
              )

            /* ----------------------------------------
               NO LOCAL INFORMATION
            ---------------------------------------- */

            if (!localMeeting) {
              return {
                ...meeting,

                completed:
                  isCompleted(meeting),
              }
            }

            /* ----------------------------------------
               LOCAL INFORMATION EXISTS
            ---------------------------------------- */

            return {
              ...meeting,

              /*
                Local completion takes priority.

                This allows MeetingRoomPage to mark
                a meeting completed even if the backend
                has not yet updated its completed field.
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
          'Merged meetings:',
          mergedMeetings
        )

        setMeetings(
          mergedMeetings
        )

        /*
          Save merged information locally.
        */

        localStorage.setItem(
          'wabiMeetings',
          JSON.stringify(
            mergedMeetings
          )
        )

      } catch (error) {

        console.error(
          'Failed to load meetings:',
          error
        )

        /* ========================================
           BACKEND UNAVAILABLE
           FALL BACK TO LOCAL DATA
        ======================================== */

        try {

          const savedMeetings =
            JSON.parse(
              localStorage.getItem(
                'wabiMeetings'
              )
            ) || []

          const normalizedMeetings =
            savedMeetings.map(
              (meeting) => ({
                ...meeting,

                completed:
                  isCompleted(meeting),
              })
            )

          setMeetings(
            normalizedMeetings
          )

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

  }, [])

  /* ========================================
     MEETING DATE + TIME
  ======================================== */

  const getMeetingDateTime = (
    meeting
  ) => {

    if (!meeting?.date) {
      return null
    }

    if (meeting.time) {

      const dateTime =
        new Date(
          `${meeting.date}T${meeting.time}`
        )

      return isNaN(
        dateTime.getTime()
      )
        ? null
        : dateTime
    }

    const date =
      new Date(
        `${meeting.date}T00:00:00`
      )

    return isNaN(
      date.getTime()
    )
      ? null
      : date
  }

  /* ========================================
     UPCOMING MEETINGS

     IMPORTANT:

     We DO NOT compare against the current
     time anymore.

     A meeting is upcoming until it is
     explicitly completed.
  ======================================== */

  const upcomingMeetings =
    meetings
      .filter(
        (meeting) =>
          !isCompleted(meeting)
      )
      .sort((a, b) => {

        const dateA =
          getMeetingDateTime(a)

        const dateB =
          getMeetingDateTime(b)

        if (!dateA) return 1
        if (!dateB) return -1

        return dateA - dateB

      })

  /* ========================================
     MEETING HISTORY
  ======================================== */

  const meetingHistory =
    meetings
      .filter(
        (meeting) =>
          isCompleted(meeting)
      )
      .sort((a, b) => {

        /*
          Prefer actual completion time.
        */

        if (
          a.completedAt &&
          b.completedAt
        ) {

          return (
            new Date(b.completedAt) -
            new Date(a.completedAt)
          )

        }

        if (a.completedAt) {
          return -1
        }

        if (b.completedAt) {
          return 1
        }

        const dateA =
          getMeetingDateTime(a)

        const dateB =
          getMeetingDateTime(b)

        if (!dateA) return 1
        if (!dateB) return -1

        return dateB - dateA

      })

  /* ========================================
     DATE DISPLAY
  ======================================== */

  const getMeetingDate = (
    date
  ) => {

    if (!date) {

      return {
        day: '--',
        month: '---',
        full: 'Date not set',
      }

    }

    const dateParts =
      String(date).split('-')

    /* ----------------------------------------
       YYYY-MM-DD
    ---------------------------------------- */

    if (
      dateParts.length === 3
    ) {

      const year =
        Number(dateParts[0])

      const month =
        Number(dateParts[1])

      const day =
        Number(dateParts[2])

      const localDate =
        new Date(
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

    /* ----------------------------------------
       FALLBACK
    ---------------------------------------- */

    const meetingDate =
      new Date(date)

    if (
      isNaN(
        meetingDate.getTime()
      )
    ) {

      return {
        day: '--',
        month: '---',
        full: 'Invalid date',
      }

    }

    return {

      day:
        meetingDate.getDate(),

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
     RENDER MEETING
  ======================================== */

  const renderMeeting = (
    meeting,
    isHistory = false
  ) => {

    const date =
      getMeetingDate(
        meeting.date
      )

    return (

      <div
        className="upcoming-meeting"
        key={meeting.id}
      >

        {/* DATE */}

        <div className="meeting-date">

          <strong>
            {date.day}
          </strong>

          <span>
            {date.month}
          </span>

        </div>

        {/* INFORMATION */}

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

        {/* STATUS */}

        <span
          className="meeting-status"
          style={
            isHistory
              ? {
                  background:
                    '#f1f5f9',

                  color:
                    '#64748b',
                }
              : undefined
          }
        >

          {isHistory
            ? 'Completed'
            : 'Upcoming'}

        </span>

        {/* ACTION */}

        {isHistory ? (

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

  /* ========================================
     LOADING
  ======================================== */

  if (loading) {
    return (
      <DashboardLayout>
        <header className="topbar">
          <div>
            <h1>Meetings</h1>
            <p>
              View your upcoming meetings and complete meeting history.
            </p>
          </div>
        </header>

        <section className="dashboard-section">
          <div className="empty-state">
            <h3>Loading meetings...</h3>
          </div>
        </section>
      </DashboardLayout>
    )
  }

  /* ========================================
     MAIN UI
  ======================================== */

  return (
    <DashboardLayout>

        <header className="topbar">

          <div>

            <h1>
              Meetings
            </h1>

            <p>
              View your upcoming meetings
              and complete meeting history.
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
            UPCOMING MEETINGS
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
                color:
                  '#94a3b8',

                fontSize:
                  '12px',

                fontWeight:
                  '600',
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
            MEETING HISTORY
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
                color:
                  '#94a3b8',

                fontSize:
                  '12px',

                fontWeight:
                  '600',
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

    </DashboardLayout>
  )
}

export default MeetingsPage