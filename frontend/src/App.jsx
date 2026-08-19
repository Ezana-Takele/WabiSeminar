import './App.css'

function App() {
  return (
    <div className="app">

      {/* Sidebar */}
      <aside className="sidebar">

        <div className="logo">
          <h2>WabiSeminar</h2>
        </div>

        <nav>
          <a className="nav-item active" href="#">
            <span className="nav-icon">⌂</span>
            Home
          </a>

          <a className="nav-item" href="#">
            <span className="nav-icon">▣</span>
            Meetings
          </a>

          <a className="nav-item" href="#">
            <span className="nav-icon">♙</span>
            People
          </a>

          <a className="nav-item" href="#">
            <span className="nav-icon">▱</span>
            Chats
          </a>

          <a className="nav-item" href="#">
            <span className="nav-icon">□</span>
            Notes
          </a>

          <a className="nav-item" href="#">
            <span className="nav-icon">⚙</span>
            Settings
          </a>
        </nav>

        <div className="sidebar-bottom">
          <button className="new-meeting-sidebar">
            <span>＋</span>
            New Meeting
          </button>
        </div>

      </aside>

      {/* Main content */}
      <main className="main-content">

        {/* Header */}
        <header className="topbar">

          <div>
            <h1>Good morning, Tnebeb 👋</h1>
            <p>Ready for your next meeting?</p>
          </div>

          <div className="user-profile">
            <div className="avatar">T</div>

            <div className="user-info">
              <strong>Tnebeb</strong>
              <span>Admin</span>
            </div>
          </div>

        </header>

        {/* Quick Actions */}
        <section className="quick-actions">

          <button className="action-card primary-action">
            <div className="action-icon">＋</div>

            <div>
              <strong>New Meeting</strong>
              <span>Create a new meeting</span>
            </div>
          </button>

          <button className="action-card">
            <div className="action-icon">↗</div>

            <div>
              <strong>Join Meeting</strong>
              <span>Enter a meeting code</span>
            </div>
          </button>

          <button className="action-card">
            <div className="action-icon">▣</div>

            <div>
              <strong>Schedule</strong>
              <span>Plan a future meeting</span>
            </div>
          </button>

        </section>

        {/* Upcoming Meetings */}
        <section className="dashboard-section">

          <div className="section-header">

            <div>
              <h2>Upcoming Meetings</h2>
              <p>Your next scheduled meetings</p>
            </div>

            <button className="view-all">
              View all
            </button>

          </div>

          <div className="empty-state">

            <div className="empty-icon">
              📅
            </div>

            <h3>No upcoming meetings</h3>

            <p>
              You don't have any meetings scheduled yet.
            </p>

            <button className="empty-action">
              Schedule Meeting
            </button>

          </div>

        </section>

        {/* Recent Meetings */}
        <section className="dashboard-section recent-section">

          <div className="section-header">

            <div>
              <h2>Recent Meetings</h2>
              <p>Your recently completed meetings</p>
            </div>

            <button className="view-all">
              View history
            </button>

          </div>

          <div className="empty-state">

            <div className="empty-icon">
              🕘
            </div>

            <h3>No recent meetings</h3>

            <p>
              Your completed meetings will appear here.
            </p>

          </div>

        </section>

      </main>
    </div>
  )
}

export default App