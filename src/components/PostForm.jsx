import { useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'

// MockAPI base URL
const API_BASE = 'https://69a5de9d885dcb6bd6a985e4.mockapi.io/api/v1'
const POSTS_API = `${API_BASE}/posts`

export default function PostForm({ onCreated }) {
  const { isLoggedIn, user } = useAuth()
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!isLoggedIn) {
    return <p className="info-text">You must be logged in to create a post.</p>
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch(POSTS_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          userId: user.id,
          userName: user.name,
          createdAt: new Date().toISOString(),
        }),
      })

      if (!res.ok) {
        throw new Error('Failed to create post')
      }

      const created = await res.json()
      setContent('')
      if (onCreated) onCreated(created)
    } catch (err) {
      setError(err.message || 'Error creating post')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="card post-card" onSubmit={handleSubmit}>
      <h3>Create Post</h3>
      {error && <p className="error-text">{error}</p>}

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="What's on your mind?"
        required
        rows={3}
      />

      <button type="submit" disabled={loading}>
        {loading ? 'Posting...' : 'Post'}
      </button>
    </form>
  )
}

