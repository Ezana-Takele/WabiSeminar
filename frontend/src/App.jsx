import { BrowserRouter, Routes, Route } from 'react-router-dom'

import MeetingsPage from './pages/MeetingsPage'
import NewMeetingPage from './pages/NewMeetingPage'
import JoinMeetingPage from './pages/JoinMeetingPage'
import MeetingRoomPage from './pages/MeetingRoomPage'
import ChatsPage from './pages/ChatsPage'
import NotesPage from './pages/NotesPage'
import SettingsPage from './pages/SettingsPage'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import Dashboard from './pages/Dashboard'
import MeetingNotifier from './components/MeetingNotifier'

function App() {
  return (
    <BrowserRouter>
      <MeetingNotifier />
      <Routes>

        <Route path="/" element={<LandingPage />} />

        <Route path="/login" element={<LoginPage />} />

        <Route path="/register" element={<RegisterPage />} />

        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/meetings" element={<MeetingsPage />} />

        <Route path="/new-meeting" element={<NewMeetingPage />} />

        <Route path="/join-meeting" element={<JoinMeetingPage />} />

        <Route path="/meeting-room/:meetingId" element={<MeetingRoomPage />} />

        <Route path="/chats" element={<ChatsPage />} />

        <Route path="/notes" element={<NotesPage />} />

        <Route path="/settings" element={<SettingsPage />} />

      </Routes>
    </BrowserRouter>
  )
}

export default App