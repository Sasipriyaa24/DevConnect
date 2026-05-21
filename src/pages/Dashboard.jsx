import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/Dashboard.css'

const API_URL = 'https://devconnect-n0to.onrender.com/'

function Dashboard({ user, onUserUpdate }) {
  const navigate = useNavigate()

  // 1. Auth check
  useEffect(() => {
    if (!user) {
      navigate('/login')
    }
  }, [user, navigate])

  const [trendingDevs, setTrendingDevs] = useState([])
  const [savedPosts, setSavedPosts] = useState([])
  const [isEditing, setIsEditing] = useState(false)

  // Edit Profile States
  const [fullName, setFullName] = useState(user?.full_name || user?.fullName || '')
  const [bio, setBio] = useState(user?.bio || '')
  const [skills, setSkills] = useState(user?.skills?.join(', ') || '')
  
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // Sync state if user prop changes
  useEffect(() => {
    if (user) {
      setFullName(user.full_name || user.fullName || '')
      setBio(user.bio || '')
      setSkills(user.skills?.join(', ') || '')
    }
  }, [user])

  // Fetch bookmarks & trending devs
  useEffect(() => {
    if (!user) return

    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token')

        // Fetch Bookmarked posts
        const bookmarksRes = await fetch(`${API_URL}/bookmarks`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        const bookmarksData = await bookmarksRes.json()
        if (bookmarksData.success) {
          setSavedPosts(bookmarksData.data)
        }

        // Fetch Trending devs
        const trendingRes = await fetch(`${API_URL}/users/trending`)
        const trendingData = await trendingRes.json()
        if (trendingData.success) {
          let devs = trendingData.data

          // Fetch follow statuses
          if (token) {
            const followRes = await fetch(`${API_URL}/users/me/following`, {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            })
            const followData = await followRes.json()
            if (followRes.ok && followData.success) {
              const followedIds = followData.data
              devs = devs.map(d => ({
                ...d,
                isFollowing: followedIds.includes(d.id)
              }))
            }
          }
          setTrendingDevs(devs)
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err)
      }
    }
    fetchData()
  }, [user])

  if (!user) return null

  // Handle Profile Update submit
  const handleProfileUpdateSubmit = async (e) => {
    e.preventDefault()
    setErrorMsg('')
    setSuccessMsg('')

    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${API_URL}/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          fullName: fullName.trim(),
          bio: bio.trim(),
          skills: skills // Backed split logic handles string to array conversion
        })
      })

      const data = await res.json()

      if (res.ok && data.success) {
        setSuccessMsg('Profile updated successfully!')
        if (onUserUpdate) {
          onUserUpdate(data.data)
        }
        setIsEditing(false)
      } else {
        setErrorMsg(data.message || 'Failed to update profile')
      }
    } catch (err) {
      setErrorMsg('Network error updating profile')
      console.error(err)
    }
  }

  // Handle Follow / Unfollow from Trending Developers Widget
  const handleFollowClick = async (targetDevId) => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${API_URL}/users/${targetDevId}/follow`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await res.json()

      if (res.ok && data.success) {
        // Toggle the local following state in the list
        setTrendingDevs(prevDevs => 
          prevDevs.map(dev => {
            if (dev.id === targetDevId) {
              return {
                ...dev,
                isFollowing: data.isFollowing,
                followers: data.isFollowing ? dev.followers + 1 : Math.max(0, dev.followers - 1)
              }
            }
            return dev
          })
        )

        // Also update the logged-in user's own following count in global state!
        if (onUserUpdate) {
          const updatedFollowingCount = data.isFollowing 
            ? (user.following || 0) + 1 
            : Math.max(0, (user.following || 0) - 1);
          
          onUserUpdate({
            ...user,
            following: updatedFollowingCount
          });
        }
      } else {
        alert(data.message || 'Failed to toggle follow status')
      }
    } catch (err) {
      console.error('Error following developer:', err)
    }
  }

  // Calculate dynamic display initial
  const displayAvatar = user.profile_image || user.profileImage || (user.full_name || 'SC').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div className="dashboard-page page-layout">
      <div className="section-inner">
        <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1>Dashboard</h1>
            <p>Overview of your activity and engagement on DevConnect.</p>
          </div>
          <button 
            onClick={() => setIsEditing(!isEditing)} 
            className="btn btn-primary"
          >
            {isEditing ? 'Cancel Edit' : 'Edit Profile ✏️'}
          </button>
        </header>

        {/* 1. COLLAPSIBLE EDIT PROFILE FORM */}
        {isEditing && (
          <section className="card card-padded" style={{ marginBottom: '2rem', maxWidth: '680px' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', fontWeight: 600, color: 'var(--text-heading)' }}>
              Edit Profile Details
            </h2>
            {errorMsg && <p className="form-error" style={{ marginBottom: '1rem' }}>{errorMsg}</p>}
            {successMsg && <p style={{ color: 'var(--success)', marginBottom: '1rem', fontSize: '0.875rem' }}>{successMsg}</p>}

            <form onSubmit={handleProfileUpdateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="label" htmlFor="edit-name">Full Name</label>
                <input 
                  id="edit-name"
                  type="text" 
                  className="input" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="label" htmlFor="edit-bio">Short Bio</label>
                <textarea 
                  id="edit-bio"
                  className="input" 
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  style={{ minHeight: '80px' }}
                />
              </div>

              <div className="form-group">
                <label className="label" htmlFor="edit-skills">Skills (comma-separated)</label>
                <input 
                  id="edit-skills"
                  type="text" 
                  className="input" 
                  placeholder="React, Node.js, Postgres, AWS"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Separate tags using commas.</span>
              </div>

              <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>
                Save Profile Changes
              </button>
            </form>
          </section>
        )}

        {/* 2. STATS ROW */}
        <div className="dashboard-grid">
          <article className="dashboard-stat card">
            <p className="dashboard-stat-label">Followers</p>
            <p className="dashboard-stat-value">{user.followers || 0}</p>
            <p className="dashboard-stat-change is-positive">+12% this month</p>
          </article>

          <article className="dashboard-stat card">
            <p className="dashboard-stat-label">Following</p>
            <p className="dashboard-stat-value">{user.following || 0}</p>
            <p className="dashboard-stat-change">Active connections</p>
          </article>

          <article className="dashboard-stat card">
            <p className="dashboard-stat-label">Posts Published</p>
            <p className="dashboard-stat-value">{user.posts_count || 0}</p>
            <p className="dashboard-stat-change is-positive">Growing reach</p>
          </article>

          <article className="dashboard-stat card">
            <p className="dashboard-stat-label">Member Since</p>
            <p className="dashboard-stat-value" style={{ fontSize: '1.25rem', marginTop: '4px' }}>
              {user.joined_date || user.joinedDate || 'Recently'}
            </p>
            <p className="dashboard-stat-change">Active developer</p>
          </article>
        </div>

        {/* 3. COLUMNS (Saved Posts & Trending Devs) */}
        <div className="dashboard-panels">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            
            {/* BOOKMARKED / SAVED POSTS */}
            <section className="dashboard-panel card">
              <header className="dashboard-panel-header">
                <h2>Saved Posts ({savedPosts.length})</h2>
              </header>
              <div className="dashboard-panel-body">
                {savedPosts.length === 0 ? (
                  <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                    No bookmarked posts yet. Click the bookmark icon in the feed to save some!
                  </div>
                ) : (
                  <ul className="dashboard-saved-list">
                    {savedPosts.map((post) => (
                      <li key={post.id} className="dashboard-saved-item">
                        <p className="dashboard-saved-title">{post.content.slice(0, 100)}{post.content.length > 100 ? '...' : ''}</p>
                        <p className="dashboard-saved-meta">
                          By {post.author} · {post.likes_count} likes · {post.comments_count} comments
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>
          </div>

          {/* SIDEBAR - TRENDING DEVELOPERS */}
          <aside style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            <section className="dashboard-panel card">
              <header className="dashboard-panel-header">
                <h2>Suggested Developers</h2>
              </header>
              <div className="dashboard-panel-body" style={{ padding: 'var(--space-md)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                  {trendingDevs.map(dev => {
                    const devAvatar = dev.profile_image || dev.profileImage || dev.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
                    return (
                      <div key={dev.id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                        <div className="avatar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 600 }}>
                          {devAvatar}
                        </div>
                        <div>
                          <p style={{ margin: 0, fontWeight: 500, color: 'var(--text-heading)', fontSize: '0.875rem' }}>
                            {dev.full_name}
                          </p>
                          <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            @{dev.username} · {dev.followers || 0} followers
                          </p>
                        </div>
                        
                        {dev.id !== user.id && (
                          <button 
                            onClick={() => handleFollowClick(dev.id)}
                            className={`btn ${dev.isFollowing ? 'btn-ghost' : 'btn-primary'} btn-sm`} 
                            style={{ marginLeft: 'auto' }}
                          >
                            {dev.isFollowing ? 'Following' : 'Follow'}
                          </button>
                        )}
                      </div>
                    )
                  })}
                  {trendingDevs.length === 0 && (
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Loading developers...</p>
                  )}
                </div>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
