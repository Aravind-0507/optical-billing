import { useState } from 'react'
import type { ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  LayoutDashboard, Users, Glasses, FileText,
  Receipt, BarChart3, Eye, LogOut, Menu, X, ChevronRight
} from 'lucide-react'

interface LayoutProps { children: ReactNode }

const NAV = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/customers', label: 'Customers', icon: Users },
  { path: '/products', label: 'Products', icon: Glasses },
  { path: '/billing', label: 'New Bill', icon: FileText },
  { path: '/bills', label: 'Bills', icon: Receipt },
  { path: '/reports', label: 'Reports', icon: BarChart3 },
  // { path: '/settings', label: 'Settings', icon: Settings },
  { path: '/change-password', label: 'Settings', icon: Eye },
]

export default function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const currentPage =
    NAV.find(n => n.path === location.pathname)?.label || 'Dashboard'

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">

      {/* MOBILE OVERLAY */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside className={`
        fixed lg:static z-50 top-0 left-0 h-full w-64
        bg-gradient-to-b from-[#0a1628] to-[#0d1f38]
        text-white shadow-xl
        transform transition-transform duration-300
        ${open ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>

        {/* LOGO */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-400 flex items-center justify-center text-black font-bold shadow">
              👁️
            </div>
            <div>
              <p className="text-sm font-semibold">Vision Optical</p>
              <p className="text-xs text-white/40">Billing Software</p>
            </div>
          </div>

          <button className="lg:hidden" onClick={() => setOpen(false)}>
            <X size={18} />
          </button>
        </div>

        {/* NAV */}
        <nav className="p-3 space-y-1 mt-2">
          {NAV.map(item => {
            const Icon = item.icon
            const active = location.pathname === item.path

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm
                  transition-all
                  ${
                    active
                      ? 'bg-white text-slate-900 font-semibold shadow'
                      : 'text-white/70 hover:bg-white/10 hover:text-white'
                  }
                `}>
                <Icon size={18} />
                {item.label}
                {active && <ChevronRight size={14} className="ml-auto" />}
              </Link>
            )
          })}
        </nav>

        {/* USER */}
        <div className="absolute bottom-0 w-full p-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-3 bg-white/5 p-2 rounded-lg">
            <div className="w-9 h-9 rounded-full bg-yellow-400 flex items-center justify-center text-black font-bold">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-semibold">{user?.name}</p>
              <p className="text-xs text-white/40">{user?.email}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* TOPBAR */}
        <header className="h-14 bg-white border-b flex items-center justify-between px-6 shadow-sm">

          <div className="flex items-center gap-3">
            <button className="lg:hidden" onClick={() => setOpen(true)}>
              <Menu size={22} />
            </button>

            <div className="text-sm">
              <span className="text-gray-400">Vision Optical</span>
              <span className="mx-2 text-gray-300">/</span>
              <span className="font-semibold text-gray-800">{currentPage}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400 hidden sm:block">
              {new Date().toDateString()}
            </span>

            <div className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full">
              <div className="w-6 h-6 rounded-full bg-yellow-400 flex items-center justify-center text-xs font-bold">
                {user?.name?.charAt(0)}
              </div>
              <span className="text-sm font-medium">Hi, {user?.name}</span>
            </div>
          </div>

        </header>

        {/* CONTENT */}
        <main className="flex-1 overflow-y-auto p-6 bg-slate-100">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white rounded-xl shadow p-6 min-h-[400px]">
              {children}
            </div>
          </div>
        </main>

        {/* FOOTER */}
        <div className="h-10 bg-white border-t flex items-center justify-between px-6 text-xs text-gray-400">
          <span>© {new Date().getFullYear()} Vision Optical</span>
        </div>

      </div>
    </div>
  )
}