import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '../contexts/LanguageContext';

function fmt(n) {
  return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);
}

function NearbyPage({ mode }) {
  const { t } = useLang();
  const [query, setQuery] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState('price');
  const [sortAsc, setSortAsc] = useState(mode === 'cheapest');

  const endpoint = mode === 'cheapest' ? 'cheapest-nearby' : 'most-expensive-nearby';
  const title = mode === 'cheapest' ? t.nearbyPage.cheapestTitle : t.nearbyPage.expensiveTitle;

  async function analyze() {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/.netlify/functions/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      const json = await res.json();
      setData(json.properties);
    } catch {}
    setLoading(false);
  }

  function toggleSort(col) {
    if (sortBy === col) setSortAsc(a => !a);
    else { setSortBy(col); setSortAsc(mode === 'cheapest'); }
  }

  const sorted = data ? [...data].sort((a, b) => {
    const av = a[sortBy], bv = b[sortBy];
    return sortAsc ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
  }) : [];

  return (
    <div className="page" style={{ maxWidth: '1100px' }}>
      <div className="page-header">
        <Link to="/" className="back-link">← Home</Link>
        <h1>{title}</h1>
      </div>

      <div className="card">
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
            <label>{t.common.postalCode} / Buurt</label>
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && analyze()}
              placeholder="bv. 1011AB of Jordaan"
            />
          </div>
          <button className="btn-primary" onClick={analyze} disabled={loading}>
            {loading ? t.common.loading : t.common.analyze}
          </button>
        </div>
      </div>

      {sorted.length > 0 && (
        <div className="animate-in">
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th onClick={() => toggleSort('address')} style={{ cursor: 'pointer' }}>Adres {sortBy==='address' ? (sortAsc?'↑':'↓') : ''}</th>
                  <th onClick={() => toggleSort('price')} style={{ cursor: 'pointer' }}>{t.common.price} {sortBy==='price' ? (sortAsc?'↑':'↓') : ''}</th>
                  <th onClick={() => toggleSort('area')} style={{ cursor: 'pointer' }}>{t.nearbyPage.sqm} {sortBy==='area' ? (sortAsc?'↑':'↓') : ''}</th>
                  <th onClick={() => toggleSort('pricePerM2')} style={{ cursor: 'pointer' }}>{t.common.pricePerM2} {sortBy==='pricePerM2' ? (sortAsc?'↑':'↓') : ''}</th>
                  <th onClick={() => toggleSort('rooms')} style={{ cursor: 'pointer' }}>Kamers {sortBy==='rooms' ? (sortAsc?'↑':'↓') : ''}</th>
                  <th>{t.nearbyPage.type}</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((p, i) => (
                  <tr key={i}>
                    <td style={{ color: 'var(--text-muted)', fontWeight: 600 }}>#{i + 1}</td>
                    <td style={{ fontWeight: 500 }}>{p.address}</td>
                    <td style={{ fontWeight: 700, color: mode === 'cheapest' ? '#2e7d32' : '#c62828' }}>{fmt(p.price)}</td>
                    <td>{p.area} m²</td>
                    <td>{fmt(p.pricePerM2)}</td>
                    <td>{p.rooms}</td>
                    <td><span className="source-badge">{p.type}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="sources-row">
            <span className="source-badge">🏡 Funda</span>
            <span className="source-badge">🗺️ BAG/Kadaster</span>
          </div>
        </div>
      )}
    </div>
  );
}

export function Cheapest() { return <NearbyPage mode="cheapest" />; }
export function Expensive() { return <NearbyPage mode="expensive" />; }
