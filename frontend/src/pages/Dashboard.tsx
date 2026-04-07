import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'

export default function Dashboard() {
  const [data, setData]     = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate             = useNavigate()

  useEffect(() => {
    api.get('/dashboard').then(r => setData(r.data.data)).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-7 h-7 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"/></div>

  const stats = [
    { label: "Today's Revenue", value: `₹${(data?.today_revenue || 0).toLocaleString()}`, icon: '💰', color: 'bg-blue-50 text-blue-700' },
    { label: "Today's Bills",   value: data?.today_bills || 0,                              icon: '🧾', color: 'bg-green-50 text-green-700' },
    { label: 'Month Revenue',   value: `₹${(data?.month_revenue || 0).toLocaleString()}`,  icon: '📅', color: 'bg-purple-50 text-purple-700' },
    { label: 'Total Customers', value: data?.total_customers || 0,                          icon: '👥', color: 'bg-orange-50 text-orange-700' },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500">{new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <button onClick={() => navigate('/billing')}
          className="bg-[#0f2340] text-white text-sm px-4 py-2 rounded-lg hover:bg-[#1a3a5f] transition-colors">
          + New Bill
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-4">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-base mb-3 ${s.color}`}>{s.icon}</div>
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Recent bills */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-800">Recent Bills</h2>
            <button onClick={() => navigate('/bills')} className="text-xs text-blue-600 hover:underline">View all</button>
          </div>
          {data?.recent_bills?.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No bills yet. Create your first bill!</p>
          ) : (
            <div className="space-y-2">
              {data?.recent_bills?.map(bill => (
                <div key={bill.id} onClick={() => navigate(`/bills/${bill.id}`)}
                  className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{bill.customer?.name}</p>
                    <p className="text-xs text-gray-400">{bill.bill_no} • {new Date(bill.created_at).toLocaleDateString('en-IN')}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">₹{Number(bill.total).toLocaleString()}</p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium
                      ${bill.payment_mode === 'cash' ? 'bg-green-100 text-green-700' :
                        bill.payment_mode === 'upi'  ? 'bg-blue-100 text-blue-700' :
                        'bg-purple-100 text-purple-700'}`}>
                      {bill.payment_mode.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick actions + stock alert */}
        <div className="space-y-4">
          {/* <div className="bg-white rounded-xl border border-gray-100 p-4">
            <h2 className="text-sm font-semibold text-gray-800 mb-3">Quick Actions</h2>
            <div className="space-y-2">
              {[
                { label: 'Create New Bill', path: '/billing', icon: '🧾' },
                { label: 'Add Customer',    path: '/customers?new=1', icon: '👤' },
                { label: 'Add Product',     path: '/products?new=1', icon: '📦' },
                { label: 'View Reports',    path: '/reports', icon: '📈' },
              ].map(a => (
                <button key={a.label} onClick={() => navigate(a.path)}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm text-gray-700 transition-colors text-left">
                  <span>{a.icon}</span>{a.label}
                </button>
              ))}
            </div>
          </div> */}

          {(data?.low_stock > 0 || data?.out_of_stock > 0) && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <h2 className="text-sm font-semibold text-amber-800 mb-2">⚠ Stock Alert</h2>
              {data.low_stock > 0 && <p className="text-xs text-amber-700">{data.low_stock} product(s) low stock</p>}
              {data.out_of_stock > 0 && <p className="text-xs text-red-600">{data.out_of_stock} product(s) out of stock</p>}
              <button onClick={() => navigate('/products')} className="mt-2 text-xs text-amber-800 font-medium hover:underline">View Products →</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}