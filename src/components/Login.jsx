import { useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'

// Replace this with your actual MockAPI base URL
const API_BASE = 'https://69a5de9d885dcb6bd6a985e4.mockapi.io/api/v1'
const USERS_API = `${API_BASE}/users`

export default function Login() {
  const { login } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch(
        `${USERS_API}?email=${encodeURIComponent(form.email)}&password=${encodeURIComponent(
          form.password,
        )}`,
      )

      if (!res.ok) {
        throw new Error('Failed to login')
      }

      const users = await res.json()

      if (!Array.isArray(users) || users.length === 0) {
        setError('Invalid email or password')
      } else {
        const foundUser = users[0]
        login(foundUser)
      }
    } catch (err) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="card auth-card" onSubmit={handleSubmit}>
      <h2>Login</h2>
      {error && <p className="error-text">{error}</p>}

      <input
        name="email"
        type="email"
        placeholder="Email"
        value={form.email}
        onChange={handleChange}
        required
      />
      <input
        name="password"
        type="password"
        placeholder="Password"
        value={form.password}
        onChange={handleChange}
        required
      />

      <button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  )
}

