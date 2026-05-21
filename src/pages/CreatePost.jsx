import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getToken } from '../lib/getToken'
import '../styles/CreatePost.css'

/**
 * CreatePost Page — Form to create a new post.
 * 
 * KEY FIX: Uses getToken() instead of localStorage.getItem('token')
 * so posting works for both custom backend and Google Auth users.
 */
function CreatePost({ user, onAddPost }) {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [tags, setTags] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const navigate = useNavigate()

  // Presets for quick developer images
  const PRESET_IMAGES = [
    { label: '🖥️ Workstation', url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&auto=format&fit=crop&q=60' },
    { label: '🌌 Coding Space', url: 'https://images.unsplash.com/photo-1607799279861-4dd421887fb3?w=800&auto=format&fit=crop&q=60' },
    { label: '⚡ Cyberpunk Tech', url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=60' },
    { label: '☁️ Cloud Servers', url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=60' }
  ]

  // Redirect to login if user is not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/login')
    }
  }, [user, navigate])

  const MAX_LENGTH = 1000
  const isNearLimit = body.length > MAX_LENGTH * 0.9
  const isOverLimit = body.length > MAX_LENGTH
  const isValid = title.trim() && body.trim() && !isOverLimit

  const API_URL = 'http://localhost:5000'

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!isValid || isSubmitting) return

    setIsSubmitting(true)
    setSubmitError('')

    try {
      const token = await getToken()

      if (!token) {
        setSubmitError('You are not authenticated. Please log in again.')
        setIsSubmitting(false)
        return
      }

      const response = await fetch(`${API_URL}/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          author: user?.fullName || user?.full_name || user?.name || 'Anonymous',
          content: body.trim(),
          imageUrl: imageUrl.trim() || null
        })
      })

      if (response.ok) {
        const newPost = await response.json()
        
        // Include frontend-only properties so it renders correctly in the feed
        const fullPost = {
          ...newPost,
          title: title.trim(),
          tags: tags.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean),
          handle: user?.username || 'anon',
          isLiked: false,
          likesCount: 0,
          commentsCount: 0
        }

        if (onAddPost) {
          onAddPost(fullPost)
        }
        
        // Redirect to feed after posting
        navigate('/feed')
      } else {
        const errData = await response.json().catch(() => ({}))
        setSubmitError(errData.message || 'Failed to create post. Please try again.')
        console.error('Failed to create post:', errData)
      }
    } catch (error) {
      setSubmitError('Network error. Is the backend server running?')
      console.error('Network error creating post:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="create-post-page page-layout">
      <div className="section-inner">
        <header className="page-header" style={{ maxWidth: '680px', margin: '0 auto 2rem' }}>
          <h1>Create a new post</h1>
          <p>Share what you're working on, learning, or stuck on.</p>
        </header>

        <section className="create-post-card card card-padded">
          <form className="create-post-form" onSubmit={handleSubmit}>
            {submitError && (
              <div style={{ 
                padding: 'var(--space-sm) var(--space-md)', 
                marginBottom: 'var(--space-md)', 
                background: 'rgba(248, 81, 73, 0.1)', 
                border: '1px solid var(--danger)', 
                borderRadius: 'var(--radius-sm)',
                color: 'var(--danger)',
                fontSize: '0.875rem'
              }}>
                {submitError}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="post-title" className="label">Title</label>
              <input
                id="post-title"
                type="text"
                className="input input-title"
                placeholder="What's this post about?"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="post-body" className="label">Body</label>
              <textarea
                id="post-body"
                className="input textarea-body"
                placeholder="Write your thoughts here... Markdown is supported (coming soon)."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                required
              />
              <div 
                className={`char-counter ${isNearLimit ? 'is-near-limit' : ''} ${isOverLimit ? 'is-over-limit' : ''}`}
              >
                {body.length} / {MAX_LENGTH}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="post-tags" className="label">Tags (comma-separated)</label>
              <input
                id="post-tags"
                type="text"
                className="input"
                placeholder="e.g. react, postgres, career"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="post-image" className="label">Add Post Banner Image (Optional)</label>
              <input
                id="post-image"
                type="url"
                className="input"
                placeholder="Paste direct image URL (https://...)"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginTop: '4px' }}>
                Or select one of our premium developer preset graphics:
              </span>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
                {PRESET_IMAGES.map(img => (
                  <button
                    key={img.label}
                    type="button"
                    className={`btn btn-ghost btn-sm ${imageUrl === img.url ? 'is-active' : ''}`}
                    style={{ fontSize: '0.75rem', border: imageUrl === img.url ? '1px solid var(--accent)' : '1px solid var(--border-default)' }}
                    onClick={() => setImageUrl(img.url)}
                  >
                    {img.label}
                  </button>
                ))}
              </div>
              {imageUrl && (
                <div style={{ marginTop: '1rem', border: '1px solid var(--border-default)', borderRadius: '6px', overflow: 'hidden', maxWidth: '280px' }}>
                  <img src={imageUrl} alt="Post preview" style={{ width: '100%', height: 'auto', display: 'block', maxHeight: '160px', objectFit: 'cover' }} />
                </div>
              )}
            </div>

            <div className="create-post-footer">
              <button 
                type="button" 
                className="btn btn-ghost"
                onClick={() => navigate('/feed')}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={!isValid || isSubmitting}
              >
                {isSubmitting ? 'Publishing...' : 'Publish post'}
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  )
}

export default CreatePost
