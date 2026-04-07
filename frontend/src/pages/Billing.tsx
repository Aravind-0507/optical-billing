// src/pages/Billing.tsx

import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import api from '../api/axios'

/* ================= TYPES ================= */

interface Customer {
  id: number
  name: string
}

interface Product {
  id: number
  name: string
  price: number
}

interface Item {
  product_id: number
  name: string
  qty: number
  price: number
  total: number
}

interface Prescription {
  re_sph: string
  re_cyl: string
  re_axis: string
  re_add: string
  le_sph: string
  le_cyl: string
  le_axis: string
  le_add: string
}

/* ================= COMPONENT ================= */

export default function Billing() {
  const navigate = useNavigate()
  const [params] = useSearchParams()

  const [customers, setCustomers] = useState<Customer[]>([])
  const [products, setProducts] = useState<Product[]>([])

  const [custSearch, setCustSearch] = useState('')
  const [showCustDrop, setShowCustDrop] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)

  const [prodSearch, setProdSearch] = useState('')
  const [items, setItems] = useState<Item[]>([])

  const [paymentMode, setPaymentMode] = useState<'cash' | 'upi' | 'card'>('cash')

  /* 🔥 PRESCRIPTION STATE */
  const [showRx, setShowRx] = useState(false)
  const [prescription, setPrescription] = useState<Prescription>({
    re_sph: '', re_cyl: '', re_axis: '', re_add: '',
    le_sph: '', le_cyl: '', le_axis: '', le_add: ''
  })

  const [saving, setSaving] = useState(false)

  /* ================= INIT ================= */

  useEffect(() => {
    api.get('/products').then(r => setProducts(r.data.data || []))

    const customerId = params.get('customer_id')
    if (customerId) {
      api.get(`/customers/${customerId}`)
        .then(r => setSelectedCustomer(r.data.data))
    }
  }, [])

  /* ================= CUSTOMER ================= */

  const searchCustomers = async (q: string) => {
    setCustSearch(q)
    if (!q) return setCustomers([])

    const r = await api.get(`/customers?search=${q}`)
    setCustomers(r.data.data?.data || [])
    setShowCustDrop(true)
  }

  const selectCustomer = (c: Customer) => {
    setSelectedCustomer(c)
    setCustSearch(c.name)
    setShowCustDrop(false)
  }

  /* ================= PRODUCTS ================= */

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(prodSearch.toLowerCase())
  )

  const addItem = (p: Product) => {
    const exists = items.find(i => i.product_id === p.id)

    if (exists) {
      setItems(items.map(i =>
        i.product_id === p.id
          ? { ...i, qty: i.qty + 1, total: (i.qty + 1) * i.price }
          : i
      ))
    } else {
      setItems([...items, {
        product_id: p.id,
        name: p.name,
        qty: 1,
        price: p.price,
        total: p.price
      }])
    }
  }

  const increaseQty = (id: number) => {
    setItems(items.map(i =>
      i.product_id === id
        ? { ...i, qty: i.qty + 1, total: (i.qty + 1) * i.price }
        : i
    ))
  }
  
  const decreaseQty = (id: number) => {
    setItems(items
      .map(i =>
        i.product_id === id
          ? { ...i, qty: i.qty - 1, total: (i.qty - 1) * i.price }
          : i
      )
      .filter(i => i.qty > 0) 
    )
  }

  /* ================= TOTAL ================= */

  const total = items.reduce((s, i) => s + i.total, 0)

  /* ================= SAVE ================= */

  const handleSave = async () => {
    if (!selectedCustomer) return alert('Select customer')
    if (items.length === 0) return alert('Add items')

    setSaving(true)

    try {
      const res = await api.post('/invoices', {
        customer_id: selectedCustomer.id,
        items,
        payment_mode: paymentMode,
        prescription: showRx ? prescription : null
      })

      navigate(`/bills/${res.data.data.id}`)
    } catch {
      alert('Error saving bill')
    } finally {
      setSaving(false)
    }
  }

  /* ================= UI ================= */

  return (
    <div className="max-w-3xl mx-auto space-y-4">

      <h1 className="text-xl font-bold">Create Bill</h1>

      {/* CUSTOMER */}
      <div className="bg-white p-4 rounded-xl border relative">

  {selectedCustomer ? (
    <div className="flex justify-between items-center">
      <span className="font-medium">{selectedCustomer.name}</span>
      <button
        onClick={() => {
          setSelectedCustomer(null)
          setCustSearch('')
        }}
        className="text-xs text-blue-600 hover:underline"
      >
        Change
      </button>
    </div>
  ) : (
    <div className="relative">
      <input
        placeholder="Search customer..."
        value={custSearch}
        onChange={e => searchCustomers(e.target.value)}
        onFocus={() => custSearch && setShowCustDrop(true)}
        className="w-full border px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-blue-500"
      />

      {/* 🔥 DROPDOWN */}
      {showCustDrop && customers.length > 0 && (
        <div className="absolute z-50 mt-1 w-full bg-white border rounded-lg shadow-lg max-h-52 overflow-y-auto">

          {customers.map(c => (
            <div
              key={c.id}
              onClick={() => selectCustomer(c)}
              className="px-3 py-2 text-sm hover:bg-blue-50 cursor-pointer"
            >
              {c.name}
            </div>
          ))}

        </div>
      )}

      {/* NO DATA */}
      {showCustDrop && customers.length === 0 && custSearch && (
        <div className="absolute z-50 mt-1 w-full bg-white border rounded-lg shadow text-sm p-2 text-gray-400">
          No customers found
        </div>
      )}
    </div>
  )}
</div>

      {/* PRODUCTS */}
      <div className="bg-white p-4 rounded-xl border">
        <input
          placeholder="Search product"
          value={prodSearch}
          onChange={e => setProdSearch(e.target.value)}
          className="w-full border p-2 rounded mb-2"
        />

        {filteredProducts.map(p => (
          <div key={p.id}
            onClick={() => addItem(p)}
            className="p-2 cursor-pointer hover:bg-gray-100">
            {p.name} - ₹{p.price}
          </div>
        ))}

        {items.map((item, idx) => (
          <div key={idx} className="flex justify-between items-center mt-2 border-b pb-2">

            {/* NAME */}
            <div>
              <p className="font-medium">{item.name}</p>

              {/* CONTROLS */}
              <div className="flex items-center gap-2 mt-1">

                <button
                  onClick={() => decreaseQty(item.product_id)}
                  className="px-2 bg-red-100 text-red-600 rounded"
                >
                  -
                </button>

                <span>{item.qty}</span>

                <button
                  onClick={() => increaseQty(item.product_id)}
                  className="px-2 bg-green-100 text-green-600 rounded"
                >
                  +
                </button>

              </div>    
            </div>

            {/* TOTAL */}
            <span className="font-semibold">
              ₹{item.total}
            </span>

          </div>
        ))}
      </div>

      {/* 🔥 PRESCRIPTION TOGGLE */}
      <button
        onClick={() => setShowRx(!showRx)}
        className="bg-gray-200 px-3 py-2 rounded"
      >
        {showRx ? 'Hide Eye Power' : 'Add Eye Power'}
      </button>

      {/* 🔥 PRESCRIPTION UI */}
      {showRx && (
        <div className="bg-white p-4 rounded-xl border">

          <h2 className="font-semibold mb-3">Eye Power</h2>

          <div className="grid grid-cols-2 gap-4">

            {/* RIGHT */}
            <div>
              <h3 className="text-sm mb-2">Right Eye</h3>
              <input placeholder="SPH"
                onChange={e => setPrescription(p => ({ ...p, re_sph: e.target.value }))} />
              <input placeholder="CYL"
                onChange={e => setPrescription(p => ({ ...p, re_cyl: e.target.value }))} />
              <input placeholder="AXIS"
                onChange={e => setPrescription(p => ({ ...p, re_axis: e.target.value }))} />
            </div>

            {/* LEFT */}
            <div>
              <h3 className="text-sm mb-2">Left Eye</h3>
              <input placeholder="SPH"
                onChange={e => setPrescription(p => ({ ...p, le_sph: e.target.value }))} />
              <input placeholder="CYL"
                onChange={e => setPrescription(p => ({ ...p, le_cyl: e.target.value }))} />
              <input placeholder="AXIS"
                onChange={e => setPrescription(p => ({ ...p, le_axis: e.target.value }))} />
            </div>

          </div>
        </div>
      )}

      {/* TOTAL */}
      <div className="bg-white p-4 rounded-xl border">
        Total: ₹{total}
      </div>

      {/* SAVE */}
      <button
        onClick={handleSave}
        className="bg-blue-600 text-white p-3 rounded w-full"
      >
        {saving ? 'Saving...' : 'Save Bill'}
      </button>

    </div>
  )
}