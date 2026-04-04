// src/pages/Bills.tsx

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'

/* ================= TYPES ================= */

interface Customer {
  name: string
}

interface Bill {
  id: number
  bill_no: string
  total: number
  payment_mode: string
  created_at: string
  customer?: Customer
}

/* ================= COMPONENT ================= */

export default function Bills() {
  const [bills, setBills] = useState<Bill[]>([])
  const [search, setSearch] = useState<string>('')
  const [from, setFrom] = useState<string>('')
  const [to, setTo] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(true)

  const navigate = useNavigate()

  useEffect(() => {
    fetchBills()
  }, [])

  const fetchBills = async () => {
    setLoading(true)

    const params = new URLSearchParams()
    if (search) params.append('search', search)
    if (from) params.append('from_date', from)
    if (to) params.append('to_date', to)

    try {
      const res = await api.get(`/invoices?${params}`)
      
      // 🔥 IMPORTANT (handle both API formats)
      const data = res.data.data?.data || res.data.data || []
      
      setBills(data)
    } catch (err) {
      console.error('Error fetching bills', err)
      setBills([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>

      {/* HEADER */}
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold text-gray-900">All Bills</h1>
        <button
          onClick={() => navigate('/billing')}
          className="bg-[#0f2340] text-white text-sm px-4 py-2 rounded-lg"
        >
          + New Bill
        </button>
      </div>

      {/* FILTER */}
      <div className="flex flex-wrap gap-3 mb-5">

        <input
          type="text"
          placeholder="Search bill no or customer..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-9 px-3.5 border border-gray-200 rounded-lg text-sm w-52"
        />

        <input
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          className="h-9 px-3 border border-gray-200 rounded-lg text-sm"
        />

        <input
          type="date"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className="h-9 px-3 border border-gray-200 rounded-lg text-sm"
        />

        <button
          onClick={fetchBills}
          className="h-9 px-4 bg-gray-100 hover:bg-gray-200 text-sm rounded-lg"
        >
          Search
        </button>

      </div>

      {/* CONTENT */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-7 h-7 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : bills.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">🧾</p>
          <p className="text-sm">No bills found.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border overflow-hidden">

          <table className="w-full text-sm">

            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-xs text-gray-500">Bill No</th>
                <th className="px-4 py-3 text-xs text-gray-500">Customer</th>
                <th className="px-4 py-3 text-xs text-gray-500 hidden md:table-cell">Date</th>
                <th className="px-4 py-3 text-xs text-gray-500">Amount</th>
                <th className="px-4 py-3 text-xs text-gray-500">Mode</th>
                <th className="px-4 py-3 text-xs text-gray-500">Action</th>
              </tr>
            </thead>

            <tbody>
              {bills.map((b) => (
                <tr key={b.id} className="hover:bg-gray-50">

                  <td className="px-4 py-3 font-medium text-blue-700">
                    {b.bill_no}
                  </td>

                  <td className="px-4 py-3">
                    {b.customer?.name || '-'}
                  </td>

                  <td className="px-4 py-3 hidden md:table-cell">
                    {new Date(b.created_at).toLocaleDateString('en-IN')}
                  </td>

                  <td className="px-4 py-3 font-semibold">
                    ₹{Number(b.total).toLocaleString()}
                  </td>

                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded
                      ${b.payment_mode === 'cash'
                        ? 'bg-green-100 text-green-700'
                        : b.payment_mode === 'upi'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-purple-100 text-purple-700'
                      }`}
                    >
                      {b.payment_mode?.toUpperCase()}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    <button
                      onClick={() => navigate(`/bills/${b.id}`)}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      View & Print
                    </button>
                  </td>

                </tr>
              ))}
            </tbody>

          </table>

        </div>
      )}
    </div>
  )
}