import { useState, useEffect, useRef } from 'react'
import { getToken } from '../lib/getToken'
import { API_URL } from '../lib/apiUrl'
import '../styles/SearchDevs.css'

/**
 * SearchDevs Page — Developer Directory with real-time search.
 * 
 * KEY IMPROVEMENTS:
 * - Debounced search: waits 400ms after typing stops before calling the API
 * - Uses GET /users/search/:query when there's a search term
 * - Falls back to GET /users (all developers) when search is empty
 * - Uses getToken() for authenticated requests (follow status)
 */
function SearchDevs({ currentUser, onUserUpdate }) {
  const [developers, setDevelopers] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const debounceTimer = useRef(null)

  // Fetch all developers on mount
  useEffect(() => {
    fetchDevelopers()
  }, [currentUser])

  /**
   * fetchDevelopers — Loads all devs or searches based on query.
   * Also fetches follow status for the logged-in user.
   */
  const fetchDevelopers = async (query = '') => {
    setLoading(true)
    setError(null)
    try {
      const token = await getToken()

      // Choose endpoint based on whether there's a search query
      const endpoint = query.trim()
        ? `${API_URL}/users/search/${encodeURIComponent(query.trim())}`
        : `${API_URL}/users`

      const res = await fetch(endpoint)
      const data = await res.json()

      if (data.success) {
        let devs = Array.isArray(data.data) ? data.data : []

        // Fetch following relationships if logged in
        if (currentUser && token) {
          try {
            const followRes = await fetch(`${API_URL}/users/me/following`, {
              headers: { 'Authorization': `Bearer ${token}` }
            })
            const followData = await followRes.json()
            if (followRes.ok && followData.success) {
              const followedIds = Array.isArray(followData.data) ? followData.data : []
              devs = devs.map(dev => {
                const devId = dev.id ?? dev.user_id ?? dev._id
                return {
                  ...dev,
                  isFollowing: followedIds.some(id => String(id) === String(devId))
                }
              })
            }
          } catch (followErr) {
            console.error('Error fetching follow status:', followErr)
          }
        }
        setDevelopers(devs)
      } else {
        console.warn('Developer fetch returned no data:', data)
        setDevelopers([])
      }
    } catch (err) {
      console.error('Error fetching developers:', err)
      setError('Could not load developers. Is the backend running?')
      setDevelopers([])
    } finally {
      setLoading(false)
    }
  }

  /**
   * Debounced search — waits 400ms after user stops typing,
   * then calls the search API. This prevents excessive API calls.
   */
  const handleSearchChange = (e) => {
    const value = e.target.value
    setSearchQuery(value)

    // Clear any existing timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }

    // Set a new timer
    debounceTimer.current = setTimeout(() => {
      fetchDevelopers(value)
    }, 400)
  }

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current)
    }
  }, [])

  // Handle follow / unfollow toggle
  const handleFollowToggle = async (targetDevId) => {
    if (!currentUser) {
      alert('You must be logged in to follow other developers!')
      return
    }

    try {
      const token = await getToken()
      if (!token) {
        alert('Unable to follow because no valid authentication token was found. Please log in again.')
        return
      }

      const res = await fetch(`${API_URL}/users/${targetDevId}/follow`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await res.json()

      if (res.ok && data.success) {
        setDevelopers(prevDevs =>
          prevDevs.map(dev => {
            if (String(dev.id) === String(targetDevId)) {
              const currentFollowers = dev.followers ?? dev.followers_count ?? 0
              return {
                ...dev,
                isFollowing: data.isFollowing,
                followers: data.isFollowing ? currentFollowers + 1 : Math.max(0, currentFollowers - 1)
              }
            }
            return dev
          })
        )

        // Refresh the list so the follow status stays consistent with the backend
        await fetchDevelopers(searchQuery)

        // Sync the logged-in user's following count globally
        if (onUserUpdate) {
          const updatedFollowingCount = data.isFollowing
            ? (currentUser.following || 0) + 1
            : Math.max(0, (currentUser.following || 0) - 1);

          onUserUpdate({
            ...currentUser,
            following: updatedFollowingCount
          });
        }
        return
      }

      if (res.status === 401) {
        alert('Authentication failed while toggling follow. Please log in again.')
        return
      }

      alert(data.message || 'Could not toggle follow status')
    } catch (err) {
      console.error('Error toggling follow:', err)
    }
  }

  return (
    <div className="search-devs-page page-layout">
      <div className="section-inner">
        <header className="page-header" style={{ maxWidth: '680px', margin: '0 auto 2.5rem', textAlign: 'center' }}>
          <h1>Developer Directory</h1>
          <p>Find and connect with fellow developers in the DevConnect community.</p>
        </header>

        {/* Search Input Card */}
        <section className="search-filter-card card" style={{ maxWidth: '680px', margin: '0 auto 2rem', padding: 'var(--space-md)' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label htmlFor="dev-search-input" className="visually-hidden">Search developers</label>
            <input
              id="dev-search-input"
              type="search"
              className="input"
              placeholder="Search by name, skills (e.g. React, Python), or location..."
              value={searchQuery}
              onChange={handleSearchChange}
              style={{ fontSize: '1rem', padding: '0.85rem var(--space-md)' }}
            />
          </div>
        </section>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
            Loading developer profiles...
          </div>
        ) : error ? (
          <div className="card card-padded" style={{ textAlign: 'center', padding: '4rem', maxWidth: '680px', margin: '0 auto' }}>
            <p style={{ color: 'var(--danger)', fontSize: '1.05rem', margin: 0 }}>{error}</p>
          </div>
        ) : developers.length === 0 ? (
          <div className="card card-padded" style={{ textAlign: 'center', padding: '4rem', maxWidth: '680px', margin: '0 auto' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', margin: 0 }}>
              {searchQuery.trim()
                ? `No developers found matching "${searchQuery}". Try a different keyword!`
                : 'No developers found. Try searching for "React", "PostgreSQL", or another keyword!'}
            </p>
          </div>
        ) : (
          <div className="dev-directory-grid">
            {developers.map(dev => {
              const fullName = dev.full_name || dev.fullName || dev.name || 'Developer'
              const username = dev.username || 'unknown'
              const skills = Array.isArray(dev.skills)
                ? dev.skills
                : typeof dev.skills === 'string'
                ? dev.skills.split(',').map(skill => skill.trim()).filter(Boolean)
                : []
              const devId = dev.id ?? dev.user_id ?? dev._id
              const devAvatar = dev.profile_image || dev.profileImage || dev.avatarUrl || fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
              const isOwnProfile = currentUser && String(currentUser.id) === String(devId)

              return (
                <article key={devId} className="developer-card card">
                  <header className="dev-card-header">
                    <div className="profile-avatar-lg" style={{ fontSize: '1.25rem' }}>{devAvatar}</div>
                    <div className="dev-card-meta">
                      <h3>{fullName}</h3>
                      <p className="handle">@{username}</p>
                      {dev.location && <p className="location">📍 {dev.location}</p>}
                    </div>
                  </header>
                  
                  <div className="dev-card-body">
                    <p className="bio">{dev.bio || 'No bio provided yet.'}</p>
                    
                    {skills.length > 0 && (
                      <div className="skills-wrap">
                        {skills.map(skill => (
                          <span key={skill} className="badge">{skill}</span>
                        ))}
                      </div>
                    )}
                  </div>

                  <footer className="dev-card-footer">
                    <div className="dev-card-stats">
                      <div>
                        <strong>{dev.followers ?? dev.followers_count ?? 0}</strong>
                        <span>followers</span>
                      </div>
                      <div>
                        <strong>{dev.following ?? dev.following_count ?? 0}</strong>
                        <span>following</span>
                      </div>
                    </div>

                    {!isOwnProfile && (
                      <button
                        type="button"
                        onClick={() => handleFollowToggle(devId)}
                        className={`btn ${dev.isFollowing ? 'btn-ghost' : 'btn-primary'} btn-sm`}
                        style={{ padding: '6px 14px' }}
                      >
                        {dev.isFollowing ? 'Following ✓' : 'Follow'}
                      </button>
                    )}
                  </footer>
                </article>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default SearchDevs
