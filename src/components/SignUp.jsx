import { useState } from 'react'

// MockAPI base URL
const API_BASE = 'https://69a5de9d885dcb6bd6a985e4.mockapi.io/api/v1'
const USERS_API = `${API_BASE}/users`

export default function SignUp() {
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const existsRes = await fetch(`${USERS_API}?email=${encodeURIComponent(form.email)}`)  //safe per URL.
      const existing = await existsRes.json()

      if (Array.isArray(existing) && existing.length > 0) { //nuk u gjet asnje user me qat email dhe password.
        setError('Email already registered.')
        setLoading(false)
        return
      }

      const res = await fetch(USERS_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (!res.ok) {
        throw new Error('Failed to sign up')
      }

      setSuccess('Account created! You can now log in.')
      setForm({ name: '', email: '', password: '' })
    } catch (err) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="card auth-card auth-card-wide" onSubmit={handleSubmit}>
      <h2>Sign up</h2>

      {error && <p className="error-text">{error}</p>}
      {success && <p className="success-text">{success}</p>}

      <div className="auth-grid">
        <div className="auth-field">
          <input
            id="name"
            name="name"
            placeholder="Name"
            value={form.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="auth-field">
          <input
            id="email"
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="auth-field">
          <input
            id="password"
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="auth-actions">
        <button type="submit" disabled={loading}>
          {loading ? 'Creating…' : 'Sign Up'}
        </button>
      </div>
    </form>
  )
}

