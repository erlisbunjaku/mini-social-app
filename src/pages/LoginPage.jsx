import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import Login from '../components/Login.jsx'

export default function LoginPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) {
      navigate('/', { replace: true })
    }
  }, [user, navigate])

  return (
    <section className="page-section page-center">
      <Login />
    </section>
  )
}

