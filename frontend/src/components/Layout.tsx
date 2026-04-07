import type { ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  LayoutDashboard, Users, Glasses, FileText,
  Receipt, BarChart3, Eye, LogOut
} from 'lucide-react'

interface LayoutProps {
  children: ReactNode
}

const NAV = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/customers', label: 'Customers', icon: Users },
  { path: '/products', label: 'Products', icon: Glasses },
  { path: '/billing', label: 'New Bill', icon: FileText },
  { path: '/bills', label: 'Bills', icon: Receipt },
  { path: '/reports', label: 'Reports', icon: BarChart3 },
  { path: '/change-password', label: 'Change Password', icon: Eye },
]

export default function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">

      {/* 🔷 TOP NAVBAR */}
      <header className="bg-white border-b shadow-sm px-6 py-3 flex items-center justify-between">

        {/* LEFT */}
        <div className="flex items-center gap-6">

          {/* LOGO */}
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-yellow-400 flex items-center justify-center font-bold">
              👁️
            </div>
            <span className="font-semibold text-gray-800">
              Vision Optical
            </span>
          </div>

          {/* NAV */}
          <nav className="hidden md:flex items-center gap-2">
            {NAV.map(item => {
              const Icon = item.icon
              const active = location.pathname === item.path

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm transition
                    ${
                      active
                        ? 'bg-blue-100 text-blue-600 font-semibold'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                >
                  <Icon size={16} />
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-4">

          {/* DATE */}
          <span className="text-xs text-gray-400 hidden sm:block">
            {new Date().toDateString()}
          </span>

          {/* USER */}
          <div className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full">
            <div className="w-7 h-7 rounded-full bg-yellow-400 flex items-center justify-center text-xs font-bold">
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
            <span className="text-sm font-medium">
              {user?.name}
            </span>
          </div>

          {/* LOGOUT */}
          <button
            onClick={handleLogout}
            className="text-red-500 hover:text-red-600"
          >
            <LogOut size={18} />
            Logout
          </button>

        </div>
      </header>

      {/* 🔷 CONTENT */}
      <main className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border p-6 min-h-[500px]">
            {children}
          </div>
        </div>
      </main>

      {/* 🔷 FOOTER */}
      <footer className="bg-white border-t text-center text-xs text-gray-400 py-3">
        © {new Date().getFullYear()} Vision Optical
      </footer>

    </div>
  )
}