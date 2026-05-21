import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import FeedCard from '../components/FeedCard.jsx'
import '../styles/Profile.css'

function Profile({ user, posts = [], onToggleLike }) {
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) {
      navigate('/login')
    }
  }, [user, navigate])

  if (!user) return null

  const displayName = user.full_name || user.fullName || 'Developer'
  const displayHandle = user.username || user.handle || 'dev'
  const displayAvatar = user.profile_image || user.profileImage || displayName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  const displayJoined = user.joined_date || user.joinedDate || 'Joined recently'
  const displaySkills = user.skills || []

  // Filter posts to show only the ones authored by this specific user
  const userPosts = posts.filter(post => 
    post.author && (
      post.author.toLowerCase() === displayName.toLowerCase() || 
      post.author.toLowerCase() === displayHandle.toLowerCase()
    )
  )

  return (
    <div className="profile-page page-layout">
      <div className="section-inner">
        <div className="profile-header-card card">
          <div className="profile-header-top">
            <div className="profile-avatar-lg">{displayAvatar}</div>
            <div className="profile-info">
              <h1>{displayName}</h1>
              <p>@{displayHandle} · Developer</p>
            </div>
          </div>
          
          <p className="profile-bio">{user.bio || 'No bio yet.'}</p>
          
          {displaySkills.length > 0 ? (
            <ul className="profile-skills">
              {displaySkills.map(skill => (
                <li key={skill} className="badge">{skill}</li>
              ))}
            </ul>
          ) : (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>No skills added yet.</p>
          )}

          <div className="profile-stats">
            <div className="profile-stat-item">
              <span className="profile-stat-value">{user.followers || 0}</span>
              <span className="profile-stat-label">Followers</span>
            </div>
            <div className="profile-stat-item">
              <span className="profile-stat-value">{user.following || 0}</span>
              <span className="profile-stat-label">Following</span>
            </div>
            <div className="profile-stat-item">
              <span className="profile-stat-value">{displayJoined}</span>
              <span className="profile-stat-label">Joined</span>
            </div>
          </div>
        </div>

        <div className="profile-layout-grid">
          <div>
            <h2 className="profile-section-title">Recent Posts</h2>
            {userPosts.length === 0 ? (
              <div className="card card-padded" style={{ textAlign: 'center', padding: '3rem' }}>
                <p style={{ color: 'var(--text-secondary)' }}>You haven't posted anything yet.</p>
              </div>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {userPosts.map(post => (
                  <li key={post.id} style={{ marginBottom: '1.5rem' }}>
                    <FeedCard 
                      {...post} 
                      onToggleLike={() => onToggleLike && onToggleLike(post.id)} 
                      currentUser={user}
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <h2 className="profile-section-title">Activity</h2>
            <div className="card card-padded" style={{ textAlign: 'center', padding: '3rem' }}>
              <p style={{ color: 'var(--text-secondary)' }}>No recent activity.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
