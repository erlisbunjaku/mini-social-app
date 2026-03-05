import { useNavigate } from 'react-router-dom'
import PostForm from '../components/PostForm.jsx'

export default function CreatePostPage() {
  const navigate = useNavigate()

  const handleCreated = () => {
    navigate('/')
  }

  return (
    <section className="page-section page-center">
      <PostForm onCreated={handleCreated} />
    </section>
  )
}

