import './LandingPage.css'
import { Link } from 'react-router-dom'

function LandingPage() {
  return (
    <div className="landing-page">

      {/* Header */}
      <header className="landing-header">

        <Link to="/" className="landing-logo">
          <span className="logo-mark">W</span>
          <span>WabiSeminar</span>
        </Link>

        <div className="landing-actions">

          <Link
            to="/login"
            className="login-button"
          >
            Login
          </Link>

          <Link
            to="/register"
            className="header-start-button"
          >
            Get Started
          </Link>

        </div>

      </header>


      {/* Main */}
      <main className="landing-main">

        <section className="hero-section">

          {/* Left side */}
          <div className="hero-content">

            <div className="hero-badge">
              <span>✦</span>
              Simple meetings. Better collaboration.
            </div>

            <h1>
              Meetings made simple.
              <span>Collaboration made better.</span>
            </h1>

            <p>
              WabiSeminar brings meetings, people, conversations,
              and notes together in one simple place.
            </p>

            <div className="hero-buttons">

              <Link
                to="/register"
                className="hero-primary-button"
              >
                Get Started
                <span>→</span>
              </Link>

              <Link
                to="/login"
                className="hero-secondary-button"
              >
                Join a Meeting
              </Link>

            </div>

            <div className="hero-note">
              Simple setup. Better collaboration.
            </div>

          </div>


          {/* Right side */}
          <div className="hero-visual">

            <div className="glow glow-one"></div>
            <div className="glow glow-two"></div>

            <div className="meeting-preview">

              {/* Meeting header */}
              <div className="preview-header">

                <div className="preview-title">
                  <strong>Team Meeting</strong>
                  <span>5 participants</span>
                </div>

                <div className="preview-live">
                  <span>●</span>
                  Live
                </div>

              </div>


              {/* Participants */}
              <div className="video-grid">

                <div className="video-card video-one">
                  <div className="person-avatar">
                    T
                  </div>
                  <span>Tnebeb</span>
                </div>

                <div className="video-card video-two">
                  <div className="person-avatar">
                    A
                  </div>
                  <span>Alex</span>
                </div>

                <div className="video-card video-three">
                  <div className="person-avatar">
                    F
                  </div>
                  <span>Fitsum</span>
                </div>

                <div className="video-card video-four">
                  <div className="person-avatar">
                    E
                  </div>
                  <span>Ermias</span>
                </div>

              </div>


              {/* Meeting controls */}
              <div className="preview-controls">

                <span>🎤</span>
                <span>📹</span>
                <span>🖥</span>
                <span>😀</span>

                <span className="end-preview">
                  ☎
                </span>

              </div>

            </div>

          </div>

        </section>


        {/* Features */}
        <section className="landing-features">

          <div className="feature-card">

            <div className="feature-icon">
              📅
            </div>

            <div>
              <h3>Plan Meetings</h3>

              <p>
                Schedule and organize meetings easily.
              </p>
            </div>

          </div>


          <div className="feature-card">

            <div className="feature-icon">
              👥
            </div>

            <div>
              <h3>Work Together</h3>

              <p>
                Keep your team connected and organized.
              </p>
            </div>

          </div>


          <div className="feature-card">

            <div className="feature-icon">
              📝
            </div>

            <div>
              <h3>Meeting Notes</h3>

              <p>
                Keep important ideas and notes together.
              </p>
            </div>

          </div>

        </section>

      </main>


      {/* Footer */}
      <footer className="landing-footer">

        <span>
          © 2026 WabiSeminar
        </span>

        <span>
          Meet. Collaborate. Accomplish.
        </span>

      </footer>

    </div>
  )
}

export default LandingPage