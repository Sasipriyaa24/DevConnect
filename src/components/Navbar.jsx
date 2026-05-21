import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import '../styles/Navbar.css'

/**
 * Responsive site navigation — mobile menu toggles with React state.
 * NavLink adds an "active" class for the current route (styled in CSS).
 */
function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { user, logout } = useAuth()

  const closeMenu = () => setMenuOpen(false)

  const handleLogoutClick = () => {
    closeMenu()
    if (logout) logout()
  }

  return (
    <header className="navbar">
      <div className="navbar-inner section-inner">
        <NavLink to="/" className="navbar-logo" onClick={closeMenu}>
          <span className="navbar-logo-mark">{'</>'}</span>
          <span className="navbar-logo-text">DevConnect</span>
        </NavLink>

        <button
          type="button"
          className="navbar-toggle"
          aria-expanded={menuOpen}
          aria-label="Toggle navigation menu"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span />
          <span />
          <span />
        </button>

        <nav className={`navbar-links ${menuOpen ? 'is-open' : ''}`}>
          <NavLink to="/" end className="navbar-link" onClick={closeMenu}>
            Home
          </NavLink>
          <NavLink to="/feed" className="navbar-link" onClick={closeMenu}>
            Feed
          </NavLink>
          <NavLink to="/search" className="navbar-link" onClick={closeMenu}>
            Search Devs
          </NavLink>
          <NavLink to="/dashboard" className="navbar-link" onClick={closeMenu}>
            Dashboard
          </NavLink>
          <NavLink to="/profile" className="navbar-link" onClick={closeMenu}>
            Profile
          </NavLink>
          <NavLink to="/create-post" className="navbar-link" onClick={closeMenu}>
            Create Post
          </NavLink>
          <div className="navbar-actions">
            {user ? (
              <>
                <span className="navbar-link" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {user.avatarUrl && <img src={user.avatarUrl} alt="Avatar" style={{ width: '24px', height: '24px', borderRadius: '50%' }} />}
                  Hi, {user.full_name || user.fullName || user.username}
                </span>
                <button onClick={handleLogoutClick} className="btn btn-ghost">
                  Log out
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" className="btn btn-ghost" onClick={closeMenu}>
                  Log in
                </NavLink>
                <NavLink to="/signup" className="btn btn-primary" onClick={closeMenu}>
                  Sign up
                </NavLink>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  )
}

export default Navbar
