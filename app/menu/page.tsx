'use client'

import { useState, useEffect, useRef } from 'react'

type MenuItem = {
  id: string
  name: string
  description: string
  price: number
  calories: number
  ingredients: string[]
  thumbnailUrl?: string
  glbUrl: string
  usdzUrl: string
  status: string
}

function isIOS() {
  if (typeof navigator === 'undefined') return false
  return /iPad|iPhone|iPod/.test(navigator.userAgent)
}

function ARSheet({ item, onClose }: { item: MenuItem; onClose: () => void }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    requestAnimationFrame(() => setVisible(true))
    return () => { document.body.style.overflow = '' }
  }, [])

  function handleClose() {
    setVisible(false)
    setTimeout(onClose, 350)
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap');
        .sheet-backdrop {
          transition: opacity 350ms cubic-bezier(0.32, 0, 0.67, 0);
        }
        .sheet-backdrop.visible { opacity: 1; }
        .sheet-backdrop.hidden-state { opacity: 0; }
        .sheet-panel {
          transition: transform 350ms cubic-bezier(0.32, 0, 0.67, 0);
        }
        .sheet-panel.visible { transform: translateY(0); }
        .sheet-panel.hidden-state { transform: translateY(100%); }
      `}</style>

      {/* Backdrop */}
      <div
        onClick={handleClose}
        className={`absolute inset-0 sheet-backdrop ${visible ? 'visible' : 'hidden-state'}`}
        style={{ background: 'rgba(10,9,8,0.65)', backdropFilter: 'blur(4px)' }}
      />

      {/* Sheet panel */}
      <div
        className={`relative z-10 flex flex-col sheet-panel ${visible ? 'visible' : 'hidden-state'}`}
        style={{
          height: '92vh',
          background: '#FAFAF7',
          borderRadius: '24px 24px 0 0',
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-0">
          <div style={{ width: 36, height: 4, borderRadius: 2, background: '#D4CFC8' }} />
        </div>

        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          padding: '16px 24px 14px',
          borderBottom: '1px solid #EEECE7',
        }}>
          <div>
            <h2 style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 26,
              fontWeight: 400,
              color: '#1A1814',
              lineHeight: 1.1,
              margin: 0,
            }}>{item.name}</h2>
            <p style={{ fontSize: 12, color: '#9C9589', marginTop: 4, letterSpacing: '0.04em' }}>
              {item.calories} kcal
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 22,
              fontWeight: 500,
              color: '#C4622D',
            }}>
              ${item.price.toFixed(2)}
            </span>
            <button
              onClick={handleClose}
              style={{
                width: 32, height: 32,
                borderRadius: '50%',
                border: '1px solid #E8E4DD',
                background: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, color: '#9C9589', cursor: 'pointer',
              }}
            >✕</button>
          </div>
        </div>

        {/* model-viewer */}
        <div style={{ flex: 1, position: 'relative', background: '#F4F2ED' }}>
          {/* @ts-ignore */}
          <model-viewer
            src={item.glbUrl}
            ios-src={item.usdzUrl}
            ar
            ar-modes="webxr scene-viewer quick-look"
            camera-controls
            auto-rotate
            shadow-intensity="1.2"
            exposure="0.9"
            alt={item.name}
            style={{ width: '100%', height: '100%' }}
          />
          {/* AR hint */}
          <div style={{
            position: 'absolute', bottom: 16, left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(26,24,20,0.75)',
            backdropFilter: 'blur(8px)',
            color: 'white',
            fontSize: 11,
            letterSpacing: '0.08em',
            padding: '6px 14px',
            borderRadius: 999,
            whiteSpace: 'nowrap',
            textTransform: 'uppercase',
          }}>
            Tap AR to place on your table
          </div>
        </div>

        {/* Details */}
        <div style={{ padding: '16px 24px 32px', borderTop: '1px solid #EEECE7' }}>
          {item.description && (
            <p style={{ fontSize: 13, color: '#6B6560', lineHeight: 1.6, marginBottom: 12 }}>
              {item.description}
            </p>
          )}
          {item.ingredients?.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {item.ingredients.map((ing, i) => (
                <span key={i} style={{
                  padding: '3px 10px',
                  background: '#EEEAE3',
                  color: '#6B6560',
                  fontSize: 11,
                  borderRadius: 999,
                  letterSpacing: '0.03em',
                }}>
                  {ing}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function FoodCard({ item, onSelect, index }: {
  item: MenuItem
  onSelect: () => void
  index: number
}) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onClick={onSelect}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'white',
        borderRadius: 20,
        overflow: 'hidden',
        cursor: 'pointer',
        border: '1px solid #EEECE7',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: hovered
          ? '0 20px 40px rgba(0,0,0,0.10)'
          : '0 1px 3px rgba(0,0,0,0.04)',
        transition: 'transform 300ms cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 300ms ease',
        animationDelay: `${index * 80}ms`,
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {/* Image */}
      <div style={{ aspectRatio: '1', background: '#F4F2ED', position: 'relative', overflow: 'hidden' }}>
        {item.thumbnailUrl ? (
          <img
            src={item.thumbnailUrl}
            alt={item.name}
            style={{
              width: '100%', height: '100%', objectFit: 'cover',
              transform: hovered ? 'scale(1.06)' : 'scale(1)',
              transition: 'transform 500ms cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
          />
        ) : (
          <div style={{
            width: '100%', height: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 40, color: '#D4CFC8',
          }}>
            🍽️
          </div>
        )}

        {/* AR pill */}
        <div style={{
          position: 'absolute', top: 10, right: 10,
          background: 'rgba(26,24,20,0.72)',
          backdropFilter: 'blur(6px)',
          color: 'white',
          fontSize: 10,
          fontWeight: 500,
          letterSpacing: '0.07em',
          textTransform: 'uppercase',
          padding: '4px 10px',
          borderRadius: 999,
          opacity: hovered ? 1 : 0.85,
          transition: 'opacity 200ms ease',
        }}>
          AR
        </div>
      </div>

      {/* Info */}
      <div style={{ padding: '12px 14px 14px' }}>
        <p style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 18,
          fontWeight: 400,
          color: '#1A1814',
          lineHeight: 1.2,
          marginBottom: 6,
        }}>
          {item.name}
        </p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: '#9C9589', letterSpacing: '0.03em' }}>
            {item.calories} kcal
          </span>
          <span style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 17,
            fontWeight: 500,
            color: '#C4622D',
          }}>
            ${item.price.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  )
}

export default function MenuPage() {
  const [items, setItems] = useState<MenuItem[]>([])
  const [selected, setSelected] = useState<MenuItem | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const script = document.createElement('script')
    script.type = 'module'
    script.src = 'https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js'
    document.head.appendChild(script)
    fetchItems()
  }, [])

  async function fetchItems() {
    try {
      const res = await fetch('/api/menu-items?status=active')
      const data = await res.json()
      setItems(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAF7', fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap');
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .food-card {
          animation: fadeUp 400ms cubic-bezier(0.34, 1.56, 0.64, 1) both;
        }
        .shimmer {
          background: linear-gradient(90deg, #F4F2ED 25%, #EEEAE3 50%, #F4F2ED 75%);
          background-size: 200% 100%;
          animation: shimmer 1.4s infinite;
        }
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      {/* Header */}
      <header style={{
        background: 'rgba(250,250,247,0.9)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #EEECE7',
        padding: '18px 20px 14px',
        position: 'sticky', top: 0, zIndex: 10,
      }}>
        <p style={{
          fontSize: 10,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: '#C4622D',
          marginBottom: 2,
          fontWeight: 500,
        }}>
          Interactive Menu
        </p>
        <h1 style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 28,
          fontWeight: 400,
          color: '#1A1814',
          lineHeight: 1,
        }}>
          Our Dishes
        </h1>
        <p style={{ fontSize: 12, color: '#9C9589', marginTop: 4 }}>
          Tap any dish to explore in augmented reality
        </p>
      </header>

      {/* Grid */}
      <div style={{ padding: '20px 16px 40px' }}>
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[...Array(4)].map((_, i) => (
              <div key={i} style={{ background: 'white', borderRadius: 20, overflow: 'hidden', border: '1px solid #EEECE7' }}>
                <div className="shimmer" style={{ aspectRatio: '1' }} />
                <div style={{ padding: '12px 14px 14px' }}>
                  <div className="shimmer" style={{ height: 18, borderRadius: 4, marginBottom: 8 }} />
                  <div className="shimmer" style={{ height: 12, borderRadius: 4, width: '60%' }} />
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div style={{ textAlign: 'center', paddingTop: 80 }}>
            <p style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 22,
              color: '#9C9589',
              fontStyle: 'italic',
            }}>
              No dishes available yet
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {items.map((item, i) => (
              <div key={item.id} className="food-card" style={{ animationDelay: `${i * 80}ms` }}>
                <FoodCard
                  item={item}
                  index={i}
                  onSelect={() => setSelected(item)}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* AR Sheet */}
      {selected && (
        <ARSheet item={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  )
}