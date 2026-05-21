import { useState, useEffect } from 'react'
import { getToken } from '../lib/getToken'

/**
 * Single post card for the developer feed.
 * 
 * KEY FIX: Added likes_count, comments_count to destructured props.
 * Without these, the component threw silent ReferenceErrors when rendering
 * backend posts (which use snake_case field names).
 */
function FeedCard({
  id, author, handle, createdAt, created_at, time, title, body, content, tags,
  likes, likesCount, likes_count, comments, commentsCount, comments_count,
  isLiked, onToggleLike, onDeletePost, onCommentAdded, currentUser, image_url, imageUrl
}) {
  const [showComments, setShowComments] = useState(false)
  const [commentsList, setCommentsList] = useState([])
  const [commentText, setCommentText] = useState('')
  const [loadingComments, setLoadingComments] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const API_URL = 'http://localhost:5000'

  // Compute display values — gracefully handles both mock data and backend data
  const displayAuthor = author || 'Anonymous'
  const initials = String(displayAuthor)
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const displayContent = content || body
  const displayLikes = likesCount ?? likes_count ?? likes ?? 0
  const displayComments = commentsCount ?? comments_count ?? comments ?? 0
  const displayHandle = handle || displayAuthor.replace(/\s+/g, '').toLowerCase()

  // Format the post time from backend created_at or fallback to the mock "time" prop
  const displayTime = time || (created_at || createdAt
    ? new Date(created_at || createdAt).toLocaleDateString()
    : 'Just now')

  // Local state for comments count so it updates instantly on new comment
  const [localCommentsCount, setLocalCommentsCount] = useState(displayComments)

  // Keep localCommentsCount in sync if parent re-renders with updated props
  useEffect(() => {
    setLocalCommentsCount(displayComments)
  }, [displayComments])

  // Check bookmark status on mount
  useEffect(() => {
    if (!currentUser) return
    let cancelled = false
    const checkBookmark = async () => {
      try {
        const token = await getToken()
        const res = await fetch(`${API_URL}/bookmarks`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (res.ok && !cancelled) {
          const data = await res.json()
          if (data.success) {
            const bookmarkedIds = data.data.map(p => p.id)
            setIsBookmarked(bookmarkedIds.includes(id))
          }
        }
      } catch (err) {
        console.error('Bookmark check error:', err)
      }
    }
    checkBookmark()
    return () => { cancelled = true }
  }, [id, currentUser])

  const handleToggleBookmark = async () => {
    if (!currentUser) {
      alert('You must be logged in to bookmark posts!')
      return
    }
    try {
      const token = await getToken()
      const res = await fetch(`${API_URL}/bookmarks/${id}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setIsBookmarked(data.isBookmarked)
      }
    } catch (err) {
      console.error('Bookmark toggle error:', err)
    }
  }

  const handleToggleComments = async () => {
    setShowComments(!showComments)

    // Only fetch if opening the comments and we haven't fetched them yet
    if (!showComments && commentsList.length === 0) {
      setLoadingComments(true)
      try {
        const res = await fetch(`${API_URL}/comments/${id}`)
        if (res.ok) {
          const data = await res.json()
          setCommentsList(data)
        }
      } catch (error) {
        console.error('Error fetching comments:', error)
      } finally {
        setLoadingComments(false)
      }
    }
  }

  const handlePostComment = async (e) => {
    e.preventDefault()
    if (!currentUser) {
      alert('You must be logged in to comment!')
      return
    }
    if (!commentText.trim()) return

    try {
      const token = await getToken()
      const res = await fetch(`${API_URL}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          postId: id,
          author: currentUser?.fullName || currentUser?.full_name || currentUser?.name || 'Anonymous',
          content: commentText.trim()
        })
      })

      if (res.ok) {
        const newComment = await res.json()
        setCommentsList([...commentsList, newComment])
        setCommentText('')
        setLocalCommentsCount(prev => prev + 1)

        // Notify parent so global state stays in sync
        if (onCommentAdded) onCommentAdded(id)
      } else {
        console.error('Failed to post comment on backend')
      }
    } catch (error) {
      console.error('Error posting comment:', error)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return
    setIsDeleting(true)
    try {
      const token = await getToken()
      const res = await fetch(`${API_URL}/posts/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        if (onDeletePost) onDeletePost(id)
      } else {
        alert('Failed to delete post.')
      }
    } catch (error) {
      console.error('Error deleting post:', error)
      alert('Network error while deleting.')
    } finally {
      setIsDeleting(false)
    }
  }

  // Check if the current user is the post author (for showing delete button)
  const isOwnPost = currentUser && (
    (currentUser.fullName || currentUser.full_name || currentUser.name || '').toLowerCase() === displayAuthor.toLowerCase() ||
    (currentUser.username || '').toLowerCase() === displayHandle.toLowerCase()
  )

  return (
    <article className="feed-card card">
      <header className="feed-card-header">
        <span className="avatar">{initials}</span>
        <div className="feed-card-meta-wrap">
          <span className="feed-card-author">{displayAuthor}</span>
          <span className="feed-card-meta">
            @{displayHandle} · {displayTime}
          </span>
        </div>
        {isOwnPost && (
          <button
            type="button"
            className="btn btn-ghost btn-sm feed-delete-btn"
            onClick={handleDelete}
            disabled={isDeleting}
            title="Delete post"
            style={{ marginLeft: 'auto', color: 'var(--danger)', fontSize: '0.75rem' }}
          >
            {isDeleting ? 'Deleting...' : '🗑 Delete'}
          </button>
        )}
      </header>

      <div className="feed-card-body">
        {title && <h2 className="feed-card-title">{title}</h2>}
        {(image_url || imageUrl) && (
          <div className="feed-card-image" style={{ marginBottom: '1rem', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--border-default)' }}>
            <img src={image_url || imageUrl} alt="Post media" style={{ width: '100%', height: 'auto', display: 'block', maxHeight: '360px', objectFit: 'cover' }} />
          </div>
        )}
        <p className="feed-card-text">{displayContent}</p>
        {tags?.length > 0 && (
          <ul className="feed-card-tags">
            {tags.map((tag) => (
              <li key={tag}>
                <span className="badge">{tag}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <footer className="feed-card-footer">
        <button 
          type="button" 
          className={`feed-action ${isLiked ? 'is-active' : ''}`} 
          aria-label={`${displayLikes} likes`}
          onClick={onToggleLike}
          style={{ color: isLiked ? 'var(--danger)' : undefined }}
        >
          {isLiked ? 'Liked' : 'Like'} <span className="feed-action-count">{displayLikes}</span>
        </button>
        <button 
          type="button" 
          className={`feed-action ${showComments ? 'is-active' : ''}`} 
          aria-label={`${localCommentsCount} comments`}
          onClick={handleToggleComments}
        >
          Comment <span className="feed-action-count">{localCommentsCount}</span>
        </button>
        <button 
          type="button" 
          onClick={handleToggleBookmark}
          className={`feed-action ${isBookmarked ? 'is-active' : ''}`}
          style={{ color: isBookmarked ? 'var(--accent)' : undefined }}
        >
          {isBookmarked ? 'Bookmarked 🔖' : 'Bookmark'}
        </button>
        <button type="button" className="feed-action feed-action-muted">
          Share
        </button>
      </footer>

      {/* Comments section */}
      {showComments && (
        <div className="feed-card-comments-section" style={{ borderTop: '1px solid var(--border-color)', padding: 'var(--space-md) 0 0 0', marginTop: 'var(--space-md)' }}>
          <h4 style={{ margin: '0 0 var(--space-sm) 0', color: 'var(--text-heading)', fontSize: '0.875rem' }}>Comments</h4>
          
          {loadingComments ? (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>Loading comments...</p>
          ) : commentsList.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', marginBottom: 'var(--space-sm)' }}>No comments yet. Be the first to comment!</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 var(--space-md) 0', display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
              {commentsList.map((c) => {
                const cInitials = c.author ? c.author.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() : 'A';
                return (
                  <li key={c.id} style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'flex-start', padding: 'var(--space-xs) 0' }}>
                    <span className="avatar" style={{ width: '24px', height: '24px', fontSize: '0.75rem', flexShrink: 0 }}>{cInitials}</span>
                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: 'var(--space-xs) var(--space-sm)', borderRadius: '6px', flex: 1 }}>
                      <p style={{ margin: 0, fontWeight: 500, fontSize: '0.8125rem', color: 'var(--text-heading)' }}>{c.author}</p>
                      <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--text-secondary)', wordBreak: 'break-word' }}>{c.content}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          <form onSubmit={handlePostComment} style={{ display: 'flex', gap: 'var(--space-xs)', marginTop: 'var(--space-sm)' }}>
            <input
              type="text"
              className="input"
              style={{ flex: 1, padding: 'var(--space-xs) var(--space-sm)', fontSize: '0.8125rem' }}
              placeholder="Add a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />
            <button type="submit" className="btn btn-primary btn-sm">Post</button>
          </form>
        </div>
      )}
    </article>
  )
}

export default FeedCard
