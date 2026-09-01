import { useEffect, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import DashboardLayout from '../components/DashboardLayout'
import '../App.css'
import './SettingsPage.css'

function SettingsPage() {
  const [name, setName] = useState('Tnebeb')
  const [email, setEmail] = useState('')
  const [notifications, setNotifications] = useState(true)
  const [sound, setSound] = useState(true)
  const [autoJoinMic, setAutoJoinMic] = useState(true)
  const [autoJoinCamera, setAutoJoinCamera] = useState(true)
  const [saved, setSaved] = useState(false)

  /* ========================================
     LOAD SETTINGS
  ======================================== */

  useEffect(() => {
    const savedSettings =
      JSON.parse(
        localStorage.getItem('wabiSettings')
      ) || {}

    if (savedSettings.name) {
      setName(savedSettings.name)
    }

    if (savedSettings.email) {
      setEmail(savedSettings.email)
    }

    if (
      typeof savedSettings.notifications ===
      'boolean'
    ) {
      setNotifications(
        savedSettings.notifications
      )
    }

    if (
      typeof savedSettings.sound === 'boolean'
    ) {
      setSound(savedSettings.sound)
    }

    if (
      typeof savedSettings.autoJoinMic ===
      'boolean'
    ) {
      setAutoJoinMic(
        savedSettings.autoJoinMic
      )
    }

    if (
      typeof savedSettings.autoJoinCamera ===
      'boolean'
    ) {
      setAutoJoinCamera(
        savedSettings.autoJoinCamera
      )
    }
  }, [])

  /* ========================================
     SAVE SETTINGS
  ======================================== */

  const handleSave = () => {
    const settings = {
      name,
      email,
      notifications,
      sound,
      autoJoinMic,
      autoJoinCamera,
    }

    localStorage.setItem(
      'wabiSettings',
      JSON.stringify(settings)
    )

    setSaved(true)

    setTimeout(() => {
      setSaved(false)
    }, 2000)
  }

  /* ========================================
     RESET APP DATA
  ======================================== */

  const handleResetData = () => {
    const confirmed = window.confirm(
      'This will permanently delete your meetings, chats, notes, polls, files, and agendas. Are you sure?'
    )

    if (!confirmed) {
      return
    }

    localStorage.removeItem('wabiMeetings')
    localStorage.removeItem('wabiChats')
    localStorage.removeItem('wabiNotes')
    localStorage.removeItem('wabiMeetingNotes')
    localStorage.removeItem('wabiMeetingPolls')
    localStorage.removeItem('wabiMeetingFiles')
    localStorage.removeItem('wabiMeetingAgenda')

    alert(
      'Your meetings, chats, notes, polls, files, and agendas have been deleted.'
    )

    window.location.reload()
  }

  return (
    <DashboardLayout>

        {/* HEADER */}

        <header className="topbar">

          <div>

            <h1>
              Settings
            </h1>

            <p>
              Manage your WabiSeminar preferences.
            </p>

          </div>

        </header>


        {/* ======================================
            PROFILE
        ====================================== */}

        <section className="settings-section">

          <div className="settings-section-header">

            <div>

              <h2>
                Profile
              </h2>

              <p>
                Manage your account information.
              </p>

            </div>

          </div>


          <div className="settings-card">

            <div className="settings-profile">

              <div className="settings-avatar">
                {name
                  ? name.charAt(0).toUpperCase()
                  : 'T'}
              </div>

              <div>

                <strong>
                  {name || 'Tnebeb'}
                </strong>

                <span>
                  Admin
                </span>

              </div>

            </div>


            <div className="settings-form">

              <div className="settings-form-group">

                <label htmlFor="name">
                  Display Name
                </label>

                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                  placeholder="Your name"
                />

              </div>


              <div className="settings-form-group">

                <label htmlFor="email">
                  Email
                </label>

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  placeholder="your@email.com"
                />

              </div>

            </div>

          </div>

        </section>


        {/* ======================================
            NOTIFICATIONS
        ====================================== */}

        <section className="settings-section">

          <div className="settings-section-header">

            <div>

              <h2>
                Notifications
              </h2>

              <p>
                Choose how WabiSeminar keeps you
                informed.
              </p>

            </div>

          </div>


          <div className="settings-card settings-options">

            <div className="setting-option">

              <div>

                <strong>
                  Meeting notifications
                </strong>

                <span>
                  Receive notifications about
                  upcoming meetings.
                </span>

              </div>

              <button
                type="button"
                className={`toggle ${
                  notifications
                    ? 'on'
                    : ''
                }`}
                onClick={() =>
                  setNotifications(
                    !notifications
                  )
                }
              >
                <span />
              </button>

            </div>


            <div className="setting-option">

              <div>

                <strong>
                  Notification sounds
                </strong>

                <span>
                  Play a sound when you receive a
                  notification.
                </span>

              </div>

              <button
                type="button"
                className={`toggle ${
                  sound ? 'on' : ''
                }`}
                onClick={() =>
                  setSound(!sound)
                }
              >
                <span />
              </button>

            </div>

          </div>

        </section>


        {/* ======================================
            MEETING PREFERENCES
        ====================================== */}

        <section className="settings-section">

          <div className="settings-section-header">

            <div>

              <h2>
                Meeting Preferences
              </h2>

              <p>
                Choose your default meeting
                behavior.
              </p>

            </div>

          </div>


          <div className="settings-card settings-options">

            <div className="setting-option">

              <div>

                <strong>
                  Microphone on when joining
                </strong>

                <span>
                  Start meetings with your
                  microphone enabled.
                </span>

              </div>

              <button
                type="button"
                className={`toggle ${
                  autoJoinMic
                    ? 'on'
                    : ''
                }`}
                onClick={() =>
                  setAutoJoinMic(
                    !autoJoinMic
                  )
                }
              >
                <span />
              </button>

            </div>


            <div className="setting-option">

              <div>

                <strong>
                  Camera on when joining
                </strong>

                <span>
                  Start meetings with your
                  camera enabled.
                </span>

              </div>

              <button
                type="button"
                className={`toggle ${
                  autoJoinCamera
                    ? 'on'
                    : ''
                }`}
                onClick={() =>
                  setAutoJoinCamera(
                    !autoJoinCamera
                  )
                }
              >
                <span />
              </button>

            </div>

          </div>

        </section>


        {/* ======================================
            SAVE
        ====================================== */}

        <div className="settings-actions">

          {saved && (
            <span className="settings-saved">
              ✓ Settings saved
            </span>
          )}

          <button
            type="button"
            className="create-meeting-button"
            onClick={handleSave}
          >
            Save Changes
          </button>

        </div>


        {/* ======================================
            DANGER ZONE
        ====================================== */}

        <section className="settings-section danger-section">

          <div className="settings-section-header">

            <div>

              <h2>
                Data
              </h2>

              <p>
                Manage your locally stored
                WabiSeminar data.
              </p>

            </div>

          </div>


          <div className="settings-card danger-card">

            <div>

              <strong>
                Reset application data
              </strong>

              <span>
                Delete all locally stored meetings,
                chats, notes, polls, files, and
                agendas.
              </span>

            </div>

            <button
              type="button"
              className="reset-data-button"
              onClick={handleResetData}
            >
              Reset Data
            </button>

          </div>

        </section>

    </DashboardLayout>
  )
}

export default SettingsPage
