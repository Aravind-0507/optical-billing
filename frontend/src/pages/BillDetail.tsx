import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api/axios'

export default function BillDetail() {
  const { id }          = useParams()
  const navigate        = useNavigate()
  const [bill, setBill] = useState(null)
  const [settings, setSettings] = useState({})

  useEffect(() => {
    api.get(`/invoices/${id}`).then(r => setBill(r.data.data))
    api.get('/settings').then(r => setSettings(r.data.data))
  }, [id])

  const handlePrint = () => window.print()

  const handleWhatsApp = () => {
    if (!bill?.customer?.phone) return alert('No phone number for this customer')
    const phone = bill.customer.phone.replace(/\D/g, '')
    const fullPhone = phone.startsWith('91') ? phone : `91${phone}`
    const msg = `Dear ${bill.customer.name},\n\nYour bill from ${settings.shop_name || 'Vision Optical'} is ready!\n\nBill No : ${bill.bill_no}\nDate    : ${new Date(bill.created_at).toLocaleDateString('en-IN')}\nAmount  : ₹${Number(bill.total).toLocaleString()}\nPayment : ${bill.payment_mode.toUpperCase()}\n\nThank you for visiting us!\n📍 ${settings.shop_name || 'Vision Optical'}, ${settings.city || ''}`
    window.open(`https://wa.me/${fullPhone}?text=${encodeURIComponent(msg)}`, '_blank')
  }

  const handleDelete = async () => {
    if (!confirm('Delete this bill? Stock will be restored.')) return
    await api.delete(`/invoices/${id}`)
    navigate('/bills')
  }

  if (!bill) return <div className="flex justify-center py-16"><div className="w-7 h-7 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"/></div>

  return (
    <>
      {/* Screen view */}
      <div className="no-print">
        <div className="flex items-center justify-between mb-5">
          <button onClick={() => navigate('/bills')} className="text-sm text-gray-500 hover:text-gray-700">← Back to Bills</button>
          <div className="flex gap-2">
            <button onClick={handleWhatsApp}
              className="flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white text-sm px-4 py-2 rounded-lg transition-colors">
              📲 Send via WhatsApp
            </button>
            <button onClick={handlePrint}
              className="flex items-center gap-1.5 bg-[#0f2340] hover:bg-[#1a3a5f] text-white text-sm px-4 py-2 rounded-lg transition-colors">
              🖨️ Print Bill
            </button>
            <button onClick={handleDelete} className="text-sm text-red-400 hover:text-red-600 px-3 py-2">Delete</button>
          </div>
        </div>

        {/* Bill preview card */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 max-w-md">
          <div className="text-center mb-4 border-b border-dashed border-gray-200 pb-4">
            <h2 className="font-bold text-lg text-gray-900">{settings.shop_name || 'Vision Optical'}</h2>
            <p className="text-xs text-gray-500">{settings.address}, {settings.city}</p>
            {settings.phone && <p className="text-xs text-gray-500">Ph: {settings.phone}</p>}
            {settings.gst_no && <p className="text-xs text-gray-500">GSTIN: {settings.gst_no}</p>}
          </div>

          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>Bill No: <strong className="text-gray-900">{bill.bill_no}</strong></span>
            <span>{new Date(bill.created_at).toLocaleDateString('en-IN')}</span>
          </div>
          <p className="text-xs text-gray-600 mb-4">Customer: <strong>{bill.customer?.name}</strong> | {bill.customer?.phone}</p>

          <table className="w-full text-xs mb-4">
            <thead className="border-b border-dashed border-gray-200">
              <tr>
                <th className="text-left py-1.5 text-gray-500">Item</th>
                <th className="text-center py-1.5 text-gray-500">Qty</th>
                <th className="text-right py-1.5 text-gray-500">Rate</th>
                <th className="text-right py-1.5 text-gray-500">Amt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {bill.items?.map((item, i) => (
                <tr key={i}>
                  <td className="py-1.5 font-medium">{item.name}</td>
                  <td className="py-1.5 text-center">{item.qty}</td>
                  <td className="py-1.5 text-right">₹{Number(item.price).toLocaleString()}</td>
                  <td className="py-1.5 text-right font-semibold">₹{Number(item.total).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="border-t border-dashed border-gray-200 pt-3 space-y-1 text-xs">
            <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>₹{Number(bill.subtotal).toFixed(2)}</span></div>
            {Number(bill.discount) > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-₹{Number(bill.discount).toFixed(2)}</span></div>}
            {Number(bill.gst_amount) > 0 && <div className="flex justify-between text-gray-600"><span>GST ({bill.gst_rate}%)</span><span>₹{Number(bill.gst_amount).toFixed(2)}</span></div>}
            <div className="flex justify-between font-bold text-sm pt-1 border-t border-gray-200 text-gray-900">
              <span>TOTAL</span><span>₹{Number(bill.total).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Paid ({bill.payment_mode.toUpperCase()})</span>
              <span>₹{Number(bill.total).toLocaleString()}</span>
            </div>
          </div>

          {bill.prescription && (
            <div className="mt-4 border-t border-dashed border-gray-200 pt-3">
              <p className="text-xs font-semibold text-gray-700 mb-2">Prescription</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[['RE', 're'], ['LE', 'le']].map(([label, key]) => (
                  <div key={key}>
                    <p className="font-medium text-gray-600 mb-1">{label}:</p>
                    <p className="text-gray-500">SPH: {bill.prescription[`${key}_sph`] ?? '—'} | CYL: {bill.prescription[`${key}_cyl`] ?? '—'}</p>
                    <p className="text-gray-500">AXIS: {bill.prescription[`${key}_axis`] ?? '—'} | ADD: {bill.prescription[`${key}_add`] ?? '—'}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <p className="text-center text-xs text-gray-400 mt-4 border-t border-dashed border-gray-200 pt-3">
            {settings.footer_msg || 'Thank you for visiting us!'}
          </p>
        </div>
      </div>

      {/* Print view — 80mm thermal style */}
      <div className="print-only" style={{ fontFamily: 'monospace', fontSize: '11px', width: '72mm', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 8 }}>
          <strong style={{ fontSize: 13 }}>{settings.shop_name || 'VISION OPTICAL'}</strong><br/>
          {settings.address}<br/>
          {settings.city}<br/>
          {settings.phone && <>Ph: {settings.phone}<br/></>}
          {settings.gst_no && <>GSTIN: {settings.gst_no}<br/></>}
        </div>
        <div style={{ borderTop: '1px dashed #000', borderBottom: '1px dashed #000', padding: '4px 0', marginBottom: 6 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Bill: {bill.bill_no}</span>
            <span>{new Date(bill.created_at).toLocaleDateString('en-IN')}</span>
          </div>
          <div>Customer: {bill.customer?.name}</div>
          <div>Ph: {bill.customer?.phone}</div>
        </div>

        <table style={{ width: '100%', fontSize: 10, marginBottom: 6 }}>
          <tbody>
            {bill.items?.map((item, i) => (
              <tr key={i}>
                <td>{item.name} x{item.qty}</td>
                <td style={{ textAlign: 'right' }}>₹{Number(item.total).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ borderTop: '1px dashed #000', paddingTop: 4, marginBottom: 4 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Subtotal</span><span>₹{Number(bill.subtotal).toFixed(2)}</span></div>
          {Number(bill.discount) > 0 && <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Discount</span><span>-₹{Number(bill.discount).toFixed(2)}</span></div>}
          {Number(bill.gst_amount) > 0 && <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>GST {bill.gst_rate}%</span><span>₹{Number(bill.gst_amount).toFixed(2)}</span></div>}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: 13, borderTop: '1px dashed #000', marginTop: 3, paddingTop: 3 }}>
            <span>TOTAL</span><span>₹{Number(bill.total).toLocaleString()}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Paid ({bill.payment_mode?.toUpperCase()})</span><span>₹{Number(bill.total).toLocaleString()}</span></div>
        </div>

        {bill.prescription && (
          <div style={{ borderTop: '1px dashed #000', paddingTop: 4, marginBottom: 4, fontSize: 10 }}>
            <div>--- Prescription ---</div>
            <div>RE: SPH {bill.prescription.re_sph ?? '-'} / CYL {bill.prescription.re_cyl ?? '-'} / AXIS {bill.prescription.re_axis ?? '-'}</div>
            <div>LE: SPH {bill.prescription.le_sph ?? '-'} / CYL {bill.prescription.le_cyl ?? '-'} / AXIS {bill.prescription.le_axis ?? '-'}</div>
          </div>
        )}

        <div style={{ borderTop: '1px dashed #000', paddingTop: 4, textAlign: 'center', fontSize: 10 }}>
          {settings.footer_msg || 'Thank you! Visit again.'}
        </div>
      </div>
    </>
  )
}
