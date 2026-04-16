// src/pages/Customers.tsx

import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import api from '../api/axios'

/* ================= TYPES ================= */

interface Customer {
  id: number
  name: string
  phone: string
  email?: string
  address?: string
}

interface CustomerForm {
  name: string
  phone: string
  email: string
  address: string
}

/* ================= COMPONENT ================= */

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [search, setSearch] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(true)

  const [showModal, setShowModal] = useState<boolean>(false)
  const [editing, setEditing] = useState<Customer | null>(null)

  const [form, setForm] = useState<CustomerForm>({
    name: '',
    phone: '',
    email: '',
    address: ''
  })

  const [saving, setSaving] = useState<boolean>(false)

  const navigate = useNavigate()
  const [params] = useSearchParams()

  /* ================= INIT ================= */

  useEffect(() => {
    fetchCustomers()
    if (params.get('new') === '1') setShowModal(true)
  }, [])

  const fetchCustomers = async (q: string = '') => {
    setLoading(true)
    const res = await api.get(`/customers?search=${q}`)
    setCustomers(res.data.data?.data || [])
    setLoading(false)
  }

  /* ================= SEARCH ================= */

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearch(value)
    fetchCustomers(value)
  }

  /* ================= ACTIONS ================= */

  const openAdd = () => {
    setEditing(null)
    setForm({ name: '', phone: '', email: '', address: '' })
    setShowModal(true)
  }

  const openEdit = (c: Customer) => {
    setEditing(c)
    setForm({
      name: c.name,
      phone: c.phone,
      email: c.email || '',
      address: c.address || ''
    })
    setShowModal(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      if (editing) {
        await api.put(`/customers/${editing.id}`, form)
      } else {
        await api.post('/customers', form)
      }

      setShowModal(false)
      fetchCustomers(search)
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Error saving customer')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this customer? All their bills will also be deleted.')) return
    await api.delete(`/customers/${id}`)
    fetchCustomers(search)
  }

  /* ================= UI ================= */

  return (
    <div>

      {/* HEADER */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Customers</h1>
          <p className="text-sm text-gray-500">
            {customers.length} total customers
          </p>
        </div>

        <button
          onClick={openAdd}
          className="bg-[#0f2340] text-white text-sm px-4 py-2 rounded-lg"
        >
          + Add Customer
        </button>
      </div>

      {/* SEARCH */}
      <input
        type="text"
        placeholder="Search by name or phone..."
        value={search}
        onChange={handleSearch}
        className="w-full max-w-sm h-10 px-3.5 border rounded-lg text-sm mb-5"
      />

      {/* TABLE */}
      {loading ? (
        <div className="text-center py-10">Loading...</div>
      ) : customers.length === 0 ? (
        <div className="text-center py-10 text-gray-400">
          No customers yet
        </div>
      ) : (
        <table className="w-full bg-white rounded-xl overflow-hidden border border-gray-100">

            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Name</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Phone</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Email</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
    {customers.map(c => (
      <tr key={c.id} className="hover:bg-gray-50 transition">

        <td className="px-4 py-3 text-gray-800">{c.name}</td>
        <td className="px-4 py-3 text-gray-600">{c.phone}</td>
        <td className="px-4 py-3 text-gray-600">{c.email || '-'}</td>

        {/* 🔥 FIXED ACTIONS ALIGNMENT */}
        <td className="px-4 py-3">
          <div className="flex gap-2">

            <button
              onClick={() => navigate(`/customers/${c.id}`)}
              className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200"
            >
              History
            </button>

            <button
              onClick={() => navigate(`/billing?customer_id=${c.id}`)}
              className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700 hover:bg-blue-200"
            >
              Bill
            </button>

            <button
              onClick={() => openEdit(c)}
              className="text-xs px-2 py-1 rounded bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
            >
              Edit
            </button>

            <button
              onClick={() => handleDelete(c.id)}
              className="text-xs px-2 py-1 rounded bg-red-100 text-red-600 hover:bg-red-200"
            >
              Delete
            </button>

          </div>
        </td>

      </tr>
    ))}
  </tbody>

        </table>
      )}

      {/* MODAL */}
      {showModal && (
      <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">

        <form onSubmit={handleSave} className="bg-white p-6 rounded-xl w-96 shadow-lg">

          <h2 className="text-lg font-semibold mb-4">
            {editing ? 'Edit Customer' : 'Add Customer'}
          </h2>

          <input
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            placeholder="Name"
            className="w-full border border-gray-200 p-2 rounded-lg mt-2 text-sm"
            required
          />

        <input
          value={form.phone}
          onChange={(e) => {
            const value = e.target.value.replace(/\D/g, '') 
            if (value.length <= 10) {
              setForm({ ...form, phone: value })
            }
          }}
          placeholder="Phone"
          className="w-full border border-gray-200 p-2 rounded-lg mt-2 text-sm"
          required
        />

          <input
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            placeholder="Email"
            className="w-full border border-gray-200 p-2 rounded-lg mt-2 text-sm"
          />

          <input
            value={form.address}
            onChange={e => setForm({ ...form, address: e.target.value })}
            placeholder="Address"
            className="w-full border border-gray-200 p-2 rounded-lg mt-2 text-sm"
          />

          {/* BUTTONS */}
          <div className="flex gap-3 mt-4">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="flex-1 border border-gray-200 py-2 rounded-lg text-sm hover:bg-gray-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="flex-1 bg-[#0f2340] text-white py-2 rounded-lg text-sm"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>

        </form>
      </div>
      )}

    </div>
  )
}