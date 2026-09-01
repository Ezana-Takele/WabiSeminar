import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { apiRequest } from '../services/api'
import DashboardLayout from '../components/DashboardLayout'
import '../App.css'

function NewMeetingPage() {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '',
    duration: '30',
    description: '',
  })

  const handleChange = (e) => {
    const { name, value } = e.target

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }))
  }

 const handleSubmit = async (e) => {
  e.preventDefault()

  if (
    !formData.title.trim() ||
    !formData.date ||
    !formData.time
  ) {
    alert('Please fill in the meeting title, date, and time.')
    return
  }

  try {
    const currentUser = JSON.parse(
      localStorage.getItem('wabiCurrentUser')
    )

    if (!currentUser) {
      alert('Please log in first.')
      navigate('/login')
      return
    }

    const newMeeting = {
      host_id: currentUser.id,
      title: formData.title.trim(),
      description: formData.description.trim(),
      date: formData.date,
      time: formData.time,
      duration: Number(formData.duration),
    }

    await apiRequest('/meetings', {
      method: 'POST',
      body: JSON.stringify(newMeeting),
    })

    navigate('/dashboard')

  } catch (error) {
    console.error('Create meeting error:', error)

    alert(
      error.message || 'Failed to create meeting.'
    )
  }
}

  return (
    <DashboardLayout>

        <header className="topbar">

          <div>
            <h1>
              New Meeting
            </h1>

            <p>
              Create a new meeting for your team.
            </p>
          </div>

        </header>


        {/* ========================================
            FORM
        ======================================== */}

        <section className="dashboard-section new-meeting-form">

          <form
            className="meeting-form-content"
            onSubmit={handleSubmit}
          >

            {/* TITLE */}

            <div className="form-group">

              <label htmlFor="title">
                Meeting Title
              </label>

              <input
                id="title"
                name="title"
                type="text"
                placeholder="Enter meeting title"
                value={formData.title}
                onChange={handleChange}
              />

            </div>


            {/* DESCRIPTION */}

            <div className="form-group">

              <label htmlFor="description">
                Description
              </label>

              <textarea
                id="description"
                name="description"
                rows="4"
                placeholder="Add a description (optional)"
                value={formData.description}
                onChange={handleChange}
              />

            </div>


            {/* DATE + TIME */}

            <div className="meeting-form-row">

              <div className="form-group">

                <label htmlFor="date">
                  Date
                </label>

                <input
                  id="date"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleChange}
                />

              </div>


              <div className="form-group">

                <label htmlFor="time">
                  Time
                </label>

                <input
                  id="time"
                  name="time"
                  type="time"
                  value={formData.time}
                  onChange={handleChange}
                />

              </div>

            </div>


            {/* DURATION */}

            <div className="form-group">

              <label htmlFor="duration">
                Duration
              </label>

              <select
                id="duration"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
              >

                <option value="15">
                  15 minutes
                </option>

                <option value="30">
                  30 minutes
                </option>

                <option value="45">
                  45 minutes
                </option>

                <option value="60">
                  1 hour
                </option>

                <option value="90">
                  1 hour 30 minutes
                </option>

              </select>

            </div>


            {/* ACTIONS */}

            <div className="meeting-form-actions">

              <NavLink
                to="/dashboard"
                className="cancel-meeting-button"
              >
                Cancel
              </NavLink>

              <button
                type="submit"
                className="create-meeting-button"
              >
                Create Meeting
              </button>

            </div>

          </form>

        </section>

    </DashboardLayout>
  )
}

export default NewMeetingPage