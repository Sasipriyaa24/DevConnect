import { useState, useEffect, useCallback } from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import Signup from './pages/Signup.jsx'
import Feed from './pages/Feed.jsx'
import Profile from './pages/Profile.jsx'
import Dashboard from './pages/Dashboard.jsx'
import CreatePost from './pages/CreatePost.jsx'
import SearchDevs from './pages/SearchDevs.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import { useAuth } from './context/AuthContext.jsx'
import { getToken } from './lib/getToken'

const API_URL = 'https://devconnect-n0to.onrender.com/'

function App() {
  const { user, updateUser } = useAuth()
  const [posts, setPosts] = useState([])
  const [isLoadingPosts, setIsLoadingPosts] = useState(true)
  const [feedError, setFeedError] = useState(null)

  /**
   * fetchPosts — Loads all posts from the backend.
   * Wrapped in useCallback so it can be called after create/delete too.
   */
  const fetchPosts = useCallback(async () => {
    setFeedError(null)
    try {
      const res = await fetch(`${API_URL}/posts`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const postsData = await res.json()
      // Backend returns a flat array of posts
      setPosts(Array.isArray(postsData) ? postsData : [])
    } catch (error) {
      console.error('Failed to fetch posts:', error)
      setFeedError('Could not load posts. Is the backend server running?')
    } finally {
      setIsLoadingPosts(false)
    }
  }, [])

  // Fetch posts on mount
  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  /**
   * handleAddPost — Called after CreatePost successfully posts to the API.
   * Prepends the new post to state so it appears instantly at the top.
   */
  const handleAddPost = (newPost) => {
    setPosts(prev => [newPost, ...prev])
  }

  /**
   * handleDeletePost — Removes post from state after successful API delete.
   */
  const handleDeletePost = (postId) => {
    setPosts(prev => prev.filter(p => p.id !== postId))
  }

  /**
   * handleToggleLike — Calls backend to like/unlike, then updates local state.
   * Uses getToken() so it works for both custom and Google auth users.
   */
  const handleToggleLike = async (postId) => {
    if (!user) {
      alert('You must be logged in to like posts!')
      return
    }

    try {
      const token = await getToken()

      const res = await fetch(`${API_URL}/likes/${postId}`, {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : ''
        }
      })
      
      if (res.ok) {
        const data = await res.json()
        
        // Update local state with the new count and liked status from backend
        setPosts(prev =>
          prev.map((post) => {
            if (post.id === postId) {
              return {
                ...post,
                isLiked: data.isLiked,
                likesCount: data.likesCount,
                likes_count: data.likesCount
              }
            }
            return post
          })
        )
      }
    } catch (error) {
      console.error('Failed to like post:', error)
    }
  }

  /**
   * handleCommentAdded — Increments comment count in global state
   * so the Feed shows the updated count without a full refetch.
   */
  const handleCommentAdded = (postId) => {
    setPosts(prev =>
      prev.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            comments_count: (post.comments_count || 0) + 1,
            commentsCount: (post.commentsCount || post.comments_count || 0) + 1
          }
        }
        return post
      })
    )
  }

  return (
    <div className="app-shell">
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          {/* Protected Routes */}
          <Route 
            path="/feed" 
            element={
              <ProtectedRoute>
                <Feed 
                  posts={posts} 
                  onToggleLike={handleToggleLike} 
                  onDeletePost={handleDeletePost}
                  onCommentAdded={handleCommentAdded}
                  currentUser={user}
                  isLoading={isLoadingPosts}
                  error={feedError}
                />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Profile user={user} posts={posts} onToggleLike={handleToggleLike} />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard user={user} />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/search" 
            element={
              <SearchDevs currentUser={user} onUserUpdate={updateUser} />
            } 
          />
          <Route 
            path="/create-post" 
            element={
              <ProtectedRoute>
                <CreatePost user={user} onAddPost={handleAddPost} />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </main>
    </div>
  )
}

export default App
