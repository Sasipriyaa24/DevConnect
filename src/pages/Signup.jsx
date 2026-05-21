import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import '../styles/Auth.css'

function Signup() {
  const [name, setName] = useState('')
  const [handle, setHandle] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  
  const { loginWithGoogle } = useAuth()
  const navigate = useNavigate()

  const API_URL = 'http://localhost:5000'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    // Basic validation
    if (!name || !handle || !email || !password) {
      setError('Please fill in all fields.')
      return
    }
    
    try {
      const response = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: email.trim(),
          password: password,
          username: handle.trim(),
          fullName: name.trim()
        })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        // Redirect to login so they can log in
        navigate('/login')
      } else {
        setError(data.error ? `${data.message} (${data.error})` : (data.message || 'Registration failed'))
      }
    } catch (error) {
      setError('Network error registering account')
      console.error(error)
    }
  }

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle()
    } catch (err) {
      setError('Failed to signup with Google')
    }
  }

  return (
    <div className="auth-page">
      <section className="auth-card card">
        <header className="auth-header">
          <h1>Join DevConnect</h1>
          <p>Create a free account to join the community.</p>
        </header>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && <p className="form-error">{error}</p>}
          
          <div className="auth-form-group">
            <label htmlFor="name" className="label">Full Name</label>
            <input
              id="name"
              type="text"
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ada Lovelace"
              required
            />
          </div>

          <div className="auth-form-group">
            <label htmlFor="handle" className="label">Developer Handle</label>
            <input
              id="handle"
              type="text"
              className="input"
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              placeholder="adalovelace"
              required
            />
          </div>

          <div className="auth-form-group">
            <label htmlFor="email" className="label">Email address</label>
            <input
              id="email"
              type="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="auth-form-group">
            <label htmlFor="password" className="label">Password</label>
            <div className="password-input-wrap">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
              <button 
                type="button" 
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <div className="auth-form-footer">
            <button type="submit" className="btn btn-primary">
              Sign up
            </button>
          </div>
        </form>

        <div className="auth-divider">or</div>

        <button 
          type="button" 
          className="btn-google" 
          onClick={handleGoogleLogin}
        >
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            <path d="M1 1h22v22H1z" fill="none"/>
          </svg>
          Continue with Google
        </button>

        <div className="auth-links">
          <p>Already have an account? <Link to="/login">Log in</Link></p>
        </div>
      </section>
    </div>
  )
}

export default Signup
