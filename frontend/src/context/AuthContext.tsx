// src/context/AuthContext.tsx

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import api from '../api/axios'

/* ================= TYPES ================= */

interface User {
  id: number
  name: string
  email?: string // optional now
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (name: string, password: string) => Promise<User> // ✅ changed
  logout: () => Promise<void>
}

interface AuthProviderProps {
  children: ReactNode
}

/* ================= CONTEXT ================= */

const AuthContext = createContext<AuthContextType | null>(null)

/* ================= PROVIDER ================= */

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    const token = localStorage.getItem('optical_token')
    const saved = localStorage.getItem('optical_user')

    if (token && saved) {
      try {
        setUser(JSON.parse(saved))
      } catch {
        setUser(null)
      }

      api.get<{ user: User }>('/me')
        .then(res => setUser(res.data.user))
        .catch(() => {
          localStorage.removeItem('optical_token')
          localStorage.removeItem('optical_user')
          setUser(null)
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  /* ================= LOGIN ================= */

  const login = async (name: string, password: string): Promise<User> => {
    const res = await api.post<{ token: string; user: User }>('/login', {
      name,        // ✅ FIXED
      password,
    })

    const { token, user } = res.data

    localStorage.setItem('optical_token', token)
    localStorage.setItem('optical_user', JSON.stringify(user))

    setUser(user)
    return user
  }

  /* ================= LOGOUT ================= */

  const logout = async (): Promise<void> => {
    try {
      await api.post('/logout')
    } catch (_) {}

    localStorage.removeItem('optical_token')
    localStorage.removeItem('optical_user')
    setUser(null)
  }

  /* ================= RETURN ================= */

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

/* ================= HOOK ================= */

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  return context
}