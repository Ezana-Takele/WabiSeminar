import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiRequest } from '../services/api'
import './RegisterPage.css'

function RegisterPage() {
  const navigate = useNavigate()

  const emailRef = useRef(null)
  const passwordRef = useRef(null)
  const confirmPasswordRef = useRef(null)
  const submitRef = useRef(null)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  const [error, setError] = useState('')

  const handleChange = (e) => {
    const { id, value } = e.target

    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }))

    setError('')
  }

  const handleKeyDown = (e, nextRef) => {
    if (e.key === 'Enter') {
      e.preventDefault()

      if (nextRef?.current) {
        nextRef.current.focus()
      }
    }
  }

 
  const handleSubmit = async (e) => {
  e.preventDefault()

  const name = formData.name.trim()
  const email = formData.email.trim().toLowerCase()
  const password = formData.password
  const confirmPassword = formData.confirmPassword

  if (!name || !email || !password || !confirmPassword) {
    setError('Please fill in all fields.')
    return
  }

  if (password !== confirmPassword) {
    setError('Passwords do not match.')
    return
  }

  try {
    await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name,
        email,
        password,
      }),
    })

    navigate('/login')
  } catch (err) {
    setError(err.message)
  }
}
  

  return (
    <div className="register-page">

      <div className="register-card">

        {/* Logo */}
        <Link
          to="/"
          className="register-logo"
        >
          <span className="register-logo-mark">
            W
          </span>

          <span>
            WabiSeminar
          </span>
        </Link>


        {/* Heading */}
        <div className="register-heading">

          <h1>
            Create your account
          </h1>

          <p>
            Join WabiSeminar and start collaborating.
          </p>

        </div>


        {/* Register Form */}
        <form
          className="register-form"
          onSubmit={handleSubmit}
        >

          {/* Full Name */}
          <div className="form-group">

            <label htmlFor="name">
              Full Name
            </label>

            <input
              id="name"
              type="text"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
              onKeyDown={(e) =>
                handleKeyDown(e, emailRef)
              }
            />

          </div>


          {/* Email */}
          <div className="form-group">

            <label htmlFor="email">
              Email
            </label>

            <input
              ref={emailRef}
              id="email"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              onKeyDown={(e) =>
                handleKeyDown(e, passwordRef)
              }
            />

          </div>


          {/* Password */}
          <div className="form-group">

            <label htmlFor="password">
              Password
            </label>

            <input
              ref={passwordRef}
              id="password"
              type="password"
              placeholder="Create a password"
              value={formData.password}
              onChange={handleChange}
              onKeyDown={(e) =>
                handleKeyDown(
                  e,
                  confirmPasswordRef
                )
              }
            />

          </div>


          {/* Confirm Password */}
          <div className="form-group">

            <label htmlFor="confirmPassword">
              Confirm Password
            </label>

            <input
              ref={confirmPasswordRef}
              id="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              onKeyDown={(e) =>
                handleKeyDown(e, submitRef)
              }
            />

          </div>


          {/* Error */}
          {error && (
            <p
              style={{
                margin: '-4px 0 0',
                color: '#dc2626',
                fontSize: '12px',
                textAlign: 'center',
              }}
            >
              {error}
            </p>
          )}


          {/* Create Account */}
          <button
            ref={submitRef}
            type="submit"
            className="register-submit"
          >
            Create Account
          </button>

        </form>


        {/* Login */}
        <p className="login-text">

          Already have an account?{' '}

          <Link to="/login">
            Sign in
          </Link>

        </p>


        {/* Back */}
        <Link
          to="/"
          className="back-home"
        >
          ← Back to home
        </Link>

      </div>

    </div>
  )
}

export default RegisterPage