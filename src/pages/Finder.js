import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useLang } from '../contexts/LanguageContext';
import AIExplanation from '../components/AIExplanation';

function fmt(n) {
  return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);
}

export default function Finder() {
  const { t } = useLang();
  const [params] = useSearchParams();
  const [query, setQuery] = useState(params.get('q') || '');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (params.get('q')) analyze(params.get('q'));
  }, []);

  async function analyze(q = query) {
    if (!q.trim()) return;
    setLoading(true);
    setError('');
    setData(null);
    try {
      const res = await fetch('/.netlify/functions/fetch-property', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q }),
      });
      const json = await res.json();
      if (json.error) setError(json.error);
      else setData(json);
    } catch {
      setError(t.common.error);
    }
    setLoading(false);
  }

  return (
    <div className="page">
      <div className="page-header">
        <Link to="/" className="back-link">← Home</Link>
        <h1>{t.nav.finder}</h1>
      </div>

      <div className="card">
        <div className="form-group">
          <label>{t.common.postalCode} / Funda URL</label>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && analyze()}
            placeholder="bv. 1011AB of https://funda.nl/..."
          />
        </div>
        <button className="btn-primary" onClick={() => analyze()} disabled={loading}>
          {loading ? <><span className="spinner"></span> &nbsp;{t.common.loading}</> : t.common.analyze}
        </button>
      </div>

      {error && <div style={{ color: 'var(--accent)', padding: '1rem', background: 'var(--accent-pale)', borderRadius: 'var(--radius)' }}>{error}</div>}

      {data && (
        <div className="animate-in">
          <div className="property-card">
            <div className="property-card-header">
              <div className="property-price">{fmt(data.price)}</div>
              <div className="property-address">{data.address}</div>
            </div>
            <div className="property-card-body">
              <div className="metrics-grid">
                <div className="metric">
                  <span className="metric-value">{data.area} m²</span>
                  <span className="metric-label">{t.common.area}</span>
                </div>
                <div className="metric">
                  <span className="metric-value">{fmt(data.pricePerM2)}</span>
                  <span className="metric-label">{t.common.pricePerM2}</span>
                </div>
                <div className="metric">
                  <span className="metric-value">{data.rooms}</span>
                  <span className="metric-label">Kamers</span>
                </div>
                <div className="metric">
                  <span className="metric-value">{data.buildYear}</span>
                  <span className="metric-label">Bouwjaar</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '1.5rem' }}>
                <span className="neighborhood-rating">⭐ {data.neighborhoodRating}/10 buurt</span>
                <span className="source-badge">📍 {data.neighborhood}</span>
              </div>

              <div className="sources-row">
                <span className="source-badge">📊 CBS</span>
                <span className="source-badge">🗺️ BAG/Kadaster</span>
                <span className="source-badge">🏡 Funda</span>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '1.5rem' }}>
            <AIExplanation context="property" data={data} />
          </div>
        </div>
      )}
    </div>
  );
}
