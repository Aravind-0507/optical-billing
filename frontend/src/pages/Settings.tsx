// src/pages/Settings.tsx

import { useEffect, useState } from 'react'
import api from '../api/axios'

/* ================= TYPES ================= */

interface SettingsForm {
  shop_name: string
  phone: string
  address: string
  city: string
  gst_no: string
  gst_rate: string
  footer_msg: string
}

interface SettingsResponse {
  shop_name?: string
  phone?: string
  address?: string
  city?: string
  gst_no?: string
  gst_rate?: string
  footer_msg?: string
  logo_path?: string
}

/* ================= COMPONENT ================= */

export default function Settings() {
  const [form, setForm] = useState<SettingsForm>({
    shop_name: '',
    phone: '',
    address: '',
    city: '',
    gst_no: '',
    gst_rate: '0',
    footer_msg: '',
  })

  const [logo, setLogo] = useState<File | null>(null)
  const [logoUrl, setLogoUrl] = useState<string>('')

  const [saving, setSaving] = useState<boolean>(false)
  const [saved, setSaved] = useState<boolean>(false)

  /* ================= INIT ================= */

  useEffect(() => {
    api.get('/settings').then(r => {
      const d: SettingsResponse = r.data.data

      setForm({
        shop_name: d.shop_name || '',
        phone: d.phone || '',
        address: d.address || '',
        city: d.city || '',
        gst_no: d.gst_no || '',
        gst_rate: d.gst_rate || '0',
        footer_msg: d.footer_msg || '',
      })

      if (d.logo_path) {
        setLogoUrl(
          `http://localhost/optical-api/public/storage/${d.logo_path}`
        )
      }
    })
  }, [])

  /* ================= SAVE ================= */

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      await api.post('/settings', form)

      if (logo) {
        const fd = new FormData()
        fd.append('logo', logo)

        const res = await api.post('/settings/logo', fd, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })

        setLogoUrl(res.data.logo_url)
      }

      setSaved(true)
      setTimeout(() => setSaved(false), 3000)

    } catch (err: any) {
      alert(err?.response?.data?.message || 'Error saving')
    } finally {
      setSaving(false)
    }
  }

  /* ================= UI ================= */

  return (
    <div className="max-w-xl">

      <h1 className="text-xl font-bold text-gray-900 mb-1">
        Shop Settings
      </h1>

      <p className="text-sm text-gray-500 mb-6">
        This info appears on every printed bill
      </p>

      <form onSubmit={handleSave} className="space-y-5">

        {/* LOGO */}
        <div className="bg-white p-5 rounded-xl border">
          <h2 className="text-sm font-semibold mb-4">
            Shop Logo
          </h2>

          <div className="flex items-center gap-4">

            {logoUrl ? (
              <img
                src={logoUrl}
                alt="logo"
                className="w-16 h-16 object-contain border rounded"
              />
            ) : (
              <div className="w-16 h-16 bg-gray-100 flex items-center justify-center">
                👁️
              </div>
            )}

            <input
              type="file"
              accept="image/*"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setLogo(e.target.files?.[0] || null)
              }
            />

          </div>
        </div>

        {/* DETAILS */}
        <div className="bg-white p-5 rounded-xl border">

          <div className="space-y-3">

            <input
              value={form.shop_name}
              onChange={e => setForm({ ...form, shop_name: e.target.value })}
              placeholder="Shop Name"
              className="w-full border p-2"
            />

            <input
              value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })}
              placeholder="Phone"
              className="w-full border p-2"
            />

            <input
              value={form.address}
              onChange={e => setForm({ ...form, address: e.target.value })}
              placeholder="Address"
              className="w-full border p-2"
            />

            <input
              value={form.city}
              onChange={e => setForm({ ...form, city: e.target.value })}
              placeholder="City"
              className="w-full border p-2"
            />

            <input
              value={form.gst_no}
              onChange={e => setForm({ ...form, gst_no: e.target.value })}
              placeholder="GST Number"
              className="w-full border p-2"
            />

            <select
              value={form.gst_rate}
              onChange={e => setForm({ ...form, gst_rate: e.target.value })}
              className="w-full border p-2"
            >
              {[0, 5, 12, 18].map(r => (
                <option key={r} value={r}>
                  {r}%
                </option>
              ))}
            </select>

            <textarea
              value={form.footer_msg}
              onChange={e => setForm({ ...form, footer_msg: e.target.value })}
              placeholder="Footer message"
              className="w-full border p-2"
            />

          </div>

        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-blue-600 text-white p-3 rounded"
        >
          {saving ? 'Saving...' : saved ? 'Saved!' : 'Save'}
        </button>

      </form>

    </div>
  )
}