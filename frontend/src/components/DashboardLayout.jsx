import { NavLink, useNavigate } from 'react-router-dom'
import '../App.css'

function DashboardLayout({ children }) {
  const navigate = useNavigate()

  return (
    <div className="app">

      {/* Sidebar */}
      <aside className="sidebar">

        <div className="logo">
          <h2>WabiSeminar</h2>
        </div>

        <nav>

          {/* Home */}
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `nav-item ${isActive ? 'active' : ''}`
            }
          >
            <span className="nav-icon">⌂</span>
            Home
          </NavLink>


          {/* Meetings */}
          <NavLink
            to="/meetings"
            className={({ isActive }) =>
              `nav-item ${isActive ? 'active' : ''}`
            }
          >
            <span className="nav-icon">📅</span>
            Meetings
          </NavLink>


          {/* Chats */}
          <NavLink
            to="/chats"
            className={({ isActive }) =>
              `nav-item ${isActive ? 'active' : ''}`
            }
          >
            <span className="nav-icon">▱</span>
            Chats
          </NavLink>


          {/* Notes */}
          <NavLink
            to="/notes"
            className={({ isActive }) =>
              `nav-item ${isActive ? 'active' : ''}`
            }
          >
            <span className="nav-icon">□</span>
            Notes
          </NavLink>


          {/* Settings */}
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `nav-item ${isActive ? 'active' : ''}`
            }
          >
            <span className="nav-icon">⚙</span>
            Settings
          </NavLink>

        </nav>


        {/* New Meeting */}
        <div className="sidebar-bottom">

          <button
            type="button"
            className="new-meeting-sidebar"
            onClick={() => navigate('/new-meeting')}
          >
            <span>＋</span>
            New Meeting
          </button>

        </div>

      </aside>


      {/* Page content */}
      <main className="main-content">
        {children}
      </main>

    </div>
  )
}

export default DashboardLayout