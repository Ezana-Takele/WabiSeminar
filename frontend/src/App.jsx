import './App.css'

function App() {
  return (
    <div className="app">
      <aside className="sidebar">
        <div className="logo">
          <h2>WabiSeminar</h2>
        </div>

        <nav>
          <a className="nav-item active" href="#">
            Dashboard
          </a>

          <a className="nav-item" href="#">
            Seminars
          </a>

          <a className="nav-item" href="#">
            Participants
          </a>

          <a className="nav-item" href="#">
            Speakers
          </a>

          <a className="nav-item" href="#">
            Schedule
          </a>

          <a className="nav-item" href="#">
            Settings
          </a>
        </nav>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <h1>Dashboard</h1>
            <p>Welcome back to WabiSeminar.</p>
          </div>

          <div className="user-profile">
            <div className="avatar">T</div>
            <span>Admin</span>
          </div>
        </header>

        <section className="stats">
          <div className="stat-card">
            <span>Total Seminars</span>
            <strong>24</strong>
          </div>

          <div className="stat-card">
            <span>Participants</span>
            <strong>348</strong>
          </div>

          <div className="stat-card">
            <span>Speakers</span>
            <strong>32</strong>
          </div>

          <div className="stat-card">
            <span>Upcoming</span>
            <strong>8</strong>
          </div>
        </section>

        <section className="dashboard-section">
          <div className="section-header">
            <div>
              <h2>Upcoming Seminars</h2>
              <p>Recently scheduled seminars</p>
            </div>

            <button>View all</button>
          </div>

          <div className="seminar-list">
            <div className="seminar-row">
              <div>
                <h3>Research Methodology Seminar</h3>
                <p>August 25, 2026 · Main Hall</p>
              </div>

              <span className="status">Upcoming</span>
            </div>

            <div className="seminar-row">
              <div>
                <h3>Academic Writing Workshop</h3>
                <p>August 28, 2026 · Conference Room</p>
              </div>

              <span className="status">Upcoming</span>
            </div>

            <div className="seminar-row">
              <div>
                <h3>Technology and Innovation</h3>
                <p>September 2, 2026 · Main Hall</p>
              </div>

              <span className="status">Upcoming</span>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default App