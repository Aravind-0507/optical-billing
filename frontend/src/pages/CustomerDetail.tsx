// src/pages/CustomerDetail.tsx
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api/axios'

/* ================= TYPES ================= */

interface Invoice {
  id: number
  bill_no: string
  created_at: string
  total: number
  payment_mode: string
  items?: any[]
}

interface Prescription {
  id: number
  visit_date: string
  notes?: string
  [key: string]: any
}

interface Customer {
  id: number
  name: string
  phone: string
  email?: string
  invoices?: Invoice[]
  prescriptions?: Prescription[]
}

/* ================= COMPONENT ================= */

export default function CustomerDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [customer, setCustomer] = useState<Customer | null>(null)
  const [tab, setTab] = useState<'bills' | 'prescriptions'>('bills')

  useEffect(() => {
    if (!id) return

    api.get(`/customers/${id}`)
      .then(res => setCustomer(res.data.data))
  }, [id])

  /* ================= LOADING ================= */

  if (!customer) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-7 h-7 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  /* ================= UI ================= */

  return (
    <div>
      <button
        onClick={() => navigate('/customers')}
        className="text-sm text-gray-500 hover:text-gray-700 mb-4 flex items-center gap-1"
      >
        ← Back to Customers
      </button>

      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 mb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-lg font-bold">
              {customer.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">{customer.name}</h1>
              <p className="text-sm text-gray-500">{customer.phone}</p>
              {customer.email && (
                <p className="text-xs text-gray-400">{customer.email}</p>
              )}
            </div>
          </div>

          <button
            onClick={() => navigate(`/billing?customer_id=${customer.id}`)}
            className="bg-[#0f2340] text-white text-sm px-4 py-2 rounded-lg"
          >
            + New Bill
          </button>
        </div>

        {/* Stats */}
        <div className="mt-4 flex gap-4 text-sm">
          <div className="bg-gray-50 rounded-lg px-4 py-2 text-center">
            <p className="font-bold text-gray-900">
              {customer.invoices?.length || 0}
            </p>
            <p className="text-xs text-gray-500">Total Bills</p>
          </div>

          <div className="bg-gray-50 rounded-lg px-4 py-2 text-center">
            <p className="font-bold text-gray-900">
              ₹{(customer.invoices?.reduce((s, i) => s + Number(i.total), 0) || 0).toLocaleString()}
            </p>
            <p className="text-xs text-gray-500">Total Spent</p>
          </div>

          <div className="bg-gray-50 rounded-lg px-4 py-2 text-center">
            <p className="font-bold text-gray-900">
              {customer.prescriptions?.length || 0}
            </p>
            <p className="text-xs text-gray-500">Eye Records</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-gray-100 p-1 rounded-lg w-fit">
        {(['bills', 'prescriptions'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all capitalize
              ${tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Bills */}
      {tab === 'bills' && (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          {!customer.invoices?.length ? (
            <p className="text-sm text-gray-400 text-center py-10">
              No bills yet
            </p>
          ) : (
            <table className="w-full text-sm">
              <tbody>
                {customer.invoices.map((inv: Invoice) => (
                  <tr key={inv.id}>
                    <td>{inv.bill_no}</td>
                    <td>₹{Number(inv.total).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Prescriptions */}
      {tab === 'prescriptions' && (
        <div className="space-y-3">
          {!customer.prescriptions?.length ? (
            <div>No prescriptions yet</div>
          ) : (
            customer.prescriptions.map((p: Prescription) => (
              <div key={p.id}>
                {new Date(p.visit_date).toLocaleDateString('en-IN')}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}