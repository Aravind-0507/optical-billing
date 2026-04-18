import { useState, FormEvent, useEffect } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Eye, EyeOff } from 'lucide-react'

// Inject Google Font
const fontLink = document.createElement('link')
fontLink.href = 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&display=swap'
fontLink.rel = 'stylesheet'
document.head.appendChild(fontLink)

export default function Login() {
  const { login, user } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  
  useEffect(() => {}, [])

  if (user) return <Navigate to="/" replace />

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(name, password)
      navigate('/')
    } catch (err: any) {
      setError(
        err.response?.data?.errors?.name?.[0] ||
        err.response?.data?.message ||
        'Invalid credentials'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        height: '100vh',
        width: '100vw',
        backgroundImage: 'url("/images/login-bg.jpeg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'DM Sans', sans-serif",
        position: 'relative'
      }}
    >
      {/* DARK OVERLAY */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'linear-gradient(rgba(34,197,94,0.25), rgba(15,23,42,0.4))'
        }}
      />
    {/* GREEN GLOW */}
            <div style={{
              position: 'absolute',
              top: '20%',
              left: '20%',
              width: 250,
              height: 250,
              background: 'rgba(34,197,94,0.25)',
              borderRadius: '50%',
              filter: 'blur(100px)'
            }} />

            {/* WHITE GLOW */}
            <div style={{
              position: 'absolute',
              bottom: '10%',
              right: '20%',
              width: 300,
              height: 300,
              background: 'rgba(255,255,255,0.2)',
              borderRadius: '50%',
              filter: 'blur(120px)'
        }} />
      {/* LOGIN CARD */}
      <div
        style={{
          width: 360,
          background: 'rgba(255,255,255,0.7)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.4)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          padding: 40,
          borderRadius: 16,
          textAlign: 'center',
          position: 'relative',
          zIndex: 1
        }}
      >
        {/* BRAND */}
        <h1
          style={{
            fontSize: 28,
            fontWeight: 700,
            marginBottom: 5,
            color: '#0f172a'
          }}
        >
          Kala Opticals
        </h1>

        <p
          style={{
            fontSize: 13,
            color: '#64748b',
            marginBottom: 25
          }}
        >
          Clear Vision. Better Life.
        </p>

        <h2
          style={{
            fontSize: 18,
            marginBottom: 20,
            color: '#1e293b',
            fontWeight: 600
          }}
        >
          Login to your account
        </h2>

        {error && (
          <div
            style={{
              background: '#fee2e2',
              color: '#dc2626',
              padding: 10,
              borderRadius: 8,
              marginBottom: 15,
              fontSize: 13
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* USERNAME */}
          <input
            type="text"
            placeholder="Username or Email"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={{
              width: '100%',
              padding: 14,
              marginBottom: 15,
              background: 'rgba(255,255,255,0.6)',
border: '1px solid rgba(0,0,0,0.08)',
transition: '0.2s',
              borderRadius: 8,
              outline: 'none'
            }}
            onFocus={(e) =>
              (e.target.style.border = '1px solid #2563eb')
            }
            onBlur={(e) =>
              (e.target.style.border = '1px solid #e2e8f0')
            }
          />

          {/* PASSWORD */}
          <div style={{ position: 'relative', marginBottom: 20 }}>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '14px 45px 14px 14px',
                background: 'rgba(255,255,255,0.6)',
                border: '1px solid rgba(0,0,0,0.08)',
                borderRadius: 8,
                outline: 'none'
              }}
              onFocus={(e) =>
                (e.target.style.border = '1px solid #2563eb')
              }
              onBlur={(e) =>
                (e.target.style.border = '1px solid #e2e8f0')
              }
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                cursor: 'pointer',
                color: '#64748b'
              }}>
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </span>
          </div>

          {/* BUTTON */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: 14,
              background: 'linear-gradient(135deg,#22c55e,#16a34a)',
              boxShadow: '0 10px 25px rgba(34,197,94,0.4)',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            {loading ? 'Signing in...' : 'Login'}
          </button>
        </form>

        {/* FOOTER */}
        {/* <p
          style={{
            fontSize: 12,
            color: '#94a3b8',
            marginTop: 20
          }}
        >
          © 2026 Kala Opticals
        </p> */}
      </div>
    </div>
  )
}