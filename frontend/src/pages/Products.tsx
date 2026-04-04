// src/pages/Products.jsx
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import api from '../api/axios'

const CATEGORIES = ['All', 'Frames', 'Lenses', 'Contact Lens', 'Sunglasses', 'Accessories', 'Services']

export default function Products() {
  const [products, setProducts] = useState([])
  const [search, setSearch]     = useState('')
  const [cat, setCat]           = useState('All')
  const [loading, setLoading]   = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing]   = useState(null)
  const [form, setForm]         = useState({ name:'', category:'Frames', brand:'', price:'', stock:'', description:'' })
  const [saving, setSaving]     = useState(false)
  const [params]                = useSearchParams()

  useEffect(() => {
    fetchProducts()
    if (params.get('new') === '1') setShowModal(true)
  }, [])

  const fetchProducts = async () => {
    setLoading(true)
    const res = await api.get('/products')
    setProducts(res.data.data || [])
    setLoading(false)
  }

  const filtered = products.filter(p => {
    const matchCat    = cat === 'All' || p.category === cat
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  const openAdd  = () => { setEditing(null); setForm({ name:'', category:'Frames', brand:'', price:'', stock:'', description:'' }); setShowModal(true) }
  const openEdit = (p) => { setEditing(p); setForm({ name:p.name, category:p.category, brand:p.brand||'', price:p.price, stock:p.stock, description:p.description||'' }); setShowModal(true) }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      editing ? await api.put(`/products/${editing.id}`, form) : await api.post('/products', form)
      setShowModal(false)
      fetchProducts()
    } catch (err) {
      alert(err.response?.data?.message || 'Error')
    } finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return
    await api.delete(`/products/${id}`)
    fetchProducts()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Products</h1>
          <p className="text-sm text-gray-500">{products.length} total products</p>
        </div>
        <button onClick={openAdd} className="bg-[#0f2340] text-white text-sm px-4 py-2 rounded-lg hover:bg-[#1a3a5f]">
          + Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <input type="text" placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)}
          className="h-9 px-3.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 w-48"/>
        <div className="flex gap-1 flex-wrap">
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCat(c)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
                ${cat === c ? 'bg-[#0f2340] text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="w-7 h-7 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"/></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400"><p className="text-4xl mb-3">🕶️</p><p className="text-sm">No products found.</p></div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Name</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Category</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Brand</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Price</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Stock</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(p => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-800">{p.name}</td>
                  <td className="px-4 py-3"><span className="bg-blue-50 text-blue-700 text-[10px] px-2 py-0.5 rounded-full font-medium">{p.category}</span></td>
                  <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{p.brand || '—'}</td>
                  <td className="px-4 py-3 font-semibold text-gray-900">₹{Number(p.price).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full
                      ${p.stock === 0 ? 'bg-red-100 text-red-600' :
                        p.stock <= 5 ? 'bg-amber-100 text-amber-700' :
                        'bg-green-100 text-green-700'}`}>
                      {p.stock === 0 ? 'Out of stock' : `${p.stock} left`}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(p)} className="text-xs text-gray-500 hover:underline">Edit</button>
                      <button onClick={() => handleDelete(p.id)} className="text-xs text-red-400 hover:underline">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-base font-bold text-gray-900 mb-5">{editing ? 'Edit Product' : 'Add Product'}</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Name *</label>
                <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required
                  className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"/>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">Category *</label>
                  <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} required
                    className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 bg-white">
                    {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">Brand</label>
                  <input type="text" value={form.brand} onChange={e => setForm({...form, brand: e.target.value})}
                    className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"/>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">Price (₹) *</label>
                  <input type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} required min="0"
                    className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"/>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">Stock Qty *</label>
                  <input type="number" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} required min="0"
                    className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"/>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 h-10 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 h-10 bg-[#0f2340] text-white rounded-lg text-sm font-medium disabled:opacity-60">{saving ? 'Saving...' : (editing ? 'Update' : 'Add Product')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}