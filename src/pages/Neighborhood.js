import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip
} from 'recharts';
import { useLang } from '../contexts/LanguageContext';
import AIExplanation from '../components/AIExplanation';

export default function Neighborhood() {
  const { t } = useLang();
  const [query, setQuery] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  async function analyze() {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/.netlify/functions/neighborhood-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      setData(await res.json());
    } catch {}
    setLoading(false);
  }

  const overall = data ? Math.round(
    (data.schools + data.shops + data.transport + data.safety + data.greenSpace) / 5
  ) : 0;

  const scoreClass = overall >= 7 ? 'high' : overall >= 5 ? 'mid' : 'low';

  const radarData = data ? [
    { subject: t.neighborhoodPage.schools,    A: data.schools },
    { subject: t.neighborhoodPage.shops,      A: data.shops },
    { subject: t.neighborhoodPage.transport,  A: data.transport },
    { subject: t.neighborhoodPage.safety,     A: data.safety },
    { subject: t.neighborhoodPage.greenSpace, A: data.greenSpace },
  ] : [];

  return (
    <div className="page">
      <div className="page-header">
        <Link to="/" className="back-link">← Home</Link>
        <h1>{t.neighborhoodPage.title}</h1>
      </div>

      <div className="card">
        <div className="form-group">
          <label>{t.common.postalCode} / {t.common.address}</label>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && analyze()}
            placeholder="bv. 1011AB of Jordaan Amsterdam"
          />
        </div>
        <button className="btn-primary" onClick={analyze} disabled={loading}>
          {loading ? t.common.loading : t.common.analyze}
        </button>
      </div>

      {data && (
        <div className="animate-in">
          <div className="card">
            <h3>🏘️ {data.neighborhood} — Buurtscore</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <span className={`score-pill ${scoreClass}`}>
                {scoreClass === 'high' ? '✅' : scoreClass === 'mid' ? '⚠️' : '❌'} {overall}/10
              </span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{t.neighborhoodPage.overall}</span>
            </div>

            <div className="chart-container">
              <ResponsiveContainer width="100%" height={320}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="var(--border)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12, fill: 'var(--text)' }} />
                  <Radar name="Score" dataKey="A" stroke="#1a1a2e" fill="#1a1a2e" fillOpacity={0.25} />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <div className="metrics-grid">
              {[
                { key: 'schools',   label: t.neighborhoodPage.schools,   icon: '🏫', val: data.schools },
                { key: 'shops',     label: t.neighborhoodPage.shops,     icon: '🛒', val: data.shops },
                { key: 'transport', label: t.neighborhoodPage.transport, icon: '🚌', val: data.transport },
                { key: 'safety',    label: t.neighborhoodPage.safety,    icon: '🛡️', val: data.safety },
                { key: 'green',     label: t.neighborhoodPage.greenSpace, icon: '🌳', val: data.greenSpace },
              ].map(m => (
                <div key={m.key} className="metric">
                  <span className="metric-value">{m.icon} {m.val}</span>
                  <span className="metric-label">{m.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="sources-row">
            <span className="source-badge">🌍 OpenStreetMap</span>
            <span className="source-badge">📊 CBS Wijken</span>
            <span className="source-badge">🛡️ Politie.nl</span>
          </div>

          <div style={{ marginTop: '1.5rem' }}>
            <AIExplanation context="neighborhood" data={data} />
          </div>
        </div>
      )}
    </div>
  );
}
