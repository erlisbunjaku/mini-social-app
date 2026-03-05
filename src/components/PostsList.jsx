import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import Avatar from './Avatar.jsx'

// MockAPI base URL
const API_BASE = 'https://69a5de9d885dcb6bd6a985e4.mockapi.io/api/v1'
const POSTS_API = `${API_BASE}/posts`

function timeAgo(dateStr) {
  const d = new Date(dateStr)
  const now = new Date()
  const sec = Math.floor((now - d) / 1000)
  if (sec < 60) return 'Just now'
  const min = Math.floor(sec / 60)
  if (min < 60) return `${min}m ago`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr}h ago`
  const day = Math.floor(hr / 24)
  if (day === 1) return 'Yesterday'
  if (day < 7) return `${day}d ago`
  return d.toLocaleDateString()
}

function sortByNewest(list) {
  return [...list].sort((a, b) => {
    const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0
    const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0
    return bTime - aTime
  })
}

export default function PostsList({ refreshSignal }) {
  const { user, isLoggedIn } = useAuth()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true)
      setError('')
      try {
        const res = await fetch(POSTS_API)
        if (!res.ok) throw new Error('Failed to load posts')
        const data = await res.json()
        setPosts(sortByNewest(Array.isArray(data) ? data : []))
      } catch (err) {
        setError(err.message || 'Could not load posts')
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [refreshSignal])

  const handleDelete = async (postId) => {
    if (!window.confirm('Delete this post?')) return
    try {
      const res = await fetch(`${POSTS_API}/${postId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete post')
      setPosts((prev) => prev.filter((p) => p.id !== postId))
    } catch (err) {
      alert(err.message || 'Error deleting post')
    }
  }

  const handleUpdateContent = async (post, newContent) => {
    try {
      const res = await fetch(`${POSTS_API}/${post.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...post, content: newContent }),
      })
      if (!res.ok) throw new Error('Failed to update post')
      const updated = await res.json()
      setPosts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
    } catch (err) {
      alert(err.message || 'Error updating post')
    }
  }

  const handleAddComment = async (post, text) => {
    const comments = Array.isArray(post.comments) ? post.comments : []
    const newComment = {
      id: Date.now().toString(),
      text,
      userId: user.id,
      userName: user.name,
      createdAt: new Date().toISOString(),
    }

    const updatedPost = { ...post, comments: [...comments, newComment] }

    try {
      const res = await fetch(`${POSTS_API}/${post.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedPost),
      })
      if (!res.ok) throw new Error('Failed to add comment')
      const saved = await res.json()
      setPosts((prev) => prev.map((p) => (p.id === saved.id ? saved : p)))
    } catch (err) {
      alert(err.message || 'Error adding comment')
    }
  }

  if (loading && posts.length === 0) {
    return <p className="info-text">Loading posts...</p>
  }

  if (error && posts.length === 0) {
    return <p className="error-text">{error}</p>
  }

  if (posts.length === 0) {
    return <p className="info-text">No posts yet. Be the first to post!</p>
  }

  return (
    <div className="posts-list">
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          canEdit={isLoggedIn && user.id === post.userId}
          onDelete={handleDelete}
          onUpdateContent={handleUpdateContent}
          onAddComment={handleAddComment}
        />
      ))}
    </div>
  )
}

function PostCard({ post, canEdit, onDelete, onUpdateContent, onAddComment }) {
  const { isLoggedIn } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState(post.content || '')
  const [comment, setComment] = useState('')
  const [commentLoading, setCommentLoading] = useState(false)

  const handleSave = async () => {
    if (!draft.trim()) return
    await onUpdateContent(post, draft.trim())
    setIsEditing(false)
  }

  const handleSubmitComment = async (e) => {
    e.preventDefault()
    if (!comment.trim()) return
    setCommentLoading(true)
    await onAddComment(post, comment.trim())
    setComment('')
    setCommentLoading(false)
  }

  const authorName = post.userName || 'Unknown user'
  const timeLabel = post.createdAt ? timeAgo(post.createdAt) : ''
  const fullTime = post.createdAt ? new Date(post.createdAt).toLocaleString() : ''
  const comments = Array.isArray(post.comments) ? post.comments : []

  return (
    <article className="post-card">
      <header className="post-card-header">
        <Avatar name={authorName} size={44} />
        <div className="post-card-meta">
          <span className="post-card-author">{authorName}</span>
          {timeLabel && (
            <time className="post-card-time" title={fullTime}>
              {timeLabel}
            </time>
          )}
        </div>
        {canEdit && (
          <div className="post-card-actions">
            <button
              type="button"
              className="post-action-btn"
              onClick={() => setIsEditing((v) => !v)}
            >
              {isEditing ? 'Cancel' : 'Edit'}
            </button>
            <button
              type="button"
              className="post-action-btn danger-btn"
              onClick={() => onDelete(post.id)}
            >
              Delete
            </button>
          </div>
        )}
      </header>

      <div className="post-card-body">
        {isEditing ? (
          <>
            <textarea
              className="post-card-textarea"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={3}
              placeholder="What's on your mind?"
            />
            <button type="button" onClick={handleSave} className="post-save-btn">
              Save
            </button>
          </>
        ) : (
          <p className="post-card-content">{post.content}</p>
        )}
      </div>

      <div className="post-card-footer">
        <span className="post-card-comment-count">
          {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
        </span>
      </div>

      <section className="post-card-comments">
        {comments.length > 0 && (
          <ul className="comments-list">
            {comments.map((c) => (
              <li key={c.id} className="comment-item">
                <Avatar name={c.userName} size={32} className="comment-avatar" />
                <div className="comment-bubble">
                  <div className="comment-bubble-header">
                    <span className="comment-author">{c.userName || 'User'}</span>
                    {c.createdAt && (
                      <span className="comment-meta" title={new Date(c.createdAt).toLocaleString()}>
                        {timeAgo(c.createdAt)}
                      </span>
                    )}
                  </div>
                  <p className="comment-text">{c.text}</p>
                </div>
              </li>
            ))}
          </ul>
        )}

        {isLoggedIn ? (
          <form className="comment-form" onSubmit={handleSubmitComment}>
            <Avatar name="You" size={32} className="comment-form-avatar" />
            <input
              type="text"
              placeholder="Write a comment..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="comment-form-input"
            />
            <button type="submit" disabled={commentLoading} className="comment-form-btn">
              {commentLoading ? 'Sending...' : 'Reply'}
            </button>
          </form>
        ) : (
          <p className="comment-login-hint">Log in to comment.</p>
        )}
      </section>
    </article>
  )
}

