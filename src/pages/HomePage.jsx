import { useState } from 'react'
import PostForm from '../components/PostForm.jsx'
import PostsList from '../components/PostsList.jsx'

export default function HomePage() {
  const [refreshKey, setRefreshKey] = useState(0)

  const handleCreated = () => {
    setRefreshKey((k) => k + 1)
  }

  return (
    <section className="page-section">
      <PostForm onCreated={handleCreated} />
      <PostsList refreshSignal={refreshKey} />
    </section>
  )
}

