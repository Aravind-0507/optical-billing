// src/pages/Reports.tsx

import { useEffect, useState } from 'react'
import api from '../api/axios'

/* ================= TYPES ================= */

interface Customer {
  name: string
}

interface Invoice {
  id: number
  bill_no: string
  total: number
  payment_mode: string
  created_at: string
  customer?: Customer
}

interface Summary {
  total_bills: number
  total_revenue: number
  cash: number
  upi: number
  card: number
}

interface ReportData {
  from: string
  to: string
  summary?: Summary
  invoices: Invoice[]
}

/* ================= COMPONENT ================= */

export default function Reports() {
  const today = new Date().toISOString().split('T')[0]

  const [from, setFrom] = useState<string>(today)
  const [to, setTo] = useState<string>(today)
  const [report, setReport] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState<boolean>(false)

  /* ================= INIT ================= */

  useEffect(() => {
    fetchReport()
  }, [])

  const fetchReport = async () => {
    setLoading(true)

    try {
      const res = await api.get(`/reports/daily?from_date=${from}&to_date=${to}`)
      setReport(res.data)
    } catch (err) {
      console.error('Report error', err)
      setReport(null)
    } finally {
      setLoading(false)
    }
  }

  /* ================= DOWNLOAD ================= */

  const downloadPdf = () => {
    const token = localStorage.getItem('optical_token')
    const url = `http://localhost/optical-api/public/api/reports/pdf?from_date=${from}&to_date=${to}`

    window.open(url + `&token=${token}`, '_blank')
  }

  /* ================= UI ================= */

  return (
    <div>

      {/* HEADER */}
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold text-gray-900">Reports</h1>

        <button
          onClick={downloadPdf}
          className="bg-red-600 text-white px-4 py-2 rounded-lg"
        >
          Download PDF
        </button>
      </div>

      {/* FILTER */}
      <div className="flex gap-3 mb-5">

        <input
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          className="border p-2 rounded"
        />

        <input
          type="date"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className="border p-2 rounded"
        />

        <button
          onClick={fetchReport}
          className="bg-[#0f2340] text-white px-4 rounded"
        >
          Search
        </button>

      </div>

      {/* CONTENT */}
      {loading ? (
        <div className="text-center py-10">Loading...</div>
      ) : report && (
        <>

          {/* SUMMARY */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">

            <div className="bg-white p-4 rounded">
              <p>Total Bills</p>
              <h2>{report.summary?.total_bills || 0}</h2>
            </div>

            <div className="bg-white p-4 rounded">
              <p>Total Revenue</p>
              <h2>₹{report.summary?.total_revenue || 0}</h2>
            </div>

            <div className="bg-white p-4 rounded">
              <p>Cash</p>
              <h2>₹{report.summary?.cash || 0}</h2>
            </div>

            <div className="bg-white p-4 rounded">
              <p>UPI + Card</p>
              <h2>
                ₹{(report.summary?.upi || 0) + (report.summary?.card || 0)}
              </h2>
            </div>

          </div>

          {/* TABLE */}
          {report.invoices.length === 0 ? (
            <p>No data</p>
          ) : (
            <table className="w-full bg-white rounded">

              <thead>
                <tr>
                  <th>Bill No</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Total</th>
                  <th>Mode</th>
                </tr>
              </thead>

              <tbody>
                {report.invoices.map((b) => (
                  <tr key={b.id}>
                    <td>{b.bill_no}</td>
                    <td>{b.customer?.name}</td>
                    <td>
                      {new Date(b.created_at).toLocaleDateString()}
                    </td>
                    <td>₹{b.total}</td>
                    <td>{b.payment_mode}</td>
                  </tr>
                ))}
              </tbody>

            </table>
          )}

        </>
      )}

    </div>
  )
}