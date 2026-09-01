import { NavLink, useNavigate } from 'react-router-dom'
import {
  Home,
  Calendar,
  MessageSquare,
  FileText,
  Settings,
  Plus
} from 'lucide-react'
import '../App.css'

function DashboardLayout({ children }) {
  const navigate = useNavigate()

  return (
    <div className="app">

      {/* Sidebar */}
      <aside className="sidebar">

        <div className="logo">
          <div className="aerotrace-brand">
            <div className="aerotrace-emblem">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 3v18" />
                <path d="m16 8-4-4-4 4" />
              </svg>
            </div>
            <h2>WabiSeminar <span className="aerotrace-badge">AERO</span></h2>
          </div>
        </div>

        <nav>

          {/* Home */}
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `nav-item ${isActive ? 'active' : ''}`
            }
          >
            <Home size={18} className="nav-icon" />
            Home
          </NavLink>


          {/* Meetings */}
          <NavLink
            to="/meetings"
            className={({ isActive }) =>
              `nav-item ${isActive ? 'active' : ''}`
            }
          >
            <Calendar size={18} className="nav-icon" />
            Meetings
          </NavLink>


          {/* Chats */}
          <NavLink
            to="/chats"
            className={({ isActive }) =>
              `nav-item ${isActive ? 'active' : ''}`
            }
          >
            <MessageSquare size={18} className="nav-icon" />
            Chats
          </NavLink>


          {/* Notes */}
          <NavLink
            to="/notes"
            className={({ isActive }) =>
              `nav-item ${isActive ? 'active' : ''}`
            }
          >
            <FileText size={18} className="nav-icon" />
            Notes
          </NavLink>


          {/* Settings */}
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `nav-item ${isActive ? 'active' : ''}`
            }
          >
            <Settings size={18} className="nav-icon" />
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
            <Plus size={16} />
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