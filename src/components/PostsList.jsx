import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'

const API_BASE = 'https://69a5de9d885dcb6bd6a985e4.mockapi.io/api/v1'
const POSTS_API = `${API_BASE}/posts`

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

  const createdAt = post.createdAt ? new Date(post.createdAt).toLocaleString() : ''
  const comments = Array.isArray(post.comments) ? post.comments : []

  return (
    <article className="card post-item">
      <header className="post-header">
        <div>
          <div className="post-author">{post.userName || 'Unknown user'}</div>
          {createdAt && <div className="post-meta">{createdAt}</div>}
        </div>
        {canEdit && (
          <div className="post-actions">
            <button type="button" onClick={() => setIsEditing((v) => !v)}>
              {isEditing ? 'Cancel' : 'Edit'}
            </button>
            <button
              type="button"
              className="danger-btn"
              onClick={() => onDelete(post.id)}
            >
              Delete
            </button>
          </div>
        )}
      </header>

      <div className="post-body">
        {isEditing ? (
          <>
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={3}
            />
            <div className="post-edit-actions">
              <button type="button" onClick={handleSave}>
                Save
              </button>
            </div>
          </>
        ) : (
          <p className="post-content">{post.content}</p>
        )}
      </div>

      <section className="comments-section">
        <h4>Comments</h4>
        {comments.length === 0 ? (
          <p className="info-text">No comments yet.</p>
        ) : (
          <ul className="comments-list">
            {comments.map((c) => (
              <li key={c.id} className="comment-item">
                <div className="comment-header">
                  <span className="comment-author">{c.userName || 'User'}</span>
                  {c.createdAt && (
                    <span className="comment-meta">
                      {new Date(c.createdAt).toLocaleString()}
                    </span>
                  )}
                </div>
                <p className="comment-text">{c.text}</p>
              </li>
            ))}
          </ul>
        )}

        {isLoggedIn ? (
          <form className="comment-form" onSubmit={handleSubmitComment}>
            <input
              type="text"
              placeholder="Write a comment..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <button type="submit" disabled={commentLoading}>
              {commentLoading ? 'Sending...' : 'Comment'}
            </button>
          </form>
        ) : (
          <p className="info-text">Log in to comment.</p>
        )}
      </section>
    </article>
  )
}

