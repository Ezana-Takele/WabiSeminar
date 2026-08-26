import { useEffect, useState } from 'react'
import { NavLink, useNavigate, useParams } from 'react-router-dom'
import '../App.css'

function JoinMeetingPage() {
  const navigate = useNavigate()
  const { meetingId } = useParams()

  const [meetingCode, setMeetingCode] = useState('')
  const [error, setError] = useState('')
  const [meeting, setMeeting] = useState(null)

  /*
    If a meeting ID is already in the URL,
    find that meeting and redirect to the meeting room.
  */
  useEffect(() => {
    if (!meetingId) {
      return
    }

    const savedMeetings =
      JSON.parse(localStorage.getItem('wabiMeetings')) || []

    const selectedMeeting = savedMeetings.find(
      (item) => String(item.id) === String(meetingId)
    )

    if (selectedMeeting) {
      setMeeting(selectedMeeting)

      navigate(`/meeting-room/${selectedMeeting.id}`, {
        replace: true,
      })
    } else {
      setError('Meeting not found.')
    }
  }, [meetingId, navigate])

  /*
    Join meeting using meeting code
  */
  const handleSubmit = (e) => {
    e.preventDefault()

    const code = meetingCode.trim()

    if (!code) {
      setError('Please enter a meeting code.')
      return
    }

    const savedMeetings =
      JSON.parse(localStorage.getItem('wabiMeetings')) || []

    const selectedMeeting = savedMeetings.find(
      (item) => String(item.id) === String(code)
    )

    if (!selectedMeeting) {
      setError(
        'Meeting not found. Please enter a valid meeting code.'
      )
      return
    }

    setError('')

    navigate(`/meeting-room/${selectedMeeting.id}`)
  }

  /*
    If this page is being used with /join-meeting/:meetingId
  */
  if (meetingId) {
    return (
      <div className="app">
        <main className="main-content">
          <section className="dashboard-section">
            <div className="empty-state">
              <div className="empty-icon">
                📅
              </div>

              <h3>
                {error || 'Opening meeting...'}
              </h3>

              <p>
                Please wait while we open the meeting room.
              </p>
            </div>
          </section>
        </main>
      </div>
    )
  }

  /*
    Normal Join Meeting page
  */
  return (
    <div className="app">

      {/* Sidebar */}
      <aside className="sidebar">

        <div className="logo">
          <h2>WabiSeminar</h2>
        </div>

        <nav>

          <NavLink
            to="/dashboard"
            className="nav-item"
          >
            <span className="nav-icon">⌂</span>
            Home
          </NavLink>

          <NavLink
            to="/meetings"
            className="nav-item"
          >
            <span className="nav-icon">📅</span>
            Meetings
          </NavLink>

          <a
            className="nav-item"
            href="#"
            onClick={(e) => e.preventDefault()}
          >
            <span className="nav-icon">♙</span>
            People
          </a>

          <a
            className="nav-item"
            href="#"
            onClick={(e) => e.preventDefault()}
          >
            <span className="nav-icon">▱</span>
            Chats
          </a>

          <a
            className="nav-item"
            href="#"
            onClick={(e) => e.preventDefault()}
          >
            <span className="nav-icon">□</span>
            Notes
          </a>

          <a
            className="nav-item"
            href="#"
            onClick={(e) => e.preventDefault()}
          >
            <span className="nav-icon">⚙</span>
            Settings
          </a>

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


      {/* Main Content */}
      <main className="main-content">

        <header className="topbar">

          <div>
            <h1>
              Join Meeting
            </h1>

            <p>
              Enter a meeting code to join your meeting.
            </p>
          </div>

        </header>


        {/* Join Meeting Card */}
        <section className="dashboard-section join-meeting-form">

          <div className="join-meeting-hero">

            <div className="join-meeting-icon">
              📹
            </div>

            <h2>
              Join a meeting
            </h2>

            <p>
              Enter the meeting code provided by the organizer.
            </p>

          </div>


          <form
            className="meeting-form-content"
            onSubmit={handleSubmit}
          >

            <div className="form-group">

              <label htmlFor="meetingCode">
                Meeting Code
              </label>

              <input
                id="meetingCode"
                name="meetingCode"
                type="text"
                placeholder="Example: 1787158827083"
                value={meetingCode}
                onChange={(e) => {
                  setMeetingCode(e.target.value)
                  setError('')
                }}
              />

            </div>


            {error && (
              <p className="join-error">
                {error}
              </p>
            )}


            <div className="meeting-form-actions">

              <NavLink
                to="/meetings"
                className="cancel-meeting-button"
              >
                Cancel
              </NavLink>

              <button
                type="submit"
                className="create-meeting-button"
              >
                Join Meeting
              </button>

            </div>

          </form>

        </section>

      </main>

    </div>
  )
}

export default JoinMeetingPage
