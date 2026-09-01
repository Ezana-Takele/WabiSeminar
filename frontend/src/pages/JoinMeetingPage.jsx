import { useEffect, useState } from 'react'
import { NavLink, useNavigate, useParams } from 'react-router-dom'
import { apiRequest } from '../services/api'
import DashboardLayout from '../components/DashboardLayout'
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

  const joinMeetingFromUrl = async () => {
    try {
      const currentUser = JSON.parse(
        localStorage.getItem('wabiCurrentUser')
      )

      if (!currentUser) {
        setError('Please log in first.')
        navigate('/login')
        return
      }

      await apiRequest(`/meetings/${meetingId}/join`, {
        method: 'POST',
        body: JSON.stringify({
          user_id: currentUser.id,
        }),
      })

      navigate(`/meeting-room/${meetingId}`, {
        replace: true,
      })

    } catch (error) {
      console.error('Join meeting error:', error)

      setError(
        error.message || 'Failed to join meeting.'
      )
    }
  }

  joinMeetingFromUrl()
}, [meetingId, navigate])

  /*
    Join meeting using meeting code
  */
  const handleSubmit = async (e) => {
  e.preventDefault()

  const code = meetingCode.trim()

  if (!code) {
    setError('Please enter a meeting code.')
    return
  }

  try {
    const currentUser = JSON.parse(
      localStorage.getItem('wabiCurrentUser')
    )

    if (!currentUser) {
      setError('Please log in first.')
      navigate('/login')
      return
    }

    setError('')

    await apiRequest(`/meetings/${code}/join`, {
      method: 'POST',
      body: JSON.stringify({
        user_id: currentUser.id,
      }),
    })

    navigate(`/meeting-room/${code}`)

  } catch (error) {
    console.error('Join meeting error:', error)

    setError(
      error.message ||
      'Meeting not found or could not be joined.'
    )
  }
}
  /*
    If this page is being used with /join-meeting/:meetingId
  */
  if (meetingId) {
    return (
      <DashboardLayout>
        <section className="dashboard-section">
          <div className="empty-state">
            <h3>
              {error || 'Opening meeting...'}
            </h3>

            <p>
              Please wait while we open the meeting room.
            </p>
          </div>
        </section>
      </DashboardLayout>
    )
  }

  /*
    Normal Join Meeting page
  */
  return (
    <DashboardLayout>
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

    </DashboardLayout>
  )
}

export default JoinMeetingPage
