import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import FeedCard from '../components/FeedCard.jsx'
import { getToken } from '../lib/getToken'
import '../styles/Feed.css'

const FILTERS = ['All', 'Following', 'Trending']
const API_URL = 'http://localhost:5000'

/**
 * Feed Page — Displays all posts with filtering, search, and sorting.
 * 
 * KEY FIX: Now accepts isLoading, error, onDeletePost, onCommentAdded props
 * from App.jsx so the feed state stays synchronized after any action.
 */
function Feed({ posts = [], onToggleLike, onDeletePost, onCommentAdded, currentUser, isLoading, error }) {
  const [activeFilter, setActiveFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [followedAuthors, setFollowedAuthors] = useState([])

  // Fetch followed developers on mount/user change
  useEffect(() => {
    if (!currentUser) return
    let cancelled = false
    const fetchFollowing = async () => {
      try {
        const token = await getToken()
        const res = await fetch(`${API_URL}/users/me/following/profiles`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        const data = await res.json()
        if (data.success && !cancelled) {
          setFollowedAuthors(data.data)
        }
      } catch (err) {
        console.error('Error fetching followed profiles:', err)
      }
    }
    fetchFollowing()
    return () => { cancelled = true }
  }, [currentUser])

  const currentUserFullName = currentUser?.full_name || currentUser?.fullName || currentUser?.name || ''
  const currentUserUsername = currentUser?.username || ''

  // 1. First apply structural filter (All, Following)
  let processedPosts = posts.filter((post) => {
    if (activeFilter === 'Following') {
      if (!currentUser) return false
      
      const followedNames = followedAuthors.map(a => ((a.full_name || a.fullName || '')).toLowerCase())
      const followedUsernames = followedAuthors.map(a => (a.username || '').toLowerCase())
      const postAuthor = (post.author || '').toLowerCase()
      const postHandle = (post.handle || '').toLowerCase()
      
      const isOwnPost = currentUserFullName.toLowerCase() === postAuthor || 
                        currentUserUsername.toLowerCase() === postAuthor ||
                        currentUserUsername.toLowerCase() === postHandle
      
      const isFollowed = followedNames.includes(postAuthor) || followedUsernames.includes(postAuthor)
      
      if (!isOwnPost && !isFollowed) return false
    }
    return true
  })

  // 2. Apply search query
  processedPosts = processedPosts.filter((post) => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    const titleMatch = post.title ? post.title.toLowerCase().includes(q) : false
    const bodyMatch = post.body ? post.body.toLowerCase().includes(q) : false
    const contentMatch = post.content ? post.content.toLowerCase().includes(q) : false
    const authorMatch = post.author ? post.author.toLowerCase().includes(q) : false
    const handleMatch = post.handle ? post.handle.toLowerCase().includes(q) : false
    const tagsMatch = post.tags ? post.tags.some((t) => t.toLowerCase().includes(q)) : false
    
    return titleMatch || bodyMatch || contentMatch || authorMatch || handleMatch || tagsMatch
  })

  // 3. Apply order/sorting (Trending)
  if (activeFilter === 'Trending') {
    processedPosts = [...processedPosts].sort((a, b) => {
      const aLikes = a.likesCount ?? a.likes_count ?? a.likes ?? 0
      const bLikes = b.likesCount ?? b.likes_count ?? b.likes ?? 0
      return bLikes - aLikes
    })
  }

  return (
    <div className="feed-page page-layout">
      <div className="section-inner">
        <header className="page-header feed-header">
          <h1>Feed</h1>
          <p>Posts from developers in the DevConnect community.</p>
        </header>

        <div className="feed-toolbar">
          <div className="feed-toolbar-filters" role="tablist" aria-label="Feed filters">
            {FILTERS.map((filter) => (
              <button
                key={filter}
                type="button"
                role="tab"
                aria-selected={activeFilter === filter}
                className={`feed-filter-btn ${activeFilter === filter ? 'is-active' : ''}`}
                onClick={() => setActiveFilter(filter)}
              >
                {filter}
              </button>
            ))}
          </div>

          <div className="feed-search-wrap">
            <label htmlFor="feed-search" className="visually-hidden">
              Search posts
            </label>
            <input
              id="feed-search"
              type="search"
              className="input input-search"
              placeholder="Search posts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <Link to="/create-post" className="btn btn-primary">
            New post
          </Link>
        </div>

        {/* Loading state */}
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
            Loading posts...
          </div>
        ) : error ? (
          /* Error state */
          <div className="card card-padded feed-empty" style={{ textAlign: 'center' }}>
            <p style={{ color: 'var(--danger)' }}>{error}</p>
          </div>
        ) : (
          <ul className="feed-list">
            {processedPosts.length === 0 ? (
              <li className="card card-padded feed-empty">
                <p>No posts match your search or filter.</p>
              </li>
            ) : (
              processedPosts.map((post) => (
                <li key={post.id}>
                  <FeedCard 
                    {...post} 
                    onToggleLike={() => onToggleLike && onToggleLike(post.id)} 
                    onDeletePost={onDeletePost}
                    onCommentAdded={onCommentAdded}
                    currentUser={currentUser}
                  />
                </li>
              ))
            )}
          </ul>
        )}
      </div>
    </div>
  )
}

export default Feed
