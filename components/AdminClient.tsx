'use client'

import { UserButton } from '@clerk/nextjs'
import { useState, useRef } from 'react'

type MenuItem = {
  id: string
  name: string
  description: string
  price: number
  calories: number
  ingredients: string[]
  thumbnailUrl?: string | null
  glbUrl: string
  usdzUrl: string
  status: string
  restaurantId: string
}

type UploadField = 'thumbnailUrl' | 'glbUrl' | 'usdzUrl'

const RESTAURANT_ID = '507f1f77bcf86cd799439011'

const emptyForm = {
  name: '',
  description: '',
  price: '',
  calories: '',
  ingredients: '',
  thumbnailUrl: '',
  glbUrl: '',
  usdzUrl: '',
  status: 'active',
}

function getMimeType(file: File) {
  if (file.type) return file.type
  const ext = file.name.split('.').pop()?.toLowerCase()
  switch (ext) {
    case 'glb': return 'model/gltf-binary'
    case 'usdz': return 'model/vnd.usdz+zip'
    case 'png': return 'image/png'
    case 'jpg':
    case 'jpeg': return 'image/jpeg'
    default: return 'application/octet-stream'
  }
}

export default function AdminClient({ initialItems }: { initialItems: MenuItem[] }) {
  const [items, setItems] = useState<MenuItem[]>(initialItems)
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [uploading, setUploading] = useState<Partial<Record<UploadField, boolean>>>({})
  const [uploadProgress, setUploadProgress] = useState<Partial<Record<UploadField, number>>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const formRef = useRef<HTMLDivElement>(null)

  async function fetchItems() {
    const res = await fetch(`/api/menu-items?restaurantId=${RESTAURANT_ID}&status=active`)
    const data = await res.json()
    setItems(Array.isArray(data) ? data : [])
  }

  async function uploadFile(file: File, field: UploadField) {
    setUploading(prev => ({ ...prev, [field]: true }))
    setUploadProgress(prev => ({ ...prev, [field]: 0 }))
    try {
      const type = getMimeType(file)
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName: file.name, fileType: type }),
      })
      const { signedUrl, publicUrl } = await res.json()

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const percent = Math.round((e.loaded / e.total) * 100)
            setUploadProgress(prev => ({ ...prev, [field]: percent }))
          }
        }
        xhr.onload = () => {
          xhr.status === 200 || xhr.status === 204 ? resolve() : reject(new Error(`Status ${xhr.status}`))
        }
        xhr.onerror = () => reject(new Error('Network error'))
        xhr.open('PUT', signedUrl)
        xhr.setRequestHeader('Content-Type', type)
        xhr.send(file)
      })

      setForm(prev => ({ ...prev, [field]: publicUrl }))
    } catch {
      setError('Upload failed. Please try again.')
    } finally {
      setUploading(prev => ({ ...prev, [field]: false }))
      setUploadProgress(prev => ({ ...prev, [field]: 0 }))
    }
  }

  async function handleSubmit() {
    setError('')
    if (!form.name || !form.price || !form.glbUrl || !form.usdzUrl) {
      setError('Name, price, GLB and USDZ are required.')
      return
    }
    setLoading(true)
    try {
      const body = {
        restaurantId: RESTAURANT_ID,
        name: form.name,
        description: form.description,
        price: parseFloat(form.price),
        calories: parseInt(form.calories) || 0,
        ingredients: form.ingredients.split(',').map(i => i.trim()).filter(Boolean),
        thumbnailUrl: form.thumbnailUrl || null,
        glbUrl: form.glbUrl,
        usdzUrl: form.usdzUrl,
        status: form.status,
      }
      const url = editingId ? `/api/menu-items/${editingId}` : '/api/menu-items'
      const method = editingId ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error('Failed to save')
      resetForm()
      fetchItems()
    } catch {
      setError('Failed to save item. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleEdit(item: MenuItem) {
    setEditingId(item.id)
    setForm({
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      calories: item.calories.toString(),
      ingredients: item.ingredients.join(', '),
      thumbnailUrl: item.thumbnailUrl || '',
      glbUrl: item.glbUrl,
      usdzUrl: item.usdzUrl,
      status: item.status,
    })
    formRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this item?')) return
    await fetch(`/api/menu-items/${id}`, { method: 'DELETE' })
    fetchItems()
  }

  async function toggleStatus(item: MenuItem) {
    const newStatus = item.status === 'active' ? 'inactive' : 'active'
    await fetch(`/api/menu-items/${item.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
    fetchItems()
  }

  function resetForm() {
    setForm(emptyForm)
    setEditingId(null)
    setError('')
  }

  // paste your exact JSX return here unchanged
  return (
   <div className="min-h-screen bg-gray-50">
         {/* Header */}
        <header className="bg-white border-b border-orange-100 px-6 py-3 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2">
                {/* Logo mark */}
                <div className="w-7 h-7 rounded-lg bg-orange-500 flex items-center justify-center">
                <span className="text-white text-sm">🍽</span>
                </div>
                <span className="font-semibold text-gray-900 text-sm tracking-tight">AR Food</span>
                <span className="text-gray-300 text-xs">|</span>
                <span className="text-xs text-gray-400 font-medium uppercase tracking-widest">Admin</span>
            </div>

            <div className="flex items-center gap-3">
                <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full font-medium">
                {items.length} items
                </span>
                <UserButton afterSignOutUrl="/sign-in" />
            </div>
        </header>
   
         <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
   
           {/* Form */}
           <div ref={formRef} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
             <h2 className="text-base font-medium mb-5">
               {editingId ? 'Edit item' : 'Add new item'}
             </h2>
   
             {error && (
               <div className="mb-4 px-4 py-3 bg-red-50 text-red-600 text-sm rounded-lg">
                 {error}
               </div>
             )}
   
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               {/* Name */}
               <div className="sm:col-span-2">
                 <label className="block text-xs text-gray-500 mb-1">Item name *</label>
                 <input
                   className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-orange-400"
                   placeholder="e.g. Classic Burger"
                   value={form.name}
                   onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                 />
               </div>
   
               {/* Description */}
               <div className="sm:col-span-2">
                 <label className="block text-xs text-gray-500 mb-1">Description</label>
                 <input
                   className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-orange-400"
                   placeholder="Short description of the dish"
                   value={form.description}
                   onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                 />
               </div>
   
               {/* Price */}
               <div>
                 <label className="block text-xs text-gray-500 mb-1">Price ($) *</label>
                 <input
                   type="number"
                   step="0.01"
                   className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-orange-400"
                   placeholder="9.99"
                   value={form.price}
                   onChange={e => setForm(p => ({ ...p, price: e.target.value }))}
                 />
               </div>
   
               {/* Calories */}
               <div>
                 <label className="block text-xs text-gray-500 mb-1">Calories</label>
                 <input
                   type="number"
                   className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-orange-400"
                   placeholder="650"
                   value={form.calories}
                   onChange={e => setForm(p => ({ ...p, calories: e.target.value }))}
                 />
               </div>
   
               {/* Ingredients */}
               <div className="sm:col-span-2">
                 <label className="block text-xs text-gray-500 mb-1">
                   Ingredients (comma separated)
                 </label>
                 <input
                   className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-orange-400"
                   placeholder="Beef, Lettuce, Tomato, Cheese"
                   value={form.ingredients}
                   onChange={e => setForm(p => ({ ...p, ingredients: e.target.value }))}
                 />
               </div>
   
               {/* Thumbnail upload */}
               <div className="sm:col-span-2">
                 <label className="block text-xs text-gray-500 mb-1">Thumbnail image</label>
                 <div className="flex items-center gap-3">
                   <input
                     type="file"
                     accept="image/*"
                     className="hidden"
                     id="thumbnail-upload"
                     onChange={e => {
                       const file = e.target.files?.[0]
                       if (file) uploadFile(file, 'thumbnailUrl')
                       e.target.value = ''
                     }}
                   />
                   <label
                     htmlFor="thumbnail-upload"
                     className="px-4 py-2 text-sm border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
                   >
                     {uploading.thumbnailUrl
                       ? `Uploading... ${uploadProgress.thumbnailUrl ?? 0}%`
                       : 'Choose image'}
                   </label>
                   {form.thumbnailUrl && !uploading.thumbnailUrl && (
                     <img
                       src={form.thumbnailUrl}
                       alt="Thumbnail"
                       className="w-10 h-10 rounded-lg object-cover"
                     />
                   )}
                   {!form.thumbnailUrl && !uploading.thumbnailUrl && (
                     <span className="text-xs text-gray-400">No file chosen</span>
                   )}
                 </div>
                 {uploading.thumbnailUrl && (
                   <div className="mt-2 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                     <div
                       className="h-full bg-orange-400 rounded-full transition-all duration-200"
                       style={{ width: `${uploadProgress.thumbnailUrl ?? 0}%` }}
                     />
                   </div>
                 )}
               </div>
   
               {/* GLB upload */}
               <div>
                 <label className="block text-xs text-gray-500 mb-1">GLB model (Android) *</label>
                 <div className="flex items-center gap-3">
                   <input
                     type="file"
                     accept=".glb"
                     className="hidden"
                     id="glb-upload"
                     onChange={e => {
                       const file = e.target.files?.[0]
                       if (file) uploadFile(file, 'glbUrl')
                       e.target.value = ''
                     }}
                   />
                   <label
                     htmlFor="glb-upload"
                     className="px-4 py-2 text-sm border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
                   >
                     {uploading.glbUrl ? `Uploading... ${uploadProgress.glbUrl ?? 0}%` : 'Choose .glb'}
                   </label>
                   {form.glbUrl && !uploading.glbUrl && (
                     <span className="text-xs text-green-600">Uploaded</span>
                   )}
                 </div>
                 {/* Progress bar */}
                 {uploading.glbUrl && (
                   <div className="mt-2 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                     <div
                       className="h-full bg-orange-400 rounded-full transition-all duration-200"
                       style={{ width: `${uploadProgress.glbUrl ?? 0}%` }}
                     />
                   </div>
                 )}
               </div>
   
               {/* USDZ upload */}
               <div>
                 <label className="block text-xs text-gray-500 mb-1">USDZ model (iPhone) *</label>
                 <div className="flex items-center gap-3">
                   <input
                     type="file"
                     accept=".usdz"
                     className="hidden"
                     id="usdz-upload"
                     onChange={e => {
                       const file = e.target.files?.[0]
                       if (file) uploadFile(file, 'usdzUrl')
                       e.target.value = ''
                     }}
                   />
                   <label
                     htmlFor="usdz-upload"
                     className="px-4 py-2 text-sm border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
                   >
                     {uploading.usdzUrl
                       ? `Uploading... ${uploadProgress.usdzUrl ?? 0}%`
                       : 'Choose .usdz'}
                   </label>
                   {form.usdzUrl && !uploading.usdzUrl && (
                     <span className="text-xs text-green-600">Uploaded</span>
                   )}
                 </div>
                 {uploading.usdzUrl && (
                   <div className="mt-2 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                     <div
                       className="h-full bg-orange-400 rounded-full transition-all duration-200"
                       style={{ width: `${uploadProgress.usdzUrl ?? 0}%` }}
                     />
                   </div>
                 )}
               </div>
   
               {/* Status */}
               <div>
                 <label className="block text-xs text-gray-500 mb-1">Status</label>
                 <select
                   className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-orange-400"
                   value={form.status}
                   onChange={e => setForm(p => ({ ...p, status: e.target.value }))}
                 >
                   <option value="active">Active</option>
                   <option value="inactive">Inactive</option>
                 </select>
               </div>
             </div>
   
             {/* Actions */}
             <div className="flex gap-3 mt-6">
               <button
                 onClick={handleSubmit}
                 disabled={loading || Object.values(uploading).some(Boolean)}
                 className="px-5 py-2 bg-orange-500 text-white text-sm rounded-lg hover:bg-orange-600 disabled:opacity-50"
               >
                 {loading ? 'Saving...' : editingId ? 'Update item' : 'Add item'}
               </button>
               {editingId && (
                 <button
                   onClick={resetForm}
                   className="px-5 py-2 border border-gray-200 text-sm rounded-lg hover:bg-gray-50"
                 >
                   Cancel
                 </button>
               )}
             </div>
           </div>
   
           {/* Menu items table */}
           <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
             <div className="px-6 py-4 border-b border-gray-100">
               <h2 className="text-base font-medium">Menu items</h2>
             </div>
   
             {items.length === 0 ? (
               <div className="px-6 py-12 text-center text-sm text-gray-400">
                 No items yet. Add one above.
               </div>
             ) : (
               <table className="w-full text-sm">
                 <thead>
                   <tr className="border-b border-gray-100">
                     <th className="text-left px-6 py-3 text-xs text-gray-400 font-medium">Item</th>
                     <th className="text-left px-6 py-3 text-xs text-gray-400 font-medium">Price</th>
                     <th className="text-left px-6 py-3 text-xs text-gray-400 font-medium">Models</th>
                     <th className="text-left px-6 py-3 text-xs text-gray-400 font-medium">Status</th>
                     <th className="text-left px-6 py-3 text-xs text-gray-400 font-medium">Actions</th>
                   </tr>
                 </thead>
                 <tbody>
                   {items.map(item => (
                     <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50">
                       <td className="px-6 py-4">
                         <div className="flex items-center gap-3">
                           {item.thumbnailUrl ? (
                             <img
                               src={item.thumbnailUrl}
                               alt={item.name}
                               className="w-10 h-10 rounded-lg object-cover"
                             />
                           ) : (
                             <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-300 text-xs">
                               No img
                             </div>
                           )}
                           <div>
                             <p className="font-medium">{item.name}</p>
                             <p className="text-xs text-gray-400">{item.calories} kcal</p>
                           </div>
                         </div>
                       </td>
                       <td className="px-6 py-4">${item.price.toFixed(2)}</td>
                       <td className="px-6 py-4">
                         <div className="flex gap-1">
                           <span className="px-2 py-0.5 bg-green-50 text-green-700 text-xs rounded-full">GLB</span>
                           <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full">USDZ</span>
                         </div>
                       </td>
                       <td className="px-6 py-4">
                         <button
                           onClick={() => toggleStatus(item)}
                           className={`px-2 py-0.5 text-xs rounded-full ${
                             item.status === 'active'
                               ? 'bg-green-50 text-green-700'
                               : 'bg-gray-100 text-gray-500'
                           }`}
                         >
                           {item.status}
                         </button>
                       </td>
                       <td className="px-6 py-4">
                         <div className="flex gap-2">
                           <button
                             onClick={() => handleEdit(item)}
                             className="px-3 py-1 text-xs border border-gray-200 rounded-lg hover:bg-gray-50"
                           >
                             Edit
                           </button>
                           <button
                             onClick={() => handleDelete(item.id)}
                             className="px-3 py-1 text-xs bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
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
           </div>
         </div>
       </div>
  )
}