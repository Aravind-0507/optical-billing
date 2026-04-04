import { useState, FormEvent, useEffect } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Eye , EyeOff } from 'lucide-react'

// Inject Google Font
const fontLink = document.createElement('link')
fontLink.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@300;400;500;600&display=swap'
fontLink.rel = 'stylesheet'
document.head.appendChild(fontLink)

export default function Login() {
  const { login, user } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState('')   // ✅ changed
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [mounted, setMounted] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  
  useEffect(() => { setTimeout(() => setMounted(true), 50) }, [])

  if (user) return <Navigate to="/" replace />

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(name, password)   // ✅ send name
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
    <>
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        height: '100vh',
        width: '100vw',
        margin: 0,
        padding: 0,   // ✅ remove movement issue
        fontFamily: "'DM Sans', sans-serif",
        display: 'flex'
      }}>

        {/* LEFT SIDE */}
        <div style={{
          width: '50%',
          height: '100%',
          background: 'linear-gradient(135deg,#2563eb,#06b6d4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          borderRadius: 16
        }}>
          <div style={{ textAlign: 'center' }}>

            <div style={{
              width: 90,
              height: 90,
              borderRadius: '50%',
              background: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              fontSize: 32
            }}>
              👁️
            </div>

            <h1 style={{
              fontSize: 42,
              fontWeight: 700,
              marginBottom: 10
            }}>
              Vision Opticals
            </h1>

            <p style={{
              opacity: 0.9,
              fontSize: 14
            }}>
              SERVICE WITH SMILE
            </p>

          </div>
        </div>

        {/* RIGHT SIDE */}
        <div style={{
          width: '50%',
          height: '100%',
          background: '#f1f5f9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 16
        }}>

          <div style={{
            width: 380,
            background: '#fff',
            padding: 35,
            borderRadius: 16,
            boxShadow: '0 20px 60px rgba(0,0,0,.15)'
          }}>

            <h2 style={{
              textAlign: 'center',
              marginBottom: 25,
              color: '#1e293b',
              fontSize: 22,
              fontWeight: 600
            }}>
              Login to Dashboard
            </h2>

            {error && (
              <div style={{
                background: '#fee2e2',
                color: '#dc2626',
                padding: 10,
                borderRadius: 8,
                marginBottom: 15,
                fontSize: 13
              }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>

              {/* ✅ NAME INPUT */}
              <input
                type="text"
                placeholder="User name"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: 14,
                  marginBottom: 15,
                  border: '1px solid #e2e8f0',
                  borderRadius: 8
                }}
              />

              {/* PASSWORD */}
              <div style={{ position: 'relative', marginBottom: 20 }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '14px 40px 14px 14px',
                      border: '1px solid #e2e8f0',
                      borderRadius: 8
                    }}
                  />

                  {/* 👁️ ICON */}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: 10,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#64748b'
                    }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>

                </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: 14,
                  background: 'linear-gradient(135deg,#2563eb,#1d4ed8)',
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

          </div>
        </div>

      </div>
    </>
  )
}