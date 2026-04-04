import { useState, FormEvent } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import { Eye, EyeOff } from 'lucide-react'

export default function ChangePassword() {
  const { user, logout } = useAuth()

  const [form, setForm] = useState({
    current: '',
    newPass: '',
    confirm: '',
  })

  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (form.newPass !== form.confirm) {
      return setError('Passwords do not match')
    }

    setLoading(true)

    try {
      await api.post('/change-password', {
        current_password: form.current,
        new_password: form.newPass,
        new_password_confirmation: form.confirm,
      })

      setSuccess('Password updated successfully. Please login again.')

      setTimeout(async () => {
        await logout()
        window.location.href = '/login'
      }, 2000)

    } catch (err: any) {
      setError(err?.response?.data?.message || 'Error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto">

      <div className="bg-white p-6 rounded-xl shadow">

        <h2 className="text-lg font-semibold mb-4">
          Change Password
        </h2>

        {/* USER NAME */}
        <div className="mb-4">
          <label className="text-sm text-gray-500">Login Name</label>
          <input
            value={user?.name || ''}
            disabled
            className="w-full border p-2 rounded bg-gray-100"
          />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* CURRENT PASSWORD */}
          <div className="relative">
            <input
              type={show ? 'text' : 'password'}
              placeholder="Current Password"
              value={form.current}
              onChange={e => setForm({ ...form, current: e.target.value })}
              className="w-full border p-3 rounded-lg pr-10"
            />
          </div>

          {/* NEW PASSWORD */}
          <div className="relative">
            <input
              type={show ? 'text' : 'password'}
              placeholder="New Password"
              value={form.newPass}
              onChange={e => setForm({ ...form, newPass: e.target.value })}
              className="w-full border p-3 rounded-lg pr-10"
            />

            <button
              type="button"
              onClick={() => setShow(!show)}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              {show ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* CONFIRM */}
          <input
            type={show ? 'text' : 'password'}
            placeholder="Confirm Password"
            value={form.confirm}
            onChange={e => setForm({ ...form, confirm: e.target.value })}
            className="w-full border p-3 rounded-lg"
          />

          {/* ERROR */}
          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          {/* SUCCESS */}
          {success && (
            <p className="text-green-600 text-sm">{success}</p>
          )}

          {/* BUTTON */}
          <button
            type="submit"
            className="w-full bg-[#0f2340] text-white py-3 rounded-lg"
          >
            {loading ? 'Updating...' : 'Update Password'}
          </button>

        </form>

      </div>

    </div>
  )
}