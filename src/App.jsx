import './App.css'
import { Link, NavLink, Route, Routes } from 'react-router-dom'
import { useAuth } from './context/AuthContext.jsx'
import PostFeedPage from './pages/PostFeedPage.jsx'
import CreatePostPage from './pages/CreatePostPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import SignUpPage from './pages/SignUpPage.jsx'

function App() {
  const { user, logout } = useAuth()

  return (
    <div className="app-root">
      <header className="app-header">
        <div className="brand-area">
          <Link to="/" className="brand-link">
            <h1>Mini Social App</h1>
          </Link>
          <nav className="main-nav">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                isActive ? 'nav-link nav-link-active' : 'nav-link'
              }
            >
              Feed
            </NavLink>
            <NavLink
              to="/create"
              className={({ isActive }) =>
                isActive ? 'nav-link nav-link-active' : 'nav-link'
              }
            >
              Create Post
            </NavLink>
            {!user && (
              <>
                <NavLink
                  to="/login"
                  className={({ isActive }) =>
                    isActive ? 'nav-link nav-link-active' : 'nav-link'
                  }
                >
                  Login
                </NavLink>
                <NavLink
                  to="/signup"
                  className={({ isActive }) =>
                    isActive ? 'nav-link nav-link-active' : 'nav-link'
                  }
                >
                  Sign Up
                </NavLink>
              </>
            )}
          </nav>
        </div>

        <div className="user-area">
          {user ? (
            <div className="user-info">
              <span>Welcome, {user.name}</span>
              <button onClick={logout}>Logout</button>
            </div>
          ) : (
            <span className="info-text">Not logged in</span>
          )}
        </div>
      </header>

      <main className="app-main">
        <Routes>
          <Route path="/" element={<PostFeedPage />} />
          <Route path="/create" element={<CreatePostPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
